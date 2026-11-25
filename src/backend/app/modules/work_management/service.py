from datetime import datetime
from typing import Literal, Self, cast
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from sqlalchemy import Select, func, select, true
from sqlalchemy.orm import Session
from sqlalchemy.sql.elements import ColumnElement

from app.infrastructure.clock import Clock, read_utc
from app.infrastructure.commands import CommandResult
from app.infrastructure.events import Actor, SafeFacts, Target, write_audit
from app.modules.auth.models import Account
from app.modules.organization.models import Team
from app.modules.organization.team_scope import effective_team_ids
from app.modules.tickets.assignment import (
    MANAGEMENT,
    TicketCommandRejected,
    check_version,
    lock_ticket,
)
from app.modules.tickets.models import Ticket
from app.modules.tickets.read import ListScope
from app.modules.work_management.models import (
    PlanVersion,
    TaskAllocation,
    WorkPlan,
    WorkTask,
)
from app.modules.workforce.calendar import Interval
from app.modules.workforce.models import Skill, TaskSkillRequirement
from app.modules.workforce.skills import catalog_scope, set_task_skill_requirements

type TaskStatus = Literal[
    "To Do", "Ready", "In Progress", "Blocked", "Done", "Cancelled"
]
type PlanState = Literal["Draft", "Effective", "Superseded", "Cancelled"]


class ManualTaskInput(Interval):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    title: str = Field(min_length=1, max_length=180)
    estimated_minutes: int = Field(ge=1, le=2_147_483_647, strict=True)
    effort_evidence_ref: str = Field(min_length=1, max_length=120)
    effort_evidence_version: int = Field(ge=1, le=2_147_483_647, strict=True)
    required_skill_ids: list[UUID] = Field(max_length=50)

    @model_validator(mode="after")
    def evidence_and_window(self) -> Self:
        if (
            self.estimated_minutes * 60
            > (self.ends_at - self.starts_at).total_seconds()
            or len(set(self.required_skill_ids)) != len(self.required_skill_ids)
            or chr(0) in self.effort_evidence_ref
            or chr(0) in self.title
        ):
            raise ValueError("Invalid task window, skills or evidence")
        return self


class ManualPlanCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    expectedVersion: int = Field(ge=1, strict=True)
    goal: str = Field(min_length=1, max_length=4000)
    tasks: list[ManualTaskInput] = Field(min_length=1, max_length=50)

    @field_validator("goal")
    @classmethod
    def valid_goal(cls, value: str) -> str:
        if chr(0) in value:
            raise ValueError("Invalid goal")
        return value


