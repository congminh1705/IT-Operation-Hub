from datetime import datetime
from typing import Literal
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.infrastructure.clock import Clock, read_utc
from app.infrastructure.commands import CommandResult
from app.infrastructure.events import Actor, SafeFacts, Target, write_audit
from app.modules.auth.models import Account
from app.modules.organization.containment import WorkAccessHold, open_holds
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
    handover: list[HandoverItem] = Field(min_length=1, max_length=100)


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
    db: Session, subject: UUID, team_id: UUID | None = None, *, lock: bool = False
) -> tuple[list[Ticket], list[WorkTask]]:
    tickets = select(Ticket).where(
        Ticket.assignee_id == subject, Ticket.status.in_(OPEN_TICKETS)
    )
    tasks = select(WorkTask).where(
        WorkTask.assignee_id == subject, WorkTask.status.in_(OPEN_TASKS)
    )
    if team_id is not None:
        tickets = tickets.where(Ticket.team_id == team_id)
        tasks = tasks.where(WorkTask.team_id == team_id)
    tickets = tickets.order_by(Ticket.id)
    tasks = tasks.order_by(WorkTask.id)
    if lock:
        related_plans = select(WorkTask.plan_version_id).where(
            WorkTask.assignee_id == subject, WorkTask.status.in_(OPEN_TASKS)
        )
        related_tickets = select(PlanVersion.ticket_id).where(
            PlanVersion.id.in_(related_plans)
        )
        locked_tickets = select(Ticket).where(
            Ticket.id.in_(tickets.with_only_columns(Ticket.id))
            | Ticket.id.in_(related_tickets)
        )
        db.scalars(locked_tickets.order_by(Ticket.id).with_for_update()).all()
        db.scalars(
            select(PlanVersion)
            .where(PlanVersion.id.in_(related_plans))
            .order_by(PlanVersion.id)
            .with_for_update()
        ).all()
        tasks = tasks.with_for_update()
    return list(db.scalars(tickets)), list(db.scalars(tasks))


def preview_handover(db: Session, subject: UUID) -> HandoverView:
    account = db.get(Account, subject)
    if account is None:
        raise TicketCommandRejected(404, "NOT_FOUND")
    tickets, tasks = affected_work(db, subject)
    held = {(row.kind, row.work_id) for row in open_holds(db, subject)}
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
    return HandoverView(
        account_id=subject,
        version=account.version,
        suspension_pending=bool(held),
        items=items,
    )


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
    reviewed = {(item.kind, item.id): item for item in decisions}
    if len(reviewed) != len(decisions) or set(reviewed) != expected:
        raise TicketCommandRejected(409, "HANDOVER_REQUIRED")
    for row in tickets:
        item = reviewed.get(("ticket", row.id))
        if item is None:
            continue
        check_decision(db, subject, row, item)
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
                team_id=row.team_id,
                assignee_id=item.replacement_user_id,
                reason=reason,
            ),
            lambda: now,
        )
    for task in tasks:
        item = reviewed.get(("task", task.id))
        if item is None:
            continue
        check_decision(db, subject, task, item)
        if (
            task.assignment_locked or task.status in ("In Progress", "Blocked")
        ) and not item.protected_work_reviewed:
            raise TicketCommandRejected(409, "PROTECTED_WORK_REVIEW_REQUIRED")
        slots = active_slots(db, task)
        new_assignee = item.replacement_user_id
        if new_assignee is None:
            if task.assignment_locked or task.status != "To Do" or item.allocations:
                raise TicketCommandRejected(409, "REPLACEMENT_REQUIRED")
            grouped = {}
            lock_allocation_rows(db, subject, {}, slots)
        else:
            grouped = validate_reservation(
                db,
                task,
                new_assignee,
                item.allocations,
                task.remaining_minutes,
                now,
                slots,
            )
        before = SafeFacts(version=task.version, assignee_id=task.assignee_id)
        task.version += 1
        task.assignee_id = new_assignee
        replace_slots(db, task, new_assignee or subject, grouped, slots, now)
        record_task_effect(db, actor, task, before, now, "task.assigned", reason=True)
    if repair:
        for hold in existing_holds.values():
            hold.released_at = now


def check_decision(
    db: Session, subject: UUID, row: Ticket | WorkTask, item: HandoverItem
) -> None:
    if row.version != item.expectedVersion:
        raise TicketCommandRejected(409, "STALE_HANDOVER")
    replacement = item.replacement_user_id
    if replacement is not None and (
        replacement == subject or row.team_id not in effective_team_ids(db, replacement)
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
    apply_handover(db, actor, subject, body.handover, body.reason, now, repair=True)
    before = SafeFacts(active=False, version=account.version)
    account.version += 1
    write_audit(
        db,
        actor=Actor("user", actor.id),
        action="account.handover_repair",
        target=Target("account", subject),
        before=before,
        after=SafeFacts(active=False, version=account.version, reason_provided=True),
        clock=lambda: now,
    )
    return CommandResult(subject, account.version)
