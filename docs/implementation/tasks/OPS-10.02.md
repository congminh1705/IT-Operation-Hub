---
id: itoh-task-ops-10-02
title: "OPS-10.02 — Expose deliberate draft insertion and native submission contract"
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

# OPS-10.02 — Expose deliberate draft insertion and native submission contract

## 1. Identity and objective

- **Parent:** [OPS-10](../04-operations-assistant.md#ops-10); Phase B, decisions/real services.
- **Module:** ai_assistant/drafts.
- **Owner:** PO. **Status:** [execution board](../workflow/execution-board.md); the board is the single mutable registry.
- **Objective:** Return audience-tagged drafts to existing composer without silent overwrite/internal-public conversion; final send remains native service command.
- **Trace:** US-AI04, US-AI05; AC-AI04, AC-AI05. (the subset mapped below).
- **Direct task prerequisites:** [OPS-10.01](OPS-10.01.md)
- **Mapped parent acceptance:** OPS-10 criterion 2; OPS-10 criterion 3. Parent completion requires the separate coverage and closure rules, not this task alone.
- **Rules:** [task workflow](../workflow/task-workflow.md).

## 2. Scope and expected outputs

**Included:** Return audience-tagged drafts to existing composer without silent overwrite/internal-public conversion; final send remains native service command.

**Planned output boundaries**

- src/backend/app/modules/ai_assistant/ and its public ai_assistant/drafts contracts: this task only.
- Affected Alembic migrations and domain/API/unit/integration tests.
- Existing public services/adapters may be extended narrowly; no Phase A screen rebuild.

**Excluded and phase boundary:** Implement only the named real-service/contract capability and its essential checks. Existing UI is reused; real browser wiring belongs to INT tasks. Do not perform unrelated domain work or production deployment.

Planned module paths are ownership hints, not assertions that files exist. Use the actual established package names and reuse predecessor interfaces; do not create empty scaffolds for these hints. Keep only the part of a listed module needed for this deliverable.

## 3. Embedded context package

| Existing source | Read only these sections / purpose | Authority |
| --- | --- | --- |
| [Parent acceptance](../04-operations-assistant.md#ops-10) | Criteria 2, 3 and the named objective; parent overview supplies the wider completion target | Planning |
| [ai/use-cases-stories-and-acceptance.md](../../ai/use-cases-stories-and-acceptance.md) | The linked assistant AC/TC and trusted action/audience behavior | Requirement / contract / design |
| [requirements/business-rules.md](../../requirements/business-rules.md) | Business rule paragraphs referenced by the selected parent acceptance; retain original state and transaction invariants | Requirement / contract / design |
| [ai/integration-and-non-regression.md](../../ai/integration-and-non-regression.md) | Only the named objective, trace IDs and selected parent rules | Requirement / contract / design |
| [Dependency evidence](../workflow/execution-board.md) | Read only the named direct prerequisites' outputs/interfaces/results; their cards are linked above | Execution evidence; currently NOT RUN |
| [Parent coverage and closure](../package-task-coverage.md#ops-10) | Leaf ownership of criteria and any external frontend/integration closure | Derived planning |

Read source rules using the parent trace and the objective, not all milestone files. Use CodeGraph first for existing indexed code around `ai_assistant/drafts Expose deliberate draft insertion and native submission contract`. Validate current source/context at start; planned output paths are not required inputs until their producing task is done.

## 4. Preconditions

A future request authorizes the selected implementation (or this decision-refinement work), the parent is activated, one executor is assigned, named leaf dependencies are done and source context is current. Resolve the affected D-40 decision/access before its consumer; do not invent enterprise policy. Task availability does not grant provider calls, data access or deployment beyond existing authorization.

## 5. Acceptance and verification

| Observable acceptance | Required verification / expected result |
| --- | --- |
| Return audience-tagged drafts to existing composer without silent overwrite/internal-public conversion; final send remains native service command. | Test invalid audience/handoff and existing draft preservation with contract responses. |
| Relevant selected parent rules are preserved within this deliverable; unowned outcomes remain assigned to other leaves/closure owners. | Compare actual output and failures to criteria 2, 3 in the parent and [coverage](../package-task-coverage.md#ops-10); no unrelated or partially completed predecessor is assumed. |
| This phase's source/transport boundary and failure semantics are enforced, with no false completion or sensitive output. | Use actual domain/API checks; real PostgreSQL is required for DB guarantees and fake clock for SLA. Provider mocks cover controlled branches, not A11. Record pass/fail/not-run and verify the phase exclusions above. |

**Checks to execute:** Test invalid audience/handoff and existing draft preservation with contract responses. Use commands established by the relevant foundation task: frontend scripts in src/frontend, backend uv/check/test scripts in src/backend, or the actual documented evidence harness. Record exact commands at execution; no command/test pass is claimed in planning.

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
