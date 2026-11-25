from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from fastapi.testclient import TestClient

from app.infrastructure.database import Database
from app.main import create_app
from app.modules.auth.http import AuthSettings
from app.modules.auth.models import Account, AuthSession
from app.modules.auth.service import AuthService, digest, session_csrf

ORIGIN = "https://itoh.example.invalid"
SETTINGS = AuthSettings(frozenset({ORIGIN}))


def actor(db: Database, client: TestClient, role: str) -> tuple[UUID, dict[str, str]]:
    identifier = uuid4()
    token = uuid4().hex
    now = datetime.now(UTC)
    with db.transaction() as session:
        session.add(
            Account(
                id=identifier,
                email=f"{identifier}@example.invalid",
                display_name=role,
                role=role,
                active=True,
                version=1,
            )
        )
        session.flush()
        session.add(
            AuthSession(
                token_hash=digest(token),
                account_id=identifier,
                idle_until=now + timedelta(minutes=20),
                expires_at=now + timedelta(hours=1),
                password_change_only=False,
            )
        )
    client.cookies.set(SETTINGS.session_cookie, token)
    return identifier, {"Origin": ORIGIN, "X-CSRF-Token": session_csrf(token)}


def test_departments_retain_history_and_scope_lookups(database: Database) -> None:
    app = create_app(AuthService(database), SETTINGS)
    with (
        TestClient(app, base_url=ORIGIN) as admin,
        TestClient(app, base_url=ORIGIN) as requester,
    ):
        _, headers = actor(database, admin, "ADMIN")
        requester_id, requester_headers = actor(database, requester, "REQUESTER")
        request = {"name": "  Ph?ng   V?n h?nh "}
        assert (
            requester.post(
                "/api/v1/departments",
                json=request,
                headers={
                    **requester_headers,
                    "Idempotency-Key": "deny",
                },
            ).status_code
            == 403
        )
        assert requester.get("/api/v1/departments").status_code == 403
        first = admin.post(
            "/api/v1/departments",
            json=request,
            headers={**headers, "Idempotency-Key": "create"},
        )
        assert first.status_code == 201
        identifier = first.json()["id"]
        replay = admin.post(
            "/api/v1/departments",
            json=request,
            headers={**headers, "Idempotency-Key": "create"},
        )
        assert replay.json()["id"] == identifier
        assert (
            admin.post(
                "/api/v1/departments",
                json={"name": "ph?ng v?n h?nh"},
                headers={**headers, "Idempotency-Key": "duplicate"},
            ).status_code
            == 409
        )
        with database.transaction() as db:
            account = db.get(Account, requester_id)
            assert account is not None
            account.department_id = UUID(identifier)
        lookup = requester.get("/api/v1/lookups?kind=own_department").json()
        assert lookup["total"] == 1 and lookup["items"][0]["id"] == identifier
        assert set(lookup["items"][0]) == {"id", "name", "active", "version"}
        assert requester.get("/api/v1/lookups?kind=employees").status_code == 422
        assert requester.get(f"/api/v1/departments/{identifier}").status_code == 403
        update = {
            "active": False,
            "expectedVersion": 1,
            "reason": "Department reorganized",
        }
        assert (
            admin.patch(
                f"/api/v1/departments/{identifier}",
                json=update,
                headers={**headers, "Idempotency-Key": "disable"},
            ).status_code
            == 200
        )
        assert (
            admin.patch(
                f"/api/v1/departments/{identifier}",
                json=update,
                headers={**headers, "Idempotency-Key": "stale"},
            ).status_code
            == 409
        )
        assert admin.get(f"/api/v1/departments/{identifier}").json()["active"] is False
        assert admin.get("/api/v1/departments?active=true").json()["total"] == 0
        assert (
            requester.get("/api/v1/lookups?kind=own_department").json()["items"] == []
        )
        with database.session() as db:
            account = db.get(Account, requester_id)
            assert account is not None and str(account.department_id) == identifier
