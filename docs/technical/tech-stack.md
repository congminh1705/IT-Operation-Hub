---
id: itoh-docs-technical-tech-stack
title: "Target stack — IT Operations Hub"
type: reference
domain: architecture
module: technology
tags: [architecture, technology, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Record the agreed stack and each technology group’s responsibility."
---

# Target stack — IT Operations Hub

**Target design · Design only.** The stack is agreed, but no application or dependency/runtime set has passed acceptance. This phase installs no dependencies and changes no operational configuration or application code.

## Retained technologies

| Component | Choice and responsibility |
| --- | --- |
| Frontend | Next.js App Router/React/TypeScript strict, UI/REST only; Tailwind CSS, shadcn/ui, Lucide React |
| Forms | React Hook Form/Zod/resolvers; UX validation does not replace backend validation |
| Server state/tables | TanStack Query/Table; server queries/paging/sorting, user/scope-partitioned cache; active-tab polling every 30 seconds |
| Charts/time | Recharts, date-fns and timezones; UTC storage/ISO API, Asia/Ho_Chi_Minh display |
| Backend | Python/FastAPI/Pydantic/pydantic-settings; modular monolith |
| Database/ORM | PostgreSQL/synchronous SQLAlchemy Session/Alembic/Psycopg 3; no Django ORM |
| Auth | PostgreSQL server sessions, opaque HttpOnly/Secure-in-production/SameSite cookies, Argon2id via pwdlib, CSRF/login Origin |
| Workers | Celery + Redis + one Beat; Linux workers including Windows development; separate AI/SLA/index queues |
| AI | Provider/model/embedding adapters, structured output/tool allowlist; backend services own write authorization |
| KB/RAG | PostgreSQL + pgvector; version/ACL/Published, background Celery chunk/embedding/indexing; runtime authorization is independent of the index |
| Storage | Private local development/private production S3 via boto 3; downloads check parent-record scope |
| Dependencies | uv/pnpm; real lockfiles when implementation begins |
| Quality/testing | Ruff/mypy/ESLint/Prettier; planned pytest/HTTPX, Vitest/RTL, Playwright |
| Deployment/operations | Docker Compose/Nginx/Uvicorn/Linux VPS/HTTPS, JSON logs/request IDs, health/backup/restore, GitHub Actions if hosted on GitHub |

No Next.js business API/Prisma/Better Auth/BullMQ or new microservices. Routes/dependencies using synchronous queries must use suitable FastAPI execution so they do not block the async event loop. Each request/task has its own Session; no globally shared Session.

## Modules and responsibilities

| Module group | Design responsibility |
| --- | --- |
| auth/users/teams | Identity, sessions/CSRF, roles, departments, teams/membership |
| tickets/sla/assets | Requests/24/7 SLA, conversations/files, asset lifecycle |
| work_management/workforce | Plans/versions/DAG, tasks, skills/schedules/capacity/allocation |
| automation | Policies/grants, outbox/events, runs/actions, approvals, retry/idempotency |
| ai_assistant/knowledge | Conversations/confirmation/sources, model/embedding adapters, KB/version/ACL/RAG |
| notifications/reports/audit | Notifications, scoped facts, action history |

D-30–32 retain the stack; D-34 limits work to documentation; D-35–38 extend AI/KB targets; D-39 concerns DEMO testing only; production requires decisions under D-40. Specific Node/Python/PG branches and patches in the [version catalog](version-baseline.md) are historical candidates requiring revalidation, not authorization to upgrade majors.

## Not implemented

No running API/worker/AI/RAG/auth/DB/migration or passing application tests exist. API documentation is not generated OpenAPI from a running server; ERDs are not a migrated schema. Do not publish a site or change hosting to replace the agreed stack.

[Architecture/operations](architecture.md) · [API design](api-design.md) · [ERD](../requirements/conceptual-data-model.md) · [M0–M5 roadmap](../09-design-readiness.md).
