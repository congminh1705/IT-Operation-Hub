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
    response = client.get(f"{BASE}/csrf?purpose=login")
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


def test_current_role_logout_and_replayed_session(database: Database) -> None:
    service = AuthService(database)
    seed(service)
    settings = AuthSettings(frozenset({ORIGIN}))
    application = create_app(service, settings)
    with TestClient(application, base_url=ORIGIN) as client:
        login_csrf = preflight(client)
        assert login(client, login_csrf).status_code == 200
        old = client.cookies[settings.session_cookie]
        me = client.get(
            f"{BASE}/me", headers={"X-Role": "ADMIN"}, params={"role": "ADMIN"}
        )
        assert me.status_code == 200 and me.json()["role"] == "REQUESTER"
        assert me.headers["cache-control"] == "no-store"
        with database.transaction() as db:
            account = db.scalar(select(Account).where(Account.email == EMAIL))
            assert account is not None
            account.role = "TECHNICIAN"
            account.version += 1
        assert client.get(f"{BASE}/me").json()["role"] == "TECHNICIAN"

        csrf_response = client.get(f"{BASE}/csrf")
        csrf = str(csrf_response.json()["csrf_token"])
        assert csrf_response.headers["cache-control"] == "no-store"
        assert csrf != login_csrf
        assert (
            client.post(
                f"{BASE}/logout",
                headers={
                    "Origin": "https://other.example.invalid",
                    "X-CSRF-Token": csrf,
                },
            ).status_code
            == 403
        )
        assert (
            client.post(
                f"{BASE}/logout",
                headers={
                    "Origin": ORIGIN,
                    "X-CSRF-Token": login_csrf,
                },
            ).status_code
            == 403
        )
        result = client.post(
            f"{BASE}/logout", headers={"Origin": ORIGIN, "X-CSRF-Token": csrf}
        )
        assert result.status_code == 204 and not result.content
        assert "Max-Age=0" in result.headers["set-cookie"]
        assert settings.session_cookie not in client.cookies
        client.cookies.set(settings.session_cookie, old)
        assert client.get(f"{BASE}/me").status_code == 401
        assert client.get(f"{BASE}/csrf").status_code == 401
    with database.session() as db:
        record = db.get(AuthSession, digest(old))
        assert record is not None and record.revoked_at is not None
    with TestClient(application, base_url=ORIGIN) as anonymous:
        result = anonymous.get(f"{BASE}/me", headers={"X-Role": "ADMIN"})
        assert result.status_code == 401 and "display_name" not in result.json()


def test_idle_and_absolute_expiry_and_account_revocation(database: Database) -> None:
    from app.modules.auth.service import revoke_account_sessions

    now = datetime(2026, 11, 25, tzinfo=UTC)

    def clock() -> datetime:
        return now

    service = AuthService(database, clock)
    seed(service)
    settings = AuthSettings(frozenset({ORIGIN}))
    with TestClient(create_app(service, settings), base_url=ORIGIN) as client:
        assert login(client, preflight(client)).status_code == 200
        idle_token = client.cookies[settings.session_cookie]
        now += timedelta(minutes=29)
        assert client.get(f"{BASE}/me").status_code == 200
        now += timedelta(minutes=1)
        assert client.get(f"{BASE}/me").status_code == 401

        assert login(client, preflight(client)).status_code == 200
        absolute_token = client.cookies[settings.session_cookie]
        with database.transaction() as db:
            record = db.get(AuthSession, digest(absolute_token))
            assert record is not None
            record.idle_until = now + timedelta(hours=13)
        now += timedelta(hours=12)
        assert client.get(f"{BASE}/me").status_code == 401

        assert login(client, preflight(client)).status_code == 200
        with database.transaction() as db:
            account = db.scalar(select(Account).where(Account.email == EMAIL))
            assert account is not None
            revoke_account_sessions(db, account.id, now)
        assert client.get(f"{BASE}/me").status_code == 401

        assert login(client, preflight(client)).status_code == 200
        with database.transaction() as db:
            account = db.scalar(select(Account).where(Account.email == EMAIL))
            assert account is not None
            account.active = False
        assert client.get(f"{BASE}/me").status_code == 401
        with database.transaction() as db:
            account = db.scalar(select(Account).where(Account.email == EMAIL))
            assert account is not None
            account.active = True
        assert client.get(f"{BASE}/me").status_code == 401

    with database.session() as db:
        for token in (idle_token, absolute_token):
            record = db.get(AuthSession, digest(token))
            assert record is not None and record.revoked_at is not None


