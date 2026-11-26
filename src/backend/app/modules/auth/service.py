from dataclasses import dataclass
from datetime import datetime, timedelta
from hashlib import sha256
from hmac import compare_digest
from hmac import digest as hmac_digest
from math import ceil
from secrets import token_urlsafe
from unicodedata import normalize
from uuid import UUID, uuid4

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError
from sqlalchemy import delete, select, text, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.infrastructure.clock import Clock, read_utc, utc_now
from app.infrastructure.database import Database
from app.infrastructure.events import Actor, SafeFacts, Target, write_audit
from app.modules.auth.models import Account, AuthSession, LoginBudget, PreSession

IDLE = timedelta(minutes=30)
ABSOLUTE = timedelta(hours=12)
PRE_LIFETIME = timedelta(minutes=10)
ATTEMPT_WINDOW = timedelta(minutes=15)
TEMPORARY_LIFETIME = timedelta(hours=24)


def digest(value: str) -> str:
    return sha256(value.encode()).hexdigest()


def session_csrf(token: str) -> str:
    return hmac_digest(token.encode(), b"itoh.auth.session.csrf.v1", "sha256").hex()


def revoke_account_sessions(session: Session, account_id: UUID, now: datetime) -> None:
    """Call in the same transaction as a password or effective-access change."""
    session.execute(
        update(AuthSession)
        .where(AuthSession.account_id == account_id, AuthSession.revoked_at.is_(None))
        .values(revoked_at=now)
    )


def normalize_identity(email: str) -> str:
    return normalize("NFKC", email).strip().casefold()


@dataclass(frozen=True)
class LoginRejected:
    status: int
    retry_after: int | None = None


@dataclass(frozen=True)
class LoginSucceeded:
    account: Account
    token: str
    password_change_only: bool


