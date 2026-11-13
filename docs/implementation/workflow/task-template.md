---
id: itoh-task-template
title: "Executable task template"
type: planning
domain: development
module: delivery
tags: [tasks, planning, frontend]
priority: 1
status: planned
owner: PO
approval: needs-review
updated: 2026-11-13
authority: derived
purpose: "Provide a compact project-specific SDLC Kit task and embedded context template."
---
> **Current visual standard:** [v1.3 / D-51](../../design/approved-format.md) overrides older D-47 post-login colors/type: Mac/Teal globally, Night City coordination panel only, original login preserved. Read this with the task-specific business layout/state references; do not implement the old Graphite palette.


# Executable task template

Use this template only to refine a selected ready package. Replace placeholders with real scope and valid paths before registration; unassigned execution ownership is allowed only while pending. Do not generate files/commands/evidence merely because the template names them.

## Frontend baseline scope

For UI work, use [approved v1.3 / D-51](../../design/approval.md) and only the selected task row in the [design scope map](../../design/implementation-scope.md#task-map). Respect its explicit source/owner; no adjacent feature or visual redesign is authorized. The login scene belongs to FE-03.01. Report actual design conformance with the task's existing evidence format; do not copy documentation browser checks as application results. Integration preserves the approved frontend while replacing adapters.

## 1. Identity and objective

- Task ID: parent ID plus stable child number, such as FE-04.01.
- Parent / phase / batch: explicit package link, Phase A/B/C/D and batch if applicable.
- Owner: PO. Status: execution-board row. AI Agents support implementation; no Executor column is maintained.
- Objective: one measurable deliverable.
- Trace: existing US/AC/BR/NFR/API/SCR/D IDs relevant to this output.

## 2. Scope and expected outputs

- Included: the exact behavior to implement.
- Excluded: adjacent behavior owned elsewhere.
- Planned paths/outputs: repository-relative file/module boundaries; no blanket whole-repo scope.
- Dependency task IDs: exact required outputs; use none only when there is no dependency.

### Approved HTML reference — mandatory

Replace the fields below with direct links before registering a UI task. Do not leave only a catalog link when a specific screen exists.

| Reference field | Required task-specific value |
| --- | --- |
| Approved baseline | v1.3 / D-51; link approved-format.md and approval and this task's scope-map row |
| Final HTML | Exact existing `docs/design/final/<file>.html#<screen>` or role query, with a clickable relative link |
| Owned surface | Specific page/component/state and role; reference links do not add adjacent deliverables |
| Supporting source | Only relevant CSS/JS/SVG/assets needed to reproduce that surface |
| Required states | Task-owned initial, hover/focus, loading/error/empty and interaction states; identify absent specimens explicitly |
| Comparison cases | Applicable matching viewport/role/state pairs; desktop/mobile and 200% reflow as relevant |
| Evidence destination | `docs/implementation/evidence/<TASK_ID>/`, populated only by actual work |

Open the named HTML in a browser before building the UI. Reproduce its layout, hierarchy, spacing, typography, colors, borders, icons and relevant interactions; do not substitute a generic template inferred from prose. Business rules and permissions still govern behavior. If a required state lacks a specimen, use the closest approved pattern and report the gap rather than omitting behavior or claiming visual approval.

For a scaffold/transport/helper task with no owned visual output, state **Visual comparison: N/A — specific reason**. References are context only; do not add screens or manufacture captures to satisfy the template.

## 3. Embedded context package

| Source path | Section / purpose | Authority |
| --- | --- | --- |
| Existing repository-relative source | Exact rules needed for this deliverable | Requirement/contract/design/decision |
| Relevant predecessor evidence | Created artifact/current behavior | Implementation evidence |

Record any missing/stale context and the condition that resolves it. Include a focused CodeGraph query hint for existing code; planned paths are output expectations, not evidence of existing source.

## 4. Preconditions

Coding is requested for this work, the parent is active, Owner is PO, required leaf dependencies are done, required context is valid and any affected blocking decision/access is resolved.

## 5. Acceptance and verification

| Observable acceptance | How to verify | Expected result |
| --- | --- | --- |
| One concrete behavior/output | Meaningful check/steps | Specific pass condition |
| Owned UI matches the named approved HTML surfaces | Open reference and running app at matching viewport/role/state; inspect relevant interactions and capture reference/actual pairs | Actual comparison links, explicit remaining differences and no unsupported visual-conformance claim |
| Visual review is accurately recorded | Submit actual comparisons to Hoang Cong Minh; record his verdict or pending review | Pending review/material differences remain explicit; agent self-check is not owner approval |

List automated commands when they exist or define required scripts in the relevant foundation task. State manual steps and expected artifacts. Keep important failure cases with the behavior.

The two visual rows apply only to owned UI changes. For nonvisual-only work, replace them with the justified N/A record. Design-document screenshots/checks cannot substitute for running-application evidence.

## 6. Evidence and handoff

- Latest Report ID: none until actual work, then the task/attempt ID from Format version 1.
- Latest history entry: none until actual work, then a link to its exact stable anchor.
- Actual changed files / key symbols:
- AC results and check commands: pass/fail/not-run, expected versus actual:
- Review scope / findings:
- Design baseline / exact final HTML URLs compared: none until actual work, or justified N/A.
- Reference/actual capture links, viewport/role/state and remaining visual differences: none until actual work.
- Owner visual review: NOT REQUESTED until actual handoff, then pending/approved/changes requested with actual verdict; use justified N/A for nonvisual-only work.
- Remaining blockers / decisions:
- Git delivery: phase branch, implementation commit/link, pushed SHA/result and remote verification; follow task-workflow.md. Record failures or not-run reasons separately from task acceptance.
- Commit/build if available:
- Consolidated history entry: link the exact task/attempt anchor in [task-history.md](task-history.md#reports).
- Next eligible task:

After every actual task attempt or session handoff, append its report using task-history Format version 1 and its validation checklist, update this section's latest report/result/check/gap/resume fields and link the entry from current context. Preserve earlier attempt reports and the task specification. Pending records explicitly say implementation and application checks are NOT RUN. Close only with acceptance and required verification evidence; never claim independent review without an actual independent reviewer.

Link visual evidence from the existing history report's relevant acceptance/check/review sections; do not add or rename the ten Format version 1 headings. Update current-context with the latest report link and visual-review gap. Keep execution-board for state/owner/dependencies, without duplicating report bodies there.

Parent delivery: one PR per completed Parent, using the title/description in task-workflow.md. Link the real PR and remind PO to merge before starting another Parent on the shared phase branch. No automatic merge.

Mandatory delivery handoff: task commit/push and remote SHA; Parent child/acceptance closure; existing or newly created Parent PR URL and actual state; PO merge reminder while open; next task blocked from mixing a new Parent until verified merge. At phase exit, record all Parent PR merges and actual exit checks. Apply in every phase, including non-FE work.


PR publication rule: publish one Parent PR with the required title/description directly on GitHub. Do not save per-Parent PR .md files or create a pull-requests folder. Temporary body files belong outside the repo and must be removed after use. Record the PR link/status in existing task/history/current-context records and remind PO to merge.
