---
id: itoh-task-fnd-02-01
title: "FND-02.01 — Create SQLAlchemy session and migration foundation"
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

# FND-02.01 — Create SQLAlchemy session and migration foundation

## 1. Identity and objective

- **Parent:** [FND-02](../01-foundation.md#fnd-02); Phase B, decisions/real services.
- **Module:** database-events.
- **Owner:** PO. **Status:** [execution board](../workflow/execution-board.md); the board is the single mutable registry.
- **Objective:** Implement per-request/job synchronous Sessions, reviewed base schema/migrations and injectable UTC clock.
- **Trace:** AC-X08, AC-X09; NFR03, NFR13, NFR21. (the subset mapped below).
- **Direct task prerequisites:** [FND-01.02](FND-01.02.md)
- **Mapped parent acceptance:** FND-02 criterion 1. Parent completion requires the separate coverage and closure rules, not this task alone.
- **Rules:** [task workflow](../workflow/task-workflow.md).

## 2. Scope and expected outputs

**Included:** Implement per-request/job synchronous Sessions, reviewed base schema/migrations and injectable UTC clock.

**Planned output boundaries**

- src/backend/app/infrastructure/database and events; audit writer contracts.
- src/backend/migrations plus meaningful PostgreSQL transaction/version tests.

**Excluded and phase boundary:** Implement only the named real-service/contract capability and its essential checks. Existing UI is reused; real browser wiring belongs to INT tasks. Do not perform unrelated domain work or production deployment.

Planned module paths are ownership hints, not assertions that files exist. Use the actual established package names and reuse predecessor interfaces; do not create empty scaffolds for these hints. Keep only the part of a listed module needed for this deliverable.

## 3. Embedded context package

| Existing source | Read only these sections / purpose | Authority |
| --- | --- | --- |
| [Parent acceptance](../01-foundation.md#fnd-02) | Criteria 1 and the named objective; parent overview supplies the wider completion target | Planning |
| [technical/architecture.md](../../technical/architecture.md) | Transactions, model boundary, events or recovery sections actually used by this deliverable | Requirement / contract / design |
| [requirements/conceptual-data-model.md](../../requirements/conceptual-data-model.md) | Named module entities, lifecycle, ownership and reviewed constraints | Requirement / contract / design |
| [technical/api-design.md](../../technical/api-design.md) | Named module operations, shared errors/version/idempotency and asynchronous outcome contract | Requirement / contract / design |
| [Dependency evidence](../workflow/execution-board.md) | Read only the named direct prerequisites' outputs/interfaces/results; their cards are linked above | Execution evidence; currently NOT RUN |
| [Parent coverage and closure](../package-task-coverage.md#fnd-02) | Leaf ownership of criteria and any external frontend/integration closure | Derived planning |

Read source rules using the parent trace and the objective, not all milestone files. Use CodeGraph first for existing indexed code around `database-events Create SQLAlchemy session and migration foundation`. Validate current source/context at start; planned output paths are not required inputs until their producing task is done.

## 4. Preconditions

A future request authorizes the selected implementation (or this decision-refinement work), the parent is activated, one executor is assigned, named leaf dependencies are done and source context is current. Resolve the affected D-40 decision/access before its consumer; do not invent enterprise policy. Task availability does not grant provider calls, data access or deployment beyond existing authorization.

## 5. Acceptance and verification

| Observable acceptance | Required verification / expected result |
| --- | --- |
| Implement per-request/job synchronous Sessions, reviewed base schema/migrations and injectable UTC clock. | Run empty/upgrade migrations, separate-session concurrency and restart persistence on PostgreSQL. |
| Relevant selected parent rules are preserved within this deliverable; unowned outcomes remain assigned to other leaves/closure owners. | Compare actual output and failures to criteria 1 in the parent and [coverage](../package-task-coverage.md#fnd-02); no unrelated or partially completed predecessor is assumed. |
| This phase's source/transport boundary and failure semantics are enforced, with no false completion or sensitive output. | Use actual domain/API checks; real PostgreSQL is required for DB guarantees and fake clock for SLA. Provider mocks cover controlled branches, not A11. Record pass/fail/not-run and verify the phase exclusions above. |

**Checks to execute:** Run empty/upgrade migrations, separate-session concurrency and restart persistence on PostgreSQL. Use commands established by the relevant foundation task: frontend scripts in src/frontend, backend uv/check/test scripts in src/backend, or the actual documented evidence harness. Record exact commands at execution; no command/test pass is claimed in planning.

**Completion evidence:** observable result, affected source/test paths, actual check outcomes, review findings, remaining decisions and next eligible task. A service leaf may be DONE independently of later UI wiring; package-level UI acceptance is closed only by its named INT/FE owners.

## 6. Evidence and handoff

- Latest Report ID: FND-02.01/attempt-02.
- Latest history entry: [Format version 1](../workflow/task-history.md#task-fnd-02-01-attempt-02).
- Delivered result: Added SQLAlchemy 2.1.9 and Alembic 1.20.1, revision 0001_foundation, shared audit/event/outbox persistence, session factory and a UTC clock seam.
- Actual changed paths: src/backend/app/infrastructure/, src/backend/migrations/, src/backend/alembic.ini, dependencies and database tests
- Verification: Ruff, strict mypy and four pytest cases passed. PostgreSQL empty-schema migration, simultaneous isolated sessions and committed-row persistence across Compose restart passed.
- Review: Agent verification is recorded in attempt 01. PO jointly accepted all three FND-02 tasks and requested done.
- Commit/build: d98caed on phase/b-backend. Push verified on origin.
- Next step: Deliver the FND-02 Parent PR. FND-03.01 follows the verified merge and separate PO authorization.
