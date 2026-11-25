---
id: itoh-task-fnd-06-01
title: "FND-06.01 — Implement verified account provisioning command"
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

# FND-06.01 — Implement verified account provisioning command

## 1. Identity and objective

- **Parent:** [FND-06](../01-foundation.md#fnd-06); Phase B, decisions/real services.
- **Module:** users.
- **Owner:** PO. **Status:** [execution board](../workflow/execution-board.md); the board is the single mutable registry.
- **Objective:** Create normalized unique identities/default Requester under authorized bootstrap or verified D-29 request, with explicit IT-role authorization.
- **Trace:** US05; AC05; D-29. (the subset mapped below).
- **Direct task prerequisites:** [FND-05.02](FND-05.02.md)
- **Mapped parent acceptance:** FND-06 criterion 1; FND-06 criterion 2. Parent completion requires the separate coverage and closure rules, not this task alone.
- **Rules:** [task workflow](../workflow/task-workflow.md).

## 2. Scope and expected outputs

**Included:** Create normalized unique identities/default Requester under authorized bootstrap or verified D-29 request, with explicit IT-role authorization.

**Planned output boundaries**

- src/backend/app/modules/users/ and its public users contracts: this task only.
- Affected Alembic migrations and domain/API/unit/integration tests.
- Existing public services/adapters may be extended narrowly; no Phase A screen rebuild.

**Excluded and phase boundary:** Implement only the named real-service/contract capability and its essential checks. Existing UI is reused; real browser wiring belongs to INT tasks. Do not perform unrelated domain work or production deployment.

Planned module paths are ownership hints, not assertions that files exist. Use the actual established package names and reuse predecessor interfaces; do not create empty scaffolds for these hints. Keep only the part of a listed module needed for this deliverable.

## 3. Embedded context package

| Existing source | Read only these sections / purpose | Authority |
| --- | --- | --- |
| [Parent acceptance](../01-foundation.md#fnd-06) | Criteria 1, 2 and the named objective; parent overview supplies the wider completion target | Planning |
| [requirements/account-provisioning.md](../../requirements/account-provisioning.md) | D-29 verification/handover actor and secure account result | Requirement / contract / design |
| [requirements/permissions-matrix.md](../../requirements/permissions-matrix.md) | Current role/record/audience rules for the named module and mid-session changes | Requirement / contract / design |
| [requirements/business-rules.md](../../requirements/business-rules.md) | Business rule paragraphs referenced by the selected parent acceptance; retain original state and transaction invariants | Requirement / contract / design |
| [06-acceptance-criteria.md](../../06-acceptance-criteria.md) | Only the linked parent trace AC/TC and applicable cross-cutting cases | Requirement / contract / design |
| [Dependency evidence](../workflow/execution-board.md) | Read only the named direct prerequisites' outputs/interfaces/results; their cards are linked above | Execution evidence; currently NOT RUN |
| [Parent coverage and closure](../package-task-coverage.md#fnd-06) | Leaf ownership of criteria and any external frontend/integration closure | Derived planning |

Read source rules using the parent trace and the objective, not all milestone files. Use CodeGraph first for existing indexed code around `users Implement verified account provisioning command`. Validate current source/context at start; planned output paths are not required inputs until their producing task is done.

## 4. Preconditions

A future request authorizes the selected implementation (or this decision-refinement work), the parent is activated, one executor is assigned, named leaf dependencies are done and source context is current. Resolve the affected D-40 decision/access before its consumer; do not invent enterprise policy. Task availability does not grant provider calls, data access or deployment beyond existing authorization.

## 5. Acceptance and verification

| Observable acceptance | Required verification / expected result |
| --- | --- |
| Create normalized unique identities/default Requester under authorized bootstrap or verified D-29 request, with explicit IT-role authorization. | Test duplicate/concurrent email, forged roles and ticket submission causing no account effect. |
| Relevant selected parent rules are preserved within this deliverable; unowned outcomes remain assigned to other leaves/closure owners. | Compare actual output and failures to criteria 1, 2 in the parent and [coverage](../package-task-coverage.md#fnd-06); no unrelated or partially completed predecessor is assumed. |
| This phase's source/transport boundary and failure semantics are enforced, with no false completion or sensitive output. | Use actual domain/API checks; real PostgreSQL is required for DB guarantees and fake clock for SLA. Provider mocks cover controlled branches, not A11. Record pass/fail/not-run and verify the phase exclusions above. |

**Checks to execute:** Test duplicate/concurrent email, forged roles and ticket submission causing no account effect. Use commands established by the relevant foundation task: frontend scripts in src/frontend, backend uv/check/test scripts in src/backend, or the actual documented evidence harness. Record exact commands at execution; no command/test pass is claimed in planning.

**Completion evidence:** observable result, affected source/test paths, actual check outcomes, review findings, remaining decisions and next eligible task. A service leaf may be DONE independently of later UI wiring; package-level UI acceptance is closed only by its named INT/FE owners.

## 6. Evidence and handoff

- Latest Report ID: FND-06.01/attempt-02.
- Latest history entry: [Format version 1](../workflow/task-history.md#task-fnd-06-01-attempt-02).
- Delivered: Admin-only account creation with normalized unique email, active department, default Requester, mandatory trusted one-use evidence and separate elevated approval guard. Uses an Argon2id temporary verifier and redacted audit.
- Changed paths: src/backend/app/modules/users/provisioning.py, app/modules/organization/http.py, migrations/versions/0009_provisioning_verification.py, tests/test_organization.py and docs/api/openapi.json.
- Checks: 28 PostgreSQL-backed tests plus Ruff, strict mypy, Alembic offline SQL and five OpenAPI drift tests passed.
- Review: PO accepted the backend leaf. Original verification used synthetic evidence.
- Remaining: No live producer for trusted verification. Confirm IT role approver and credential handover channel before live use. Full result contract is FND-06.02.
- Commit/build: Implementation 8d55172 pushed and verified on origin/phase/b-backend.
- Next: FND-06.02 authorized after PO acceptance.
