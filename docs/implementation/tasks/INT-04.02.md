---
id: itoh-task-int-04-02
title: "INT-04.02 — Connect atomic issue, return and state outcomes"
type: planning
domain: development
module: delivery
tags: [tasks, planning, implementation]
priority: 1
status: planned
owner: PO
approval: needs-review
updated: 2026-11-10
authority: derived
purpose: "Define one bounded deliverable with explicit context, dependencies, ownership and verification."
---

# INT-04.02 — Connect atomic issue, return and state outcomes

## 1. Identity and objective

- **Parent:** [INT-04](../07-integration.md#int-04); Phase C, real integration.
- **Module:** assets.
- **Owner:** PO. **Status:** [execution board](../workflow/execution-board.md); the board is the single mutable registry.
- **Objective:** Wire lifecycle dialogs to real expected-version commands, refresh source history and honor reservation/holder conflict responses without fixture fallback.
- **Trace:** FE-12; US35–40; US13 asset link. (the subset mapped below).
- **Direct task prerequisites:** [INT-04.01](INT-04.01.md)
- **Mapped parent acceptance:** INT-04 criterion 2; INT-04 criterion 3. Parent completion requires the separate coverage and closure rules, not this task alone.
- **Rules:** [task workflow](../workflow/task-workflow.md).

**Design constraint:** preserve [v1.3 / D-51](../../design/implementation-scope.md#acceptance-boundary) on affected UI. This task retains its existing adapter/check objective; it does not add a redesign or unowned frontend features.

**Final HTML reference:** [`06-knowledge-assets.html#asset`](../../design/final/06-knowledge-assets.html#asset). Open only the affected task-owned surfaces when exercising UI; service/build/operations-only work uses this as context, not a new UI deliverable.

> **Approved format v1.3 / D-51:** Read [current visual standard](../../design/approved-format.md) before UI work. All post-login screens use the Mac/Teal dashboard format; only coordination uses the Night City panel; login stays D-47. Named final HTML/SVG references below now provide the current v1.3 business layout/state and appearance; login is retained unchanged. Apply only this task scope and capture actual conformance evidence. Completed foundation tasks are not retroactively reclassified as UI implementation.

## 2. Scope and expected outputs

**Included:** Wire lifecycle dialogs to real expected-version commands, refresh source history and honor reservation/holder conflict responses without fixture fallback.

**Planned output boundaries**

- src/frontend/src/lib/api and affected assets feature hooks/forms: real adapter wiring.
- Affected backend DTO/operation projection only if a real contract discrepancy is observed.
- Integration checks for the named flow and this task handoff; reuse Phase A components.

**Excluded and phase boundary:** Connect only the named real flow and narrowly fix observed contract mismatches; do not rebuild screens or silently load mock data in real mode.

Planned module paths are ownership hints, not assertions that files exist. Use the actual established package names and reuse predecessor interfaces; do not create empty scaffolds for these hints. Keep only the part of a listed module needed for this deliverable.

## 3. Embedded context package

| Existing source | Read only these sections / purpose | Authority |
| --- | --- | --- |
| [Parent acceptance](../07-integration.md#int-04) | Criteria 2, 3 and the named objective; parent overview supplies the wider completion target | Planning |
| [technical/api-design.md](../../technical/api-design.md) | Named module operations, shared errors/version/idempotency and asynchronous outcome contract | Requirement / contract / design |
| [requirements/permissions-matrix.md](../../requirements/permissions-matrix.md) | Current role/record/audience rules for the named module and mid-session changes | Requirement / contract / design |
| [06-acceptance-criteria.md](../../06-acceptance-criteria.md) | Only the linked parent trace AC/TC and applicable cross-cutting cases | Requirement / contract / design |
| [Dependency evidence](../workflow/execution-board.md) | Read only the named direct prerequisites' outputs/interfaces/results; their cards are linked above | Execution evidence; currently NOT RUN |
| [Parent coverage and closure](../package-task-coverage.md#int-04) | Leaf ownership of criteria and any external frontend/integration closure | Derived planning |

Read source rules using the parent trace and the objective, not all milestone files. Use CodeGraph first for existing indexed code around `assets Connect atomic issue, return and state outcomes`. Validate current source/context at start; planned output paths are not required inputs until their producing task is done.

## 4. Preconditions

A future request authorizes the selected implementation (or this decision-refinement work), the parent is activated, one executor is assigned, named leaf dependencies are done and source context is current. Resolve the affected D-40 decision/access before its consumer; do not invent enterprise policy. Task availability does not grant provider calls, data access or deployment beyond existing authorization.

## 5. Acceptance and verification

| Observable acceptance | Required verification / expected result |
| --- | --- |
| Wire lifecycle dialogs to real expected-version commands, refresh source history and honor reservation/holder conflict responses without fixture fallback. | Run competing issue/repeated return/retire guard and preserved form conflict browser tests. |
| Relevant selected parent rules are preserved within this deliverable; unowned outcomes remain assigned to other leaves/closure owners. | Compare actual output and failures to criteria 2, 3 in the parent and [coverage](../package-task-coverage.md#int-04); no unrelated or partially completed predecessor is assumed. |
| This phase's source/transport boundary and failure semantics are enforced, with no false completion or sensitive output. | Run real API plus targeted browser flows against the reviewed backend; fixtures cannot replace real effects. Record pass/fail/not-run and verify the phase exclusions above. |

**Checks to execute:** Run competing issue/repeated return/retire guard and preserved form conflict browser tests. Use commands established by the relevant foundation task: frontend scripts in src/frontend, backend uv/check/test scripts in src/backend, or the actual documented evidence harness. Record exact commands at execution; no command/test pass is claimed in planning.

**Completion evidence:** observable result, affected source/test paths, actual check outcomes, review findings, remaining decisions and next eligible task. A service leaf may be DONE independently of later UI wiring; package-level UI acceptance is closed only by its named INT/FE owners.

## 6. Evidence and handoff

**Planning state:** no implementation attempt/report, application test, review, commit or build evidence exists for this task. Application checks are **NOT RUN**. Replace this planning statement with actual evidence when work occurs.

**Report contract:** after every actual attempt or session handoff, append a report to [task history](../workflow/task-history.md#reports) using [Format version 1](../workflow/task-history.md#entry-format), preserving its ten subsections and tables. Apply the [report validation checklist](../workflow/task-history.md#report-validation-before-handoff), then update this section with the latest report and current summary. A report may end in blocked/review/in-progress; it does not imply DONE.

- Latest Report ID: none; no implementation attempt yet.
- Latest history entry: none; add the exact existing report anchor after actual work.
- Delivered result / incomplete scope:
- Actual changed paths / key symbols:
- Acceptance and check summary: pass/fail/not-run; link full expected/actual results and exact commands in the report.
- Review type / findings / resolution:
- Remaining blockers / decisions / defects:
- Commit/build if available:
- Next eligible task / resume step:

Keep sections 1-5 unchanged unless a justified authorized refinement is recorded. Update this handoff after every attempt, including unfinished/blocked work; retain earlier attempt reports in history. Synchronize the execution-board state/owner and current-context latest summary/history link. Do not duplicate report bodies in the board, invent evidence or mark unrelated parent/system gates passed.

> **Semantic UI states:** Follow the mandatory state-color mapping in [approved format](../../design/approved-format.md): active blue, ready/done green, waiting amber, blocked/error/overdue rose, locked/disabled gray. Use business enums and visible labels; capture task-owned evidence against the current final HTML.

> **PO-approved presentation refinements:** The current [approved format](../../design/approved-format.md) and final HTML include bright KPI frames/labels, unified toolbar/sidebar/account block with a default avatar, readable teal actions, and state-driven steppers (done green / awaiting approval amber / future gray). Assignment lock in an awaiting-approval proposal is amber; generic disabled/locked controls remain gray. Apply only the elements owned by this task. This refines appearance, not functional scope or dependencies.
