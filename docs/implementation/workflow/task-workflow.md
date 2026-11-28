---
id: itoh-task-workflow
title: "Task decomposition and execution contract"
type: planning
domain: development
module: delivery
tags: [tasks, planning, frontend]
priority: 1
status: planned
owner: PO
approval: needs-review
updated: 2026-11-13
authority: primary
purpose: "Define the confirmed project adaptation of the SDLC Kit task and context model."
---
> **Current visual standard:** [v1.3 / D-51](../../design/approved-format.md) overrides older D-47 post-login colors/type: Mac/Teal globally, Night City coordination panel only, original login preserved. Read this with the task-specific business layout/state references; do not implement the old Graphite palette.


# Task decomposition and execution contract

## Frontend baseline scope

For UI work, use [approved v1.3 / D-51](../../design/approval.md) and only the selected task row in the [design scope map](../../design/implementation-scope.md#task-map). Respect its explicit source/owner; no adjacent feature or visual redesign is authorized. The login scene belongs to FE-03.01. Report actual design conformance with the task's existing evidence format; do not copy documentation browser checks as application results. Integration preserves the approved frontend while replacing adapters.

## 1. Confirmed delivery order and hierarchy

**Hoang Cong Minh is the Project owner** ([authority record](../../README.md#3-authority-and-status)); every task Owner is PO. AI Agents support implementation and verification. The execution board has no Executor column; Owner remains PO throughout execution. Address owner decisions and final reports to Hoang Cong Minh. This identifies the existing decision-maker without adding another approval step or changing application permissions.

The project owner confirmed this planning method on 10 November 2026: **Phase A frontend first**, using synthetic DEMO data and complete interactions; **Phase B backend/API**, **Phase C real integration**, then **Phase D whole-system acceptance**. This confirmation authorizes documentation/refinement, not application implementation. A later coding request activates its named ready work without another routine approval question.

Hierarchy: **Project roadmap → Phase → delivery batch/milestone → work package (epic-level) → executable task**. M1–M5 remain the original system capability/acceptance milestones; frontend batches A1–A4 express delivery order, not a second competing scope. Keep the existing 67 story IDs and 88 package IDs. The 88 packages are scope coverage, not 88 uniformly sized coding sessions.

A package such as FE-04 contains several independent user flows. At the owner's explicit request recorded in D-44, **all 88 packages are now expanded into 230 executable tasks**. Children use stable IDs such as FE-01.01 and retain parent trace. Refresh the selected task's context and assumptions at execution; further split only when implementation evidence warrants it. No speculative sprint dates or effort promises are assigned.

## 2. Rules for a useful executable task

A task has one observable deliverable, PO ownership and AI Agent support, explicit dependencies, bounded authoritative context, expected paths/outputs and verification. Prefer a coherent user interaction or reusable technical capability. Meaningful authorization/error/accessibility checks stay with that behavior rather than becoming a distant cleanup task.

Split when separate outcomes can be accepted independently, the task spans unrelated domains/screens, or it needs different decisions/context. Keep tightly coupled UI/transport/error handling together when splitting would leave an unusable result. File count, lines of code, elapsed time and token count alone are not sizing rules. A task should normally be finishable and verifiable within one focused coding session; if this proves false, refine it before continuing and preserve completed evidence.

Do not split into artificial “write code” and “write its essential tests” tasks. Separate review/QA tasks only where they verify genuinely integrated or independent outcomes. Do not treat every component as a task or manufacture empty scaffolds to fit a task tree.

Package dependency links are planning relationships. After expansion, task-to-task edges are the executable prerequisites; depend on the exact child artifact required, not an unfinished whole package unnecessarily. Validate the expanded graph and preserve the intended dependency. Parent completion still requires every child and parent outcome. Add dependencies explicitly when a new artifact is needed; never rely on “mostly done” predecessor status.

## 3. Readiness and lifecycle

Work packages use **EPIC_PROPOSED | EPIC_READY | EPIC_IN_PROGRESS | EPIC_BLOCKED | EPIC_DONE | EPIC_CANCELLED**. The package registry is [README section 4](../README.md#4-task-tracker). All 88 packages are EPIC_READY at the bounded-specification level because leaf scope, dependencies, context and coverage are defined; none is active. Readiness does not satisfy task dependencies, resolve open D-40 decisions or authorize implementation/provider/deployment actions.

An EPIC_READY package has bounded scope, acceptance, dependencies, source trace, a planning owner and validated leaf task records. Implementation authorization is separate from specification readiness. Before starting a leaf, retain Owner as PO, activate its parent, confirm the current coding request, validate current context and ensure its actual task prerequisites and affected business decisions are satisfied.

Task statuses use only **pending | in-progress | blocked | review | done | cancelled**. [Execution board](execution-board.md) is their single status/owner source; task cards link it instead of duplicating status. Document frontmatter `status: planned` describes the document, not task execution state.

| Transition | Required evidence |
| --- | --- |
| pending → in-progress | User-authorized coding scope, PO ownership, active parent, fresh required context and completed leaf dependencies |
| in-progress → review | Scoped output, AC-by-AC actual result and relevant check evidence |
| review → done | Required review/checks pass; every acceptance criterion met; evidence and handoff current |
| in-progress/review → blocked | Specific missing decision/access/dependency and affected scope recorded in the task evidence |
| blocked → in-progress | Blocking condition verified resolved; dependencies/context refreshed |
| review → in-progress | Findings require changes; preserve earlier result and list the remaining fixes |
| pending/in-progress/blocked/review → cancelled | Project-owner direction or an explicitly authorized superseding task, with rationale and retained history |

A self-review is labeled self-review; never claim independent review without a different reviewer. The method does not automatically request subagents, new approval layers or a separate reviewer for every low-impact change. Apply required independent review where the user or task scope actually requires it.

## 4. Minimum context package

Each leaf card embeds a compact context package: path, relevant section, purpose/authority, current dependencies and CodeGraph query hint. Keep authoritative rules in source documents; links and section names select what to read. Do not copy the whole specification into every task or load all package files every session.

The 00–07 group files retain only goal/scope/trace, numbered completion criteria, child links and handoff. They do not duplicate per-task source-reading lists, edit boundaries, check commands or evidence. Their numbered criteria remain stable inputs to the package-to-task coverage matrix; update that mapping if a group outcome changes.

At task start validate that required source paths exist and the cited rules still apply. Use CodeGraph first for indexed application code, then read only specifically missing/stale details. The suggested query is a lookup hint, not a promise that those symbols already exist. Planned output paths are not required context files until their prerequisite task creates them.

Follow each task's actual contract; don't impose a repository-wide fixed reading order. Reference-only SDLC Kit files do not become this project's runtime policy. Larger source changes invalidate affected task context and require a targeted refresh before execution.

## 5. Frontend-first boundaries and handoff

Phase A modifies frontend/task-scoped documentation and uses explicit synthetic fixtures. Implement mock transport, identity/scope projections, controlled failure/conflict outcomes and interactive native forms. No backend/API/DB/workers/live provider setup is required for an FE task. Mock authorization is UX simulation, not proof of server rights.

Keep one typed adapter boundary. Phase B implements real services against reviewed contracts and reuses Phase A UI. Phase C replaces adapters and verifies real effects; no silent fixture fallback in real mode. Phase D verifies whole-system AC/A1–A13, including real PostgreSQL and live-model evidence where required.

For every B package, the service leaf's DONE means its service outcomes passed; an INT leaf owns real wiring. [Package coverage and closure](../package-task-coverage.md) names those external acceptance owners. They gate package completion, not production of the service output. The acyclic leaf graph therefore never requires a service task to wait for its own future integration. All non-frontend task paths descend from Phase A exit FE-18.03; this is the explicit frontend-first gate.

## 6. Evidence, resuming and completion

Each task owns one short Evidence and handoff section. Record its current changed paths/key symbols, acceptance/check outcomes, remaining gaps and a link to the exact report in [task-history.md](task-history.md#reports). The history file is the consolidated chronological report ledger for all tasks: append one entry after each actual implementation attempt/session handoff, including unfinished, blocked or review outcomes. Record actual timestamp/executor, expected/actual acceptance and check results, review findings, remaining blockers, commit/build only if available and next step. Preserve prior entries; resumed work or corrections append linked new entries. Link large logs/artifacts rather than pasting them. A planning task does not require a Git commit to manufacture evidence.

On completion update the execution board and the derived [current context](current-context.md). At resume read the active task and relevant predecessor handoff, not the whole repository. Current context is an index; task evidence and authoritative requirements win if it is stale.

History entries use **Format version 1** exactly, including its ten headings, fields and result tables; apply the report-validation checklist before handoff. After every attempt also update the small task file's section 6 with the latest Report ID/link and current result/check/gap/resume summary. Keep task sections 1–5 stable unless an actual authorized refinement is recorded. A history entry alone does not substitute for updating the task handoff, task row and current-context pointer.

After every implementation attempt, update the owner-facing **latest summary in current context** and link the exact history entry. The execution board remains the task state/owner/dependency registry and must not contain a duplicate report. The compact summary includes Task ID/state, result, important changed paths, checks/results, gaps, task/history links and next eligible task. Hoang Cong Minh can inspect current context for the latest result or task history for all results. Keep the summary, task evidence and final reply consistent with the historical report; refresh aggregate planning statements when execution makes them stale. Retrieve only relevant entries instead of rereading the full history.

A package becomes EPIC_DONE only after all children are done or explicitly cancelled and every package acceptance outcome passes. A frontend package DONE establishes DEMO/frontend completion only. It does not close backend business AC or production readiness.

## 7. Refresh and further refinement

### Task commits and GitHub delivery

Hoang Cong Minh requested task-by-task commits and GitHub delivery on 11 November 2026. Future task assignments using this workflow authorize scoped commits and ordinary pushes to the current phase branch; no repeated routine permission is needed. This documentation update does not itself commit or push the existing workspace. Remote observed: `origin` = `https://github.com/congminh1705/IT-Operation-Hub.git`; verify it at execution rather than silently changing it.

1. Inspect `git status --short`, the current branch, remotes and staged changes. Preserve unrelated work. This workspace currently includes substantial uncommitted design/planning work: do not sweep that baseline into the first coding task. If required baseline files are not committed, report that dependency and prepare a separate, explicitly scoped baseline delivery before claiming the phase branch is reproducible.
2. PO updated branch naming on 28 November 2026. Use one delivery branch per Parent, named `phase-<letter>/<parent-id>-<short-description>`, for example `phase-b/fnd-18-audit-search`, `phase-c/int-02-ticket-integration`, or `phase-d/qa-04-business-acceptance`. Commit each child separately on its Parent branch. Create the branch from verified `origin/main` when prerequisites are merged. If prerequisite code exists only on an earlier phase branch, inspect ancestry and record the required dependency commits before choosing a baseline. Keep the Parent PR diff scoped and report outstanding dependency merges. Preserve existing phase branches and unrelated working-tree changes, using isolated worktrees as needed.
3. After meaningful checks, inspect the diff and stage only explicitly selected task files and relevant evidence/workflow updates. Inspect `git diff --cached --stat` and `git diff --cached` before committing. Do not use blanket staging of the dirty workspace; exclude credentials, local environment files, dependencies and generated caches.
4. Prefer one coherent implementation commit per task, for example `feat(frontend): FE-03.01 implement approved login`. Use `fix`, `refactor`, `test`, `docs` or `chore` as appropriate; always include Task ID. Follow-up fixes or genuine session checkpoints may use additional commits. Label incomplete work as WIP; a commit does not establish acceptance or owner approval.
5. Push the current phase branch after each task, for example `git push -u origin phase/a-frontend` (substitute the actual phase). Subsequent pushes use the verified upstream. Never force-push, merge, push directly to `main`, rewrite published history, deploy or alter repository permissions under this standing instruction. A non-fast-forward, missing remote or authentication failure is a specific delivery gap: preserve the local commit and report the actual failure without claiming success.
6. Keep Format version 1 unchanged. Its section 8 records branch, implementation SHA, repository/commit link, pushed SHA and actual push result; task section 6 and current context summarize these, and the final reply includes them. If final reporting needs the implementation SHA, create the implementation commit first, then add a small `docs(delivery): <TASK_ID> record delivery evidence` commit. A report cannot contain the SHA of its own containing commit; label the recorded SHA as the implementation commit and report the final delivery HEAD in the final reply. Preserve finalized history; later corrections append a linked report.
7. Verify the remote branch SHA with `git ls-remote --heads origin refs/heads/<actual-branch>` against `git rev-parse HEAD` after the final push. On success record that the remote matches; on network/access failure record verification as not-run/failed with reason. Task acceptance state and GitHub delivery state are separate: pending visual review stays `review` even when pushed, and push failure never counts as successful delivery.

#### Commit titles

Use `<type>(<scope>): <TASK_ID> <specific outcome>` in English, imperative and concise. Each small task has its own identifiable commit; do not combine unrelated tasks. Examples:

- `chore(frontend): FE-01.01 initialize frontend workspace`
- `feat(auth): FE-03.01 implement approved demo login`
- `fix(auth): FE-03.01 keep visibility toggle hover transparent`
- `docs(delivery): FE-03.01 record verification and handoff`

Prefer one coherent task commit including its checks and available execution records. A separate evidence commit is allowed when the actual implementation SHA/push result must be recorded. Avoid vague titles such as `update`, `fix bug` or `done task`. Resuming a task adds a clearly named commit, without rewriting published history.

#### Parent pull requests

PR titles must be in English with format `<type>(<scope>): Phase <A|B|C|D> | <PARENT_ID> | <specific outcome>`. PR descriptions, including headings, must be in Vietnamese. Preserve commands, identifiers and paths. Explain functional behavior before task IDs. Report actual checks, evidence, PO acceptance and remaining integration work. Verify rendered Markdown after publishing.

Required title format: `<type>(<scope>): Phase <A|B|C|D> | <PARENT_ID> | <specific outcome>`. Child commit names retain `<type>(<scope>): <TASK_ID> <specific outcome>`.

This policy applies to **all 230 tasks and all 88 Parents across phases A, B, C and D**, including non-FE decisions, foundation, services, AI, integration and acceptance work. Parent completion includes its existing external closure requirements; a child service being done does not close its Parent early. On every handoff report task commit/push, Parent closure/PR state, PO merge reminder if open, and phase exit state when applicable. Check required preceding Parent PR merges at session start rather than relying on chat memory.

PO confirmed one PR per completed Parent on 13 November 2026. On 28 November 2026, PO approved phase-prefixed PR titles and Parent delivery branches. This supersedes the earlier shared-phase delivery branch requirement for future Parents. Existing branch and PR names retain their historical meaning.

When every child and the Parent's own closure criteria pass, push the Parent branch and create/update that Parent's PR into `main`. This is standing authorization for PR creation, not merging. Do not create empty PRs for unstarted Parents or call a partially verified Parent complete. Reuse an existing PR for that Parent instead of duplicating it.

Deliver Parent PRs in dependency order. While a Parent PR is open, report its URL and remind PO to review/merge. Verify prerequisite merges before dependent delivery. Each Parent branch contains its own scoped changes and identified prerequisites. Start subsequent work only when assigned and its task dependencies permit it.

After PO reports merging, verify the PR is merged and fetch `origin/main`. Create the next authorized Parent branch from the verified baseline. Preserve existing phase branches and published history. Review `git diff origin/main...HEAD` and the commit list before each PR. The phase completes after all Parent acceptance/exit gates pass and all Parent PRs merge.

Use title `<type>(<scope>): <PARENT_ID> <specific delivered outcome>` in concise English. Examples:

- `feat(frontend): Phase A | FE-01 | Establish reproducible DEMO foundation`
- `feat(audit): Phase B | FND-18 | Expose scoped audit search`
- `feat(tickets): Phase C | INT-02 | Connect ticket workflows`

Describe the actual final diff for a reviewer who has not read the chat. Use this description template:

```markdown
## K?t qu? b?n giao
{Gi?i th?ch v?n ??, ch?c n?ng v? h?nh vi sau thay ??i b?ng ti?ng Vi?t.}

## Ch?c n?ng v? ph?m vi
{M? t? thao t?c ng??i d?ng, k?t qu? v? m?t v? d? khi c?n. Sau ?? ?nh x? Parent, phase v? c?c task con v?o ch?c n?ng t??ng ?ng.}

## C?c file ch?nh
{???ng d?n v? vai tr? c?a c?c file gi?p reviewer hi?u thay ??i.}

## Ki?m tra v? b?ng ch?ng
| Ki?m tra | K?t qu? th?c t? | B?ng ch?ng |
| --- | --- | --- |
| {L?nh ho?c thao t?c, m?i tr??ng v? source ?? ki?m tra} | {pass/fail/not-run c?ng l? do} | {Link ho?c ???ng d?n th?c t?} |

## Nghi?m thu
{Ph?n bi?t ki?m tra c?a agent v?i nghi?m thu PO. N?u ??i chi?u thi?t k? khi c? UI v? tr?ng th?i t?ng ti?u ch? quan tr?ng.}

## Gi?i h?n v? ph?n c?n l?i
{N?u ph?n t?ch h?p ch?a ch?y, d? li?u gi? l?p, c?u h?nh/migration v? ?i?u ki?n tri?n khai c?n thi?u.}

## Git delivery v? b?n giao
{Nh?nh ngu?n, main, commit v? link h? s? task/history/current-context. ?? ngh? PO review v? merge khi PR c?n m?. X?c minh merge tr??c khi b?n giao Parent ph? thu?c ti?p theo.}
```

Publish the required title and description directly to the Parent PR on GitHub. Do not create or retain per-Parent PR Markdown files or a `pull-requests` folder in the repository. Prefer a structured GitHub API request; if `gh --body-file` is needed, use a temporary file outside the repository and delete it after use. Verify the returned PR URL, base/head, title/body and commit scope; record only the delivery status and PR link in current context, task/history and the final handoff. On missing access or failure, provide the prepared title/body in the response and report PR creation as not-run/failed; never invent a URL or merge automatically. One PR per Parent, the Parent delivery branch and the reminder for PO to merge remain required.

Typical commands (examples only; replace Task ID and select actual paths):

```powershell
git status --short
git remote -v
git switch -c phase/a-frontend
git diff
git add -- src/frontend/path/to/task-file
git diff --cached
git commit -m "feat(frontend): FE-03.01 implement approved login"
git push -u origin phase/a-frontend
git rev-parse HEAD
git ls-remote --heads origin refs/heads/phase/a-frontend
```

1. Select the next eligible existing leaf from the [complete execution board](execution-board.md); refresh its parent/source context and predecessor evidence.
2. If actual code or a changed contract reveals that its scope is too broad, refine with the [task template](task-template.md), preserving the old ID and explicit superseding/child relationship.
3. Update exact artifact dependencies and ownership; remove redundant transitive edges only when required reachability is preserved.
4. Maintain [parent coverage and closure](../package-task-coverage.md), the story map and acyclic graph; no required outcome may disappear.
5. Register any justified new tasks pending and record the scope reason; never claim new implementation/check evidence during planning.
6. Start only when a subsequent coding request authorizes implementation. Routine implementation choices within that scope do not require repeated permission.

## 8. Kit adaptation and precedence

Adapted from the local SDLC Kit's task/epic/context templates and epic-expansion guidance. No kit installation, governance-data copy, generated CLI dependency or changes to D:\SDLC are needed.

The local kit's AGENT.md/task template uses lowercase task states, while some executor prompts show a different uppercase chain. This project deliberately uses the single lowercase model above. Do not assume an `agent task ...` CLI is installed or run commands copied from those prompts. Existing user instructions and project requirements remain authoritative; this contract governs task organization only.

## Mandatory final-HTML comparison

For every UI task, list and open the affected `docs/design/final/*.html` reference before implementation. Match the owned surface rather than redesigning it from prose. Before visual handoff, capture the running app and the reference at matching viewport/role/state, record material differences and link actual captures/review in the existing task evidence/history format. Use `docs/implementation/evidence/<TASK_ID>/` only when actual evidence exists. Record Hoang Cong Minh's visual verdict or pending review explicitly; never infer owner approval. Nonvisual-only work records N/A with reason and does not add screens just to satisfy this requirement.


### Parent branch naming details

Use lowercase ASCII and hyphens in each path segment. Keep the phase letter and stable Parent ID visible, followed by a concise English scope description. All child commits for a Parent use its selected branch. Example: `phase-b/fnd-18-audit-search`. This refinement supersedes the short `phase/b-fnd-18` convention. Existing published branches retain their names unless explicitly renamed.


### Approved early backend delivery - 2026-11-28

PO authorized sequential backend PRs for FND-09 through FND-13 before INT-02 acceptance. Each scoped PR must pass checks on its own source and disclose outstanding integration acceptance. Service leaves retain done; Parents remain EPIC_IN_PROGRESS until their closure criteria pass. Verify each preceding merge before preparing the next dependent PR.
