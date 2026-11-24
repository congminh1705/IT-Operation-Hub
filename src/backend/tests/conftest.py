import os
from collections.abc import Iterator
from pathlib import Path
from uuid import uuid4

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import make_url
from sqlalchemy.schema import CreateSchema, DropSchema

from app.infrastructure.database import Database, create_database_engine


def migrate_database(db: Database, revision: str = "head") -> None:
    config = Config(str(Path(__file__).resolve().parents[1] / "alembic.ini"))
    with db.engine.begin() as connection:
        config.attributes["connection"] = connection
        command.upgrade(config, revision)


@pytest.fixture
def empty_database() -> Iterator[Database]:
    url = os.getenv("ITOH_TEST_DATABASE_URL")
    if not url:
        pytest.skip("Set ITOH_TEST_DATABASE_URL to a disposable PostgreSQL database.")
    schema = "fnd02_" + uuid4().hex
    control = create_database_engine(url)
    with control.begin() as connection:
        connection.execute(CreateSchema(schema))
    engine = create_database_engine(
        make_url(url).update_query_dict({"options": f"-csearch_path={schema}"})
    )
    try:
        yield Database(engine)
    finally:
        engine.dispose()
        with control.begin() as connection:
            connection.execute(DropSchema(schema, cascade=True))
        control.dispose()


@pytest.fixture
def database(empty_database: Database) -> Database:
    migrate_database(empty_database)
    return empty_database
