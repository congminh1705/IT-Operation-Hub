from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import select
from starlette.testclient import TestClient
from test_organization import ORIGIN, SETTINGS, actor

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
