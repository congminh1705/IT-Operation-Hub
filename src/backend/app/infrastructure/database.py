from collections.abc import Iterator
from contextlib import contextmanager

from sqlalchemy import URL, create_engine, make_url
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker


def create_database_engine(url: str | URL) -> Engine:
    parsed = make_url(url)
    if parsed.drivername not in {"postgresql", "postgresql+psycopg"}:
        raise ValueError("A PostgreSQL URL using Psycopg is required.")
    return create_engine(
        parsed.set(drivername="postgresql+psycopg"),
        pool_pre_ping=True,
        connect_args={"connect_timeout": 3},
    )


class Database:
    def __init__(self, engine: Engine) -> None:
        self.engine = engine
        self._sessions = sessionmaker(engine, expire_on_commit=False)

    @contextmanager
    def session(self) -> Iterator[Session]:
        """Return an isolated session for one request or job, with no implicit write."""
        with self._sessions() as session:
            yield session

    @contextmanager
    def transaction(self) -> Iterator[Session]:
        """Own commit/rollback and close the session at the command boundary."""
        with self._sessions.begin() as session:
            yield session
