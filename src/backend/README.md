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

The existing frontend lives in `../frontend`. Run `pnpm install --frozen-lockfile` there, then `pnpm dev` in a separate terminal. It still uses its Phase A DEMO transport until the integration tasks connect it to FastAPI.
