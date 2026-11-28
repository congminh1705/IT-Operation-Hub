---
id: itoh-task-fnd-06-02
title: "FND-06.02 — Implement secure provisioning result and audit contract"
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

# FND-06.02 — Implement secure provisioning result and audit contract

## 1. Identity and objective

- **Parent:** [FND-06](../01-foundation.md#fnd-06); Phase B, decisions/real services.
- **Module:** users.
- **Owner:** PO. **Status:** [execution board](../workflow/execution-board.md); the board is the single mutable registry.
- **Objective:** Keep password handover outside ticket/API/audit and expose only permitted account result/reference fields; reuse native frontend form through INT-01.
- **Trace:** US05; AC05; D-29. (the subset mapped below).
- **Direct task prerequisites:** [FND-06.01](FND-06.01.md)
- **Mapped parent acceptance:** FND-06 criterion 3. Parent completion requires the separate coverage and closure rules, not this task alone.
- **Rules:** [task workflow](../workflow/task-workflow.md).

## 2. Scope and expected outputs

**Included:** Keep password handover outside ticket/API/audit and expose only permitted account result/reference fields; reuse native frontend form through INT-01.

**Planned output boundaries**

- src/backend/app/modules/users/ and its public users contracts: this task only.
- Affected Alembic migrations and domain/API/unit/integration tests.
- Existing public services/adapters may be extended narrowly; no Phase A screen rebuild.

**Excluded and phase boundary:** Implement only the named real-service/contract capability and its essential checks. Existing UI is reused; real browser wiring belongs to INT tasks. Do not perform unrelated domain work or production deployment.

Planned module paths are ownership hints, not assertions that files exist. Use the actual established package names and reuse predecessor interfaces; do not create empty scaffolds for these hints. Keep only the part of a listed module needed for this deliverable.

## 3. Embedded context package

| Existing source | Read only these sections / purpose | Authority |
| --- | --- | --- |
| [Parent acceptance](../01-foundation.md#fnd-06) | Criteria 3 and the named objective; parent overview supplies the wider completion target | Planning |
| [requirements/account-provisioning.md](../../requirements/account-provisioning.md) | D-29 verification/handover actor and secure account result | Requirement / contract / design |
| [requirements/permissions-matrix.md](../../requirements/permissions-matrix.md) | Current role/record/audience rules for the named module and mid-session changes | Requirement / contract / design |
| [requirements/business-rules.md](../../requirements/business-rules.md) | Business rule paragraphs referenced by the selected parent acceptance; retain original state and transaction invariants | Requirement / contract / design |
| [06-acceptance-criteria.md](../../06-acceptance-criteria.md) | Only the linked parent trace AC/TC and applicable cross-cutting cases | Requirement / contract / design |
| [Dependency evidence](../workflow/execution-board.md) | Read only the named direct prerequisites' outputs/interfaces/results; their cards are linked above | Execution evidence; currently NOT RUN |
| [Parent coverage and closure](../package-task-coverage.md#fnd-06) | Leaf ownership of criteria and any external frontend/integration closure | Derived planning |

Read source rules using the parent trace and the objective, not all milestone files. Use CodeGraph first for existing indexed code around `users Implement secure provisioning result and audit contract`. Validate current source/context at start; planned output paths are not required inputs until their producing task is done.

## 4. Preconditions

A future request authorizes the selected implementation (or this decision-refinement work), the parent is activated, one executor is assigned, named leaf dependencies are done and source context is current. Resolve the affected D-40 decision/access before its consumer; do not invent enterprise policy. Task availability does not grant provider calls, data access or deployment beyond existing authorization.

## 5. Acceptance and verification

| Observable acceptance | Required verification / expected result |
| --- | --- |
| Keep password handover outside ticket/API/audit and expose only permitted account result/reference fields; reuse native frontend form through INT-01. | Inspect API/log/audit payloads for credential leakage and deny all non-Admin provisioning calls. |
| Relevant selected parent rules are preserved within this deliverable; unowned outcomes remain assigned to other leaves/closure owners. | Compare actual output and failures to criteria 3 in the parent and [coverage](../package-task-coverage.md#fnd-06); no unrelated or partially completed predecessor is assumed. |
| This phase's source/transport boundary and failure semantics are enforced, with no false completion or sensitive output. | Use actual domain/API checks; real PostgreSQL is required for DB guarantees and fake clock for SLA. Provider mocks cover controlled branches, not A11. Record pass/fail/not-run and verify the phase exclusions above. |

**Checks to execute:** Inspect API/log/audit payloads for credential leakage and deny all non-Admin provisioning calls. Use commands established by the relevant foundation task: frontend scripts in src/frontend, backend uv/check/test scripts in src/backend, or the actual documented evidence harness. Record exact commands at execution; no command/test pass is claimed in planning.

**Completion evidence:** observable result, affected source/test paths, actual check outcomes, review findings, remaining decisions and next eligible task. A service leaf may be DONE independently of later UI wiring; package-level UI acceptance is closed only by its named INT/FE owners.

## 6. Evidence and handoff

- Latest Report ID: FND-06.02/attempt-05 (PO accepted fresh technical verification).
- Latest history entry: [Format version 1](../workflow/task-history.md#task-fnd-06-02-attempt-05).
- Delivered: Explicit allowlisted provisioning result, Admin authorization before credential parsing, sanitized validation, safe verification/approval audit references and SQLAlchemy parameter hiding.
- Changed paths: users/provisioning.py, organization/http.py, database/event helpers, OpenAPI and API tests.
- Checks: 28 PostgreSQL tests, Ruff, mypy and five OpenAPI drift tests passed. Captured logs omit password/verifier. Injected audit failure rolls back user, proof and idempotency key.
- Review: PO accepted the implementation and, on 2026-11-28, accepted the fresh technical verification from attempt 04. Live D-29 handover remains unverified.
- Remaining: Live D-29 verification source, approved IT-role approver and enterprise handover channel. INT-01 integration is accepted with synthetic verification. The 2026-11-28 isolated reruns passed: 3 Admin browser cases, 9 auth/lifecycle browser cases and 60 backend tests. Local PostgreSQL connectivity recovered with WSL kept active; see attempt 04.
- Commit/build: Implementation 4075c43 pushed and verified on origin/phase/b-backend.
- Next: Collect live D-29 verification and handover evidence for Parent closure. INT-01 is already accepted; no subsequent task started in this follow-up.


**Parent closure (2026-11-28):** FND-06 is EPIC_DONE under the PO-approved pre-user synthetic-data acceptance basis. INT-01 is done and the fresh technical checks were accepted. Earlier live-evidence blockers above are deferred to real-user rollout; they are not claimed as executed. Full D-29 business journey remains QA-04.01. See [closure report](../workflow/task-history.md#parent-fnd-06-closure-2026-11-28).
