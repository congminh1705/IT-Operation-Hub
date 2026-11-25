from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from fastapi.testclient import TestClient
from test_organization import ORIGIN, SETTINGS, actor
from test_ticket_intake import prepare_catalog
from test_ticket_reads import TICKETS, create_ticket

from app.infrastructure.database import Database
from app.main import create_app
from app.modules.auth.service import AuthService
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
