from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime
from threading import Barrier
from typing import Never, cast
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from httpx import Response
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from test_organization import ORIGIN, SETTINGS, actor
from test_ticket_intake import prepare_catalog
from test_ticket_reads import TICKETS, create_ticket

from app.infrastructure.database import Database
from app.infrastructure.models import AuditLog, DomainEvent, OutboxDelivery
from app.main import create_app
from app.modules.auth.models import Account
from app.modules.auth.service import AuthService
from app.modules.organization.models import Department
from app.modules.workforce import availability
from app.modules.workforce.calendar import DayInput, Interval, period_availability
from app.modules.workforce.models import (
    CalendarDay,
    CapacityPeriodLock,
    WorkforceAbsence,
    WorkforceSkills,
)

DATE = date(2026, 11, 25)


def dt(value: str) -> datetime:
    return datetime.fromisoformat(value)


def slot(start: str, end: str) -> dict[str, str]:
    return {"starts_at": start, "ends_at": end}


def test_availability_uses_local_days_union_and_versioned_inputs(
    database: Database,
) -> None:
    client = TestClient(create_app(AuthService(database), SETTINGS), base_url=ORIGIN)
    person, _ = actor(database, client, "TECHNICIAN")
    with database.transaction() as db:
        db.add(WorkforceSkills(account_id=person, version=3))
        db.flush()
        for day, revision, holiday, budget, intervals in (
            (
                DATE,
                2,
                False,
                150,
                [
                    slot("2026-11-25T09:00+07:00", "2026-11-25T11:00+07:00"),
                    slot("2026-11-25T10:00+07:00", "2026-11-25T12:00+07:00"),
                ],
            ),
            (
                date(2026, 11, 26),
                2,
                False,
                90,
                [
                    slot("2026-11-26T00:00+07:00", "2026-11-26T01:00+07:00"),
                ],
            ),
            (date(2026, 11, 27), 2, True, 0, []),
            (date(2026, 11, 28), 2, False, None, []),
            (
                DATE,
                3,
                False,
                15,
                [
                    slot("2026-11-25T09:00+07:00", "2026-11-25T12:00+07:00"),
                ],
            ),
        ):
            plan = DayInput(
                local_date=day,
                holiday=holiday,
                budget_minutes=budget,
                working_intervals=[Interval.model_validate(item) for item in intervals],
            )
            db.add(
                CalendarDay(
                    account_id=person,
                    local_date=day,
                    workforce_version=revision,
                    holiday=holiday,
                    budget_minutes=budget,
                    intervals=[
                        item.model_dump(mode="json") for item in plan.working_intervals
                    ],
                )
            )
        for start, end in (
            ("2026-11-25T09:30+07:00", "2026-11-25T10:30+07:00"),
            ("2026-11-25T10:00+07:00", "2026-11-25T11:00+07:00"),
            ("2026-11-25T23:30+07:00", "2026-11-26T01:00+07:00"),
        ):
            db.add(
                WorkforceAbsence(
                    id=uuid4(),
                    account_id=person,
                    workforce_version=2,
                    starts_at=dt(start),
                    ends_at=dt(end),
                )
            )
    with database.session() as db:
        assert period_availability(db, person, 1, DATE, DATE)[0].status == "unknown"
        days = period_availability(db, person, 2, DATE, date(2026, 11, 29))
        assert [(day.status, day.capacity_minutes) for day in days] == [
            ("available", 90),
            ("absent", 0),
            ("off", 0),
            ("unknown", None),
            ("unknown", None),
        ]
        assert [(item.starts_at, item.ends_at) for item in days[0].slots] == [
            (dt("2026-11-25T02:00+00:00"), dt("2026-11-25T02:30+00:00")),
            (dt("2026-11-25T04:00+00:00"), dt("2026-11-25T05:00+00:00")),
        ]
        assert period_availability(db, person, 3, DATE, DATE)[0].capacity_minutes == 15


def test_reject_cross_midnight_schedule_and_unknown_holiday() -> None:
    config = {"local_date": DATE, "holiday": False, "budget_minutes": 120}
    with pytest.raises(ValidationError, match="local midnight"):
        DayInput.model_validate(
            {
                **config,
                "working_intervals": [
                    slot("2026-11-25T23:00+07:00", "2026-11-26T01:00+07:00")
                ],
            }
        )
    with pytest.raises(ValidationError):
        DayInput.model_validate(
            {
                k: v
                for k, v in {**config, "working_intervals": []}.items()
                if k != "holiday"
            }
        )


