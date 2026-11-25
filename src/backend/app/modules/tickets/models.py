from datetime import datetime
from uuid import UUID

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.models import Base


class Ticket(Base):
    __tablename__ = "ticket"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(32), unique=True)
    requester_id: Mapped[UUID] = mapped_column(
        ForeignKey("auth_account.id"), index=True
    )
    team_id: Mapped[UUID] = mapped_column(ForeignKey("org_team.id"))
    assignee_id: Mapped[UUID | None] = mapped_column(ForeignKey("auth_account.id"))
    category_id: Mapped[UUID] = mapped_column(ForeignKey("ticket_category.id"))
    title: Mapped[str] = mapped_column(String(180))
    description: Mapped[str] = mapped_column(Text)
    type: Mapped[str] = mapped_column(String(20))
    impact: Mapped[str] = mapped_column(String(6))
    urgency: Mapped[str] = mapped_column(String(6))
    priority: Mapped[str] = mapped_column(String(2))
    status: Mapped[str] = mapped_column(String(20))
    version: Mapped[int]
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    first_response_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    resolution_started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    response_used_seconds: Mapped[int]
    resolution_used_seconds: Mapped[int]
    resolution_paused: Mapped[bool]
    adjustment_revision: Mapped[int]
    sla_policy_version: Mapped[int] = mapped_column(
        ForeignKey("sla_policy_revision.version")
    )
    sla_snapshot: Mapped[dict[str, dict[str, int]]] = mapped_column(JSONB)
    workflow_context: Mapped[dict[str, object] | None] = mapped_column(JSONB)


class TicketComment(Base):
    __tablename__ = "ticket_comment"
    __table_args__ = (CheckConstraint("visibility IN ('PUBLIC', 'INTERNAL')"),)

    id: Mapped[UUID] = mapped_column(primary_key=True)
    ticket_id: Mapped[UUID] = mapped_column(ForeignKey("ticket.id"), index=True)
    author_id: Mapped[UUID] = mapped_column(ForeignKey("auth_account.id"))
    visibility: Mapped[str] = mapped_column(String(8))
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class TicketTransitionReason(Base):
    __tablename__ = "ticket_transition_reason"

    ticket_id: Mapped[UUID] = mapped_column(ForeignKey("ticket.id"), primary_key=True)
    version: Mapped[int] = mapped_column(primary_key=True)
    reason: Mapped[str] = mapped_column(Text)
