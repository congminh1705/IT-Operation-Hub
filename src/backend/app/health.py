import os
from typing import Literal

import psycopg
from fastapi import APIRouter, Response
from pydantic import BaseModel

router = APIRouter(prefix="/health", tags=["Health"])


class Health(BaseModel):
    status: Literal["ok", "unavailable"]


@router.get("/live", response_model=Health)
def live(response: Response) -> Health:
    response.headers["Cache-Control"] = "no-store"
    return Health(status="ok")


@router.get(
    "/ready",
    response_model=Health,
    responses={503: {"model": Health, "description": "Database unavailable."}},
)
def ready(response: Response) -> Health:
    response.headers["Cache-Control"] = "no-store"
    dsn = os.getenv("ITOH_DATABASE_DSN")
    if dsn:
        try:
            with psycopg.connect(
                dsn,
                connect_timeout=2,
                options="-c statement_timeout=2000",
                autocommit=True,
            ) as connection:
                if connection.execute("SELECT 1").fetchone() == (1,):
                    return Health(status="ok")
        except psycopg.Error:
            # Keep connection details out of the health response and logs.
            pass
    response.status_code = 503
    return Health(status="unavailable")