def test_calendar_commands_respect_scope_and_commit_atomic_effects(
    database: Database, monkeypatch: pytest.MonkeyPatch
) -> None:
    category, _ = prepare_catalog(database)
    app = create_app(AuthService(database), SETTINGS)
    admin, manager, tech, other, requester = (
        TestClient(app, base_url=ORIGIN) for _ in range(5)
    )
    _, admin_headers = actor(database, admin, "ADMIN")
    manager_id, manager_headers = actor(database, manager, "IT_MANAGER")
    tech_id, tech_headers = actor(database, tech, "TECHNICIAN")
    other_id, _ = actor(database, other, "TECHNICIAN")
    _, requester_headers = actor(database, requester, "REQUESTER")
    dept = uuid4()
    with database.transaction() as db:
        db.add(
            Department(
                id=dept,
                code=dept.hex,
                name="Calendar team",
                name_key="calendar team",
                active=True,
                version=1,
            )
        )
        db.flush()
        for account_id in (tech_id, manager_id):
            account = db.get(Account, account_id)
            assert account is not None
            account.department_id = dept
    url = f"/api/v1/workforce/{tech_id}"
    read = url + "/availability?start_date=2026-11-25&end_date=2026-11-27"
    day1 = {
        "local_date": "2026-11-25",
        "holiday": False,
        "budget_minutes": 150,
        "working_intervals": [slot("2026-11-25T21:00+07:00", "2026-11-26T00:00+07:00")],
    }
    day2 = {
        "local_date": "2026-11-26",
        "holiday": False,
        "budget_minutes": 90,
        "working_intervals": [slot("2026-11-26T00:00+07:00", "2026-11-26T01:30+07:00")],
    }
    payload = {
        "expectedVersion": 1,
        "reason": "Approved working schedule",
        "days": [day1, day2],
    }

    def patch(
        client: TestClient, headers: dict[str, str], target: str = url
    ) -> Response:
        return cast(
            Response,
            client.patch(
                target,
                json=payload,
                headers={**headers, "Idempotency-Key": str(uuid4())},
            ),
        )

    assert tech.get(read).json()["days"][0]["status"] == "unknown"
    assert requester.get(read).status_code == 403
    assert other.get(read).status_code == 404
    assert patch(tech, tech_headers).status_code == 403
    assert (
        patch(manager, manager_headers, f"/api/v1/workforce/{other_id}").status_code
        == 404
    )
    ticket = create_ticket(requester, requester_headers, category, "Independent SLA")
    ready = Barrier(2, timeout=10)

    def compete(actor_headers: tuple[TestClient, dict[str, str]]) -> Response:
        client, headers = actor_headers
        ready.wait()
        return patch(client, headers)

    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(
            pool.map(compete, [(manager, manager_headers), (admin, admin_headers)])
        )
    assert sorted(result.status_code for result in results) == [200, 409]
    assert (
        next(result for result in results if result.status_code == 409).json()["code"]
        == "STALE_VERSION"
    )
    absence = {
        "expectedVersion": 2,
        **slot("2026-11-25T22:00+07:00", "2026-11-26T01:30+07:00"),
        "reason": "Private absence reason",
    }
    headers = {**manager_headers, "Idempotency-Key": "calendar-rollback"}

    def fail(db: Session, **kwargs: object) -> Never:
        db.flush()
        raise SQLAlchemyError("Synthetic outbox failure")

    with monkeypatch.context() as patch_event:
        patch_event.setattr(availability, "enqueue_event", fail)
        assert (
            manager.post(url + "/absences", json=absence, headers=headers).status_code
            == 503
        )
    before_retry = tech.get(read).json()
    assert before_retry["version"] == 2
    assert [day["capacity_minutes"] for day in before_retry["days"]] == [150, 90, None]
    with database.session() as db:
        assert (
            db.scalar(
                select(WorkforceAbsence.id).where(
                    WorkforceAbsence.account_id == tech_id
                )
            )
            is None
        )
        assert (
            len(list(db.scalars(select(AuditLog).where(AuditLog.target_id == tech_id))))
            == 1
        )
    success = manager.post(url + "/absences", json=absence, headers=headers)
    assert success.status_code == 201, success.text
    assert (
        manager.post(url + "/absences", json=absence, headers=headers).json()
        == success.json()
    )
    result = tech.get(read).json()
    assert result["calendar_timezone"] == "Asia/Ho_Chi_Minh"
    assert result["version"] == 3
    assert [(day["status"], day["capacity_minutes"]) for day in result["days"]] == [
        ("available", 60),
        ("absent", 0),
        ("unknown", None),
    ]
    assert requester.get(f"{TICKETS}/{ticket['id']}").json()["sla"] == ticket["sla"]
    assert "Private absence reason" not in str(result)
    with database.session() as db:
        rows = list(
            db.scalars(
                select(CapacityPeriodLock).where(
                    CapacityPeriodLock.account_id == tech_id
                )
            )
        )
        assert {row.local_date for row in rows} == {
            date(2026, 11, 25),
            date(2026, 11, 26),
        }
        events = list(
            db.scalars(select(DomainEvent).where(DomainEvent.aggregate_id == tech_id))
        )
        assert {(event.event_type, event.aggregate_version) for event in events} == {
            ("availability.changed", 2),
            ("availability.changed", 3),
        }
        for event in events:
            assert event.payload["version"] == event.aggregate_version
            assert "Private absence reason" not in str(event.payload)
            delivery = db.scalar(
                select(OutboxDelivery).where(OutboxDelivery.event_id == event.id)
            )
            assert (
                delivery is not None
                and delivery.handler_purpose == "workforce.affected_work"
            )
