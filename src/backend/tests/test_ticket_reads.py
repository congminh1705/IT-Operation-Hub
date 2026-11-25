from datetime import UTC, datetime
from uuid import UUID, uuid4

from fastapi.testclient import TestClient
from sqlalchemy import update
from test_organization import ORIGIN, SETTINGS, actor
from test_ticket_intake import prepare_catalog, ticket_payload

from app.infrastructure.database import Database
from app.main import create_app
from app.modules.auth.models import Account
from app.modules.auth.service import AuthService
from app.modules.organization.models import Team, TeamMember
from app.modules.tickets.models import Ticket

TICKETS = "/api/v1/tickets"


def create_ticket(
    client: TestClient, headers: dict[str, str], category: str, title: str
) -> dict:
    response = client.post(
        TICKETS,
        json={**ticket_payload(category), "title": title},
        headers={**headers, "Idempotency-Key": title},
    )
    assert response.status_code == 201, response.json()
    return response.json()


def test_list_scope_filters_and_paging(database: Database) -> None:
    category, intake = prepare_catalog(database)
    app = create_app(AuthService(database), SETTINGS)
    requester, technician, manager, admin, anonymous = (
        TestClient(app, base_url=ORIGIN) for _ in range(5)
    )
    _, requester_headers = actor(database, requester, "REQUESTER")
    tech, technician_headers = actor(database, technician, "TECHNICIAN")
    actor(database, manager, "IT_MANAGER")
    actor(database, admin, "ADMIN")
    team_ticket = create_ticket(
        requester, requester_headers, category, "Network % outage"
    )
    own_team = create_ticket(technician, technician_headers, category, "Network team")
    own_outside = create_ticket(
        technician, technician_headers, category, "Network outside"
    )
    outsider = create_ticket(requester, requester_headers, category, "Network private")
    with database.transaction() as db:
        other = Team(
            id=uuid4(),
            name="Other",
            name_key="other",
            active=True,
            intake=False,
            version=1,
        )
        db.add(other)
        db.flush()
        db.add(TeamMember(team_id=UUID(intake), account_id=tech, active=True))
        db.execute(
            update(Ticket)
            .where(Ticket.id.in_([UUID(own_outside["id"]), UUID(outsider["id"])]))
            .values(team_id=other.id)
        )
        db.execute(
            update(Ticket).values(created_at=datetime(2026, 11, 25, 10, tzinfo=UTC))
        )

    def search(client: TestClient, **params: str | int) -> tuple[list[str], int]:
        response = client.get(TICKETS, params=params)
        assert response.status_code == 200, response.text
        body = response.json()
        return [item["id"] for item in body["items"]], body["total"]

    expected = sorted([team_ticket["id"], own_team["id"], own_outside["id"]])
    assert search(technician, q="NETWORK") == (expected, 3)
    assert search(technician, q=outsider["code"]) == ([], 0)
    assert search(technician, q="%") == ([team_ticket["id"]], 1)
    assert search(technician, scope="mine")[1] == 2
    assert search(technician, scope="work")[1] == 2
    assert search(requester, scope="work") == ([], 0)
    assert search(requester)[1] == 2
    assert search(manager)[1] == search(admin)[1] == 4
    assert search(technician, status="Closed") == ([], 0)
    for sort in ("oldest", "recent", "priority"):
        assert search(technician, sort=sort, priority="P2", page_size=2) == (
            expected[:2],
            3,
        )
        assert search(technician, sort=sort, page_size=2, page=2) == (expected[2:], 3)
    for params in ({"page_size": 101}, {"page": 0}, {"sort": "title"}):
        assert technician.get(TICKETS, params=params).status_code == 422
    assert anonymous.get(TICKETS).status_code == 401


def test_detail_uses_current_role_and_team_membership(database: Database) -> None:
    category, intake = prepare_catalog(database)
    app = create_app(AuthService(database), SETTINGS)
    requester, technician, manager, admin, anonymous = (
        TestClient(app, base_url=ORIGIN) for _ in range(5)
    )
    _, requester_headers = actor(database, requester, "REQUESTER")
    tech, technician_headers = actor(database, technician, "TECHNICIAN")
    actor(database, manager, "IT_MANAGER")
    actor(database, admin, "ADMIN")
    team_ticket = create_ticket(requester, requester_headers, category, "Team detail")
    own_outside = create_ticket(technician, technician_headers, category, "Own detail")
    team_url = f"{TICKETS}/{team_ticket['id']}"
    own_url = f"{TICKETS}/{own_outside['id']}"
    with database.transaction() as db:
        other = Team(
            id=uuid4(),
            name="Other",
            name_key="other",
            active=True,
            intake=False,
            version=1,
        )
        db.add(other)
        db.flush()
        db.add(TeamMember(team_id=UUID(intake), account_id=tech, active=True))
        db.execute(
            update(Ticket)
            .where(Ticket.id == UUID(own_outside["id"]))
            .values(team_id=other.id)
        )
        db.execute(
            update(Ticket).values(
                workflow_context={
                    "note": "private note",
                    "plan": "proposed plan",
                    "candidate": "candidate metadata",
                }
            )
        )

    def read(client: TestClient, url: str, *, internal: bool) -> None:
        response = client.get(url)
        assert response.status_code == 200, response.text
        assert response.headers["Cache-Control"] == "no-store"
        body = response.json()
        assert set(body) == (
            set(team_ticket) | ({"internal_context"} if internal else set())
        )
        if internal:
            assert body["internal_context"] == "Impact: HIGH; Urgency: MEDIUM"
        for private in ("private note", "proposed plan", "candidate metadata"):
            assert private not in response.text

    def not_found(client: TestClient, url: str) -> dict:
        response = client.get(url)
        assert response.status_code == 404, response.text
        body = response.json()
        UUID(body.pop("request_id"))
        assert body["code"] == "NOT_FOUND"
        return body

    assert anonymous.get(team_url).status_code == 401
    assert not_found(requester, own_url) == not_found(requester, f"{TICKETS}/{uuid4()}")
    read(requester, team_url, internal=False)
    read(technician, team_url, internal=True)
    read(technician, own_url, internal=False)
    read(manager, own_url, internal=True)
    read(admin, own_url, internal=True)

    with database.transaction() as db:
        db.execute(
            update(TeamMember).where(TeamMember.account_id == tech).values(active=False)
        )
    not_found(technician, team_url)
    read(technician, own_url, internal=False)

    with database.transaction() as db:
        db.execute(
            update(TeamMember).where(TeamMember.account_id == tech).values(active=True)
        )
        db.execute(
            update(Ticket)
            .where(Ticket.id == UUID(own_outside["id"]))
            .values(team_id=UUID(intake))
        )
    read(technician, own_url, internal=True)
    with database.transaction() as db:
        db.execute(update(Account).where(Account.id == tech).values(role="REQUESTER"))
    not_found(technician, team_url)
    read(technician, own_url, internal=False)
