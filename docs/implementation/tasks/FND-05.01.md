---
id: itoh-task-fnd-05-01
title: "FND-05.01 — Implement department and category-safe reference ownership"
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

# FND-05.01 — Implement department and category-safe reference ownership

## 1. Identity and objective

- **Parent:** [FND-05](../01-foundation.md#fnd-05); Phase B, decisions/real services.
- **Module:** users-teams.
- **Owner:** PO. **Status:** [execution board](../workflow/execution-board.md); the board is the single mutable registry.
- **Objective:** Provide Admin department lifecycle and minimal reference projections with retained historical records and unique names/codes.
- **Trace:** US08, US09, US10 (creation); AC08–10. (the subset mapped below).
- **Direct task prerequisites:** [FND-04.02](FND-04.02.md)
- **Mapped parent acceptance:** FND-05 criterion 1; FND-05 criterion 2. Parent completion requires the separate coverage and closure rules, not this task alone.
- **Rules:** [task workflow](../workflow/task-workflow.md).

## 2. Scope and expected outputs

**Included:** Provide Admin department lifecycle and minimal reference projections with retained historical records and unique names/codes.

**Planned output boundaries**

- src/backend/app/modules/users/ and modules/teams/ and its public users-teams contracts: this task only.
- Affected Alembic migrations and domain/API/unit/integration tests.
- Existing public services/adapters may be extended narrowly; no Phase A screen rebuild.

**Excluded and phase boundary:** Implement only the named real-service/contract capability and its essential checks. Existing UI is reused; real browser wiring belongs to INT tasks. Do not perform unrelated domain work or production deployment.

Planned module paths are ownership hints, not assertions that files exist. Use the actual established package names and reuse predecessor interfaces; do not create empty scaffolds for these hints. Keep only the part of a listed module needed for this deliverable.

## 3. Embedded context package

| Existing source | Read only these sections / purpose | Authority |
| --- | --- | --- |
| [Parent acceptance](../01-foundation.md#fnd-05) | Criteria 1, 2 and the named objective; parent overview supplies the wider completion target | Planning |
| [requirements/permissions-matrix.md](../../requirements/permissions-matrix.md) | Current role/record/audience rules for the named module and mid-session changes | Requirement / contract / design |
| [requirements/business-rules.md](../../requirements/business-rules.md) | Business rule paragraphs referenced by the selected parent acceptance; retain original state and transaction invariants | Requirement / contract / design |
| [technical/api-design.md](../../technical/api-design.md) | Named module operations, shared errors/version/idempotency and asynchronous outcome contract | Requirement / contract / design |
| [06-acceptance-criteria.md](../../06-acceptance-criteria.md) | Only the linked parent trace AC/TC and applicable cross-cutting cases | Requirement / contract / design |
| [Dependency evidence](../workflow/execution-board.md) | Read only the named direct prerequisites' outputs/interfaces/results; their cards are linked above | Execution evidence; currently NOT RUN |
| [Parent coverage and closure](../package-task-coverage.md#fnd-05) | Leaf ownership of criteria and any external frontend/integration closure | Derived planning |

Read source rules using the parent trace and the objective, not all milestone files. Use CodeGraph first for existing indexed code around `users-teams Implement department and category-safe reference ownership`. Validate current source/context at start; planned output paths are not required inputs until their producing task is done.

## 4. Preconditions

A future request authorizes the selected implementation (or this decision-refinement work), the parent is activated, one executor is assigned, named leaf dependencies are done and source context is current. Resolve the affected D-40 decision/access before its consumer; do not invent enterprise policy. Task availability does not grant provider calls, data access or deployment beyond existing authorization.

## 5. Acceptance and verification

| Observable acceptance | Required verification / expected result |
| --- | --- |
| Provide Admin department lifecycle and minimal reference projections with retained historical records and unique names/codes. | Test referenced deactivation, non-Admin mutation denial and requester directory/count leakage. |
| Relevant selected parent rules are preserved within this deliverable; unowned outcomes remain assigned to other leaves/closure owners. | Compare actual output and failures to criteria 1, 2 in the parent and [coverage](../package-task-coverage.md#fnd-05); no unrelated or partially completed predecessor is assumed. |
| This phase's source/transport boundary and failure semantics are enforced, with no false completion or sensitive output. | Use actual domain/API checks; real PostgreSQL is required for DB guarantees and fake clock for SLA. Provider mocks cover controlled branches, not A11. Record pass/fail/not-run and verify the phase exclusions above. |

**Checks to execute:** Test referenced deactivation, non-Admin mutation denial and requester directory/count leakage. Use commands established by the relevant foundation task: frontend scripts in src/frontend, backend uv/check/test scripts in src/backend, or the actual documented evidence harness. Record exact commands at execution; no command/test pass is claimed in planning.

**Completion evidence:** observable result, affected source/test paths, actual check outcomes, review findings, remaining decisions and next eligible task. A service leaf may be DONE independently of later UI wiring; package-level UI acceptance is closed only by its named INT/FE owners.

## 6. Evidence and handoff

- Latest Report ID: FND-05.01/attempt-01.
- Latest history entry: [Format version 1](../workflow/task-history.md#task-fnd-05-01-attempt-01).
- Delivered: Admin department lifecycle, preserved historical account references, and own-department lookup.
- Changed paths: src/backend/app/modules/organization, app/modules/auth, app/main.py, migrations/versions/0004_departments.py, tests/test_organization.py.
- Checks: 17 PostgreSQL-backed tests, Ruff and strict mypy passed. Normalized duplicates and stale writes return 409. Non-Admin writes and directory access are denied. Inactive departments are excluded from active choices without removing account references.
- Review: Agent verified. Joint PO review pending.
- Remaining: Ticket-category lookups belong to FND-08.01. Intake lookup is next in FND-05.02. INT-01 owns browser closure.
- Commit/build: FND-05.01 implementation a5c56e5 pushed and verified on origin/phase/b-backend.
- Next: Joint PO review after both FND-05 leaves pass their checks. Parent closure requires INT-01.
