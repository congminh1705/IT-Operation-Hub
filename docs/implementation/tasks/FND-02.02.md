---
id: itoh-task-fnd-02-02
title: "FND-02.02 — Implement atomic unit of work, audit and outbox writers"
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

# FND-02.02 — Implement atomic unit of work, audit and outbox writers

## 1. Identity and objective

- **Parent:** [FND-02](../01-foundation.md#fnd-02); Phase B, decisions/real services.
- **Module:** database-events.
- **Owner:** PO. **Status:** [execution board](../workflow/execution-board.md); the board is the single mutable registry.
- **Objective:** Commit domain/audit/outbox through one UoW with no publish-before-commit or nested autonomous commits.
- **Trace:** AC-X08, AC-X09; NFR03, NFR13, NFR21. (the subset mapped below).
- **Direct task prerequisites:** [FND-02.01](FND-02.01.md)
- **Mapped parent acceptance:** FND-02 criterion 2. Parent completion requires the separate coverage and closure rules, not this task alone.
- **Rules:** [task workflow](../workflow/task-workflow.md).

## 2. Scope and expected outputs

**Included:** Commit domain/audit/outbox through one UoW with no publish-before-commit or nested autonomous commits.

**Planned output boundaries**

- src/backend/app/infrastructure/database and events; audit writer contracts.
- src/backend/migrations plus meaningful PostgreSQL transaction/version tests.

**Excluded and phase boundary:** Implement only the named real-service/contract capability and its essential checks. Existing UI is reused; real browser wiring belongs to INT tasks. Do not perform unrelated domain work or production deployment.

Planned module paths are ownership hints, not assertions that files exist. Use the actual established package names and reuse predecessor interfaces; do not create empty scaffolds for these hints. Keep only the part of a listed module needed for this deliverable.

## 3. Embedded context package

| Existing source | Read only these sections / purpose | Authority |
| --- | --- | --- |
| [Parent acceptance](../01-foundation.md#fnd-02) | Criteria 2 and the named objective; parent overview supplies the wider completion target | Planning |
| [technical/architecture.md](../../technical/architecture.md) | Transactions, model boundary, events or recovery sections actually used by this deliverable | Requirement / contract / design |
| [requirements/conceptual-data-model.md](../../requirements/conceptual-data-model.md) | Named module entities, lifecycle, ownership and reviewed constraints | Requirement / contract / design |
| [technical/api-design.md](../../technical/api-design.md) | Named module operations, shared errors/version/idempotency and asynchronous outcome contract | Requirement / contract / design |
| [Dependency evidence](../workflow/execution-board.md) | Read only the named direct prerequisites' outputs/interfaces/results; their cards are linked above | Execution evidence; currently NOT RUN |
| [Parent coverage and closure](../package-task-coverage.md#fnd-02) | Leaf ownership of criteria and any external frontend/integration closure | Derived planning |

Read source rules using the parent trace and the objective, not all milestone files. Use CodeGraph first for existing indexed code around `database-events Implement atomic unit of work, audit and outbox writers`. Validate current source/context at start; planned output paths are not required inputs until their producing task is done.

## 4. Preconditions

A future request authorizes the selected implementation (or this decision-refinement work), the parent is activated, one executor is assigned, named leaf dependencies are done and source context is current. Resolve the affected D-40 decision/access before its consumer; do not invent enterprise policy. Task availability does not grant provider calls, data access or deployment beyond existing authorization.

## 5. Acceptance and verification

| Observable acceptance | Required verification / expected result |
| --- | --- |
| Commit domain/audit/outbox through one UoW with no publish-before-commit or nested autonomous commits. | Inject failure before commit and assert rollback of all required facts; verify audit redaction. |
| Relevant selected parent rules are preserved within this deliverable; unowned outcomes remain assigned to other leaves/closure owners. | Compare actual output and failures to criteria 2 in the parent and [coverage](../package-task-coverage.md#fnd-02); no unrelated or partially completed predecessor is assumed. |
| This phase's source/transport boundary and failure semantics are enforced, with no false completion or sensitive output. | Use actual domain/API checks; real PostgreSQL is required for DB guarantees and fake clock for SLA. Provider mocks cover controlled branches, not A11. Record pass/fail/not-run and verify the phase exclusions above. |

**Checks to execute:** Inject failure before commit and assert rollback of all required facts; verify audit redaction. Use commands established by the relevant foundation task: frontend scripts in src/frontend, backend uv/check/test scripts in src/backend, or the actual documented evidence harness. Record exact commands at execution; no command/test pass is claimed in planning.

**Completion evidence:** observable result, affected source/test paths, actual check outcomes, review findings, remaining decisions and next eligible task. A service leaf may be DONE independently of later UI wiring; package-level UI acceptance is closed only by its named INT/FE owners.

## 6. Evidence and handoff

- Latest Report ID: FND-02.02/attempt-01.
- Latest history entry: [Format version 1](../workflow/task-history.md#task-fnd-02-02-attempt-01).
- Delivered result: Added write_audit and enqueue_event on the caller-owned Session. Typed SafeFacts limits JSON metadata; one event can stage one delivery per handler without a broker call.
- Actual changed paths: src/backend/app/infrastructure/events.py and src/backend/tests/test_uow.py
- Verification: Ruff, strict mypy and six pytest cases passed. Two PostgreSQL UoW cases verified invisibility before commit, atomic rollback on an injected post-flush failure, redaction and consistent event/delivery correlation.
- Review: agent verification complete. Joint PO acceptance pending.
- Commit/build: 7e42f11 on phase/b-backend. Push verified on origin.
- Next step: FND-02.03 follows verified atomic writes under joint Parent review.
