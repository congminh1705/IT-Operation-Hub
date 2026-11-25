from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.infrastructure.clock import Clock, read_utc
from app.infrastructure.commands import CommandResult
from app.infrastructure.events import Actor, SafeFacts, Target, write_audit
from app.modules.auth.models import Account
from app.modules.auth.service import revoke_account_sessions
from app.modules.organization.containment import open_holds
from app.modules.organization.handover import HandoverItem, apply_handover, contain_work
from app.modules.organization.models import Department, TeamMember
from app.modules.tickets.assignment import TicketCommandRejected

type Role = Literal["ADMIN", "IT_MANAGER", "TECHNICIAN", "REQUESTER"]


class UserUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    expectedVersion: int = Field(ge=1, strict=True)
    role: Role | None = None
    active: bool | None = Field(default=None, strict=True)
    department_id: UUID | None = None
    reason: str = Field(min_length=10, max_length=1000)
    handover: list[HandoverItem] = Field(default_factory=list, max_length=100)
    suspend_without_replacement: bool = Field(default=False, strict=True)


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
    now = read_utc(clock)
    if open_holds(db, account_id):
        raise TicketCommandRejected(409, "HANDOVER_PENDING")
    access_change = account.active and (
        not active or new_role != account.role or department_id != account.department_id
    )
    if body.suspend_without_replacement:
        if (
            body.active is not False
            or body.handover
            or not account.active
            or new_role != account.role
            or department_id != account.department_id
        ):
            raise TicketCommandRejected(422, "INVALID_SUSPENSION")
        contain_work(db, account_id, now)
    elif access_change:
        apply_handover(db, actor, account_id, body.handover, body.reason, now)
    elif body.handover:
        raise TicketCommandRejected(422, "INVALID_HANDOVER")
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
    revoke_account_sessions(db, account_id, now)
    write_audit(
        db,
        actor=Actor("user", actor.id),
        action="account.emergency_suspension"
        if body.suspend_without_replacement
        else "account.access_change",
        target=Target("account", account_id),
        before=before,
        after=SafeFacts(active=active, version=account.version, reason_provided=True),
        clock=lambda: now,
    )
    return CommandResult(account_id, account.version)
