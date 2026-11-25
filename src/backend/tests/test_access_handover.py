from uuid import UUID

from fastapi.testclient import TestClient
from test_access_lifecycle import patch
from test_manual_allocation import allocation
from test_manual_work import TASKS, manual_input
from test_organization import ORIGIN, SETTINGS, actor
from test_ticket_intake import prepare_catalog
from test_ticket_lifecycle import command
from test_ticket_reads import TICKETS, create_ticket

from app.infrastructure.database import Database
from app.main import create_app
from app.modules.auth.service import AuthService
from app.modules.organization.models import TeamMember
from app.modules.tickets.models import Ticket
from app.modules.work_management.models import WorkTask


def test_regular_rollback_and_emergency_suspension_then_reviewed_repair(
    database: Database,
) -> None:
    category, team = prepare_catalog(database)
    app = create_app(AuthService(database), SETTINGS)
    admin, current, replacement, outsider, requester = (
        TestClient(app, base_url=ORIGIN) for _ in range(5)
    )
    _, admin_headers = actor(database, admin, "ADMIN")
    current_id, _ = actor(database, current, "TECHNICIAN")
    replacement_id, _ = actor(database, replacement, "TECHNICIAN")
    outsider_id, outside_headers = actor(database, outsider, "TECHNICIAN")
    _, owner_headers = actor(database, requester, "REQUESTER")
    original = create_ticket(requester, owner_headers, category, "Emergency work")
    ticket_id = UUID(original["id"])
    ticket_url = f"{TICKETS}/{ticket_id}"
    with database.transaction() as db:
        db.add_all(
            TeamMember(team_id=UUID(team), account_id=person, active=True)
            for person in (current_id, replacement_id)
        )
        ticket = db.get(Ticket, ticket_id)
        assert ticket is not None
        ticket.assignee_id = current_id
        ticket.status = "Pending"
    slots = [allocation("08:00", "08:30")]
    for person in (current_id, replacement_id):
        assert (
            patch(
                admin,
                admin_headers,
                f"/api/v1/workforce/{person}",
                {
                    "expectedVersion": 1,
                    "reason": "Set reviewed shift capacity",
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
    plan["tasks"][0]["required_skill_ids"] = []
    task = command(admin, ticket_url + "/plans", admin_headers, plan).json()["tasks"][0]
    task_url = f"{TASKS}/{task['id']}"
    assert (
        command(
            admin,
            task_url + "/assignment",
            admin_headers,
            {
                "expectedVersion": 1,
                "assignee_id": str(current_id),
                "team_id": team,
                "allocations": slots,
                "reason": "Assign reviewed work",
            },
        ).status_code
        == 200
    )
    with database.transaction() as db:
        work = db.get(WorkTask, UUID(task["id"]))
        assert work is not None
        work.status, work.assignment_locked = "In Progress", True

    user_url = f"/api/v1/users/{current_id}"
    reason = "Urgent access restriction"
    ticket_decision = {
        "kind": "ticket",
        "id": str(ticket_id),
        "expectedVersion": 1,
        "replacement_user_id": str(replacement_id),
    }
    task_decision = {
        "kind": "task",
        "id": task["id"],
        "expectedVersion": 2,
        "replacement_user_id": str(replacement_id),
        "allocations": slots,
    }
    request = {"expectedVersion": 1, "active": False, "reason": reason}
    current_ticket = admin.get(ticket_url).json()
    reject = patch(
        admin,
        admin_headers,
        user_url,
        {**request, "handover": [ticket_decision, task_decision]},
    )
    assert reject.json()["code"] == "PROTECTED_WORK_REVIEW_REQUIRED"
    assert admin.get(ticket_url).json() == current_ticket
    assert current.get("/api/v1/auth/me").status_code == 200

    suspension = patch(
        admin, admin_headers, user_url, {**request, "suspend_without_replacement": True}
    )
    assert suspension.status_code == 200, suspension.text
    assert (
        suspension.json()["active"] is False
        and suspension.json()["handover_pending"] is True
    )
    assert current.get("/api/v1/auth/me").status_code == 401
    assert admin.get(ticket_url).json()["sla"] == current_ticket["sla"]
    assert admin.get(task_url).json()["assignment_locked"] is True
    assert admin.get(task_url).json()["assignee_id"] == str(current_id)
    assert (
        patch(
            admin,
            admin_headers,
            user_url,
            {
                "expectedVersion": 2,
                "active": True,
                "reason": "Restore account after incident",
            },
        ).json()["code"]
        == "HANDOVER_PENDING"
    )
    assert (
        command(
            outsider,
            ticket_url + "/assignment",
            outside_headers,
            {
                "expectedVersion": 2,
                "team_id": team,
                "assignee_id": str(outsider_id),
            },
        ).status_code
        == 404
    )
    assert (
        command(
            admin,
            ticket_url + "/transitions",
            admin_headers,
            {
                "expectedVersion": 2,
                "target_status": "In Progress",
                "reason": "Blocked pending handover",
            },
        ).json()["code"]
        == "HANDOVER_PENDING"
    )
    assert (
        command(
            admin,
            task_url + "/progress",
            admin_headers,
            {
                "expectedVersion": 3,
                "remaining_minutes": 29,
            },
        ).json()["code"]
        == "HANDOVER_PENDING"
    )

    preview_url = user_url + "/handover"
    preview = admin.get(preview_url).json()
    assert preview["suspension_pending"] and {
        entry["version"] for entry in preview["items"]
    } == {2, 3}
    ticket_decision["expectedVersion"] = 2
    task_decision.update(expectedVersion=3, protected_work_reviewed=True)
    repair = {
        "expectedVersion": 2,
        "reason": "Repair reviewed work handover",
        "handover": [ticket_decision, task_decision],
    }
    invalid = {
        **repair,
        "handover": [{**ticket_decision, "replacement_user_id": None}, task_decision],
    }
    assert (
        command(admin, preview_url, admin_headers, invalid).json()["code"]
        == "REPLACEMENT_REQUIRED"
    )
    assert admin.get(preview_url).json()["suspension_pending"]
    completed = command(admin, preview_url, admin_headers, repair)
    assert completed.status_code == 200, completed.text
    assert not completed.json()["suspension_pending"]
    new_ticket = admin.get(ticket_url).json()
    new_work = admin.get(task_url).json()
    assert new_ticket["assignee_id"] == new_work["assignee_id"] == str(replacement_id)
    assert (
        new_ticket["status"] == "Pending" and new_ticket["sla"] == current_ticket["sla"]
    )
    assert new_work["status"] == "In Progress" and new_work["assignment_locked"]
    assert current.get("/api/v1/auth/me").status_code == 401
