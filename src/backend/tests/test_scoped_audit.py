from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import select
from starlette.testclient import TestClient
from test_organization import ORIGIN, SETTINGS, actor
from test_ticket_intake import prepare_catalog
from test_ticket_reads import create_ticket

from app.infrastructure.database import Database
from app.infrastructure.models import AuditLog
from app.main import create_app
from app.modules.audit import audit_scope, project_audit
from app.modules.auth.models import Account
from app.modules.auth.service import AuthService


def test_audit_projection_is_scoped_and_filters_unsafe_facts(
    database: Database,
) -> None:
    app = create_app(AuthService(database), SETTINGS)
    with TestClient(app, base_url=ORIGIN) as client:
        manager, _ = actor(database, client, "IT_MANAGER")
        admin, _ = actor(database, client, "ADMIN")
    with database.transaction() as db:
        for target, action in (
            ("account", "user.provision"),
            ("chat", "chat.created"),
            ("ticket", "ticket.create"),
        ):
            db.add(
                AuditLog(
                    id=uuid4(),
                    actor_type="user",
                    actor_id=admin,
                    target_type=target,
                    target_id=uuid4(),
                    action=action,
                    occurred_at=datetime.now(UTC),
                    before_after_redacted={
                        "before": {"active": False},
                        "after": {
                            "active": True,
                            "reason_provided": True,
                            "password": "private",
                            "assignee_id": "private",
                        },
                    },
                )
            )
    with database.session() as db:
        manager_row = db.get(Account, manager)
        admin_row = db.get(Account, admin)
        assert manager_row is not None and admin_row is not None
        assert not list(
            db.scalars(select(AuditLog).where(audit_scope(db, manager_row)))
        )
        rows = list(db.scalars(select(AuditLog).where(audit_scope(db, admin_row))))
        assert [row.action for row in rows] == ["user.provision"]
        item = project_audit(rows[0])
        assert item.actor_id == admin and item.reason_recorded
        assert item.before == {"active": False}
        assert item.after == {"active": True, "reason_provided": True}


def test_audit_api_scopes_search_counts_and_bounds(database: Database) -> None:
    app = create_app(AuthService(database), SETTINGS)
    with (
        TestClient(app, base_url=ORIGIN) as manager,
        TestClient(app, base_url=ORIGIN) as admin,
        TestClient(app, base_url=ORIGIN) as requester,
        TestClient(app, base_url=ORIGIN) as anonymous,
    ):
        actor(database, manager, "IT_MANAGER")
        admin_id, _ = actor(database, admin, "ADMIN")
        _, requester_headers = actor(database, requester, "REQUESTER")
        category, _ = prepare_catalog(database)
        create_ticket(requester, requester_headers, category, "Audit fixture")
        target_id = uuid4()
        with database.transaction() as db:
            for action in ("user.provision", "auth.password_change"):
                db.add(
                    AuditLog(
                        id=uuid4(),
                        actor_type="user",
                        actor_id=admin_id,
                        target_type="account",
                        target_id=target_id,
                        action=action,
                        occurred_at=datetime.now(UTC),
                        before_after_redacted={"after": {"version": 2}},
                    )
                )
        url = "/api/v1/audit"
        assert anonymous.get(url).status_code == 401
        assert requester.get(url).status_code == 403
        assert manager.get(url, params={"q": "user"}).json()["total"] == 0
        business = manager.get(url, params={"q": "ticket.create"}).json()
        assert business["total"] == 1
        assert business["items"][0]["action"] == "ticket.create"
        assert admin.get(url, params={"q": "%"}).json()["total"] == 0
        assert admin.get(url, params={"page_size": 101}).status_code == 422
        result = admin.get(url, params={"target_id": str(target_id), "page_size": 1})
        assert result.status_code == 200
        assert result.headers["Cache-Control"] == "no-store"
        assert result.json()["total"] == 2
        assert result.json()["items"][0]["action"] == "auth.password_change"
        assert result.json()["items"][0]["after"] == {"version": 2}
        second = admin.get(
            url, params={"target_id": str(target_id), "page_size": 1, "page": 2}
        )
        assert second.json()["items"][0]["action"] == "user.provision"
