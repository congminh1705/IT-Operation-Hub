from uuid import UUID

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
from app.modules.organization.models import Team
from app.modules.organization.team_scope import (
    effective_team_ids,
    lock_team_configuration,
)
from app.modules.tickets.models import Ticket, TicketChangeReason

MANAGEMENT = ("IT_MANAGER", "ADMIN")


class TicketCommandRejected(Exception):
    def __init__(self, status: int, code: str) -> None:
        self.status = status
        self.code = code
        super().__init__(code)


class TicketAssignment(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    expectedVersion: int = Field(ge=1, strict=True)
    team_id: UUID
    assignee_id: UUID | None = None
    reason: str | None = Field(default=None, min_length=10, max_length=10000)


def lock_ticket(db: Session, ticket_id: UUID) -> Ticket:
    lock_team_configuration(db)
    row = db.scalar(select(Ticket).where(Ticket.id == ticket_id).with_for_update())
    if row is None:
        raise TicketCommandRejected(404, "NOT_FOUND")
    return row


def check_version(row: Ticket, expected_version: int) -> None:
    if row.version != expected_version:
        raise TicketCommandRejected(409, "STALE_VERSION")


def assign_ticket(
    db: Session, actor: Account, ticket_id: UUID, body: TicketAssignment, clock: Clock
) -> CommandResult:
    if actor.role not in (*MANAGEMENT, "TECHNICIAN"):
        raise TicketCommandRejected(403, "FORBIDDEN")
    row = lock_ticket(db, ticket_id)
    if actor.role == "TECHNICIAN":
        if row.team_id not in effective_team_ids(db, actor.id):
            raise TicketCommandRejected(404, "NOT_FOUND")
        if body.team_id != row.team_id or body.assignee_id != actor.id:
            raise TicketCommandRejected(403, "FORBIDDEN")
        check_version(row, body.expectedVersion)
        if row.status not in ("New", "Open") or row.assignee_id is not None:
            raise TicketCommandRejected(409, "CLAIM_UNAVAILABLE")
        return record_assignment(db, actor, row, body, clock)
    if body.reason is None:
        raise TicketCommandRejected(422, "REASON_REQUIRED")
    check_version(row, body.expectedVersion)
    if row.status == "Cancelled" or (
        row.status == "Closed"
        and (
            not body.assignee_id
            or body.team_id != row.team_id
            or (
                row.assignee_id
                and row.team_id in effective_team_ids(db, row.assignee_id)
            )
        )
    ):
        raise TicketCommandRejected(409, "TICKET_READ_ONLY")
    destination = db.get(Team, body.team_id)
    if destination is None or not destination.active:
        raise TicketCommandRejected(409, "INELIGIBLE_TEAM")
    if body.assignee_id is None:
        if row.status in ("In Progress", "Pending"):
            raise TicketCommandRejected(409, "ASSIGNEE_REQUIRED")
    elif body.team_id not in effective_team_ids(db, body.assignee_id):
        raise TicketCommandRejected(409, "INELIGIBLE_ASSIGNEE")
    return record_assignment(db, actor, row, body, clock)


def record_assignment(
    db: Session,
    actor: Account,
    row: Ticket,
    body: TicketAssignment,
    clock: Clock,
) -> CommandResult:
    previous = SafeFacts(
        version=row.version, team_id=row.team_id, assignee_id=row.assignee_id
    )
    row.team_id, row.assignee_id = body.team_id, body.assignee_id
    row.version += 1
    if body.reason:
        db.add(
            TicketChangeReason(
                ticket_id=row.id, version=row.version, reason=body.reason
            )
        )
    current = SafeFacts(
        version=row.version,
        team_id=row.team_id,
        assignee_id=row.assignee_id,
        previous_team_id=previous.team_id,
        previous_assignee_id=previous.assignee_id,
        reason_provided=body.reason is not None,
    )
    now = read_utc(clock)
    event_actor, target = Actor("user", actor.id), Target("ticket", row.id)
    write_audit(
        db,
        actor=event_actor,
        action="ticket.assign",
        target=target,
        before=previous,
        after=current,
        clock=lambda: now,
    )
    enqueue_event(
        db,
        actor=event_actor,
        target=target,
        event_type="ticket.assigned",
        schema_version=1,
        aggregate_version=row.version,
        correlation_id=row.id,
        handlers=("ticket.assignment_notification",),
        facts=current,
        clock=lambda: now,
    )
    return CommandResult(row.id, row.version)
