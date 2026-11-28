import re
from collections.abc import Callable
from hmac import compare_digest
from typing import Annotated, Any, Literal, cast
from unicodedata import normalize
from uuid import UUID, uuid4

from fastapi import APIRouter, Query, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from sqlalchemy import func, select, text
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from app.infrastructure.clock import read_utc
from app.infrastructure.commands import (
    CommandResult,
    IdempotencyConflict,
    JsonValue,
    run_idempotent,
)
from app.infrastructure.events import Actor, SafeFacts, Target, write_audit
from app.modules.auth.http import AuthSettings, UserView, user_view
from app.modules.auth.models import Account
from app.modules.auth.service import (
    TEMPORARY_LIFETIME,
    AuthService,
    normalize_identity,
    session_csrf,
)
from app.modules.organization.models import Department, Team, TeamMember
from app.modules.sla.policy import (
    PolicyRevision,
    PolicyUpdate,
    PolicyView,
    policy_revision,
    snapshot_policy,
)
from app.modules.tickets.categories import TicketCategory
from app.modules.users.provisioning import (
    ProvisionedAccountView,
    ProvisioningVerification,
    UserCreate,
)


class Rejected(Exception):
    def __init__(self, status: int, code: str) -> None:
        self.status = status
        self.code = code


class NamedCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    name: str = Field(min_length=1, max_length=120)
    active: bool = True


class NamedUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    expectedVersion: int = Field(ge=1)
    name: str | None = Field(default=None, min_length=1, max_length=120)
    active: bool | None = None
    reason: str = Field(min_length=10, max_length=1000)