class TaskView(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    plan_version_id: UUID
    title: str
    team_id: UUID
    assignee_id: UUID | None
    status: TaskStatus
    version: int
    estimated_minutes: int
    remaining_minutes: int
    starts_at: datetime
    ends_at: datetime
    required_skill_ids: list[UUID]
    predecessor_ids: list[UUID]
    allocations: list[Interval]
    assignment_locked: bool
    result: str | None


class PlanView(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    ticket_id: UUID
    plan_version_id: UUID
    version: int
    state: PlanState
    goal: str
    tasks: list[TaskView]
    source_versions: dict[str, int]


class TaskPage(BaseModel):
    items: list[TaskView]
    total: int
    page: int
    page_size: int


class PlanPage(BaseModel):
    items: list[PlanView]
    total: int
    page: int
    page_size: int


def team_scope(db: Session, actor: Account) -> ColumnElement[bool]:
    if actor.role in MANAGEMENT:
        return true()
    if actor.role == "TECHNICIAN":
        return Ticket.team_id.in_(effective_team_ids(db, actor.id))
    raise TicketCommandRejected(403, "FORBIDDEN")


def task_query(db: Session, actor: Account) -> Select[WorkTask]:
    return (
        select(WorkTask)
        .join(PlanVersion)
        .join(Ticket, Ticket.id == PlanVersion.ticket_id)
        .where(
            team_scope(db, actor),
            WorkTask.team_id == Ticket.team_id
            if actor.role == "TECHNICIAN"
            else true(),
        )
    )


def task_views(db: Session, tasks: list[WorkTask]) -> list[TaskView]:
    skills: dict[UUID, list[UUID]] = {task.id: [] for task in tasks}
    for task_id, skill_id in db.execute(
        select(TaskSkillRequirement.task_id, TaskSkillRequirement.skill_id)
        .where(TaskSkillRequirement.task_id.in_(skills))
        .order_by(TaskSkillRequirement.skill_id)
    ):
        skills[task_id].append(skill_id)
    allocations: dict[UUID, list[Interval]] = {task.id: [] for task in tasks}
    for row in db.scalars(
        select(TaskAllocation)
        .where(
            TaskAllocation.task_id.in_(allocations),
            TaskAllocation.released_at.is_(None),
        )
        .order_by(TaskAllocation.starts_at, TaskAllocation.id)
    ):
        allocations[row.task_id].append(
            Interval(starts_at=row.starts_at, ends_at=row.ends_at)
        )
    return [
        TaskView(
            id=task.id,
            plan_version_id=task.plan_version_id,
            title=task.title,
            team_id=task.team_id,
            assignee_id=task.assignee_id,
            status=cast(TaskStatus, task.status),
            version=task.version,
            estimated_minutes=task.estimated_minutes,
            remaining_minutes=task.remaining_minutes,
            starts_at=task.starts_at,
            ends_at=task.ends_at,
            required_skill_ids=skills[task.id],
            predecessor_ids=[],
            allocations=allocations[task.id],
            assignment_locked=task.assignment_locked,
            result=task.result,
        )
        for task in tasks
    ]


def plan_views(
    db: Session, actor: Account, versions: list[PlanVersion]
) -> list[PlanView]:
    grouped: dict[UUID, list[TaskView]] = {version.id: [] for version in versions}
    rows = db.scalars(
        task_query(db, actor)
        .where(WorkTask.plan_version_id.in_(grouped))
        .order_by(WorkTask.id)
    )
    for task in task_views(db, list(rows)):
        grouped[task.plan_version_id].append(task)
    return [
        PlanView(
            id=version.plan_id,
            ticket_id=version.ticket_id,
            plan_version_id=version.id,
            version=version.version,
            state=cast(PlanState, version.state),
            goal=version.goal,
            tasks=grouped[version.id],
            source_versions={str(version.ticket_id): version.source_ticket_version},
        )
        for version in versions
    ]


def create_manual_plan(
    db: Session, actor: Account, ticket_id: UUID, body: ManualPlanCreate, clock: Clock
) -> CommandResult:
    if actor.role not in MANAGEMENT:
        raise TicketCommandRejected(403, "FORBIDDEN")
    ticket = lock_ticket(db, ticket_id)
    check_version(ticket, body.expectedVersion)
    team = db.get(Team, ticket.team_id)
    if ticket.status in ("Closed", "Cancelled") or team is None or not team.active:
        raise TicketCommandRejected(409, "PLAN_UNAVAILABLE")
    skills = {skill for item in body.tasks for skill in item.required_skill_ids}
    if skills and skills != set(
        db.scalars(
            select(Skill.id).where(Skill.id.in_(skills), catalog_scope(db, actor))
        )
    ):
        raise TicketCommandRejected(422, "UNKNOWN_SKILL")
    now = read_utc(clock)
    plan = WorkPlan(id=uuid4(), ticket_id=ticket_id)
    db.add(plan)
    db.flush()
    version = PlanVersion(
        id=uuid4(),
        plan_id=plan.id,
        ticket_id=ticket_id,
        version=1,
        state="Draft",
        goal=body.goal,
        source_ticket_version=ticket.version,
    )
    db.add(version)
    db.flush()
    for item in body.tasks:
        task = WorkTask(
            id=uuid4(),
            plan_version_id=version.id,
            team_id=team.id,
            title=item.title,
            version=1,
            status="To Do",
            estimated_minutes=item.estimated_minutes,
            remaining_minutes=item.estimated_minutes,
            starts_at=item.starts_at,
            ends_at=item.ends_at,
            effort_evidence_ref=item.effort_evidence_ref,
            effort_evidence_version=item.effort_evidence_version,
            effort_verified_by=actor.id,
            effort_verified_at=now,
            assignment_locked=False,
        )
        db.add(task)
        set_task_skill_requirements(db, task.id, frozenset(item.required_skill_ids))
    write_audit(
        db,
        actor=Actor("user", actor.id),
        action="work_plan.manual_create",
        target=Target("work_plan", plan.id),
        before=SafeFacts(),
        after=SafeFacts(version=1),
        clock=lambda: now,
    )
    return CommandResult(version.id, version.version)


def created_plan(db: Session, actor: Account, result: CommandResult) -> PlanView:
    if actor.role not in MANAGEMENT:
        raise TicketCommandRejected(403, "FORBIDDEN")
    version = db.get(PlanVersion, result.id)
    if version is None:
        raise TicketCommandRejected(404, "NOT_FOUND")
    return plan_views(db, actor, [version])[0]


def list_plans(
    db: Session,
    actor: Account,
    record_id: UUID,
    page: int,
    page_size: int,
    *,
    by_ticket: bool,
) -> PlanPage:
    scope = team_scope(db, actor)
    parents = select(Ticket.id).where(scope)
    if by_ticket:
        parents = parents.where(Ticket.id == record_id)
    else:
        parents = parents.join(WorkPlan, WorkPlan.ticket_id == Ticket.id).where(
            WorkPlan.id == record_id
        )
    ticket_id = db.scalar(parents)
    if ticket_id is None:
        raise TicketCommandRejected(404, "NOT_FOUND")
    query = select(PlanVersion).where(PlanVersion.ticket_id == ticket_id)
    if by_ticket:
        latest = (
            select(func.max(PlanVersion.version))
            .where(PlanVersion.plan_id == WorkPlan.id)
            .correlate(WorkPlan)
        )
        query = query.join(WorkPlan, WorkPlan.id == PlanVersion.plan_id).where(
            PlanVersion.version == latest.scalar_subquery()
        )
    else:
        query = query.where(PlanVersion.plan_id == record_id)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    versions = list(
        db.scalars(
            query.order_by(PlanVersion.version.desc(), PlanVersion.id)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    )
    return PlanPage(
        items=plan_views(db, actor, versions),
        total=total,
        page=page,
        page_size=page_size,
    )


def get_task(db: Session, actor: Account, task_id: UUID) -> TaskView:
    task = db.scalar(task_query(db, actor).where(WorkTask.id == task_id))
    if task is None:
        raise TicketCommandRejected(404, "NOT_FOUND")
    return task_views(db, [task])[0]


def list_tasks(
    db: Session,
    actor: Account,
    page: int,
    page_size: int,
    scope: ListScope | None,
    status: TaskStatus | None,
) -> TaskPage:
    query = task_query(db, actor)
    if scope == "mine":
        query = query.where(WorkTask.assignee_id == actor.id)
    if status is not None:
        query = query.where(WorkTask.status == status)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    tasks = list(
        db.scalars(
            query.order_by(WorkTask.id).offset((page - 1) * page_size).limit(page_size)
        )
    )
    return TaskPage(
        items=task_views(db, tasks), total=total, page=page, page_size=page_size
    )
