from dataclasses import dataclass
from typing import Literal
from urllib.parse import urlsplit
from uuid import UUID, uuid4

from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.modules.auth.models import Account
from app.modules.auth.service import ABSOLUTE, PRE_LIFETIME, AuthService, LoginRejected


@dataclass(frozen=True)
class AuthSettings:
    origins: frozenset[str]
    secure_cookies: bool = True

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
    email: str = Field(min_length=1, max_length=254)
    password: str = Field(min_length=1, max_length=128, repr=False)


class UserView(BaseModel):
    id: UUID
    email: str
    display_name: str
    role: str
    active: bool
    version: int


def user_view(account: Account) -> UserView:
    return UserView(
        id=account.id,
        email=account.email,
        display_name=account.display_name,
        role=account.role,
        active=account.active,
        version=account.version,
    )


class Csrf(BaseModel):
    csrf_token: str


class Error(BaseModel):
    code: str
    message: str
    request_id: str


ERRORS = {
    401: ("INVALID_CREDENTIALS", "Email hoac mat khau khong hop le."),
    403: ("AUTH_FORBIDDEN", "Yeu cau xac thuc bi tu choi."),
    422: ("INVALID_INPUT", "Du lieu dang nhap khong hop le."),
    429: ("LOGIN_THROTTLED", "Vui long thu lai sau."),
    503: ("AUTH_UNAVAILABLE", "Dang nhap tam thoi khong kha dung."),
}


def failure(
    status: int, retry_after: int | None = None, *, session_error: bool = False
) -> JSONResponse:
    code, message = ERRORS[status]
    if session_error and status == 401:
        code, message = "SESSION_INVALID", "Phien dang nhap khong hop le."
    headers = {"Cache-Control": "no-store"}
    if retry_after is not None:
        headers["Retry-After"] = str(retry_after)
    return JSONResponse(
        Error(code=code, message=message, request_id=str(uuid4())).model_dump(),
        status_code=status,
        headers=headers,
    )


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

    @router.post(
        "/logout",
        operation_id="logout",
        status_code=204,
        responses={status: {"model": Error} for status in (401, 403, 503)},
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
        responses={401: {"model": Error}, 503: {"model": Error}},
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
        responses={status: {"model": Error} for status in ERRORS},
        openapi_extra={
            "requestBody": {
                "required": True,
                "content": {
                    "application/json": {"schema": LoginInput.model_json_schema()}
                },
            },
            "parameters": [
                {
                    "in": "header",
                    "name": "X-CSRF-Token",
                    "required": True,
                    "schema": {"type": "string"},
                }
            ],
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

        from starlette.concurrency import run_in_threadpool

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
                ).model_dump(),
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
