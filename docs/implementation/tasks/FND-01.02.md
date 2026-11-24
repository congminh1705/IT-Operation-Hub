---
id: itoh-task-fnd-01-02
title: "FND-01.02 — Expose safe health and establish build checks"
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

# FND-01.02 — Expose safe health and establish build checks

## 1. Identity and objective

- **Parent:** [FND-01](../01-foundation.md#fnd-01); Phase B, decisions/real services.
- **Module:** runtime.
- **Owner:** PO. **Status:** [execution board](../workflow/execution-board.md); the board is the single mutable registry.
- **Objective:** Add liveness/readiness and minimum backend lint/type/test/build scripts; describe Linux worker support without enabling business jobs.
- **Trace:** NFR14, NFR17; A13 (foundation). (the subset mapped below).
- **Direct task prerequisites:** [FND-01.01](FND-01.01.md)
- **Mapped parent acceptance:** FND-01 criterion 2; FND-01 criterion 3. Parent completion requires the separate coverage and closure rules, not this task alone.
- **Rules:** [task workflow](../workflow/task-workflow.md).

## 2. Scope and expected outputs

**Included:** Add liveness/readiness and minimum backend lint/type/test/build scripts; describe Linux worker support without enabling business jobs.

**Planned output boundaries**

- src/backend/pyproject.toml, uv.lock and local runtime configuration.
- src/backend/app/main.py and minimal health/check setup; existing frontend is reused.

**Excluded and phase boundary:** Implement only the named real-service/contract capability and its essential checks. Existing UI is reused; real browser wiring belongs to INT tasks. Do not perform unrelated domain work or production deployment.

Planned module paths are ownership hints, not assertions that files exist. Use the actual established package names and reuse predecessor interfaces; do not create empty scaffolds for these hints. Keep only the part of a listed module needed for this deliverable.

## 3. Embedded context package

| Existing source | Read only these sections / purpose | Authority |
| --- | --- | --- |
| [Parent acceptance](../01-foundation.md#fnd-01) | Criteria 2, 3 and the named objective; parent overview supplies the wider completion target | Planning |
| [technical/tech-stack.md](../../technical/tech-stack.md) | Only the named objective, trace IDs and selected parent rules | Requirement / contract / design |
| [technical/code-structure.md](../../technical/code-structure.md) | Ownership and public module boundaries for the planned output | Requirement / contract / design |
| [technical/architecture.md](../../technical/architecture.md) | Transactions, model boundary, events or recovery sections actually used by this deliverable | Requirement / contract / design |
| [Dependency evidence](../workflow/execution-board.md) | Read only the named direct prerequisites' outputs/interfaces/results; their cards are linked above | Execution evidence; currently NOT RUN |
| [Parent coverage and closure](../package-task-coverage.md#fnd-01) | Leaf ownership of criteria and any external frontend/integration closure | Derived planning |

Read source rules using the parent trace and the objective, not all milestone files. Use CodeGraph first for existing indexed code around `runtime Expose safe health and establish build checks`. Validate current source/context at start; planned output paths are not required inputs until their producing task is done.

## 4. Preconditions

A future request authorizes the selected implementation (or this decision-refinement work), the parent is activated, one executor is assigned, named leaf dependencies are done and source context is current. Resolve the affected D-40 decision/access before its consumer; do not invent enterprise policy. Task availability does not grant provider calls, data access or deployment beyond existing authorization.

## 5. Acceptance and verification

| Observable acceptance | Required verification / expected result |
| --- | --- |
| Add liveness/readiness and minimum backend lint/type/test/build scripts; describe Linux worker support without enabling business jobs. | Verify minimal HTTP health, DB readiness failure and no secret disclosures; run actual build/check commands. |
| Relevant selected parent rules are preserved within this deliverable; unowned outcomes remain assigned to other leaves/closure owners. | Compare actual output and failures to criteria 2, 3 in the parent and [coverage](../package-task-coverage.md#fnd-01); no unrelated or partially completed predecessor is assumed. |
| This phase's source/transport boundary and failure semantics are enforced, with no false completion or sensitive output. | Use actual domain/API checks; real PostgreSQL is required for DB guarantees and fake clock for SLA. Provider mocks cover controlled branches, not A11. Record pass/fail/not-run and verify the phase exclusions above. |

**Checks to execute:** Verify minimal HTTP health, DB readiness failure and no secret disclosures; run actual build/check commands. Use commands established by the relevant foundation task: frontend scripts in src/frontend, backend uv/check/test scripts in src/backend, or the actual documented evidence harness. Record exact commands at execution; no command/test pass is claimed in planning.

**Completion evidence:** observable result, affected source/test paths, actual check outcomes, review findings, remaining decisions and next eligible task. A service leaf may be DONE independently of later UI wiring; package-level UI acceptance is closed only by its named INT/FE owners.

## 6. Evidence and handoff

- Latest Report ID: FND-01.02/attempt-01.
- Latest history entry: [Format version 1](../workflow/task-history.md#task-fnd-01-02-attempt-01).
- Delivered result: Implemented /api/v1/health/live and /api/v1/health/ready. The DB probe is read-only; HTTP 503 reports an unavailable database with no connection details. Added health tests, Ruff, strict mypy and wheel/sdist build. Documented Linux worker support.
- Actual changed paths: src/backend/app/health.py, app/main.py, tests/test_health.py, pyproject.toml, uv.lock and README.md
- Verification: Ruff, strict mypy, two pytest cases and wheel/sdist build passed. Live Uvicorn HTTP checks returned readiness 200 with PostgreSQL and 503 with an unavailable port, while liveness returned 200 in both cases.
- Review: agent verification complete. Joint PO acceptance pending.
- Commit/build: scoped task commit on phase/b-backend.
- Next step: Joint PO review of FND-01.01 and FND-01.02 before Parent closure.
