from dataclasses import dataclass
from hmac import compare_digest
from typing import Literal, cast
from urllib.parse import urlsplit
from uuid import UUID, uuid4

from fastapi import APIRouter, Request, Response
from fastapi.params import Depends as Dependency
from fastapi.responses import JSONResponse
from fastapi.security import APIKeyCookie
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from pydantic.json_schema import SkipJsonSchema
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from app.infrastructure.commands import (
    CommandResult,
    IdempotencyConflict,
    run_idempotent,
)
from app.infrastructure.events import Actor, SafeFacts, Target, write_audit
from app.modules.auth.models import Account
from app.modules.auth.service import (
    ABSOLUTE,
    PRE_LIFETIME,
    AuthService,
    LoginRejected,
    session_csrf,
)


@dataclass(frozen=True)
class AuthSettings:
    origins: frozenset[str]
    secure_cookies: bool = True
    blocked_passwords: frozenset[str] = frozenset()

    def __post_init__(self) -> None:
        schemes = {"https"} if self.secure_cookies else {"http", "https"}
        for origin in self.origins:
            parsed = urlsplit(origin)
            if (
                parsed.scheme not in schemes
                or not parsed.hostname
                or parsed.username
                or parsed.path
                or parsed.query
                or parsed.fragment
                or parsed.geturl() != origin
            ):
                raise ValueError("Auth origins must be exact HTTP(S) origins.")

    @property
    def pre_cookie(self) -> str:
        return "__Host-itoh_pre" if self.secure_cookies else "itoh_dev_pre"

    @property
    def session_cookie(self) -> str:
        return "__Host-itoh_session" if self.secure_cookies else "itoh_dev_session"


class LoginInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: str = Field(
        min_length=1, max_length=254, json_schema_extra={"format": "email"}
    )
    password: str = Field(
        min_length=1, max_length=128, repr=False, json_schema_extra={"writeOnly": True}
    )


