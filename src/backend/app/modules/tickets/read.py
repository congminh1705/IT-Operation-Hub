from __future__ import annotations

from dataclasses import dataclass
from typing import Literal
from uuid import UUID

from pydantic import BaseModel
from sqlalchemy import false, func, or_, select, true
from sqlalchemy.orm import Session
from sqlalchemy.sql.elements import ColumnElement

from app.modules.auth.models import Account
from app.modules.organization.team_scope import effective_team_ids
from app.modules.sla.policy import Priority
from app.modules.tickets.models import Ticket
from app.modules.tickets.service import TicketPublic, public_ticket

type ListScope = Literal["mine", "work"]
type TicketSort = Literal["recent", "oldest", "priority"]
type Status = Literal[
    "New", "Open", "In Progress", "Pending", "Resolved", "Closed", "Cancelled"
]


@dataclass(frozen=True)
class TicketAccess:
    actor_id: UUID
    role: str
    team_ids: frozenset[UUID]

    @classmethod
    def resolve(cls, db: Session, actor: Account) -> TicketAccess:
        teams = (
            effective_team_ids(db, actor.id)
            if actor.role == "TECHNICIAN"
            else frozenset()
        )
        return cls(actor.id, actor.role, teams)

    def predicate(self, scope: ListScope | None = None) -> ColumnElement[bool]:
        own = Ticket.requester_id == self.actor_id
        if self.role not in ("REQUESTER", "TECHNICIAN", "IT_MANAGER", "ADMIN"):
            return false()
        if scope == "mine":
            return own
        if self.role in ("IT_MANAGER", "ADMIN"):
            return true()
        if self.role == "REQUESTER":
            return false() if scope == "work" else own
        team = Ticket.team_id.in_(self.team_ids)
        return team if scope == "work" else or_(own, team)


class TicketPage(BaseModel):
    items: list[TicketPublic]
    page: int
    page_size: int
    total: int


def search_tickets(
    db: Session,
    access: TicketAccess,
    *,
    scope: ListScope | None,
    status: Status | None,
    priority: Priority | None,
    q: str | None,
    sort: TicketSort,
    page: int,
    page_size: int,
) -> TicketPage:
    query = select(Ticket).where(access.predicate(scope))
    if status is not None:
        query = query.where(Ticket.status == status)
    if priority is not None:
        query = query.where(Ticket.priority == priority)
    if q and (term := q.strip()):
        query = query.where(
            or_(
                Ticket.code.icontains(term, autoescape=True),
                Ticket.title.icontains(term, autoescape=True),
            )
        )
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    ordering = {
        "recent": (Ticket.created_at.desc(),),
        "oldest": (Ticket.created_at.asc(),),
        "priority": (Ticket.priority.asc(), Ticket.created_at.desc()),
    }[sort]
    rows = db.scalars(
        query.order_by(*ordering, Ticket.id.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return TicketPage(
        items=[public_ticket(row) for row in rows],
        page=page,
        page_size=page_size,
        total=total,
    )
