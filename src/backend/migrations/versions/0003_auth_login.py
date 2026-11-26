"""Persist account credentials, pre-sessions, sessions and login budgets."""

import sqlalchemy as sa
from alembic import op

revision = "0003_auth_login"
down_revision = "0002_confirmed_command"


def upgrade() -> None:
    instant = sa.DateTime(timezone=True)
    op.create_table(
        "auth_account",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("email", sa.String(254), nullable=False, unique=True),
        sa.Column("display_name", sa.String(120), nullable=False),
        sa.Column("role", sa.String(16), nullable=False),
        sa.Column("active", sa.Boolean(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("password_hash", sa.Text()),
        sa.Column("temporary_until", instant),
        sa.CheckConstraint("role IN ('ADMIN','IT_MANAGER','TECHNICIAN','REQUESTER')"),
        sa.CheckConstraint("version >= 1"),
    )
    op.create_table(
        "auth_pre_session",
        sa.Column("token_hash", sa.String(64), primary_key=True),
        sa.Column("csrf_hash", sa.String(64), nullable=False),
        sa.Column("expires_at", instant, nullable=False),
    )
    op.create_index(
        "ix_auth_pre_session_expires_at", "auth_pre_session", ["expires_at"]
    )
    op.create_table(
        "auth_session",
        sa.Column("token_hash", sa.String(64), primary_key=True),
        sa.Column(
            "account_id", sa.Uuid(), sa.ForeignKey("auth_account.id"), nullable=False
        ),
        sa.Column("idle_until", instant, nullable=False),
        sa.Column("expires_at", instant, nullable=False),
        sa.Column("password_change_only", sa.Boolean(), nullable=False),
        sa.Column("revoked_at", instant),
    )
    op.create_index("ix_auth_session_account_id", "auth_session", ["account_id"])
    op.create_index("ix_auth_session_expires_at", "auth_session", ["expires_at"])
    op.create_table(
        "auth_login_budget",
        sa.Column("identity_hash", sa.String(64), primary_key=True),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("window_until", instant, nullable=False),
        sa.Column("retry_at", instant),
    )
    op.create_index(
        "ix_auth_login_budget_window_until", "auth_login_budget", ["window_until"]
    )


def downgrade() -> None:
    op.drop_table("auth_login_budget")
    op.drop_table("auth_session")
    op.drop_table("auth_pre_session")
    op.drop_table("auth_account")
