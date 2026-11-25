"""Persist text tickets and enforce immutable initial SLA snapshots."""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "0011_text_tickets"
down_revision = "0010_ticket_code"


def upgrade() -> None:
    instant = sa.DateTime(timezone=True)
    op.create_table(
        "ticket",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("code", sa.String(32), nullable=False, unique=True),
        sa.Column(
            "requester_id", sa.Uuid(), sa.ForeignKey("auth_account.id"), nullable=False
        ),
        sa.Column("team_id", sa.Uuid(), sa.ForeignKey("org_team.id"), nullable=False),
        sa.Column(
            "category_id",
            sa.Uuid(),
            sa.ForeignKey("ticket_category.id"),
            nullable=False,
        ),
        sa.Column("title", sa.String(180), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("type", sa.String(20), nullable=False),
        sa.Column("impact", sa.String(6), nullable=False),
        sa.Column("urgency", sa.String(6), nullable=False),
        sa.Column("priority", sa.String(2), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("created_at", instant, nullable=False),
        sa.Column("first_response_at", instant),
        sa.Column("resolution_started_at", instant, nullable=False),
        sa.Column("response_used_seconds", sa.Integer(), nullable=False),
        sa.Column("resolution_used_seconds", sa.Integer(), nullable=False),
        sa.Column("resolution_paused", sa.Boolean(), nullable=False),
        sa.Column("adjustment_revision", sa.Integer(), nullable=False),
        sa.Column(
            "sla_policy_version",
            sa.Integer(),
            sa.ForeignKey("sla_policy_revision.version"),
            nullable=False,
        ),
        sa.Column("sla_snapshot", JSONB(), nullable=False),
        sa.Column("workflow_context", JSONB()),
        sa.CheckConstraint("version >= 1"),
        sa.CheckConstraint("priority IN ('P1','P2','P3','P4')"),
        sa.CheckConstraint(
            "response_used_seconds >= 0 AND resolution_used_seconds >= 0 AND adjustment_revision >= 0"
        ),
    )
    op.create_index("ix_ticket_requester_id", "ticket", ["requester_id"])
    op.execute("""
        CREATE FUNCTION protect_ticket_sla_snapshot() RETURNS trigger LANGUAGE plpgsql
        AS $body$
        BEGIN
            IF NEW.sla_policy_version IS DISTINCT FROM OLD.sla_policy_version
                OR NEW.sla_snapshot IS DISTINCT FROM OLD.sla_snapshot THEN
                RAISE EXCEPTION 'Ticket SLA snapshot is immutable' USING ERRCODE = '23000';
            END IF;
            RETURN NEW;
        END;
        $body$
    """)
    op.execute("""
        CREATE TRIGGER ticket_sla_immutable BEFORE UPDATE OF sla_policy_version, sla_snapshot
        ON ticket FOR EACH ROW EXECUTE FUNCTION protect_ticket_sla_snapshot()
    """)


def downgrade() -> None:
    op.drop_table("ticket")
    op.execute("DROP FUNCTION protect_ticket_sla_snapshot()")
