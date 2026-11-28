import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path
from unicodedata import normalize

from fastapi import FastAPI, Request
from fastapi.exception_handlers import request_validation_exception_handler
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.health import router as health_router
from app.infrastructure.database import Database, create_database_engine
from app.modules.auth.http import AuthSettings, auth_router, failure
from app.modules.auth.service import AuthService
from app.modules.organization.http import error_response, organization_router


def create_app(
    service: AuthService | None = None, settings: AuthSettings | None = None
) -> FastAPI:
    if settings is None:
        blocklist_path = os.getenv("ITOH_PASSWORD_BLOCKLIST")
        blocked = (
            frozenset(
                normalize("NFC", line).casefold()
                for line in Path(blocklist_path)
                .read_text(encoding="utf-8")
                .splitlines()
                if line
            )
            if blocklist_path
            else frozenset()
        )
        settings = AuthSettings(
            frozenset(
                value.strip()
                for value in os.getenv("ITOH_AUTH_ORIGINS", "").split(",")
                if value.strip()
            ),
            secure_cookies=os.getenv("ITOH_AUTH_INSECURE_DEV") != "1",
            blocked_passwords=blocked,
        )
    dsn = os.getenv("ITOH_DATABASE_DSN")
    engine = (
        create_database_engine(dsn)
        if service is None and dsn and settings.origins
        else None
    )
    if engine is not None:
        service = AuthService(Database(engine))

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        try:
            yield
        finally:
            if engine is not None:
                engine.dispose()

    application = FastAPI(title="IT Operation Hub", lifespan=lifespan)

    @application.exception_handler(RequestValidationError)
    async def validation_error(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        operation = getattr(request.scope.get("route"), "operation_id", None)
        if operation in {
            "listAudit",
            "getTicket",
            "listTickets",
            "listTicketEvents",
            "changeTicketPriority",
            "createWorkforceSkill",
            "listWorkforce",
            "getWorkforce",
            "updateWorkforce",
            "getWorkforceAvailability",
            "recordAbsence",
            "createManualTicketPlan",
            "listTicketPlans",
            "listPlanVersions",
            "listTasks",
            "getTask",
            "assignTask",
            "lockTaskAssignment",
            "updateTaskProgress",
            "transitionTask",
            "updateUser",
            "previewUserHandover",
            "repairUserHandover",
            "setTeamMembership",
            "updateTeam",
            "previewTeamHandover",
        }:
            return error_response(422, "INVALID_INPUT")
        if operation == "getCsrf":
            return failure(422)
        return await request_validation_exception_handler(request, exc)

    application.include_router(health_router, prefix="/api/v1")
    application.include_router(auth_router(service, settings), prefix="/api/v1")
    application.include_router(organization_router(service, settings), prefix="/api/v1")
    return application


app = create_app()
