---
id: itoh-task-fnd-16-01
title: "FND-16.01 — Persist manual plan/task and enforce internal scope"
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

# FND-16.01 — Persist manual plan/task and enforce internal scope

## 1. Identity and objective

- **Parent:** [FND-16](../01-foundation.md#fnd-16); Phase B, decisions/real services.
- **Module:** work-management.
- **Owner:** PO. **Status:** [execution board](../workflow/execution-board.md); the board is the single mutable registry.
- **Objective:** Create minimal versioned plan/task data with verified effort/window/team ownership and projections compatible with later DAG versions.
- **Trace:** US-OPS06; AC-OPS06; BR-14–16. (the subset mapped below).
- **Direct task prerequisites:** [FND-11.02](FND-11.02.md), [FND-15.02](FND-15.02.md)
- **Mapped parent acceptance:** FND-16 criterion 1; FND-16 criterion 3. Parent completion requires the separate coverage and closure rules, not this task alone.
- **Rules:** [task workflow](../workflow/task-workflow.md).

## 2. Scope and expected outputs

**Included:** Create minimal versioned plan/task data with verified effort/window/team ownership and projections compatible with later DAG versions.

**Planned output boundaries**

- src/backend/app/modules/work_management/ and its public work-management contracts: this task only.
- Affected Alembic migrations and domain/API/unit/integration tests.
- Existing public services/adapters may be extended narrowly; no Phase A screen rebuild.

**Excluded and phase boundary:** Implement only the named real-service/contract capability and its essential checks. Existing UI is reused; real browser wiring belongs to INT tasks. Do not perform unrelated domain work or production deployment.

Planned module paths are ownership hints, not assertions that files exist. Use the actual established package names and reuse predecessor interfaces; do not create empty scaffolds for these hints. Keep only the part of a listed module needed for this deliverable.

## 3. Embedded context package

| Existing source | Read only these sections / purpose | Authority |
| --- | --- | --- |
| [Parent acceptance](../01-foundation.md#fnd-16) | Criteria 1, 3 and the named objective; parent overview supplies the wider completion target | Planning |
| [requirements/business-rules.md](../../requirements/business-rules.md) | Business rule paragraphs referenced by the selected parent acceptance; retain original state and transaction invariants | Requirement / contract / design |
| [requirements/permissions-matrix.md](../../requirements/permissions-matrix.md) | Current role/record/audience rules for the named module and mid-session changes | Requirement / contract / design |
| [06-acceptance-criteria.md](../../06-acceptance-criteria.md) | Only the linked parent trace AC/TC and applicable cross-cutting cases | Requirement / contract / design |
| [requirements/conceptual-data-model.md](../../requirements/conceptual-data-model.md) | Named module entities, lifecycle, ownership and reviewed constraints | Requirement / contract / design |
| [Dependency evidence](../workflow/execution-board.md) | Read only the named direct prerequisites' outputs/interfaces/results; their cards are linked above | Execution evidence; currently NOT RUN |
| [Parent coverage and closure](../package-task-coverage.md#fnd-16) | Leaf ownership of criteria and any external frontend/integration closure | Derived planning |

Read source rules using the parent trace and the objective, not all milestone files. Use CodeGraph first for existing indexed code around `work-management Persist manual plan/task and enforce internal scope`. Validate current source/context at start; planned output paths are not required inputs until their producing task is done.

## 4. Preconditions

A future request authorizes the selected implementation (or this decision-refinement work), the parent is activated, one executor is assigned, named leaf dependencies are done and source context is current. Resolve the affected D-40 decision/access before its consumer; do not invent enterprise policy. Task availability does not grant provider calls, data access or deployment beyond existing authorization.

## 5. Acceptance and verification

| Observable acceptance | Required verification / expected result |
| --- | --- |
| Create minimal versioned plan/task data with verified effort/window/team ownership and projections compatible with later DAG versions. | Test requester exclusions, task persistence and no fabricated evidence. |
| Relevant selected parent rules are preserved within this deliverable; unowned outcomes remain assigned to other leaves/closure owners. | Compare actual output and failures to criteria 1, 3 in the parent and [coverage](../package-task-coverage.md#fnd-16); no unrelated or partially completed predecessor is assumed. |
| This phase's source/transport boundary and failure semantics are enforced, with no false completion or sensitive output. | Use actual domain/API checks; real PostgreSQL is required for DB guarantees and fake clock for SLA. Provider mocks cover controlled branches, not A11. Record pass/fail/not-run and verify the phase exclusions above. |

**Checks to execute:** Test requester exclusions, task persistence and no fabricated evidence. Use commands established by the relevant foundation task: frontend scripts in src/frontend, backend uv/check/test scripts in src/backend, or the actual documented evidence harness. Record exact commands at execution; no command/test pass is claimed in planning.

**Completion evidence:** observable result, affected source/test paths, actual check outcomes, review findings, remaining decisions and next eligible task. A service leaf may be DONE independently of later UI wiring; package-level UI acceptance is closed only by its named INT/FE owners.

## 6. Evidence and handoff

- Latest Report ID: FND-16.01/attempt-01.
- Latest history entry: [Format version 1](../workflow/task-history.md#task-fnd-16-01-attempt-01).
- Delivered: Added manual Draft plan creation and initial unassigned tasks with ticket-derived team, positive effort, UTC window, explicit evidence reference/version and current manager reviewer. Plan/task APIs filter by current team before paging.
- Changed files: `work_management/service.py`, `work_management/models.py`, `organization/http.py`, migration 0021, reviewed OpenAPI and `tests/test_manual_work.py`
- Checks: 54 passed on PostgreSQL 18.7. No requester reads; current scope, transfer, missing evidence, idempotent replay and audit rollback verified. Ruff, mypy, five contract tests and five FND-16.01 runtime OpenAPI comparisons passed.
- Review: Agent verified. PO acceptance pending.
- Remaining: Manual allocation and progress are owned by FND-16.02/03. DAG activation is later workflow scope. The evidence reference is supplied by the authorized reviewer; no external evidence system is validated here. Browser and real integration await INT-03.
- Commit/build: FND-16.01 implementation `f1c4798` pushed to origin/phase/b-backend.
- Next: Joint PO review of FND-16.01 through FND-16.03. Full Parent closure depends on INT-03.
