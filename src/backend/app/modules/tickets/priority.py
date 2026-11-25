from datetime import datetime
from typing import cast
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field
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
from app.modules.sla.policy import Priority, PriorityBudgets
from app.modules.tickets.assignment import (
    MANAGEMENT,
    TicketCommandRejected,
    check_version,
    lock_ticket,
)
from app.modules.tickets.models import Ticket, TicketPriorityAdjustment, TicketSLABreach


class PriorityCommand(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    expectedVersion: int = Field(ge=1, strict=True)
    priority: Priority
    reason: str = Field(min_length=10, max_length=10000)


def observe_breaches(
    db: Session,
    ticket_id: UUID,
    revision: int,
    priority: Priority,
    budgets: PriorityBudgets,
    response: int | None,
    resolution: int,
    now: datetime,
) -> None:
    budget = budgets.for_priority(priority)
    clocks = (
        ("response", response, budget.response_seconds),
        ("resolution", resolution, budget.resolution_seconds),
    )
    for name, elapsed, limit in clocks:
        if (
            elapsed is None
            or elapsed < limit
            or db.get(TicketSLABreach, (ticket_id, revision, name)) is not None
        ):
            continue
        db.add(
            TicketSLABreach(
                ticket_id=ticket_id,
                adjustment_revision=revision,
                clock_type=name,
                priority=priority,
                elapsed_seconds=elapsed,
                budget_seconds=limit,
                detected_at=now,
            )
        )


def change_priority(
    db: Session,
    actor: Account,
    ticket_id: UUID,
    body: PriorityCommand,
    clock: Clock,
) -> CommandResult:
    if actor.role not in MANAGEMENT:
        raise TicketCommandRejected(403, "FORBIDDEN")
    row = lock_ticket(db, ticket_id)
    check_version(row, body.expectedVersion)
    if row.status in ("Closed", "Cancelled"):
        raise TicketCommandRejected(409, "TICKET_READ_ONLY")
    if body.priority == row.priority or chr(0) in body.reason:
        raise TicketCommandRejected(422, "INVALID_PRIORITY_CHANGE")

    now = read_utc(clock)
    response = response_elapsed(row, now)
    resolution = row.resolution_used_seconds
    if not row.resolution_paused:
        resolution += max(0, int((now - row.resolution_started_at).total_seconds()))
    budgets = PriorityBudgets.model_validate(row.sla_snapshot)
    old = cast(Priority, row.priority)
    before = SafeFacts(version=row.version, priority=old)
    observe_breaches(
        db, row.id, row.adjustment_revision, old, budgets, response, resolution, now
    )

    row.priority = body.priority
    row.version += 1
    row.adjustment_revision += 1
    db.add(
        TicketPriorityAdjustment(
            ticket_id=row.id,
            revision=row.adjustment_revision,
            ticket_version=row.version,
            previous_priority=old,
            priority=body.priority,
            reason=body.reason,
            response_elapsed_seconds=response,
            resolution_elapsed_seconds=resolution,
            occurred_at=now,
        )
    )
    observe_breaches(
        db,
        row.id,
        row.adjustment_revision,
        body.priority,
        budgets,
        response,
        resolution,
        now,
    )
    after = SafeFacts(
        version=row.version,
        priority=body.priority,
        previous_priority=old,
        reason_provided=True,
    )
    source, target = Actor("user", actor.id), Target("ticket", row.id)
    write_audit(
        db,
        actor=source,
        action="ticket.priority_change",
        target=target,
        before=before,
        after=after,
        clock=lambda: now,
    )
    enqueue_event(
        db,
        actor=source,
        target=target,
        event_type="ticket.priority_changed",
        schema_version=1,
        aggregate_version=row.version,
        correlation_id=row.id,
        handlers=("ticket.priority_notification",),
        facts=after,
        clock=lambda: now,
    )
    return CommandResult(row.id, row.version)


def response_elapsed(row: Ticket, now: datetime) -> int | None:
    end = row.first_response_at
    if end is None and row.status == "Resolved":
        return None
    return max(0, int(((end or now) - row.created_at).total_seconds()))
