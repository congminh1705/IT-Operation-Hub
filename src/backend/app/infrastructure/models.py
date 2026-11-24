from datetime import datetime
from uuid import UUID

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

type Scalar = str | int | bool | None


class Base(DeclarativeBase):
    pass


class AuditLog(Base):
    __tablename__ = "audit_log"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    actor_type: Mapped[str] = mapped_column(String(40))
    actor_id: Mapped[UUID]
    action: Mapped[str] = mapped_column(String(80))
    target_type: Mapped[str] = mapped_column(String(80))
    target_id: Mapped[UUID]
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    before_after_redacted: Mapped[dict[str, dict[str, Scalar]]] = mapped_column(JSONB)


class DomainEvent(Base):
    __tablename__ = "domain_event"
    __table_args__ = (
        CheckConstraint("schema_version > 0", name="ck_domain_event_schema_version"),
        CheckConstraint(
            "aggregate_version > 0", name="ck_domain_event_aggregate_version"
        ),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True)
    event_type: Mapped[str] = mapped_column(String(80))
    schema_version: Mapped[int]
    aggregate_type: Mapped[str] = mapped_column(String(80))
    aggregate_id: Mapped[UUID]
    aggregate_version: Mapped[int]
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    actor_type: Mapped[str] = mapped_column(String(40))
    actor_id: Mapped[UUID]
    correlation_id: Mapped[UUID]
    causation_id: Mapped[UUID | None]
    payload: Mapped[dict[str, Scalar]] = mapped_column(JSONB)


class OutboxDelivery(Base):
    __tablename__ = "outbox_delivery"
    __table_args__ = (
        UniqueConstraint("event_id", "handler_purpose", name="uq_outbox_event_handler"),
        CheckConstraint("attempt >= 0", name="ck_outbox_attempt"),
        Index("ix_outbox_due", "delivered_at", "available_at"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True)
    event_id: Mapped[UUID] = mapped_column(ForeignKey("domain_event.id"))
    handler_purpose: Mapped[str] = mapped_column(String(80))
    attempt: Mapped[int]
    available_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    lease_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
