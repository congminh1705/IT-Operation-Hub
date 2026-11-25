from datetime import datetime
from unicodedata import normalize
from uuid import UUID, uuid4

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field
from sqlalchemy import Select, delete, false, func, or_, select, true
from sqlalchemy.orm import Session
from sqlalchemy.sql.elements import ColumnElement

from app.infrastructure.clock import Clock, read_utc
from app.infrastructure.commands import CommandResult
from app.infrastructure.events import (
    Actor,
    SafeFacts,
    Target,
    enqueue_event,
    write_audit,
)
from app.modules.auth.models import Account
from app.modules.organization.models import Department, TeamMember
from app.modules.organization.team_scope import (
    effective_team_ids,
    lock_team_configuration,
)
from app.modules.tickets.models import Ticket
from app.modules.workforce.models import (
    Skill,
    TaskSkillRequirement,
    UserSkill,
    WorkforceSkillChange,
    WorkforceSkills,
)

IT_ROLES = ("TECHNICIAN", "IT_MANAGER", "ADMIN")
MANAGEMENT = ("IT_MANAGER", "ADMIN")


class WorkforceRejected(Exception):
    def __init__(self, status: int, code: str) -> None:
        self.status = status
        self.code = code
        super().__init__(code)


class SkillCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=120)
    department_id: UUID | None = None


class SkillView(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="forbid")

    id: UUID
    name: str
    department_id: UUID | None


class SkillCatalog(BaseModel):
    items: list[SkillView]


