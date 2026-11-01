---
id: itoh-docs-technical-architecture
title: "Target architecture and planned operations"
type: reference
domain: architecture
module: system
tags: [architecture, system, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Define component/service boundaries, transactions, security, and target operations."
---

# Target architecture and planned operations

**Target design · Design only; no running application.** No application code, migrations, or operational configuration is created/modified. [Stack](tech-stack.md): Next.js/React/TypeScript, FastAPI/SQLAlchemy/Alembic/PostgreSQL, Celery/Redis. Table/tool/route names are designs.

## 1. Modular monolith and responsibilities

One repository with existing frontend/backend directories. Next.js owns UI; FastAPI owns REST `/api/v1`/business logic. API/workers share services with separate synchronous Sessions per request/job. No Django ORM or Next.js domain logic.

| Component | Responsibility |
| --- | --- |
| Frontend | Forms/tables/states/URL filters; default 30 s active-tab polling; not authorization/DB |
| Nginx | Same domain: /api/→FastAPI, rest→frontend; TLS/body limits |
| API/router/schema | HTTP/auth/input-output/errors, not all domain logic in routers |
| Service/repository/model | Authorization/states/transactions/versions/capacity/scoped queries; repositories do not independently commit |
| Celery worker / one Beat | Outbox/AI/re-evaluation/60 s SLA/notifications/indexing; AI queues separate from SLA |
| PostgreSQL + pgvector | Domain/sessions/outbox/dedup/audit/runs/actions/approvals/KB/versions/ACL/chunks/vectors |
| Redis | Broker, not system of record or sole event/session store |
| Provider adapter | Plans/ranking/schema output/embeddings, no DB write rights |
| Private local / private S3 | Nonpublic files; API checks parent rights on every download |

Retain auth/users/teams/tickets/sla/assets/notifications/reports/audit; add work_management/workforce/automation/ai_assistant/knowledge. No microservice split.

[C4 C1–C4](../architecture/c4/README.md), [code structure](code-structure.md), [OpenAPI](../api/README.md), [DBML/ER](../database/README.md) describe design artifacts, not runtime modules.

### Views and module boundaries

[FIG-CTX01, FIG-CNT01, FIG-SEQ01/02, FIG-DEP01](../diagrams/architecture.md) show context, containers, transaction/model/approval sequences, proposed deployment. Different views of one architecture; mind maps are not deployment diagrams and ERDs are not components.

| Data-owning module | Contracts/responsibility | Allowed dependencies |
| --- | --- | --- |
| auth/users/teams | Sessions/users/organization/membership/access grants/revocation | Supply principal/scope, emit access events |
| tickets/sla | Tickets/conversations/parent files/snapshots/clocks/breaches | Auth/private-file services; no direct model write rights |
| work_management | Plans/versions/tasks/DAG/transitions/assignments | Workforce/capacity/policy/ticket references; no ticket auto-close |
| workforce | Verified skills/schedules/absence/capacity/allocation | Users/teams; consistent lock ordering with assignments |
| automation | Policies/grants/runs/actions/approvals/outbox delivery/dedup | Domain services; authorized/version-checked intents only |
| ai_assistant/knowledge | Chats/drafts/confirmation/KB versions/ACL/chunks/adapters | Scoped reads; writes through domain services; no model SQL/shell |
| assets/notifications/reports/audit | Assets/recipients/metrics/traces | Scoped queries; transaction-derived effects, not model-generated statistics |

Routers cannot bypass services through other modules' repositories. API/workers use shared service contracts, not internal HTTP Admin impersonation. These boundaries are planned packages.

## 2. Authentication and scope

Opaque server-side sessions hashed in PostgreSQL; HttpOnly/host-only/Path=/, SameSite=Lax, production Secure cookies. No localStorage tokens. Argon2id via pwdlib. Mutation/login CSRF with Origin/Referer allowlist; SameSite is insufficient alone. Lock revokes all sessions; login/security changes rotate. Check role/membership/active per request. Bootstrap/password/non-email-reset details remain D-40.

R/T/M/A follow [permissions](../requirements/permissions-matrix.md). Assistant uses user actor; background AI_COORDINATOR binds grantor/policy/scope, never impersonated Admin/Manager. Requester receives no internal/workforce/plan/AI-audit data. Scope before list/count/lookup/report/download/history/cache; generic 404 for records, 403 for prohibited features.

### Trust boundaries and threats

| Boundary / threat | Design controls | Future evidence |
| --- | --- | --- |
| Browser→API: forged role/IDOR/CSRF | Session principal/server scope/CSRF/Origin/response projection | Other-user IDs/count/lookups/download/old-session negative tests |
| Ticket/KB→model: injection | Untrusted source data, tool allowlist/schema, no secrets/shell/SQL; prompts grant nothing | Injection/forged-tool-argument cases, no unauthorized effects |
| Model/worker→domain: TOCTOU/duplicates | Transactional grant/policy/ACL/version/capacity revalidation, unique business keys | Change schedule/policy/access while model waits, two workers/crash pre-ack |
| Public↔internal: chats/files/citations | Visibility-separated AI sessions/scoped sources before provider and display | Revocation during stream/index; history/cache/source-link tests |
| Files→storage/browser: MIME spoof/public access | Allowlist/signature/size/private objects/parent download authorization/attachment/nosniff | Spoof/size/count/note-access/direct-object tests |
| Secrets/log/provider: leaks/costs | Secrets outside repo/logs, redaction, egress policy, ledger reservations/bounded retries | Response/log scan, concurrent budgets/unknown timeouts; no autonomous upgrades |
| Backup/restore: replay/copied-data leaks | Access/encryption/isolated restore/outbound-worker pause/ledger-dedup checks | No provider calls or repeated old assignments/notifications |

Rate limits/session TTL/retention/optional scanners/incident owner/production SLO require D-40 decisions. No security-certification/pentest-result claims.

## 3. Transactions and concurrency

Mutations atomically commit domain + audit + outbox, fully rolling back failures. Safe unique UUID/internal/display code generation, not MAX+1. Conditional expected-version updates return 409 without silent overwrite. Appropriate SQLAlchemy versioning/locks; ORM versions do not inherently protect bulk updates.

Multiple plan versions per ticket with partial uniqueness for one Effective. Same-plan DAG dependencies; no starts before predecessors Done. One unreturned AssetAssignment per asset via partial unique+transaction. Resource checks/reservations are atomic, not UI-only.

Assignments lock relevant workforce/allocation rows in fixed order, re-read load/calendar/skills, then write. Schedule/skill/assignment edits follow the same order. Lock only needed resources, not all users. Physical granularity/isolation/order require pre-M1/M2 refinement; no DDL/migrations yet.

## 4. Model calls outside transactions

Domain transaction → OutboxEvent → worker claim/lease + Run → scoped sources/candidates/versions → close read transaction → model adapter → schema/semantic validation → new transaction locks/re-reads → policy/grantor/ACL/version/capacity/feasibility → service tool → domain + Action + audit + notification + outbox → commit → ack.

No open DB transaction/lock during model wait. Invalid/refused/timed-out proposals create no partial tasks/assignments. Stale snapshots require evaluation. Ranking stays within backend-filtered candidates; every tool rechecks, and model proposals are not grants.

## 5. Events, outbox, retries, deduplication

| Proposed event | Source transaction | Follow-up |
| --- | --- | --- |
| ticket.created / information.updated | Ticket/confirmed command | Validate inputs, plan or clarify |
| plan.activated / task.assigned | Work service | Notify/observe; allocation/audit already committed with assignment |
| task.progressed / blocked / completed | Human service update | Unlock dependencies, assess risk, report; no ticket auto-close |
| availability.changed / skills.changed / membership.changed | Workforce/admin | Affected-task policy replanning/approval |
| sla.risk / deadline.risk / load.changed | SLA/work service | Scoped reminders/exceptions |
| policy.changed / approval.decided | Manager service | Block/revalidate pending actions; execute valid decisions |
| knowledge.published / access.revoked | Knowledge service | Index/reindex; query ACL effective immediately |

Events store ID/type/aggregate/version/actor/correlation/minimal payload/createdAt. Outbox stores status/attempt/lease-token/nextAttemptAt/deliveredAt/error; physical event/delivery tables may separate. Publisher scans pending/expired leases and may redeliver. Consumer claims event+handler/purpose and DB-deduplicates business effects. Postcommit ack failures return stored outcomes on retry.

Proposed keys: confirmed-ticket=actor+key+digest; run=event+purpose; action=run+intent+target+version; allocation=task+plan revision; notification=business event+recipient+type; SLA follows BR-10. Same key/different content conflicts. Final schema keys need review, not Celery IDs/Redis locks alone.

Transient failures use bounded timeouts/retries/jittered backoff. Authorization/schema/stale/infeasibility do not blindly retry; re-evaluate/escalate. Exhaustion persists failed/dead-letter reasons; authorized retries audited, never repeat successful intents. PostgreSQL recovers queue outages. Outbox is not exactly-once delivery; business effects need deduplication.

[EVT01–17/event envelope](api-design.md) is the authoritative producer/consumer catalog; above is architectural summary. Assignment allocation/audit is atomic in its transaction; postcommit consumers only notify/evaluate, not add required allocations later.

## 6. Workforce and planning

BR-16 defines minute-based formulas/concrete windows. Multi-period allocations follow schedule/period intersections and total remaining effort, not full effort repeated per period. Absence overlaps use interval union; missing data is not availability. Unallocated work is visible risk, not omitted reporting.

Check load, skills/team schedules, predecessors, deadlines, commitments/SLA. Aggregate capacity does not prove schedulability. Period length/daily budget/calendar timezone/slot granularity remain D-40; DEMO schedules are not enterprise policy.

## 7. Approval and intervention

Proposal: before/after/reason/impact/record-policy-workforce-plan versions/sources. Decision Pending→Approved/Rejected/Expired/Superseded; execution separately Pending/Running/Succeeded/Failed/Conflict. Approval is a decision, not effect success. Both decision/execution recheck rights/effective policies/capacity/versions. Stale→Conflict/new proposal, never automatic stale application.

Policy disable/assignment locks take effect before writes. Respect/audit manual overrides. Undo uses valid compensating actions, not history deletion or Done regression.

## 8. SLA, assets, KB, files

Ticket SLA retains 24/7/P1–P4 snapshots/Pending resolution pause/remaining-budget resume; team/assignee changes never reset. First response requires eligible public IT comment, not chat/reminder. Worker/API share services/DB breaches/dedup; 60 s scans. Task calendars do not redefine SLA.

Real inventory/assignments are authoritative; shortages become exceptions. Reservations, if adopted, need separate lifecycle/TTL/release/audit and cross-plan uniqueness. Details require decisions before schema, not autonomous AI issue.

KB Article→immutable Version→Chunk/Embedding+ACL. SQL filters Published/current access/version before retrieval, rechecks before provider/render. Index workers update vectors, never decide ACL. pgvector is target stack; embedding/dimensions/chunking/reranking/index SLA undecided. Keyword lookup is not full RAG.

Allow PNG/JPEG/WebP/PDF, ≤10, 000, 000 bytes/file, ≤5/action; validate signatures, not MIME/name alone. Private local dev/S3 production; authorized attachment/nosniff downloads, no public URLs. Stage/finalize/reconcile orphan objects; PostgreSQL cannot roll back S3. Aware UTC timestamps; pure dates stay dates; Asia/Ho_Chi_Minh display.

## 9. Planned operations and recovery

Production target: Linux Nginx/frontend/API/Celery/one Beat/PostgreSQL/Redis, private S3. Linux workers even on Windows dev. Separate liveness/readiness and DB/broker/provider health; provider failure does not invalidate core health. JSON request/event/run/action correlations without passwords/sessions/keys/sensitive prompts. Monitor outbox lag/failed runs/approval backlog/queue depth/SLA scan delay/usage.

One migration process per release before traffic, backup first, forward/backward compatibility review; replicas never auto-migrate. Future CI: frozen installs, lint/types/tests, clean/upgrade migrations, OpenAPI/type drift, build/E2 E. No executable pipeline/config created now.

Daily PostgreSQL/private-file/object-version backups with D-40 access/encryption/retention, including KB/history/events/audit/usage. Restore isolated with model/email egress blocked and workers paused. Restore DB/files, verify migrations/references/counts/SLA/outbox and no successful-action replay, then resume workers under control. Switch traffic after checks, rehearse regularly. RPO/RTO/retention/rehearsal owner remain undecided/unpromised.

DEMO accounts/data/test DB separate from production. D-39 DEMO/USD5 permission grants no real-data access. No deployment/backup/restore has run.

### Proposed release and recovery order

| Step | Planned condition/action | Control |
| --- | --- | --- |
| Prerelease | Authorization, environment-correct settings/secrets, compatibility/readable backup | Not performed; design is not production execution approval |
| Migration | One upgrader, before/after/API-worker compatibility checks | Failure blocks traffic; rollback/forward-fix follows reviewed migration plan |
| Start | DB/storage/session checks, API/frontend then workers/one Beat | Core readiness differs from broker/provider health; AI flag does not block core |
| Monitor | Errors/latency/queue/outbox/expired leases/scan delay/failed actions/approval age/usage/reserved cost | Alert thresholds/on-call owner undecided; not all events complete within 60 s |
| Pause automation | Disable policy/flag, service blocks new effects, retain runs/errors/audit | No deleted pending events/false success/lost history |
| Recover | Select backup, isolate, pause workers/egress, consistently restore DB/files | References/counts/checksums when available; clocks/snapshots/usage/dedup, no successful-action replay |
| Resume | Current rights/policies/leases/backlog, controlled workers then traffic | Record evidence/decision-maker/measured RPO/RTO; no rehearsal result yet |

### Tradeoffs and open decisions

Modular monolith reduces deployment boundaries but needs disciplined services/transactions. PostgreSQL sessions/outbox centralize durability while making DB a core dependency. Celery/Redis redelivery needs DB idempotency. Models outside transactions avoid long locks but require snapshot revalidation; models do not replace feasibility checks. pgvector co-locates sources/access in PostgreSQL, while embedding/freshness decisions remain separate.

Trace to D-30–38/NFR14–25. HA/isolation/physical locks/retention/SLO/production providers remain D-40. Do not change the stack to fill open details.

## 10. AI test cost controls — not run

Before paid requests verify model access/billing/quota/prices, DEMO-only payloads/test DB. D-39 caps total generation/embedding/retries at USD5, no more expensive fallback. Set max calls/input/output/retries/concurrency/safety margin before execution; timeouts do not justify unlimited continuation.

Ledger transaction/locks track actualSpent + reservedInFlight + unknownCost. Reserve conservative upper bounds from token limits/current prices, including provider-billed reasoning/cached/embedding usage. Send only when existing totals+new reservation remain below cap less safety margin. Every retry reserves separately. Timeout without known usage retains a conservative amount, never releases it as USD0. Settle only from sourced usage/reconcile billing; distinguish measured/estimated/unknown charges. No actual calls/ledger/billing evidence.

## Related documents

[SQLAlchemy versioning](https://docs.sqlalchemy.org/en/21/orm/versioning.html), [Celery tasks](https://docs.celeryq.dev/en/stable/userguide/tasks.html) are technical references, not application test evidence. [API design](api-design.md) · [ERD](../requirements/conceptual-data-model.md) · [Permissions](../requirements/permissions-matrix.md).

## AI Workspace and action channel — D-42

Frontend `/assistant` hosts conversations/native action cards/scoped activity. Assistant and automation retain separate actors/contexts/queues/tool grants; UI never merges identities/authority. Shared model/adapter uses one reserved global budget plus sublimits, not an increased D-39 cap.

Server registry prepares cards; trusted frontend forms call original domain APIs after user confirmation. No general-purpose proxy or model-selected endpoints/SQL/JS. Tickets retain draft/confirm; other mutations retain domain validation/concurrency/idempotency/audit/outbox. Chat history/event feeds have distinct ACLs. Shared UI does not change C4 backend/modules/workers or make workers depend on browsers when assistants/providers are disabled.