class AuthService:
    def __init__(self, database: Database, clock: Clock = utc_now) -> None:
        self.database = database
        self.clock = clock
        self.hasher = PasswordHasher(memory_cost=19456, time_cost=2, parallelism=1)
        self.dummy_hash = self.hasher.hash(token_urlsafe(32))

    def _live_session(
        self, session: Session, token: str
    ) -> tuple[AuthSession, Account] | None:
        record = session.get(AuthSession, digest(token), with_for_update=True)
        if record is None or record.revoked_at is not None:
            return None
        now = read_utc(self.clock)
        account = session.get(Account, record.account_id)
        if (
            record.idle_until <= now
            or record.expires_at <= now
            or account is None
            or not account.active
        ):
            record.revoked_at = now
            return None
        return record, account

    def current_account(self, token: str) -> Account | None:
        with self.database.transaction() as session:
            current = self._live_session(session, token)
            if current is None or current[0].password_change_only:
                return None
            return current[1]

    def authenticated_csrf(self, token: str) -> str | None:
        with self.database.transaction() as session:
            if self._live_session(session, token) is None:
                return None
            return session_csrf(token)

    def logout(self, token: str, csrf: str) -> int:
        with self.database.transaction() as session:
            current = self._live_session(session, token)
            if current is None:
                return 401
            if not compare_digest(session_csrf(token).encode(), csrf.encode()):
                return 403
            current[0].revoked_at = read_utc(self.clock)
            return 204

    def issue_pre_session(self, previous: str | None) -> tuple[str, str]:
        token, csrf = token_urlsafe(32), token_urlsafe(32)
        with self.database.transaction() as session:
            now = read_utc(self.clock)
            if previous:
                session.execute(
                    delete(PreSession).where(PreSession.token_hash == digest(previous))
                )
            session.add(
                PreSession(
                    token_hash=digest(token),
                    csrf_hash=digest(csrf),
                    expires_at=now + PRE_LIFETIME,
                )
            )
        return token, csrf

    def verify(self, verifier: str | None, password: str) -> bool:
        try:
            return self.hasher.verify(
                self.dummy_hash if verifier is None else verifier, password
            )
        except (VerificationError, InvalidHashError):
            return False

    def login(
        self,
        email: str,
        password: str,
        pre_token: str,
        csrf_token: str,
        previous_session: str | None,
    ) -> LoginSucceeded | LoginRejected:
        identity = normalize_identity(email)
        identity_hash = digest(identity)
        with self.database.transaction() as session:
            session.execute(text("SET LOCAL lock_timeout = '2s'"))
            pre = session.get(PreSession, digest(pre_token), with_for_update=True)
            now = read_utc(self.clock)
            if (
                pre is None
                or pre.expires_at <= now
                or not compare_digest(pre.csrf_hash, digest(csrf_token))
            ):
                return LoginRejected(403)

            session.execute(
                insert(LoginBudget)
                .values(
                    identity_hash=identity_hash,
                    attempts=0,
                    window_until=now + ATTEMPT_WINDOW,
                )
                .on_conflict_do_nothing(index_elements=[LoginBudget.identity_hash])
            )
            budget = session.get(LoginBudget, identity_hash, with_for_update=True)
            if budget is None:
                return LoginRejected(503)
            now = read_utc(self.clock)
            if pre.expires_at <= now:
                return LoginRejected(403)
            if budget.retry_at is not None and budget.retry_at > now:
                return LoginRejected(429, ceil((budget.retry_at - now).total_seconds()))
            if budget.window_until <= now:
                budget.attempts = 0
                budget.window_until = now + ATTEMPT_WINDOW

            account = session.scalar(
                select(Account).where(Account.email == identity).with_for_update()
            )
            verifier = account.password_hash if account is not None else None
            matches = self.verify(verifier, normalize("NFC", password))
            if (
                account is None
                or not account.active
                or verifier is None
                or not matches
                or (
                    account.temporary_until is not None
                    and account.temporary_until <= now
                )
            ):
                budget.attempts += 1
                if budget.attempts >= 5:
                    delay = min(900, 30 * (2 ** min(5, budget.attempts - 5)))
                    budget.retry_at = now + timedelta(seconds=delay)
                    budget.window_until = max(budget.window_until, budget.retry_at)
                return LoginRejected(401)

            temporary = account.temporary_until is not None
            if temporary:
                # Only the password-change workflow may use this session.
                account.password_hash = None
            elif self.hasher.check_needs_rehash(verifier):
                account.password_hash = self.hasher.hash(normalize("NFC", password))

            token = token_urlsafe(32)
            if previous_session:
                session.execute(
                    update(AuthSession)
                    .where(
                        AuthSession.token_hash == digest(previous_session),
                        AuthSession.revoked_at.is_(None),
                    )
                    .values(revoked_at=now)
                )
            session.add(
                AuthSession(
                    token_hash=digest(token),
                    account_id=account.id,
                    idle_until=now + IDLE,
                    expires_at=now + ABSOLUTE,
                    password_change_only=temporary,
                )
            )
            session.delete(pre)
            session.delete(budget)
            return LoginSucceeded(account, token, temporary)

    def bootstrap_admin(
        self,
        authorization: UUID,
        email: str,
        display_name: str,
        password: str,
        blocked_passwords: set[str],
    ) -> UUID:
        identity = normalize_identity(email)
        secret = normalize("NFC", password)
        if (
            "@" not in identity
            or len(identity) > 254
            or not display_name.strip()
            or len(display_name) > 120
        ):
            raise ValueError("Invalid bootstrap account.")
        if not 15 <= len(secret) <= 128 or secret.casefold() in blocked_passwords:
            raise ValueError("Initial credential does not meet policy.")
        password_hash = self.hasher.hash(secret)
        with self.database.transaction() as session:
            session.execute(text("SELECT pg_advisory_xact_lock(402001)"))
            if session.scalar(
                select(Account.id).where(Account.role == "ADMIN").limit(1)
            ):
                raise ValueError("An Admin already exists.")
            now = read_utc(self.clock)
            identifier = uuid4()
            session.add(
                Account(
                    id=identifier,
                    email=identity,
                    display_name=display_name.strip(),
                    role="ADMIN",
                    active=True,
                    version=1,
                    password_hash=password_hash,
                    temporary_until=now + TEMPORARY_LIFETIME,
                )
            )
            write_audit(
                session,
                actor=Actor("bootstrap_authorization", authorization),
                action="auth.bootstrap_admin",
                target=Target("account", identifier),
                before=SafeFacts(),
                after=SafeFacts(active=True, version=1),
                clock=self.clock,
            )
            return identifier
