import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.health import router as health_router
from app.infrastructure.database import Database, create_database_engine
from app.modules.auth.http import AuthSettings, auth_router
from app.modules.auth.service import AuthService
from app.modules.organization.http import organization_router


def create_app(
    service: AuthService | None = None, settings: AuthSettings | None = None
) -> FastAPI:
    if settings is None:
        settings = AuthSettings(
            frozenset(
                value.strip()
                for value in os.getenv("ITOH_AUTH_ORIGINS", "").split(",")
                if value.strip()
            ),
            secure_cookies=os.getenv("ITOH_AUTH_INSECURE_DEV") != "1",
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
    application.include_router(health_router, prefix="/api/v1")
    application.include_router(auth_router(service, settings), prefix="/api/v1")
    application.include_router(organization_router(service, settings), prefix="/api/v1")
    return application


app = create_app()
