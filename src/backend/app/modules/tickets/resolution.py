from datetime import datetime

from app.modules.tickets.models import Ticket


def stop_resolution(row: Ticket, now: datetime) -> None:
    if not row.resolution_paused:
        row.resolution_used_seconds += max(
            0, int((now - row.resolution_started_at).total_seconds())
        )
        row.resolution_paused = True


def resume_resolution(row: Ticket, now: datetime) -> None:
    row.resolution_started_at = now
    row.resolution_paused = False
