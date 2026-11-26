from uuid import UUID

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.models import Base


class TicketCategory(Base):
    __tablename__ = "ticket_category"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(36), unique=True)
    name: Mapped[str] = mapped_column(String(120))
    name_key: Mapped[str] = mapped_column(String(240), unique=True)
    active: Mapped[bool]
    version: Mapped[int]
