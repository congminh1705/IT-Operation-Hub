from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime, timedelta
from threading import Barrier
from uuid import UUID, uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from test_organization import ORIGIN, SETTINGS, actor
from test_ticket_intake import prepare_catalog
from test_ticket_lifecycle import command
from test_ticket_reads import create_ticket

from app.infrastructure.database import Database
from app.infrastructure.models import AuditLog, DomainEvent, OutboxDelivery
from app.main import create_app
from app.modules.auth.models import Account
from app.modules.auth.service import AuthService
from app.modules.organization.models import Department, TeamMember
from app.modules.workforce import skills
from app.modules.workforce.models import (
    UserSkill,
    WorkforceSkillChange,
    WorkforceSkills,
)
from app.modules.workforce.skills import (
    missing_task_skills,
    set_task_skill_requirements,
)

URL = "/api/v1/workforce"


def verify(client, headers, subject, payload):
    return client.patch(
        f"{URL}/{subject}",
        json=payload,
        headers={**headers, "Idempotency-Key": str(uuid4())},
    )


def test_skill_verification_and_minimal_current_scope(database: Database) -> None:
    category, team = prepare_catalog(database)
    now = datetime.now(UTC)
    app = create_app(AuthService(database, clock=lambda: now), SETTINGS)
    admin, manager, tech, teammate, outsider, requester = (
        TestClient(app, base_url=ORIGIN) for _ in range(6)
    )
    admin_id, admin_headers = actor(database, admin, "ADMIN")
    manager_id, manager_headers = actor(database, manager, "IT_MANAGER")
    tech_id, tech_headers = actor(database, tech, "TECHNICIAN")
    teammate_id, _ = actor(database, teammate, "TECHNICIAN")
    outsider_id, _ = actor(database, outsider, "TECHNICIAN")
    _, requester_headers = actor(database, requester, "REQUESTER")
    dept, other = uuid4(), uuid4()
    with database.transaction() as db:
        db.add_all(
            [
                Department(
                    id=dept,
                    code=dept.hex,
                    name="Workforce IT",
                    name_key="workforce it",
                    active=True,
                    version=1,
                ),
                Department(
                    id=other,
                    code=other.hex,
                    name="Separate IT",
                    name_key="separate it",
                    active=True,
                    version=1,
                ),
            ]
        )
        db.flush()
        for identifier, department in (
            (manager_id, dept),
            (tech_id, dept),
            (teammate_id, dept),
            (outsider_id, other),
        ):
            person = db.get(Account, identifier)
            assert person is not None
            person.department_id = department
        db.add_all(
            TeamMember(team_id=UUID(team), account_id=user, active=True)
            for user in (tech_id, teammate_id)
        )

    global_skill = command(admin, URL + "/skills", admin_headers, {"name": "Network"})
    assert global_skill.status_code == 201, global_skill.text
    specific = command(
        manager, URL + "/skills", manager_headers, {"name": "Workforce storage"}
    )
    assert specific.status_code == 201 and specific.json()["department_id"] == str(dept)
    skill = UUID(global_skill.json()["id"])
    missing = UUID(specific.json()["id"])
    task = uuid4()
    with database.transaction() as db:
        set_task_skill_requirements(db, task, frozenset({skill, missing}))
    with database.session() as db:
        assert missing_task_skills(db, task, tech_id, now) == {skill, missing}
    payload = {
        "expectedVersion": 1,
        "reason": "Reviewed skill evidence",
        "skills": [
            {
                "skill_id": str(skill),
                "verified": True,
                "evidence_ref": "record-network",
                "evidence_version": 3,
                "expires_at": (now + timedelta(minutes=2)).isoformat(),
            },
            {"skill_id": str(missing), "verified": False},
        ],
    }
    assert verify(tech, tech_headers, tech_id, payload).status_code == 403
    assert verify(manager, manager_headers, manager_id, payload).status_code == 403
    assert verify(admin, admin_headers, admin_id, payload).status_code == 403
    assert verify(manager, manager_headers, outsider_id, payload).status_code == 404
    applied = verify(manager, manager_headers, tech_id, payload)
    assert applied.status_code == 200, applied.text
    view = applied.json()
    assert view["version"] == 2 and view["verified_skill_ids"] == [str(skill)]
    evidence = next(row for row in view["skills"] if row["skill_id"] == str(skill))
    assert evidence["verified_by"] == str(manager_id)
    assert evidence["verified_department_id"] == str(dept)
    assert evidence["evidence_version"] == 3 and evidence["version"] == 1
    assert datetime.fromisoformat(evidence["verified_at"]) == now
    assert verify(manager, manager_headers, tech_id, payload).status_code == 409
    with database.session() as db:
        assert missing_task_skills(db, task, tech_id, now) == {missing}
    assert set(tech.get(f"{URL}/{tech_id}").json()) == {
        "id",
        "version",
        "verified_skill_ids",
    }
    assert requester.get(URL).status_code == 403
    assert tech.get(f"{URL}/{teammate_id}").status_code == 404
    ticket = create_ticket(requester, requester_headers, category, "Scoped teammate")
    params = {"ticket_id": ticket["id"]}
    assert tech.get(URL, params=params).json()["total"] == 2
    minimal = teammate.get(f"{URL}/{tech_id}", params=params).json()
    assert "skills" not in minimal and minimal["verified_skill_ids"] == [str(skill)]
    assert "record-network" not in str(minimal)
    assert teammate.get(f"{URL}/{outsider_id}", params=params).status_code == 404
    assert admin.get(f"{URL}/{outsider_id}").json()["version"] == 1
    approved = verify(
        admin,
        admin_headers,
        outsider_id,
        {
            **payload,
            "skills": [
                {
                    "skill_id": str(skill),
                    "verified": True,
                    "evidence_ref": "admin-record",
                    "evidence_version": 1,
                }
            ],
        },
    )
    assert approved.status_code == 200, approved.text
    assert approved.json()["skills"][0]["verified_by"] == str(admin_id)
    now += timedelta(minutes=2)
    assert tech.get(f"{URL}/{tech_id}").json()["verified_skill_ids"] == []
    with database.session() as db:
        assert missing_task_skills(db, task, tech_id, now) == {skill, missing}


