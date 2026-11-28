from typing import Any, Never
from uuid import UUID, uuid4

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError
from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from test_organization import ORIGIN, SETTINGS, actor
from test_ticket_intake import prepare_catalog
from test_ticket_lifecycle import command
from test_ticket_reads import TICKETS, create_ticket

from app.infrastructure.database import Database
from app.main import create_app
from app.modules.auth.service import AuthService
from app.modules.organization.models import Team, TeamMember
from app.modules.work_management import service
from app.modules.work_management.models import PlanVersion, WorkPlan, WorkTask
from app.modules.workforce.models import TaskSkillRequirement

TASKS = "/api/v1/tasks"


def manual_input(skill_id: str) -> dict[str, Any]:
    return {
        "expectedVersion": 1,
        "goal": "Restore internal service",
        "tasks": [
            {
                "title": "Check upstream link",
                "estimated_minutes": 30,
                "starts_at": "2026-11-25T08:00:00+07:00",
                "ends_at": "2026-11-25T09:00:00+07:00",
                "effort_evidence_ref": "reviewed-prior-run-42",
                "effort_evidence_version": 2,
                "required_skill_ids": [skill_id],
            }
        ],
    }


def test_manual_plan_persists_provenance_and_scopes_reads(
    database: Database, monkeypatch: pytest.MonkeyPatch
) -> None:
    category, team = prepare_catalog(database)
    app = create_app(AuthService(database), SETTINGS)
    owner, admin, in_team, other_team = [
        TestClient(app, base_url=ORIGIN) for _ in range(4)
    ]
    _, owner_headers = actor(database, owner, "REQUESTER")
    admin_id, admin_headers = actor(database, admin, "ADMIN")
    technician, tech_headers = actor(database, in_team, "TECHNICIAN")
    outsider, _ = actor(database, other_team, "TECHNICIAN")
    ticket = create_ticket(owner, owner_headers, category, "Manual plan test")
    url = f"{TICKETS}/{ticket['id']}/plans"
    with database.transaction() as db:
        destination = Team(
            id=uuid4(),
            name="New team",
            name_key="new team",
            active=True,
            intake=False,
            version=1,
        )
        db.add(destination)
        db.flush()
        next_team = destination.id
        db.add_all(
            [
                TeamMember(team_id=UUID(team), account_id=technician, active=True),
                TeamMember(team_id=next_team, account_id=outsider, active=True),
            ]
        )
    skill = command(
        admin, "/api/v1/workforce/skills", admin_headers, {"name": "Manual plan skill"}
    )
    assert skill.status_code == 201, skill.text
    payload = manual_input(skill.json()["id"])
    assert command(owner, url, owner_headers, payload).status_code == 403
    assert command(in_team, url, tech_headers, payload).status_code == 403
    assert (
        command(
            admin, url, admin_headers, {**payload, "expectedVersion": 2}
        ).status_code
        == 409
    )
    unknown = manual_input(str(uuid4()))
    assert command(admin, url, admin_headers, unknown).json()["code"] == "UNKNOWN_SKILL"

    def fail(db: Session, **kwargs: object) -> Never:
        db.flush()
        raise SQLAlchemyError("Synthetic audit failure")

    headers = {**admin_headers, "Idempotency-Key": "manual-plan-retry"}
    with monkeypatch.context() as patch:
        patch.setattr(service, "write_audit", fail)
        assert admin.post(url, json=payload, headers=headers).status_code == 503
    with database.session() as db:
        for model in (WorkPlan, PlanVersion, WorkTask, TaskSkillRequirement):
            assert db.scalar(select(func.count()).select_from(model)) == 0
    response = admin.post(url, json=payload, headers=headers)
    assert response.status_code == 201, response.text
    result = response.json()
    assert admin.post(url, json=payload, headers=headers).json() == result
    assert result["state"] == "Draft" and result["source_versions"] == {ticket["id"]: 1}
    task = result["tasks"][0]
    assert task["status"] == "To Do" and task["assignee_id"] is None
    assert task["estimated_minutes"] == task["remaining_minutes"] == 30
    assert task["team_id"] == team and task["required_skill_ids"] == [
        skill.json()["id"]
    ]
    assert task["starts_at"] == "2026-11-25T01:00:00Z"
    assert "reviewed-prior-run-42" not in str(result)
    task_id = UUID(task["id"])
    with database.session() as db:
        record = db.get(WorkTask, task_id)
        assert record is not None and record.effort_verified_by == admin_id
        assert (
            record.effort_evidence_ref == "reviewed-prior-run-42"
            and record.effort_evidence_version == 2
        )
    versions = f"/api/v1/plans/{result['id']}/versions"
    detail = f"{TASKS}/{task_id}"
    for private in (url, versions, detail, TASKS):
        assert owner.get(private).status_code == 403
    assert other_team.get(detail).status_code == 404
    assert other_team.get(TASKS).json()["total"] == 0
    assert in_team.get(url).json()["items"] == [result]
    assert in_team.get(versions).json()["items"] == [result]
    assert in_team.get(detail).json() == task
    assert in_team.get(TASKS, params={"status": "To Do", "page_size": 1}).json()[
        "items"
    ] == [task]
    assert in_team.get(TASKS, params={"scope": "mine"}).json()["total"] == 0
    moved = command(
        admin,
        f"{TICKETS}/{ticket['id']}/assignment",
        admin_headers,
        {
            "expectedVersion": 1,
            "reason": "Transfer internal support",
            "team_id": str(next_team),
        },
    )
    assert moved.status_code == 200
    assert (
        in_team.get(url).status_code == 404 and in_team.get(detail).status_code == 404
    )
    assert other_team.get(detail).status_code == 404
    assert owner.get(f"{TICKETS}/{ticket['id']}").json()["sla"] == ticket["sla"]


def test_manual_plan_requires_explicit_effort_evidence_and_window() -> None:
    body = manual_input(str(uuid4()))
    task = body["tasks"][0]
    for changes in (
        {"estimated_minutes": 0},
        {"estimated_minutes": 61},
        {"effort_evidence_ref": "  "},
        {"effort_evidence_version": 0},
        {"starts_at": "2026-11-25T08:00:00"},
        {"effort_verified_by": str(uuid4())},
    ):
        with pytest.raises(ValidationError):
            service.ManualPlanCreate.model_validate(
                {**body, "tasks": [{**task, **changes}]}
            )
    missing = {k: v for k, v in task.items() if k != "effort_evidence_ref"}
    with pytest.raises(ValidationError):
        service.ManualPlanCreate.model_validate({**body, "tasks": [missing]})
