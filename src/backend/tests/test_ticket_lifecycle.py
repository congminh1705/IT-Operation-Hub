from collections.abc import Mapping
from datetime import UTC, datetime, timedelta
from typing import Never, cast
from uuid import UUID, uuid4

import pytest
from fastapi.testclient import TestClient
from httpx import Response
from sqlalchemy import select, update
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from test_organization import ORIGIN, SETTINGS, actor
from test_ticket_intake import prepare_catalog
from test_ticket_reads import TICKETS, create_ticket

from app.infrastructure.database import Database
from app.infrastructure.models import DomainEvent
from app.main import create_app
from app.modules.auth.models import AuthSession
from app.modules.auth.service import AuthService
from app.modules.organization.models import TeamMember
from app.modules.tickets import lifecycle
from app.modules.tickets.models import Ticket, TicketChangeReason


def command(
    client: TestClient, url: str, headers: dict[str, str], payload: Mapping[str, object]
) -> Response:
    return cast(
        Response,
        client.post(
            url, json=dict(payload), headers={**headers, "Idempotency-Key": str(uuid4())}
        ),
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


def test_pending_question_and_requester_reply_are_atomic(
    database: Database, monkeypatch: pytest.MonkeyPatch
) -> None:
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

    def change(target: str, version: int, **payload: object) -> Response:
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

    def fail_publish(db: Session, **kwargs: object) -> Never:
        db.flush()
        raise SQLAlchemyError("Synthetic outbox failure")

    with monkeypatch.context() as patch:
        patch.setattr(lifecycle, "enqueue_event", fail_publish)
        failed = change(
            "Pending", 1, reason="Need clarification", public_message="Which location?"
        )
        assert failed.status_code == 503
    assert owner.get(comments).json()["total"] == 0
    assert owner.get(detail).json()["version"] == 1
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


def test_reopen_preserves_usage_and_cancel_is_terminal(database: Database) -> None:
    category, team = prepare_catalog(database)
    now = datetime.now(UTC)
    app = create_app(AuthService(database, clock=lambda: now), SETTINGS)
    owner, admin, technician = (TestClient(app, base_url=ORIGIN) for _ in range(3))
    _, owner_headers = actor(database, owner, "REQUESTER")
    admin_id, admin_headers = actor(database, admin, "ADMIN")
    tech_id, tech_headers = actor(database, technician, "TECHNICIAN")
    ticket = create_ticket(owner, owner_headers, category, "Reopen matrix")
    ticket_id = UUID(ticket["id"])
    detail = f"{TICKETS}/{ticket_id}"
    with database.transaction() as db:
        db.execute(
            update(AuthSession).values(
                idle_until=now + timedelta(days=2), expires_at=now + timedelta(days=2)
            )
        )
        db.add_all(
            TeamMember(team_id=UUID(team), account_id=user, active=True)
            for user in (admin_id, tech_id)
        )
        row = db.get(Ticket, ticket_id)
        assert row is not None
        row.status = "In Progress"
        row.assignee_id = admin_id
        row.resolution_used_seconds = 7 * 3600
        snapshot = row.sla_snapshot

    def transition(
        client: TestClient,
        headers: dict[str, str],
        target: str,
        version: int,
        **data: object,
    ) -> Response:
        return command(
            client,
            detail + "/transitions",
            headers,
            {
                "target_status": target,
                "expectedVersion": version,
                **data,
            },
        )

    now += timedelta(hours=1)
    pending = transition(
        admin,
        admin_headers,
        "Pending",
        1,
        reason="Need detail",
        public_message="Can you confirm?",
    )
    assert pending.status_code == 200, pending.text
    now += timedelta(hours=2)
    assert (
        command(
            owner,
            detail + "/comments",
            owner_headers,
            {"visibility": "PUBLIC", "content": "Confirmed"},
        ).status_code
        == 201
    )
    now += timedelta(hours=1)
    resolved = transition(admin, admin_headers, "Resolved", 3, public_message="Fixed")
    assert resolved.status_code == 200, resolved.text
    assert resolved.json()["sla"]["resolution_used_seconds"] == 9 * 3600
    assert (
        transition(
            admin, admin_headers, "Cancelled", 4, reason="After resolution"
        ).status_code
        == 409
    )
    assert (
        transition(
            technician, tech_headers, "In Progress", 4, reason="Not my request"
        ).status_code
        == 403
    )
    assert transition(owner, owner_headers, "In Progress", 4).status_code == 422
    assert (
        transition(
            owner, owner_headers, "In Progress", 4, reason="Still fails"
        ).status_code
        == 200
    )
    assert (
        transition(
            admin, admin_headers, "Resolved", 5, public_message="Fixed again"
        ).status_code
        == 200
    )
    now += timedelta(hours=1)
    assert transition(owner, owner_headers, "Closed", 6).status_code == 200
    assert (
        transition(
            owner,
            owner_headers,
            "In Progress",
            7,
            reason="Requester cannot reopen Closed",
        ).status_code
        == 403
    )
    with database.transaction() as db:
        member = db.get(TeamMember, (UUID(team), admin_id))
        assert member is not None
        member.active = False
    now += timedelta(hours=2)
    assert (
        transition(
            admin, admin_headers, "In Progress", 7, reason="Reopened by management"
        ).json()["code"]
        == "INELIGIBLE_ASSIGNEE"
    )
    reassigned = command(
        admin,
        detail + "/assignment",
        admin_headers,
        {
            "team_id": team,
            "assignee_id": str(tech_id),
            "reason": "Replace unavailable assignee",
            "expectedVersion": 7,
        },
    )
    assert reassigned.status_code == 200, reassigned.text
    reopened = transition(
        admin, admin_headers, "In Progress", 8, reason="Reopened by management"
    )
    assert reopened.status_code == 200, reopened.text
    assert reopened.json()["sla"]["resolution_used_seconds"] == 9 * 3600
    now += timedelta(hours=1)
    assert transition(owner, owner_headers, "Cancelled", 9).status_code == 403
    assert transition(admin, admin_headers, "Cancelled", 9).status_code == 422
    cancelled = transition(
        admin, admin_headers, "Cancelled", 9, reason="No longer required"
    )
    assert cancelled.status_code == 200
    assert cancelled.json()["sla"]["resolution_used_seconds"] == 10 * 3600
    assert (
        transition(
            admin, admin_headers, "In Progress", 10, reason="Terminal"
        ).status_code
        == 409
    )
    assert (
        command(
            admin,
            detail + "/assignment",
            admin_headers,
            {
                "team_id": team,
                "assignee_id": str(tech_id),
                "reason": "Terminal assignment",
                "expectedVersion": 10,
            },
        ).status_code
        == 409
    )
    with database.session() as db:
        row = db.get(Ticket, ticket_id)
        assert row is not None and row.sla_snapshot == snapshot
        assert (
            row.resolution_used_seconds > snapshot[row.priority]["resolution_seconds"]
        )
        reason = db.get(TicketChangeReason, (ticket_id, 9))
        assert reason is not None and reason.reason == "Reopened by management"
        events = list(
            db.scalars(select(DomainEvent).where(DomainEvent.aggregate_id == ticket_id))
        )
        assert "Reopened by management" not in str([event.payload for event in events])


def test_self_handled_ticket_keeps_no_first_response(database: Database) -> None:
    category, team = prepare_catalog(database)
    now = datetime.now(UTC)
    app = create_app(AuthService(database, clock=lambda: now), SETTINGS)
    manager, requester = (TestClient(app, base_url=ORIGIN) for _ in range(2))
    manager_id, headers = actor(database, manager, "IT_MANAGER")
    _, requester_headers = actor(database, requester, "REQUESTER")
    disposable = create_ticket(requester, requester_headers, category, "Cancel own New")
    assert (
        command(
            requester,
            f"{TICKETS}/{disposable['id']}/transitions",
            requester_headers,
            {
                "target_status": "Cancelled",
                "expectedVersion": 1,
            },
        ).status_code
        == 200
    )
    ticket = create_ticket(manager, headers, category, "Self handled")
    url = f"{TICKETS}/{ticket['id']}/transitions"
    with database.transaction() as db:
        db.add(TeamMember(team_id=UUID(team), account_id=manager_id, active=True))
        row = db.get(Ticket, UUID(ticket["id"]))
        assert row is not None
        row.status = "In Progress"
        row.assignee_id = manager_id
    now += timedelta(seconds=60)
    pending = command(
        manager,
        url,
        headers,
        {
            "target_status": "Pending",
            "expectedVersion": 1,
            "reason": "Self clarification",
            "public_message": "Checking details",
        },
    )
    assert pending.status_code == 200, pending.text
    assert pending.json()["sla"]["first_response_at"] is None
    now += timedelta(seconds=80)
    assert (
        command(
            manager,
            url,
            headers,
            {
                "target_status": "In Progress",
                "expectedVersion": 2,
                "reason": "Resuming investigation",
            },
        ).status_code
        == 200
    )
    resolved = command(
        manager,
        url,
        headers,
        {
            "target_status": "Resolved",
            "expectedVersion": 3,
            "public_message": "Self handled solution",
        },
    )
    assert resolved.status_code == 200
    closed = command(
        manager, url, headers, {"target_status": "Closed", "expectedVersion": 4}
    )
    assert closed.status_code == 200
    reopened = command(
        manager,
        url,
        headers,
        {
            "target_status": "In Progress",
            "expectedVersion": 5,
            "reason": "Further investigation",
        },
    )
    assert reopened.status_code == 200, reopened.text
    assert reopened.json()["sla"]["first_response_at"] is None
    assert reopened.json()["sla"]["response_used_seconds"] == 0
    assert reopened.json()["sla"]["resolution_used_seconds"] == 60
