from datetime import datetime
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, Index, String, select, text
from sqlalchemy.orm import Mapped, Session, mapped_column

from app.infrastructure.models import Base


class WorkAccessHold(Base):
    __tablename__ = "work_access_hold"
    __table_args__ = (
        Index(
            "uq_open_work_access_hold",
            "kind",
            "work_id",
            unique=True,
            postgresql_where=text("released_at IS NULL"),
        ),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True)
    account_id: Mapped[UUID] = mapped_column(ForeignKey("auth_account.id"), index=True)
    kind: Mapped[str] = mapped_column(String(8))
    work_id: Mapped[UUID]
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    released_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


def work_is_held(db: Session, kind: str, work_id: UUID) -> bool:
    return (
        db.scalar(
            select(WorkAccessHold.id).where(
                WorkAccessHold.kind == kind,
                WorkAccessHold.work_id == work_id,
                WorkAccessHold.released_at.is_(None),
            )
        )
        is not None
    )


def open_holds(db: Session, account_id: UUID) -> list[WorkAccessHold]:
    return list(
        db.scalars(
            select(WorkAccessHold)
            .where(
                WorkAccessHold.account_id == account_id,
                WorkAccessHold.released_at.is_(None),
            )
            .order_by(WorkAccessHold.kind, WorkAccessHold.work_id)
        )
    )
