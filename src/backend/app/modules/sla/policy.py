from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import JSON, String, select
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, Session, mapped_column

from app.infrastructure.events import AuditReason
from app.infrastructure.models import Base

type Priority = Literal["P1", "P2", "P3", "P4"]


class Budget(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True, frozen=True)

    response_seconds: int = Field(ge=1)
    resolution_seconds: int = Field(ge=1)


class PriorityBudgets(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    P1: Budget
    P2: Budget
    P3: Budget
    P4: Budget

    def for_priority(self, priority: Priority) -> Budget:
        return {"P1": self.P1, "P2": self.P2, "P3": self.P3, "P4": self.P4}[priority]


class PolicyView(BaseModel):
    model_config = ConfigDict(frozen=True)

    version: int
    priority_budgets: PriorityBudgets


class PolicyUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    expectedVersion: int = Field(ge=1)
    priority_budgets: PriorityBudgets
    reason: str = Field(min_length=10, max_length=10000)
    reason_code: AuditReason | None = None


class PolicyRevision(Base):
    __tablename__ = "sla_policy_revision"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    version: Mapped[int] = mapped_column(unique=True)
    priority_budgets: Mapped[dict[str, dict[str, int]]] = mapped_column(
        JSON().with_variant(JSONB, "postgresql")
    )
    reason: Mapped[str] = mapped_column(String(10000))

    def snapshot(self) -> PolicyView:
        return PolicyView(
            version=self.version,
            priority_budgets=PriorityBudgets.model_validate(self.priority_budgets),
        )


def policy_revision(db: Session, version: int | None = None) -> PolicyRevision | None:
    if version is None:
        return db.scalar(
            select(PolicyRevision).order_by(PolicyRevision.version.desc()).limit(1)
        )
    return db.scalar(select(PolicyRevision).where(PolicyRevision.version == version))


def snapshot_policy(db: Session, version: int | None = None) -> PolicyView | None:
    """Get an immutable full-table snapshot for consumers in their own transaction."""
    row = policy_revision(db, version)
    return row.snapshot() if row is not None else None
