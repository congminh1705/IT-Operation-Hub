from dataclasses import dataclass
from urllib.parse import urlsplit
from uuid import UUID, uuid4

from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from sqlalchemy.exc import SQLAlchemyError

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


def failure(status: int, retry_after: int | None = None) -> JSONResponse:
    code, message = ERRORS[status]
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

    @router.get(
        "/csrf",
        operation_id="getCsrf",
        response_model=Csrf,
        responses={503: {"model": Error}},
    )
    def csrf(request: Request, response: Response) -> Csrf | Response:
        if service is None:
            return failure(503)
        try:
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
            view = UserView(
                id=account.id,
                email=account.email,
                display_name=account.display_name,
                role=account.role,
                active=account.active,
                version=account.version,
            )
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
