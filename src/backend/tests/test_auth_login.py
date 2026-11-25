from datetime import UTC, datetime, timedelta
from typing import cast
from uuid import uuid4

from fastapi.testclient import TestClient
from httpx import Response
from sqlalchemy import select

from app.infrastructure.database import Database
from app.infrastructure.models import AuditLog
from app.main import create_app
from app.modules.auth.http import AuthSettings
from app.modules.auth.models import Account, AuthSession, LoginBudget
from app.modules.auth.service import AuthService, digest

ORIGIN = "https://itoh.example.invalid"
EMAIL = "login@example.invalid"
PASSWORD = "Synthetic test secret only"
BASE = "/api/v1/auth"


def seed(service: AuthService, *, active: bool = True) -> None:
    with service.database.transaction() as db:
        db.add(
            Account(
                id=uuid4(),
                email=EMAIL,
                display_name="Synthetic",
                role="REQUESTER",
                active=active,
                version=1,
                password_hash=service.hasher.hash(PASSWORD),
            )
        )


def preflight(client: TestClient) -> str:
    response = client.get(f"{BASE}/csrf")
    assert response.status_code == 200
    assert response.headers["cache-control"] == "no-store"
    cookie = response.headers["set-cookie"]
    assert cookie.startswith("__Host-itoh_pre=")
    assert "HttpOnly" in cookie and "Secure" in cookie and "SameSite=lax" in cookie
    assert "Path=/" in cookie and "Domain=" not in cookie
    return str(response.json()["csrf_token"])


def login(
    client: TestClient,
    token: str,
    password: str = PASSWORD,
    email: str = EMAIL,
    origin: str = ORIGIN,
) -> Response:
    return cast(
        Response,
        client.post(
            f"{BASE}/login",
            headers={"Origin": origin, "X-CSRF-Token": token},
            json={"email": email, "password": password},
        ),
    )


def test_origin_csrf_login_and_rotation(database: Database) -> None:
    service = AuthService(database)
    seed(service)
    settings = AuthSettings(frozenset({ORIGIN}))
    with TestClient(create_app(service, settings), base_url=ORIGIN) as client:
        token = preflight(client)
        assert (
            login(client, token, origin="https://other.example.invalid").status_code
            == 403
        )
        assert login(client, "invalid").status_code == 403
        result = login(client, token, email=EMAIL.upper())
        assert result.status_code == 200
        assert set(result.json()) == {
            "id",
            "email",
            "display_name",
            "role",
            "active",
            "version",
        }
        assert result.headers["cache-control"] == "no-store"
        cookies = result.headers.get_list("set-cookie")
        assert len(cookies) == 2 and "__Host-itoh_pre=" in cookies[0]
        assert all(
            "Secure" in cookie
            and "HttpOnly" in cookie
            and "Path=/" in cookie
            and "SameSite=lax" in cookie
            and "Domain=" not in cookie
            for cookie in cookies
        )
        old = client.cookies[settings.session_cookie]
        assert login(client, token).status_code == 403
        assert login(client, preflight(client)).status_code == 200
        fresh = client.cookies[settings.session_cookie]
        assert fresh != old
    with database.session() as db:
        assert db.get(AuthSession, old) is None
        old_record = db.get(AuthSession, digest(old))
        fresh_record = db.get(AuthSession, digest(fresh))
        assert old_record is not None and old_record.revoked_at is not None
        assert fresh_record is not None and fresh_record.revoked_at is None
        assert fresh_record.expires_at - fresh_record.idle_until == timedelta(
            hours=11, minutes=30
        )


def test_generic_errors_and_throttle(database: Database) -> None:
    instant = datetime(2026, 11, 25, tzinfo=UTC)

    def clock() -> datetime:
        return instant

    service = AuthService(database, clock)
    seed(service, active=False)
    with TestClient(
        create_app(service, AuthSettings(frozenset({ORIGIN}))), base_url=ORIGIN
    ) as client:
        token = preflight(client)
        for response in (
            login(client, token, email="unknown@example.invalid"),
            login(client, token),
            login(client, token, "wrong"),
        ):
            assert response.status_code == 401
            assert response.json()["code"] == "INVALID_CREDENTIALS"
        for _ in range(3):
            assert login(client, token, "wrong").status_code == 401
        throttled = login(client, token)
        assert throttled.status_code == 429
        assert throttled.headers["retry-after"] == "30"
        instant += timedelta(seconds=30)
        assert login(client, token).status_code == 401
        assert login(client, token).headers["retry-after"] == "60"
    with database.session() as db:
        assert (
            db.scalar(
                select(LoginBudget.attempts).where(
                    LoginBudget.identity_hash == digest(EMAIL)
                )
            )
            == 6
        )
        assert db.scalar(select(AuthSession)) is None


def test_bootstrap_is_once_and_temporary_credential_is_consumed(
    database: Database,
) -> None:
    import pytest

    service = AuthService(database)
    authorization = uuid4()
    with pytest.raises(ValueError, match="policy"):
        service.bootstrap_admin(
            authorization, EMAIL, "Synthetic", PASSWORD, {PASSWORD.casefold()}
        )
    account = service.bootstrap_admin(
        authorization, EMAIL, "Synthetic", PASSWORD, set()
    )
    with pytest.raises(ValueError, match="already exists"):
        service.bootstrap_admin(
            authorization, "second@example.invalid", "Second", PASSWORD, set()
        )
    settings = AuthSettings(frozenset({ORIGIN}))
    with TestClient(create_app(service, settings), base_url=ORIGIN) as client:
        first = login(client, preflight(client))
        assert (
            first.status_code == 403
            and first.json()["code"] == "PASSWORD_CHANGE_REQUIRED"
        )
        token = client.cookies[settings.session_cookie]
        assert login(client, preflight(client)).status_code == 401
    with database.session() as db:
        entry = db.scalar(select(AuditLog).where(AuditLog.target_id == account))
        assert entry is not None and entry.actor_id == authorization
        restricted = db.get(AuthSession, digest(token))
        assert restricted is not None and restricted.password_change_only


def test_store_failure_does_not_issue_session(database: Database) -> None:
    from sqlalchemy import text

    service = AuthService(database)
    seed(service)
    settings = AuthSettings(frozenset({ORIGIN}))
    with TestClient(create_app(service, settings), base_url=ORIGIN) as client:
        token = preflight(client)
        with database.engine.begin() as conn:
            conn.execute(
                text("ALTER TABLE auth_login_budget RENAME TO inactive_budget")
            )
        response = login(client, token)
        assert response.status_code == 503
        assert settings.session_cookie not in client.cookies
        assert response.json()["code"] == "AUTH_UNAVAILABLE"


def test_validation_hides_submitted_values_and_dev_cookie_names(
    database: Database,
) -> None:
    origin = "http://localhost"
    settings = AuthSettings(frozenset({origin}), secure_cookies=False)
    with TestClient(
        create_app(AuthService(database), settings), base_url=origin
    ) as client:
        pre = client.get(f"{BASE}/csrf")
        assert pre.headers["set-cookie"].startswith("itoh_dev_pre=")
        result = client.post(
            f"{BASE}/login",
            headers={"Origin": origin, "X-CSRF-Token": pre.json()["csrf_token"]},
            json={"email": EMAIL, "password": PASSWORD, "role": "ADMIN"},
        )
        assert result.status_code == 422
        assert PASSWORD not in result.text
