---
id: itoh-docs-requirements-non-functional-requirements
title: "Non-functional requirements"
type: reference
domain: quality
module: non-functional
tags: [quality, non-functional, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Identify quality requirements and validation methods, separating targets from measurements."
---

# Non-functional requirements

These are future design/testing targets, not measurements. Performance thresholds need adjustment for environment/data size after M1.

| ID | Verifiable requirement | Future validation |
| --- | --- | --- |
| NFR01 | Every read/write checks session, role, record scope, including counts/lookups/files/notifications | Negative ID/role/team/direct API tests |
| NFR02 | Account lock revokes all sessions; logout invalidates current session | Old cookies/sessions cannot access data |
| NFR03 | Consistent versioned multi-record mutations; no lost updates | Concurrent state changes/claims/asset issue |
| NFR04 | Persistence across restarts; PostgreSQL/private-file backups and restore instructions | Restart/reconcile tickets/comments/assignments; recovery exercise, no committed RPO/RTO |
| NFR05 | UTC/24/7 SLA, correct Pending/reopen/priority, idempotent workers | Fixed-time examples, repeated worker runs |
| NFR06 | Private allowlisted files, ≤10 MB/file, ≤5/action, parent-content authorization | Size boundaries, spoofed MIME, note attachments, post-transfer access |
| NFR07 | Consistent safe errors, preserved forms, field guidance, no stacks/secrets | Validation/session/access/conflict/network tests |
| NFR08 | WCAG 2.2 AA target; labels/keyboard/focus/more than color | Manual/tool review of implemented UI |
| NFR09 | Usable at 320/390, 768, 1440 CSS px; 200% zoom, 320 px reflow | No lost main tasks/focus traps; readable table alternative |
| NFR10 | Lists default 20, maximum 100; bounded search/filter/sort | Stable pagination with sort tie-breaker |
| NFR11 | Proposed p95: list reads ≤2 s, writes ≤3 s on 20 users/60 tickets/30 assets in a documented environment | Not a production performance SLA; measure/refine later |
| NFR12 | SLA scan at most every 60 s; UI shows data freshness | Independent of dashboard; broker outage scan-delay monitoring and PostgreSQL recovery scans, no 60 s outage guarantee |
| NFR13 | Required audit actor/time/old/new/reason, no secrets | User role/SLA/ticket/asset event review |
| NFR14 | Next.js has no DB access; FastAPI/workers share services with separate synchronous Sessions; pnpm/uv locks | Architecture review, frozen install, clean build/test in M1 |
| NFR15 | PostgreSQL sessions, opaque HttpOnly/Secure/SameSite cookies, Argon2id, mutation/login CSRF | Expiry/revoke/rotate/cookie/Origin/CSRF tests; no reads after revocation |
| NFR16 | 30 s polling only in active tabs; user/scope-partitioned caches cleared on logout | Fake-clock/frontend/user-switch/negative API tests; workers independent of polling |
| NFR17 | OpenAPI matches generated TypeScript; UTC/Asia/Ho_Chi_Minh; backend pagination/filtering | Contract CI/timezone/filter/page tests; no client filtering as server authorization |

Accessibility reference: [WCAG 2.2](https://www.w3.org/TR/WCAG22/). Current scope does not permit application measurements; drawings do not justify PASS.

## NFR18–26 — Coordination, knowledge, and operations

| ID | Design requirement | Future validation |
| --- | --- | --- |
| NFR18 | Default-deny policy, scoped AI identity, current grantor/policy/version recheck before every effect, including approval | Revocation during model call, forged principal, exceeded team/priority/actions |
| NFR19 | Atomic capacity/allocation, one effective plan, DAG, idempotent intents | Two PostgreSQL workers/events/retries; SQLite does not prove PostgreSQL locking/constraints |
| NFR20 | No DB transactions/locks while waiting for models; invalid output has no partial effect | Timeout/refusal/schema failure, lock/transaction observation, domain diff |
| NFR21 | Durable replayable outbox, bounded retry/backoff/dead-letter; core/SLA independent of provider | Broker disconnect/crash after commit before ack; core API while DB available; outbox recovery/SLA catch-up without clock reset; same-intent retry |
| NFR22 | KB Published/version/ACL before retrieval/provider/render/history; revocation despite stale vectors | ACL changes during indexing/model calls; cache/history/citation negatives |
| NFR23 | Sourced usage/cost; finite budget/calls/tokens/retries; reservations for in-flight/unknown requests | Concurrent calls/unknown timeout usage/stop before cap; no autonomous quota/model increase |
| NFR24 | Trace event/run/policy/grantor/source/tool/result/error with redaction | Audit/action comparison; no passwords/sessions/keys/sensitive prompts by default |
| NFR25 | No overwrite of manual locks/in-progress work/stale approvals; compensation/audit for undo | Manager intervention between proposal/execution, already Done tasks |
| NFR26 | Keyboard/list alternatives for task boards/DAG/approvals; responsive explicit states | Keyboard/mobile/reduced-motion/focus; static SVGs insufficient |

Coordination/event/index latency and retry/backoff values require decisions before operations. SLA's 60 s scan cadence is not a promise that every model call completes in 60 s. D-39 does not replace production budgets/data authorization.

## Measurement scope and conclusions

NFR01–26 are requirements/candidate thresholds, without current measurements. NFR11 is a proposed performance target on illustrative data, not an approved production SLO. NFR12 assumes healthy scheduler/broker/DB and does not guarantee breach detection within 60 s during outages. NFR08 is an accessibility target, not static-image WCAG certification.

Record data size, concurrency, environment, measurement interval, percentile, and measured query/action. Separate actual/reserved/unknown costs. Availability, event/index latency, limits/TTLs, retention, RPO/RTO remain D-40 decisions. The [validation plan](../09-design-readiness.md) defines future test layers/evidence; [architecture](../technical/architecture.md) defines controls.

## D-42 — Shared action channel and workspace

AI Workspace inherits original API session/CSRF/ACL/state/version/idempotency. Models do not select endpoints/actors or skip confirmation. Activity has separate projections; no internal polling payloads for R. Chat/workers are independent; provider failure does not lock forms/SLA. Shared models require aggregate reservations/quotas and sublimits so chat does not exhaust worker resources. Values need D-40 refinement; no new benchmarks/production budget.
