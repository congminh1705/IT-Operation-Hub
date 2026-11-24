import asyncio
from unittest.mock import patch

import httpx
import psycopg
from pytest import MonkeyPatch

from app.main import app


def get(path: str) -> httpx.Response:
    async def request() -> httpx.Response:
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://testserver",
        ) as client:
            return await client.get(path)

    return asyncio.run(request())


def test_unconfigured_readiness_and_independent_liveness(
    monkeypatch: MonkeyPatch,
) -> None:
    monkeypatch.delenv("ITOH_DATABASE_DSN", raising=False)
    ready = get("/api/v1/health/ready")
    live = get("/api/v1/health/live")
    assert (ready.status_code, ready.json()) == (503, {"status": "unavailable"})
    assert (live.status_code, live.json()) == (200, {"status": "ok"})
    assert ready.headers["cache-control"] == live.headers["cache-control"] == "no-store"


def test_connection_error_is_redacted(monkeypatch: MonkeyPatch) -> None:
    monkeypatch.setenv("ITOH_DATABASE_DSN", "password=synthetic-test-secret")
    with patch(
        "app.health.psycopg.connect",
        side_effect=psycopg.OperationalError("synthetic-test-secret"),
    ):
        response = get("/api/v1/health/ready")
    assert (response.status_code, response.json()) == (503, {"status": "unavailable"})
