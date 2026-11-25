"""Persist the current ticket assignee and guard active work ownership."""

import sqlalchemy as sa
from alembic import op

revision = "0012_ticket_assignment"
down_revision = "0011_text_tickets"


def upgrade() -> None:
    op.add_column("ticket", sa.Column("assignee_id", sa.Uuid(), nullable=True))
    op.create_foreign_key(
        "fk_ticket_assignee", "ticket", "auth_account", ["assignee_id"], ["id"]
    )
    op.create_check_constraint(
        "ck_ticket_active_assignee",
        "ticket",
        "status NOT IN ('In Progress', 'Pending') OR assignee_id IS NOT NULL",
    )


def downgrade() -> None:
    op.drop_constraint("ck_ticket_active_assignee", "ticket", type_="check")
    op.drop_constraint("fk_ticket_assignee", "ticket", type_="foreignkey")
    op.drop_column("ticket", "assignee_id")
