from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.models import Base

type Role = Literal["REQUESTER", "TECHNICIAN", "IT_MANAGER", "ADMIN"]


class UserCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: str = Field(strict=True, min_length=3, max_length=254)
    display_name: str = Field(strict=True, min_length=1, max_length=120)
    department_id: UUID
    role: Role = "REQUESTER"
    initial_password: str = Field(
        strict=True,
        min_length=15,
        max_length=128,
        repr=False,
        json_schema_extra={"writeOnly": True},
    )
    verification_id: UUID


class ProvisioningVerification(Base):
    """Trusted, server-recorded D-29 evidence. No user-facing registration endpoint."""

    __tablename__ = "user_provisioning_verification"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    source_kind: Mapped[str] = mapped_column(String(16))
    source_id: Mapped[UUID] = mapped_column(unique=True)
    email: Mapped[str] = mapped_column(String(254))
    department_id: Mapped[UUID] = mapped_column(ForeignKey("org_department.id"))
    role: Mapped[str] = mapped_column(String(16))
    verified_by: Mapped[UUID] = mapped_column(ForeignKey("auth_account.id"))
    elevated_approval_id: Mapped[UUID | None]
    consumed_account_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("auth_account.id"), unique=True
    )
    active: Mapped[bool]
