from collections import defaultdict
from datetime import date, datetime, timedelta
from enum import StrEnum
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.infrastructure.clock import Clock, read_utc
from app.infrastructure.commands import CommandResult
from app.infrastructure.events import (
    Actor,
    SafeFacts,
    Target,
    enqueue_event,
    write_audit,
)
from app.modules.auth.models import Account
from app.modules.organization.containment import work_is_held
from app.modules.organization.team_scope import effective_team_ids
from app.modules.tickets.assignment import (
    MANAGEMENT,
    TicketCommandRejected,
    lock_ticket,
)
from app.modules.work_management.models import PlanVersion, TaskAllocation, WorkTask
from app.modules.work_management.service import task_query
from app.modules.workforce.availability import lock_capacity_periods
from app.modules.workforce.calendar import (
    BUSINESS_ZONE,
    Interval,
    day_bounds,
    period_availability,
)
from app.modules.workforce.models import WorkforceSkills
from app.modules.workforce.skills import missing_task_skills

TERMINAL = ("Done", "Cancelled")


class VersionedTaskCommand(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    expectedVersion: int = Field(ge=1, strict=True)


class TaskAssignment(VersionedTaskCommand):
    assignee_id: UUID
    team_id: UUID
    reason: str = Field(min_length=10, max_length=10000)
    allocations: list[Interval] = Field(max_length=366)


class LockCommand(VersionedTaskCommand):
    locked: bool = Field(strict=True)
    reason: str = Field(min_length=10, max_length=10000)


class TaskProgress(VersionedTaskCommand):
    remaining_minutes: int = Field(ge=0, le=2_147_483_647, strict=True)
    result: str | None = Field(default=None, max_length=10000)
    allocations: list[Interval] | None = Field(default=None, max_length=366)


def lock_work_task(
    db: Session, actor: Account, task_id: UUID, expected: int
) -> tuple[WorkTask, PlanVersion]:
    found = db.scalar(task_query(db, actor).where(WorkTask.id == task_id))
    if found is None:
        raise TicketCommandRejected(404, "NOT_FOUND")
    parent = db.get(PlanVersion, found.plan_version_id)
    assert parent is not None
    ticket = lock_ticket(db, parent.ticket_id)
    plan = db.get(PlanVersion, parent.id, with_for_update=True, populate_existing=True)
    task = db.get(WorkTask, task_id, with_for_update=True, populate_existing=True)
    if task is None or plan is None:
        raise TicketCommandRejected(404, "NOT_FOUND")
    if actor.role not in MANAGEMENT and (
        task.team_id != ticket.team_id
        or ticket.team_id not in effective_team_ids(db, actor.id)
    ):
        raise TicketCommandRejected(404, "NOT_FOUND")
    if task.team_id != ticket.team_id:
        raise TicketCommandRejected(409, "TEAM_HANDOVER_REQUIRED")
    if work_is_held(db, "task", task.id):
        raise TicketCommandRejected(409, "HANDOVER_PENDING")
    if task.version != expected:
        raise TicketCommandRejected(409, "STALE_VERSION")
    if plan.state in ("Superseded", "Cancelled") or ticket.status in (
        "Closed",
        "Cancelled",
    ):
        raise TicketCommandRejected(409, "TASK_READ_ONLY")
    return task, plan


def allowed_performer(actor: Account, task: WorkTask) -> None:
    if actor.role not in MANAGEMENT and actor.id != task.assignee_id:
        raise TicketCommandRejected(403, "FORBIDDEN")


def minutes(slot: Interval | TaskAllocation) -> int:
    return int((slot.ends_at - slot.starts_at).total_seconds()) // 60


def active_slots(db: Session, task: WorkTask) -> list[TaskAllocation]:
    return list(
        db.scalars(
            select(TaskAllocation)
            .where(
                TaskAllocation.task_id == task.id, TaskAllocation.released_at.is_(None)
            )
            .order_by(TaskAllocation.starts_at, TaskAllocation.id)
        )
    )


def grouped_days(slots: list[Interval], task: WorkTask) -> dict[date, list[Interval]]:
    grouped: dict[date, list[Interval]] = defaultdict(list)
    last: Interval | None = None
    for slot in sorted(slots, key=lambda item: item.starts_at):
        day = slot.starts_at.astimezone(BUSINESS_ZONE).date()
        if day in (date.min, date.max):
            raise TicketCommandRejected(422, "INVALID_ALLOCATION_WINDOW")
        _, end = day_bounds(day)
        if (
            slot.starts_at < task.starts_at
            or slot.ends_at > min(task.ends_at, end)
            or (last is not None and last.ends_at > slot.starts_at)
        ):
            raise TicketCommandRejected(422, "INVALID_ALLOCATION_WINDOW")
        grouped[day].append(slot)
        last = slot
    return grouped


def lock_allocation_rows(
    db: Session,
    account_id: UUID,
    grouped: dict[date, list[Interval]],
    existing: list[TaskAllocation],
) -> WorkforceSkills:
    affected: dict[UUID, set[date]] = {account_id: set(grouped)}
    for row in existing:
        affected.setdefault(row.account_id, set()).add(row.local_date)
    locked = {
        row.account_id: row
        for row in db.scalars(
            select(WorkforceSkills)
            .where(WorkforceSkills.account_id.in_(affected))
            .order_by(WorkforceSkills.account_id)
            .with_for_update()
        )
    }
    aggregate = locked.get(account_id)
    if aggregate is None:
        raise TicketCommandRejected(409, "UNKNOWN_CAPACITY")
    for person, days in sorted(affected.items()):
        if days:
            lock_capacity_periods(db, person, days)
    return aggregate


def validate_reservation(
    db: Session,
    task: WorkTask,
    assignee_id: UUID,
    slots: list[Interval],
    remaining: int,
    now: datetime,
    existing: list[TaskAllocation],
) -> dict[date, list[Interval]]:
    if sum(map(minutes, slots)) != remaining:
        raise TicketCommandRejected(422, "INCOMPLETE_ALLOCATION")
    grouped = grouped_days(slots, task)
    aggregate = lock_allocation_rows(db, assignee_id, grouped, existing)
    if task.team_id not in effective_team_ids(db, assignee_id):
        raise TicketCommandRejected(409, "INELIGIBLE_ASSIGNEE")
    if missing_task_skills(db, task.id, assignee_id, now):
        raise TicketCommandRejected(409, "MISSING_VERIFIED_SKILLS")
    for day, proposed in grouped.items():
        view = period_availability(db, assignee_id, aggregate.version, day, day)[0]
        if view.capacity_minutes is None:
            raise TicketCommandRejected(409, "UNKNOWN_CAPACITY")
        occupied = list(
            db.scalars(
                select(TaskAllocation)
                .join(WorkTask)
                .where(
                    TaskAllocation.account_id == assignee_id,
                    TaskAllocation.local_date == day,
                    TaskAllocation.task_id != task.id,
                    TaskAllocation.released_at.is_(None),
                    WorkTask.status.not_in(TERMINAL),
                )
            )
        )
        if (
            sum(map(minutes, proposed)) + sum(map(minutes, occupied))
            > view.capacity_minutes
        ):
            raise TicketCommandRejected(409, "INSUFFICIENT_CAPACITY")
        for slot in proposed:
            if not any(
                window.starts_at <= slot.starts_at and slot.ends_at <= window.ends_at
                for window in view.slots
            ):
                raise TicketCommandRejected(409, "SLOT_UNAVAILABLE")
            if any(
                row.starts_at < slot.ends_at and slot.starts_at < row.ends_at
                for row in occupied
            ):
                raise TicketCommandRejected(409, "SLOT_UNAVAILABLE")
    return grouped


def replace_slots(
    db: Session,
    task: WorkTask,
    assignee_id: UUID,
    grouped: dict[date, list[Interval]],
    existing: list[TaskAllocation],
    now: datetime,
) -> None:
    for row in existing:
        row.released_at = now
    db.add_all(
        TaskAllocation(
            id=uuid4(),
            task_id=task.id,
            account_id=assignee_id,
            local_date=day,
            starts_at=slot.starts_at,
            ends_at=slot.ends_at,
            task_version=task.version,
        )
        for day, slots in grouped.items()
        for slot in slots
    )


def record_task_effect(
    db: Session,
    actor: Account,
    task: WorkTask,
    before: SafeFacts,
    now: datetime,
    action: str,
    *,
    reason: bool = False,
    status: StrEnum | None = None,
) -> None:
    source, target = Actor("user", actor.id), Target("work_task", task.id)
    after = SafeFacts(
        version=task.version,
        assignee_id=task.assignee_id,
        reason_provided=reason,
        status=status,
        previous_status=before.status,
    )
    write_audit(
        db,
        actor=source,
        action=action,
        target=target,
        before=before,
        after=after,
        clock=lambda: now,
    )
    enqueue_event(
        db,
        actor=source,
        target=target,
        event_type=action,
        schema_version=1,
        aggregate_version=task.version,
        correlation_id=task.id,
        handlers=("work_management.affected_work",),
        facts=after,
        clock=lambda: now,
    )


def assign_task(
    db: Session, actor: Account, task_id: UUID, body: TaskAssignment, clock: Clock
) -> CommandResult:
    if actor.role not in MANAGEMENT:
        raise TicketCommandRejected(403, "FORBIDDEN")
    task, _ = lock_work_task(db, actor, task_id, body.expectedVersion)
    if task.assignment_locked or task.status not in ("To Do", "Ready"):
        raise TicketCommandRejected(409, "ASSIGNMENT_UNAVAILABLE")
    if body.team_id != task.team_id or chr(0) in body.reason:
        raise TicketCommandRejected(422, "INVALID_ASSIGNMENT")
    now = read_utc(clock)
    existing = active_slots(db, task)
    grouped = validate_reservation(
        db,
        task,
        body.assignee_id,
        body.allocations,
        task.remaining_minutes,
        now,
        existing,
    )
    before = SafeFacts(version=task.version, assignee_id=task.assignee_id)
    task.assignee_id = body.assignee_id
    task.version += 1
    replace_slots(db, task, body.assignee_id, grouped, existing, now)
    record_task_effect(db, actor, task, before, now, "task.assigned", reason=True)
    return CommandResult(task.id, task.version)


def set_assignment_lock(
    db: Session, actor: Account, task_id: UUID, body: LockCommand, clock: Clock
) -> CommandResult:
    if actor.role not in MANAGEMENT:
        raise TicketCommandRejected(403, "FORBIDDEN")
    task, _ = lock_work_task(db, actor, task_id, body.expectedVersion)
    if task.status in TERMINAL or task.assignee_id is None:
        raise TicketCommandRejected(409, "ASSIGNMENT_UNAVAILABLE")
    if task.assignment_locked == body.locked or chr(0) in body.reason:
        raise TicketCommandRejected(422, "INVALID_ASSIGNMENT_LOCK")
    before = SafeFacts(
        version=task.version,
        assignee_id=task.assignee_id,
        active=task.assignment_locked,
    )
    task.assignment_locked = body.locked
    task.version += 1
    record_task_effect(
        db,
        actor,
        task,
        before,
        read_utc(clock),
        "task.assignment_lock_changed",
        reason=True,
    )
    return CommandResult(task.id, task.version)


def trim_slots(existing: list[TaskAllocation], remaining: int) -> list[Interval]:
    slots: list[Interval] = []
    for row in existing:
        if remaining == 0:
            break
        used = min(remaining, minutes(row))
        slots.append(
            Interval(
                starts_at=row.starts_at, ends_at=row.starts_at + timedelta(minutes=used)
            )
        )
        remaining -= used
    if remaining:
        raise TicketCommandRejected(409, "ALLOCATION_REQUIRED")
    return slots


def update_task_progress(
    db: Session, actor: Account, task_id: UUID, body: TaskProgress, clock: Clock
) -> CommandResult:
    task, _ = lock_work_task(db, actor, task_id, body.expectedVersion)
    allowed_performer(actor, task)
    if task.status not in ("In Progress", "Blocked") or task.assignee_id is None:
        raise TicketCommandRejected(409, "TASK_PROGRESS_UNAVAILABLE")
    if body.result is not None and (not body.result or chr(0) in body.result):
        raise TicketCommandRejected(422, "INVALID_RESULT")
    now = read_utc(clock)
    existing = active_slots(db, task)
    grouped: dict[date, list[Interval]] | None = None
    if body.allocations is not None:
        grouped = validate_reservation(
            db,
            task,
            task.assignee_id,
            body.allocations,
            body.remaining_minutes,
            now,
            existing,
        )
    elif body.remaining_minutes > task.remaining_minutes:
        raise TicketCommandRejected(409, "ALLOCATION_REQUIRED")
    elif body.remaining_minutes < task.remaining_minutes:
        grouped = grouped_days(trim_slots(existing, body.remaining_minutes), task)
        lock_allocation_rows(db, task.assignee_id, grouped, existing)
    before = SafeFacts(version=task.version, assignee_id=task.assignee_id)
    task.version += 1
    task.remaining_minutes = body.remaining_minutes
    if body.result is not None:
        task.result = body.result
    if grouped is not None:
        replace_slots(db, task, task.assignee_id, grouped, existing, now)
    record_task_effect(db, actor, task, before, now, "task.progressed")
    return CommandResult(task.id, task.version)
