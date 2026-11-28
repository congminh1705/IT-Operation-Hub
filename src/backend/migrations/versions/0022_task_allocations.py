"""Store auditable per-slot reservations for manual task work."""

import sqlalchemy as sa
from alembic import op

revision = "0022_task_allocations"
down_revision = "0021_manual_work"


def upgrade() -> None:
    op.create_table(
        "work_task_allocation",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("task_id", sa.Uuid(), sa.ForeignKey("work_task.id"), nullable=False),
        sa.Column(
            "account_id",
            sa.Uuid(),
            sa.ForeignKey("workforce_skills.account_id"),
            nullable=False,
        ),
        sa.Column("local_date", sa.Date(), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("task_version", sa.Integer(), nullable=False),
        sa.Column("released_at", sa.DateTime(timezone=True)),
        sa.CheckConstraint("starts_at < ends_at AND task_version >= 1"),
        sa.UniqueConstraint("task_id", "task_version", "starts_at", "ends_at"),
    )
    op.create_index(
        "ix_work_task_allocation_task_id", "work_task_allocation", ["task_id"]
    )
    op.create_index(
        "ix_work_task_allocation_account_id", "work_task_allocation", ["account_id"]
    )


def downgrade() -> None:
    op.drop_table("work_task_allocation")
