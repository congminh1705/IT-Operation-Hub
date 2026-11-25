"""Retain human transition reasons without copying them into events or audit payloads."""

import sqlalchemy as sa
from alembic import op

revision = "0014_ticket_transition_reasons"
down_revision = "0013_ticket_comments"


def upgrade() -> None:
    op.create_table(
        "ticket_transition_reason",
        sa.Column("ticket_id", sa.Uuid(), sa.ForeignKey("ticket.id"), primary_key=True),
        sa.Column("version", sa.Integer(), primary_key=True),
        sa.Column("reason", sa.Text(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("ticket_transition_reason")
