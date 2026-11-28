"""Keep same-version task dependencies and private transition reasons."""

import sqlalchemy as sa
from alembic import op

revision = "0023_task_lifecycle"
down_revision = "0022_task_allocations"


def upgrade() -> None:
    op.create_unique_constraint(
        "uq_work_task_plan_and_id", "work_task", ["plan_version_id", "id"]
    )
    op.create_table(
        "work_task_dependency",
        sa.Column("task_id", sa.Uuid(), primary_key=True),
        sa.Column("predecessor_id", sa.Uuid(), primary_key=True),
        sa.Column("plan_version_id", sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(
            ("plan_version_id", "task_id"),
            ("work_task.plan_version_id", "work_task.id"),
        ),
        sa.ForeignKeyConstraint(
            ("plan_version_id", "predecessor_id"),
            ("work_task.plan_version_id", "work_task.id"),
        ),
        sa.CheckConstraint("task_id <> predecessor_id"),
    )
    op.create_index(
        "ix_work_task_dependency_predecessor",
        "work_task_dependency",
        ["predecessor_id"],
    )
    op.create_table(
        "work_task_transition",
        sa.Column(
            "task_id", sa.Uuid(), sa.ForeignKey("work_task.id"), primary_key=True
        ),
        sa.Column("version", sa.Integer(), primary_key=True),
        sa.Column("previous_status", sa.String(20), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("reason", sa.Text()),
    )


def downgrade() -> None:
    op.drop_table("work_task_transition")
    op.drop_table("work_task_dependency")
    op.drop_constraint("uq_work_task_plan_and_id", "work_task", type_="unique")
