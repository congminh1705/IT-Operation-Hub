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

Create one `Database` from an application-owned engine. Use `database.session()` for an isolated request or job that only reads, and `database.transaction()` at the top-level write boundary. Each call opens and closes its own synchronous Session. Downstream writes take that Session and leave commit/rollback to the caller. Inject a timezone-aware clock where deterministic timestamps are needed.

For database tests, set `ITOH_TEST_DATABASE_URL` to a disposable PostgreSQL database whose user can create schemas, then run `uv run --frozen python -m pytest`. Tests create and remove isolated schemas. Without that variable the PostgreSQL tests are reported as skipped.

The existing frontend lives in `../frontend`. Run `pnpm install --frozen-lockfile` there, then `pnpm dev` in a separate terminal. It still uses its Phase A DEMO transport until the integration tasks connect it to FastAPI.
