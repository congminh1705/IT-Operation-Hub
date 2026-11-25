from uuid import UUID

from fastapi.testclient import TestClient
from sqlalchemy import select
from test_manual_allocation import allocation, patch
from test_manual_work import TASKS, manual_input
from test_organization import ORIGIN, SETTINGS, actor
from test_ticket_intake import prepare_catalog
from test_ticket_lifecycle import command
from test_ticket_reads import TICKETS, create_ticket

from app.infrastructure.database import Database
from app.infrastructure.models import DomainEvent
from app.main import create_app
from app.modules.auth.service import AuthService
from app.modules.organization.models import TeamMember
from app.modules.work_management.models import (
    TaskAllocation,
    TaskDependency,
    TaskTransitionRecord,
)


def test_task_transitions_keep_blocked_load_and_ticket_independent(
    database: Database,
) -> None:
    category, team = prepare_catalog(database)
    app = create_app(AuthService(database), SETTINGS)
    admin, tech, requester = [TestClient(app, base_url=ORIGIN) for _ in range(3)]
    _, admin_headers = actor(database, admin, "ADMIN")
    tech_id, tech_headers = actor(database, tech, "TECHNICIAN")
    _, owner_headers = actor(database, requester, "REQUESTER")
    ticket = create_ticket(requester, owner_headers, category, "Task state independent")
    with database.transaction() as db:
        db.add(TeamMember(team_id=UUID(team), account_id=tech_id, active=True))
    profile = f"/api/v1/workforce/{tech_id}"
    slots = [allocation("08:00", "08:30")]
    assert (
        patch(
            admin,
            admin_headers,
            profile,
            {
                "expectedVersion": 1,
                "reason": "Verified working calendar",
                "days": [
                    {
                        "local_date": "2026-11-25",
                        "holiday": False,
                        "budget_minutes": 30,
                        "working_intervals": slots,
                    }
                ],
            },
        ).status_code
        == 200
    )
    plan = manual_input("")
    for task in plan["tasks"]:
        task["required_skill_ids"] = []
    original = plan["tasks"][0]
    plan["tasks"] = [
        {**original, "title": name}
        for name in ("Predecessor", "Successor", "Disposable")
    ]
    response = command(admin, f"{TICKETS}/{ticket['id']}/plans", admin_headers, plan)
    assert response.status_code == 201, response.text
    dto = response.json()
    tasks = {row["title"]: row["id"] for row in dto["tasks"]}
    first, second, third = (
        tasks[name] for name in ("Predecessor", "Successor", "Disposable")
    )
    with database.transaction() as db:
        db.add(
            TaskDependency(
                task_id=UUID(second),
                predecessor_id=UUID(first),
                plan_version_id=UUID(dto["plan_version_id"]),
            )
        )

    def transition(client, headers, task, version, status, **extra):
        return command(
            client,
            f"{TASKS}/{task}/transitions",
            headers,
            {
                "expectedVersion": version,
                "target_status": status,
                **extra,
            },
        )

    def assign(task):
        return command(
            admin,
            f"{TASKS}/{task}/assignment",
            admin_headers,
            {
                "expectedVersion": 1,
                "assignee_id": str(tech_id),
                "team_id": team,
                "reason": "Reserve approved execution window",
                "allocations": slots,
            },
        )

    assert transition(requester, owner_headers, first, 1, "Ready").status_code == 403
    assert (
        transition(admin, admin_headers, first, 1, "In Progress").json()["code"]
        == "INVALID_TASK_TRANSITION"
    )
    assert (
        transition(admin, admin_headers, first, 1, "Ready").json()["code"]
        == "ALLOCATION_REQUIRED"
    )
    assert (
        transition(admin, admin_headers, second, 1, "Ready").json()["code"]
        == "PREDECESSORS_INCOMPLETE"
    )
    assert (
        transition(
            admin, admin_headers, first, 1, "Cancelled", reason="Requested removal"
        ).json()["code"]
        == "DOWNSTREAM_REVIEW_REQUIRED"
    )
    assert assign(first).status_code == 200
    assert transition(tech, tech_headers, first, 2, "Ready").status_code == 200
    assert transition(tech, tech_headers, first, 3, "In Progress").status_code == 200
    assert (
        transition(tech, tech_headers, first, 4, "Blocked").json()["code"]
        == "REASON_REQUIRED"
    )
    assert (
        transition(
            tech, tech_headers, first, 4, "Blocked", reason="Waiting for dependency"
        ).status_code
        == 200
    )
    assert assign(second).json()["code"] == "INSUFFICIENT_CAPACITY"
    assert transition(tech, tech_headers, first, 5, "In Progress").status_code == 409
    assert (
        transition(
            tech, tech_headers, first, 5, "Ready", reason="Resolved blocking condition"
        ).status_code
        == 200
    )
    assert transition(tech, tech_headers, first, 6, "In Progress").status_code == 200
    assert (
        transition(
            tech, tech_headers, first, 7, "Done", result="Restored service"
        ).json()["code"]
        == "INCOMPLETE_TASK_RESULT"
    )
    assert (
        transition(
            tech, tech_headers, first, 7, "Done", remaining_minutes=0, result="..."
        ).json()["code"]
        == "INCOMPLETE_TASK_RESULT"
    )
    assert (
        transition(
            tech, tech_headers, first, 7, "Cancelled", reason="Discard work"
        ).status_code
        == 403
    )
    done = transition(
        tech,
        tech_headers,
        first,
        7,
        "Done",
        remaining_minutes=0,
        result="Restored service",
    )
    assert done.status_code == 200, done.text
    assert (
        done.json()["result"] == "Restored service" and done.json()["allocations"] == []
    )
    assert transition(admin, admin_headers, first, 8, "Ready").status_code == 409
    assert assign(second).status_code == 200
    assert transition(tech, tech_headers, second, 2, "Ready").status_code == 200
    assert (
        transition(admin, admin_headers, third, 1, "Cancelled").json()["code"]
        == "REASON_REQUIRED"
    )
    assert (
        transition(
            admin,
            admin_headers,
            third,
            1,
            "Cancelled",
            reason="Work is no longer needed",
        ).status_code
        == 200
    )
    current = requester.get(f"{TICKETS}/{ticket['id']}").json()
    assert (current["status"], current["version"], current["sla"]) == (
        ticket["status"],
        ticket["version"],
        ticket["sla"],
    )
    with database.session() as db:
        rows = list(
            db.scalars(
                select(TaskAllocation).where(TaskAllocation.task_id == UUID(first))
            )
        )
        assert len(rows) == 1 and rows[0].released_at is not None
        stored = db.get(TaskTransitionRecord, (UUID(first), 5))
        assert stored is not None and stored.reason == "Waiting for dependency"
        event = db.scalar(
            select(DomainEvent).where(
                DomainEvent.aggregate_id == UUID(first),
                DomainEvent.event_type == "task.completed",
            )
        )
        assert event is not None and event.payload["status"] == "Done"
        assert event.payload["previous_status"] == "In Progress"
        assert "Restored service" not in str(event.payload)
