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


def test_team_membership_scope_and_handover_guard(database: Database) -> None:
    from sqlalchemy import select

    from app.modules.organization.models import TeamMember
    from app.modules.organization.team_scope import effective_team_ids

    app = create_app(AuthService(database), SETTINGS)
    with (
        TestClient(app, base_url=ORIGIN) as admin,
        TestClient(app, base_url=ORIGIN) as requester,
        TestClient(app, base_url=ORIGIN) as technician,
    ):
        _, headers = actor(database, admin, "ADMIN")
        requester_id, requester_headers = actor(database, requester, "REQUESTER")
        tech_id, _ = actor(database, technician, "TECHNICIAN")
        team = admin.post(
            "/api/v1/teams",
            json={"name": "Support"},
            headers={
                **headers,
                "Idempotency-Key": "support",
            },
        )
        assert team.status_code == 201
        identifier = team.json()["id"]
        scope = f"/api/v1/teams/{identifier}"
        assert requester.get("/api/v1/teams").status_code == 403
        assert requester.get(f"{scope}/members").status_code == 403

        payload = {
            "expectedVersion": 1,
            "active": True,
            "reason": "Approved IT membership",
        }
        result = admin.post(
            f"{scope}/members",
            json={**payload, "user_id": str(requester_id)},
            headers={**headers, "Idempotency-Key": "ineligible"},
        )
        assert (
            result.status_code == 409 and result.json()["code"] == "INELIGIBLE_MEMBER"
        )
        assert (
            requester.post(
                f"{scope}/members",
                json={**payload, "user_id": str(tech_id)},
                headers={**requester_headers, "Idempotency-Key": "denied"},
            ).status_code
            == 403
        )
        with database.transaction() as db:
            candidate = db.get(Account, tech_id)
            assert candidate is not None
            candidate.active = False
        locked = admin.post(
            f"{scope}/members",
            json={**payload, "user_id": str(tech_id)},
            headers={**headers, "Idempotency-Key": "locked"},
        )
        assert (
            locked.status_code == 409 and locked.json()["code"] == "INELIGIBLE_MEMBER"
        )
        with database.transaction() as db:
            candidate.active = True
            db.merge(candidate)
        added = admin.post(
            f"{scope}/members",
            json={**payload, "user_id": str(tech_id)},
            headers={**headers, "Idempotency-Key": "member"},
        )
        assert added.status_code == 200 and added.json()["version"] == 2
        assert admin.get(f"{scope}/members").json()["total"] == 1
        result = admin.post(
            f"{scope}/members",
            json={
                **payload,
                "user_id": str(tech_id),
                "active": False,
                "expectedVersion": 2,
            },
            headers={**headers, "Idempotency-Key": "remove"},
        )
        assert (
            result.status_code == 409 and result.json()["code"] == "HANDOVER_REQUIRED"
        )
        result = admin.patch(
            scope,
            json={
                "expectedVersion": 2,
                "active": False,
                "reason": "Retire the support team",
            },
            headers={**headers, "Idempotency-Key": "retire"},
        )
        assert (
            result.status_code == 409 and result.json()["code"] == "HANDOVER_REQUIRED"
        )
        with database.session() as db:
            assert effective_team_ids(db, tech_id) == {UUID(identifier)}
            assert effective_team_ids(db, requester_id) == set()
            row = db.scalar(select(TeamMember).where(TeamMember.account_id == tech_id))
            assert row is not None and row.active


