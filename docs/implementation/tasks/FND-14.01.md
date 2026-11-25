---
id: itoh-task-fnd-14-01
title: "FND-14.01 — Implement skill taxonomy and authorized verification"
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

# FND-14.01 — Implement skill taxonomy and authorized verification

## 1. Identity and objective

- **Parent:** [FND-14](../01-foundation.md#fnd-14); Phase B, decisions/real services.
- **Module:** workforce.
- **Owner:** PO. **Status:** [execution board](../workflow/execution-board.md); the board is the single mutable registry.
- **Objective:** Persist required/user skills with reviewer/provenance/version and distinguish unverified/missing from eligible.
- **Trace:** US-OPS01 (skills); AC-OPS01. (the subset mapped below).
- **Direct task prerequisites:** [FND-05.02](FND-05.02.md), [PRE-02.03](PRE-02.03.md)
- **Mapped parent acceptance:** FND-14 criterion 1; FND-14 criterion 2. Parent completion requires the separate coverage and closure rules, not this task alone.
- **Rules:** [task workflow](../workflow/task-workflow.md).

## 2. Scope and expected outputs

**Included:** Persist required/user skills with reviewer/provenance/version and distinguish unverified/missing from eligible.

**Planned output boundaries**

- src/backend/app/modules/workforce/ and its public workforce contracts: this task only.
- Affected Alembic migrations and domain/API/unit/integration tests.
- Existing public services/adapters may be extended narrowly; no Phase A screen rebuild.

**Excluded and phase boundary:** Implement only the named real-service/contract capability and its essential checks. Existing UI is reused; real browser wiring belongs to INT tasks. Do not perform unrelated domain work or production deployment.

Planned module paths are ownership hints, not assertions that files exist. Use the actual established package names and reuse predecessor interfaces; do not create empty scaffolds for these hints. Keep only the part of a listed module needed for this deliverable.

## 3. Embedded context package

| Existing source | Read only these sections / purpose | Authority |
| --- | --- | --- |
| [Parent acceptance](../01-foundation.md#fnd-14) | Criteria 1, 2 and the named objective; parent overview supplies the wider completion target | Planning |
| [requirements/business-rules.md](../../requirements/business-rules.md) | Business rule paragraphs referenced by the selected parent acceptance; retain original state and transaction invariants | Requirement / contract / design |
| [requirements/permissions-matrix.md](../../requirements/permissions-matrix.md) | Current role/record/audience rules for the named module and mid-session changes | Requirement / contract / design |
| [06-acceptance-criteria.md](../../06-acceptance-criteria.md) | Only the linked parent trace AC/TC and applicable cross-cutting cases | Requirement / contract / design |
| [technical/api-design.md](../../technical/api-design.md) | Named module operations, shared errors/version/idempotency and asynchronous outcome contract | Requirement / contract / design |
| [Dependency evidence](../workflow/execution-board.md) | Read only the named direct prerequisites' outputs/interfaces/results; their cards are linked above | Execution evidence; currently NOT RUN |
| [Parent coverage and closure](../package-task-coverage.md#fnd-14) | Leaf ownership of criteria and any external frontend/integration closure | Derived planning |

Read source rules using the parent trace and the objective, not all milestone files. Use CodeGraph first for existing indexed code around `workforce Implement skill taxonomy and authorized verification`. Validate current source/context at start; planned output paths are not required inputs until their producing task is done.

## 4. Preconditions

A future request authorizes the selected implementation (or this decision-refinement work), the parent is activated, one executor is assigned, named leaf dependencies are done and source context is current. Resolve the affected D-40 decision/access before its consumer; do not invent enterprise policy. Task availability does not grant provider calls, data access or deployment beyond existing authorization.

## 5. Acceptance and verification

| Observable acceptance | Required verification / expected result |
| --- | --- |
| Persist required/user skills with reviewer/provenance/version and distinguish unverified/missing from eligible. | Test M/A verification, self-verification denial and reduced workforce projections. |
| Relevant selected parent rules are preserved within this deliverable; unowned outcomes remain assigned to other leaves/closure owners. | Compare actual output and failures to criteria 1, 2 in the parent and [coverage](../package-task-coverage.md#fnd-14); no unrelated or partially completed predecessor is assumed. |
| This phase's source/transport boundary and failure semantics are enforced, with no false completion or sensitive output. | Use actual domain/API checks; real PostgreSQL is required for DB guarantees and fake clock for SLA. Provider mocks cover controlled branches, not A11. Record pass/fail/not-run and verify the phase exclusions above. |

**Checks to execute:** Test M/A verification, self-verification denial and reduced workforce projections. Use commands established by the relevant foundation task: frontend scripts in src/frontend, backend uv/check/test scripts in src/backend, or the actual documented evidence harness. Record exact commands at execution; no command/test pass is claimed in planning.

**Completion evidence:** observable result, affected source/test paths, actual check outcomes, review findings, remaining decisions and next eligible task. A service leaf may be DONE independently of later UI wiring; package-level UI acceptance is closed only by its named INT/FE owners.

## 6. Evidence and handoff

- Latest Report ID: FND-14.01/attempt-02.
- Latest history entry: [Format version 1](../workflow/task-history.md#task-fnd-14-01-attempt-02).
- Delivered: Added scoped skill catalog and versioned workforce verification with reviewer, effective department, timestamp, evidence reference/version and optional explicit expiry. Stored required skills through the trusted task service boundary and exposed an eligibility check.
- Changed paths: `workforce/models.py`, `workforce/skills.py`, `organization/http.py`, migration 0017, OpenAPI, `tests/test_workforce_skills.py`
- Checks: 48 backend tests on PostgreSQL and Ruff/mypy passed.
- Review: PO accepted both backend leaves. Agent checks remain in attempt 01.
- Remaining: No production catalog seeded. Required-skill persistence has no public task mutation until the task aggregate is implemented at FND-16. Scoped Technician teammate lookup is tied to an authorized current ticket team. Browser wiring belongs to INT-03.
- Commit/build: FND-14.01 implementation `d1aea79` pushed to origin/phase/b-backend.
- Next: FND-15 authorized. Full Parent closure awaits INT-03.
