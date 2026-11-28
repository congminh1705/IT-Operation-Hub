from collections.abc import Mapping
from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime, timedelta
from threading import Barrier
from typing import cast
from uuid import UUID, uuid4

from fastapi.testclient import TestClient
from httpx import Response
from sqlalchemy import func, select
from test_organization import ORIGIN, SETTINGS, actor
from test_ticket_intake import prepare_catalog
from test_ticket_lifecycle import command
from test_ticket_reads import TICKETS, create_ticket

from app.infrastructure.database import Database
from app.main import create_app
from app.modules.auth.models import Account, AuthSession
from app.modules.auth.service import AuthService, digest
from app.modules.organization.models import TeamMember


def patch(
    client: TestClient, headers: dict[str, str], url: str, body: Mapping[str, object]
) -> Response:
    return cast(
        Response,
        client.patch(
            url, json=dict(body), headers={**headers, "Idempotency-Key": str(uuid4())}
        ),
    )


def new_session(database: Database, client: TestClient, subject: UUID) -> None:
    token = uuid4().hex
    now = datetime.now(UTC)
    with database.transaction() as db:
        db.add(
            AuthSession(
                token_hash=digest(token),
                account_id=subject,
                idle_until=now + timedelta(minutes=20),
                expires_at=now + timedelta(hours=1),
                password_change_only=False,
            )
        )
    client.cookies.set(SETTINGS.session_cookie, token)


def test_access_changes_revoke_old_cookie_without_destroying_identity(
    database: Database,
) -> None:
    category, team = prepare_catalog(database)
    app = create_app(AuthService(database), SETTINGS)
    admin, tech, requester = (TestClient(app, base_url=ORIGIN) for _ in range(3))
    _, admin_headers = actor(database, admin, "ADMIN")
    subject, _ = actor(database, tech, "TECHNICIAN")
    _, owner_headers = actor(database, requester, "REQUESTER")
    ticket = create_ticket(
        requester, owner_headers, category, "Scoped account lifecycle"
    )
    detail = f"{TICKETS}/{ticket['id']}"
    with database.transaction() as db:
        db.add(TeamMember(team_id=UUID(team), account_id=subject, active=True))
    assert tech.get(detail).status_code == 200
    membership = command(
        admin,
        f"/api/v1/teams/{team}/members",
        admin_headers,
        {
            "user_id": str(subject),
            "expectedVersion": 1,
            "active": False,
            "reason": "End support membership",
        },
    )
    assert membership.status_code == 200, membership.text
    assert tech.get(detail).status_code == 401
    new_session(database, tech, subject)
    assert tech.get(detail).status_code == 404
    url = f"/api/v1/users/{subject}"
    change = patch(
        admin,
        admin_headers,
        url,
        {
            "expectedVersion": 1,
            "role": "REQUESTER",
            "reason": "Update support responsibility",
        },
    )
    assert change.status_code == 200 and change.json()["role"] == "REQUESTER"
    assert tech.get("/api/v1/auth/me").status_code == 401
    new_session(database, tech, subject)
    assert tech.get("/api/v1/auth/me").json()["role"] == "REQUESTER"
    assert (
        patch(
            admin,
            admin_headers,
            url,
            {
                "expectedVersion": 2,
                "active": False,
                "reason": "Suspend requester access",
            },
        ).status_code
        == 200
    )
    assert tech.get("/api/v1/auth/me").status_code == 401
    assert (
        patch(
            admin,
            admin_headers,
            url,
            {
                "expectedVersion": 3,
                "active": True,
                "reason": "Restore requester access",
            },
        ).status_code
        == 200
    )
    assert tech.get("/api/v1/auth/me").status_code == 401
    with database.session() as db:
        member = db.get(TeamMember, (UUID(team), subject))
        assert member is not None and not member.active
        account = db.get(Account, subject)
        assert account is not None and account.active and account.version == 4


def test_concurrent_admin_lockout_preserves_last_active_admin(
    database: Database,
) -> None:
    app = create_app(AuthService(database), SETTINGS)
    clients = [TestClient(app, base_url=ORIGIN) for _ in range(2)]
    participants = [(client, *actor(database, client, "ADMIN")) for client in clients]
    barrier = Barrier(2, timeout=10)

    def compete(data: tuple[TestClient, UUID, dict[str, str]]) -> Response:
        client, subject, headers = data
        barrier.wait()
        return patch(
            client,
            headers,
            f"/api/v1/users/{subject}",
            {
                "expectedVersion": 1,
                "active": False,
                "reason": "Restrict current administrator",
            },
        )

    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(compete, participants))
    assert sorted(response.status_code for response in results) == [200, 409]
    assert (
        next(response for response in results if response.status_code == 409).json()[
            "code"
        ]
        == "LAST_ACTIVE_ADMIN"
    )
    with database.session() as db:
        assert (
            db.scalar(
                select(func.count())
                .select_from(Account)
                .where(Account.role == "ADMIN", Account.active)
            )
            == 1
        )