def test_concurrent_intake_switch_keeps_exactly_one_active(database: Database) -> None:
    from concurrent.futures import ThreadPoolExecutor
    from threading import Barrier

    app = create_app(AuthService(database), SETTINGS)
    with (
        TestClient(app, base_url=ORIGIN) as first,
        TestClient(app, base_url=ORIGIN) as second,
    ):
        _, one = actor(database, first, "ADMIN")
        _, two = actor(database, second, "ADMIN")
        ids = []
        for name in ("First", "Second"):
            result = first.post(
                "/api/v1/teams",
                json={"name": name},
                headers={**one, "Idempotency-Key": name},
            )
            assert result.status_code == 201
            ids.append(result.json()["id"])
        inactive = first.post(
            "/api/v1/teams",
            json={"name": "Inactive", "active": False},
            headers={**one, "Idempotency-Key": "inactive"},
        ).json()["id"]
        body = {
            "expectedVersion": 1,
            "intake": True,
            "reason": "Update the intake destination",
        }
        rejected = first.patch(
            f"/api/v1/teams/{inactive}",
            json=body,
            headers={**one, "Idempotency-Key": "reject-inactive"},
        )
        assert (
            rejected.status_code == 409 and rejected.json()["code"] == "INACTIVE_INTAKE"
        )
        barrier = Barrier(2)

        def choose(client: TestClient, headers: dict[str, str], identifier: str) -> int:
            barrier.wait(timeout=5)
            return int(
                client.patch(
                    f"/api/v1/teams/{identifier}",
                    json=body,
                    headers={**headers, "Idempotency-Key": "intake"},
                ).status_code
            )

        with ThreadPoolExecutor(max_workers=2) as pool:
            pending = [
                pool.submit(choose, first, one, ids[0]),
                pool.submit(choose, second, two, ids[1]),
            ]
            assert [future.result(timeout=10) for future in pending] == [200, 200]
        rows = first.get("/api/v1/teams").json()["items"]
        selected = [row for row in rows if row["intake"]]
        assert len(selected) == 1 and selected[0]["active"]
        chosen = selected[0]
        result = first.patch(
            f"/api/v1/teams/{chosen['id']}",
            json={**body, "expectedVersion": chosen["version"], "intake": False},
            headers={**one, "Idempotency-Key": "clear"},
        )
        assert (
            result.status_code == 409
            and result.json()["code"] == "INTAKE_REPLACEMENT_REQUIRED"
        )
        with TestClient(app, base_url=ORIGIN) as requester:
            actor(database, requester, "REQUESTER")
            lookup = requester.get("/api/v1/lookups?kind=intake_teams").json()
            assert lookup["total"] == 1 and lookup["items"][0]["id"] == chosen["id"]
            assert set(lookup["items"][0]) == {"id", "name", "active", "version"}


def test_category_history_and_public_active_choices(database: Database) -> None:
    from sqlalchemy import select

    from app.infrastructure.models import AuditLog
    from app.modules.tickets.categories import TicketCategory

    app = create_app(AuthService(database), SETTINGS)
    base = "/api/v1/categories"
    with (
        TestClient(app, base_url=ORIGIN) as admin,
        TestClient(app, base_url=ORIGIN) as requester,
    ):
        _, admin_headers = actor(database, admin, "ADMIN")
        _, requester_headers = actor(database, requester, "REQUESTER")
        draft = {"name": "  Network   Access  "}
        assert (
            requester.post(
                base,
                json=draft,
                headers={
                    **requester_headers,
                    "Idempotency-Key": "unauthorized",
                },
            ).status_code
            == 403
        )
        assert requester.get(base).status_code == 403
        created = admin.post(
            base,
            json=draft,
            headers={
                **admin_headers,
                "Idempotency-Key": "initial",
            },
        )
        assert created.status_code == 201
        identifier = created.json()["id"]
        assert created.json()["name"] == "Network Access"
        lookup = "/api/v1/lookups?kind=ticket_categories"
        result = requester.get(lookup)
        assert result.status_code == 200 and result.json()["total"] == 1
        assert set(result.json()["items"][0]) == {"id", "name", "active", "version"}
        assert (
            admin.post(
                base,
                json={"name": "network access"},
                headers={
                    **admin_headers,
                    "Idempotency-Key": "duplicate",
                },
            ).status_code
            == 409
        )
        change = {
            "expectedVersion": 1,
            "active": False,
            "reason": "Category retired from intake",
        }
        detail = f"{base}/{identifier}"
        result = admin.patch(
            detail,
            json=change,
            headers={
                **admin_headers,
                "Idempotency-Key": "disable",
            },
        )
        assert result.status_code == 200 and result.json()["version"] == 2
        assert (
            admin.patch(
                detail,
                json=change,
                headers={
                    **admin_headers,
                    "Idempotency-Key": "stale",
                },
            ).status_code
            == 409
        )
        assert admin.get(detail).json()["name"] == "Network Access"
        assert admin.get(base + "?active=true").json()["total"] == 0
        assert requester.get(lookup).json()["total"] == 0
        assert requester.get(detail).status_code == 403
        assert (
            admin.post(
                base,
                json=draft,
                headers={
                    **admin_headers,
                    "Idempotency-Key": "historical-duplicate",
                },
            ).status_code
            == 409
        )
        with database.session() as db:
            stored = db.get(TicketCategory, UUID(identifier))
            assert (
                stored is not None
                and not stored.active
                and stored.code == UUID(identifier).hex
            )
            assert (
                len(
                    db.scalars(
                        select(AuditLog).where(AuditLog.target_id == UUID(identifier))
                    ).all()
                )
                == 2
            )


