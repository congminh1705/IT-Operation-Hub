from datetime import datetime
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.models import Base


class Account(Base):
    __tablename__ = "auth_account"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True)
    display_name: Mapped[str] = mapped_column(String(120))
    role: Mapped[str] = mapped_column(String(16))
    active: Mapped[bool]
    version: Mapped[int]
    password_hash: Mapped[str | None] = mapped_column(Text)
    temporary_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class PreSession(Base):
    __tablename__ = "auth_pre_session"

    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    csrf_hash: Mapped[str] = mapped_column(String(64))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)


class AuthSession(Base):
    __tablename__ = "auth_session"

    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    account_id: Mapped[UUID] = mapped_column(ForeignKey("auth_account.id"), index=True)
    idle_until: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    password_change_only: Mapped[bool]
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class LoginBudget(Base):
    __tablename__ = "auth_login_budget"

    identity_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    attempts: Mapped[int]
    window_until: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    retry_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
