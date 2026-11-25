from enum import StrEnum
from uuid import UUID

from pydantic import Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.infrastructure.clock import Clock, read_utc
from app.infrastructure.commands import CommandResult
from app.infrastructure.events import SafeFacts
from app.modules.auth.models import Account
from app.modules.tickets.assignment import MANAGEMENT, TicketCommandRejected
from app.modules.work_management.allocation import (
    TERMINAL,
    VersionedTaskCommand,
    active_slots,
    allowed_performer,
    lock_allocation_rows,
    lock_work_task,
    record_task_effect,
    replace_slots,
    validate_reservation,
)
from app.modules.work_management.models import (
    TaskDependency,
    TaskTransitionRecord,
    WorkTask,
)
from app.modules.workforce.calendar import Interval


class TaskState(StrEnum):
    TODO = "To Do"
    READY = "Ready"
    IN_PROGRESS = "In Progress"
    BLOCKED = "Blocked"
    DONE = "Done"
    CANCELLED = "Cancelled"


EVENTS = {
    (TaskState.TODO, TaskState.READY): "task.ready",
    (TaskState.READY, TaskState.IN_PROGRESS): "task.started",
    (TaskState.READY, TaskState.BLOCKED): "task.blocked",
    (TaskState.IN_PROGRESS, TaskState.BLOCKED): "task.blocked",
    (TaskState.BLOCKED, TaskState.READY): "task.ready",
    (TaskState.IN_PROGRESS, TaskState.DONE): "task.completed",
    (TaskState.TODO, TaskState.CANCELLED): "task.cancelled",
    (TaskState.READY, TaskState.CANCELLED): "task.cancelled",
    (TaskState.BLOCKED, TaskState.CANCELLED): "task.cancelled",
    (TaskState.IN_PROGRESS, TaskState.CANCELLED): "task.cancelled",
}


class TaskTransition(VersionedTaskCommand):
    target_status: TaskState
    remaining_minutes: int | None = Field(
        default=None, ge=0, le=2_147_483_647, strict=True
    )
    result: str | None = Field(default=None, max_length=10000)
    reason: str | None = Field(default=None, max_length=10000)


def assert_dependencies_done(db: Session, task: WorkTask) -> None:
    unavailable = db.scalar(
        select(TaskDependency.predecessor_id)
        .join(WorkTask, WorkTask.id == TaskDependency.predecessor_id)
        .where(TaskDependency.task_id == task.id, WorkTask.status != TaskState.DONE)
        .limit(1)
    )
    if unavailable is not None:
        raise TicketCommandRejected(409, "PREDECESSORS_INCOMPLETE")


def assert_cancel_can_proceed(db: Session, task: WorkTask) -> None:
    affected = db.scalar(
        select(TaskDependency.task_id)
        .join(WorkTask, WorkTask.id == TaskDependency.task_id)
        .where(
            TaskDependency.predecessor_id == task.id, WorkTask.status.not_in(TERMINAL)
        )
        .limit(1)
    )
    if affected is not None:
        raise TicketCommandRejected(409, "DOWNSTREAM_REVIEW_REQUIRED")


def valid_human_result(value: str | None) -> bool:
    return bool(
        value
        and chr(0) not in value
        and any(character.isalnum() for character in value)
    )


def transition_task(
    db: Session, actor: Account, task_id: UUID, body: TaskTransition, clock: Clock
) -> CommandResult:
    task, _ = lock_work_task(db, actor, task_id, body.expectedVersion)
    source, target = TaskState(task.status), body.target_status
    action = EVENTS.get((source, target))
    if action is None:
        raise TicketCommandRejected(409, "INVALID_TASK_TRANSITION")
    if target == TaskState.CANCELLED and actor.role not in MANAGEMENT:
        raise TicketCommandRejected(403, "FORBIDDEN")
    allowed_performer(actor, task)
    if (
        target in (TaskState.BLOCKED, TaskState.CANCELLED)
        or source == TaskState.BLOCKED
    ) and not body.reason:
        raise TicketCommandRejected(422, "REASON_REQUIRED")
    if body.reason and chr(0) in body.reason:
        raise TicketCommandRejected(422, "INVALID_REASON")
    if target != TaskState.DONE and (
        body.remaining_minutes is not None or body.result is not None
    ):
        raise TicketCommandRejected(422, "UNEXPECTED_PROGRESS")

    now = read_utc(clock)
    existing = active_slots(db, task)
    if target in (TaskState.READY, TaskState.IN_PROGRESS):
        assert_dependencies_done(db, task)
        if task.assignee_id is None or task.remaining_minutes <= 0 or not existing:
            raise TicketCommandRejected(409, "ALLOCATION_REQUIRED")
        validate_reservation(
            db,
            task,
            task.assignee_id,
            [
                Interval(starts_at=row.starts_at, ends_at=row.ends_at)
                for row in existing
            ],
            task.remaining_minutes,
            now,
            existing,
        )
    elif target == TaskState.CANCELLED:
        assert_cancel_can_proceed(db, task)
    elif target == TaskState.DONE:
        remaining = (
            task.remaining_minutes
            if body.remaining_minutes is None
            else body.remaining_minutes
        )
        result = task.result if body.result is None else body.result
        if remaining != 0 or not valid_human_result(result):
            raise TicketCommandRejected(422, "INCOMPLETE_TASK_RESULT")
        task.remaining_minutes = remaining
        task.result = result

    before = SafeFacts(
        version=task.version, assignee_id=task.assignee_id, status=source
    )
    task.status = target.value
    task.version += 1
    if target in (TaskState.DONE, TaskState.CANCELLED) and existing:
        assert task.assignee_id is not None
        lock_allocation_rows(db, task.assignee_id, {}, existing)
        replace_slots(db, task, task.assignee_id, {}, existing, now)
    db.add(
        TaskTransitionRecord(
            task_id=task.id,
            version=task.version,
            previous_status=source.value,
            status=target.value,
            reason=body.reason,
        )
    )
    record_task_effect(
        db, actor, task, before, now, action, reason=bool(body.reason), status=target
    )
    return CommandResult(task.id, task.version)
