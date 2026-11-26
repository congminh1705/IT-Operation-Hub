---
id: itoh-task-pre-04-01
title: "PRE-04.01 — Agree deployment, ownership and measurable targets"
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

# PRE-04.01 — Agree deployment, ownership and measurable targets

## 1. Identity and objective

- **Parent:** [PRE-04](../00-decisions.md#pre-04); Phase B, decisions/real services.
- **Module:** decisions.
- **Owner:** PO. **Status:** [execution board](../workflow/execution-board.md); the board is the single mutable registry.
- **Objective:** Record environment, operations owner, alert ownership, performance/lag targets and proposed backup/RPO/RTO controls with clear decision status.
- **Trace:** NFR04, NFR11, NFR12, NFR21, NFR24; A13; D-40. (the subset mapped below).
- **Direct task prerequisites:** [FE-18.03](FE-18.03.md)
- **Mapped parent acceptance:** PRE-04 criterion 1; PRE-04 criterion 2. Parent completion requires the separate coverage and closure rules, not this task alone.
- **Rules:** [task workflow](../workflow/task-workflow.md).

## 2. Scope and expected outputs

**Included:** Record environment, operations owner, alert ownership, performance/lag targets and proposed backup/RPO/RTO controls with clear decision status.

**Planned output boundaries**

- docs/decisions/design-decisions.md: only the selected decision set.
- Affected reviewed API/schema/architecture paragraphs and task evidence; no application code.

**Excluded and phase boundary:** Only the named decision/contract refinement is included. Do not create application code or invent product-owner approval.

Planned module paths are ownership hints, not assertions that files exist. Use the actual established package names and reuse predecessor interfaces; do not create empty scaffolds for these hints. Keep only the part of a listed module needed for this deliverable.

## 3. Embedded context package

| Existing source | Read only these sections / purpose | Authority |
| --- | --- | --- |
| [Parent acceptance](../00-decisions.md#pre-04) | Criteria 1, 2 and the named objective; parent overview supplies the wider completion target | Planning |
| [decisions/design-decisions.md](../../decisions/design-decisions.md) | D-40 choices affecting this deliverable and confirmed D-29–43 within their limits | Requirement / contract / design |
| [technical/architecture.md](../../technical/architecture.md) | Transactions, model boundary, events or recovery sections actually used by this deliverable | Requirement / contract / design |
| [requirements/non-functional-requirements.md](../../requirements/non-functional-requirements.md) | Only the named objective, trace IDs and selected parent rules | Requirement / contract / design |
| [Dependency evidence](../workflow/execution-board.md) | Read only the named direct prerequisites' outputs/interfaces/results; their cards are linked above | Execution evidence; currently NOT RUN |
| [Parent coverage and closure](../package-task-coverage.md#pre-04) | Leaf ownership of criteria and any external frontend/integration closure | Derived planning |

Read source rules using the parent trace and the objective, not all milestone files. Use CodeGraph first for existing indexed code around `decisions Agree deployment, ownership and measurable targets`. Validate current source/context at start; planned output paths are not required inputs until their producing task is done.

## 4. Preconditions

A future request authorizes the selected implementation (or this decision-refinement work), the parent is activated, one executor is assigned, named leaf dependencies are done and source context is current. Resolve the affected D-40 decision/access before its consumer; do not invent enterprise policy. Task availability does not grant provider calls, data access or deployment beyond existing authorization.

## 5. Acceptance and verification

| Observable acceptance | Required verification / expected result |
| --- | --- |
| Record environment, operations owner, alert ownership, performance/lag targets and proposed backup/RPO/RTO controls with clear decision status. | Review target load, outage detection, retention/access and measurement methods. |
| Relevant selected parent rules are preserved within this deliverable; unowned outcomes remain assigned to other leaves/closure owners. | Compare actual output and failures to criteria 1, 2 in the parent and [coverage](../package-task-coverage.md#pre-04); no unrelated or partially completed predecessor is assumed. |
| This phase's source/transport boundary and failure semantics are enforced, with no false completion or sensitive output. | Perform source/decision consistency checks; application tests are not applicable. Record pass/fail/not-run and verify the phase exclusions above. |

**Checks to execute:** Review target load, outage detection, retention/access and measurement methods. Use commands established by the relevant foundation task: frontend scripts in src/frontend, backend uv/check/test scripts in src/backend, or the actual documented evidence harness. Record exact commands at execution; no command/test pass is claimed in planning.

**Completion evidence:** observable result, affected source/test paths, actual check outcomes, review findings, remaining decisions and next eligible task. A service leaf may be DONE independently of later UI wiring; package-level UI acceptance is closed only by its named INT/FE owners.

## 6. Evidence and handoff

- Latest Report ID: PRE-04.01/attempt-02.
- Latest history entry: [Format version 1](../workflow/task-history.md#task-pre-04-01-attempt-02).
- Delivered: Environment separation, operations/alert ownership, measured load and lag, protected backup and explicit RPO/RTO proposals. [D-40 operations proposal](../../decisions/design-decisions.md#d-40-deployment-recovery-pre-0401)
- Changed paths: docs/decisions/design-decisions.md, docs/technical/architecture.md and workflow records.
- Checks: Source review and synthetic RPO/RTO, alert and coherent-backup walkthroughs passed. No deployment or restore run.
- Review: PO approved pilot targets. Agent verification remains in attempt 01.
- Remaining: Name operator and backup, confirm production environment, and supply operational inputs before use.
- Commit/build: Implementation 35afca7 pushed and verified on origin/phase/b-backend.
- Next: PRE-04.02 is authorized after PO acceptance.
