import hashlib
import json
from collections.abc import Callable
from dataclasses import dataclass
from uuid import UUID

from sqlalchemy import Table, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.infrastructure.clock import Clock, read_utc, utc_now
from app.infrastructure.database import Database
from app.infrastructure.models import ConfirmedCommand

type JsonValue = (
    None | bool | int | float | str | list[JsonValue] | dict[str, JsonValue]
)


class VersionConflict(Exception):
    """The authorized write cannot apply to the expected version."""


class IdempotencyConflict(Exception):
    """An existing key is bound to a different request."""


@dataclass(frozen=True)
class CommandResult:
    id: UUID
    version: int

    def __post_init__(self) -> None:
        if self.version < 1:
            raise ValueError("Result version must be positive.")


def bump_expected_version(
    session: Session, table: Table, *, record_id: UUID, expected_version: int
) -> int:
    """Compare and bump atomically on an already authorized record."""
    if expected_version < 1:
        raise ValueError("Expected version must be positive.")
    version = table.c.version
    applied = session.scalar(
        update(table)
        .where(table.c.id == record_id, version == expected_version)
        .values(version=version + 1)
        .returning(version)
    )
    if not isinstance(applied, int):
        raise VersionConflict("Record version has changed.")
    return applied


def run_idempotent(
    database: Database,
    *,
    actor_id: UUID,
    operation: str,
    key: str,
    payload: dict[str, JsonValue],
    authorize: Callable[[Session, CommandResult | None], None],
    execute: Callable[[Session], CommandResult],
    clock: Clock = utc_now,
) -> CommandResult:
    """Own one transaction. The caller supplies normalized, validated non-secret data.

    Authorization checks the requested command, then the exact stored result on replay.
    Execute may stage domain/audit/outbox rows using this Session.
    """
    if (
        not key.strip()
        or len(key) > 128
        or not operation.strip()
        or len(operation) > 80
    ):
        raise ValueError("Invalid command scope or key.")
    encoded = json.dumps(
        payload,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
        allow_nan=False,
    ).encode("utf-8")
    digest = hashlib.sha256(encoded).hexdigest()

    with database.transaction() as session:
        authorize(session, None)
        inserted = session.scalar(
            insert(ConfirmedCommand)
            .values(
                actor_id=actor_id,
                operation=operation,
                key=key,
                request_digest=digest,
                created_at=read_utc(clock),
            )
            .on_conflict_do_nothing(
                index_elements=[
                    ConfirmedCommand.actor_id,
                    ConfirmedCommand.operation,
                    ConfirmedCommand.key,
                ]
            )
            .returning(ConfirmedCommand.actor_id)
        )
        row = session.get(ConfirmedCommand, (actor_id, operation, key))
        if row is None:
            raise RuntimeError("Command outcome is unavailable.")
        if inserted is not None:
            authorize(session, None)
            result = execute(session)
            row.result_id = result.id
            row.result_version = result.version
            return result
        if row.request_digest != digest:
            raise IdempotencyConflict("Command key was already used.")
        if row.result_id is None or row.result_version is None:
            raise RuntimeError("Committed command has no outcome.")
        result = CommandResult(row.result_id, row.result_version)
        authorize(session, result)
        return result
