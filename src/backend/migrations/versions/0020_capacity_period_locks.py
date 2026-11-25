"""Provide stable person/day rows for ordered capacity locks."""

import sqlalchemy as sa
from alembic import op

revision = "0020_capacity_period_locks"
down_revision = "0019_workforce_calendar"


def upgrade() -> None:
    op.create_table(
        "workforce_capacity_period",
        sa.Column(
            "account_id",
            sa.Uuid(),
            sa.ForeignKey("workforce_skills.account_id"),
            primary_key=True,
        ),
        sa.Column("local_date", sa.Date(), primary_key=True),
    )


def downgrade() -> None:
    op.drop_table("workforce_capacity_period")
