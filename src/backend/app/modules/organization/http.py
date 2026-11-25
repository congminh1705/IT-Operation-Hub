from collections.abc import Callable
from hmac import compare_digest
from typing import Annotated, Any, Literal
from unicodedata import normalize
from uuid import UUID, uuid4

from fastapi import APIRouter, Query, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.infrastructure.commands import (
    CommandResult,
    IdempotencyConflict,
    JsonValue,
    run_idempotent,
)
from app.infrastructure.events import Actor, SafeFacts, Target, write_audit
from app.modules.auth.http import AuthSettings
from app.modules.auth.models import Account
from app.modules.auth.service import AuthService, session_csrf
from app.modules.organization.models import Department


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

    def department(db: Session, record_id: UUID, *, lock: bool = False) -> Department:
        row = db.get(Department, record_id, with_for_update=lock)
        if row is None:
            raise Rejected(404, "NOT_FOUND")
        return row

    def view_result(db: Session, result: CommandResult) -> NamedView:
        row = department(db, result.id)
        if row.version != result.version:
            raise Rejected(409, "REPLAY_STALE")
        return NamedView.model_validate(row)

    def audit(
        db: Session, actor: Account, action: str, row: Department, before: SafeFacts
    ) -> None:
        write_audit(
            db,
            actor=Actor("user", actor.id),
            action=action,
            target=Target("department", row.id),
            before=before,
            after=SafeFacts(active=row.active, version=row.version),
        )

    @router.get(
        "/departments", operation_id="listDepartments", response_model=NamedPage
    )
    def departments(
        request: Request,
        page: Annotated[int, Query(ge=1, le=1_000_000)] = 1,
        page_size: Annotated[int, Query(ge=1, le=100)] = 20,
        active: bool | None = None,
    ) -> Response:
        def read(db: Session, _: Account) -> NamedPage:
            rows = select(Department)
            if active is not None:
                rows = rows.where(Department.active == active)
            total = db.scalar(select(func.count()).select_from(rows.subquery())) or 0
            items = db.scalars(
                rows.order_by(Department.name_key, Department.id)
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
        "/departments/{id}", operation_id="getDepartment", response_model=NamedView
    )
    def get_department(id: UUID, request: Request) -> Response:
        return query(
            request, lambda db, _: NamedView.model_validate(department(db, id))
        )

    @router.post(
        "/departments",
        operation_id="createDepartment",
        response_model=NamedView,
        status_code=201,
    )
    def create_department(request: Request, body: NamedCreate) -> Response:
        def execute(db: Session, actor: Account) -> CommandResult:
            identifier = uuid4()
            name, key = normalized_name(body.name)
            row = Department(
                id=identifier,
                code=identifier.hex,
                name=name,
                name_key=key,
                active=body.active,
                version=1,
            )
            db.add(row)
            audit(db, actor, "department.create", row, SafeFacts())
            return CommandResult(identifier, 1)

        return change(
            request,
            "department.create",
            body.model_dump(),
            execute,
            view_result,
            status=201,
        )

    @router.patch(
        "/departments/{id}", operation_id="updateDepartment", response_model=NamedView
    )
    def update_department(id: UUID, request: Request, body: NamedUpdate) -> Response:
        def execute(db: Session, actor: Account) -> CommandResult:
            row = department(db, id, lock=True)
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
            audit(db, actor, "department.update", row, before)
            return CommandResult(row.id, row.version)

        payload: dict[str, Any] = body.model_dump(exclude_unset=True)
        return change(
            request,
            "department.update",
            {"id": str(id), **payload},
            execute,
            view_result,
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
            if kind != "own_department":
                raise Rejected(503, "LOOKUP_UNAVAILABLE")
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
