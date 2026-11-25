from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from fastapi.testclient import TestClient
from test_organization import ORIGIN, SETTINGS, actor
from test_ticket_intake import prepare_catalog
from test_ticket_reads import TICKETS, create_ticket

from app.infrastructure.database import Database
from app.main import create_app
from app.modules.auth.service import AuthService
from app.modules.organization.models import TeamMember
from app.modules.tickets.models import Ticket


def command(client, url, headers, payload):
    return client.post(
        url, json=payload, headers={**headers, "Idempotency-Key": str(uuid4())}
    )


def test_comment_audience_and_first_response(database: Database) -> None:
    category, _ = prepare_catalog(database)
    now = datetime.now(UTC)
    app = create_app(AuthService(database, clock=lambda: now), SETTINGS)
    owner, admin, outsider, it_owner = (
        TestClient(app, base_url=ORIGIN) for _ in range(4)
    )
    _, owner_headers = actor(database, owner, "REQUESTER")
    _, admin_headers = actor(database, admin, "ADMIN")
    actor(database, outsider, "REQUESTER")
    _, it_headers = actor(database, it_owner, "IT_MANAGER")
    ticket = create_ticket(owner, owner_headers, category, "Conversation")
    self_ticket = create_ticket(it_owner, it_headers, category, "IT requester")
    detail = f"{TICKETS}/{ticket['id']}"
    url = detail + "/comments"
    note = {"visibility": "INTERNAL", "content": "Private diagnostic"}
    public = {"visibility": "PUBLIC", "content": "Public conversation"}
    now += timedelta(seconds=120)
    assert command(owner, url, owner_headers, note).status_code == 403
    assert outsider.get(url).status_code == 404
    assert (
        command(admin, url, admin_headers, {**public, "content": "  "}).status_code
        == 422
    )
    assert command(admin, url, admin_headers, note).status_code == 201
    assert command(owner, url, owner_headers, public).status_code == 201
    assert (
        command(
            it_owner, f"{TICKETS}/{self_ticket['id']}/comments", it_headers, public
        ).status_code
        == 201
    )
    assert (
        it_owner.get(f"{TICKETS}/{self_ticket['id']}").json()["sla"][
            "first_response_at"
        ]
        is None
    )
    assert owner.get(detail).json()["sla"]["first_response_at"] is None
    visible = owner.get(url).json()
    assert visible["total"] == 1 and visible["items"][0]["visibility"] == "PUBLIC"
    assert "Private diagnostic" not in str(visible)
    assert admin.get(url).json()["total"] == 2
    now += timedelta(seconds=60)
    assert command(admin, url, admin_headers, public).status_code == 201
    sla = owner.get(detail).json()["sla"]
    assert sla["response_used_seconds"] == 180
    assert datetime.fromisoformat(sla["first_response_at"]) == now
    now += timedelta(seconds=60)
    assert command(admin, url, admin_headers, public).status_code == 201
    assert owner.get(detail).json()["sla"] == sla
    for status in ("Closed", "Cancelled"):
        with database.transaction() as db:
            row = db.get(Ticket, UUID(ticket["id"]))
            assert row is not None
            row.status = status
        assert command(owner, url, owner_headers, public).status_code == 409
        assert command(admin, url, admin_headers, note).status_code == 409
        assert owner.get(url).json()["total"] == 3


