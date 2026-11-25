import json
import subprocess
import sys
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import create_app
from app.modules.auth.http import AuthSettings


def test_fastapi_openapi_matches_frontend_contract(tmp_path: Path) -> None:
    client = TestClient(create_app(settings=AuthSettings(frozenset())))
    response = client.get("/openapi.json")
    assert response.status_code == 200
    export = tmp_path / "runtime-openapi.json"
    export.write_text(json.dumps(response.json()), encoding="utf-8")

    script = (
        Path(__file__).resolve().parents[3] / "docs/api/generate_frontend_contract.py"
    )
    result = subprocess.run(
        [sys.executable, str(script), "--runtime", str(export)],
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 0, result.stderr


def test_selected_validation_errors_use_public_envelope() -> None:
    client = TestClient(create_app(settings=AuthSettings(frozenset())))
    for url in (
        "/api/v1/auth/csrf?purpose=invalid-value",
        "/api/v1/tickets?page_size=invalid-value",
        "/api/v1/tickets/invalid-value",
    ):
        response = client.get(url)
        assert response.status_code == 422
        assert set(response.json()) == {"code", "message", "request_id"}
        assert "invalid-value" not in response.text
        assert response.headers.get("Cache-Control") == "no-store"


def test_dev_openapi_documents_the_dev_session_cookie() -> None:
    client = TestClient(
        create_app(settings=AuthSettings(frozenset(), secure_cookies=False))
    )
    schema = client.get("/openapi.json").json()
    assert (
        schema["components"]["securitySchemes"]["SessionCookie"]["name"]
        == "itoh_dev_session"
    )
