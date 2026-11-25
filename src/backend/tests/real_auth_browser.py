"""Run the INT-01.01 browser suite against an isolated real PostgreSQL schema."""

import os
import secrets
import subprocess
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path
from uuid import uuid4

import uvicorn
from alembic import command
from alembic.config import Config
from sqlalchemy import make_url, select, update
from sqlalchemy.schema import CreateSchema, DropSchema

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

from app.infrastructure.database import Database, create_database_engine
from app.main import create_app
from app.modules.auth.http import AuthSettings
from app.modules.auth.models import Account, AuthSession
from app.modules.auth.service import AuthService

FRONTEND_ORIGIN = "http://127.0.0.1:3101"
BACKEND_ORIGIN = "http://127.0.0.1:8101"
ROLES = ("REQUESTER", "TECHNICIAN", "IT_MANAGER", "ADMIN")


def database() -> Database:
    return Database(
        create_database_engine(
            make_url(os.environ["ITOH_TEST_DATABASE_URL"]).update_query_dict(
                {
                    "options": "-csearch_path=" + os.environ["ITOH_REAL_E2E_SCHEMA"],
                }
            )
        )
    )


def serve() -> None:
    db = database()
    cfg = Config(str(BACKEND / "alembic.ini"))
    with db.engine.begin() as connection:
        cfg.attributes["connection"] = connection
        command.upgrade(cfg, "head")
    auth = AuthService(db)
    hashed = auth.hasher.hash(os.environ["ITOH_REAL_E2E_PASSWORD"])
    with db.transaction() as session:
        for role in ROLES:
            session.add(
                Account(
                    id=uuid4(),
                    email=f"{role.lower()}@integration.invalid",
                    display_name=f"Integration {role}",
                    role=role,
                    active=True,
                    version=1,
                    password_hash=hashed,
                )
            )
    application = create_app(
        auth, AuthSettings(frozenset({FRONTEND_ORIGIN}), secure_cookies=False)
    )
    uvicorn.run(application, host="127.0.0.1", port=8101, log_level="warning")


def expire(email: str) -> None:
    db = database()
    with db.transaction() as session:
        account_id = session.scalar(select(Account.id).where(Account.email == email))
        assert account_id is not None
        older = datetime.now(UTC) - timedelta(minutes=2)
        session.execute(
            update(AuthSession)
            .where(
                AuthSession.account_id == account_id, AuthSession.revoked_at.is_(None)
            )
            .values(idle_until=older, expires_at=older)
        )


def run() -> int:
    control = create_database_engine(os.environ["ITOH_TEST_DATABASE_URL"])
    schema = "int01_" + uuid4().hex
    with control.begin() as connection:
        connection.execute(CreateSchema(schema))
    env = {
        **os.environ,
        "ITOH_REAL_E2E_SCHEMA": schema,
        "ITOH_REAL_E2E_PASSWORD": secrets.token_urlsafe(24),
        "ITOH_REAL_E2E_PYTHON": sys.executable,
        "ITOH_REAL_E2E_SCRIPT": str(Path(__file__).resolve()),
        "ITOH_AUTH_MODE": "real",
        "ITOH_BACKEND_ORIGIN": BACKEND_ORIGIN,
        "PLAYWRIGHT_BASE_URL": FRONTEND_ORIGIN,
    }
    worker = subprocess.Popen([sys.executable, __file__, "serve"], cwd=BACKEND, env=env)
    try:
        return subprocess.run(
            [
                "pnpm.cmd" if os.name == "nt" else "pnpm",
                "exec",
                "playwright",
                "test",
                "e2e/real-auth.spec.ts",
            ],
            cwd=BACKEND.parent / "frontend",
            env=env,
            check=False,
        ).returncode
    finally:
        worker.terminate()
        worker.wait(timeout=10)
        with control.begin() as connection:
            connection.execute(DropSchema(schema, cascade=True))
        control.dispose()


if __name__ == "__main__":
    if sys.argv[1:] == ["serve"]:
        serve()
    elif sys.argv[1:2] == ["expire"]:
        expire(sys.argv[2])
    else:
        raise SystemExit(run())
