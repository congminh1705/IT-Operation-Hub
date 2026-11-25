from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime, timedelta
from threading import Barrier
from uuid import UUID, uuid4

from fastapi.testclient import TestClient
from sqlalchemy import select
from test_organization import ORIGIN, SETTINGS, actor
from test_ticket_intake import prepare_catalog
from test_ticket_reads import TICKETS, create_ticket

from app.infrastructure.database import Database
from app.infrastructure.models import DomainEvent
from app.main import create_app
from app.modules.auth.service import AuthService
from app.modules.organization.models import Team, TeamMember
from app.modules.tickets.models import Ticket


def test_management_assigns_and_transfers_without_resetting_sla(
    database: Database,
) -> None:
    category, team = prepare_catalog(database)
    app = create_app(AuthService(database), SETTINGS)
    manager, admin, technician = (TestClient(app, base_url=ORIGIN) for _ in range(3))
    _, manager_headers = actor(database, manager, "IT_MANAGER")
    _, admin_headers = actor(database, admin, "ADMIN")
    tech, tech_headers = actor(database, technician, "TECHNICIAN")
    ticket = create_ticket(technician, tech_headers, category, "Assignment test")
    ticket_id = UUID(ticket["id"])
    url = f"{TICKETS}/{ticket_id}/assignment"
    other = uuid4()
    with database.transaction() as db:
        db.add(
            Team(
                id=other,
                name="Other",
                name_key="other",
                active=True,
                intake=False,
                version=1,
            )
        )
        db.flush()
        db.add(TeamMember(team_id=UUID(team), account_id=tech, active=True))

    def assign(client: TestClient, headers: dict, **changes: object):
        return client.post(
            url,
            json={
                "team_id": team,
                "assignee_id": str(tech),
                "reason": "Staffing change",
                "expectedVersion": 1,
                **changes,
            },
            headers={**headers, "Idempotency-Key": str(uuid4())},
        )

    assert assign(technician, tech_headers, assignee_id=str(uuid4())).status_code == 403
    assert assign(manager, manager_headers, reason="    ").status_code == 422
    assert (
        assign(manager, manager_headers, team_id=str(uuid4())).json()["code"]
        == "INELIGIBLE_TEAM"
    )
    assert (
        assign(manager, manager_headers, team_id=str(other)).json()["code"]
        == "INELIGIBLE_ASSIGNEE"
    )
    assigned = assign(manager, manager_headers)
    assert assigned.status_code == 200, assigned.text
    assert assigned.json()["assignee_id"] == str(tech)
    assert assigned.json()["sla"] == ticket["sla"]
    assert assign(manager, manager_headers).json()["code"] == "STALE_VERSION"

    for version, status in ((2, "In Progress"), (3, "Pending")):
        with database.transaction() as db:
            row = db.get(Ticket, ticket_id)
            assert row is not None
            row.status = status
            db.merge(TeamMember(team_id=other, account_id=tech, active=True))
        denied = assign(
            admin,
            admin_headers,
            team_id=str(other),
            assignee_id=None,
            expectedVersion=version,
        )
        assert (
            denied.status_code == 409 and denied.json()["code"] == "ASSIGNEE_REQUIRED"
        )
        moved = assign(
            admin, admin_headers, team_id=str(other), expectedVersion=version
        )
        assert moved.status_code == 200, moved.text
        assert moved.json()["team_id"] == str(other)
        assert moved.json()["status"] == status and moved.json()["sla"] == ticket["sla"]
    with database.session() as db:
        events = list(
            db.scalars(
                select(DomainEvent)
                .where(
                    DomainEvent.aggregate_id == ticket_id,
                    DomainEvent.event_type == "ticket.assigned",
                )
                .order_by(DomainEvent.aggregate_version)
            )
        )
        assert len(events) == 3
        transfer = events[1].payload
        assert transfer["previous_team_id"] == team and transfer["team_id"] == str(
            other
        )
        assert transfer["previous_assignee_id"] == str(tech)
        assert transfer["reason_provided"] is True
        assert "Staffing change" not in str(transfer)


