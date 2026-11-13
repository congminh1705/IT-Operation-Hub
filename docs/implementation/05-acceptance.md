---
id: itoh-implementation-05-acceptance
title: "M5 — Acceptance and operational handover"
type: planning
domain: development
module: delivery
tags: [implementation, backlog, traceability]
priority: 1
status: planned
owner: PO
approval: needs-review
updated: 2026-11-09
authority: derived
purpose: "Summarize group scope, completion criteria, child tasks and handoff."
---

# M5 — Acceptance and operational handover

Phase D/M5 groups collect actual integrated quality, acceptance and recovery evidence after the named integration outputs. Failed/unavailable checks remain open; designs or mock success do not establish application acceptance.

These are group/epic summaries. Each heading names the group goal. Implementation context, file boundaries, detailed checks and handoff evidence live in the linked task files. The [task workflow](workflow/task-workflow.md) defines the shared completion rule: every child and group criterion must pass, including any external integration closure. [Execution board](workflow/execution-board.md) owns task status/owner; [package registry](README.md#4-task-tracker) owns epic state. Application evidence remains **NOT RUN**.

<a id="qa-01"></a>

## QA-01 — Complete CI, contracts and reproducible release checks

**Scope:** Clean full-stack CI/contracts and migration/release compatibility evidence.

**Trace:** NFR14, NFR17; A13 (build).

**Completion criteria**

1. Frozen dependencies, lint/type/build, meaningful unit/integration/browser suites run on clean environment.
2. Export runtime OpenAPI and verify reviewed contract/generated TypeScript drift, including all implemented operations/projections.
3. Validate empty/upgrade migrations and frontend/API/worker compatibility; persist artifact/version/command evidence.

**Child tasks:** [QA-01.01](tasks/QA-01.01.md), [QA-01.02](tasks/QA-01.02.md).

**Handoff:** Verified outputs feed [QA-02](05-acceptance.md#qa-02), [QA-03](05-acceptance.md#qa-03) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#qa-01).

<a id="qa-02"></a>

## QA-02 — Verify integrated authorization and failure recovery

**Scope:** Integrated access, concurrency/outage and manual-core continuity evidence.

**Trace:** AC-X01–03, AC-X06, AC-X08–10; NFR01–06, NFR18–25; A5–A10.

**Completion criteria**

1. Direct API cross-role/team/ID/session/CSRF tests cover counts/files/notes/chats/KB/history/actions, including revocation mid-call.
2. Inject two-worker races, stale approvals, broker loss, postcommit crash, invalid model output and provider outage; no duplicate effects/overbooking/partial commits.
3. Core forms/SLA/manual work remain usable during AI failure; record defects with reproducible evidence.

**Child tasks:** [QA-02.01](tasks/QA-02.01.md), [QA-02.02](tasks/QA-02.02.md), [QA-02.03](tasks/QA-02.03.md).

**Handoff:** Verified outputs feed [QA-04](05-acceptance.md#qa-04) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#qa-02).

<a id="qa-03"></a>

## QA-03 — Verify responsive accessibility and measured performance

**Scope:** Responsive accessibility, resilient interaction and measured performance evidence.

**Trace:** AC-X02–07, AC-X10; NFR07–12, NFR16, NFR26.

**Completion criteria**

1. Exercise main role flows at 320/390/768/1440, 200% zoom, keyboard/focus/reduced motion; board/DAG alternatives preserve tasks.
2. Check login states, safe drafts/conflicts, active-tab polling/cache switch and workspace no-approval behavior.
3. Measure agreed environment/data/load and p95/scan lag, separate provisional targets from actual results; no static-image accessibility claim.

**Child tasks:** [QA-03.01](tasks/QA-03.01.md), [QA-03.02](tasks/QA-03.02.md), [QA-03.03](tasks/QA-03.03.md).

**Handoff:** Verified outputs feed [QA-04](05-acceptance.md#qa-04) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#qa-03).

<a id="qa-04"></a>

## QA-04 — Run complete MVP journeys and real-model acceptance

**Scope:** Complete native/live-model journeys and reconciled MVP acceptance results.

**Trace:** AC01–47, AC-X01–10, AC-OPS01–12, AC-AI01–08; A1–A12.

**Completion criteria**

1. Run requester→IT→requester acceptance, D-29 account request/provisioning, assets, workforce/absence/approval, KB and confirmed assistant actions.
2. Cover TC-OPS01–12/TC-AI01–18 including actual RAG/assistant behavior and persisted real-model effects; reuse valid AI-08 evidence without unnecessary paid reruns.
3. Record every AC/gate as pass/fail/not-run with commit/environment/evidence; keep D-39 aggregate budget across milestones and report unavailable live validation instead of claiming A11.

**Child tasks:** [QA-04.01](tasks/QA-04.01.md), [QA-04.02](tasks/QA-04.02.md), [QA-04.03](tasks/QA-04.03.md).

**Handoff:** Verified outputs feed [QA-05](05-acceptance.md#qa-05) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#qa-04).

<a id="qa-05"></a>

## QA-05 — Rehearse release, backup/restore and finish handover

**Scope:** Controlled release, isolated restore rehearsal and operations handover.

**Trace:** A13; AC-X08, AC-X09; NFR04, NFR21, NFR24.

**Completion criteria**

1. Document clean setup, authorized bootstrap, one migration runner, controlled startup/health and policy pause/resume on target-like isolated environment.
2. Restore PostgreSQL/private files consistently with workers/egress blocked; verify references, SLA snapshots, outbox/dedup and usage so successful actions are not replayed.
3. Record measured RPO/RTO versus agreed targets, release/recovery owners and remaining production decisions; final handover includes actual results, not a deployment claim.

**Child tasks:** [QA-05.01](tasks/QA-05.01.md), [QA-05.02](tasks/QA-05.02.md), [QA-05.03](tasks/QA-05.03.md).

**Handoff:** Deliver measured release/recovery evidence and runbooks to the project owner. Keep unresolved production decisions visible; deployment requires its own authorization. [Criterion owners and closure](package-task-coverage.md#qa-05).
