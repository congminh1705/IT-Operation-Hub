"""Create shared audit, domain event and outbox persistence."""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "0001_foundation"
down_revision = None


def upgrade() -> None:
    op.create_table(
        "audit_log",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("actor_type", sa.String(40), nullable=False),
        sa.Column("actor_id", sa.Uuid(), nullable=False),
        sa.Column("action", sa.String(80), nullable=False),
        sa.Column("target_type", sa.String(80), nullable=False),
        sa.Column("target_id", sa.Uuid(), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("before_after_redacted", JSONB(), nullable=False),
    )
    op.create_table(
        "domain_event",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("event_type", sa.String(80), nullable=False),
        sa.Column("schema_version", sa.Integer(), nullable=False),
        sa.Column("aggregate_type", sa.String(80), nullable=False),
        sa.Column("aggregate_id", sa.Uuid(), nullable=False),
        sa.Column("aggregate_version", sa.Integer(), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("actor_type", sa.String(40), nullable=False),
        sa.Column("actor_id", sa.Uuid(), nullable=False),
        sa.Column("correlation_id", sa.Uuid(), nullable=False),
        sa.Column("causation_id", sa.Uuid()),
        sa.Column("payload", JSONB(), nullable=False),
        sa.CheckConstraint("schema_version > 0", name="ck_domain_event_schema_version"),
        sa.CheckConstraint(
            "aggregate_version > 0", name="ck_domain_event_aggregate_version"
        ),
    )
    op.create_table(
        "outbox_delivery",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "event_id", sa.Uuid(), sa.ForeignKey("domain_event.id"), nullable=False
        ),
        sa.Column("handler_purpose", sa.String(80), nullable=False),
        sa.Column("attempt", sa.Integer(), nullable=False),
        sa.Column("available_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("lease_until", sa.DateTime(timezone=True)),
        sa.Column("delivered_at", sa.DateTime(timezone=True)),
        sa.UniqueConstraint(
            "event_id", "handler_purpose", name="uq_outbox_event_handler"
        ),
        sa.CheckConstraint("attempt >= 0", name="ck_outbox_attempt"),
    )
    op.create_index(
        "ix_outbox_due", "outbox_delivery", ["delivered_at", "available_at"]
    )


def downgrade() -> None:
    op.drop_table("outbox_delivery")
    op.drop_table("domain_event")
    op.drop_table("audit_log")
