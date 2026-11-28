from datetime import datetime
from typing import Literal
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.infrastructure.clock import Clock, read_utc
from app.infrastructure.commands import CommandResult
from app.infrastructure.events import Actor, AuditReason, SafeFacts, Target, write_audit
from app.modules.auth.models import Account
from app.modules.organization.containment import (
    WorkAccessHold,
    open_holds,
    work_is_held,
)
from app.modules.organization.team_scope import effective_team_ids
from app.modules.tickets.assignment import (
    TicketAssignment,
    TicketCommandRejected,
    record_assignment,
)
from app.modules.tickets.models import Ticket
from app.modules.work_management.allocation import (
    active_slots,
    lock_allocation_rows,
    record_task_effect,
    replace_slots,
    validate_reservation,
)
from app.modules.work_management.models import PlanVersion, WorkTask
from app.modules.workforce.calendar import Interval

OPEN_TICKETS = ("New", "Open", "In Progress", "Pending")
OPEN_TASKS = ("To Do", "Ready", "In Progress", "Blocked")
type WorkKind = Literal["ticket", "task"]


class HandoverItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    kind: WorkKind
    id: UUID
    expectedVersion: int = Field(ge=1, strict=True)
    replacement_user_id: UUID | None
    protected_work_reviewed: bool = Field(default=False, strict=True)
    allocations: list[Interval] = Field(default_factory=list, max_length=366)


