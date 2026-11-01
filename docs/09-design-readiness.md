---
id: itoh-docs-09-design-readiness
title: "Design status and M0–M5 roadmap"
type: planning
domain: project
module: delivery
tags: [project, delivery, planning]
priority: 1
status: planned
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Describe the roadmap, epics/dependencies, and validation plan without authorizing implementation."
---

# Design status and M0–M5 roadmap

**Current work is documentation ONLY.** M1–M5 are plans, not instructions to create code, dependencies, migrations, tests, or operational configuration. This replaces the old M1–M6 schedule to bring AI automation into M3. Specification does not mean a software gate has passed.

## M0 — Complete the design

Complete scope/features/roles, UC/US/AC, states/permissions, architecture/ERD/API, AI/policies/approvals, workers/events/retry/security/audit, UI, test/operations plans, and diagrams. Maintain content directly in each topic's authoritative source.

Current M0 artifacts: [DBML/ER Mermaid](database/README.md), [OpenAPI document](api/README.md), [C4 C1–C4](architecture/c4/README.md), and [target folder/file structure](technical/code-structure.md). These are design drafts; physical contracts/schema require D-40 review. No application code/migrations/manifests/executable application tests are created.

Check document structure, links, and requirement/diagram consistency, without application tests or model calls. Open decisions are in D-40. The [review report](review-report.md) summarizes coverage and verification limits.

## Future implementation roadmap

| Milestone | Target outcome | Future acceptance gate |
| --- | --- | --- |
| M1 — Foundation | DB/auth/CSRF/scope; users/teams/skills/calendar; manual tickets/tasks; audit | Verified session revocation/scope/state/estimates, migrations, persistence |
| M2 — Deterministic workflows | Plan versions/DAG, Published templates, default-deny policies, candidates/capacity, outbox/workers, approvals/idempotency | Structured input works end to end; two workers/retries do not duplicate effects/overbook; correct stale/lock behavior |
| M3 — AI automation | Schema adapter, request understanding, planning/ranking/tool actions, monitoring/replanning, onboarding/exceptions | Real model + real persisted actions/data in test DB; success/exception paths; bounded cost; safe injection/provider failures |
| M4 — Complete operations | SLA/notifications, assets/files, KB/RAG/assistant, dashboards/reports | 47 core AC/8 AC-AI and MET source/scope/KB permissions demonstrated; no simulated UI acceptance |
| M5 — Acceptance | Authorization/concurrency/model, E2 E/responsive/accessibility, backup/restore, CI/deploy/runbook/demo | A1–A13 + all relevant AC; README clean setup/upgrade/recovery and actual results |

M1 may prepare minimum SLA snapshots/inventory/KB data for M3; M4 completes these capabilities. Do not defer all AI to the end or drop core scope merely to achieve a demo.

## Validation plan — not run

### Entry, environment, and evidence

Application-testing entry requires a separate implementation request, a ready slice/code and test environment, relevant confirmed decisions, and synthetic DEMO data without real credentials/data. Use real PostgreSQL for PostgreSQL guarantees and a fake clock for SLA. Provider mocks exercise automated branches but do not replace real-model validation at A11.

Each future result needs commit/build/environment, fixtures, steps, expected/actual outcomes, redacted logs, test reports, and open defects. All groups below are **PLANNED / NOT RUN**. No actual pass rates, costs, or benchmarks exist.

| Validation group | Conditions and expected result | Future source / evidence |
| --- | --- | --- |
| Permissions/session/CSRF | Change users/teams/permissions; reuse old sessions; call APIs directly: correct denial, no count/file/chat leakage | NFR01/02/15/22, permissions; negative API report |
| States and SLA | Valid/invalid transitions, Pending/reopen/priority, fixed clock: no elapsed-time/breach reset | BR-04/08–10/15, TC-SLA01–12; state/clock report |
| Transactions/concurrency | Two workers assign the same task/resource; two users issue an asset: only valid effects, no overbooking | NFR03/19, AC-OPS04–07, BR-11/14/16; PostgreSQL integration report |
| Outbox/retry | Crash after commit before ack, duplicate/out-of-order events, broker failure: no lost events/duplicate effects; recovery scans | NFR21, TC-OPS, BR-19; DB facts + worker traces |
| Model/tools | Missing data/staff, invalid schema/cycles/injection/provider timeout: no fabricated sources or unauthorized writes | TC-AI01–18, TC-OPS01–12, A1–A11; model/output/action traces |
| Approvals/manual controls | Stale approval, policy revoked while model waits, in-progress/locked task: block or propose afresh | BR-17/18, NFR18/25; before/after and separate decision/execution |
| KB/RAG | ACL changes during indexing/model call; old-version citations: revoked sources reach neither provider nor rendered output | BR-21, NFR22, AC-OPS11; retrieval/ACL evidence |
| Usage/budget | Concurrent requests/retries/unknown timeout costs: conservative reservations and stop before cap | NFR23, D-39; sourced usage/billing ledger, estimates never labeled actual |
| UI/UX/a11 y | 320/390/768/1440, keyboard/zoom/reflow/reduced motion, form errors, user-switch cache | NFR07–09/16/26; Playwright/manual review and separate UX plan |
| Persistence/restore | Restart, isolated DB/file restore, outbound blocking, old-event replay: consistent data, no unintended effects | NFR04/21/24; recovery evidence and measured RPO/RTO |