class NamedView(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    active: bool
    version: int


class NamedPage(BaseModel):
    items: list[NamedView]
    page: int
    page_size: int
    total: int


class TeamUpdate(NamedUpdate):
    intake: bool | None = None


class TeamView(NamedView):
    intake: bool


class TeamPage(BaseModel):
    items: list[TeamView]
    page: int
    page_size: int
    total: int


class MemberCommand(BaseModel):
    model_config = ConfigDict(extra="forbid")
    user_id: UUID
    expectedVersion: int = Field(ge=1, strict=True)
    active: bool = Field(strict=True)
    reason: str = Field(min_length=10, max_length=1000)


class MemberPage(BaseModel):
    items: list[UserView]
    page: int
    page_size: int
    total: int


class TeamReference(BaseModel):
    id: UUID
    version: int
    request_id: str


def normalized_name(value: str) -> tuple[str, str]:
    name = " ".join(normalize("NFKC", value).split())
    key = name.casefold()
    if not name or len(name) > 120 or len(key) > 240 or "\0" in name:
        raise Rejected(422, "INVALID_NAME")
    return name, key


def error_response(status: int, code: str) -> JSONResponse:
    return JSONResponse(
        {
            "code": code,
            "message": {
                401: "Phi?n kh?ng h?p l?.",
                403: "B?n kh?ng c? quy?n th?c hi?n y?u c?u n?y.",
                404: "Kh?ng t?m th?y b?n ghi.",
                409: "D? li?u xung ??t. Vui l?ng ki?m tra l?i.",
                422: "D? li?u kh?ng h?p l?.",
                503: "D?ch v? t?m th?i kh?ng kh? d?ng.",
            }[status],
            "request_id": str(uuid4()),
        },
        status_code=status,
        headers={"Cache-Control": "no-store"},
    )


def organization_router(
    service: AuthService | None, settings: AuthSettings
) -> APIRouter:
    router = APIRouter(tags=["Administration"])

    def configured() -> AuthService:
        if service is None:
            raise Rejected(503, "UNAVAILABLE")
        return service

    def authorize(
        db: Session, request: Request, *, admin: bool = False, write: bool = False
    ) -> Account:
        token = request.cookies.get(settings.session_cookie)
        account = (
            configured().account_in_transaction(db, token, lock_account=write)
            if token
            else None
        )
        if account is None:
            raise Rejected(401, "SESSION_INVALID")
        if admin and account.role != "ADMIN":
            raise Rejected(403, "FORBIDDEN")
        if write:
            assert token is not None
            origins = request.headers.getlist("origin")
            csrf = request.headers.getlist("x-csrf-token")
            if (
                len(origins) != 1
                or origins[0] not in settings.origins
                or len(csrf) != 1
                or not compare_digest(session_csrf(token).encode(), csrf[0].encode())
            ):
                raise Rejected(403, "FORBIDDEN")
        return account

    def query(
        request: Request,
        callback: Callable[[Session, Account], BaseModel],
        *,
        admin: bool = True,
    ) -> Response:
        try:
            with configured().database.transaction() as db:
                result = callback(db, authorize(db, request, admin=admin))
                return JSONResponse(
                    result.model_dump(mode="json"),
                    headers={"Cache-Control": "no-store"},
                )
        except Rejected as exc:
            return error_response(exc.status, exc.code)
        except SQLAlchemyError:
            return error_response(503, "UNAVAILABLE")

    def change(
        request: Request,
        operation: str,
        payload: dict[str, JsonValue],
        execute: Callable[[Session, Account], CommandResult],
        project: Callable[[Session, CommandResult], BaseModel],
        *,
        status: int,
    ) -> Response:
        try:
            database = configured().database
            key = request.headers.getlist("idempotency-key")
            with database.transaction() as db:
                actor_id = authorize(db, request, admin=True, write=True).id
            if len(key) != 1 or not key[0].strip() or len(key[0]) > 128:
                raise Rejected(422, "INVALID_IDEMPOTENCY_KEY")

            response_body: BaseModel | None = None

            def authorization(db: Session, replay: CommandResult | None) -> None:
                nonlocal response_body
                if authorize(db, request, admin=True, write=True).id != actor_id:
                    raise Rejected(403, "FORBIDDEN")
                if replay is not None:
                    response_body = project(db, replay)

            def perform(db: Session) -> CommandResult:
                nonlocal response_body
                result = execute(db, authorize(db, request, admin=True, write=True))
                db.flush()
                response_body = project(db, result)
                return result

            run_idempotent(
                database,
                actor_id=actor_id,
                operation=operation,
                key=key[0],
                payload=payload,
                authorize=authorization,
                execute=perform,
            )
            assert response_body is not None
            return JSONResponse(
                response_body.model_dump(mode="json"),
                status_code=status,
                headers={"Cache-Control": "no-store"},
            )
        except Rejected as exc:
            return error_response(exc.status, exc.code)
        except (IntegrityError, IdempotencyConflict):
            return error_response(409, "CONFLICT")
        except SQLAlchemyError:
            return error_response(503, "UNAVAILABLE")

    @router.post(
        "/users",
        operation_id="createUser",
        response_model=ProvisionedAccountView,
        status_code=201,
        openapi_extra={
            "requestBody": {
                "required": True,
                "content": {
                    "application/json": {"schema": UserCreate.model_json_schema()},
                },
            }
        },
    )
    async def create_user(request: Request) -> Response:
        def authorize_entry() -> None:
            with configured().database.transaction() as db:
                authorize(db, request, admin=True, write=True)

        try:
            await run_in_threadpool(authorize_entry)
        except Rejected as exc:
            return error_response(exc.status, exc.code)
        except SQLAlchemyError:
            return error_response(503, "UNAVAILABLE")

        # Parse manually to keep validation errors from echoing credential input.
        if (
            request.headers.get("content-type", "").split(";", 1)[0].strip().lower()
            != "application/json"
        ):
            return error_response(422, "INVALID_INPUT")
        payload = bytearray()
        async for chunk in request.stream():
            if len(payload) + len(chunk) > 4096:
                return error_response(422, "INVALID_INPUT")
            payload.extend(chunk)
        try:
            body = UserCreate.model_validate_json(bytes(payload))
        except ValidationError:
            return error_response(422, "INVALID_INPUT")
        name = body.display_name.strip()
        email = normalize_identity(body.email)
        secret = normalize("NFC", body.initial_password)
        if (
            not name
            or chr(0) in name
            or len(email) > 254
            or not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email)
        ):
            return error_response(422, "INVALID_INPUT")

        def verification(db: Session) -> ProvisioningVerification:
            proof = db.get(
                ProvisioningVerification, body.verification_id, with_for_update=True
            )
            if (
                proof is None
                or not proof.active
                or proof.email != email
                or proof.department_id != body.department_id
                or proof.role != body.role
            ):
                raise Rejected(403, "VERIFICATION_REQUIRED")
            verifier = db.get(Account, proof.verified_by)
            if verifier is None or not verifier.active or verifier.role != "ADMIN":
                raise Rejected(403, "VERIFICATION_REQUIRED")
            if body.role != "REQUESTER" and proof.elevated_approval_id is None:
                raise Rejected(403, "ROLE_APPROVAL_REQUIRED")
            return proof

        def execute(db: Session, actor: Account) -> CommandResult:
            service = configured()
            if not settings.blocked_passwords:
                raise Rejected(503, "PASSWORD_POLICY_UNAVAILABLE")
            if (
                not 15 <= len(secret) <= 128
                or secret.casefold() in settings.blocked_passwords
            ):
                raise Rejected(422, "INVALID_INITIAL_PASSWORD")
            proof = verification(db)
            if proof.consumed_account_id is not None:
                raise Rejected(409, "VERIFICATION_USED")
            department = db.get(Department, body.department_id, with_for_update=True)
            if department is None or not department.active:
                raise Rejected(422, "DEPARTMENT_UNAVAILABLE")
            identifier = uuid4()
            row = Account(
                id=identifier,
                email=email,
                display_name=name,
                role=body.role,
                department_id=department.id,
                active=True,
                version=1,
                password_hash=service.hasher.hash(secret),
                temporary_until=read_utc(service.clock) + TEMPORARY_LIFETIME,
            )
            db.add(row)
            db.flush()
            proof.consumed_account_id = identifier
            write_audit(
                db,
                actor=Actor("user", actor.id),
                action="user.provision",
                target=Target("account", identifier),
                before=SafeFacts(),
                after=SafeFacts(
                    active=True,
                    version=1,
                    verification_id=proof.id,
                    approval_id=proof.elevated_approval_id,
                ),
                clock=service.clock,
            )
            return CommandResult(identifier, 1)

        def project(db: Session, result: CommandResult) -> ProvisionedAccountView:
            proof = verification(db)
            row = db.get(Account, result.id)
            if (
                proof.consumed_account_id != result.id
                or row is None
                or not row.active
                or row.version != result.version
                or row.password_hash is None
                or row.temporary_until is None
                or row.temporary_until <= read_utc(configured().clock)
                or not configured().verify(row.password_hash, secret)
            ):
                raise Rejected(409, "REPLAY_STALE")
            return ProvisionedAccountView.model_validate(row)

        return await run_in_threadpool(
            change,
            request,
            "user.provision",
            {
                "verification_id": str(body.verification_id),
                "email": email,
                "display_name": name,
                "department_id": str(body.department_id),
                "role": body.role,
            },
            execute,
            project,
            status=201,
        )

    def register_named_lifecycle(
        model: type[Department] | type[TicketCategory],
        path: str,
        entity: str,
        singular: str,
        plural: str,
    ) -> None:
        def find_record(
            db: Session, record_id: UUID, *, lock: bool = False
        ) -> Department | TicketCategory:
            row = db.get(model, record_id, with_for_update=lock)
            if row is None:
                raise Rejected(404, "NOT_FOUND")
            return cast(Department | TicketCategory, row)

        def view_result(db: Session, result: CommandResult) -> NamedView:
            row = find_record(db, result.id)
            if row.version != result.version:
                raise Rejected(409, "REPLAY_STALE")
            return NamedView.model_validate(row)

        def audit(
            db: Session,
            actor: Account,
            action: str,
            row: Department | TicketCategory,
            before: SafeFacts,
        ) -> None:
            write_audit(
                db,
                actor=Actor("user", actor.id),
                action=action,
                target=Target(entity, row.id),
                before=before,
                after=SafeFacts(active=row.active, version=row.version),
            )

        @router.get(path, operation_id="list" + plural, response_model=NamedPage)
        def list_records(
            request: Request,
            page: Annotated[int, Query(ge=1, le=1_000_000)] = 1,
            page_size: Annotated[int, Query(ge=1, le=100)] = 20,
            active: bool | None = None,
        ) -> Response:
            def read(db: Session, _: Account) -> NamedPage:
                rows = select(model)
                if active is not None:
                    rows = rows.where(model.active == active)
                total = (
                    db.scalar(select(func.count()).select_from(rows.subquery())) or 0
                )
                items = db.scalars(
                    rows.order_by(model.name_key, model.id)
                    .offset((page - 1) * page_size)
                    .limit(page_size)
                )
                return NamedPage(
                    items=[NamedView.model_validate(row) for row in items],
                    page=page,
                    page_size=page_size,
                    total=total,
                )

            return query(request, read)

        @router.get(
            path + "/{id}", operation_id="get" + singular, response_model=NamedView
        )
        def get_record(id: UUID, request: Request) -> Response:
            return query(
                request, lambda db, _: NamedView.model_validate(find_record(db, id))
            )

        @router.post(
            path,
            operation_id="create" + singular,
            response_model=NamedView,
            status_code=201,
        )
        def create_record(request: Request, body: NamedCreate) -> Response:
            def execute(db: Session, actor: Account) -> CommandResult:
                identifier = uuid4()
                name, key = normalized_name(body.name)
                row = model(
                    id=identifier,
                    code=identifier.hex,
                    name=name,
                    name_key=key,
                    active=body.active,
                    version=1,
                )
                db.add(row)
                audit(db, actor, entity + ".create", row, SafeFacts())
                return CommandResult(identifier, 1)

            return change(
                request,
                entity + ".create",
                body.model_dump(),
                execute,
                view_result,
                status=201,
            )

        @router.patch(
            path + "/{id}", operation_id="update" + singular, response_model=NamedView
        )
        def update_record(id: UUID, request: Request, body: NamedUpdate) -> Response:
            def execute(db: Session, actor: Account) -> CommandResult:
                row = find_record(db, id, lock=True)
                if row.version != body.expectedVersion:
                    raise Rejected(409, "STALE_VERSION")
                if len(body.reason.strip()) < 10 or (
                    body.name is None and body.active is None
                ):
                    raise Rejected(422, "INVALID_CHANGE")
                before = SafeFacts(active=row.active, version=row.version)
                if body.name is not None:
                    row.name, row.name_key = normalized_name(body.name)
                if body.active is not None:
                    row.active = body.active
                row.version += 1
                audit(db, actor, entity + ".update", row, before)
                return CommandResult(row.id, row.version)

            payload: dict[str, Any] = body.model_dump(exclude_unset=True)
            return change(
                request,
                entity + ".update",
                {"id": str(id), **payload},
                execute,
                view_result,
                status=200,
            )

    register_named_lifecycle(
        Department, "/departments", "department", "Department", "Departments"
    )
    register_named_lifecycle(
        TicketCategory, "/categories", "ticket_category", "Category", "Categories"
    )

    def team(db: Session, record_id: UUID) -> Team:
        row = db.get(Team, record_id)
        if row is None:
            raise Rejected(404, "NOT_FOUND")
        return row

    def team_lock(db: Session) -> None:
        # Serialize intake switches, membership changes and team writes.
        db.execute(text("SELECT pg_advisory_xact_lock(505002)"))

    def team_result(db: Session, result: CommandResult) -> TeamView:
        row = team(db, result.id)
        if row.version != result.version:
            raise Rejected(409, "REPLAY_STALE")
        return TeamView.model_validate(row)

    def audit_team(
        db: Session, actor: Account, action: str, row: Team, before: SafeFacts
    ) -> None:
        write_audit(
            db,
            actor=Actor("user", actor.id),
            action=action,
            target=Target("team", row.id),
            before=before,
            after=SafeFacts(active=row.active, version=row.version),
        )

    @router.get("/teams", operation_id="listTeams", response_model=TeamPage)
    def teams(
        request: Request,
        page: Annotated[int, Query(ge=1, le=1_000_000)] = 1,
        page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    ) -> Response:
        def read(db: Session, _: Account) -> TeamPage:
            total = db.scalar(select(func.count()).select_from(Team)) or 0
            items = db.scalars(
                select(Team)
                .order_by(Team.name_key, Team.id)
                .offset((page - 1) * page_size)
                .limit(page_size)
            )
            return TeamPage(
                items=[TeamView.model_validate(row) for row in items],
                page=page,
                page_size=page_size,
                total=total,
            )

        return query(request, read)

    @router.get("/teams/{id}", operation_id="getTeam", response_model=TeamView)
    def get_team(id: UUID, request: Request) -> Response:
        return query(request, lambda db, _: TeamView.model_validate(team(db, id)))

    @router.post(
        "/teams", operation_id="createTeam", response_model=TeamView, status_code=201
    )
    def create_team(request: Request, body: NamedCreate) -> Response:
        def execute(db: Session, actor: Account) -> CommandResult:
            team_lock(db)
            name, key = normalized_name(body.name)
            row = Team(
                id=uuid4(),
                name=name,
                name_key=key,
                active=body.active,
                intake=False,
                version=1,
            )
            db.add(row)
            audit_team(db, actor, "team.create", row, SafeFacts())
            return CommandResult(row.id, row.version)

        return change(
            request, "team.create", body.model_dump(), execute, team_result, status=201
        )

    @router.patch("/teams/{id}", operation_id="updateTeam", response_model=TeamView)
    def update_team(id: UUID, request: Request, body: TeamUpdate) -> Response:
        def execute(db: Session, actor: Account) -> CommandResult:
            team_lock(db)
            row = team(db, id)
            if row.version != body.expectedVersion:
                raise Rejected(409, "STALE_VERSION")
            if len(body.reason.strip()) < 10 or all(
                v is None for v in (body.name, body.active, body.intake)
            ):
                raise Rejected(422, "INVALID_CHANGE")
            if body.intake is False and row.intake:
                raise Rejected(409, "INTAKE_REPLACEMENT_REQUIRED")
            if body.active is False and row.active:
                raise Rejected(409, "HANDOVER_REQUIRED")

            before = SafeFacts(active=row.active, version=row.version)
            if body.name is not None:
                row.name, row.name_key = normalized_name(body.name)
            if body.active is not None:
                row.active = body.active
            if body.intake is True:
                if not row.active:
                    raise Rejected(409, "INACTIVE_INTAKE")
                previous = db.scalar(
                    select(Team).where(Team.intake.is_(True), Team.id != id)
                )
                if previous is not None:
                    previous_before = SafeFacts(
                        active=previous.active, version=previous.version
                    )
                    previous.intake = False
                    previous.version += 1
                    audit_team(
                        db, actor, "team.intake_unset", previous, previous_before
                    )
                    db.flush()
                row.intake = True
            row.version += 1
            audit_team(
                db,
                actor,
                "team.intake_set" if body.intake is True else "team.update",
                row,
                before,
            )
            return CommandResult(row.id, row.version)

        payload: dict[str, Any] = body.model_dump(exclude_unset=True)
        return change(
            request,
            "team.update",
            {"id": str(id), **payload},
            execute,
            team_result,
            status=200,
        )

    @router.get(
        "/teams/{id}/members", operation_id="listTeamMembers", response_model=MemberPage
    )
    def list_members(
        id: UUID,
        request: Request,
        page: Annotated[int, Query(ge=1, le=1_000_000)] = 1,
        page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    ) -> Response:
        def read(db: Session, _: Account) -> MemberPage:
            team(db, id)
            rows = (
                select(Account)
                .join(TeamMember, TeamMember.account_id == Account.id)
                .where(TeamMember.team_id == id, TeamMember.active.is_(True))
            )
            total = db.scalar(select(func.count()).select_from(rows.subquery())) or 0
            items = db.scalars(
                rows.order_by(Account.display_name, Account.id)
                .offset((page - 1) * page_size)
                .limit(page_size)
            )
            return MemberPage(
                items=[user_view(row) for row in items],
                page=page,
                page_size=page_size,
                total=total,
            )

        return query(request, read)

    @router.post(
        "/teams/{id}/members",
        operation_id="setTeamMembership",
        response_model=TeamReference,
    )
    def set_member(id: UUID, request: Request, body: MemberCommand) -> Response:
        def execute(db: Session, actor: Account) -> CommandResult:
            team_lock(db)
            row = team(db, id)
            if row.version != body.expectedVersion:
                raise Rejected(409, "STALE_VERSION")
            if not body.active:
                raise Rejected(409, "HANDOVER_REQUIRED")
            if len(body.reason.strip()) < 10:
                raise Rejected(422, "INVALID_CHANGE")
            candidate = db.get(Account, body.user_id, with_for_update=True)
            if (
                not row.active
                or candidate is None
                or not candidate.active
                or candidate.role not in ("TECHNICIAN", "IT_MANAGER", "ADMIN")
            ):
                raise Rejected(409, "INELIGIBLE_MEMBER")
            membership = db.get(TeamMember, (id, candidate.id))
            if membership is None:
                db.add(TeamMember(team_id=id, account_id=candidate.id, active=True))
            elif membership.active:
                raise Rejected(409, "MEMBER_EXISTS")
            else:
                membership.active = True
            before = SafeFacts(active=row.active, version=row.version)
            row.version += 1
            write_audit(
                db,
                actor=Actor("user", actor.id),
                action="team.member_add",
                target=Target("team", id),
                before=before,
                after=SafeFacts(
                    active=row.active, version=row.version, assignee_id=candidate.id
                ),
            )
            return CommandResult(id, row.version)

        def reference(_: Session, result: CommandResult) -> TeamReference:
            return TeamReference(
                id=result.id, version=result.version, request_id=str(uuid4())
            )

        payload: dict[str, Any] = body.model_dump(mode="json")
        return change(
            request,
            "team.member.set",
            {"id": str(id), **payload},
            execute,
            reference,
            status=200,
        )

    @router.get("/sla/policy", operation_id="getSLAPolicy", response_model=PolicyView)
    def get_sla_policy(request: Request) -> Response:
        def read(db: Session, _: Account) -> PolicyView:
            snapshot = snapshot_policy(db)
            if snapshot is None:
                raise Rejected(503, "SLA_POLICY_UNAVAILABLE")
            return snapshot

        return query(request, read)

    @router.patch(
        "/sla/policy", operation_id="updateSLAPolicy", response_model=PolicyView
    )
    def publish_sla_policy(request: Request, body: PolicyUpdate) -> Response:
        def execute(db: Session, actor: Account) -> CommandResult:
            db.execute(text("SELECT pg_advisory_xact_lock(508002)"))
            latest = policy_revision(db)
            if latest is None:
                raise Rejected(503, "SLA_POLICY_UNAVAILABLE")
            if latest.version != body.expectedVersion:
                raise Rejected(409, "STALE_VERSION")
            reason = body.reason.strip()
            if len(reason) < 10:
                raise Rejected(422, "INVALID_CHANGE")
            row = PolicyRevision(
                id=uuid4(),
                version=latest.version + 1,
                priority_budgets=body.priority_budgets.model_dump(),
                reason=reason,
            )
            db.add(row)
            write_audit(
                db,
                actor=Actor("user", actor.id),
                action="sla.policy_publish",
                target=Target("sla_policy_revision", row.id),
                before=SafeFacts(version=latest.version),
                after=SafeFacts(version=row.version),
            )
            return CommandResult(row.id, row.version)

        def read_result(db: Session, result: CommandResult) -> PolicyView:
            row = db.get(PolicyRevision, result.id)
            if row is None or row.version != result.version:
                raise Rejected(503, "SLA_POLICY_UNAVAILABLE")
            return row.snapshot()

        return change(
            request,
            "sla.policy.publish",
            body.model_dump(),
            execute,
            read_result,
            status=200,
        )

    @router.get("/lookups", operation_id="listAllowedLookups", response_model=NamedPage)
    def lookups(
        request: Request,
        kind: Literal["own_department", "intake_teams", "ticket_categories"],
        page: Annotated[int, Query(ge=1, le=1_000_000)] = 1,
        page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    ) -> Response:
        def read(db: Session, account: Account) -> NamedPage:
            if kind == "intake_teams":
                intake = db.scalar(
                    select(Team).where(Team.intake.is_(True), Team.active.is_(True))
                )
                return NamedPage(
                    items=[NamedView.model_validate(intake)]
                    if intake is not None and page == 1
                    else [],
                    page=page,
                    page_size=page_size,
                    total=int(intake is not None),
                )
            if kind == "ticket_categories":
                active_categories = select(TicketCategory).where(
                    TicketCategory.active.is_(True)
                )
                total = (
                    db.scalar(
                        select(func.count()).select_from(active_categories.subquery())
                    )
                    or 0
                )
                items = db.scalars(
                    active_categories.order_by(
                        TicketCategory.name_key, TicketCategory.id
                    )
                    .offset((page - 1) * page_size)
                    .limit(page_size)
                )
                return NamedPage(
                    items=[NamedView.model_validate(category) for category in items],
                    page=page,
                    page_size=page_size,
                    total=total,
                )
            row = (
                db.get(Department, account.department_id)
                if account.department_id
                else None
            )
            eligible = row is not None and row.active
            return NamedPage(
                items=[NamedView.model_validate(row)] if eligible and page == 1 else [],
                page=page,
                page_size=page_size,
                total=int(eligible),
            )

        return query(request, read, admin=False)

    return router
