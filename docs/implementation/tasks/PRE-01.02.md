---
id: itoh-task-pre-01-02
title: "PRE-01.02 — Review foundation DTO and physical schema contracts"
type: planning
domain: development
module: delivery
tags: [tasks, planning, implementation]
priority: 1
status: planned
owner: PO
approval: needs-review
updated: 2026-11-09
authority: derived
purpose: "Define one bounded deliverable with explicit context, dependencies, ownership and verification."
---

# PRE-01.02 — Review foundation DTO and physical schema contracts

## 1. Identity and objective

- **Parent:** [PRE-01](../00-decisions.md#pre-01); Phase B, decisions/real services.
- **Module:** decisions.
- **Owner:** PO. **Status:** [execution board](../workflow/execution-board.md); the board is the single mutable registry.
- **Objective:** Reconcile draft API projections/fields/nullability with logical/physical identity/ticket schema, uniqueness, optimistic version and audit/outbox/idempotency contracts.
- **Trace:** NFR01, NFR03, NFR14, NFR15; D-29–32, D-40. (the subset mapped below).
- **Direct task prerequisites:** [PRE-01.01](PRE-01.01.md)
- **Mapped parent acceptance:** PRE-01 criterion 2; PRE-01 criterion 3. Parent completion requires the separate coverage and closure rules, not this task alone.
- **Rules:** [task workflow](../workflow/task-workflow.md).

## 2. Scope and expected outputs

**Included:** Reconcile draft API projections/fields/nullability with logical/physical identity/ticket schema, uniqueness, optimistic version and audit/outbox/idempotency contracts.

**Planned output boundaries**

- docs/decisions/design-decisions.md: only the selected decision set.
- Affected reviewed API/schema/architecture paragraphs and task evidence; no application code.

**Excluded and phase boundary:** Only the named decision/contract refinement is included. Do not create application code or invent product-owner approval.

Planned module paths are ownership hints, not assertions that files exist. Use the actual established package names and reuse predecessor interfaces; do not create empty scaffolds for these hints. Keep only the part of a listed module needed for this deliverable.

## 3. Embedded context package

| Existing source | Read only these sections / purpose | Authority |
| --- | --- | --- |
| [Parent acceptance](../00-decisions.md#pre-01) | Criteria 2, 3 and the named objective; parent overview supplies the wider completion target | Planning |
| [decisions/design-decisions.md](../../decisions/design-decisions.md) | D-40 choices affecting this deliverable and confirmed D-29–43 within their limits | Requirement / contract / design |
| [technical/tech-stack.md](../../technical/tech-stack.md) | Only the named objective, trace IDs and selected parent rules | Requirement / contract / design |
| [technical/api-design.md](../../technical/api-design.md) | Named module operations, shared errors/version/idempotency and asynchronous outcome contract | Requirement / contract / design |
| [requirements/conceptual-data-model.md](../../requirements/conceptual-data-model.md) | Named module entities, lifecycle, ownership and reviewed constraints | Requirement / contract / design |
| [Dependency evidence](../workflow/execution-board.md) | Read only the named direct prerequisites' outputs/interfaces/results; their cards are linked above | Execution evidence; currently NOT RUN |
| [Parent coverage and closure](../package-task-coverage.md#pre-01) | Leaf ownership of criteria and any external frontend/integration closure | Derived planning |

Read source rules using the parent trace and the objective, not all milestone files. Use CodeGraph first for existing indexed code around `decisions Review foundation DTO and physical schema contracts`. Validate current source/context at start; planned output paths are not required inputs until their producing task is done.

## 4. Preconditions

A future request authorizes the selected implementation (or this decision-refinement work), the parent is activated, one executor is assigned, named leaf dependencies are done and source context is current. Resolve the affected D-40 decision/access before its consumer; do not invent enterprise policy. Task availability does not grant provider calls, data access or deployment beyond existing authorization.

## 5. Acceptance and verification

| Observable acceptance | Required verification / expected result |
| --- | --- |
| Reconcile draft API projections/fields/nullability with logical/physical identity/ticket schema, uniqueness, optimistic version and audit/outbox/idempotency contracts. | Review invalid/forged/stale requests and transaction failure examples; list remaining decision blockers by leaf task. |
| Relevant selected parent rules are preserved within this deliverable; unowned outcomes remain assigned to other leaves/closure owners. | Compare actual output and failures to criteria 2, 3 in the parent and [coverage](../package-task-coverage.md#pre-01); no unrelated or partially completed predecessor is assumed. |
| This phase's source/transport boundary and failure semantics are enforced, with no false completion or sensitive output. | Perform source/decision consistency checks; application tests are not applicable. Record pass/fail/not-run and verify the phase exclusions above. |

**Checks to execute:** Review invalid/forged/stale requests and transaction failure examples; list remaining decision blockers by leaf task. Use commands established by the relevant foundation task: frontend scripts in src/frontend, backend uv/check/test scripts in src/backend, or the actual documented evidence harness. Record exact commands at execution; no command/test pass is claimed in planning.

**Completion evidence:** observable result, affected source/test paths, actual check outcomes, review findings, remaining decisions and next eligible task. A service leaf may be DONE independently of later UI wiring; package-level UI acceptance is closed only by its named INT/FE owners.

## 6. Evidence and handoff

- Latest Report ID: PRE-01.02/attempt-02.
- Latest history entry: [Format version 1](../workflow/task-history.md#task-pre-01-02-attempt-02).
- Delivered result: [foundation contract reconciliation](../../technical/api-design.md#pre-0102-foundation-contract-reconciliation) compares OpenAPI, conceptual rules and DBML, with consumers and explicit unresolved policy.
- Acceptance and check summary: source consistency and five failure walkthroughs passed for the documentation scope. Service/build tests were not run.
- Review type: PO confirmed joint acceptance. Original agent checks remain in attempt 01.
- Commit/build: scoped documentation delivery on phase/b-backend. No application build.
- Next eligible step: FND-01.01 after verified Parent merge and separate authorization. Operational policy candidates remain open for their consumers.