### Methods by layer

- Backend: pytest/HTTPX; real PostgreSQL for transactions/locks/partial uniqueness/concurrency, not SQLite as proof of PostgreSQL guarantees.
- Frontend: Vitest/RTL for preserved forms, field errors, polling/cache/user switching; Playwright for requester → IT/task → acceptance and absence/approval.
- AI: fixed clear/missing-data/understaffed/cycle/sudden-absence/unauthorized/duplicate/stale/provider-failure/prompt-injection cases. Separate model failures from domain execution; suitable mocks do not replace A11.
- Core: retain 47 AC, 10 AC-X, 12 TC-SLA; support 8 AC-AI/18 TC-AI; coordination AC-OPS01–12 and A1–A13.
- Operations: clean setup, one migration run per release, restart persistence, outbox replay, isolated restore/data reconciliation; no RPO/RTO promises before agreement/measurement.
- UX/research: interviews/tree tests/usability/keyboard/responsive tests have not run. 37 SVGs (34 UI + 3 boards) illustrate 36 IDs, including all 7 OPS; not every state/breakpoint or assistive-technology test is covered.

## Conditions for implementation

### Plan structure and dependencies

The plan is **ROADMAP_DRAFT / implementation not activated**. M1–M5 goals are described, not execution instructions. Every epic below is **EPIC_PROPOSED**; no implementation tasks have been generated or started. The project owner is the product owner; delivery/verification owners must be assigned after a separate implementation request.

| Epic | Milestone | Scope / acceptance outcome | Dependencies |
| --- | --- | --- | --- |
| E01 | M1 | Identity/session/CSRF/authorization/administration and session revocation under NFR01/02/15 | M0 and slice-specific auth decisions |
| E02 | M1 | Workforce/skills/calendar/absence and DEMO data with provenance | E01, D-40 capacity/skill decisions |
| E03 | M1 | Manual tickets/tasks, states, persistence, audit | E01; E02 for capacity-aware assignment |
| E04 | M2 | Plan versions/DAG, Published templates, default-deny policies | E02/E03 |
| E05 | M2 | Outbox/idempotency/approvals/concurrency, manual locks, recovery | E04; refined BR-18/19 |
| E06 | M3 | Provider adapter, planning/ranking/tools/replanning with real model within D-39 | E05; access/billing/quota/pricing verified when execution is authorized |
| E07 | M3–M4 | Minimum KB sources for E06; full assistant/KB/RAG/ACL/citations in M4 | E01/E04; minimum source schema/ACL does not wait for all M4 |
| E08 | M4 | Complete SLA workers, notifications, files, assets | E03/E05; minimum data already available for E06 |
| E09 | M4 | Source-based dashboards/reports/usage under MET/permissions | E06/E07/E08 |
| E10 | M5 | Regression/E2 E/security/UX/restore and A1–A13 evidence | E01–E09; a successful demo does not replace all AC |

M3 depends on the **minimum-source delivery** of E07, not its full completion; partial product dependencies avoid M3 waiting for M4. Development epics are not execution Tasks inside the IT operations application.

### Exit and phase-transition conditions

The user must separately request implementation. Then refine slice-specific open decisions, resolve/pin dependencies and create actual lockfiles, review security and schema/API. Package metadata or current documentation is not proof of a validated dependency/runtime set.

D-39 records separately confirmed M3 DEMO settings. Calls require implementation authorization, safely configured keys, and billing/quota/model/pricing verification. No model results or actual API costs exist.
