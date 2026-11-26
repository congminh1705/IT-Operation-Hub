"""Persist departments and optional historical account references."""

import sqlalchemy as sa
from alembic import op

revision = "0004_departments"
down_revision = "0003_auth_login"


def upgrade() -> None:
    op.create_table(
        "org_department",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("code", sa.String(36), nullable=False, unique=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("name_key", sa.String(240), nullable=False, unique=True),
        sa.Column("active", sa.Boolean(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.CheckConstraint("version >= 1"),
    )
    op.add_column("auth_account", sa.Column("department_id", sa.Uuid(), nullable=True))
    op.create_foreign_key(
        "fk_auth_account_department",
        "auth_account",
        "org_department",
        ["department_id"],
        ["id"],
    )
    op.create_index("ix_auth_account_department_id", "auth_account", ["department_id"])


def downgrade() -> None:
    op.drop_index("ix_auth_account_department_id", table_name="auth_account")
    op.drop_constraint("fk_auth_account_department", "auth_account", type_="foreignkey")
    op.drop_column("auth_account", "department_id")
    op.drop_table("org_department")
