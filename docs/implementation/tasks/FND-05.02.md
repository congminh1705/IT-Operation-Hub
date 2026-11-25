---
id: itoh-task-fnd-05-02
title: "FND-05.02 — Implement teams, memberships and single intake configuration"
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

# FND-05.02 — Implement teams, memberships and single intake configuration

## 1. Identity and objective

- **Parent:** [FND-05](../01-foundation.md#fnd-05); Phase B, decisions/real services.
- **Module:** users-teams.
- **Owner:** PO. **Status:** [execution board](../workflow/execution-board.md); the board is the single mutable registry.
- **Objective:** Provide eligible membership creation and one active intake; block destructive eligibility/team changes until the handover service exists.
- **Trace:** US08, US09, US10 (creation); AC08–10. (the subset mapped below).
- **Direct task prerequisites:** [FND-05.01](FND-05.01.md)
- **Mapped parent acceptance:** FND-05 criterion 1; FND-05 criterion 3. Parent completion requires the separate coverage and closure rules, not this task alone.
- **Rules:** [task workflow](../workflow/task-workflow.md).

## 2. Scope and expected outputs

**Included:** Provide eligible membership creation and one active intake; block destructive eligibility/team changes until the handover service exists.

**Planned output boundaries**

- src/backend/app/modules/users/ and modules/teams/ and its public users-teams contracts: this task only.
- Affected Alembic migrations and domain/API/unit/integration tests.
- Existing public services/adapters may be extended narrowly; no Phase A screen rebuild.

**Excluded and phase boundary:** Implement only the named real-service/contract capability and its essential checks. Existing UI is reused; real browser wiring belongs to INT tasks. Do not perform unrelated domain work or production deployment.

Planned module paths are ownership hints, not assertions that files exist. Use the actual established package names and reuse predecessor interfaces; do not create empty scaffolds for these hints. Keep only the part of a listed module needed for this deliverable.

## 3. Embedded context package

| Existing source | Read only these sections / purpose | Authority |
| --- | --- | --- |
| [Parent acceptance](../01-foundation.md#fnd-05) | Criteria 1, 3 and the named objective; parent overview supplies the wider completion target | Planning |
| [requirements/permissions-matrix.md](../../requirements/permissions-matrix.md) | Current role/record/audience rules for the named module and mid-session changes | Requirement / contract / design |
| [requirements/business-rules.md](../../requirements/business-rules.md) | Business rule paragraphs referenced by the selected parent acceptance; retain original state and transaction invariants | Requirement / contract / design |
| [technical/api-design.md](../../technical/api-design.md) | Named module operations, shared errors/version/idempotency and asynchronous outcome contract | Requirement / contract / design |
| [06-acceptance-criteria.md](../../06-acceptance-criteria.md) | Only the linked parent trace AC/TC and applicable cross-cutting cases | Requirement / contract / design |
| [Dependency evidence](../workflow/execution-board.md) | Read only the named direct prerequisites' outputs/interfaces/results; their cards are linked above | Execution evidence; currently NOT RUN |
| [Parent coverage and closure](../package-task-coverage.md#fnd-05) | Leaf ownership of criteria and any external frontend/integration closure | Derived planning |

Read source rules using the parent trace and the objective, not all milestone files. Use CodeGraph first for existing indexed code around `users-teams Implement teams, memberships and single intake configuration`. Validate current source/context at start; planned output paths are not required inputs until their producing task is done.

## 4. Preconditions

A future request authorizes the selected implementation (or this decision-refinement work), the parent is activated, one executor is assigned, named leaf dependencies are done and source context is current. Resolve the affected D-40 decision/access before its consumer; do not invent enterprise policy. Task availability does not grant provider calls, data access or deployment beyond existing authorization.

## 5. Acceptance and verification

| Observable acceptance | Required verification / expected result |
| --- | --- |
| Provide eligible membership creation and one active intake; block destructive eligibility/team changes until the handover service exists. | Test intake uniqueness, invalid members and deactivation/removal with open work; later removal uses FND-17. |
| Relevant selected parent rules are preserved within this deliverable; unowned outcomes remain assigned to other leaves/closure owners. | Compare actual output and failures to criteria 1, 3 in the parent and [coverage](../package-task-coverage.md#fnd-05); no unrelated or partially completed predecessor is assumed. |
| This phase's source/transport boundary and failure semantics are enforced, with no false completion or sensitive output. | Use actual domain/API checks; real PostgreSQL is required for DB guarantees and fake clock for SLA. Provider mocks cover controlled branches, not A11. Record pass/fail/not-run and verify the phase exclusions above. |

**Checks to execute:** Test intake uniqueness, invalid members and deactivation/removal with open work; later removal uses FND-17. Use commands established by the relevant foundation task: frontend scripts in src/frontend, backend uv/check/test scripts in src/backend, or the actual documented evidence harness. Record exact commands at execution; no command/test pass is claimed in planning.

**Completion evidence:** observable result, affected source/test paths, actual check outcomes, review findings, remaining decisions and next eligible task. A service leaf may be DONE independently of later UI wiring; package-level UI acceptance is closed only by its named INT/FE owners.

## 6. Evidence and handoff

- Latest Report ID: FND-05.02/attempt-01.
- Latest history entry: [Format version 1](../workflow/task-history.md#task-fnd-05-02-attempt-01).
- Delivered: Admin team creation and edits, explicit single active intake, eligible team memberships and a minimal intake lookup.
- Changed paths: src/backend/app/modules/organization, migrations/versions/0005_teams.py, tests/test_organization.py, docs/api/openapi.json and src/backend/README.md.
- Checks: 19 PostgreSQL-backed tests, Ruff and strict mypy passed. Two competing intake selections left exactly one active intake. Invalid members and non-Admin mutations were rejected. Active removal and deactivation return HANDOVER_REQUIRED and preserve stored membership.
- Review: Agent verified. Joint PO review pending.
- Remaining: Actual open-work handover belongs to FND-17. FND-08.01 supplies ticket categories. INT-01 owns real browser and full Parent acceptance.
- Commit/build: FND-05.02 implementation 8fad3f2 pushed and verified on origin/phase/b-backend.
- Next: Joint PO review after both FND-05 leaves pass their checks. Parent closure requires INT-01.
