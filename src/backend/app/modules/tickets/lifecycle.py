from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, ValidationError
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
from app.modules.organization.team_scope import effective_team_ids
from app.modules.tickets.assignment import (
    MANAGEMENT,
    TicketCommandRejected,
    check_version,
    lock_ticket,
)
from app.modules.tickets.conversation import CommentCreate, append_comment
from app.modules.tickets.resolution import resume_resolution, stop_resolution
from app.modules.tickets.service import TicketStatus


class TicketTransition(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    expectedVersion: int = Field(ge=1, strict=True)
    target_status: Literal[
        TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.PENDING
    ]
    reason: str | None = Field(default=None, max_length=10000)
    public_message: str | None = Field(default=None, max_length=10000)


def transition_ticket(
    db: Session,
    actor: Account,
    ticket_id: UUID,
    body: TicketTransition,
    clock: Clock,
) -> CommandResult:
    if actor.role not in (*MANAGEMENT, "TECHNICIAN"):
        raise TicketCommandRejected(403, "FORBIDDEN")
    row = lock_ticket(db, ticket_id)
    if actor.role == "TECHNICIAN" and row.team_id not in effective_team_ids(
        db, actor.id
    ):
        raise TicketCommandRejected(404, "NOT_FOUND")
    check_version(row, body.expectedVersion)
    target = body.target_status
    expected = (
        TicketStatus(row.status)
        if row.status
        in (
            TicketStatus.NEW,
            TicketStatus.OPEN,
            TicketStatus.IN_PROGRESS,
            TicketStatus.PENDING,
        )
        else None
    )
    if (expected, target) not in {
        (TicketStatus.NEW, TicketStatus.OPEN),
        (TicketStatus.OPEN, TicketStatus.IN_PROGRESS),
        (TicketStatus.IN_PROGRESS, TicketStatus.PENDING),
        (TicketStatus.PENDING, TicketStatus.IN_PROGRESS),
    }:
        raise TicketCommandRejected(409, "INVALID_TRANSITION")
    if target != TicketStatus.OPEN:
        if row.assignee_id is None or row.team_id not in effective_team_ids(
            db, row.assignee_id
        ):
            raise TicketCommandRejected(409, "INELIGIBLE_ASSIGNEE")
        if actor.role == "TECHNICIAN" and row.assignee_id != actor.id:
            raise TicketCommandRejected(403, "FORBIDDEN")
    assert expected is not None
    previous = SafeFacts(
        status=expected, version=row.version, assignee_id=row.assignee_id
    )
    now = read_utc(clock)
    if target == TicketStatus.PENDING:
        if not body.reason:
            raise TicketCommandRejected(422, "REASON_REQUIRED")
        try:
            question = CommentCreate(
                content=body.public_message or "", visibility="PUBLIC"
            )
        except ValidationError:
            raise TicketCommandRejected(422, "QUESTION_REQUIRED") from None
        append_comment(db, actor, row, question, now, internal=True)
        stop_resolution(row, now)
    elif expected == TicketStatus.PENDING:
        if not body.reason:
            raise TicketCommandRejected(422, "REASON_REQUIRED")
        resume_resolution(row, now)
    row.status = target.value
    row.version += 1
    current = SafeFacts(status=target, version=row.version, assignee_id=row.assignee_id)
    event_actor, event_target = Actor("user", actor.id), Target("ticket", row.id)
    write_audit(
        db,
        actor=event_actor,
        action="ticket.transition",
        target=event_target,
        before=previous,
        after=current,
        clock=lambda: now,
    )
    enqueue_event(
        db,
        actor=event_actor,
        target=event_target,
        event_type={
            (TicketStatus.NEW, TicketStatus.OPEN): "ticket.accepted",
            (TicketStatus.OPEN, TicketStatus.IN_PROGRESS): "ticket.started",
            (TicketStatus.IN_PROGRESS, TicketStatus.PENDING): "ticket.pending",
            (TicketStatus.PENDING, TicketStatus.IN_PROGRESS): "ticket.resumed",
        }[expected, target],
        schema_version=1,
        aggregate_version=row.version,
        correlation_id=row.id,
        handlers=("ticket.state_notification",),
        facts=current,
        clock=lambda: now,
    )
    return CommandResult(row.id, row.version)
