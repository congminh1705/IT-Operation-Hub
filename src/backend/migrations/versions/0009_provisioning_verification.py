"""Add trusted one-use evidence for account provisioning."""

import sqlalchemy as sa
from alembic import op

revision = "0009_provisioning_verification"
down_revision = "0008_password_rotation"


def upgrade() -> None:
    op.create_table(
        "user_provisioning_verification",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("source_kind", sa.String(16), nullable=False),
        sa.Column("source_id", sa.Uuid(), nullable=False, unique=True),
        sa.Column("email", sa.String(254), nullable=False),
        sa.Column(
            "department_id",
            sa.Uuid(),
            sa.ForeignKey("org_department.id"),
            nullable=False,
        ),
        sa.Column("role", sa.String(16), nullable=False),
        sa.Column(
            "verified_by", sa.Uuid(), sa.ForeignKey("auth_account.id"), nullable=False
        ),
        sa.Column("elevated_approval_id", sa.Uuid()),
        sa.Column(
            "consumed_account_id",
            sa.Uuid(),
            sa.ForeignKey("auth_account.id"),
            unique=True,
        ),
        sa.Column("active", sa.Boolean(), nullable=False),
        sa.CheckConstraint("source_kind IN ('D29_REQUEST','INITIAL_SETUP')"),
        sa.CheckConstraint("role IN ('REQUESTER','TECHNICIAN','IT_MANAGER','ADMIN')"),
        sa.CheckConstraint("source_kind <> 'INITIAL_SETUP' OR role = 'REQUESTER'"),
    )


def downgrade() -> None:
    op.drop_table("user_provisioning_verification")
