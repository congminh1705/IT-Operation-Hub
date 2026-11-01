---
id: itoh-code-structure
title: "Code structure — proposed folders and files"
type: reference
domain: development
module: structure
tags: [development, structure, design]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Distinguish the current repository from target Next.js/FastAPI structure and ownership."
---

# Code structure — proposed folders and files

**Design documentation only.** No packages/routers/models/migrations/dependencies/tests/operational configuration created. Trees are marked planned, not existing source.

## 1. Current repository

```text
IT-Operation-Hub/
├── README.md
├── docs/
│   ├── requirements/              # Existing BR, permissions, data/ER Mermaid
│   ├── api/                       # OpenAPI JSON, operation catalog, guide
│   ├── database/                  # DBML and ER mappings
│   ├── architecture/c4/           # C1–C4 design documentation
│   ├── technical/                 # Architecture, stack, API rationale, code structure
│   ├── diagrams/                  # SVG and diagram sources in Markdown
│   ├── design/                    # Static UI/UX and wireframes
│   └── xmind/                     # Native XMind + SVG preview
└── src/
    ├── frontend/.gitkeep           # No Next.js application
    └── backend/.gitkeep            # No FastAPI application
```

Only documentation and two `src/` `.gitkeep` files currently exist. This abbreviated tree is not a complete document inventory.

## 2. Target Next.js frontend — PLANNED

```text
src/frontend/
├── package.json                         # PLANNED, no dependency installation in documentation phase
├── next.config.ts                       # PLANNED
├── tsconfig.json                        # PLANNED
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root document, providers, font
│   │   ├── providers.tsx                 # QueryClient, UI state
│   │   ├── login/page.tsx
│   │   ├── (workspace)/
│   │   │   ├── layout.tsx                # Shell/menu from server permissions
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── profile/security/page.tsx
│   │   │   ├── tickets/page.tsx
│   │   │   ├── tickets/new/page.tsx
│   │   │   ├── tickets/[id]/page.tsx
│   │   │   ├── tickets/[id]/plan/page.tsx
│   │   │   ├── work/page.tsx
│   │   │   ├── workforce/page.tsx
│   │   │   ├── coordination/page.tsx
│   │   │   ├── approvals/page.tsx
│   │   │   ├── automation/policies/page.tsx
│   │   │   ├── knowledge/page.tsx
│   │   │   ├── assets/page.tsx
│   │   │   ├── assets/new/page.tsx
│   │   │   ├── assets/[id]/page.tsx
│   │   │   ├── assets/[id]/edit/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   ├── audit/page.tsx
│   │   │   ├── assistant/page.tsx
│   │   │   └── admin/
│   │   │       ├── users/page.tsx
│   │   │       ├── departments/page.tsx
│   │   │       ├── teams/page.tsx
│   │   │       ├── teams/[id]/page.tsx
│   │   │       ├── categories/page.tsx
│   │   │       ├── sla/page.tsx
│   │   │       └── assistant/page.tsx
│   │   ├── 403/page.tsx
│   │   ├── 404/page.tsx
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   ├── features/
│   │   ├── auth/
│   │   ├── tickets/
│   │   ├── work-management/
│   │   ├── workforce/
│   │   ├── automation/
│   │   ├── assistant/
│   │   ├── knowledge/
│   │   ├── assets/
│   │   ├── notifications/
│   │   ├── reports/
│   │   ├── audit/
│   │   └── administration/
│   ├── components/
│   │   ├── ui/                          # shadcn primitives
│   │   ├── layout/                      # Shell/topbar/sidebar
│   │   └── feedback/                    # Loading/error/permission states
│   └── lib/
│       ├── api/
│       │   ├── generated/schema.d.ts     # PLANNED from OpenAPI, do not edit manually
│       │   ├── client.ts                # Cookie/CSRF/idempotency/error mapping
│       │   └── query-keys.ts             # Partition by user/scope/resource
│       ├── auth/session.ts
│       ├── dates.ts
│       └── validation.ts
├── public/
└── tests/                               # PLANNED, no executable application tests created
    ├── components/
    └── e2e/
```

Features may contain `components/`, `api.ts`, `queries.ts`, `schemas.ts`, `types.ts` as needed; do not create identical empty scaffolds without use cases. Examples: tickets/components/ticket-form.tsx and ticket-conversation.tsx; automation/components/approval-diff.tsx; work-management/components/task-board.tsx.

`app/` contains routes/layout/composition; `(workspace)` is a route group absent from URLs. SCR23/24/25/33 are ticket/asset dialogs, not artificial pages. Mobile/desktop share backend permissions. No signup/email-reset/IT Team Lead pages. 403/404 files are not menu items.

Do not duplicate domain/policies in Next.js handlers as a second backend. API uses same-origin cookies; SSR forwards valid request sessions without cross-user private caching. Partition/invalidate queries on logout/scope changes; refresh source data only after successful mutations.

## 3. Target FastAPI backend — PLANNED

