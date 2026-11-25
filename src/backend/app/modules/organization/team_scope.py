from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.auth.models import Account
from app.modules.organization.models import Team, TeamMember


def effective_team_ids(session: Session, account_id: UUID) -> frozenset[UUID]:
    """Resolve current eligible memberships inside the consumer's transaction."""
    return frozenset(
        session.scalars(
            select(TeamMember.team_id)
            .join(Team, Team.id == TeamMember.team_id)
            .join(Account, Account.id == TeamMember.account_id)
            .where(
                TeamMember.account_id == account_id,
                TeamMember.active.is_(True),
                Team.active.is_(True),
                Account.active.is_(True),
                Account.role.in_(("TECHNICIAN", "IT_MANAGER", "ADMIN")),
            )
        )
    )
