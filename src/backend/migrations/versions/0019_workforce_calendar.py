"""Store local planning days and UTC absences."""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "0019_workforce_calendar"
down_revision = "0018_workforce_skill_changes"


def upgrade() -> None:
    op.create_table(
        "workforce_calendar_day",
        sa.Column(
            "account_id",
            sa.Uuid(),
            sa.ForeignKey("workforce_skills.account_id"),
            primary_key=True,
        ),
        sa.Column("local_date", sa.Date(), primary_key=True),
        sa.Column("workforce_version", sa.Integer(), primary_key=True),
        sa.Column("holiday", sa.Boolean(), nullable=False),
        sa.Column("budget_minutes", sa.Integer()),
        sa.Column("intervals", JSONB(), nullable=False),
        sa.CheckConstraint("budget_minutes BETWEEN 0 AND 1440"),
    )
    op.create_table(
        "workforce_absence",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "account_id",
            sa.Uuid(),
            sa.ForeignKey("workforce_skills.account_id"),
            nullable=False,
        ),
        sa.Column("workforce_version", sa.Integer(), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("starts_at < ends_at"),
    )
    op.create_index(
        "ix_workforce_absence_account_id", "workforce_absence", ["account_id"]
    )


def downgrade() -> None:
    op.drop_table("workforce_absence")
    op.drop_table("workforce_calendar_day")
