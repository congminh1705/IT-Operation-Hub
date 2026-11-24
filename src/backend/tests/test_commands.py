from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime
from threading import Barrier
from uuid import uuid4

import pytest
from conftest import migrate_database
from sqlalchemy import Column, Integer, MetaData, Table, Uuid, func, insert, select
from sqlalchemy.orm import Session

from app.infrastructure.commands import (
    CommandResult,
    IdempotencyConflict,
    VersionConflict,
    bump_expected_version,
    run_idempotent,
)
from app.infrastructure.database import Database
from app.infrastructure.models import AuditLog, ConfirmedCommand


def fixture_table(database: Database) -> Table:
    records = Table(
        "fixture_versioned",
        MetaData(),
        Column("id", Uuid, primary_key=True),
        Column("version", Integer, nullable=False),
    )
    records.create(database.engine)
    return records


def test_upgrade_from_foundation_preserves_rows(empty_database: Database) -> None:
    migrate_database(empty_database, "0001_foundation")
    audit_id = uuid4()
    with empty_database.transaction() as session:
        session.add(
            AuditLog(
                id=audit_id,
                actor_type="user",
                actor_id=uuid4(),
                action="test",
                target_type="fixture",
                target_id=uuid4(),
                occurred_at=datetime.now(UTC),
                before_after_redacted={},
            )
        )
    migrate_database(empty_database)
    with empty_database.session() as session:
        assert session.get(AuditLog, audit_id) is not None
        assert session.scalar(select(func.count()).select_from(ConfirmedCommand)) == 0


def test_two_writers_with_same_version_one_conflicts(database: Database) -> None:
    records = fixture_table(database)
    record_id = uuid4()
    with database.transaction() as session:
        session.execute(insert(records).values(id=record_id, version=1))
    ready = Barrier(2, timeout=5)

    def write() -> int | str:
        try:
            with database.transaction() as session:
                ready.wait()
                return bump_expected_version(
                    session, records, record_id=record_id, expected_version=1
                )
        except VersionConflict:
            return "conflict"

    with ThreadPoolExecutor(max_workers=2) as pool:
        first, second = pool.submit(write), pool.submit(write)
        assert {first.result(timeout=10), second.result(timeout=10)} == {2, "conflict"}
    with database.session() as session:
        assert session.scalar(select(records.c.version)) == 2


def test_concurrent_commands_replay_same_body_and_reject_changes(
    database: Database,
) -> None:
    records = fixture_table(database)
    actor = uuid4()
    barrier = Barrier(2, timeout=5)

    def authorize(session: Session, result: CommandResult | None) -> None:
        if result is not None:
            assert (
                session.scalar(select(records.c.id).where(records.c.id == result.id))
                == result.id
            )

    def execute(session: Session) -> CommandResult:
        record_id = uuid4()
        session.execute(insert(records).values(id=record_id, version=1))
        return CommandResult(record_id, 1)

    def command(value: int) -> CommandResult:
        return run_idempotent(
            database,
            actor_id=actor,
            operation="fixture.create",
            key="same-key",
            payload={"value": value},
            authorize=authorize,
            execute=execute,
        )

    def submit() -> CommandResult:
        barrier.wait()
        return command(1)

    with ThreadPoolExecutor(max_workers=2) as pool:
        first, second = pool.submit(submit), pool.submit(submit)
        result = first.result(timeout=10)
        assert second.result(timeout=10) == result
    assert command(1) == result
    with pytest.raises(IdempotencyConflict, match="already used"):
        command(2)

    def deny_replay(_session: Session, seen: CommandResult | None) -> None:
        if seen is not None:
            raise PermissionError("revoked")

    with pytest.raises(PermissionError, match="revoked"):
        run_idempotent(
            database,
            actor_id=actor,
            operation="fixture.create",
            key="same-key",
            payload={"value": 1},
            authorize=deny_replay,
            execute=execute,
        )

    def fail(session: Session) -> CommandResult:
        execute(session)
        raise RuntimeError("write interrupted")

    with pytest.raises(RuntimeError, match="write interrupted"):
        run_idempotent(
            database,
            actor_id=actor,
            operation="fixture.create",
            key="rollback",
            payload={"value": 1},
            authorize=authorize,
            execute=fail,
        )
    with database.session() as session:
        assert session.scalar(select(func.count()).select_from(records)) == 1
        assert session.scalar(select(func.count()).select_from(ConfirmedCommand)) == 1
