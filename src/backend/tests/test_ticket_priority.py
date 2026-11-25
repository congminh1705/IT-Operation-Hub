from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from fastapi.testclient import TestClient
from sqlalchemy import select, update
from test_organization import ORIGIN, SETTINGS, actor
from test_ticket_intake import prepare_catalog
from test_ticket_lifecycle import command
from test_ticket_reads import TICKETS, create_ticket

from app.infrastructure.database import Database
from app.main import create_app
from app.modules.auth.models import AuthSession
from app.modules.auth.service import AuthService
from app.modules.sla.policy import PolicyRevision
from app.modules.tickets.models import Ticket, TicketPriorityAdjustment, TicketSLABreach


def test_priority_adjustments_keep_original_budget_and_breaches(
    database: Database,
) -> None:
    category, _ = prepare_catalog(database)
    now = datetime.now(UTC)
    app = create_app(AuthService(database, clock=lambda: now), SETTINGS)
    requester, manager, tech = (TestClient(app, base_url=ORIGIN) for _ in range(3))
    _, owner_headers = actor(database, requester, "REQUESTER")
    _, manager_headers = actor(database, manager, "IT_MANAGER")
    _, tech_headers = actor(database, tech, "TECHNICIAN")
    original = create_ticket(requester, owner_headers, category, "Priority budget")
    ticket_id = UUID(original["id"])
    url = f"{TICKETS}/{ticket_id}/priority"
    with database.transaction() as db:
        db.execute(
            update(AuthSession).values(
                idle_until=now + timedelta(days=2), expires_at=now + timedelta(days=2)
            )
        )
        row = db.get(Ticket, ticket_id)
        assert row is not None
        old_policy = row.sla_snapshot
        db.add(
            PolicyRevision(
                id=uuid4(),
                version=2,
                priority_budgets={
                    **old_policy,
                    "P3": {**old_policy["P3"], "resolution_seconds": 43200},
                },
                reason="Changed future defaults",
            )
        )
        row.first_response_at = now + timedelta(minutes=20)
        row.response_used_seconds = 1200

    def change(client, headers, version, priority, reason="Updated business impact"):
        return command(
            client,
            url,
            headers,
            {
                "priority": priority,
                "expectedVersion": version,
                "reason": reason,
            },
        )

    now += timedelta(minutes=20)
    assert change(requester, owner_headers, 1, "P1").status_code == 403
    assert change(tech, tech_headers, 1, "P1").status_code == 403
    assert change(manager, manager_headers, 1, "P1", "   ").status_code == 422
    assert change(manager, manager_headers, 1, "P3").status_code == 200
    fresh = create_ticket(requester, owner_headers, category, "New SLA default")
    now += timedelta(hours=2, minutes=40)
    result = change(manager, manager_headers, 2, "P1")
    assert result.status_code == 200, result.text
    assert result.json()["sla"]["response_used_seconds"] == 1200
    assert result.json()["sla"]["resolution_used_seconds"] == 0
    assert change(manager, manager_headers, 2, "P3").status_code == 409
    with database.session() as db:
        adjustment = db.get(TicketPriorityAdjustment, (ticket_id, 2))
        assert (
            adjustment is not None and adjustment.resolution_elapsed_seconds == 3 * 3600
        )
        assert (
            old_policy["P1"]["resolution_seconds"]
            - adjustment.resolution_elapsed_seconds
            == 3600
        )
        breach = db.get(TicketSLABreach, (ticket_id, 2, "response"))
        assert (
            breach is not None
            and breach.budget_seconds == 900
            and breach.detected_at == now
        )
        assert db.get(TicketSLABreach, (ticket_id, 2, "resolution")) is None
    now += timedelta(hours=2)
    assert change(manager, manager_headers, 3, "P3").status_code == 200
    with database.session() as db:
        history = list(
            db.scalars(
                select(TicketSLABreach).where(TicketSLABreach.ticket_id == ticket_id)
            )
        )
        assert {(item.adjustment_revision, item.clock_type) for item in history} == {
            (2, "response"),
            (2, "resolution"),
        }
        adjustment = db.get(TicketPriorityAdjustment, (ticket_id, 3))
        row = db.get(Ticket, ticket_id)
        new_ticket = db.get(Ticket, UUID(fresh["id"]))
        assert adjustment is not None and row is not None and new_ticket is not None
        assert (
            row.sla_snapshot["P3"]["resolution_seconds"]
            - adjustment.resolution_elapsed_seconds
            == 19 * 3600
        )
        assert new_ticket.sla_snapshot["P3"]["resolution_seconds"] == 12 * 3600
        assert row.first_response_at == row.created_at + timedelta(minutes=20)
        assert row.adjustment_revision == 3 and row.sla_policy_version == 1
