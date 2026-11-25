"""Retain affected skill IDs by workforce revision for event consumers."""

import sqlalchemy as sa
from alembic import op

revision = "0018_workforce_skill_changes"
down_revision = "0017_workforce_skills"


def upgrade() -> None:
    op.create_table(
        "workforce_skill_change",
        sa.Column(
            "account_id",
            sa.Uuid(),
            sa.ForeignKey("workforce_skills.account_id"),
            primary_key=True,
        ),
        sa.Column("workforce_version", sa.Integer(), primary_key=True),
        sa.Column(
            "skill_id", sa.Uuid(), sa.ForeignKey("workforce_skill.id"), primary_key=True
        ),
    )


def downgrade() -> None:
    op.drop_table("workforce_skill_change")
