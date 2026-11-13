---
id: itoh-implementation-00-decisions
title: "Slice-specific decisions"
type: planning
domain: development
module: delivery
tags: [implementation, backlog, traceability]
priority: 1
status: planned
owner: PO
approval: needs-review
updated: 2026-11-11
authority: derived
purpose: "Summarize group scope, completion criteria, child tasks and handoff."
---

# Slice-specific decisions

Phase B decision groups produce reviewed choices/contracts for their consumers. Open enterprise values remain explicit; a decision group does not grant production access or create application code.

These are group/epic summaries. Each heading names the group goal. Implementation context, file boundaries, detailed checks and handoff evidence live in the linked task files. The [task workflow](workflow/task-workflow.md) defines the shared completion rule: every child and group criterion must pass, including any external integration closure. [Execution board](workflow/execution-board.md) owns task status/owner; [package registry](README.md#4-task-tracker) owns epic state. Application evidence remains **NOT RUN**.

<a id="pre-01"></a>

## PRE-01 — Review foundation contracts and identity decisions

**Scope:** Bootstrap/session/password decisions and reviewed foundation DTO/schema invariants.

**Trace:** NFR01, NFR03, NFR14, NFR15; D-29–32, D-40.

**Completion criteria**

1. Document bootstrap, password/reset policy, session lifetime/rotation, cookie/CSRF names, rate limits, and emergency revocation/handover behavior with explicit unresolved items.
2. Review foundation DTOs, public/internal projections, nullability, uniqueness, optimistic versions, domain/audit/outbox transaction boundaries and ticket idempotency; reconcile API/DBML discrepancies.
3. Record approved versus proposed values and the affected task IDs; no invented enterprise approval. FND-01 may start only with the foundation choices needed for its scaffold; affected domain tasks require their remaining decisions.

**Child tasks:** [PRE-01.01](tasks/PRE-01.01.md), [PRE-01.02](tasks/PRE-01.02.md).

**Handoff:** Verified outputs feed [FND-01](01-foundation.md#fnd-01) through the exact leaf dependencies. Proposed/unresolved values do not count as confirmed decisions. [Criterion owners and closure](package-task-coverage.md#pre-01).

<a id="pre-02"></a>

## PRE-02 — Define workforce and workflow concurrency contracts

**Scope:** Verified workforce inputs, period capacity, concurrency and bounded automation contracts.

**Trace:** AC-OPS01, AC-OPS02, AC-OPS05, AC-OPS08–10; D-40.

**Completion criteria**

1. Specify periods/slots, calendar timezone, daily budgets, skill verifiers and manager-verified effort/template sources; DEMO values are labeled.
2. Specify fixed lock order/isolation, allocation uniqueness, event/run/action intent keys, lease/retry limits, approval expiry and bounded exception grants.
3. Record policy scope/adjustment/reminder limits and missing-data behavior; preserve default deny and no overbooking.

**Child tasks:** [PRE-02.01](tasks/PRE-02.01.md), [PRE-02.02](tasks/PRE-02.02.md), [PRE-02.03](tasks/PRE-02.03.md).

**Handoff:** Verified outputs feed [FND-14](01-foundation.md#fnd-14), [FND-15](01-foundation.md#fnd-15), [FND-16](01-foundation.md#fnd-16), [WF-02](02-workflows.md#wf-02), [WF-04](02-workflows.md#wf-04), [WF-05](02-workflows.md#wf-05) through the exact leaf dependencies. Proposed/unresolved values do not count as confirmed decisions. [Criterion owners and closure](package-task-coverage.md#pre-02).

<a id="pre-03"></a>

## PRE-03 — Define minimum AI, knowledge and inventory data contracts

**Scope:** Knowledge rights/index contracts, assistant confirmation/retention/budgets and inventory reservation decisions.

**Trace:** AC-OPS03, AC-OPS11; AC-AI03, AC-AI07, AC-AI08; NFR22–24; D-39/40/42.

**Completion criteria**

1. Record KB author/publisher/ACL rights, versioning, embedding dimensions/chunking and index freshness choices; no role gets implicit all-content access.
2. Define chat/run retention and redaction, confirmation digest/TTL, trusted intent/form registry, shared budget reservations and mode sublimits.
3. Decide whether inventory reservations are used; if so define TTL/release/owner/issue distinction and cross-plan constraints. Preserve D-48 DEMO-only Gemini free-tier policy (USD 0 paid spend); production decisions remain separate.

**Child tasks:** [PRE-03.01](tasks/PRE-03.01.md), [PRE-03.02](tasks/PRE-03.02.md), [PRE-03.03](tasks/PRE-03.03.md).

**Handoff:** Verified outputs feed [AI-01](03-ai-automation.md#ai-01), [AI-02](03-ai-automation.md#ai-02), [AI-03](03-ai-automation.md#ai-03), [OPS-08](04-operations-assistant.md#ops-08) through the exact leaf dependencies. Proposed/unresolved values do not count as confirmed decisions. [Criterion owners and closure](package-task-coverage.md#pre-03).

<a id="pre-04"></a>

## PRE-04 — Define deployment and recovery targets

**Scope:** Deployment ownership, operational targets and controlled release/recovery sequence.

**Trace:** NFR04, NFR11, NFR12, NFR21, NFR24; A13; D-40.

**Completion criteria**

1. Identify target environment, operations owner, backup access/encryption/retention and proposed RPO/RTO with measurement method.
2. Define release/migration/recovery sequence, alert ownership and measurable environment-specific performance/queue targets.
3. Distinguish local rehearsal from production deployment and production provider/data/budget decisions.

**Child tasks:** [PRE-04.01](tasks/PRE-04.01.md), [PRE-04.02](tasks/PRE-04.02.md).

**Handoff:** Verified outputs feed [QA-05](05-acceptance.md#qa-05) through the exact leaf dependencies. Proposed/unresolved values do not count as confirmed decisions. [Criterion owners and closure](package-task-coverage.md#pre-04).