def test_claim_and_start_check_current_actor_version_and_sla(
    database: Database,
) -> None:
    category, team = prepare_catalog(database)
    instant = datetime.now(UTC)
    app = create_app(AuthService(database, clock=lambda: instant), SETTINGS)
    requester, first, second, outsider, manager = (
        TestClient(app, base_url=ORIGIN) for _ in range(5)
    )
    _, requester_headers = actor(database, requester, "REQUESTER")
    first_id, first_headers = actor(database, first, "TECHNICIAN")
    second_id, second_headers = actor(database, second, "TECHNICIAN")
    outsider_id, outsider_headers = actor(database, outsider, "TECHNICIAN")
    _, manager_headers = actor(database, manager, "IT_MANAGER")
    ticket = create_ticket(requester, requester_headers, category, "Concurrent claim")
    with database.transaction() as db:
        db.add_all(
            TeamMember(team_id=UUID(team), account_id=account, active=True)
            for account in (first_id, second_id)
        )
        row = db.get(Ticket, UUID(ticket["id"]))
        assert row is not None
        row.response_used_seconds = 40
        row.resolution_used_seconds = 31
        row.adjustment_revision = 3
    detail_url = f"{TICKETS}/{ticket['id']}"

    def submit(client: TestClient, headers: dict, action: str, body: dict):
        return client.post(
            f"{detail_url}/{action}",
            json=body,
            headers={**headers, "Idempotency-Key": str(uuid4())},
        )

    def claim(client: TestClient, headers: dict, assignee_id: UUID):
        return submit(
            client,
            headers,
            "assignment",
            {
                "team_id": team,
                "assignee_id": str(assignee_id),
                "expectedVersion": 2,
            },
        )

    def transition(client: TestClient, headers: dict, target: str, version: int):
        return submit(
            client,
            headers,
            "transitions",
            {
                "target_status": target,
                "expectedVersion": version,
            },
        )

    assert (
        transition(first, first_headers, "In Progress", 1).json()["code"]
        == "INVALID_TRANSITION"
    )
    assert transition(requester, requester_headers, "Open", 1).status_code == 403
    assert transition(outsider, outsider_headers, "Open", 1).status_code == 404
    opened = transition(first, first_headers, "Open", 1)
    assert opened.status_code == 200, opened.text
    assert opened.json()["status"] == "Open" and opened.json()["version"] == 2
    assert opened.json()["sla"]["first_response_at"] is None
    assert (
        transition(manager, manager_headers, "In Progress", 2).json()["code"]
        == "INELIGIBLE_ASSIGNEE"
    )
    assert claim(outsider, outsider_headers, outsider_id).status_code == 404
    assert claim(first, first_headers, second_id).status_code == 403
    participants = [
        (first, first_headers, first_id),
        (second, second_headers, second_id),
    ]
    ready = Barrier(2, timeout=10)

    def compete(participant):
        ready.wait()
        return claim(*participant)

    with ThreadPoolExecutor(max_workers=2) as pool:
        outcomes = list(pool.map(compete, participants))
    assert sorted(response.status_code for response in outcomes) == [200, 409]
    winner_index = next(
        index for index, response in enumerate(outcomes) if response.status_code == 200
    )
    winner, winner_headers, winner_id = participants[winner_index]
    loser, loser_headers, _ = participants[1 - winner_index]
    assert outcomes[1 - winner_index].json()["code"] == "STALE_VERSION"
    assert loser.get(detail_url).json()["assignee_id"] == str(winner_id)
    assert transition(loser, loser_headers, "In Progress", 3).status_code == 403
    assert (
        transition(winner, winner_headers, "In Progress", 2).json()["code"]
        == "STALE_VERSION"
    )
    with database.transaction() as db:
        membership = db.get(TeamMember, (UUID(team), winner_id))
        assert membership is not None
        membership.active = False
    assert transition(winner, winner_headers, "In Progress", 3).status_code == 404
    assert (
        transition(manager, manager_headers, "In Progress", 3).json()["code"]
        == "INELIGIBLE_ASSIGNEE"
    )
    with database.transaction() as db:
        membership = db.get(TeamMember, (UUID(team), winner_id))
        assert membership is not None
        membership.active = True
    instant += timedelta(minutes=2)
    started = transition(winner, winner_headers, "In Progress", 3)
    assert started.status_code == 200, started.text
    assert started.json()["status"] == "In Progress" and started.json()["version"] == 4
    assert started.json()["sla"] == {
        "response_used_seconds": 40,
        "resolution_used_seconds": 31,
        "resolution_paused": False,
        "first_response_at": None,
        "adjustment_revision": 3,
    }
    with database.session() as db:
        row = db.get(Ticket, UUID(ticket["id"]))
        assert row is not None and row.created_at == row.resolution_started_at
        assert row.resolution_started_at == instant - timedelta(minutes=2)
        events = list(
            db.scalars(
                select(DomainEvent)
                .where(DomainEvent.aggregate_id == row.id)
                .order_by(DomainEvent.aggregate_version)
            )
        )
        assert [event.event_type for event in events] == [
            "ticket.created",
            "ticket.accepted",
            "ticket.assigned",
            "ticket.started",
        ]
        assert events[-1].occurred_at == instant