class PasswordChange(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    current_password: str = Field(
        min_length=1, max_length=128, repr=False, json_schema_extra={"writeOnly": True}
    )
    new_password: str = Field(
        min_length=1, max_length=128, repr=False, json_schema_extra={"writeOnly": True}
    )


class ProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    expectedVersion: int = Field(ge=1)
    display_name: str = Field(min_length=1, max_length=120)


class ProfileRejected(Exception):
    def __init__(self, status: int) -> None:
        self.status = status


type UserRole = Literal["ADMIN", "IT_MANAGER", "TECHNICIAN", "REQUESTER"]


class UserView(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    email: str = Field(json_schema_extra={"format": "email"})
    display_name: str
    role: UserRole
    active: bool
    version: int = Field(ge=1)


def user_view(account: Account) -> UserView:
    return UserView(
        id=account.id,
        email=account.email,
        display_name=account.display_name,
        role=cast(UserRole, account.role),
        active=account.active,
        version=account.version,
    )


class Csrf(BaseModel):
    model_config = ConfigDict(extra="forbid")

    csrf_token: str


class Error(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: str
    message: str
    request_id: str
    field_errors: dict[str, list[str]] | SkipJsonSchema[None] = None


ERRORS = {
    401: ("INVALID_CREDENTIALS", "Email hoac mat khau khong hop le."),
    403: ("AUTH_FORBIDDEN", "Yeu cau xac thuc bi tu choi."),
    409: ("PROFILE_CONFLICT", "H? s? ?? thay ??i. Vui l?ng t?i l?i tr??c khi l?u."),
    422: ("INVALID_INPUT", "D? li?u kh?ng h?p l?."),
    429: ("LOGIN_THROTTLED", "Vui long thu lai sau."),
    503: ("AUTH_UNAVAILABLE", "Dang nhap tam thoi khong kha dung."),
}


def failure(
    status: int,
    retry_after: int | None = None,
    *,
    session_error: bool = False,
    field_errors: dict[str, list[str]] | None = None,
) -> JSONResponse:
    code, message = ERRORS[status]
    if session_error and status == 401:
        code, message = "SESSION_INVALID", "Phien dang nhap khong hop le."
    headers = {"Cache-Control": "no-store"}
    if retry_after is not None:
        headers["Retry-After"] = str(retry_after)
    return JSONResponse(
        Error(
            code=code,
            message=message,
            request_id=str(uuid4()),
            field_errors=field_errors,
        ).model_dump(exclude_none=True),
        status_code=status,
        headers=headers,
    )


def session_cookie_dependency(settings: AuthSettings) -> Dependency:
    return Dependency(
        APIKeyCookie(
            name=settings.session_cookie, scheme_name="SessionCookie", auto_error=False
        )
    )


CSRF_HEADER = {
    "in": "header",
    "name": "X-CSRF-Token",
    "required": True,
    "schema": {"type": "string"},
}
COMMAND_HEADERS = [
    CSRF_HEADER,
    {
        "in": "header",
        "name": "Idempotency-Key",
        "required": True,
        "schema": {"type": "string", "minLength": 1, "maxLength": 128},
    },
]
SET_COOKIE = {"Set-Cookie": {"schema": {"type": "string"}}}


def auth_router(service: AuthService | None, settings: AuthSettings) -> APIRouter:
    router = APIRouter(prefix="/auth", tags=["Authentication"])

    def expired_cookie() -> Response:
        response = failure(401, session_error=True)
        clear_session_cookie(response)
        return response

    def clear_session_cookie(response: Response) -> None:
        response.delete_cookie(
            settings.session_cookie,
            secure=settings.secure_cookies,
            httponly=True,
            samesite="lax",
        )

    @router.get(
        "/me",
        operation_id="getCurrentUser",
        dependencies=[session_cookie_dependency(settings)],
        response_model=UserView,
        responses={401: {"model": Error}, 503: {"model": Error}},
    )
    def me(request: Request, response: Response) -> UserView | Response:
        if service is None:
            return failure(503)
        token = request.cookies.get(settings.session_cookie)
        try:
            account = service.current_account(token) if token else None
        except SQLAlchemyError:
            return failure(503)
        if account is None:
            # A restricted password-change session may still use authenticated CSRF.
            return failure(401, session_error=True)
        response.headers["Cache-Control"] = "no-store"
        return user_view(account)

    @router.patch(
        "/profile",
        operation_id="updateOwnProfile",
        dependencies=[session_cookie_dependency(settings)],
        response_model=UserView,
        responses={status: {"model": Error} for status in (401, 403, 409, 422, 503)},
        openapi_extra={
            "requestBody": {
                "required": True,
                "content": {
                    "application/json": {"schema": ProfileUpdate.model_json_schema()},
                },
            },
            "parameters": COMMAND_HEADERS,
        },
    )
    async def update_profile(request: Request) -> Response:
        if service is None:
            return failure(503)
        token = request.cookies.get(settings.session_cookie)
        if not token:
            return failure(401, session_error=True)
        origins = request.headers.getlist("origin")
        csrf = request.headers.getlist("x-csrf-token")
        if (
            len(origins) != 1
            or origins[0] not in settings.origins
            or len(csrf) != 1
            or not compare_digest(session_csrf(token).encode(), csrf[0].encode())
        ):
            return failure(403)
        keys = request.headers.getlist("idempotency-key")
        if len(keys) != 1 or not keys[0].strip() or len(keys[0]) > 128:
            return failure(422)
        if (
            request.headers.get("content-type", "").split(";", 1)[0].strip().lower()
            != "application/json"
        ):
            return failure(422)
        payload = bytearray()
        async for chunk in request.stream():
            if len(payload) + len(chunk) > 4096:
                return failure(422)
            payload.extend(chunk)
        try:
            body = ProfileUpdate.model_validate_json(bytes(payload))
        except ValidationError as exc:
            invalid_name = any(
                error["loc"] == ("display_name",)
                for error in exc.errors(include_input=False)
            )
            return failure(
                422,
                field_errors={
                    "display_name": ["Nh?p t?n hi?n th? h?p l?."],
                }
                if invalid_name
                else None,
            )
        name = body.display_name.strip()
        if not name or len(name) > 120 or "\0" in name:
            return failure(
                422,
                field_errors={
                    "display_name": ["T?n hi?n th? ph?i c? t? 1 ??n 120 k? t?."],
                },
            )

        def save(auth: AuthService) -> UserView:
            current = auth.current_account(token)
            if current is None:
                raise ProfileRejected(401)
            actor_id = current.id
            result_view: UserView | None = None

            def account(db: Session) -> Account:
                row = auth.account_in_transaction(db, token, lock_account=True)
                if row is None or row.id != actor_id:
                    raise ProfileRejected(401)
                return row

            def authorize(db: Session, replay: CommandResult | None) -> None:
                nonlocal result_view
                row = account(db)
                if replay is not None:
                    if replay.id != row.id or replay.version != row.version:
                        raise ProfileRejected(409)
                    result_view = user_view(row)

            def execute(db: Session) -> CommandResult:
                nonlocal result_view
                row = account(db)
                if row.version != body.expectedVersion:
                    raise ProfileRejected(409)
                previous = row.version
                row.display_name = name
                row.version += 1
                write_audit(
                    db,
                    actor=Actor("user", row.id),
                    action="auth.profile_update",
                    target=Target("account", row.id),
                    before=SafeFacts(version=previous),
                    after=SafeFacts(version=row.version),
                    clock=auth.clock,
                )
                result_view = user_view(row)
                return CommandResult(row.id, row.version)

            run_idempotent(
                auth.database,
                actor_id=actor_id,
                operation="auth.profile_update",
                key=keys[0],
                payload={"expectedVersion": body.expectedVersion, "display_name": name},
                authorize=authorize,
                execute=execute,
                clock=auth.clock,
            )
            assert result_view is not None
            return result_view

        try:
            result = await run_in_threadpool(save, service)
        except ProfileRejected as exc:
            return failure(exc.status, session_error=True)
        except IdempotencyConflict:
            return failure(409)
        except SQLAlchemyError:
            return failure(503)
        return JSONResponse(
            result.model_dump(mode="json"), headers={"Cache-Control": "no-store"}
        )

    @router.post(
        "/password",
        operation_id="changeOwnPassword",
        dependencies=[session_cookie_dependency(settings)],
        status_code=204,
        responses={
            204: {"headers": SET_COOKIE},
            **{status: {"model": Error} for status in (401, 403, 422, 503)},
        },
        openapi_extra={
            "requestBody": {
                "required": True,
                "content": {
                    "application/json": {"schema": PasswordChange.model_json_schema()},
                },
            },
            "parameters": COMMAND_HEADERS,
        },
    )
    async def change_password(request: Request) -> Response:
        if service is None or not settings.blocked_passwords:
            return failure(503)
        token = request.cookies.get(settings.session_cookie)
        if not token:
            return failure(401, session_error=True)
        origins = request.headers.getlist("origin")
        csrf = request.headers.getlist("x-csrf-token")
        if (
            len(origins) != 1
            or origins[0] not in settings.origins
            or len(csrf) != 1
            or not compare_digest(session_csrf(token).encode(), csrf[0].encode())
        ):
            return failure(403)
        keys = request.headers.getlist("idempotency-key")
        if len(keys) != 1 or not keys[0].strip() or len(keys[0]) > 128:
            return failure(422)
        if (
            request.headers.get("content-type", "").split(";", 1)[0].strip().lower()
            != "application/json"
        ):
            return failure(422)
        payload = bytearray()
        async for chunk in request.stream():
            if len(payload) + len(chunk) > 4096:
                return failure(422)
            payload.extend(chunk)
        try:
            body = PasswordChange.model_validate_json(bytes(payload))
        except ValidationError:
            return failure(422)
        try:
            outcome = await run_in_threadpool(
                service.change_password,
                token,
                body.current_password,
                body.new_password,
                settings.blocked_passwords,
            )
        except SQLAlchemyError:
            return failure(503)
        if outcome == "session":
            return expired_cookie()
        if outcome == "current_password":
            return failure(
                422, field_errors={outcome: ["M?t kh?u hi?n t?i kh?ng ??ng."]}
            )
        if outcome == "new_password":
            return failure(
                422,
                field_errors={
                    outcome: ["Ch?n m?t kh?u m?i h?p l? v? kh?c m?t kh?u hi?n t?i."]
                },
            )
        response = Response(status_code=204, headers={"Cache-Control": "no-store"})
        clear_session_cookie(response)
        return response

    @router.post(
        "/logout",
        operation_id="logout",
        dependencies=[session_cookie_dependency(settings)],
        status_code=204,
        responses={
            204: {"headers": SET_COOKIE},
            **{status: {"model": Error} for status in (401, 403, 503)},
        },
        openapi_extra={"parameters": [CSRF_HEADER]},
    )
    def logout(request: Request) -> Response:
        if service is None:
            return failure(503)
        origins = request.headers.getlist("origin")
        csrf = request.headers.getlist("x-csrf-token")
        if len(origins) != 1 or origins[0] not in settings.origins or len(csrf) != 1:
            return failure(403)
        token = request.cookies.get(settings.session_cookie)
        try:
            status = service.logout(token, csrf[0]) if token else 401
        except SQLAlchemyError:
            return failure(503)
        if status == 401:
            return expired_cookie()
        if status == 403:
            return failure(403)
        response = Response(status_code=204, headers={"Cache-Control": "no-store"})
        clear_session_cookie(response)
        return response

    @router.get(
        "/csrf",
        operation_id="getCsrf",
        response_model=Csrf,
        responses={
            200: {"headers": SET_COOKIE},
            401: {"model": Error},
            422: {"model": Error},
            503: {"model": Error},
        },
    )
    def csrf(
        request: Request, response: Response, purpose: Literal["login"] | None = None
    ) -> Csrf | Response:
        if service is None:
            return failure(503)
        current = request.cookies.get(settings.session_cookie)
        try:
            if current and purpose is None:
                value = service.authenticated_csrf(current)
                if value is None:
                    return expired_cookie()
                response.headers["Cache-Control"] = "no-store"
                return Csrf(csrf_token=value)
            token, value = service.issue_pre_session(
                request.cookies.get(settings.pre_cookie)
            )
        except SQLAlchemyError:
            return failure(503)
        response.headers["Cache-Control"] = "no-store"
        response.set_cookie(
            settings.pre_cookie,
            token,
            max_age=int(PRE_LIFETIME.total_seconds()),
            secure=settings.secure_cookies,
            httponly=True,
            samesite="lax",
        )
        return Csrf(csrf_token=value)

    @router.post(
        "/login",
        operation_id="login",
        response_model=UserView,
        responses={
            200: {"headers": SET_COOKIE},
            403: {"model": Error, "headers": SET_COOKIE},
            429: {
                "model": Error,
                "headers": {"Retry-After": {"schema": {"type": "integer"}}},
            },
            **{status: {"model": Error} for status in (401, 422, 503)},
        },
        openapi_extra={
            "requestBody": {
                "required": True,
                "content": {
                    "application/json": {"schema": LoginInput.model_json_schema()}
                },
            },
            "parameters": [CSRF_HEADER],
        },
    )
    async def login(request: Request) -> Response:
        if service is None:
            return failure(503)
        origins = request.headers.getlist("origin")
        csrf_tokens = request.headers.getlist("x-csrf-token")
        pre = request.cookies.get(settings.pre_cookie)
        if (
            len(origins) != 1
            or origins[0] not in settings.origins
            or len(csrf_tokens) != 1
            or not pre
        ):
            return failure(403)
        if (
            request.headers.get("content-type", "").split(";", 1)[0].strip().lower()
            != "application/json"
        ):
            return failure(422)
        payload = bytearray()
        async for chunk in request.stream():
            if len(payload) + len(chunk) > 4096:
                return failure(422)
            payload.extend(chunk)
        try:
            data = LoginInput.model_validate_json(bytes(payload))
        except ValidationError:
            return failure(422)

        try:
            outcome = await run_in_threadpool(
                service.login,
                data.email,
                data.password,
                pre,
                csrf_tokens[0],
                request.cookies.get(settings.session_cookie),
            )
        except SQLAlchemyError:
            return failure(503)
        if isinstance(outcome, LoginRejected):
            return failure(outcome.status, outcome.retry_after)

        account = outcome.account
        if outcome.password_change_only:
            response = JSONResponse(
                Error(
                    code="PASSWORD_CHANGE_REQUIRED",
                    message="Can doi mat khau tam thoi.",
                    request_id=str(uuid4()),
                ).model_dump(exclude_none=True),
                status_code=403,
                headers={"Cache-Control": "no-store"},
            )
        else:
            view = user_view(account)
            response = JSONResponse(
                view.model_dump(mode="json"), headers={"Cache-Control": "no-store"}
            )
        response.delete_cookie(
            settings.pre_cookie,
            secure=settings.secure_cookies,
            httponly=True,
            samesite="lax",
        )
        response.set_cookie(
            settings.session_cookie,
            outcome.token,
            max_age=int(ABSOLUTE.total_seconds()),
            secure=settings.secure_cookies,
            httponly=True,
            samesite="lax",
        )
        return response

    return router
