from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
from typing import Any
from uuid import UUID, uuid4

from fastapi.testclient import TestClient
from httpx import Response
from sqlalchemy import select
from test_access_lifecycle import new_session, patch
from test_manual_work import TASKS, manual_input
from test_organization import ORIGIN, SETTINGS, actor
from test_ticket_intake import prepare_catalog
from test_ticket_lifecycle import command
from test_ticket_reads import TICKETS, create_ticket

from app.infrastructure.database import Database
from app.infrastructure.models import DomainEvent, OutboxDelivery
from app.main import create_app
from app.modules.auth.service import AuthService
from app.modules.organization.models import Team, TeamMember
from app.modules.tickets.models import Ticket


def test_intake_retirement_transfers_open_work_and_serializes_membership(
    database: Database,
) -> None:
    category, team = prepare_catalog(database)
    source = UUID(team)
    app = create_app(AuthService(database), SETTINGS)
    admin, rival, previous, replacement, candidate, requester = (
        TestClient(app, base_url=ORIGIN) for _ in range(6)
    )
    _, admin_headers = actor(database, admin, "ADMIN")
    _, rival_headers = actor(database, rival, "ADMIN")
    old, _ = actor(database, previous, "TECHNICIAN")
    new, _ = actor(database, replacement, "TECHNICIAN")
    extra, _ = actor(database, candidate, "TECHNICIAN")
    _, owner_headers = actor(database, requester, "REQUESTER")
    body = create_ticket(requester, owner_headers, category, "Retirement active work")
    past = create_ticket(requester, owner_headers, category, "Retirement history")
    ticket_id, history_id = UUID(body["id"]), UUID(past["id"])
    destination = uuid4()
    with database.transaction() as db:
        db.add(
            Team(
                id=destination,
                name="New intake",
                name_key="new intake",
                active=True,
                intake=False,
                version=1,
            )
        )
        db.flush()
        db.add_all(
            [
                TeamMember(team_id=source, account_id=old, active=True),
                TeamMember(team_id=destination, account_id=new, active=True),
            ]
        )
        active = db.get(Ticket, ticket_id)
        closed = db.get(Ticket, history_id)
        assert active is not None and closed is not None
        active.status, active.assignee_id = "Pending", old
        closed.status, closed.assignee_id = "Closed", old
    work = manual_input("")
    work["tasks"][0]["required_skill_ids"] = []
    plan = command(admin, f"{TICKETS}/{ticket_id}/plans", admin_headers, work)
    assert plan.status_code == 201, plan.text
    task = plan.json()["tasks"][0]
    scope = f"/api/v1/teams/{source}"
    preview = admin.get(scope + "/handover").json()
    assert {item["id"] for item in preview["items"]} == {str(ticket_id), task["id"]}
    payload: dict[str, Any] = {
        "expectedVersion": 1,
        "active": False,
        "reason": "Review intake team retirement",
        "handover_team_id": str(destination),
        "handover_team_expectedVersion": 1,
        "handover": [
            {
                "kind": "ticket",
                "id": str(ticket_id),
                "expectedVersion": 1,
                "replacement_user_id": str(new),
            },
            {
                "kind": "task",
                "id": task["id"],
                "expectedVersion": 1,
                "replacement_user_id": None,
            },
        ],
    }
    incomplete = patch(
        admin, admin_headers, scope, {**payload, "handover": payload["handover"][:1]}
    )
    assert incomplete.json()["code"] == "HANDOVER_REQUIRED"
    assert (
        admin.get(scope).json()["active"]
        and previous.get(f"{TICKETS}/{ticket_id}").status_code == 200
    )
    barrier = Barrier(2, timeout=10)

    def retire() -> Response:
        barrier.wait()
        return patch(admin, admin_headers, scope, payload)

    def add_member() -> Response:
        barrier.wait()
        return command(
            rival,
            scope + "/members",
            rival_headers,
            {
                "expectedVersion": 1,
                "active": True,
                "user_id": str(extra),
                "reason": "Approved membership",
            },
        )

    with ThreadPoolExecutor(max_workers=2) as pool:
        retiring = pool.submit(retire)
        adding = pool.submit(add_member)
        retired, added = retiring.result(), adding.result()
    assert sorted([retired.status_code, added.status_code]) == [200, 409]
    if retired.status_code != 200:
        assert retired.json()["code"] == "STALE_VERSION"
        retired = patch(admin, admin_headers, scope, {**payload, "expectedVersion": 2})
    assert retired.status_code == 200, retired.text
    assert retired.json()["active"] is False and retired.json()["intake"] is False
    assert admin.get(f"/api/v1/teams/{destination}").json()["intake"]
    assert previous.get(f"{TICKETS}/{ticket_id}").status_code == 401
    new_session(database, previous, old)
    assert previous.get(f"{TICKETS}/{ticket_id}").status_code == 404
    current = replacement.get(f"{TICKETS}/{ticket_id}").json()
    assert current["team_id"] == str(destination) and current["assignee_id"] == str(new)
    assert current["status"] == "Pending" and current["sla"] == body["sla"]
    assert replacement.get(f"{TASKS}/{task['id']}").json()["team_id"] == str(
        destination
    )
    with database.session() as db:
        closed = db.get(Ticket, history_id)
        assert (
            closed is not None
            and closed.assignee_id == old
            and closed.team_id == source
        )
        member = db.get(TeamMember, (source, old))
        assert member is not None and not member.active
        events = list(
            db.scalars(
                select(DomainEvent).where(
                    DomainEvent.aggregate_id == source,
                    DomainEvent.aggregate_version == retired.json()["version"],
                )
            )
        )
        assert {event.event_type for event in events} == {
            "membership.changed",
            "load.changed",
        }
        for event in events:
            assert event.payload["active"] is False
            assert (
                db.scalar(
                    select(OutboxDelivery.id).where(OutboxDelivery.event_id == event.id)
                )
                is not None
            )
