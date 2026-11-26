"""Exercise the draft/runtime comparison without a running service."""

import json
from pathlib import Path
import subprocess
import sys
from tempfile import TemporaryDirectory
import unittest

from generate_frontend_contract import DRAFT, ROOT


class RuntimeContractTest(unittest.TestCase):
    def setUp(self) -> None:
        self.runtime = json.loads(DRAFT.read_text(encoding="utf-8"))
        self.runtime.pop("servers")
        self.runtime["paths"] = {
            f"/api/v1{path}": operations
            for path, operations in self.runtime["paths"].items()
        }
        self.runtime["info"]["description"] = "Synthetic runtime-shaped export"

    def compare(self, contract: dict, drift: str | None = None) -> None:
        with TemporaryDirectory() as directory:
            target = Path(directory, "runtime-openapi.json")
            target.write_text(json.dumps(contract), encoding="utf-8")
            result = subprocess.run(
                [sys.executable, "docs/api/generate_frontend_contract.py", "--runtime", str(target)],
                cwd=ROOT, capture_output=True, text=True, check=False,
            )
        if drift is None:
            self.assertEqual(result.returncode, 0, result.stderr)
        else:
            self.assertEqual(result.returncode, 1, result.stdout)
            self.assertIn(drift, result.stderr)

    def test_prefixed_paths_match(self) -> None:
        self.compare(self.runtime)

    def test_detects_public_schema_widening(self) -> None:
        self.runtime["components"]["schemas"]["TicketPublic"]["properties"]["internal_context"] = {
            "type": "string",
        }
        self.compare(self.runtime, "listTickets.responses, getTicket.responses")

    def test_detects_missing_csrf_header(self) -> None:
        login = self.runtime["paths"]["/api/v1/auth/login"]["post"]
        login["parameters"] = [
            param for param in login["parameters"]
            if param.get("$ref") != "#/components/parameters/Csrf"
        ]
        self.compare(self.runtime, "login.parameters")

    def test_detects_missing_session_requirement(self) -> None:
        self.runtime["paths"]["/api/v1/auth/me"]["get"]["security"] = []
        self.compare(self.runtime, "getCurrentUser.security")

    def test_detects_missing_conflict_status(self) -> None:
        del self.runtime["paths"]["/api/v1/auth/profile"]["patch"]["responses"]["409"]
        self.compare(self.runtime, "updateOwnProfile.responses")


if __name__ == "__main__":
    unittest.main()
