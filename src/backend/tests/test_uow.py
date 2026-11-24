from datetime import UTC, datetime
from enum import StrEnum
from uuid import uuid4

import pytest
from sqlalchemy import (
    Column,
    Integer,
    MetaData,
    String,
    Table,
    Uuid,
    func,
    insert,
    select,
)
from sqlalchemy.orm import Session

from app.infrastructure.database import Database
from app.infrastructure.events import (
    Actor,
    SafeFacts,
    Target,
    enqueue_event,
    write_audit,
)
from app.infrastructure.models import AuditLog, DomainEvent, OutboxDelivery


class Status(StrEnum):
    NEW = "New"


@pytest.mark.parametrize("fail_after_flush", [True, False])
def test_domain_audit_and_outbox_share_one_transaction(
    database: Database, fail_after_flush: bool
) -> None:
    records = Table(
        "fixture_domain",
        MetaData(),
        Column("id", Uuid, primary_key=True),
        Column("version", Integer, nullable=False),
        Column("private_note", String, nullable=False),
    )
    records.create(database.engine)
    actor = Actor("user", uuid4())
    target = Target("fixture", uuid4())
    uid = uuid4()
    when = datetime(2026, 11, 25, tzinfo=UTC)

    def write(session: Session) -> None:
        session.execute(
            insert(records).values(id=target.id, version=1, private_note="private")
        )
        facts = SafeFacts(version=1, status=Status.NEW)
        write_audit(
            session,
            actor=actor,
            action="created",
            target=target,
            before=SafeFacts(),
            after=facts,
            clock=lambda: when,
        )
        enqueue_event(
            session,
            actor=actor,
            target=target,
            event_type="fixture.created",
            schema_version=1,
            aggregate_version=1,
            correlation_id=uid,
            handlers=("notifications", "evaluation"),
            facts=facts,
            clock=lambda: when,
        )
        session.flush()
        with database.session() as reader:
            for table in (records, AuditLog, DomainEvent, OutboxDelivery):
                assert reader.scalar(select(func.count()).select_from(table)) == 0
        if fail_after_flush:
            raise RuntimeError("injected failure")

    if fail_after_flush:
        with (
            pytest.raises(RuntimeError, match="injected failure"),
            database.transaction() as session,
        ):
            write(session)
    else:
        with database.transaction() as session:
            write(session)

    with database.session() as session:
        expected = 0 if fail_after_flush else 1
        for table in (records, AuditLog, DomainEvent):
            assert session.scalar(select(func.count()).select_from(table)) == expected
        assert (
            session.scalar(select(func.count()).select_from(OutboxDelivery))
            == 2 * expected
        )
        if not fail_after_flush:
            audit = session.scalars(select(AuditLog)).one()
            event = session.scalars(select(DomainEvent)).one()
            deliveries = session.scalars(select(OutboxDelivery)).all()
            assert audit.occurred_at == event.occurred_at == when
            assert (
                audit.before_after_redacted["after"]
                == event.payload
                == {
                    "active": None,
                    "version": 1,
                    "assignee_id": None,
                    "status": "New",
                }
            )
            assert event.correlation_id == uid
            assert all(
                row.event_id == event.id and row.delivered_at is None
                for row in deliveries
            )
