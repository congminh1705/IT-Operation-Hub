---
id: itoh-task-fnd-03-01
title: "FND-03.01 — Review real API projections against frontend transport"
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

# FND-03.01 — Review real API projections against frontend transport

## 1. Identity and objective

- **Parent:** [FND-03](../01-foundation.md#fnd-03); Phase B, decisions/real services.
- **Module:** api-contracts.
- **Owner:** PO. **Status:** [execution board](../workflow/execution-board.md); the board is the single mutable registry.
- **Objective:** Reconcile Phase A typed gateway with reviewed HTTP DTOs, errors and cookie/CSRF contract; define a generation/drift workflow from draft and later runtime OpenAPI.
- **Trace:** AC-X02–07, AC-X10; NFR07–10, NFR16–17. (the subset mapped below).
- **Direct task prerequisites:** [FND-01.02](FND-01.02.md)
- **Mapped parent acceptance:** FND-03 criterion 1. Parent completion requires the separate coverage and closure rules, not this task alone.
- **Rules:** [task workflow](../workflow/task-workflow.md).

## 2. Scope and expected outputs

**Included:** Reconcile Phase A typed gateway with reviewed HTTP DTOs, errors and cookie/CSRF contract; define a generation/drift workflow from draft and later runtime OpenAPI.

**Planned output boundaries**

- src/frontend/src/lib/api: reviewed real-transport/DTO boundary and query integration hooks.
- Reviewed API/type generation workflow and contract tests; no new feature screens.

**Excluded and phase boundary:** Implement only the named real-service/contract capability and its essential checks. Existing UI is reused; real browser wiring belongs to INT tasks. Do not perform unrelated domain work or production deployment.

Planned module paths are ownership hints, not assertions that files exist. Use the actual established package names and reuse predecessor interfaces; do not create empty scaffolds for these hints. Keep only the part of a listed module needed for this deliverable.

## 3. Embedded context package

| Existing source | Read only these sections / purpose | Authority |
| --- | --- | --- |
| [Parent acceptance](../01-foundation.md#fnd-03) | Criteria 1 and the named objective; parent overview supplies the wider completion target | Planning |
| [07-uiux-specification.md](../../07-uiux-specification.md) | The named screen/interaction and its validation/conflict/responsive behavior | Requirement / contract / design |
| [design/design-system.md](../../design/design-system.md) | Reusable components, visual tokens and accessibility for changed UI | Requirement / contract / design |
| [04-information-architecture.md](../../04-information-architecture.md) | Only the named objective, trace IDs and selected parent rules | Requirement / contract / design |
| [technical/api-design.md](../../technical/api-design.md) | Named module operations, shared errors/version/idempotency and asynchronous outcome contract | Requirement / contract / design |
| [Dependency evidence](../workflow/execution-board.md) | Read only the named direct prerequisites' outputs/interfaces/results; their cards are linked above | Execution evidence; currently NOT RUN |
| [Parent coverage and closure](../package-task-coverage.md#fnd-03) | Leaf ownership of criteria and any external frontend/integration closure | Derived planning |

Read source rules using the parent trace and the objective, not all milestone files. Use CodeGraph first for existing indexed code around `api-contracts Review real API projections against frontend transport`. Validate current source/context at start; planned output paths are not required inputs until their producing task is done.

## 4. Preconditions

A future request authorizes the selected implementation (or this decision-refinement work), the parent is activated, one executor is assigned, named leaf dependencies are done and source context is current. Resolve the affected D-40 decision/access before its consumer; do not invent enterprise policy. Task availability does not grant provider calls, data access or deployment beyond existing authorization.

## 5. Acceptance and verification

| Observable acceptance | Required verification / expected result |
| --- | --- |
| Reconcile Phase A typed gateway with reviewed HTTP DTOs, errors and cookie/CSRF contract; define a generation/drift workflow from draft and later runtime OpenAPI. | Typecheck reviewed schema mapping and confirm public/internal fields are not widened; no screen rebuild. |
| Relevant selected parent rules are preserved within this deliverable; unowned outcomes remain assigned to other leaves/closure owners. | Compare actual output and failures to criteria 1 in the parent and [coverage](../package-task-coverage.md#fnd-03); no unrelated or partially completed predecessor is assumed. |
| This phase's source/transport boundary and failure semantics are enforced, with no false completion or sensitive output. | Use actual domain/API checks; real PostgreSQL is required for DB guarantees and fake clock for SLA. Provider mocks cover controlled branches, not A11. Record pass/fail/not-run and verify the phase exclusions above. |

**Checks to execute:** Typecheck reviewed schema mapping and confirm public/internal fields are not widened; no screen rebuild. Use commands established by the relevant foundation task: frontend scripts in src/frontend, backend uv/check/test scripts in src/backend, or the actual documented evidence harness. Record exact commands at execution; no command/test pass is claimed in planning.

**Completion evidence:** observable result, affected source/test paths, actual check outcomes, review findings, remaining decisions and next eligible task. A service leaf may be DONE independently of later UI wiring; package-level UI acceptance is closed only by its named INT/FE owners.

## 6. Evidence and handoff

- Latest Report ID: FND-03.01/attempt-01.
- Latest history entry: [Format version 1](../workflow/task-history.md#task-fnd-03-01-attempt-01).
- Delivered result: Generated eight OpenAPI operations' frontend DTO boundary, isolated account HTTP adapter and scoped read integration. Includes cookie/CSRF, error and version semantics and public/internal ticket type separation.
- Actual changed paths / key symbols: `docs/api/generate_frontend_contract.py`, `docs/api/test_frontend_contract.py`, `docs/api/README.md` and `src/frontend/src/lib/api` (`contract.generated.ts`, `http-account.ts`, `http-account.test.ts`, `projections.ts`, `types.ts`, `gateway.ts`).
- Acceptance and check summary: Pass for draft drift check, all five comparison tests, TypeScript, lint, scoped formatting, all 128 frontend tests (14 new), and the production build. FastAPI runtime OpenAPI comparison and real browser/server integration were not run because the selected service routes are not implemented.
- Review type / findings / resolution: Agent verified the selected contract. PO review pending. Login accepts the proposed 401 if returned. Profile sends only display_name and expectedVersion while contact_phone remains a draft field.
- Remaining blockers / decisions / defects: Runtime account/ticket routes, the final D-40 wire decisions and INT-01 real session and scope verification remain with their respective owners.
- Commit/build: Production build passed. Implementation 265c85a pushed to phase/b-backend and verified on origin.
- Next eligible task / resume step: PO reviews FND-03.01. FND-03.02 remains pending until prerequisite completion and separate authorization.
