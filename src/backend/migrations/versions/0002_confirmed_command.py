"""Add transaction-scoped idempotent command outcomes."""

import sqlalchemy as sa
from alembic import op

revision = "0002_confirmed_command"
down_revision = "0001_foundation"


def upgrade() -> None:
    op.create_table(
        "confirmed_command",
        sa.Column("actor_id", sa.Uuid(), primary_key=True),
        sa.Column("operation", sa.String(80), primary_key=True),
        sa.Column("idempotency_key", sa.String(128), primary_key=True),
        sa.Column("request_digest", sa.String(64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("result_id", sa.Uuid()),
        sa.Column("result_version", sa.Integer()),
        sa.CheckConstraint(
            "(result_id IS NULL AND result_version IS NULL) OR "
            "(result_id IS NOT NULL AND result_version IS NOT NULL AND result_version > 0)",
            name="ck_confirmed_command_result",
        ),
    )


def downgrade() -> None:
    op.drop_table("confirmed_command")
