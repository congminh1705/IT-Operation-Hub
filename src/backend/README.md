# Local development

Use Python 3.13.15 and uv. From this directory:

```sh
uv sync --frozen --python 3.13.15
docker compose up -d --wait postgres
uv run --frozen uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Compose publishes PostgreSQL to loopback on port 55432. Its credentials are for local development only. Verify PostgreSQL with `docker compose exec postgres psql -U itoh -d itoh -c "select version()"`. Stop the services with `docker compose down`. The named volume retains local data.

On Windows with Docker inside WSL2, run Compose from the Linux distribution against the mounted checkout. For example, from PowerShell use `wsl -d Ubuntu-24.04 -- docker compose -f /mnt/d/IT-Operation-Hub/src/backend/compose.yaml up -d --wait postgres`.

The existing frontend lives in `../frontend`. Run `pnpm install --frozen-lockfile` there, then `pnpm dev` in a separate terminal. It still uses its Phase A DEMO transport until the integration tasks connect it to FastAPI.
