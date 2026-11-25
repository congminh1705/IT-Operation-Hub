---
id: itoh-task-fnd-17-01
title: "FND-17.01 — Implement immediate access loss and protected account invariants"
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

# FND-17.01 — Implement immediate access loss and protected account invariants

## 1. Identity and objective

- **Parent:** [FND-17](../01-foundation.md#fnd-17); Phase B, decisions/real services.
- **Module:** users-teams-work.
- **Owner:** PO. **Status:** [execution board](../workflow/execution-board.md); the board is the single mutable registry.
- **Objective:** Revoke sessions/current scope on role/membership/lock changes; protect last Admin and ensure unlock restores no session.
- **Trace:** US06, US07, US09, US10; AC06, AC07, AC09, AC10. (the subset mapped below).
- **Direct task prerequisites:** [FND-16.03](FND-16.03.md)
- **Mapped parent acceptance:** FND-17 criterion 1; FND-17 criterion 3. Parent completion requires the separate coverage and closure rules, not this task alone.
- **Rules:** [task workflow](../workflow/task-workflow.md).

## 2. Scope and expected outputs

**Included:** Revoke sessions/current scope on role/membership/lock changes; protect last Admin and ensure unlock restores no session.

**Planned output boundaries**

- src/backend/app/modules/users/, modules/teams/ and modules/work_management/ and its public users-teams-work contracts: this task only.
- Affected Alembic migrations and domain/API/unit/integration tests.
- Existing public services/adapters may be extended narrowly; no Phase A screen rebuild.

**Excluded and phase boundary:** Implement only the named real-service/contract capability and its essential checks. Existing UI is reused; real browser wiring belongs to INT tasks. Do not perform unrelated domain work or production deployment.

Planned module paths are ownership hints, not assertions that files exist. Use the actual established package names and reuse predecessor interfaces; do not create empty scaffolds for these hints. Keep only the part of a listed module needed for this deliverable.

## 3. Embedded context package

| Existing source | Read only these sections / purpose | Authority |
| --- | --- | --- |
| [Parent acceptance](../01-foundation.md#fnd-17) | Criteria 1, 3 and the named objective; parent overview supplies the wider completion target | Planning |
| [decisions/design-decisions.md](../../decisions/design-decisions.md) | D-40 choices affecting this deliverable and confirmed D-29–43 within their limits | Requirement / contract / design |
| [requirements/permissions-matrix.md](../../requirements/permissions-matrix.md) | Current role/record/audience rules for the named module and mid-session changes | Requirement / contract / design |
| [requirements/business-rules.md](../../requirements/business-rules.md) | Business rule paragraphs referenced by the selected parent acceptance; retain original state and transaction invariants | Requirement / contract / design |
| [06-acceptance-criteria.md](../../06-acceptance-criteria.md) | Only the linked parent trace AC/TC and applicable cross-cutting cases | Requirement / contract / design |
| [Dependency evidence](../workflow/execution-board.md) | Read only the named direct prerequisites' outputs/interfaces/results; their cards are linked above | Execution evidence; currently NOT RUN |
| [Parent coverage and closure](../package-task-coverage.md#fnd-17) | Leaf ownership of criteria and any external frontend/integration closure | Derived planning |

Read source rules using the parent trace and the objective, not all milestone files. Use CodeGraph first for existing indexed code around `users-teams-work Implement immediate access loss and protected account invariants`. Validate current source/context at start; planned output paths are not required inputs until their producing task is done.

## 4. Preconditions

A future request authorizes the selected implementation (or this decision-refinement work), the parent is activated, one executor is assigned, named leaf dependencies are done and source context is current. Resolve the affected D-40 decision/access before its consumer; do not invent enterprise policy. Task availability does not grant provider calls, data access or deployment beyond existing authorization.

## 5. Acceptance and verification

| Observable acceptance | Required verification / expected result |
| --- | --- |
| Revoke sessions/current scope on role/membership/lock changes; protect last Admin and ensure unlock restores no session. | Test old cookies/team URLs and concurrent account changes. |
| Relevant selected parent rules are preserved within this deliverable; unowned outcomes remain assigned to other leaves/closure owners. | Compare actual output and failures to criteria 1, 3 in the parent and [coverage](../package-task-coverage.md#fnd-17); no unrelated or partially completed predecessor is assumed. |
| This phase's source/transport boundary and failure semantics are enforced, with no false completion or sensitive output. | Use actual domain/API checks; real PostgreSQL is required for DB guarantees and fake clock for SLA. Provider mocks cover controlled branches, not A11. Record pass/fail/not-run and verify the phase exclusions above. |

**Checks to execute:** Test old cookies/team URLs and concurrent account changes. Use commands established by the relevant foundation task: frontend scripts in src/frontend, backend uv/check/test scripts in src/backend, or the actual documented evidence harness. Record exact commands at execution; no command/test pass is claimed in planning.

**Completion evidence:** observable result, affected source/test paths, actual check outcomes, review findings, remaining decisions and next eligible task. A service leaf may be DONE independently of later UI wiring; package-level UI acceptance is closed only by its named INT/FE owners.

## 6. Evidence and handoff

- Latest Report ID: FND-17.01/attempt-02.
- Latest history entry: [Format version 1](../workflow/task-history.md#task-fnd-17-01-attempt-02).
- Delivered: Added versioned Admin role, department and lock changes and membership removal with session revocation and last-active-Admin protection.
- Changed files: `organization/access.py`, `organization/http.py`, OpenAPI and `tests/test_access_lifecycle.py`
- Checks: 58 passed on PostgreSQL 18.7. Old cookies and prior team URLs were denied, unlock did not revive revoked cookies, and concurrent Admin locks preserved one active Admin.
- Review: PO accepted all three backend leaves. Checks remain in attempt 01.
- Remaining: Handover for assigned active work is FND-17.02. Team retirement is FND-17.03. Real browser acceptance remains with INT-01.
- Commit/build: FND-17.01 implementation `1e948af` pushed to origin/phase/b-backend.
- Next: INT-01.01 is eligible on request. Full Parent closure awaits INT-01 and INT-03.
