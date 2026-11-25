from dataclasses import dataclass
from enum import StrEnum
from uuid import UUID, uuid4

from sqlalchemy.orm import Session

from app.infrastructure.clock import Clock, read_utc, utc_now
from app.infrastructure.models import AuditLog, DomainEvent, OutboxDelivery, Scalar


@dataclass(frozen=True)
class Actor:
    kind: str
    id: UUID


@dataclass(frozen=True)
class Target:
    kind: str
    id: UUID


@dataclass(frozen=True)
class SafeFacts:
    """Projection of structured facts only. Never pass raw request or entity data."""

    active: bool | None = None
    version: int | None = None
    assignee_id: UUID | None = None
    status: StrEnum | None = None
    previous_status: StrEnum | None = None
    verification_id: UUID | None = None
    approval_id: UUID | None = None
    team_id: UUID | None = None
    previous_team_id: UUID | None = None
    previous_assignee_id: UUID | None = None
    reason_provided: bool | None = None
    priority: str | None = None
    previous_priority: str | None = None

    def project(self) -> dict[str, Scalar]:
        result: dict[str, Scalar] = {
            "active": self.active,
            "version": self.version,
            "assignee_id": str(self.assignee_id)
            if self.assignee_id is not None
            else None,
            "status": self.status.value if self.status is not None else None,
        }
        if self.verification_id is not None:
            result["verification_id"] = str(self.verification_id)
        if self.approval_id is not None:
            result["approval_id"] = str(self.approval_id)
        if self.team_id is not None:
            result["team_id"] = str(self.team_id)
        if self.previous_team_id is not None:
            result["previous_team_id"] = str(self.previous_team_id)
            result["previous_assignee_id"] = (
                str(self.previous_assignee_id) if self.previous_assignee_id else None
            )
        if self.reason_provided is not None:
            result["reason_provided"] = self.reason_provided
        if self.priority is not None:
            result["priority"] = self.priority
        if self.previous_priority is not None:
            result["previous_priority"] = self.previous_priority
        if self.previous_status is not None:
            result["previous_status"] = self.previous_status.value
        return result


def write_audit(
    session: Session,
    *,
    actor: Actor,
    action: str,
    target: Target,
    before: SafeFacts,
    after: SafeFacts,
    clock: Clock = utc_now,
) -> UUID:
    entry = AuditLog(
        id=uuid4(),
        actor_type=actor.kind,
        actor_id=actor.id,
        action=action,
        target_type=target.kind,
        target_id=target.id,
        occurred_at=read_utc(clock),
        before_after_redacted={"before": before.project(), "after": after.project()},
    )
    session.add(entry)
    return entry.id


def enqueue_event(
    session: Session,
    *,
    actor: Actor,
    target: Target,
    event_type: str,
    schema_version: int,
    aggregate_version: int,
    correlation_id: UUID,
    handlers: tuple[str, ...],
    facts: SafeFacts = SafeFacts(),
    causation_id: UUID | None = None,
    clock: Clock = utc_now,
) -> UUID:
    """Persist delivery intent in the caller's transaction, with no broker call."""
    if not handlers or any(not handler.strip() for handler in handlers):
        raise ValueError("At least one named delivery handler is required.")
    if len(set(handlers)) != len(handlers):
        raise ValueError("Each delivery handler must be unique.")
    occurred_at = read_utc(clock)
    event_id = uuid4()
    session.add(
        DomainEvent(
            id=event_id,
            event_type=event_type,
            schema_version=schema_version,
            aggregate_type=target.kind,
            aggregate_id=target.id,
            aggregate_version=aggregate_version,
            occurred_at=occurred_at,
            actor_type=actor.kind,
            actor_id=actor.id,
            correlation_id=correlation_id,
            causation_id=causation_id,
            payload=facts.project(),
        )
    )
    session.flush()
    session.add_all(
        [
            OutboxDelivery(
                id=uuid4(),
                event_id=event_id,
                handler_purpose=handler,
                attempt=0,
                available_at=occurred_at,
            )
            for handler in handlers
        ]
    )
    return event_id
