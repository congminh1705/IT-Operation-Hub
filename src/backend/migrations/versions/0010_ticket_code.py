"""Provide a concurrency-safe ticket number sequence."""

from alembic import op

revision = "0010_ticket_code"
down_revision = "0009_provisioning_verification"


def upgrade() -> None:
    op.execute("CREATE SEQUENCE ticket_code_number AS bigint START WITH 1 NO CYCLE")


def downgrade() -> None:
    op.execute("DROP SEQUENCE ticket_code_number")
