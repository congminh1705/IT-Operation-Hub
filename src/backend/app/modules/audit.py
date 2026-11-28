from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session
from sqlalchemy.sql.elements import ColumnElement

from app.infrastructure.events import AUDIT_REASON_LABELS, AuditReason
from app.infrastructure.models import AuditLog, Scalar
from app.modules.auth.models import Account
from app.modules.tickets.models import Ticket
from app.modules.tickets.read import TicketAccess
from app.modules.tickets.service import TicketStatus
from app.modules.work_management.models import WorkPlan, WorkTask
from app.modules.work_management.service import task_query
from app.modules.workforce.models import Skill
from app.modules.workforce.skills import IT_ROLES, managed_department

BUSINESS_ACTIONS = {
    "ticket": ("ticket.",),
    "work_plan": ("work_plan.",),
    "work_task": ("task.",),
    "workforce": ("workforce.", "availability."),
    "skill": ("workforce.",),
}
ADMIN_ACTIONS = {
    "account": ("account.", "user.", "auth."),
    "sla_policy_revision": ("sla.",),
    "team": ("team.",),
    "department": ("department.",),
    "ticket_category": ("ticket_category.",),
}
STATUS_VALUES = {status.value for status in TicketStatus} | {
    "Draft",
    "Ready",
    "Blocked",
    "Done",
    "Assigned",
    "Planned",
}


class AuditView(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    actor_type: Literal["HUMAN", "SERVICE"]
    actor_id: UUID
    action: str
    resource_reference: str
    occurred_at: datetime
    safe_summary: str
    before: dict[str, str | int | bool | None]
    after: dict[str, str | int | bool | None]
    reason_code: AuditReason | None
    reason_label: str | None
    reason_status: Literal["available", "unavailable", "not_recorded"]
    reason_recorded: bool


def audit_scope(db: Session, actor: Account) -> ColumnElement[bool]:
    """Restrict rows before counting, fetching, or projecting audit facts."""
    if actor.role not in ("IT_MANAGER", "ADMIN"):
        raise ValueError("Audit requires a management role")
    ticket_ids = select(Ticket.id).where(TicketAccess.resolve(db, actor).predicate())
    people = select(Account.id).where(
        Account.active.is_(True), Account.role.in_(IT_ROLES)
    )
    skills = select(Skill.id)
    if actor.role == "IT_MANAGER":
        department = managed_department(db, actor)
        people = people.where(
            Account.department_id == department, Account.department_id.is_not(None)
        )
        skills = skills.where(
            or_(Skill.department_id.is_(None), Skill.department_id == department)
        )
    targets = {
        "ticket": ticket_ids,
        "work_plan": select(WorkPlan.id).where(WorkPlan.ticket_id.in_(ticket_ids)),
        "work_task": task_query(db, actor).with_only_columns(WorkTask.id),
        "workforce": people,
        "skill": skills,
    }
    visible = [
        and_(
            AuditLog.target_type == kind,
            AuditLog.target_id.in_(statement),
            or_(
                *(
                    AuditLog.action.startswith(prefix)
                    for prefix in BUSINESS_ACTIONS[kind]
                )
            ),
        )
        for kind, statement in targets.items()
    ]
    if actor.role == "ADMIN":
        visible.extend(
            and_(
                AuditLog.target_type == kind,
                or_(*(AuditLog.action.startswith(prefix) for prefix in prefixes)),
            )
            for kind, prefixes in ADMIN_ACTIONS.items()
        )
    return or_(*visible)


def safe_facts(facts: dict[str, Scalar]) -> dict[str, Scalar]:
    """Return only supported, type-checked facts from the redacted store."""
    result: dict[str, Scalar] = {}
    for key, value in facts.items():
        if (
            key in {"active", "reason_provided"}
            and isinstance(value, bool)
            or key == "version"
            and type(value) is int
            and value >= 0
        ):
            result[key] = value
        elif key in {"status", "previous_status"} and isinstance(value, str):
            if value in STATUS_VALUES:
                result[key] = value
        elif (
            key in {"priority", "previous_priority"}
            and value
            in (
                "P1",
                "P2",
                "P3",
                "P4",
            )
            or key == "reason_code"
            and value in AUDIT_REASON_LABELS
        ):
            result[key] = value
        elif key in {
            "team_id",
            "assignee_id",
            "previous_team_id",
            "previous_assignee_id",
        }:
            if value is None:
                result[key] = None
            elif isinstance(value, str):
                try:
                    result[key] = str(UUID(value))
                except ValueError:
                    continue
    return result


def project_audit(row: AuditLog) -> AuditView:
    before = safe_facts(row.before_after_redacted.get("before", {}))
    after = safe_facts(row.before_after_redacted.get("after", {}))
    raw_code = after.get("reason_code")
    code = AuditReason(raw_code) if isinstance(raw_code, str) else None
    recorded = after.get("reason_provided") is True or code is not None
    return AuditView(
        reason_code=code,
        reason_label=AUDIT_REASON_LABELS.get(code) if code else None,
        reason_status="available"
        if code
        else "unavailable"
        if recorded
        else "not_recorded",
        id=row.id,
        actor_type="HUMAN" if row.actor_type == "user" else "SERVICE",
        actor_id=row.actor_id,
        action=row.action,
        resource_reference=f"{row.target_type}:{row.target_id}",
        occurred_at=row.occurred_at,
        safe_summary=row.action,
        before=before,
        after=after,
        reason_recorded=recorded,
    )


class AuditViewPage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    items: list[AuditView]
    page: int = Field(ge=1, le=10_000)
    page_size: int = Field(ge=1, le=100)
    total: int = Field(ge=0)


def search_audit(
    db: Session,
    actor: Account,
    page: int,
    page_size: int,
    q: str | None = None,
    actor_id: UUID | None = None,
    target_id: UUID | None = None,
) -> AuditViewPage:
    predicates = [audit_scope(db, actor)]
    if q:
        predicates.append(AuditLog.action.icontains(q, autoescape=True))
    if actor_id is not None:
        predicates.append(AuditLog.actor_id == actor_id)
    if target_id is not None:
        predicates.append(AuditLog.target_id == target_id)
    total = db.scalar(select(func.count()).select_from(AuditLog).where(*predicates))
    rows = db.scalars(
        select(AuditLog)
        .where(*predicates)
        .order_by(AuditLog.occurred_at.desc(), AuditLog.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return AuditViewPage(
        items=[project_audit(row) for row in rows],
        page=page,
        page_size=page_size,
        total=total or 0,
    )
