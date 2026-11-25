from datetime import UTC, datetime, timedelta, timezone
from uuid import uuid4

import pytest
from sqlalchemy import inspect

from app.infrastructure.clock import read_utc
from app.infrastructure.database import Database
from app.infrastructure.models import AuditLog


def test_empty_schema_migrates_and_distinct_sessions_see_commit(
    database: Database,
) -> None:
    assert {"audit_log", "domain_event", "outbox_delivery"} <= set(
        inspect(database.engine).get_table_names()
    )
    log_id = uuid4()
    with database.session() as reader, database.transaction() as writer:
        assert writer is not reader
        writer.add(
            AuditLog(
                id=log_id,
                actor_type="user",
                actor_id=uuid4(),
                action="test",
                target_type="test",
                target_id=uuid4(),
                occurred_at=datetime.now(UTC),
                before_after_redacted={},
            )
        )
        writer.flush()
        assert reader.get(AuditLog, log_id) is None
    database.engine.dispose()
    with database.session() as session:
        assert session.get(AuditLog, log_id) is not None


def test_injected_clock_normalizes_timezone_and_rejects_naive() -> None:
    local = datetime(2026, 11, 25, 7, tzinfo=timezone(timedelta(hours=7)))
    assert read_utc(lambda: local) == datetime(2026, 11, 25, tzinfo=UTC)
    with pytest.raises(ValueError):
        read_utc(lambda: local.replace(tzinfo=None))
