from collections.abc import Callable
from datetime import UTC, datetime

type Clock = Callable[[], datetime]


def utc_now() -> datetime:
    return datetime.now(UTC)


def read_utc(clock: Clock) -> datetime:
    value = clock()
    if value.utcoffset() is None:
        raise ValueError("Clock must return a timezone-aware datetime.")
    return value.astimezone(UTC)
