# Local development

Use Python 3.13.15 and uv. From this directory:

```sh
uv sync --frozen --python 3.13.15
docker compose up -d --wait postgres
```

Compose publishes PostgreSQL to loopback on port 55432. Its credentials are for local development only. Verify PostgreSQL with `docker compose exec postgres psql -U itoh -d itoh -c "select version()"`. Stop the services with `docker compose down`. The named volume retains local data.

On Windows with Docker inside WSL2, run Compose from the Linux distribution against the mounted checkout. For example, from PowerShell use `wsl -d Ubuntu-24.04 -- docker compose -f /mnt/d/IT-Operation-Hub/src/backend/compose.yaml up -d --wait postgres`.

Set `ITOH_DATABASE_DSN` in the terminal that starts Uvicorn. In PowerShell, use the local Compose credentials:

```powershell
$env:ITOH_DATABASE_DSN = 'postgresql://itoh:local-development-only@127.0.0.1:55432/itoh'
uv run --frozen uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Check `GET /api/v1/health/live` and `GET /api/v1/health/ready` on port 8000. Liveness reports that the process responds. Readiness requires a successful PostgreSQL query and returns HTTP 503 if configuration is missing or the database is unavailable. Responses contain only the status.

Run backend checks from this directory:

```sh
uv run --frozen ruff check .
uv run --frozen mypy app tests
uv run --frozen python -m pytest
uv build --no-build-isolation
```

Future Celery workers and the single Beat scheduler run on Linux. Windows development can use WSL2 or Linux containers. This scaffold starts PostgreSQL and the API. Worker and broker setup belongs to its owning task.

## Foundation migrations

With the local database running and `ITOH_DATABASE_DSN` set to a PostgreSQL URL, run `uv run --frozen alembic upgrade head` from this directory. Inspect the active revision with `uv run --frozen alembic current`. The first revision creates audit, event and delivery tables. Account and ticket schemas belong to their domain tasks.

The second revision adds the confirmed-command ledger. Use `run_idempotent` as the top-level command transaction, passing normalized, validated input without passwords or other secrets. Supply authorization for the requested command and its exact result on replay. Only the request digest and result reference are retained. Same actor, operation, key and input replay the confirmed reference. A different input raises `IdempotencyConflict`. Exact wire headers and ledger retention remain with the corresponding service contracts.

`bump_expected_version` uses a conditional update on the authorized row inside the caller transaction. Treat `VersionConflict` as a stale-write conflict, roll back the command and ask the caller to review current data. API status mapping belongs to the consuming route.

Create one `Database` from an application-owned engine. Use `database.session()` for an isolated request or job that only reads, and `database.transaction()` at the top-level write boundary. Each call opens and closes its own synchronous Session. Downstream writes take that Session and leave commit/rollback to the caller. Inject a timezone-aware clock where deterministic timestamps are needed.

For database tests, set `ITOH_TEST_DATABASE_URL` to a disposable PostgreSQL database whose user can create schemas, then run `uv run --frozen python -m pytest`. Tests create and remove isolated schemas. Without that variable the PostgreSQL tests are reported as skipped.

The existing frontend lives in `../frontend`. Run `pnpm install --frozen-lockfile` there, then `pnpm dev` in a separate terminal. It still uses its Phase A DEMO transport until the integration tasks connect it to FastAPI.

## Account login (FND-04.01)

Apply migrations before enabling auth. Set ITOH_AUTH_ORIGINS to comma-separated exact
HTTPS origins and ITOH_DATABASE_DSN to the intended PostgreSQL URL. To test local
HTTP, bind Uvicorn to loopback and set ITOH_AUTH_INSECURE_DEV=1 with the local
HTTP origin. With auth unconfigured, its endpoints return 503.

GET /api/v1/auth/csrf?purpose=login issues a ten-minute pre-session even if
a previous session cookie is present. Send its response token as X-CSRF-Token
with the same-origin POST /api/v1/auth/login request and preserve browser cookies.
The server rotates the pre-session on login. Temporary credentials yield
PASSWORD_CHANGE_REQUIRED with a restricted session cookie.

GET /api/v1/auth/me reads the active account and current role from PostgreSQL.
With a live session cookie, GET /api/v1/auth/csrf returns its session-bound token.
Send that token and an allowed Origin to POST /api/v1/auth/logout. The API
revokes the server session and expires the cookie before returning 204. Role
and membership assertions from the client grant no access. Call
revoke_account_sessions inside the same transaction as password or access
changes. The scope-bearing membership schema and team policies belong to
FND-05. Read-only session requests do not renew the idle timeout. The account
password-change route remains with its owning task.

The one-time first Admin command is python -m app.modules.auth.bootstrap with
--authorization, --email, --display-name and --blocklist. Run from an authorized
operator shell with an approved blocklist. It prompts for the password and records
the authorization reference in audit. Run real bootstrap only when the password
change workflow and approved credential handover are available.

For the production Nginx profile, keep the FastAPI listener private, replace
incoming forwarding headers at the edge, and allowlist only the Nginx peer for
forwarded headers. Start the POST /api/v1/auth/login edge limit at 120 requests
per minute per IP and use HTTP 429 for edge throttling. The app enforces its
own PostgreSQL per-identity budget independently of client-supplied IP headers.
Schedule deletion of expired pre-sessions and old login budget records through
the deployment/operations maintenance process.

## Organization references (FND-05)

Admin operations under /api/v1/departments and /api/v1/teams use the active
server session. Mutations require an allowed Origin, a session CSRF header and
Idempotency-Key. PATCH and membership changes use expectedVersion and a reason.
Department names are normalized and unique across active and retained rows.
Department identifiers and internal codes remain stable; use active=true in
the Admin list for new account choices. The own_department lookup exposes
only the current account's own active department.

Select an active intake team with PATCH /api/v1/teams/{id} and intake=true.
The first selection is explicit. Subsequent selections atomically swap the
intake, and the PostgreSQL partial unique index enforces at most one selection.
Membership updates use the team version and only permit active IT accounts.
Removal and deactivation of active teams return HANDOVER_REQUIRED until
the FND-17 handover service owns that transaction. Effective team IDs are
computed from current eligible memberships by team_scope.effective_team_ids.
Requester lookups expose only the active intake or their own department.
Ticket categories use /api/v1/categories for Admin management and the
active-only ticket_categories lookup for request forms. Inactive categories
retain their stable ID, code and name. Integrated UI verification belongs
to INT-01 and the ticket integration tasks.
