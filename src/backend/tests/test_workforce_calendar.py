from datetime import date, datetime
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError
from test_organization import ORIGIN, SETTINGS, actor

from app.infrastructure.database import Database
from app.main import create_app
from app.modules.auth.service import AuthService
from app.modules.workforce.calendar import DayInput, period_availability
from app.modules.workforce.models import CalendarDay, WorkforceAbsence, WorkforceSkills

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
                working_intervals=intervals,
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