def test_skill_changes_are_atomic_and_event_payload_is_minimal(
    database: Database,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    app = create_app(AuthService(database), SETTINGS)
    first, second, technician = (TestClient(app, base_url=ORIGIN) for _ in range(3))
    _, first_headers = actor(database, first, "ADMIN")
    _, second_headers = actor(database, second, "ADMIN")
    subject, _ = actor(database, technician, "TECHNICIAN")
    created = command(
        first, URL + "/skills", first_headers, {"name": "Audit scope skill"}
    )
    assert created.status_code == 201, created.text
    skill = UUID(created.json()["id"])
    path = f"{URL}/{subject}"
    shared = {
        "expectedVersion": 1,
        "reason": "Restricted business context",
        "skills": [
            {
                "skill_id": str(skill),
                "verified": True,
                "evidence_ref": "private-record",
                "evidence_version": 3,
            }
        ],
    }
    ready = Barrier(2, timeout=10)

    def compete(participant):
        client, headers = participant
        ready.wait()
        return verify(client, headers, subject, shared)

    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(
            pool.map(compete, [(first, first_headers), (second, second_headers)])
        )
    assert sorted(response.status_code for response in results) == [200, 409]
    assert (
        next(response for response in results if response.status_code == 409).json()[
            "code"
        ]
        == "STALE_VERSION"
    )

    revoke = {
        "expectedVersion": 2,
        "reason": "Withdraw current verification",
        "skills": [{"skill_id": str(skill), "verified": False}],
    }
    headers = {**first_headers, "Idempotency-Key": "atomic-skill-revoke"}

    def fail(db, **kwargs):
        db.flush()
        raise SQLAlchemyError("Synthetic event failure")

    with monkeypatch.context() as patch:
        patch.setattr(skills, "enqueue_event", fail)
        assert first.patch(path, json=revoke, headers=headers).status_code == 503
    with database.session() as db:
        aggregate = db.get(WorkforceSkills, subject)
        assert aggregate is not None and aggregate.version == 2
        row = db.get(UserSkill, (subject, skill))
        assert row is not None and row.verified and row.version == 1
        assert db.get(WorkforceSkillChange, (subject, 3, skill)) is None
        audit = list(db.scalars(select(AuditLog).where(AuditLog.target_id == subject)))
        assert len(audit) == 1
    assert first.patch(path, json=revoke, headers=headers).status_code == 200
    assert first.patch(path, json=revoke, headers=headers).status_code == 200
    assert technician.get(path).json()["verified_skill_ids"] == []

    with database.session() as db:
        events = list(
            db.scalars(
                select(DomainEvent)
                .where(DomainEvent.aggregate_id == subject)
                .order_by(DomainEvent.aggregate_version)
            )
        )
        assert [(event.event_type, event.aggregate_version) for event in events] == [
            ("skills.changed", 2),
            ("skills.changed", 3),
        ]
        for event in events:
            assert event.aggregate_type == "workforce" and event.schema_version == 1
            assert event.payload == {
                "active": None,
                "assignee_id": None,
                "status": None,
                "version": event.aggregate_version,
            }
            ledger = db.get(
                WorkforceSkillChange, (subject, event.aggregate_version, skill)
            )
            assert ledger is not None
            delivery = db.scalar(
                select(OutboxDelivery).where(OutboxDelivery.event_id == event.id)
            )
            assert (
                delivery is not None
                and delivery.handler_purpose == "workforce.affected_work"
            )
        audit = list(db.scalars(select(AuditLog).where(AuditLog.target_id == subject)))
        assert len(audit) == 2
        assert all(
            item.before_after_redacted["after"]["reason_provided"] is True
            for item in audit
        )
        assert "private-record" not in str(
            [item.before_after_redacted for item in audit]
        )
        assert "Restricted business context" not in str(
            [item.before_after_redacted for item in audit]
        )
