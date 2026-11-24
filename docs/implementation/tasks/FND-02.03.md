---
id: itoh-task-fnd-02-03
title: "FND-02.03 — Implement expected-version and command idempotency primitives"
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

# FND-02.03 — Implement expected-version and command idempotency primitives

## 1. Identity and objective

- **Parent:** [FND-02](../01-foundation.md#fnd-02); Phase B, decisions/real services.
- **Module:** database-events.
- **Owner:** PO. **Status:** [execution board](../workflow/execution-board.md); the board is the single mutable registry.
- **Objective:** Persist reviewed command key/actor/digest/result and version checks with safe IDs and deterministic conflict semantics.
- **Trace:** AC-X08, AC-X09; NFR03, NFR13, NFR21. (the subset mapped below).
- **Direct task prerequisites:** [FND-02.02](FND-02.02.md)
- **Mapped parent acceptance:** FND-02 criterion 3. Parent completion requires the separate coverage and closure rules, not this task alone.
- **Rules:** [task workflow](../workflow/task-workflow.md).

## 2. Scope and expected outputs

**Included:** Persist reviewed command key/actor/digest/result and version checks with safe IDs and deterministic conflict semantics.

**Planned output boundaries**

- src/backend/app/infrastructure/database and events; audit writer contracts.
- src/backend/migrations plus meaningful PostgreSQL transaction/version tests.

**Excluded and phase boundary:** Implement only the named real-service/contract capability and its essential checks. Existing UI is reused; real browser wiring belongs to INT tasks. Do not perform unrelated domain work or production deployment.

Planned module paths are ownership hints, not assertions that files exist. Use the actual established package names and reuse predecessor interfaces; do not create empty scaffolds for these hints. Keep only the part of a listed module needed for this deliverable.

## 3. Embedded context package

| Existing source | Read only these sections / purpose | Authority |
| --- | --- | --- |
| [Parent acceptance](../01-foundation.md#fnd-02) | Criteria 3 and the named objective; parent overview supplies the wider completion target | Planning |
| [technical/architecture.md](../../technical/architecture.md) | Transactions, model boundary, events or recovery sections actually used by this deliverable | Requirement / contract / design |
| [requirements/conceptual-data-model.md](../../requirements/conceptual-data-model.md) | Named module entities, lifecycle, ownership and reviewed constraints | Requirement / contract / design |
| [technical/api-design.md](../../technical/api-design.md) | Named module operations, shared errors/version/idempotency and asynchronous outcome contract | Requirement / contract / design |
| [Dependency evidence](../workflow/execution-board.md) | Read only the named direct prerequisites' outputs/interfaces/results; their cards are linked above | Execution evidence; currently NOT RUN |
| [Parent coverage and closure](../package-task-coverage.md#fnd-02) | Leaf ownership of criteria and any external frontend/integration closure | Derived planning |

Read source rules using the parent trace and the objective, not all milestone files. Use CodeGraph first for existing indexed code around `database-events Implement expected-version and command idempotency primitives`. Validate current source/context at start; planned output paths are not required inputs until their producing task is done.

## 4. Preconditions

A future request authorizes the selected implementation (or this decision-refinement work), the parent is activated, one executor is assigned, named leaf dependencies are done and source context is current. Resolve the affected D-40 decision/access before its consumer; do not invent enterprise policy. Task availability does not grant provider calls, data access or deployment beyond existing authorization.

## 5. Acceptance and verification

| Observable acceptance | Required verification / expected result |
| --- | --- |
| Persist reviewed command key/actor/digest/result and version checks with safe IDs and deterministic conflict semantics. | Test two concurrent versions, same key/same body and same key/different body on PostgreSQL. |
| Relevant selected parent rules are preserved within this deliverable; unowned outcomes remain assigned to other leaves/closure owners. | Compare actual output and failures to criteria 3 in the parent and [coverage](../package-task-coverage.md#fnd-02); no unrelated or partially completed predecessor is assumed. |
| This phase's source/transport boundary and failure semantics are enforced, with no false completion or sensitive output. | Use actual domain/API checks; real PostgreSQL is required for DB guarantees and fake clock for SLA. Provider mocks cover controlled branches, not A11. Record pass/fail/not-run and verify the phase exclusions above. |

**Checks to execute:** Test two concurrent versions, same key/same body and same key/different body on PostgreSQL. Use commands established by the relevant foundation task: frontend scripts in src/frontend, backend uv/check/test scripts in src/backend, or the actual documented evidence harness. Record exact commands at execution; no command/test pass is claimed in planning.

**Completion evidence:** observable result, affected source/test paths, actual check outcomes, review findings, remaining decisions and next eligible task. A service leaf may be DONE independently of later UI wiring; package-level UI acceptance is closed only by its named INT/FE owners.

## 6. Evidence and handoff

- Latest Report ID: FND-02.03/attempt-02.
- Latest history entry: [Format version 1](../workflow/task-history.md#task-fnd-02-03-attempt-02).
- Delivered result: Added conditional version update, revision 0002_confirmed_command, and a PostgreSQL command ledger keyed by actor, operation and key. Same input replays the result after current authorization. Different input conflicts. An interrupted command rolls back its ledger reservation and all writes.
- Actual changed paths: src/backend/app/infrastructure/commands.py and models.py, migrations/versions/0002_confirmed_command.py, tests/test_commands.py and README.md
- Verification: Ruff, strict mypy, nine pytest cases on PostgreSQL, Alembic offline SQL and wheel/sdist build passed. Both blank migration and upgrade from 0001 preserved expected data. Two competing version writes produced one success and one conflict; concurrent same-key requests created one effect.
- Review: Agent verification is recorded in attempt 01. PO jointly accepted all three FND-02 tasks and requested done.
- Commit/build: f721e04 on phase/b-backend. Push verified on origin.
- Next step: FND-02 Parent [PR #24](https://github.com/congminh1705/IT-Operation-Hub/pull/24) is open into main. PO merge pending. FND-03.01 follows the verified merge and separate PO authorization.
