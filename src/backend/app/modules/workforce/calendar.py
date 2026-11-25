from datetime import UTC, date, datetime, time, timedelta
from typing import Literal, Self
from uuid import UUID
from zoneinfo import ZoneInfo

from pydantic import (
    AwareDatetime,
    BaseModel,
    ConfigDict,
    Field,
    TypeAdapter,
    model_validator,
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.workforce.models import CalendarDay, WorkforceAbsence

BUSINESS_ZONE = ZoneInfo("Asia/Ho_Chi_Minh")
ONE_DAY = timedelta(days=1)


class Interval(BaseModel):
    model_config = ConfigDict(extra="forbid")

    starts_at: AwareDatetime
    ends_at: AwareDatetime

    @model_validator(mode="after")
    def validate_bounds(self) -> Self:
        try:
            self.starts_at = self.starts_at.astimezone(UTC)
            self.ends_at = self.ends_at.astimezone(UTC)
        except OverflowError:
            raise ValueError("Unsupported UTC boundary") from None
        if self.starts_at >= self.ends_at or any(
            instant.second or instant.microsecond
            for instant in (self.starts_at, self.ends_at)
        ):
            raise ValueError("Expected an increasing minute-aligned interval")
        return self


INTERVALS = TypeAdapter(list[Interval])


class DayInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    local_date: date
    holiday: bool = Field(strict=True)
    budget_minutes: int | None = Field(ge=0, le=1440, strict=True)
    working_intervals: list[Interval] = Field(max_length=96)

    @model_validator(mode="after")
    def validate_day(self) -> Self:
        if self.local_date in (date.min, date.max):
            raise ValueError("Unsupported local day boundary")
        start, end = day_bounds(self.local_date)
        if any(
            slot.starts_at < start or slot.ends_at > end
            for slot in self.working_intervals
        ):
            raise ValueError("Split working intervals at local midnight")
        if self.holiday and (self.working_intervals or self.budget_minutes != 0):
            raise ValueError("A holiday has no working intervals and a zero budget")
        return self


class DayAvailability(BaseModel):
    local_date: date
    status: Literal["unknown", "off", "absent", "available"]
    capacity_minutes: int | None
    slots: list[Interval]


def day_bounds(local_date: date) -> tuple[datetime, datetime]:
    return (
        datetime.combine(local_date, time.min, tzinfo=BUSINESS_ZONE).astimezone(UTC),
        datetime.combine(
            local_date + ONE_DAY, time.min, tzinfo=BUSINESS_ZONE
        ).astimezone(UTC),
    )


def union(intervals: list[Interval]) -> list[Interval]:
    merged: list[Interval] = []
    for interval in sorted(intervals, key=lambda item: item.starts_at):
        if not merged or interval.starts_at > merged[-1].ends_at:
            merged.append(interval)
        elif interval.ends_at > merged[-1].ends_at:
            merged[-1] = Interval(
                starts_at=merged[-1].starts_at, ends_at=interval.ends_at
            )
    return merged


def available_slots(
    schedule: list[Interval], absences: list[Interval]
) -> list[Interval]:
    remaining: list[Interval] = []
    blocked = union(absences)
    for shift in union(schedule):
        cursor = shift.starts_at
        for absence in blocked:
            if absence.ends_at <= cursor:
                continue
            if absence.starts_at >= shift.ends_at:
                break
            if cursor < absence.starts_at:
                remaining.append(Interval(starts_at=cursor, ends_at=absence.starts_at))
            cursor = max(cursor, absence.ends_at)
        if cursor < shift.ends_at:
            remaining.append(Interval(starts_at=cursor, ends_at=shift.ends_at))
    return remaining


def calculate_day(
    local_date: date, config: CalendarDay | None, absences: list[Interval]
) -> DayAvailability:
    if config is None or config.budget_minutes is None:
        return DayAvailability(
            local_date=local_date, status="unknown", capacity_minutes=None, slots=[]
        )
    if config.holiday or not config.intervals or config.budget_minutes == 0:
        return DayAvailability(
            local_date=local_date, status="off", capacity_minutes=0, slots=[]
        )
    slots = available_slots(INTERVALS.validate_python(config.intervals), absences)
    minutes = sum(
        int((slot.ends_at - slot.starts_at).total_seconds()) // 60 for slot in slots
    )
    return DayAvailability(
        local_date=local_date,
        status="available" if slots else "absent",
        capacity_minutes=min(config.budget_minutes, minutes),
        slots=slots,
    )


def period_availability(
    db: Session, account_id: UUID, version: int, start: date, end: date
) -> list[DayAvailability]:
    """Read a workforce version over the inclusive local-day bounds."""
    configs = {
        row.local_date: row
        for row in db.scalars(
            select(CalendarDay)
            .where(
                CalendarDay.account_id == account_id,
                CalendarDay.local_date.between(start, end),
                CalendarDay.workforce_version <= version,
            )
            .order_by(CalendarDay.workforce_version)
        )
    }
    lower, _ = day_bounds(start)
    _, upper = day_bounds(end)
    blocked = [
        Interval(starts_at=row.starts_at, ends_at=row.ends_at)
        for row in db.scalars(
            select(WorkforceAbsence).where(
                WorkforceAbsence.account_id == account_id,
                WorkforceAbsence.workforce_version <= version,
                WorkforceAbsence.starts_at < upper,
                WorkforceAbsence.ends_at > lower,
            )
        )
    ]
    days = [start + index * ONE_DAY for index in range((end - start).days + 1)]
    return [calculate_day(day, configs.get(day), blocked) for day in days]
