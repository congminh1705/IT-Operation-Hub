from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import exists, select, update
from sqlalchemy.orm import Session

from app.infrastructure.clock import Clock, read_utc
from app.infrastructure.commands import CommandResult
from app.infrastructure.events import Actor, SafeFacts, Target, write_audit
from app.modules.auth.models import Account
from app.modules.auth.service import revoke_account_sessions
from app.modules.organization.models import Department, TeamMember
from app.modules.tickets.assignment import TicketCommandRejected
from app.modules.tickets.models import Ticket
from app.modules.work_management.models import WorkTask

OPEN_TICKETS = ("New", "Open", "In Progress", "Pending")
OPEN_TASKS = ("To Do", "Ready", "In Progress", "Blocked")
type Role = Literal["ADMIN", "IT_MANAGER", "TECHNICIAN", "REQUESTER"]


class UserUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    expectedVersion: int = Field(ge=1, strict=True)
    role: Role | None = None
    active: bool | None = Field(default=None, strict=True)
    department_id: UUID | None = None
    reason: str = Field(min_length=10, max_length=1000)


def require_no_open_assignments(
    db: Session, account_id: UUID, team_id: UUID | None = None
) -> None:
    tickets = select(Ticket.id).where(
        Ticket.assignee_id == account_id, Ticket.status.in_(OPEN_TICKETS)
    )
    tasks = select(WorkTask.id).where(
        WorkTask.assignee_id == account_id, WorkTask.status.in_(OPEN_TASKS)
    )
    if team_id is not None:
        tickets = tickets.where(Ticket.team_id == team_id)
        tasks = tasks.where(WorkTask.team_id == team_id)
    if db.scalar(select(exists(tickets) | exists(tasks))):
        raise TicketCommandRejected(409, "HANDOVER_REQUIRED")


def update_account(
    db: Session, actor: Account, account_id: UUID, body: UserUpdate, clock: Clock
) -> CommandResult:
    account = db.get(Account, account_id, with_for_update=True, populate_existing=True)
    if account is None:
        raise TicketCommandRejected(404, "NOT_FOUND")
    if account.version != body.expectedVersion:
        raise TicketCommandRejected(409, "STALE_VERSION")
    new_role = account.role if body.role is None else body.role
    active = account.active if body.active is None else body.active
    department_id = (
        body.department_id
        if "department_id" in body.model_fields_set
        else account.department_id
    )
    if (new_role, active, department_id) == (
        account.role,
        account.active,
        account.department_id,
    ) or chr(0) in body.reason:
        raise TicketCommandRejected(422, "INVALID_CHANGE")
    if (
        account.active
        and account.role == "ADMIN"
        and (not active or new_role != "ADMIN")
    ) and not db.scalar(
        select(Account.id)
        .where(
            Account.role == "ADMIN",
            Account.active.is_(True),
            Account.id != account_id,
        )
        .limit(1)
    ):
        raise TicketCommandRejected(409, "LAST_ACTIVE_ADMIN")
    if department_id is not None and department_id != account.department_id:
        dept = db.get(Department, department_id)
        if dept is None or not dept.active:
            raise TicketCommandRejected(409, "INELIGIBLE_DEPARTMENT")
    if account.active and (
        not active or new_role != account.role or department_id != account.department_id
    ):
        require_no_open_assignments(db, account_id)
    before = SafeFacts(active=account.active, version=account.version)
    if (
        new_role == "REQUESTER" and account.role != "REQUESTER"
    ) or department_id != account.department_id:
        db.execute(
            update(TeamMember)
            .where(TeamMember.account_id == account_id, TeamMember.active.is_(True))
            .values(active=False)
        )
    account.role, account.active, account.department_id = (
        new_role,
        active,
        department_id,
    )
    account.version += 1
    now = read_utc(clock)
    revoke_account_sessions(db, account_id, now)
    write_audit(
        db,
        actor=Actor("user", actor.id),
        action="account.access_change",
        target=Target("account", account_id),
        before=before,
        after=SafeFacts(active=active, version=account.version, reason_provided=True),
        clock=lambda: now,
    )
    return CommandResult(account_id, account.version)
