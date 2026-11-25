"""Persist a skill catalog, versioned verification and required skills."""

import sqlalchemy as sa
from alembic import op

revision = "0017_workforce_skills"
down_revision = "0016_ticket_timeline"


def upgrade() -> None:
    op.create_table(
        "workforce_skill",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("name_key", sa.String(160), nullable=False),
        sa.Column("department_id", sa.Uuid(), sa.ForeignKey("org_department.id")),
        sa.UniqueConstraint(
            "department_id", "name_key", postgresql_nulls_not_distinct=True
        ),
    )
    op.create_table(
        "workforce_skills",
        sa.Column(
            "account_id", sa.Uuid(), sa.ForeignKey("auth_account.id"), primary_key=True
        ),
        sa.Column("version", sa.Integer(), nullable=False),
    )
    op.create_table(
        "workforce_user_skill",
        sa.Column(
            "account_id",
            sa.Uuid(),
            sa.ForeignKey("workforce_skills.account_id"),
            primary_key=True,
        ),
        sa.Column(
            "skill_id", sa.Uuid(), sa.ForeignKey("workforce_skill.id"), primary_key=True
        ),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("verified", sa.Boolean(), nullable=False),
        sa.Column("verified_by", sa.Uuid(), sa.ForeignKey("auth_account.id")),
        sa.Column(
            "verified_department_id", sa.Uuid(), sa.ForeignKey("org_department.id")
        ),
        sa.Column("verified_at", sa.DateTime(timezone=True)),
        sa.Column("expires_at", sa.DateTime(timezone=True)),
        sa.Column("evidence_ref", sa.String(120)),
        sa.Column("evidence_version", sa.Integer()),
    )
    op.create_table(
        "task_skill_requirement",
        sa.Column("task_id", sa.Uuid(), primary_key=True),
        sa.Column(
            "skill_id", sa.Uuid(), sa.ForeignKey("workforce_skill.id"), primary_key=True
        ),
    )


def downgrade() -> None:
    op.drop_table("task_skill_requirement")
    op.drop_table("workforce_user_skill")
    op.drop_table("workforce_skills")
    op.drop_table("workforce_skill")