def test_pending_question_and_requester_reply_are_atomic(database: Database) -> None:
    category, team = prepare_catalog(database)
    now = datetime.now(UTC)
    app = create_app(AuthService(database, clock=lambda: now), SETTINGS)
    owner, admin = (TestClient(app, base_url=ORIGIN) for _ in range(2))
    _, owner_headers = actor(database, owner, "REQUESTER")
    admin_id, admin_headers = actor(database, admin, "ADMIN")
    ticket = create_ticket(owner, owner_headers, category, "Pending")
    detail = f"{TICKETS}/{ticket['id']}"
    with database.transaction() as db:
        db.add(TeamMember(team_id=UUID(team), account_id=admin_id, active=True))
        row = db.get(Ticket, UUID(ticket["id"]))
        assert row is not None
        row.status = "In Progress"
        row.assignee_id = admin_id
    transitions, comments = detail + "/transitions", detail + "/comments"

    def change(target, version, **payload):
        return command(
            admin,
            transitions,
            admin_headers,
            {
                "expectedVersion": version,
                "target_status": target,
                **payload,
            },
        )

    now += timedelta(seconds=90)
    assert (
        change(
            "Pending", 1, reason="Need clarification", public_message="  "
        ).status_code
        == 422
    )
    assert owner.get(comments).json()["total"] == 0
    assert owner.get(detail).json()["status"] == "In Progress"
    pending = change(
        "Pending", 1, reason="Need clarification", public_message="Which location?"
    )
    assert pending.status_code == 200, pending.text
    assert pending.json()["version"] == 2
    assert pending.json()["sla"]["resolution_used_seconds"] == 90
    assert pending.json()["sla"]["response_used_seconds"] == 90
    assert pending.json()["sla"]["resolution_paused"]
    assert owner.get(comments).json()["items"][0]["content"] == "Which location?"
    now += timedelta(seconds=200)
    assert change("In Progress", 2).status_code == 422
    assert (
        command(
            admin,
            comments,
            admin_headers,
            {"visibility": "INTERNAL", "content": "Private note"},
        ).status_code
        == 201
    )
    assert owner.get(detail).json()["status"] == "Pending"
    assert (
        command(
            owner,
            comments,
            owner_headers,
            {"visibility": "PUBLIC", "content": "First floor"},
        ).status_code
        == 201
    )
    resumed = owner.get(detail).json()
    assert resumed["status"] == "In Progress" and resumed["version"] == 3
    assert resumed["sla"]["resolution_used_seconds"] == 90
    assert not resumed["sla"]["resolution_paused"]
    assert owner.get(comments).json()["total"] == 2
    now += timedelta(seconds=30)
    again = change("Pending", 3, reason="Another detail", public_message="Which room?")
    assert again.status_code == 200
    assert again.json()["sla"]["resolution_used_seconds"] == 120
    assert change("In Progress", 4, reason="Clarification received").status_code == 200


def test_resolve_needs_public_solution_and_only_owner_closes(
    database: Database,
) -> None:
    category, team = prepare_catalog(database)
    now = datetime.now(UTC)
    app = create_app(AuthService(database, clock=lambda: now), SETTINGS)
    owner, admin, unrelated = (TestClient(app, base_url=ORIGIN) for _ in range(3))
    _, owner_headers = actor(database, owner, "REQUESTER")
    admin_id, admin_headers = actor(database, admin, "ADMIN")
    _, unrelated_headers = actor(database, unrelated, "REQUESTER")
    ticket = create_ticket(owner, owner_headers, category, "Resolution")
    detail = f"{TICKETS}/{ticket['id']}"
    transitions = detail + "/transitions"
    comments = detail + "/comments"
    with database.transaction() as db:
        db.add(TeamMember(team_id=UUID(team), account_id=admin_id, active=True))
        row = db.get(Ticket, UUID(ticket["id"]))
        assert row is not None
        row.status = "In Progress"
        row.assignee_id = admin_id
    invalid = {"expectedVersion": 1, "target_status": "Resolved", "public_message": " "}
    now += timedelta(minutes=15)
    assert command(admin, transitions, admin_headers, invalid).status_code == 422
    assert owner.get(comments).json()["total"] == 0
    assert owner.get(detail).json()["status"] == "In Progress"
    assert (
        command(
            admin, transitions, admin_headers, {**invalid, "target_status": "Done"}
        ).status_code
        == 422
    )
    result = command(
        admin,
        transitions,
        admin_headers,
        {**invalid, "public_message": "Service restored"},
    )
    assert result.status_code == 200, result.text
    assert result.json()["version"] == 2
    sla = result.json()["sla"]
    assert sla["resolution_used_seconds"] == sla["response_used_seconds"] == 900
    assert sla["resolution_paused"]
    assert owner.get(comments).json()["items"][0]["content"] == "Service restored"
    close = {"expectedVersion": 2, "target_status": "Closed"}
    now += timedelta(minutes=1)
    assert command(admin, transitions, admin_headers, close).status_code == 403
    assert command(unrelated, transitions, unrelated_headers, close).status_code == 404
    assert (
        command(
            owner,
            comments,
            owner_headers,
            {"visibility": "PUBLIC", "content": "I am checking"},
        ).status_code
        == 201
    )
    assert owner.get(detail).json()["status"] == "Resolved"
    result = command(owner, transitions, owner_headers, close)
    assert result.status_code == 200, result.text
    assert result.json()["status"] == "Closed" and result.json()["sla"] == sla
    assert "internal_context" not in result.json()
    assert owner.get(comments).json()["total"] == 2