def test_own_profile_rejects_forged_fields_and_preserves_session(
    database: Database,
) -> None:
    from app.infrastructure.models import AuditLog

    service = AuthService(database)
    seed(service)
    other_id = uuid4()
    with database.transaction() as db:
        db.add(
            Account(
                id=other_id,
                email="other@example.invalid",
                display_name="Other",
                role="ADMIN",
                active=True,
                version=1,
            )
        )

    with TestClient(
        create_app(service, AuthSettings(frozenset({ORIGIN}))), base_url=ORIGIN
    ) as client:
        path = f"{BASE}/profile"
        draft = {"display_name": "  T?n m?i  ", "expectedVersion": 1}
        assert client.patch(path, json=draft).status_code == 401
        assert login(client, preflight(client)).status_code == 200
        csrf = str(client.get(f"{BASE}/csrf").json()["csrf_token"])
        headers = {
            "Origin": ORIGIN,
            "X-CSRF-Token": csrf,
            "Idempotency-Key": "profile-1",
        }
        assert (
            client.patch(
                path, json=draft, headers={**headers, "X-CSRF-Token": "invalid"}
            ).status_code
            == 403
        )
        for key, value in {
            "userId": str(other_id),
            "email": "other@example.invalid",
            "role": "ADMIN",
            "contact_phone": "secret-phone",
        }.items():
            rejected = client.patch(path, json={**draft, key: value}, headers=headers)
            assert rejected.status_code == 422
            assert value not in rejected.text
        blank = client.patch(
            path, json={**draft, "display_name": "   "}, headers=headers
        )
        assert (
            blank.status_code == 422 and "display_name" in blank.json()["field_errors"]
        )
        invalid = client.patch(
            path, json={**draft, "display_name": None}, headers=headers
        )
        assert (
            invalid.status_code == 422
            and "display_name" in invalid.json()["field_errors"]
        )

        result = client.patch(path, json=draft, headers=headers)
        assert result.status_code == 200
        view = result.json()
        assert view["display_name"] == "T?n m?i" and view["version"] == 2
        assert view["role"] == "REQUESTER" and view["email"] == EMAIL
        assert client.get(f"{BASE}/me").json() == view
        assert client.patch(path, json=draft, headers=headers).json() == view
        stale = client.patch(
            path, json=draft, headers={**headers, "Idempotency-Key": "stale"}
        )
        assert stale.status_code == 409 and stale.json()["code"] == "PROFILE_CONFLICT"
        different = client.patch(
            path, json={**draft, "display_name": "other"}, headers=headers
        )
        assert different.status_code == 409

    with database.session() as db:
        other = db.get(Account, other_id)
        assert (
            other is not None and other.display_name == "Other" and other.version == 1
        )
        audit = db.scalars(
            select(AuditLog).where(AuditLog.action == "auth.profile_update")
        ).all()
        assert len(audit) == 1
        assert audit[0].target_id != other_id
        assert "T?n m?i" not in str(audit[0].before_after_redacted)


def test_profile_failure_rolls_back_version_and_idempotency_key(
    database: Database,
) -> None:
    from typing import Any

    import pytest
    from sqlalchemy.exc import SQLAlchemyError
    from sqlalchemy.orm import Session

    from app.modules.auth import http

    service = AuthService(database)
    seed(service)
    with TestClient(
        create_app(service, AuthSettings(frozenset({ORIGIN}))), base_url=ORIGIN
    ) as client:
        assert login(client, preflight(client)).status_code == 200
        csrf = str(client.get(f"{BASE}/csrf").json()["csrf_token"])
        headers = {
            "Origin": ORIGIN,
            "X-CSRF-Token": csrf,
            "Idempotency-Key": "profile-retry",
        }
        body = {"display_name": "New display name", "expectedVersion": 1}

        def fail_after_flush(session: Session, **_: Any) -> None:
            session.flush()
            raise SQLAlchemyError("synthetic transaction failure")

        with pytest.MonkeyPatch.context() as patch:
            patch.setattr(http, "write_audit", fail_after_flush)
            failed = client.patch(f"{BASE}/profile", json=body, headers=headers)
            assert failed.status_code == 503 and "synthetic" not in failed.text
        old = client.get(f"{BASE}/me").json()
        assert old["display_name"] == "Synthetic" and old["version"] == 1
        retried = client.patch(f"{BASE}/profile", json=body, headers=headers)
        assert retried.status_code == 200 and retried.json()["version"] == 2
