"""Persist the consumed temporary verifier on its restricted session only."""

import sqlalchemy as sa
from alembic import op

revision = "0008_password_rotation"
down_revision = "0007_sla_policy"


def upgrade() -> None:
    op.add_column(
        "auth_session", sa.Column("temporary_verifier", sa.Text(), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("auth_session", "temporary_verifier")
