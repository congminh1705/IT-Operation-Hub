from datetime import datetime
from enum import StrEnum
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict
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
from app.modules.tickets.intake import TicketCreate, derive_intake, next_ticket_code
from app.modules.tickets.models import Ticket


class TicketStatus(StrEnum):
    NEW = "New"
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    PENDING = "Pending"


class SLAView(BaseModel):
    response_used_seconds: int
    resolution_used_seconds: int
    resolution_paused: bool
    first_response_at: datetime | None
    adjustment_revision: int


class TicketPublic(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    code: str
    title: str
    description: str
    status: str
    priority: str
    requester_id: UUID
    team_id: UUID
    version: int
    sla: SLAView


def public_ticket(ticket: Ticket) -> TicketPublic:
    return TicketPublic(
        id=ticket.id,
        code=ticket.code,
        title=ticket.title,
        description=ticket.description,
        status=ticket.status,
        priority=ticket.priority,
        requester_id=ticket.requester_id,
        team_id=ticket.team_id,
        version=ticket.version,
        sla=SLAView(
            response_used_seconds=ticket.response_used_seconds,
            resolution_used_seconds=ticket.resolution_used_seconds,
            resolution_paused=ticket.resolution_paused,
            first_response_at=ticket.first_response_at,
            adjustment_revision=ticket.adjustment_revision,
        ),
    )


def create_text_ticket(
    db: Session, actor: Actor, body: TicketCreate, clock: Clock
) -> CommandResult:
    facts = derive_intake(db, actor.id, body)
    now, identifier = read_utc(clock), uuid4()
    row = Ticket(
        id=identifier,
        code=next_ticket_code(db),
        requester_id=facts.requester_id,
        team_id=facts.team_id,
        category_id=facts.category_id,
        title=body.title,
        description=body.description,
        type=body.type,
        impact=body.impact,
        urgency=body.urgency,
        priority=facts.priority,
        status=TicketStatus.NEW.value,
        version=1,
        created_at=now,
        first_response_at=None,
        resolution_started_at=now,
        response_used_seconds=0,
        resolution_used_seconds=0,
        resolution_paused=False,
        adjustment_revision=0,
        sla_policy_version=facts.sla_policy.version,
        sla_snapshot=facts.sla_policy.priority_budgets.model_dump(),
        workflow_context=body.workflow_context.model_dump(
            mode="json", exclude_none=True
        )
        if body.workflow_context is not None
        else None,
    )
    db.add(row)
    target = Target("ticket", identifier)
    audit = SafeFacts(status=TicketStatus.NEW, version=1)
    # Use the same measured instant for ticket, audit and event initialization.
    write_audit(
        db,
        actor=actor,
        action="ticket.create",
        target=target,
        before=SafeFacts(),
        after=audit,
        clock=lambda: now,
    )
    enqueue_event(
        db,
        actor=actor,
        target=target,
        event_type="ticket.created",
        schema_version=1,
        aggregate_version=1,
        correlation_id=identifier,
        handlers=("ticket.intake_evaluation", "ticket.created_notification"),
        facts=audit,
        clock=lambda: now,
    )
    return CommandResult(identifier, 1)
