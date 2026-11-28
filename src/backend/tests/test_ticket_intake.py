from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4

import pytest
from pydantic import ValidationError
from sqlalchemy import text

from app.infrastructure.database import Database
from app.modules.organization.models import Team
from app.modules.tickets.categories import TicketCategory
from app.modules.tickets.intake import (
    IntakeRejected,
    TicketCreate,
    derive_intake,
    next_ticket_code,
)


def prepare_catalog(database: Database, *, intake: bool = True) -> tuple[str, str]:
    category, team = uuid4(), uuid4()
    with database.transaction() as db:
        db.add(
            TicketCategory(
                id=category,
                code=category.hex,
                name="Network",
                name_key="network",
                active=True,
                version=1,
            )
        )
        db.add(
            Team(
                id=team,
                name="Intake",
                name_key="intake",
                active=True,
                intake=intake,
                version=1,
            )
        )
    return str(category), str(team)


def ticket_payload(category: str) -> dict[str, str]:
    return {
        "title": "Network outage",
        "description": "Synthetic network incident",
        "type": "INCIDENT",
        "category_id": category,
        "impact": "HIGH",
        "urgency": "MEDIUM",
    }


def test_intake_uses_validated_input_and_server_owned_configuration(
    database: Database,
) -> None:
    category, team = prepare_catalog(database)
    payload = ticket_payload(category)
    for forged in ("requester_id", "priority", "team_id", "code", "asset_id", "files"):
        with pytest.raises(ValidationError):
            TicketCreate.model_validate({**payload, forged: str(uuid4())})
    with pytest.raises(ValidationError):
        TicketCreate.model_validate(
            {**payload, "workflow_context": {"deadline": "2026-11-25T09:00:00"}}
        )
    with pytest.raises(ValidationError):
        TicketCreate.model_validate({**payload, "description": "     "})
    actor = uuid4()
    with database.transaction() as db:
        facts = derive_intake(db, actor, TicketCreate.model_validate(payload))
        assert facts.requester_id == actor and str(facts.team_id) == team
        assert facts.priority == "P2" and facts.sla_policy.version == 1


def test_intake_rejects_missing_intake_category_and_sla(database: Database) -> None:
    category, _ = prepare_catalog(database, intake=False)
    body = TicketCreate.model_validate(ticket_payload(category))
    with (
        database.transaction() as db,
        pytest.raises(IntakeRejected, match="INTAKE_UNAVAILABLE"),
    ):
        derive_intake(db, uuid4(), body)
    with database.transaction() as db:
        db.execute(text("UPDATE org_team SET intake=true"))
        db.execute(text("UPDATE ticket_category SET active=false"))
    with (
        database.transaction() as db,
        pytest.raises(IntakeRejected, match="CATEGORY_UNAVAILABLE"),
    ):
        derive_intake(db, uuid4(), body)
    with database.transaction() as db:
        db.execute(text("UPDATE ticket_category SET active=true"))
        db.execute(
            text(
                "ALTER TABLE sla_policy_revision DISABLE TRIGGER sla_revision_append_only"
            )
        )
        db.execute(text("DELETE FROM sla_policy_revision"))
    with (
        database.transaction() as db,
        pytest.raises(IntakeRejected, match="SLA_POLICY_UNAVAILABLE"),
    ):
        derive_intake(db, uuid4(), body)


def test_ticket_code_sequence_is_unique_across_parallel_sessions(
    database: Database,
) -> None:
    def reserve(_: int) -> str:
        with database.transaction() as db:
            return next_ticket_code(db)

    with ThreadPoolExecutor(max_workers=4) as pool:
        codes = list(pool.map(reserve, range(16)))
    assert len(set(codes)) == 16
    assert all(code.startswith("TKT-") and code[4:].isdigit() for code in codes)


