"""Seed and protect the immutable default SLA policy revision ledger."""

from uuid import UUID

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0007_sla_policy"
down_revision = "0006_ticket_categories"


def upgrade() -> None:
    table = op.create_table(
        "sla_policy_revision",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("version", sa.Integer(), nullable=False, unique=True),
        sa.Column("priority_budgets", postgresql.JSONB(), nullable=False),
        sa.Column("reason", sa.String(10000), nullable=False),
        sa.CheckConstraint("version >= 1"),
    )
    # BR-09. Set an explicit literal so offline Alembic renders the same seed.
    op.execute(
        table.insert().values(
            id=UUID("00000000-0000-4000-8000-000000000009"),
            version=1,
            priority_budgets=sa.literal_column(
                """'{"P1":{"response_seconds":900,"resolution_seconds":14400},
            "P2":{"response_seconds":3600,"resolution_seconds":28800},
            "P3":{"response_seconds":14400,"resolution_seconds":86400},
            "P4":{"response_seconds":28800,"resolution_seconds":259200}}'::jsonb"""
            ),
            reason="BR-09 initial default SLA",
        )
    )
    op.execute("""
        CREATE FUNCTION protect_sla_revision() RETURNS trigger LANGUAGE plpgsql
        AS $body$
        BEGIN
            RAISE EXCEPTION 'SLA policy revisions are immutable' USING ERRCODE = '23000';
        END;
        $body$
    """)
    op.execute("""
        CREATE TRIGGER sla_revision_append_only BEFORE UPDATE OR DELETE OR TRUNCATE
        ON sla_policy_revision FOR EACH STATEMENT EXECUTE FUNCTION protect_sla_revision()
    """)


def downgrade() -> None:
    op.drop_table("sla_policy_revision")
    op.execute("DROP FUNCTION protect_sla_revision()")
