from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
from uuid import UUID, uuid4

from fastapi.testclient import TestClient
from sqlalchemy import select
from test_manual_work import TASKS, manual_input
from test_organization import ORIGIN, SETTINGS, actor
from test_ticket_intake import prepare_catalog
from test_ticket_lifecycle import command
from test_ticket_reads import TICKETS, create_ticket

from app.infrastructure.database import Database
from app.main import create_app
from app.modules.auth.service import AuthService
from app.modules.organization.models import TeamMember
from app.modules.work_management.models import TaskAllocation, WorkTask


def patch(client, headers, url, body):
    return client.patch(
        url, json=body, headers={**headers, "Idempotency-Key": str(uuid4())}
    )


def allocation(start: str, end: str) -> dict[str, str]:
    return {
        "starts_at": f"2026-11-25T{start}:00+07:00",
        "ends_at": f"2026-11-25T{end}:00+07:00",
    }


def test_manual_capacity_concurrency_and_progress_revalidation(
    database: Database,
) -> None:
    category, team = prepare_catalog(database)
    app = create_app(AuthService(database), SETTINGS)
    admin, manager, tech, requester = [
        TestClient(app, base_url=ORIGIN) for _ in range(4)
    ]
    _, admin_headers = actor(database, admin, "ADMIN")
    _, manager_headers = actor(database, manager, "IT_MANAGER")
    tech_id, tech_headers = actor(database, tech, "TECHNICIAN")
    _, owner_headers = actor(database, requester, "REQUESTER")
    ticket = create_ticket(requester, owner_headers, category, "Allocation test")
    with database.transaction() as db:
        db.add(TeamMember(team_id=UUID(team), account_id=tech_id, active=True))
    profile = f"/api/v1/workforce/{tech_id}"
    skill = command(
        admin, "/api/v1/workforce/skills", admin_headers, {"name": "Capacity skill"}
    ).json()["id"]
    calendar = {
        "local_date": "2026-11-25",
        "holiday": False,
        "budget_minutes": 30,
        "working_intervals": [allocation("08:00", "09:00")],
    }
    assert (
        patch(
            admin,
            admin_headers,
            profile,
            {
                "expectedVersion": 1,
                "reason": "Configured working schedule",
                "days": [calendar],
            },
        ).status_code
        == 200
    )
    plan = manual_input(skill)
    plan["tasks"] *= 2
    created = command(admin, f"{TICKETS}/{ticket['id']}/plans", admin_headers, plan)
    assert created.status_code == 201, created.text
    ids = [task["id"] for task in created.json()["tasks"]]
    request = {
        "expectedVersion": 1,
        "assignee_id": str(tech_id),
        "team_id": team,
        "reason": "Allocate approved working slot",
        "allocations": [allocation("08:00", "08:30")],
    }

    def assign(client, headers, task_id, **changes):
        return command(
            client, f"{TASKS}/{task_id}/assignment", headers, {**request, **changes}
        )

    assert assign(tech, tech_headers, ids[0]).status_code == 403
    assert (
        assign(admin, admin_headers, ids[0]).json()["code"] == "MISSING_VERIFIED_SKILLS"
    )
    assert (
        patch(
            admin,
            admin_headers,
            profile,
            {
                "expectedVersion": 2,
                "reason": "Verified independent evidence",
                "skills": [
                    {
                        "skill_id": skill,
                        "verified": True,
                        "evidence_ref": "review-record",
                        "evidence_version": 1,
                    }
                ],
            },
        ).status_code
        == 200
    )
    assert (
        assign(
            admin, admin_headers, ids[0], allocations=[allocation("08:00", "08:29")]
        ).json()["code"]
        == "INCOMPLETE_ALLOCATION"
    )
    ready = Barrier(2, timeout=10)

    def compete(data):
        client, headers, task_id = data
        ready.wait()
        return assign(client, headers, task_id)

    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(
            pool.map(
                compete,
                [(admin, admin_headers, ids[0]), (manager, manager_headers, ids[1])],
            )
        )
    assert sorted(result.status_code for result in results) == [200, 409]
    assert (
        next(result for result in results if result.status_code == 409).json()["code"]
        == "INSUFFICIENT_CAPACITY"
    )
    winner = next(
        result.json()["id"] for result in results if result.status_code == 200
    )
    loser = next(task_id for task_id in ids if task_id != winner)
    assert (
        assign(
            admin, admin_headers, loser, allocations=[allocation("08:30", "09:00")]
        ).json()["code"]
        == "INSUFFICIENT_CAPACITY"
    )
    lock = f"{TASKS}/{winner}/assignment-lock"
    assert (
        command(
            admin,
            lock,
            admin_headers,
            {
                "expectedVersion": 2,
                "locked": True,
                "reason": "Preserve reviewed assignment",
            },
        ).status_code
        == 200
    )
    assert (
        assign(admin, admin_headers, winner, expectedVersion=3).json()["code"]
        == "ASSIGNMENT_UNAVAILABLE"
    )
    with database.transaction() as db:
        row = db.get(WorkTask, UUID(winner))
        assert row is not None
        row.status = "Blocked"
    progress = f"{TASKS}/{winner}/progress"
    assert (
        command(
            tech,
            progress,
            tech_headers,
            {"expectedVersion": 3, "remaining_minutes": 25},
        ).status_code
        == 200
    )
    assert (
        command(
            tech,
            progress,
            tech_headers,
            {"expectedVersion": 4, "remaining_minutes": 30},
        ).json()["code"]
        == "ALLOCATION_REQUIRED"
    )
    assert (
        patch(
            admin,
            admin_headers,
            profile,
            {
                "expectedVersion": 3,
                "reason": "Change approved working schedule",
                "days": [
                    {**calendar, "working_intervals": [allocation("08:30", "09:00")]}
                ],
            },
        ).status_code
        == 200
    )
    assert (
        command(
            tech,
            progress,
            tech_headers,
            {
                "expectedVersion": 4,
                "remaining_minutes": 30,
                "allocations": [allocation("08:00", "08:30")],
            },
        ).json()["code"]
        == "SLOT_UNAVAILABLE"
    )
    increased = command(
        tech,
        progress,
        tech_headers,
        {
            "expectedVersion": 4,
            "remaining_minutes": 30,
            "allocations": [allocation("08:30", "09:00")],
        },
    )
    assert increased.status_code == 200, increased.text
    assert increased.json()["remaining_minutes"] == 30
    with database.session() as db:
        history = list(
            db.scalars(
                select(TaskAllocation).where(TaskAllocation.task_id == UUID(winner))
            )
        )
        assert (
            len(history) == 3
            and len([row for row in history if row.released_at is None]) == 1
        )