class SkillVerification(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    skill_id: UUID
    verified: bool = Field(strict=True)
    evidence_ref: str | None = Field(default=None, min_length=1, max_length=120)
    evidence_version: int | None = Field(default=None, ge=1, strict=True)
    expires_at: AwareDatetime | None = None


class WorkforceUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    expectedVersion: int = Field(ge=1, strict=True)
    skills: list[SkillVerification] = Field(min_length=1, max_length=50)
    reason: str = Field(min_length=10, max_length=10000)


class SkillRecord(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="forbid")

    skill_id: UUID
    version: int
    verified: bool
    verified_by: UUID | None
    verified_department_id: UUID | None
    verified_at: datetime | None
    expires_at: datetime | None
    evidence_ref: str | None
    evidence_version: int | None


class WorkforceView(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    version: int
    verified_skill_ids: list[UUID]


class WorkforceDetail(WorkforceView):
    skills: list[SkillRecord]


class WorkforcePage(BaseModel):
    items: list[WorkforceView]
    page: int
    page_size: int
    total: int


def managed_department(db: Session, actor: Account) -> UUID | None:
    department = (
        db.get(Department, actor.department_id) if actor.department_id else None
    )
    return department.id if department is not None and department.active else None


def scope(
    db: Session, actor: Account, ticket_id: UUID | None = None
) -> ColumnElement[bool]:
    if actor.role == "ADMIN":
        return true()
    if actor.role == "IT_MANAGER":
        department = managed_department(db, actor)
        return (
            Account.department_id == department if department is not None else false()
        )
    if actor.role != "TECHNICIAN":
        raise WorkforceRejected(403, "FORBIDDEN")
    own = Account.id == actor.id
    if ticket_id is None:
        return own
    ticket = db.get(Ticket, ticket_id)
    if ticket is None or ticket.team_id not in effective_team_ids(db, actor.id):
        raise WorkforceRejected(404, "NOT_FOUND")
    teammates = select(TeamMember.account_id).where(
        TeamMember.team_id == ticket.team_id, TeamMember.active.is_(True)
    )
    return or_(own, Account.id.in_(teammates))


def workforce_select(
    db: Session, actor: Account, ticket_id: UUID | None = None
) -> Select[Account]:
    return select(Account).where(
        Account.active.is_(True),
        Account.role.in_(IT_ROLES),
        scope(db, actor, ticket_id),
    )


def workforce_account(
    db: Session, actor: Account, account_id: UUID, ticket_id: UUID | None = None
) -> Account:
    person = db.scalar(
        workforce_select(db, actor, ticket_id).where(Account.id == account_id)
    )
    if person is None:
        raise WorkforceRejected(404, "NOT_FOUND")
    return person


def records(db: Session, account_ids: list[UUID]) -> dict[UUID, list[UserSkill]]:
    result: dict[UUID, list[UserSkill]] = {account_id: [] for account_id in account_ids}
    for item in db.scalars(
        select(UserSkill)
        .where(UserSkill.account_id.in_(account_ids))
        .order_by(UserSkill.skill_id)
    ):
        result[item.account_id].append(item)
    return result


def eligible_ids(
    skills: list[UserSkill], now: datetime, department_id: UUID | None
) -> list[UUID]:
    return [
        skill.skill_id
        for skill in skills
        if skill.verified
        and skill.verified_at is not None
        and skill.verified_at <= now
        and (skill.expires_at is None or skill.expires_at > now)
        and (
            skill.verified_department_id is None
            or skill.verified_department_id == department_id
        )
    ]


def project(
    person: Account, version: int, skills: list[UserSkill], now: datetime
) -> WorkforceView:
    return WorkforceView(
        id=person.id,
        version=version,
        verified_skill_ids=eligible_ids(skills, now, person.department_id),
    )


def get_workforce(
    db: Session,
    actor: Account,
    account_id: UUID,
    clock: Clock,
    ticket_id: UUID | None = None,
) -> WorkforceView | WorkforceDetail:
    person = workforce_account(db, actor, account_id, ticket_id)
    aggregate = db.get(WorkforceSkills, person.id)
    skills = records(db, [person.id])[person.id]
    view = project(
        person, aggregate.version if aggregate else 1, skills, read_utc(clock)
    )
    if actor.role in MANAGEMENT:
        return WorkforceDetail(
            **view.model_dump(),
            skills=[SkillRecord.model_validate(item) for item in skills],
        )
    return view


def list_workforce(
    db: Session,
    actor: Account,
    page: int,
    page_size: int,
    clock: Clock,
    ticket_id: UUID | None,
) -> WorkforcePage:
    query = workforce_select(db, actor, ticket_id)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    people = list(
        db.scalars(
            query.order_by(Account.id).offset((page - 1) * page_size).limit(page_size)
        )
    )
    ids = [person.id for person in people]
    versions = {
        row.account_id: row.version
        for row in db.scalars(
            select(WorkforceSkills).where(WorkforceSkills.account_id.in_(ids))
        )
    }
    skills = records(db, ids)
    now = read_utc(clock)
    return WorkforcePage(
        items=[
            project(person, versions.get(person.id, 1), skills[person.id], now)
            for person in people
        ],
        page=page,
        page_size=page_size,
        total=total,
    )


def create_skill(
    db: Session, actor: Account, body: SkillCreate, clock: Clock
) -> CommandResult:
    lock_team_configuration(db)
    name = " ".join(normalize("NFKC", body.name).split())
    key = name.casefold()
    if not name or chr(0) in key or len(name) > 120 or len(key) > 160:
        raise WorkforceRejected(422, "INVALID_SKILL")
    if actor.role == "IT_MANAGER":
        department_id = managed_department(db, actor)
        if department_id is None or body.department_id not in (None, department_id):
            raise WorkforceRejected(403, "FORBIDDEN")
    elif actor.role == "ADMIN":
        department_id = body.department_id
    else:
        raise WorkforceRejected(403, "FORBIDDEN")
    if department_id is not None:
        department = db.get(Department, department_id)
        if department is None or not department.active:
            raise WorkforceRejected(409, "INELIGIBLE_DEPARTMENT")
    skill = Skill(id=uuid4(), name=name, name_key=key, department_id=department_id)
    db.add(skill)
    write_audit(
        db,
        actor=Actor("user", actor.id),
        action="workforce.skill_create",
        target=Target("skill", skill.id),
        before=SafeFacts(),
        after=SafeFacts(version=1),
        clock=clock,
    )
    return CommandResult(skill.id, 1)


def catalog_scope(db: Session, actor: Account) -> ColumnElement[bool]:
    if actor.role == "ADMIN":
        return true()
    if actor.role == "IT_MANAGER":
        department = managed_department(db, actor)
        if department is not None:
            return or_(Skill.department_id.is_(None), Skill.department_id == department)
    raise WorkforceRejected(403, "FORBIDDEN")


def update_workforce(
    db: Session, actor: Account, account_id: UUID, body: WorkforceUpdate, clock: Clock
) -> CommandResult:
    if actor.role not in MANAGEMENT or actor.id == account_id:
        raise WorkforceRejected(403, "FORBIDDEN")
    lock_team_configuration(db)
    person = workforce_account(db, actor, account_id)
    aggregate = db.get(WorkforceSkills, account_id, with_for_update=True)
    version = aggregate.version if aggregate else 1
    if version != body.expectedVersion:
        raise WorkforceRejected(409, "STALE_VERSION")
    skill_ids = {item.skill_id for item in body.skills}
    if len(skill_ids) != len(body.skills) or chr(0) in body.reason:
        raise WorkforceRejected(422, "INVALID_SKILL_UPDATE")
    catalog = {
        skill.id: skill
        for skill in db.scalars(
            select(Skill).where(Skill.id.in_(skill_ids), catalog_scope(db, actor))
        )
    }
    if any(
        skill_id not in catalog
        or catalog[skill_id].department_id not in (None, person.department_id)
        for skill_id in skill_ids
    ):
        raise WorkforceRejected(422, "UNKNOWN_SKILL")
    now = read_utc(clock)
    if aggregate is None:
        aggregate = WorkforceSkills(account_id=account_id, version=version)
        db.add(aggregate)
        db.flush()
    for verification in body.skills:
        if verification.verified:
            if (
                verification.evidence_ref is None
                or chr(0) in verification.evidence_ref
                or verification.evidence_version is None
                or (
                    verification.expires_at is not None
                    and verification.expires_at <= now
                )
            ):
                raise WorkforceRejected(422, "INVALID_VERIFICATION")
        elif any(
            value is not None
            for value in (
                verification.evidence_ref,
                verification.evidence_version,
                verification.expires_at,
            )
        ):
            raise WorkforceRejected(422, "INVALID_VERIFICATION")
        row = db.get(UserSkill, (account_id, verification.skill_id))
        if row is None:
            row = UserSkill(
                account_id=account_id, skill_id=verification.skill_id, version=0
            )
            db.add(row)
        row.version += 1
        row.verified = verification.verified
        row.verified_by = actor.id if verification.verified else None
        row.verified_at = now if verification.verified else None
        row.verified_department_id = (
            (
                person.department_id
                if actor.role == "IT_MANAGER"
                else catalog[verification.skill_id].department_id
            )
            if verification.verified
            else None
        )
        row.evidence_ref = verification.evidence_ref
        row.evidence_version = verification.evidence_version
        row.expires_at = verification.expires_at
    aggregate.version += 1
    db.add_all(
        WorkforceSkillChange(
            account_id=account_id,
            workforce_version=aggregate.version,
            skill_id=skill_id,
        )
        for skill_id in skill_ids
    )
    source, target = Actor("user", actor.id), Target("workforce", account_id)
    before = SafeFacts(version=version)
    after = SafeFacts(version=aggregate.version)
    write_audit(
        db,
        actor=source,
        action="workforce.verify_skills",
        target=target,
        before=before,
        after=SafeFacts(version=aggregate.version, reason_provided=True),
        clock=lambda: now,
    )
    enqueue_event(
        db,
        actor=source,
        target=target,
        event_type="skills.changed",
        schema_version=1,
        aggregate_version=aggregate.version,
        correlation_id=account_id,
        handlers=("workforce.affected_work",),
        facts=after,
        clock=lambda: now,
    )
    return CommandResult(account_id, aggregate.version)


def set_task_skill_requirements(
    db: Session, task_id: UUID, skill_ids: frozenset[UUID]
) -> None:
    """Use inside the caller's authorized task transaction and aggregate lock."""
    db.execute(
        delete(TaskSkillRequirement).where(TaskSkillRequirement.task_id == task_id)
    )
    db.add_all(
        TaskSkillRequirement(task_id=task_id, skill_id=skill_id)
        for skill_id in skill_ids
    )


def missing_task_skills(
    db: Session, task_id: UUID, account_id: UUID, now: datetime
) -> frozenset[UUID]:
    required = frozenset(
        db.scalars(
            select(TaskSkillRequirement.skill_id).where(
                TaskSkillRequirement.task_id == task_id
            )
        )
    )
    person = db.get(Account, account_id)
    if person is None or not person.active or person.role not in IT_ROLES:
        return required
    return required.difference(
        eligible_ids(records(db, [account_id])[account_id], now, person.department_id)
    )