class HandoverCommand(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    expectedVersion: int = Field(ge=1, strict=True)
    reason: str = Field(min_length=10, max_length=1000)
    reason_code: AuditReason | None = None
    handover: list[HandoverItem] = Field(min_length=1)


class HandoverWork(BaseModel):
    id: UUID
    kind: WorkKind
    version: int
    team_id: UUID
    status: str
    requires_replacement: bool
    protected_work: bool
    held: bool


class HandoverView(BaseModel):
    account_id: UUID
    version: int
    suspension_pending: bool
    items: list[HandoverWork]


def affected_work(
    db: Session,
    subject: UUID | None,
    team_id: UUID | None = None,
    *,
    lock: bool = False,
) -> tuple[list[Ticket], list[WorkTask]]:
    tickets = select(Ticket).where(Ticket.status.in_(OPEN_TICKETS))
    tasks = select(WorkTask).where(WorkTask.status.in_(OPEN_TASKS))
    if subject is not None:
        tickets = tickets.where(Ticket.assignee_id == subject)
        tasks = tasks.where(WorkTask.assignee_id == subject)
    if team_id is not None:
        tickets = tickets.where(Ticket.team_id == team_id)
        tasks = tasks.where(WorkTask.team_id == team_id)
    elif subject is None:
        raise ValueError("Work queries require an account or team scope")
    if lock:
        related_plans = tasks.with_only_columns(WorkTask.plan_version_id)
        related_tickets = select(PlanVersion.ticket_id).where(
            PlanVersion.id.in_(related_plans)
        )
        locked = select(Ticket).where(
            Ticket.id.in_(tickets.with_only_columns(Ticket.id))
            | Ticket.id.in_(related_tickets)
        )
        db.scalars(locked.order_by(Ticket.id).with_for_update()).all()
        db.scalars(
            select(PlanVersion)
            .where(PlanVersion.id.in_(related_plans))
            .order_by(PlanVersion.id)
            .with_for_update()
        ).all()
        tasks = tasks.with_for_update()
    return list(db.scalars(tickets.order_by(Ticket.id))), list(
        db.scalars(tasks.order_by(WorkTask.id))
    )


def preview_handover(db: Session, subject: UUID) -> HandoverView:
    account = db.get(Account, subject)
    if account is None:
        raise TicketCommandRejected(404, "NOT_FOUND")
    tickets, tasks = affected_work(db, subject)
    held = {(row.kind, row.work_id) for row in open_holds(db, subject)}
    return HandoverView(
        account_id=subject,
        version=account.version,
        suspension_pending=bool(held),
        items=describe_work(db, tickets, tasks),
    )


class TeamHandoverView(BaseModel):
    team_id: UUID
    version: int
    items: list[HandoverWork]


def describe_work(
    db: Session, tickets: list[Ticket], tasks: list[WorkTask]
) -> list[HandoverWork]:
    ids = {row.id for row in tickets} | {row.id for row in tasks}
    held = {
        (kind, work_id)
        for kind, work_id in db.execute(
            select(WorkAccessHold.kind, WorkAccessHold.work_id).where(
                WorkAccessHold.work_id.in_(ids), WorkAccessHold.released_at.is_(None)
            )
        )
    }
    items = [
        HandoverWork(
            id=row.id,
            kind="ticket",
            version=row.version,
            team_id=row.team_id,
            status=row.status,
            requires_replacement=row.status in ("In Progress", "Pending"),
            protected_work=False,
            held=("ticket", row.id) in held,
        )
        for row in tickets
    ]
    items.extend(
        HandoverWork(
            id=row.id,
            kind="task",
            version=row.version,
            team_id=row.team_id,
            status=row.status,
            requires_replacement=row.status != "To Do" or row.assignment_locked,
            protected_work=row.assignment_locked
            or row.status in ("In Progress", "Blocked"),
            held=("task", row.id) in held,
        )
        for row in tasks
    )
    return items


def apply_handover(
    db: Session,
    actor: Account,
    subject: UUID,
    decisions: list[HandoverItem],
    reason: str,
    now: datetime,
    team_id: UUID | None = None,
    *,
    repair: bool = False,
    reason_code: AuditReason | None = None,
) -> None:
    tickets, tasks = affected_work(db, subject, team_id, lock=True)
    existing_holds = {(row.kind, row.work_id): row for row in open_holds(db, subject)}
    expected = {("ticket", row.id) for row in tickets} | {
        ("task", row.id) for row in tasks
    }
    if repair:
        if not set(existing_holds).issubset(expected):
            raise TicketCommandRejected(409, "STALE_HANDOVER")
        expected = set(existing_holds)
    reviewed = validate_decisions(decisions, expected)
    apply_reviewed_work(
        db,
        actor,
        tickets,
        tasks,
        reviewed,
        reason,
        now,
        subject=subject,
        reason_code=reason_code,
    )
    if repair:
        for hold in existing_holds.values():
            hold.released_at = now


def validate_decisions(
    decisions: list[HandoverItem], expected: set[tuple[str, UUID]]
) -> dict[tuple[str, UUID], HandoverItem]:
    reviewed: dict[tuple[str, UUID], HandoverItem] = {
        (item.kind, item.id): item for item in decisions
    }
    if len(reviewed) != len(decisions) or set(reviewed) != expected:
        raise TicketCommandRejected(409, "HANDOVER_REQUIRED")
    return reviewed


def apply_team_handover(
    db: Session,
    actor: Account,
    source: UUID,
    destination: UUID | None,
    decisions: list[HandoverItem],
    reason: str,
    now: datetime,
    reason_code: AuditReason | None = None,
) -> None:
    tickets, tasks = affected_work(db, None, source, lock=True)
    expected = {("ticket", row.id) for row in tickets} | {
        ("task", row.id) for row in tasks
    }
    if expected and destination is None:
        raise TicketCommandRejected(409, "HANDOVER_REQUIRED")
    if any(work_is_held(db, kind, work_id) for kind, work_id in expected):
        raise TicketCommandRejected(409, "HANDOVER_PENDING")
    reviewed = validate_decisions(decisions, expected)
    apply_reviewed_work(
        db,
        actor,
        tickets,
        tasks,
        reviewed,
        reason,
        now,
        destination=destination,
        reason_code=reason_code,
    )


def apply_reviewed_work(
    db: Session,
    actor: Account,
    tickets: list[Ticket],
    tasks: list[WorkTask],
    reviewed: dict[tuple[str, UUID], HandoverItem],
    reason: str,
    now: datetime,
    *,
    subject: UUID | None = None,
    destination: UUID | None = None,
    reason_code: AuditReason | None = None,
) -> None:
    for row in tickets:
        item = reviewed.get(("ticket", row.id))
        if item is None:
            continue
        team_id = destination or row.team_id
        check_decision(db, subject, team_id, row, item)
        if item.allocations or item.protected_work_reviewed:
            raise TicketCommandRejected(422, "INVALID_HANDOVER")
        if item.replacement_user_id is None and row.status in (
            "In Progress",
            "Pending",
        ):
            raise TicketCommandRejected(409, "REPLACEMENT_REQUIRED")
        record_assignment(
            db,
            actor,
            row,
            TicketAssignment(
                expectedVersion=item.expectedVersion,
                team_id=team_id,
                assignee_id=item.replacement_user_id,
                reason=reason,
                reason_code=reason_code,
            ),
            lambda: now,
        )
    for task in tasks:
        item = reviewed.get(("task", task.id))
        if item is None:
            continue
        team_id = destination or task.team_id
        if destination is not None:
            parent = db.get(PlanVersion, task.plan_version_id)
            ticket = db.get(Ticket, parent.ticket_id) if parent else None
            if ticket is None or ticket.team_id != destination:
                raise TicketCommandRejected(409, "TICKET_HANDOVER_REQUIRED")
        check_decision(db, subject, team_id, task, item)
        handover_task(db, actor, task, item, team_id, now, reason_code)


def handover_task(
    db: Session,
    actor: Account,
    task: WorkTask,
    item: HandoverItem,
    team_id: UUID,
    now: datetime,
    reason_code: AuditReason | None = None,
) -> None:
    if (
        task.assignment_locked or task.status in ("In Progress", "Blocked")
    ) and not item.protected_work_reviewed:
        raise TicketCommandRejected(409, "PROTECTED_WORK_REVIEW_REQUIRED")
    slots = active_slots(db, task)
    old_assignee = task.assignee_id
    before = SafeFacts(
        version=task.version, assignee_id=old_assignee, team_id=task.team_id
    )
    task.team_id = team_id
    new_assignee = item.replacement_user_id
    if new_assignee is None:
        if task.assignment_locked or task.status != "To Do" or item.allocations:
            raise TicketCommandRejected(409, "REPLACEMENT_REQUIRED")
        if slots:
            assert old_assignee is not None
            lock_allocation_rows(db, old_assignee, {}, slots)
        grouped = {}
    else:
        grouped = validate_reservation(
            db, task, new_assignee, item.allocations, task.remaining_minutes, now, slots
        )
    task.version += 1
    task.assignee_id = new_assignee
    reservation_owner = new_assignee or old_assignee
    if reservation_owner is not None:
        replace_slots(db, task, reservation_owner, grouped, slots, now)
    record_task_effect(
        db,
        actor,
        task,
        before,
        now,
        "task.assigned",
        reason=True,
        reason_code=reason_code,
    )


def check_decision(
    db: Session,
    subject: UUID | None,
    team_id: UUID,
    row: Ticket | WorkTask,
    item: HandoverItem,
) -> None:
    if row.version != item.expectedVersion:
        raise TicketCommandRejected(409, "STALE_HANDOVER")
    replacement = item.replacement_user_id
    if replacement is not None and (
        replacement == subject or team_id not in effective_team_ids(db, replacement)
    ):
        raise TicketCommandRejected(409, "INELIGIBLE_REPLACEMENT")


def contain_work(db: Session, subject: UUID, now: datetime) -> None:
    tickets, tasks = affected_work(db, subject, lock=True)
    for kind, rows in (("ticket", tickets), ("task", tasks)):
        for work in rows:
            work.version += 1
            db.add(
                WorkAccessHold(
                    id=uuid4(),
                    account_id=subject,
                    kind=kind,
                    work_id=work.id,
                    created_at=now,
                )
            )


def repair_handover(
    db: Session, actor: Account, subject: UUID, body: HandoverCommand, clock: Clock
) -> CommandResult:
    account = db.get(Account, subject, with_for_update=True)
    if account is None:
        raise TicketCommandRejected(404, "NOT_FOUND")
    if account.active or not open_holds(db, subject):
        raise TicketCommandRejected(409, "NO_PENDING_SUSPENSION")
    if account.version != body.expectedVersion or chr(0) in body.reason:
        raise TicketCommandRejected(409, "STALE_HANDOVER")
    now = read_utc(clock)
    apply_handover(
        db,
        actor,
        subject,
        body.handover,
        body.reason,
        now,
        repair=True,
        reason_code=body.reason_code,
    )
    before = SafeFacts(active=False, version=account.version)
    account.version += 1
    write_audit(
        db,
        actor=Actor("user", actor.id),
        action="account.handover_repair",
        target=Target("account", subject),
        before=before,
        after=SafeFacts(
            active=False,
            version=account.version,
            reason_provided=True,
            reason_code=body.reason_code,
        ),
        clock=lambda: now,
    )
    return CommandResult(subject, account.version)
