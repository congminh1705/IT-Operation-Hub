from datetime import date, timedelta
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.infrastructure.clock import Clock, read_utc
from app.infrastructure.commands import CommandResult
from app.infrastructure.events import (
    Actor,
    AuditReason,
    SafeFacts,
    Target,
    enqueue_event,
    write_audit,
)
from app.modules.auth.models import Account
from app.modules.workforce.calendar import (
    BUSINESS_ZONE,
    ONE_DAY,
    DayAvailability,
    DayInput,
    Interval,
    period_availability,
)
from app.modules.workforce.models import (
    CalendarDay,
    CapacityPeriodLock,
    WorkforceAbsence,
    WorkforceSkills,
)
from app.modules.workforce.skills import (
    MANAGEMENT,
    WorkforceRejected,
    lock_workforce,
    workforce_account,
)

MAX_DAYS = 366


class CalendarUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    expectedVersion: int = Field(ge=1, strict=True)
    days: list[DayInput] = Field(min_length=1, max_length=MAX_DAYS)
    reason: str = Field(min_length=10, max_length=10000)
    reason_code: AuditReason | None = None


class AbsenceCreate(Interval):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    expectedVersion: int = Field(ge=1, strict=True)
    reason: str = Field(min_length=10, max_length=10000)
    reason_code: AuditReason | None = None


class AvailabilityView(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    version: int
    calendar_timezone: str = BUSINESS_ZONE.key
    days: list[DayAvailability]


class AbsenceReference(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    version: int


def date_range(start: date, end: date) -> list[date]:
    count = (end - start).days + 1
    if not 1 <= count <= MAX_DAYS or start == date.min or end == date.max:
        raise WorkforceRejected(422, "INVALID_CALENDAR_RANGE")
    return [start + offset * ONE_DAY for offset in range(count)]


def get_availability(
    db: Session, actor: Account, account_id: UUID, start: date, end: date
) -> AvailabilityView:
    workforce_account(db, actor, account_id)
    date_range(start, end)
    aggregate = db.get(WorkforceSkills, account_id)
    version = aggregate.version if aggregate else 1
    return AvailabilityView(
        id=account_id,
        version=version,
        days=period_availability(db, account_id, version, start, end),
    )


def lock_capacity_periods(db: Session, account_id: UUID, dates: set[date]) -> None:
    # The caller holds the workforce row before acquiring person/day rows.
    db.execute(
        insert(CapacityPeriodLock)
        .values(
            [{"account_id": account_id, "local_date": day} for day in sorted(dates)]
        )
        .on_conflict_do_nothing(index_elements=["account_id", "local_date"])
    )
    db.scalars(
        select(CapacityPeriodLock)
        .where(
            CapacityPeriodLock.account_id == account_id,
            CapacityPeriodLock.local_date.in_(dates),
        )
        .order_by(CapacityPeriodLock.local_date)
        .with_for_update()
    ).all()


def update_calendar(
    db: Session, actor: Account, account_id: UUID, body: CalendarUpdate, clock: Clock
) -> CommandResult:
    dates = {day.local_date for day in body.days}
    if len(dates) != len(body.days):
        raise WorkforceRejected(422, "DUPLICATE_CALENDAR_DAY")
    aggregate = lock_availability(
        db, actor, account_id, body.expectedVersion, body.reason, dates
    )
    db.add_all(
        CalendarDay(
            account_id=account_id,
            local_date=day.local_date,
            workforce_version=aggregate.version,
            holiday=day.holiday,
            budget_minutes=day.budget_minutes,
            intervals=[
                interval.model_dump(mode="json") for interval in day.working_intervals
            ],
        )
        for day in body.days
    )
    record_availability(
        db, actor, aggregate, "workforce.calendar_update", clock, body.reason_code
    )
    return CommandResult(account_id, aggregate.version)


def record_absence(
    db: Session, actor: Account, account_id: UUID, body: AbsenceCreate, clock: Clock
) -> CommandResult:
    try:
        start = body.starts_at.astimezone(BUSINESS_ZONE).date()
        end = (
            (body.ends_at - timedelta(microseconds=1)).astimezone(BUSINESS_ZONE).date()
        )
    except OverflowError:
        raise WorkforceRejected(422, "INVALID_CALENDAR_RANGE") from None
    dates = set(date_range(start, end))
    aggregate = lock_availability(
        db, actor, account_id, body.expectedVersion, body.reason, dates
    )
    absence_id = uuid4()
    db.add(
        WorkforceAbsence(
            id=absence_id,
            account_id=account_id,
            workforce_version=aggregate.version,
            starts_at=body.starts_at,
            ends_at=body.ends_at,
        )
    )
    record_availability(
        db, actor, aggregate, "workforce.absence_create", clock, body.reason_code
    )
    return CommandResult(absence_id, aggregate.version)


def lock_availability(
    db: Session,
    actor: Account,
    account_id: UUID,
    version: int,
    reason: str,
    dates: set[date],
) -> WorkforceSkills:
    if actor.role not in MANAGEMENT:
        raise WorkforceRejected(403, "FORBIDDEN")
    aggregate = lock_workforce(db, actor, account_id, version)
    if chr(0) in reason:
        raise WorkforceRejected(422, "INVALID_REASON")
    lock_capacity_periods(db, account_id, dates)
    aggregate.version += 1
    return aggregate


def record_availability(
    db: Session,
    actor: Account,
    aggregate: WorkforceSkills,
    action: str,
    clock: Clock,
    reason_code: AuditReason | None = None,
) -> None:
    now = read_utc(clock)
    source, target = Actor("user", actor.id), Target("workforce", aggregate.account_id)
    write_audit(
        db,
        actor=source,
        action=action,
        target=target,
        before=SafeFacts(version=aggregate.version - 1),
        after=SafeFacts(
            version=aggregate.version, reason_provided=True, reason_code=reason_code
        ),
        clock=lambda: now,
    )
    enqueue_event(
        db,
        actor=source,
        target=target,
        event_type="availability.changed",
        schema_version=1,
        aggregate_version=aggregate.version,
        correlation_id=aggregate.account_id,
        handlers=("workforce.affected_work",),
        facts=SafeFacts(version=aggregate.version),
        clock=lambda: now,
    )


def absence_reference(
    db: Session, actor: Account, account_id: UUID, result: CommandResult
) -> AbsenceReference:
    if actor.role not in MANAGEMENT:
        raise WorkforceRejected(403, "FORBIDDEN")
    workforce_account(db, actor, account_id)
    absence = db.get(WorkforceAbsence, result.id)
    if absence is None or absence.account_id != account_id:
        raise WorkforceRejected(404, "NOT_FOUND")
    return AbsenceReference(id=absence.id, version=absence.workforce_version)
