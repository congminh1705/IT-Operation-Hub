"""Keep versioned priority adjustments and their SLA breach observations."""

import sqlalchemy as sa
from alembic import op

revision = "0015_ticket_priority"
down_revision = "0014_ticket_transition_reasons"


def upgrade() -> None:
    op.create_table(
        "ticket_priority_adjustment",
        sa.Column("ticket_id", sa.Uuid(), sa.ForeignKey("ticket.id"), primary_key=True),
        sa.Column("revision", sa.Integer(), primary_key=True),
        sa.Column("ticket_version", sa.Integer(), nullable=False),
        sa.Column("previous_priority", sa.String(2), nullable=False),
        sa.Column("priority", sa.String(2), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("response_elapsed_seconds", sa.Integer()),
        sa.Column("resolution_elapsed_seconds", sa.Integer(), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("ticket_id", "ticket_version"),
    )
    op.create_table(
        "ticket_sla_breach",
        sa.Column("ticket_id", sa.Uuid(), sa.ForeignKey("ticket.id"), primary_key=True),
        sa.Column("adjustment_revision", sa.Integer(), primary_key=True),
        sa.Column("clock_type", sa.String(10), primary_key=True),
        sa.Column("priority", sa.String(2), nullable=False),
        sa.Column("elapsed_seconds", sa.Integer(), nullable=False),
        sa.Column("budget_seconds", sa.Integer(), nullable=False),
        sa.Column("detected_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("ticket_sla_breach")
    op.drop_table("ticket_priority_adjustment")
