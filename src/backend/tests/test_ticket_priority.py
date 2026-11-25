from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from fastapi.testclient import TestClient
from sqlalchemy import select, update
from test_organization import ORIGIN, SETTINGS, actor
from test_ticket_intake import prepare_catalog
from test_ticket_lifecycle import command
from test_ticket_reads import TICKETS, create_ticket

from app.infrastructure.database import Database
from app.infrastructure.models import DomainEvent
from app.main import create_app
from app.modules.auth.models import AuthSession
from app.modules.auth.service import AuthService
from app.modules.organization.models import Team, TeamMember
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


def test_timeline_filters_before_paging_and_rechecks_team(database: Database) -> None:
    category, initial_team = prepare_catalog(database)
    now = datetime.now(UTC)
    app = create_app(AuthService(database, clock=lambda: now), SETTINGS)
    requester, admin, old_tech, new_tech = (
        TestClient(app, base_url=ORIGIN) for _ in range(4)
    )
    requester_id, owner_headers = actor(database, requester, "REQUESTER")
    admin_id, admin_headers = actor(database, admin, "ADMIN")
    old_id, _ = actor(database, old_tech, "TECHNICIAN")
    new_id, _ = actor(database, new_tech, "TECHNICIAN")
    new_team = uuid4()
    ticket = create_ticket(requester, owner_headers, category, "Timeline")
    ticket_id = UUID(ticket["id"])
    detail = f"{TICKETS}/{ticket_id}"
    url = detail + "/events"
    with database.transaction() as db:
        db.add(
            Team(
                id=new_team,
                name="Next team",
                name_key="next-team",
                active=True,
                intake=False,
                version=1,
            )
        )
        db.flush()
        db.add_all(
            [
                TeamMember(team_id=UUID(initial_team), account_id=old_id, active=True),
                TeamMember(team_id=new_team, account_id=new_id, active=True),
            ]
        )
        db.add(
            DomainEvent(
                id=uuid4(),
                event_type="ticket.internal_note",
                schema_version=1,
                aggregate_type="ticket",
                aggregate_id=ticket_id,
                aggregate_version=1,
                actor_type="user",
                actor_id=admin_id,
                correlation_id=ticket_id,
                occurred_at=now,
                payload={"safe_summary": "SECRET metadata"},
            )
        )
    note = command(
        admin,
        detail + "/comments",
        admin_headers,
        {
            "content": "PRIVATE NOTE",
            "visibility": "INTERNAL",
        },
    )
    assert note.status_code == 201
    accepted = command(
        admin,
        detail + "/transitions",
        admin_headers,
        {
            "target_status": "Open",
            "expectedVersion": 1,
        },
    )
    assert accepted.status_code == 200
    priority = command(
        admin,
        detail + "/priority",
        admin_headers,
        {
            "priority": "P1",
            "expectedVersion": 2,
            "reason": "Internal decision about impact",
        },
    )
    assert priority.status_code == 200
    assert new_tech.get(url).status_code == 404
    assert old_tech.get(url).status_code == 200
    assigned = command(
        admin,
        detail + "/assignment",
        admin_headers,
        {
            "team_id": str(new_team),
            "assignee_id": str(new_id),
            "expectedVersion": 3,
            "reason": "Transfer to specialist team",
        },
    )
    assert assigned.status_code == 200
    assert old_tech.get(url).status_code == 404
    assert requester.get(f"{TICKETS}/{uuid4()}/events").status_code == 404
    assert requester.get(url + "?page_size=101").status_code == 422
    public = requester.get(url).json()
    assert public["total"] == 3
    assert [item["id"] for item in public["items"]] == sorted(
        item["id"] for item in public["items"]
    )
    assert all(
        item["occurred_at"] == public["items"][0]["occurred_at"]
        for item in public["items"]
    )
    for page, expected in enumerate(public["items"], start=1):
        response = requester.get(url, params={"page": page, "page_size": 1}).json()
        assert response["total"] == 3 and response["items"] == [expected]
        assert expected["visibility"] == "PUBLIC"
        assert {"actor_id", "reason", "assignee_id"}.isdisjoint(expected)
    internal = new_tech.get(url).json()
    assert internal["total"] == 4
    events = {item["event_type"]: item for item in internal["items"]}
    assert events["ticket.created"]["actor_id"] == str(requester_id)
    assert events["ticket.accepted"]["previous_status"] == "New"
    assert events["ticket.accepted"]["status"] == "Open"
    priority_event = events["ticket.priority_changed"]
    assert (priority_event["previous_priority"], priority_event["priority"]) == (
        "P2",
        "P1",
    )
    assert priority_event["reason"] == "Internal decision about impact"
    assignment = events["ticket.assigned"]
    assert assignment["reason"] == "Transfer to specialist team"
    assert assignment["previous_team_id"] == initial_team
    assert assignment["team_id"] == str(new_team)
    assert assignment["assignee_id"] == str(new_id)
    assert "PRIVATE NOTE" not in str(internal) and "SECRET metadata" not in str(
        internal
    )
