from datetime import datetime
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, UniqueConstraint, text
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.models import Base


class WorkPlan(Base):
    __tablename__ = "work_plan"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    ticket_id: Mapped[UUID] = mapped_column(ForeignKey("ticket.id"), index=True)


class PlanVersion(Base):
    __tablename__ = "work_plan_version"
    __table_args__ = (
        UniqueConstraint("plan_id", "version"),
        Index(
            "uq_effective_work_plan_version",
            "ticket_id",
            unique=True,
            postgresql_where=text("state = 'Effective'"),
        ),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True)
    plan_id: Mapped[UUID] = mapped_column(ForeignKey("work_plan.id"))
    ticket_id: Mapped[UUID] = mapped_column(ForeignKey("ticket.id"), index=True)
    version: Mapped[int]
    state: Mapped[str] = mapped_column(String(20))
    goal: Mapped[str] = mapped_column(Text)
    source_ticket_version: Mapped[int]


class WorkTask(Base):
    __tablename__ = "work_task"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    plan_version_id: Mapped[UUID] = mapped_column(
        ForeignKey("work_plan_version.id"), index=True
    )
    team_id: Mapped[UUID] = mapped_column(ForeignKey("org_team.id"))
    title: Mapped[str] = mapped_column(String(180))
    version: Mapped[int]
    status: Mapped[str] = mapped_column(String(20))
    estimated_minutes: Mapped[int]
    remaining_minutes: Mapped[int]
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    effort_evidence_ref: Mapped[str] = mapped_column(String(120))
    effort_evidence_version: Mapped[int]
    effort_verified_by: Mapped[UUID] = mapped_column(ForeignKey("auth_account.id"))
    effort_verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    assignee_id: Mapped[UUID | None] = mapped_column(ForeignKey("auth_account.id"))
    assignment_locked: Mapped[bool]
    result: Mapped[str | None] = mapped_column(Text)
