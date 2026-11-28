from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.infrastructure.models import DomainEvent, Scalar
from app.modules.auth.models import Account
from app.modules.tickets.conversation import conversation_access
from app.modules.tickets.models import TicketChangeReason, TicketPriorityAdjustment
from app.modules.tickets.service import TicketStatus

PUBLIC_SUMMARIES = {
    "ticket.created": "Ticket created",
    "ticket.accepted": "Ticket accepted",
    "ticket.started": "Work started",
    "ticket.pending": "Waiting for clarification",
    "ticket.resumed": "Work resumed",
    "ticket.resolved": "Ticket resolved",
    "ticket.closed": "Ticket closed",
    "ticket.reopened": "Ticket reopened",
    "ticket.cancelled": "Ticket cancelled",
    "ticket.priority_changed": "Priority changed",
}
INTERNAL_SUMMARIES = {**PUBLIC_SUMMARIES, "ticket.assigned": "Assignment updated"}
STATUS_CHANGES = {
    "ticket.accepted": ("New", "Open"),
    "ticket.started": ("Open", "In Progress"),
    "ticket.pending": ("In Progress", "Pending"),
    "ticket.resumed": ("Pending", "In Progress"),
    "ticket.resolved": ("In Progress", "Resolved"),
    "ticket.closed": ("Resolved", "Closed"),
    "ticket.reopened": (None, "In Progress"),
    "ticket.cancelled": (None, "Cancelled"),
}
PRIORITIES = {"P1", "P2", "P3", "P4"}


class TicketEventView(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    event_type: str
    visibility: Literal["PUBLIC", "INTERNAL"]
    safe_summary: str
    occurred_at: datetime
    previous_status: TicketStatus | None
    status: TicketStatus | None
    previous_priority: str | None
    priority: str | None


class TicketEventInternal(TicketEventView):
    actor_id: UUID | None
    reason: str | None
    previous_team_id: UUID | None
    team_id: UUID | None
    previous_assignee_id: UUID | None
    assignee_id: UUID | None


class TicketEventPage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    items: list[TicketEventInternal | TicketEventView]
    page: int
    page_size: int
    total: int


def parse_uuid(value: Scalar) -> UUID | None:
    if isinstance(value, str):
        try:
            return UUID(value)
        except ValueError:
            return None
    return None


def public_event(event: DomainEvent) -> TicketEventView:
    event_type = event.event_type
    old, new = STATUS_CHANGES.get(event_type, (None, None))
    previous_status = event.payload.get("previous_status")
    if previous_status in {item.value for item in TicketStatus}:
        old = str(previous_status)
    priority = (
        event.payload.get("priority")
        if event_type == "ticket.priority_changed"
        else None
    )
    previous_priority = event.payload.get("previous_priority") if priority else None
    return TicketEventView(
        id=event.id,
        event_type=event_type,
        visibility="PUBLIC" if event_type in PUBLIC_SUMMARIES else "INTERNAL",
        safe_summary=INTERNAL_SUMMARIES[event_type],
        occurred_at=event.occurred_at,
        previous_status=TicketStatus(old) if old is not None else None,
        status=TicketStatus(new) if new is not None else None,
        previous_priority=str(previous_priority)
        if previous_priority in PRIORITIES
        else None,
        priority=str(priority) if priority in PRIORITIES else None,
    )


def list_ticket_events(
    db: Session,
    actor: Account,
    ticket_id: UUID,
    page: int,
    page_size: int,
) -> TicketEventPage:
    _, internal = conversation_access(db, actor, ticket_id)
    visible = INTERNAL_SUMMARIES if internal else PUBLIC_SUMMARIES
    criteria = (
        DomainEvent.aggregate_type == "ticket",
        DomainEvent.aggregate_id == ticket_id,
        DomainEvent.event_type.in_(visible.keys()),
    )
    total = (
        db.scalar(select(func.count()).select_from(DomainEvent).where(*criteria)) or 0
    )
    events = list(
        db.scalars(
            select(DomainEvent)
            .where(*criteria)
            .order_by(DomainEvent.occurred_at, DomainEvent.id)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    )
    if not internal or not events:
        return TicketEventPage(
            items=[public_event(event) for event in events],
            page=page,
            page_size=page_size,
            total=total,
        )
    versions = {event.aggregate_version for event in events}
    lifecycle_reasons = {
        version: reason
        for version, reason in db.execute(
            select(TicketChangeReason.version, TicketChangeReason.reason).where(
                TicketChangeReason.ticket_id == ticket_id,
                TicketChangeReason.version.in_(versions),
            )
        )
    }
    priority_reasons = {
        version: reason
        for version, reason in db.execute(
            select(
                TicketPriorityAdjustment.ticket_version, TicketPriorityAdjustment.reason
            ).where(
                TicketPriorityAdjustment.ticket_id == ticket_id,
                TicketPriorityAdjustment.ticket_version.in_(versions),
            )
        )
    }
    items: list[TicketEventInternal | TicketEventView] = [
        TicketEventInternal(
            **public_event(event).model_dump(),
            actor_id=event.actor_id if event.actor_type == "user" else None,
            reason=(
                priority_reasons.get(event.aggregate_version)
                if event.event_type == "ticket.priority_changed"
                else lifecycle_reasons.get(event.aggregate_version)
                if event.event_type in STATUS_CHANGES
                or event.event_type == "ticket.assigned"
                else None
            ),
            previous_team_id=parse_uuid(event.payload.get("previous_team_id"))
            if event.event_type == "ticket.assigned"
            else None,
            team_id=parse_uuid(event.payload.get("team_id"))
            if event.event_type == "ticket.assigned"
            else None,
            previous_assignee_id=parse_uuid(event.payload.get("previous_assignee_id"))
            if event.event_type == "ticket.assigned"
            else None,
            assignee_id=parse_uuid(event.payload.get("assignee_id"))
            if event.event_type == "ticket.assigned"
            else None,
        )
        for event in events
    ]
    return TicketEventPage(items=items, page=page, page_size=page_size, total=total)
