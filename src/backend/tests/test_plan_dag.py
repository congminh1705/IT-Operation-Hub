import pytest
from sqlalchemy import func, select
from starlette.testclient import TestClient
from test_manual_work import manual_input
from test_organization import ORIGIN, SETTINGS, actor
from test_ticket_intake import prepare_catalog
from test_ticket_lifecycle import command
from test_ticket_reads import TICKETS, create_ticket

from app.infrastructure.database import Database
from app.main import create_app
from app.modules.auth.service import AuthService
from app.modules.tickets.assignment import TicketCommandRejected
from app.modules.work_management.models import TaskDependency, WorkPlan
from app.modules.work_management.service import PlanDependencyInput, ordered_plan_nodes


def edge(task: int, predecessor: int) -> PlanDependencyInput:
    return PlanDependencyInput(task_index=task, predecessor_index=predecessor)


def test_plan_dependencies_order_nodes() -> None:
    assert ordered_plan_nodes(3, [edge(0, 2), edge(2, 1)]) == [1, 2, 0]


@pytest.mark.parametrize(
    ("edges", "code"),
    [
        ([edge(1, 3)], "UNKNOWN_PLAN_NODE"),
        ([edge(0, 0)], "INVALID_PLAN_DEPENDENCY"),
        ([edge(1, 0), edge(1, 0)], "INVALID_PLAN_DEPENDENCY"),
        ([edge(0, 1), edge(1, 2), edge(2, 0)], "PLAN_DEPENDENCY_CYCLE"),
    ],
)
def test_invalid_plan_dependencies(edges: list[PlanDependencyInput], code: str) -> None:
    with pytest.raises(TicketCommandRejected) as error:
        ordered_plan_nodes(3, edges)
    assert error.value.code == code


def test_draft_persists_only_valid_plan_dependencies(database: Database) -> None:
    category, _ = prepare_catalog(database)
    app = create_app(AuthService(database), SETTINGS)
    with (
        TestClient(app, base_url=ORIGIN) as owner,
        TestClient(app, base_url=ORIGIN) as admin,
    ):
        _, owner_headers = actor(database, owner, "REQUESTER")
        _, admin_headers = actor(database, admin, "ADMIN")
        ticket = create_ticket(owner, owner_headers, category, "DAG draft")
        url = f"{TICKETS}/{ticket['id']}/plans"
        payload = manual_input("unused")
        first = {**payload["tasks"][0], "required_skill_ids": []}
        payload["tasks"] = [first, {**first, "title": "Verify recovery"}]
        payload["dependencies"] = [
            {"task_index": 1, "predecessor_index": 0},
            {"task_index": 0, "predecessor_index": 1},
        ]
        rejected = command(admin, url, admin_headers, payload)
        assert rejected.status_code == 422
        assert rejected.json()["code"] == "PLAN_DEPENDENCY_CYCLE"
        with database.session() as db:
            assert db.scalar(select(func.count()).select_from(WorkPlan)) == 0
        payload["dependencies"].pop()
        accepted = command(admin, url, admin_headers, payload)
        assert accepted.status_code == 201, accepted.text
        draft = accepted.json()
        tasks = {task["title"]: task for task in draft["tasks"]}
        assert tasks["Verify recovery"]["predecessor_ids"] == [
            tasks["Check upstream link"]["id"]
        ]
        with database.session() as db:
            assert db.scalar(select(func.count()).select_from(TaskDependency)) == 1