def test_sla_publish_is_versioned_and_keeps_old_policy(database: Database) -> None:
    from copy import deepcopy

    import pytest
    from sqlalchemy import text
    from sqlalchemy.exc import IntegrityError

    from app.modules.sla.policy import snapshot_policy

    app = create_app(AuthService(database), SETTINGS)
    path = "/api/v1/sla/policy"
    with database.session() as db:
        old = snapshot_policy(db)
        assert old is not None and old.priority_budgets.P3.resolution_seconds == 86400

    with (
        TestClient(app, base_url=ORIGIN) as admin,
        TestClient(app, base_url=ORIGIN) as requester,
    ):
        _, headers = actor(database, admin, "ADMIN")
        _, requester_headers = actor(database, requester, "REQUESTER")
        budgets = admin.get(path).json()["priority_budgets"]
        assert budgets["P1"] == {"response_seconds": 900, "resolution_seconds": 14400}
        body = {
            "expectedVersion": 1,
            "priority_budgets": budgets,
            "reason": "Update response commitments",
        }
        assert requester.get(path).status_code == 403
        assert (
            requester.patch(
                path,
                json=body,
                headers={
                    **requester_headers,
                    "Idempotency-Key": "deny",
                },
            ).status_code
            == 403
        )
        invalid = deepcopy(body)
        invalid["priority_budgets"]["P3"]["resolution_seconds"] = 0
        assert (
            admin.patch(
                path,
                json=invalid,
                headers={
                    **headers,
                    "Idempotency-Key": "invalid",
                },
            ).status_code
            == 422
        )
        incomplete = deepcopy(body)
        del incomplete["priority_budgets"]["P4"]
        assert (
            admin.patch(
                path,
                json=incomplete,
                headers={
                    **headers,
                    "Idempotency-Key": "incomplete",
                },
            ).status_code
            == 422
        )
        budgets["P3"]["resolution_seconds"] = 43200
        confirmed = {**headers, "Idempotency-Key": "publish-v2"}
        result = admin.patch(path, json=body, headers=confirmed)
        assert result.status_code == 200 and result.json()["version"] == 2
        assert set(result.json()) == {"version", "priority_budgets"}
        assert (
            admin.get(path).json()["priority_budgets"]["P3"]["resolution_seconds"]
            == 43200
        )
        assert (
            admin.patch(
                path,
                json=body,
                headers={
                    **headers,
                    "Idempotency-Key": "stale",
                },
            ).status_code
            == 409
        )

        latest = deepcopy(body)
        latest["expectedVersion"] = 2
        latest["priority_budgets"]["P3"]["resolution_seconds"] = 54000
        assert (
            admin.patch(
                path,
                json=latest,
                headers={
                    **headers,
                    "Idempotency-Key": "publish-v3",
                },
            ).status_code
            == 200
        )
        assert admin.patch(path, json=body, headers=confirmed).json() == result.json()

    with database.session() as db:
        original = snapshot_policy(db, version=1)
        current = snapshot_policy(db)
        assert original == old
        assert (
            current is not None
            and current.priority_budgets.P3.resolution_seconds == 54000
        )
        assert (
            original is not None
            and original.priority_budgets.for_priority("P3").resolution_seconds == 86400
        )
    with pytest.raises(IntegrityError, match="immutable"), database.transaction() as db:
        db.execute(
            text(
                "UPDATE sla_policy_revision SET reason = 'rewritten' WHERE version = 1"
            )
        )


def test_sla_concurrent_publish_only_accepts_one_expected_version(
    database: Database,
) -> None:
    from concurrent.futures import ThreadPoolExecutor
    from threading import Barrier

    from sqlalchemy import func, select

    from app.infrastructure.models import AuditLog
    from app.modules.sla.policy import PolicyRevision

    app = create_app(AuthService(database), SETTINGS)
    path = "/api/v1/sla/policy"
    with (
        TestClient(app, base_url=ORIGIN) as first,
        TestClient(app, base_url=ORIGIN) as second,
    ):
        _, one = actor(database, first, "ADMIN")
        _, two = actor(database, second, "ADMIN")
        budgets = first.get(path).json()["priority_budgets"]
        barrier = Barrier(2)

        def publish(client: TestClient, headers: dict[str, str], budget: int) -> int:
            draft = {
                "expectedVersion": 1,
                "priority_budgets": {
                    **budgets,
                    "P3": {**budgets["P3"], "resolution_seconds": budget},
                },
                "reason": "Concurrent policy revision test",
            }
            barrier.wait(timeout=5)
            response = client.patch(
                path,
                json=draft,
                headers={
                    **headers,
                    "Idempotency-Key": f"sla-{budget}",
                },
            )
            return int(response.status_code)

        with ThreadPoolExecutor(max_workers=2) as pool:
            pending = [
                pool.submit(publish, first, one, 43200),
                pool.submit(publish, second, two, 54000),
            ]
            assert sorted(future.result(timeout=10) for future in pending) == [200, 409]
    with database.session() as db:
        assert db.scalar(select(func.count()).select_from(PolicyRevision)) == 2
        assert (
            db.scalar(
                select(func.count())
                .select_from(AuditLog)
                .where(AuditLog.action == "sla.policy_publish")
            )
            == 1
        )
