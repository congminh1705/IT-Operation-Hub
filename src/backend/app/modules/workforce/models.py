from datetime import datetime
from uuid import UUID

from sqlalchemy import Boolean, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.models import Base


class Skill(Base):
    __tablename__ = "workforce_skill"
    __table_args__ = (
        UniqueConstraint(
            "department_id", "name_key", postgresql_nulls_not_distinct=True
        ),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    name_key: Mapped[str] = mapped_column(String(160))
    department_id: Mapped[UUID | None] = mapped_column(ForeignKey("org_department.id"))


class WorkforceSkills(Base):
    __tablename__ = "workforce_skills"

    account_id: Mapped[UUID] = mapped_column(
        ForeignKey("auth_account.id"), primary_key=True
    )
    version: Mapped[int]


class UserSkill(Base):
    __tablename__ = "workforce_user_skill"

    account_id: Mapped[UUID] = mapped_column(
        ForeignKey("workforce_skills.account_id"), primary_key=True
    )
    skill_id: Mapped[UUID] = mapped_column(
        ForeignKey("workforce_skill.id"), primary_key=True
    )
    version: Mapped[int]
    verified: Mapped[bool] = mapped_column(Boolean)
    verified_by: Mapped[UUID | None] = mapped_column(ForeignKey("auth_account.id"))
    verified_department_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("org_department.id")
    )
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    evidence_ref: Mapped[str | None] = mapped_column(String(120))
    evidence_version: Mapped[int | None]


class TaskSkillRequirement(Base):
    __tablename__ = "task_skill_requirement"

    task_id: Mapped[UUID] = mapped_column(primary_key=True)
    skill_id: Mapped[UUID] = mapped_column(
        ForeignKey("workforce_skill.id"), primary_key=True
    )
