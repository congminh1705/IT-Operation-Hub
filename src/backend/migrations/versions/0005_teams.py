"""Persist organization teams, memberships and the unique active intake."""

import sqlalchemy as sa
from alembic import op

revision = "0005_teams"
down_revision = "0004_departments"


def upgrade() -> None:
    op.create_table(
        "org_team",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("name_key", sa.String(240), nullable=False, unique=True),
        sa.Column("active", sa.Boolean(), nullable=False),
        sa.Column("intake", sa.Boolean(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.CheckConstraint("version >= 1"),
        sa.CheckConstraint("NOT intake OR active"),
    )
    op.create_index(
        "uq_org_team_single_intake",
        "org_team",
        ["intake"],
        unique=True,
        postgresql_where=sa.text("intake"),
    )
    op.create_table(
        "org_team_member",
        sa.Column("team_id", sa.Uuid(), sa.ForeignKey("org_team.id"), primary_key=True),
        sa.Column(
            "account_id", sa.Uuid(), sa.ForeignKey("auth_account.id"), primary_key=True
        ),
        sa.Column("active", sa.Boolean(), nullable=False),
    )
    op.create_index("ix_org_team_member_account_id", "org_team_member", ["account_id"])


def downgrade() -> None:
    op.drop_table("org_team_member")
    op.drop_table("org_team")
