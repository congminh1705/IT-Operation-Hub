from uuid import UUID

from sqlalchemy import CheckConstraint, ForeignKey, Index, String, text
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.models import Base


class Department(Base):
    __tablename__ = "org_department"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(36), unique=True)
    name: Mapped[str] = mapped_column(String(120))
    name_key: Mapped[str] = mapped_column(String(240), unique=True)
    active: Mapped[bool]
    version: Mapped[int]


class Team(Base):
    __tablename__ = "org_team"
    __table_args__ = (
        CheckConstraint("NOT intake OR active"),
        Index(
            "uq_org_team_single_intake",
            "intake",
            unique=True,
            postgresql_where=text("intake"),
        ),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    name_key: Mapped[str] = mapped_column(String(240), unique=True)
    active: Mapped[bool]
    intake: Mapped[bool]
    version: Mapped[int]


class TeamMember(Base):
    __tablename__ = "org_team_member"

    team_id: Mapped[UUID] = mapped_column(ForeignKey("org_team.id"), primary_key=True)
    account_id: Mapped[UUID] = mapped_column(
        ForeignKey("auth_account.id"), primary_key=True, index=True
    )
    active: Mapped[bool]
