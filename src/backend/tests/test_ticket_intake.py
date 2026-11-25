from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4

import pytest
from pydantic import ValidationError
from sqlalchemy import text

from app.infrastructure.database import Database
from app.modules.organization.models import Team
from app.modules.tickets.categories import TicketCategory
from app.modules.tickets.intake import (
    IntakeRejected,
    TicketCreate,
    derive_intake,
    next_ticket_code,
)


def prepare_catalog(database: Database, *, intake: bool = True) -> tuple[str, str]:
    category, team = uuid4(), uuid4()
    with database.transaction() as db:
        db.add(
            TicketCategory(
                id=category,
                code=category.hex,
                name="Network",
                name_key="network",
                active=True,
                version=1,
            )
        )
        db.add(
            Team(
                id=team,
                name="Intake",
                name_key="intake",
                active=True,
                intake=intake,
                version=1,
            )
        )
    return str(category), str(team)


def ticket_payload(category: str) -> dict[str, str]:
    return {
        "title": "Network outage",
        "description": "Synthetic network incident",
        "type": "INCIDENT",
        "category_id": category,
        "impact": "HIGH",
        "urgency": "MEDIUM",
    }


def test_intake_uses_validated_input_and_server_owned_configuration(
    database: Database,
) -> None:
    category, team = prepare_catalog(database)
    payload = ticket_payload(category)
    for forged in ("requester_id", "priority", "team_id", "code", "asset_id", "files"):
        with pytest.raises(ValidationError):
            TicketCreate.model_validate({**payload, forged: str(uuid4())})
    with pytest.raises(ValidationError):
        TicketCreate.model_validate(
            {**payload, "workflow_context": {"deadline": "2026-11-25T09:00:00"}}
        )
    with pytest.raises(ValidationError):
        TicketCreate.model_validate({**payload, "description": "     "})
    actor = uuid4()
    with database.transaction() as db:
        facts = derive_intake(db, actor, TicketCreate.model_validate(payload))
        assert facts.requester_id == actor and str(facts.team_id) == team
        assert facts.priority == "P2" and facts.sla_policy.version == 1


def test_intake_rejects_missing_intake_category_and_sla(database: Database) -> None:
    category, _ = prepare_catalog(database, intake=False)
    body = TicketCreate.model_validate(ticket_payload(category))
    with (
        database.transaction() as db,
        pytest.raises(IntakeRejected, match="INTAKE_UNAVAILABLE"),
    ):
        derive_intake(db, uuid4(), body)
    with database.transaction() as db:
        db.execute(text("UPDATE org_team SET intake=true"))
        db.execute(text("UPDATE ticket_category SET active=false"))
    with (
        database.transaction() as db,
        pytest.raises(IntakeRejected, match="CATEGORY_UNAVAILABLE"),
    ):
        derive_intake(db, uuid4(), body)
    with database.transaction() as db:
        db.execute(text("UPDATE ticket_category SET active=true"))
        db.execute(
            text(
                "ALTER TABLE sla_policy_revision DISABLE TRIGGER sla_revision_append_only"
            )
        )
        db.execute(text("TRUNCATE sla_policy_revision"))
    with (
        database.transaction() as db,
        pytest.raises(IntakeRejected, match="SLA_POLICY_UNAVAILABLE"),
    ):
        derive_intake(db, uuid4(), body)


def test_ticket_code_sequence_is_unique_across_parallel_sessions(
    database: Database,
) -> None:
    def reserve(_: int) -> str:
        with database.transaction() as db:
            return next_ticket_code(db)

    with ThreadPoolExecutor(max_workers=4) as pool:
        codes = list(pool.map(reserve, range(16)))
    assert len(set(codes)) == 16
    assert all(code.startswith("TKT-") and code[4:].isdigit() for code in codes)
