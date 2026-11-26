"""Keep stable ticket category references across deactivation."""

import sqlalchemy as sa
from alembic import op

revision = "0006_ticket_categories"
down_revision = "0005_teams"


def upgrade() -> None:
    op.create_table(
        "ticket_category",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("code", sa.String(36), nullable=False, unique=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("name_key", sa.String(240), nullable=False, unique=True),
        sa.Column("active", sa.Boolean(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.CheckConstraint("version >= 1"),
    )


def downgrade() -> None:
    op.drop_table("ticket_category")