def test_ticket_api_persists_snapshot_and_outbox_atomically(database: Database) -> None:
    from datetime import UTC, datetime

    from fastapi.testclient import TestClient
    from sqlalchemy import func, select
    from sqlalchemy.exc import IntegrityError
    from test_organization import ORIGIN, SETTINGS, actor

    from app.infrastructure.models import (
        AuditLog,
        ConfirmedCommand,
        DomainEvent,
        OutboxDelivery,
    )
    from app.main import create_app
    from app.modules.auth.service import AuthService
    from app.modules.tickets.models import Ticket

    category, team = prepare_catalog(database)
    instant = datetime(2026, 11, 25, 5, 1, tzinfo=UTC)
    app = create_app(AuthService(database, lambda: instant), SETTINGS)
    with TestClient(app, base_url=ORIGIN) as client:
        requester, headers = actor(database, client, "REQUESTER")
        base = "/api/v1/tickets"
        payload = ticket_payload(category)
        command = {**headers, "Idempotency-Key": "new-ticket"}
        assert (
            client.post(
                base, json={**payload, "requester_id": str(uuid4())}, headers=command
            ).status_code
            == 422
        )
        assert (
            client.post(
                base, json=payload, headers={**command, "X-CSRF-Token": "invalid"}
            ).status_code
            == 403
        )
        created = client.post(base, json=payload, headers=command)
        assert created.status_code == 201
        view = created.json()
        assert view["status"] == "New" and view["priority"] == "P2"
        assert view["team_id"] == team and view["requester_id"] == str(requester)
        assert view["sla"] == {
            "response_used_seconds": 0,
            "resolution_used_seconds": 0,
            "resolution_paused": False,
            "adjustment_revision": 0,
            "first_response_at": None,
        }
        assert client.post(base, json=payload, headers=command).json() == view
        changed = client.post(
            base, json={**payload, "title": "Modified title"}, headers=command
        )
        assert changed.status_code == 409
        identifier = view["id"]

    with database.session() as db:
        from uuid import UUID

        ticket = db.get(Ticket, UUID(identifier))
        assert ticket is not None and ticket.sla_policy_version == 1
        assert ticket.created_at == instant and ticket.resolution_started_at == instant
        assert set(ticket.sla_snapshot) == {"P1", "P2", "P3", "P4"}
        assert ticket.sla_snapshot["P3"]["resolution_seconds"] == 86400
        event = db.scalar(
            select(DomainEvent).where(DomainEvent.aggregate_id == ticket.id)
        )
        assert (
            event is not None
            and event.event_type == "ticket.created"
            and event.occurred_at == instant
        )
        assert "Network" not in str(event.payload) and "Synthetic" not in str(
            event.payload
        )
        assert (
            db.scalar(
                select(func.count())
                .select_from(OutboxDelivery)
                .where(OutboxDelivery.event_id == event.id)
            )
            == 2
        )
        assert (
            db.scalar(
                select(func.count())
                .select_from(AuditLog)
                .where(AuditLog.target_id == ticket.id)
            )
            == 1
        )
        assert (
            db.scalar(
                select(func.count())
                .select_from(ConfirmedCommand)
                .where(ConfirmedCommand.result_id == ticket.id)
            )
            == 1
        )
    with pytest.raises(IntegrityError, match="immutable"), database.transaction() as db:
        db.execute(text("UPDATE ticket SET sla_snapshot = '{}'::jsonb"))


def test_failed_outbox_rolls_back_ticket_and_command(
    database: Database, monkeypatch: pytest.MonkeyPatch
) -> None:
    from fastapi.testclient import TestClient
    from sqlalchemy import func, select
    from sqlalchemy.exc import SQLAlchemyError
    from sqlalchemy.orm import Session
    from test_organization import ORIGIN, SETTINGS, actor

    from app.infrastructure.models import (
        AuditLog,
        ConfirmedCommand,
        DomainEvent,
        OutboxDelivery,
    )
    from app.main import create_app
    from app.modules.auth.service import AuthService
    from app.modules.tickets import service
    from app.modules.tickets.models import Ticket

    category, _ = prepare_catalog(database)
    with TestClient(
        create_app(AuthService(database), SETTINGS), base_url=ORIGIN
    ) as client:
        _, headers = actor(database, client, "REQUESTER")
        command = {**headers, "Idempotency-Key": "retry-ticket"}
        payload = ticket_payload(category)

        def fail(db: Session, **kwargs: object) -> None:
            db.flush()
            raise SQLAlchemyError("synthetic unavailable outbox")

        with monkeypatch.context() as patch:
            patch.setattr(service, "enqueue_event", fail)
            assert (
                client.post(
                    "/api/v1/tickets", json=payload, headers=command
                ).status_code
                == 503
            )
        with database.session() as db:
            for model in (
                Ticket,
                ConfirmedCommand,
                AuditLog,
                DomainEvent,
                OutboxDelivery,
            ):
                assert db.scalar(select(func.count()).select_from(model)) == 0
        assert (
            client.post("/api/v1/tickets", json=payload, headers=command).status_code
            == 201
        )
