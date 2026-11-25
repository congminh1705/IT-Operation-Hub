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

    assert assign(technician, tech_headers).status_code == 403
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
