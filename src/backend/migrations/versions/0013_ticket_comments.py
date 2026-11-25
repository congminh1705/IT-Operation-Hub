"""Persist audience-scoped ticket conversations."""

import sqlalchemy as sa
from alembic import op

revision = "0013_ticket_comments"
down_revision = "0012_ticket_assignment"


def upgrade() -> None:
    op.create_table(
        "ticket_comment",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("ticket_id", sa.Uuid(), sa.ForeignKey("ticket.id"), nullable=False),
        sa.Column(
            "author_id", sa.Uuid(), sa.ForeignKey("auth_account.id"), nullable=False
        ),
        sa.Column("visibility", sa.String(8), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("visibility IN ('PUBLIC', 'INTERNAL')"),
    )
    op.create_index("ix_ticket_comment_ticket_id", "ticket_comment", ["ticket_id"])


def downgrade() -> None:
    op.drop_table("ticket_comment")
