---
id: itoh-implementation-02-workflows
title: "M2 — Deterministic workflows"
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

# M2 — Deterministic workflows

M2 groups establish deterministic plans, capacity, policy, approval and durable execution before model proposals. A draft, accepted job or approval is not a completed domain effect.

These are group/epic summaries. Each heading names the group goal. Implementation context, file boundaries, detailed checks and handoff evidence live in the linked task files. The [task workflow](workflow/task-workflow.md) defines the shared completion rule: every child and group criterion must pass, including any external integration closure. [Execution board](workflow/execution-board.md) owns task status/owner; [package registry](README.md#4-task-tracker) owns epic state. Application evidence remains **NOT RUN**.

<a id="wf-01"></a>

## WF-01 — Validate and activate versioned plan DAGs

**Scope:** Sourced plan DAG validation, atomic version activation and current predecessor guards.

**Trace:** US-OPS04; AC-OPS04, AC-OPS06; A2.

**Completion criteria**

1. Validate same-version dependencies, known references, no self-edge/cycle and verified effort/source data.
2. Activate only one Effective version atomically while preserving older versions and active/locked tasks.
3. Recheck predecessors before task start; Cancelled predecessor is not Done; stale/invalid activation creates no partial tasks.

**Child tasks:** [WF-01.01](tasks/WF-01.01.md), [WF-01.02](tasks/WF-01.02.md), [WF-01.03](tasks/WF-01.03.md).

**Handoff:** Verified outputs feed [WF-02](02-workflows.md#wf-02), [WF-04](02-workflows.md#wf-04), [OPS-13](04-operations-assistant.md#ops-13) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-03](07-integration.md#int-03). [Criterion owners and closure](package-task-coverage.md#wf-01).

<a id="wf-02"></a>

## WF-02 — Publish verified workflow templates

**Scope:** Verified workflow drafts and immutable published template versions.

**Trace:** US-OPS02 (templates); AC-OPS02, AC-OPS04.

**Completion criteria**

1. M/A creates Draft versions and publishes valid sourced DAGs with verified effort.
2. Published versions are immutable; changes create a new version and retain source/author evidence.
3. T sees execution-required versions only; unsupported/unknown estimates cannot authorize assignment.

**Child tasks:** [WF-02.01](tasks/WF-02.01.md), [WF-02.02](tasks/WF-02.02.md).

**Handoff:** Verified outputs feed [WF-03](02-workflows.md#wf-03), [AI-04](03-ai-automation.md#ai-04) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-03](07-integration.md#int-03). [Criterion owners and closure](package-task-coverage.md#wf-02).

<a id="wf-03"></a>

## WF-03 — Manage default-deny policies and grants

**Scope:** Bounded service policies/grants, live default-deny evaluation and availability projections.

**Trace:** US-OPS02 (policies); AC-OPS02, AC-OPS09.

**Completion criteria**

1. Bound grants to workflow/team/priority/action/limits/grantor/expiry/version with no self-grants or public service login.
2. Every policy command checks current grantor authority; disabled/expired/missing policy allows no service effect.
3. UI distinguishes template publication, policy enablement and assistant availability.

**Child tasks:** [WF-03.01](tasks/WF-03.01.md), [WF-03.02](tasks/WF-03.02.md), [WF-03.03](tasks/WF-03.03.md).

**Handoff:** Verified outputs feed [WF-06](02-workflows.md#wf-06) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-03](07-integration.md#int-03). [Criterion owners and closure](package-task-coverage.md#wf-03).

<a id="wf-04"></a>

## WF-04 — Filter candidates and atomically allocate capacity

**Scope:** Eligible candidates, period feasibility and competing atomic allocations.

**Trace:** US-OPS05; AC-OPS05; A3, A5.

**Completion criteria**

1. Filter current authority/team/verified skills/availability before ranking; account work requires an authorized Admin.
2. Allocate explicit periods/slots totaling remaining effort; include Blocked load, unknown/unallocated risk and DAG/deadline constraints.
3. Concurrent assignment/schedule edits use consistent locks/versions; insufficient capacity becomes a reasoned exception, not overbooking.

**Child tasks:** [WF-04.01](tasks/WF-04.01.md), [WF-04.02](tasks/WF-04.02.md), [WF-04.03](tasks/WF-04.03.md).

**Handoff:** Verified outputs feed [WF-06](02-workflows.md#wf-06), [AI-06](03-ai-automation.md#ai-06) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#wf-04).

<a id="wf-05"></a>

## WF-05 — Deliver durable outbox through Linux workers

**Scope:** Linux worker queues, durable outbox delivery and bounded outage recovery.

**Trace:** US-OPS10 (delivery); AC-OPS10; NFR21.

**Completion criteria**

1. Run Linux Celery with separate queues and one Beat; claim/lease/ack durable outbox with bounded retries/dead-letter.
2. Crash after commit/before ack or broker outage does not lose events or duplicate consumer effects.
3. Expose minimal health and delivery lag; provider/broker failures do not pretend core DB operations failed after commit.

**Child tasks:** [WF-05.01](tasks/WF-05.01.md), [WF-05.02](tasks/WF-05.02.md), [WF-05.03](tasks/WF-05.03.md).

**Handoff:** Verified outputs feed [WF-08](02-workflows.md#wf-08), [OPS-03](04-operations-assistant.md#ops-03), [OPS-04](04-operations-assistant.md#ops-04), [OPS-07](04-operations-assistant.md#ops-07) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#wf-05).

<a id="wf-06"></a>

## WF-06 — Implement exception proposals and approval decisions

**Scope:** Sourced exception snapshots and authorized current approval decisions.

**Trace:** US-OPS08; AC-OPS08; A6.

**Completion criteria**

1. Persist before/after/reason/impact/sources and ticket/plan/task/policy/workforce snapshots.
2. Authorized M/A approves/rejects current proposals; stale/expired/revoked decisions conflict and require re-evaluation.
3. Decision status and execution status are separate; approval never grants overbooking or unrestricted Admin authority.

**Child tasks:** [WF-06.01](tasks/WF-06.01.md), [WF-06.02](tasks/WF-06.02.md).

**Handoff:** Verified outputs feed [WF-07](02-workflows.md#wf-07), [OPS-14](04-operations-assistant.md#ops-14) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-03](07-integration.md#int-03). [Criterion owners and closure](package-task-coverage.md#wf-06).

<a id="wf-07"></a>

## WF-07 — Respect manual locks, overrides and disable

**Scope:** Manual assignment locks/overrides, live disable and valid compensation.

**Trace:** US-OPS09; AC-OPS09; NFR25.

**Completion criteria**

1. M/A reasoned locks/overrides are versioned/audited and checked before every automated effect.
2. In-progress/locked changes use the authorized exception path; ordinary assignment never silently unlocks.
3. Disabling policy blocks pending effects; undo uses valid compensation without deleting history or regressing Done.

**Child tasks:** [WF-07.01](tasks/WF-07.01.md), [WF-07.02](tasks/WF-07.02.md).

**Handoff:** Verified outputs feed [WF-08](02-workflows.md#wf-08), [OPS-14](04-operations-assistant.md#ops-14) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-03](07-integration.md#int-03). [Criterion owners and closure](package-task-coverage.md#wf-07).

<a id="wf-08"></a>

## WF-08 — Execute idempotent service commands from deterministic proposals

**Scope:** Snapshot revalidation, idempotent effect commits and bounded failure handling.

**Trace:** US-OPS05, US-OPS08, US-OPS10; AC-OPS05, AC-OPS08–10.

**Completion criteria**

1. Separate snapshot preparation from execution; re-read rights/policy/versions/capacity in the new effect transaction.
2. Domain changes, allocation, action outcome, audit and outbox commit together; repeat intent returns saved outcome.
3. Rights/stale/infeasible failures re-evaluate or escalate; transient failures retry within limits; no direct policy-bypassing ORM writes.

**Child tasks:** [WF-08.01](tasks/WF-08.01.md), [WF-08.02](tasks/WF-08.02.md), [WF-08.03](tasks/WF-08.03.md).

**Handoff:** Verified outputs feed [WF-09](02-workflows.md#wf-09), [WF-10](02-workflows.md#wf-10), [AI-05](03-ai-automation.md#ai-05) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#wf-08).

<a id="wf-09"></a>

## WF-09 — Evaluate affected work after operational changes

**Scope:** Affected-work selection and policy-limited deterministic re-evaluation.

**Trace:** US-OPS07; AC-OPS07; A4.

**Completion criteria**

1. Availability/skills/membership/progress/load/risk events select affected tasks rather than unrelated work.
2. Deterministic re-evaluation respects policy and unstarted-task limits; locked/in-progress/commitment changes produce exceptions.
3. Duplicate/out-of-order events cannot undo newer state or extend SLA; reminders obey recipient/rate limits.

**Child tasks:** [WF-09.01](tasks/WF-09.01.md), [WF-09.02](tasks/WF-09.02.md).

**Handoff:** Verified outputs feed [AI-07](03-ai-automation.md#ai-07) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#wf-09).

<a id="wf-10"></a>

## WF-10 — Expose run traces and controlled recovery

**Scope:** Scoped run/action provenance and audited recovery commands.

**Trace:** US-OPS10; AC-OPS10, AC-OPS12; A7.

**Completion criteria**

1. Show scoped/redacted event/run/policy/grantor/source/version/action/result/error provenance.
2. Authorized retry preserves successful-intent dedup and distinguishes retryable failure from required new evaluation.
3. UI shows committed/current/future progress, no-approval and exception paths; approved/queued is never success.

**Child tasks:** [WF-10.01](tasks/WF-10.01.md), [WF-10.02](tasks/WF-10.02.md).

**Handoff:** Verified outputs feed [INT-03](07-integration.md#int-03), [AI-07](03-ai-automation.md#ai-07), [OPS-15](04-operations-assistant.md#ops-15), [OPS-18](04-operations-assistant.md#ops-18), [QA-01](05-acceptance.md#qa-01) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-03](07-integration.md#int-03). [Criterion owners and closure](package-task-coverage.md#wf-10).