```text
src/backend/
├── pyproject.toml                         # PLANNED, uv.lock only during implementation
├── alembic.ini                            # PLANNED, no configuration created
├── migrations/
│   ├── env.py                             # PLANNED
│   └── versions/                          # PLANNED, no existing migration
├── app/
│   ├── main.py                            # FastAPI composition root
│   ├── api/
│   │   ├── router.py                      # Mount /api/v1
│   │   ├── dependencies.py                # Principal, session, CSRF/UoW
│   │   └── errors.py                      # Error envelope
│   ├── core/
│   │   ├── settings.py                    # Config/secrets injection, no secret literals
│   │   ├── security.py                    # Session hashing/Argon2id/CSRF primitives
│   │   ├── principals.py                  # Human vs service-grant context
│   │   └── clock.py                       # UTC clock abstraction
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── teams/
│   │   ├── tickets/
│   │   ├── sla/
│   │   ├── assets/
│   │   ├── work_management/
│   │   │   ├── router.py                  # API05/06 transport
│   │   │   ├── schemas.py                 # Pydantic input/output projections
│   │   │   ├── service.py                 # Use case + transaction owner
│   │   │   ├── policy.py                  # Current actor/grant/scope/state
│   │   │   ├── domain.py                  # DAG/transition/value rules
│   │   │   ├── models.py                  # SQLAlchemy mapping
│   │   │   └── repository.py              # Scoped SQL, no autonomous commit
│   │   ├── workforce/
│   │   ├── automation/
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   ├── service.py
│   │   │   ├── executor.py                # Snapshot → adapter → revalidate → command
│   │   │   ├── policy.py
│   │   │   ├── models.py
│   │   │   └── repository.py
│   │   ├── ai_assistant/
│   │   ├── knowledge/
│   │   ├── notifications/
│   │   ├── reports/
│   │   └── audit/
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── base.py
│   │   │   ├── session.py                 # Sync SQLAlchemy/Psycopg; per request/job
│   │   │   └── unit_of_work.py            # Domain + audit + outbox, one commit
│   │   ├── events/
│   │   │   ├── writer.py                  # Same transaction, IDs/digests
│   │   │   └── delivery.py                # Claim/lease/publish/ack/retry
│   │   ├── ai/
│   │   │   ├── provider.py                # Interface, no DB mutation
│   │   │   ├── embedding.py
│   │   │   ├── budget.py                  # Reserve actual/in-flight/unknown
│   │   │   └── openai_adapter.py          # Future DEMO adapter per D-39, not configured
│   │   └── storage/
│   │       ├── private_files.py           # Interface / ACL caller contract
│   │       ├── local.py
│   │       └── s3.py
│   └── workers/
│       ├── celery_app.py
│       ├── schedule.py                    # One Beat, separate queues
│       ├── outbox_jobs.py
│       ├── automation_jobs.py
│       ├── sla_jobs.py
│       ├── notification_jobs.py
│       └── knowledge_jobs.py
└── tests/                                 # PLANNED, not created during documentation phase
    ├── unit/
    ├── integration/
    └── contract/
```

Auth/users/teams/sla/assets/etc. may follow router/schemas/service/policy/models/repository where responsibilities justify them; no mandatory empty files. Department/category administration belongs to users/teams/tickets by ownership, not standalone deployed services.

## 4. Dependency and transaction rules

| Layer | May call | Must not |
| --- | --- | --- |
| Frontend route/feature | API client/generated DTOs | DB/SQLAlchemy/self-granted roles |
| Router/schema | Auth dependency/application service | Commit/access another module's repository |
| Application service | Domain policies/own repository/public cross-module contracts/UoW | Trust client/model roles or hold TX through model |
| Domain policy | Value objects/current evidence | HTTP/provider/storage effects |
| Repository | Injected SQLAlchemy Session | Separate commits/Sessions bypassing invariants |
| Worker | Claim/dedup/shared service/service principal | Admin HTTP impersonation/policy-bypassing ORM writes |
| Provider/storage adapter | External protocol/I/O | Grant rights or domain effects outside commands |
| Audit/outbox | Writer inside UoW | Log secrets/publish before commit |

No async SQLAlchemy Session with synchronous ORM. Sync FastAPI routes/services/Celery workers get separate Sessions, never shared across requests/threads/jobs. Physical lock order/capacity granularity remain D-40.

## 5. Module → contract → data → view

| Module | API group | Main entities | C4 |
| --- | --- | --- | --- |
| auth/users/teams | API01/02 | User/Session/Department/Team/Membership | IAM/API |
| tickets/sla | API03/04/19 | Ticket/Comment/Event/Attachment/TicketSLA | Ticket/API + periodic worker |
| work_management/workforce | API05/06/07 | WorkPlan/PlanVersion/Task/skills/calendar/allocation | Work/API + executor |
| automation | API08–11 | Templates/policy/grant/event/run/action/approval | Controls/API + worker |
| ai_assistant/knowledge | API12–14/17 | Chat/draft/confirmed command/KB/ACL/usage | Assistant/API + adapter/index worker |
| assets | API15 | Asset/AssetAssignment | Assets/API |
| notifications/reports/audit | API16 | Recipient/facts/AuditLog | Query/API + worker |

Full routes/operations: [catalog](../api/operations.md). Entities may appear across views but have one owner. Folder names do not decide D-40 KB author/publisher rights.

## 6. Future implementation and validation

Only after a separate coding request: initialize manifests/locks → API export/DTO review → core/session/CSRF modules → Alembic/schema refinement → states/concurrency → workers/SLA → milestone automation/KB/providers. Directory trees do not activate M1–M5. Contract/client-generation CI, import-boundary, unit/integration/E2 E/restore/security tests are PLANNED/NOT RUN.

Existing: documentation/.gitkeep. Absent: manifests/locks/modules/migrations/workers/config/generated clients/tests. This document creates none of the planned files.

[C4 L4](../architecture/c4/04-code.md) · [Architecture](architecture.md) · [API](../api/README.md) · [Database](../database/README.md) · [D-40](../decisions/design-decisions.md).

## D-42 — Shared AI screen organization

Planned ai-workspace composition hosts conversation, trusted action-form renderer, scoped activity/details. Reuse domain forms/services/API clients; backend automation does not join the chat-component lifecycle. Design responsibilities only, no code folders/files. Validate form_key registry data instead of rendering model code.
