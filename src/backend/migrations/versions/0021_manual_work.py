"""Create versioned manual plans and tasks with explicit effort provenance."""

import sqlalchemy as sa
from alembic import op

revision = "0021_manual_work"
down_revision = "0020_capacity_period_locks"


def upgrade() -> None:
    op.create_table(
        "work_plan",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("ticket_id", sa.Uuid(), sa.ForeignKey("ticket.id"), nullable=False),
    )
    op.create_index("ix_work_plan_ticket_id", "work_plan", ["ticket_id"])
    op.create_table(
        "work_plan_version",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("plan_id", sa.Uuid(), sa.ForeignKey("work_plan.id"), nullable=False),
        sa.Column("ticket_id", sa.Uuid(), sa.ForeignKey("ticket.id"), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("state", sa.String(20), nullable=False),
        sa.Column("goal", sa.Text(), nullable=False),
        sa.Column("source_ticket_version", sa.Integer(), nullable=False),
        sa.UniqueConstraint("plan_id", "version"),
        sa.CheckConstraint("version >= 1 AND source_ticket_version >= 1"),
        sa.CheckConstraint(
            "state IN ('Draft', 'Effective', 'Superseded', 'Cancelled')"
        ),
    )
    op.create_index(
        "ix_work_plan_version_ticket_id", "work_plan_version", ["ticket_id"]
    )
    op.create_index(
        "uq_effective_work_plan_version",
        "work_plan_version",
        ["ticket_id"],
        unique=True,
        postgresql_where=sa.text("state = 'Effective'"),
    )
    op.create_table(
        "work_task",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "plan_version_id",
            sa.Uuid(),
            sa.ForeignKey("work_plan_version.id"),
            nullable=False,
        ),
        sa.Column("team_id", sa.Uuid(), sa.ForeignKey("org_team.id"), nullable=False),
        sa.Column("title", sa.String(180), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("estimated_minutes", sa.Integer(), nullable=False),
        sa.Column("remaining_minutes", sa.Integer(), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("effort_evidence_ref", sa.String(120), nullable=False),
        sa.Column("effort_evidence_version", sa.Integer(), nullable=False),
        sa.Column(
            "effort_verified_by",
            sa.Uuid(),
            sa.ForeignKey("auth_account.id"),
            nullable=False,
        ),
        sa.Column("effort_verified_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("assignee_id", sa.Uuid(), sa.ForeignKey("auth_account.id")),
        sa.Column("assignment_locked", sa.Boolean(), nullable=False),
        sa.Column("result", sa.Text()),
        sa.CheckConstraint(
            "version >= 1 AND estimated_minutes > 0 AND remaining_minutes >= 0 AND effort_evidence_version > 0"
        ),
        sa.CheckConstraint("starts_at < ends_at"),
        sa.CheckConstraint(
            "status IN ('To Do', 'Ready', 'In Progress', 'Blocked', 'Done', 'Cancelled')"
        ),
    )
    op.create_index("ix_work_task_plan_version_id", "work_task", ["plan_version_id"])


def downgrade() -> None:
    op.drop_table("work_task")
    op.drop_table("work_plan_version")
    op.drop_table("work_plan")
