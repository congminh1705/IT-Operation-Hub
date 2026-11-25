from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Literal
from uuid import UUID

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import Sequence, select
from sqlalchemy.orm import Session

from app.modules.organization.models import Team
from app.modules.organization.team_scope import lock_team_configuration
from app.modules.sla.policy import PolicyView, Priority, snapshot_policy
from app.modules.tickets.categories import TicketCategory

type Severity = Literal["HIGH", "MEDIUM", "LOW"]


class IntakeContext(BaseModel):
    model_config = ConfigDict(extra="forbid")

    workflow_type: str | None = Field(
        default=None, min_length=1, max_length=120, strict=True
    )
    goal: str | None = Field(default=None, min_length=1, max_length=2000, strict=True)
    deadline: AwareDatetime | None = None
    machine_count: int | None = Field(default=None, ge=1, strict=True)

    @field_validator("deadline")
    @classmethod
    def utc_deadline(cls, value: datetime | None) -> datetime | None:
        return value.astimezone(UTC) if value is not None else None


class TicketCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    title: str = Field(min_length=5, max_length=180, strict=True)
    description: str = Field(min_length=10, max_length=10000, strict=True)
    type: Literal["INCIDENT", "SERVICE_REQUEST"]
    category_id: UUID
    impact: Severity
    urgency: Severity
    workflow_context: IntakeContext | None = None

    @field_validator("title", "description")
    @classmethod
    def text_has_no_nul(cls, value: str) -> str:
        if chr(0) in value:
            raise ValueError("Invalid text")
        return value


class IntakeRejected(Exception):
    def __init__(self, status: int, code: str) -> None:
        self.status = status
        self.code = code


@dataclass(frozen=True)
class IntakeFacts:
    requester_id: UUID
    team_id: UUID
    category_id: UUID
    priority: Priority
    sla_policy: PolicyView


PRIORITY_MATRIX: dict[Severity, dict[Severity, Priority]] = {
    "HIGH": {"HIGH": "P1", "MEDIUM": "P2", "LOW": "P3"},
    "MEDIUM": {"HIGH": "P2", "MEDIUM": "P3", "LOW": "P3"},
    "LOW": {"HIGH": "P3", "MEDIUM": "P3", "LOW": "P4"},
}


def derive_intake(db: Session, requester_id: UUID, body: TicketCreate) -> IntakeFacts:
    lock_team_configuration(db)
    team_id = db.scalar(
        select(Team.id).where(Team.intake.is_(True), Team.active.is_(True))
    )
    if team_id is None:
        raise IntakeRejected(503, "INTAKE_UNAVAILABLE")
    category = db.get(TicketCategory, body.category_id, with_for_update={"read": True})
    if category is None or not category.active:
        raise IntakeRejected(422, "CATEGORY_UNAVAILABLE")
    policy = snapshot_policy(db)
    if policy is None:
        raise IntakeRejected(503, "SLA_POLICY_UNAVAILABLE")
    return IntakeFacts(
        requester_id,
        team_id,
        category.id,
        PRIORITY_MATRIX[body.impact][body.urgency],
        policy,
    )


TICKET_CODE_SEQUENCE = Sequence("ticket_code_number")


def next_ticket_code(db: Session) -> str:
    number = db.scalar(TICKET_CODE_SEQUENCE)
    return f"TKT-{number:06d}"
