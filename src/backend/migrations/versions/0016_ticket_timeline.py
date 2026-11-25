"""Index ticket timeline reads and retain scoped reasons across ticket changes."""

import sqlalchemy as sa
from alembic import op

revision = "0016_ticket_timeline"
down_revision = "0015_ticket_priority"


def upgrade() -> None:
    op.rename_table("ticket_transition_reason", "ticket_change_reason")
    op.create_index(
        "ix_domain_event_ticket_timeline",
        "domain_event",
        ["aggregate_id", "occurred_at", "id"],
        postgresql_where=sa.text("aggregate_type = 'ticket'"),
    )


def downgrade() -> None:
    op.drop_index("ix_domain_event_ticket_timeline", table_name="domain_event")
    op.rename_table("ticket_change_reason", "ticket_transition_reason")
