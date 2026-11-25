from datetime import datetime
from typing import Literal
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.infrastructure.clock import Clock, read_utc
from app.infrastructure.commands import CommandResult
from app.modules.auth.models import Account
from app.modules.tickets.assignment import TicketCommandRejected, lock_ticket
from app.modules.tickets.models import Ticket, TicketComment
from app.modules.tickets.read import TicketAccess

type Visibility = Literal["PUBLIC", "INTERNAL"]


class CommentCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    content: str = Field(min_length=1, max_length=10000)
    visibility: Visibility

    @field_validator("content")
    @classmethod
    def valid_content(cls, value: str) -> str:
        if chr(0) in value or not any(
            character.isprintable() and not character.isspace() for character in value
        ):
            raise ValueError("Comment must contain visible text")
        return value


class CommentView(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="forbid")

    id: UUID
    content: str
    visibility: Visibility
    author_id: UUID
    created_at: datetime


class CommentPage(BaseModel):
    items: list[CommentView]
    total: int
    page: int
    page_size: int


def conversation_access(
    db: Session, actor: Account, ticket_id: UUID
) -> tuple[Ticket, bool]:
    access = TicketAccess.resolve(db, actor)
    row = db.scalar(select(Ticket).where(Ticket.id == ticket_id, access.predicate()))
    if row is None:
        raise TicketCommandRejected(404, "NOT_FOUND")
    return row, access.can_view_internal(row)


def list_comments(
    db: Session, actor: Account, ticket_id: UUID, page: int, page_size: int
) -> CommentPage:
    _, internal = conversation_access(db, actor, ticket_id)
    criteria = [TicketComment.ticket_id == ticket_id]
    if not internal:
        criteria.append(TicketComment.visibility == "PUBLIC")
    total = (
        db.scalar(select(func.count()).select_from(TicketComment).where(*criteria)) or 0
    )
    rows = db.scalars(
        select(TicketComment)
        .where(*criteria)
        .order_by(TicketComment.created_at, TicketComment.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return CommentPage(
        items=[CommentView.model_validate(row) for row in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


def append_comment(
    db: Session,
    actor: Account,
    row: Ticket,
    body: CommentCreate,
    now: datetime,
    *,
    internal: bool,
) -> TicketComment:
    comment = TicketComment(
        id=uuid4(),
        ticket_id=row.id,
        author_id=actor.id,
        visibility=body.visibility,
        content=body.content,
        created_at=now,
    )
    db.add(comment)
    if (
        body.visibility == "PUBLIC"
        and internal
        and actor.id != row.requester_id
        and row.first_response_at is None
    ):
        row.first_response_at = now
        row.response_used_seconds = max(0, int((now - row.created_at).total_seconds()))
        row.version += 1
    return comment


def create_comment(
    db: Session, actor: Account, ticket_id: UUID, body: CommentCreate, clock: Clock
) -> CommandResult:
    lock_ticket(db, ticket_id)
    row, internal = conversation_access(db, actor, ticket_id)
    if body.visibility == "INTERNAL" and not internal:
        raise TicketCommandRejected(403, "FORBIDDEN")
    if row.status in ("Closed", "Cancelled"):
        raise TicketCommandRejected(409, "TICKET_READ_ONLY")
    comment = append_comment(db, actor, row, body, read_utc(clock), internal=internal)
    return CommandResult(comment.id, 1)


def comment_result(
    db: Session, actor: Account, ticket_id: UUID, result: CommandResult
) -> CommentView:
    _, internal = conversation_access(db, actor, ticket_id)
    row = db.get(TicketComment, result.id)
    if (
        row is None
        or row.ticket_id != ticket_id
        or (row.visibility == "INTERNAL" and not internal)
    ):
        raise TicketCommandRejected(404, "NOT_FOUND")
    return CommentView.model_validate(row)
