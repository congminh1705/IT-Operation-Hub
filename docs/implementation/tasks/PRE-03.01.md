---
id: itoh-task-pre-03-01
title: "PRE-03.01 — Resolve KB publication, ACL and embedding contracts"
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

# PRE-03.01 — Resolve KB publication, ACL and embedding contracts

## 1. Identity and objective

- **Parent:** [PRE-03](../00-decisions.md#pre-03); Phase B, decisions/real services.
- **Module:** decisions.
- **Owner:** PO. **Status:** [execution board](../workflow/execution-board.md); the board is the single mutable registry.
- **Objective:** Specify author/publisher rights, immutable source versions, ACL revocation, chunk/model dimensions and freshness; distinguish approved decisions from proposals.
- **Trace:** AC-OPS03, AC-OPS11; AC-AI03, AC-AI07, AC-AI08; NFR22–24; D-39/40/42. (the subset mapped below).
- **Direct task prerequisites:** [FE-18.03](FE-18.03.md)
- **Mapped parent acceptance:** PRE-03 criterion 1. Parent completion requires the separate coverage and closure rules, not this task alone.
- **Rules:** [task workflow](../workflow/task-workflow.md).

## 2. Scope and expected outputs

**Included:** Specify author/publisher rights, immutable source versions, ACL revocation, chunk/model dimensions and freshness; distinguish approved decisions from proposals.

**Planned output boundaries**

- docs/decisions/design-decisions.md: only the selected decision set.
- Affected reviewed API/schema/architecture paragraphs and task evidence; no application code.

**Excluded and phase boundary:** Only the named decision/contract refinement is included. Do not create application code or invent product-owner approval.

Planned module paths are ownership hints, not assertions that files exist. Use the actual established package names and reuse predecessor interfaces; do not create empty scaffolds for these hints. Keep only the part of a listed module needed for this deliverable.

## 3. Embedded context package

| Existing source | Read only these sections / purpose | Authority |
| --- | --- | --- |
| [Parent acceptance](../00-decisions.md#pre-03) | Criteria 1 and the named objective; parent overview supplies the wider completion target | Planning |
| [decisions/design-decisions.md](../../decisions/design-decisions.md) | D-40 choices affecting this deliverable and confirmed D-29–43 within their limits | Requirement / contract / design |
| [10-ai-assistant.md](../../10-ai-assistant.md) | The named intent/source/action/provider boundary relevant to the objective | Requirement / contract / design |
| [technical/api-design.md](../../technical/api-design.md) | Named module operations, shared errors/version/idempotency and asynchronous outcome contract | Requirement / contract / design |
| [requirements/conceptual-data-model.md](../../requirements/conceptual-data-model.md) | Named module entities, lifecycle, ownership and reviewed constraints | Requirement / contract / design |
| [Dependency evidence](../workflow/execution-board.md) | Read only the named direct prerequisites' outputs/interfaces/results; their cards are linked above | Execution evidence; currently NOT RUN |
| [Parent coverage and closure](../package-task-coverage.md#pre-03) | Leaf ownership of criteria and any external frontend/integration closure | Derived planning |

Read source rules using the parent trace and the objective, not all milestone files. Use CodeGraph first for existing indexed code around `decisions Resolve KB publication, ACL and embedding contracts`. Validate current source/context at start; planned output paths are not required inputs until their producing task is done.

## 4. Preconditions

A future request authorizes the selected implementation (or this decision-refinement work), the parent is activated, one executor is assigned, named leaf dependencies are done and source context is current. Resolve the affected D-40 decision/access before its consumer; do not invent enterprise policy. Task availability does not grant provider calls, data access or deployment beyond existing authorization.

## 5. Acceptance and verification

| Observable acceptance | Required verification / expected result |
| --- | --- |
| Specify author/publisher rights, immutable source versions, ACL revocation, chunk/model dimensions and freshness; distinguish approved decisions from proposals. | Review Draft/internal/revoked sources before retrieval/provider/history despite stale index. |
| Relevant selected parent rules are preserved within this deliverable; unowned outcomes remain assigned to other leaves/closure owners. | Compare actual output and failures to criteria 1 in the parent and [coverage](../package-task-coverage.md#pre-03); no unrelated or partially completed predecessor is assumed. |
| This phase's source/transport boundary and failure semantics are enforced, with no false completion or sensitive output. | Perform source/decision consistency checks; application tests are not applicable. Record pass/fail/not-run and verify the phase exclusions above. |

**Checks to execute:** Review Draft/internal/revoked sources before retrieval/provider/history despite stale index. Use commands established by the relevant foundation task: frontend scripts in src/frontend, backend uv/check/test scripts in src/backend, or the actual documented evidence harness. Record exact commands at execution; no command/test pass is claimed in planning.

**Completion evidence:** observable result, affected source/test paths, actual check outcomes, review findings, remaining decisions and next eligible task. A service leaf may be DONE independently of later UI wiring; package-level UI acceptance is closed only by its named INT/FE owners.

## 6. Evidence and handoff

- Latest Report ID: PRE-03.01/attempt-01.
- Latest history entry: [Format version 1](../workflow/task-history.md#task-pre-03-01-attempt-01).
- Delivered: [D-40 knowledge contract](../../decisions/design-decisions.md#d-40-knowledge-access-index-pre-0301) records scoped author/publisher rights, immutable versions, live ACL checks, proposed embedding/chunk profile and freshness.
- Changed paths: docs/decisions/design-decisions.md, technical/api-design.md and workflow records.
- Checks: Synthetic Draft, revoked ACL, source-version mismatch, incompatible dimensions and eligible published case passed; verified published provider documentation. Runtime, build and provider calls not run.
- Review: Agent checked the contract. PO approval pending.
- Remaining: Named grants, model/dimension and index pilot values, real account eligibility and provider tests.
- Commit/build: Implementation 570b398 pushed and verified on origin/phase/b-backend.
- Next: PRE-03.02 awaits PO acceptance of this leaf.
