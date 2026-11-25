"""Retain emergency access holds independently of ownership and SLA state."""

import sqlalchemy as sa
from alembic import op

revision = "0024_work_access_holds"
down_revision = "0023_task_lifecycle"


def upgrade() -> None:
    op.create_table(
        "work_access_hold",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "account_id", sa.Uuid(), sa.ForeignKey("auth_account.id"), nullable=False
        ),
        sa.Column("kind", sa.String(8), nullable=False),
        sa.Column("work_id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("released_at", sa.DateTime(timezone=True)),
        sa.CheckConstraint("kind IN ('ticket','task')"),
    )
    op.create_index(
        "ix_work_access_hold_account_id", "work_access_hold", ["account_id"]
    )
    op.create_index(
        "uq_open_work_access_hold",
        "work_access_hold",
        ["kind", "work_id"],
        unique=True,
        postgresql_where=sa.text("released_at IS NULL"),
    )


def downgrade() -> None:
    op.drop_table("work_access_hold")
