from datetime import datetime
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
    require_ticket_not_held,
)
from app.modules.tickets.conversation import CommentCreate, append_comment
from app.modules.tickets.models import Ticket, TicketChangeReason
from app.modules.tickets.read import TicketAccess
from app.modules.tickets.resolution import resume_resolution, stop_resolution
from app.modules.tickets.service import TicketStatus

TRANSITION_EVENTS = {
    (TicketStatus.NEW, TicketStatus.OPEN): "ticket.accepted",
    (TicketStatus.OPEN, TicketStatus.IN_PROGRESS): "ticket.started",
    (TicketStatus.IN_PROGRESS, TicketStatus.PENDING): "ticket.pending",
    (TicketStatus.PENDING, TicketStatus.IN_PROGRESS): "ticket.resumed",
    (TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED): "ticket.resolved",
    (TicketStatus.RESOLVED, TicketStatus.CLOSED): "ticket.closed",
    (TicketStatus.RESOLVED, TicketStatus.IN_PROGRESS): "ticket.reopened",
    (TicketStatus.CLOSED, TicketStatus.IN_PROGRESS): "ticket.reopened",
    (TicketStatus.NEW, TicketStatus.CANCELLED): "ticket.cancelled",
    (TicketStatus.OPEN, TicketStatus.CANCELLED): "ticket.cancelled",
    (TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED): "ticket.cancelled",
    (TicketStatus.PENDING, TicketStatus.CANCELLED): "ticket.cancelled",
}


class TicketTransition(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    expectedVersion: int = Field(ge=1, strict=True)
    target_status: TicketStatus
    reason: str | None = Field(default=None, max_length=10000)
    public_message: str | None = Field(default=None, max_length=10000)


def transition_ticket(
    db: Session, actor: Account, ticket_id: UUID, body: TicketTransition, clock: Clock
) -> CommandResult:
    target = body.target_status
    requester_action = target in (
        TicketStatus.CLOSED,
        TicketStatus.CANCELLED,
        TicketStatus.IN_PROGRESS,
    )
    if actor.role not in (*MANAGEMENT, "TECHNICIAN") and not requester_action:
        raise TicketCommandRejected(403, "FORBIDDEN")

    row = lock_ticket(db, ticket_id)
    own = actor.id == row.requester_id
    internal = TicketAccess.resolve(db, actor).can_view_internal(row)
    if not internal and not (own and requester_action):
        raise TicketCommandRejected(404, "NOT_FOUND")

    require_ticket_not_held(db, row.id)
    check_version(row, body.expectedVersion)
    try:
        source = TicketStatus(row.status)
    except ValueError:
        raise TicketCommandRejected(409, "INVALID_TRANSITION") from None
    event_type = TRANSITION_EVENTS.get((source, target))
    if event_type is None:
        raise TicketCommandRejected(409, "INVALID_TRANSITION")
    check_actor(db, actor, row, source, target, internal=internal, own=own)
    if (
        target == TicketStatus.PENDING
        or (target == TicketStatus.CANCELLED and actor.role in MANAGEMENT)
        or (target == TicketStatus.IN_PROGRESS and source != TicketStatus.OPEN)
    ) and not body.reason:
        raise TicketCommandRejected(422, "REASON_REQUIRED")
    if body.reason and chr(0) in body.reason:
        raise TicketCommandRejected(422, "INVALID_REASON")
    if body.public_message and target not in (
        TicketStatus.PENDING,
        TicketStatus.RESOLVED,
    ):
        raise TicketCommandRejected(422, "UNEXPECTED_PUBLIC_MESSAGE")

    now = read_utc(clock)
    if target in (TicketStatus.PENDING, TicketStatus.RESOLVED):
        try:
            comment = CommentCreate(
                content=body.public_message or "", visibility="PUBLIC"
            )
        except ValidationError:
            error = (
                "QUESTION_REQUIRED"
                if target == TicketStatus.PENDING
                else "SOLUTION_REQUIRED"
            )
            raise TicketCommandRejected(422, error) from None
        append_comment(db, actor, row, comment, now, internal=True)
    if target in (TicketStatus.PENDING, TicketStatus.RESOLVED, TicketStatus.CANCELLED):
        stop_resolution(row, now)
    elif target == TicketStatus.IN_PROGRESS and source != TicketStatus.OPEN:
        resume_resolution(row, now)
    return record_transition(
        db, actor, row, source, target, event_type, body.reason, now
    )


def check_actor(
    db: Session,
    actor: Account,
    row: Ticket,
    source: TicketStatus,
    target: TicketStatus,
    *,
    internal: bool,
    own: bool,
) -> None:
    management = actor.role in MANAGEMENT
    if target == TicketStatus.CLOSED:
        allowed = own
    elif target == TicketStatus.CANCELLED:
        allowed = management or (source == TicketStatus.NEW and own)
    elif target == TicketStatus.OPEN:
        allowed = internal
    elif source == TicketStatus.RESOLVED:
        allowed = management or own
    elif source == TicketStatus.CLOSED:
        allowed = management
    else:
        allowed = internal and (management or row.assignee_id == actor.id)
        if internal and row.assignee_id is None and target == TicketStatus.IN_PROGRESS:
            raise TicketCommandRejected(409, "INELIGIBLE_ASSIGNEE")
    if not allowed:
        raise TicketCommandRejected(403, "FORBIDDEN")
    if target in (
        TicketStatus.IN_PROGRESS,
        TicketStatus.PENDING,
        TicketStatus.RESOLVED,
    ) and (
        row.assignee_id is None
        or row.team_id not in effective_team_ids(db, row.assignee_id)
    ):
        raise TicketCommandRejected(409, "INELIGIBLE_ASSIGNEE")


def record_transition(
    db: Session,
    actor: Account,
    row: Ticket,
    source: TicketStatus,
    target: TicketStatus,
    event_type: str,
    reason: str | None,
    now: datetime,
) -> CommandResult:
    before = SafeFacts(status=source, version=row.version, assignee_id=row.assignee_id)
    row.status = target.value
    row.version += 1
    if reason:
        db.add(TicketChangeReason(ticket_id=row.id, version=row.version, reason=reason))
    after = SafeFacts(
        status=target,
        previous_status=source,
        version=row.version,
        assignee_id=row.assignee_id,
        reason_provided=bool(reason),
    )
    event_actor, event_target = Actor("user", actor.id), Target("ticket", row.id)
    write_audit(
        db,
        actor=event_actor,
        action="ticket.transition",
        target=event_target,
        before=before,
        after=after,
        clock=lambda: now,
    )
    enqueue_event(
        db,
        actor=event_actor,
        target=event_target,
        event_type=event_type,
        schema_version=1,
        aggregate_version=row.version,
        correlation_id=row.id,
        handlers=("ticket.state_notification",),
        facts=after,
        clock=lambda: now,
    )
    return CommandResult(row.id, row.version)
