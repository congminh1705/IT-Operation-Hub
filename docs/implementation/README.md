---
id: itoh-implementation-index
title: "Implementation backlog and task workflow"
type: planning
domain: development
module: delivery
tags: [implementation, backlog, traceability]
priority: 1
status: planned
owner: PO
approval: needs-review
updated: 2026-11-09
authority: derived
purpose: "Provide one task tracker and a bounded-context workflow for implementing the existing design."
---

# Implementation backlog and task workflow

**Approved frontend scope:** [v1.1 / D-47](../design/approval.md), including the final interactive login. Use the [63-task design map](../design/implementation-scope.md#task-map). Existing IDs, dependencies, business acceptance and lifecycle remain authoritative; visual approval does not start implementation.

This backlog maps **67 stories to 88 work packages and 230 executable tasks** across frontend, real services, integration and acceptance. Every package is fully decomposed; packages remain epic-level scope records rather than coding sessions. D-43 confirms the [task method](workflow/task-workflow.md), and D-44 requests complete decomposition. **Frontend DEMO is Phase A and must be delivered before backend implementation.** The [execution board](workflow/execution-board.md) contains all task states; [parent coverage/closure](package-task-coverage.md) assigns all 264 numbered package criteria. FE-01.01 through FE-01.03 are implemented and checked; FE-01 is EPIC_DONE for the DEMO foundation only. Remaining tasks and system acceptance are not complete.

FE-01.01 is complete. For the next coding request use **[FE-02.02](tasks/FE-02.02.md)**. Its file contains the required context, output scope and checks. [Current context](workflow/current-context.md) records the resume pointer. The [execution board](workflow/execution-board.md) owns task status; the package registry below owns epic status.

The `workflow/` folder contains current context, execution board, execution prompt, task record template, task workflow and the consolidated [task report history](workflow/task-history.md). Group summaries remain in 00–07; individual task records remain in `tasks/`.

This is a derived execution plan. [Stories](../08-invest-requirements.md), [AC](../06-acceptance-criteria.md), [assistant catalog](../ai/use-cases-stories-and-acceptance.md), [rules](../requirements/business-rules.md), [permissions](../requirements/permissions-matrix.md) and [decisions](../decisions/design-decisions.md) remain authoritative. Existing UC/US/AC IDs and M1–M5 are retained. Development tasks here are not the execution Task entities in the product.

## 1. Delivery order

| Phase | Task file | Outcome / exit |
| --- | --- | --- |
| A — Frontend first | [FE-01–18](06-frontend-first.md) | Interactive four-role DEMO, screen/state coverage, mock contract and frontend checks; no backend prerequisite |
| B — Service decisions | [PRE-01–04](00-decisions.md) | Resolve affected D-40 choices before the relevant service implementation; documentation may be refined during A |
| B — M1 services | [FND-01–18](01-foundation.md) | Real stack/session/scope/database/manual work; reuse frontend output from A |
| B — M2 services | [WF-01–10](02-workflows.md) | Plans/capacity/policy/approval and deterministic durable execution |
| B — M3 services | [AI-01–08](03-ai-automation.md) | Minimum sources and real bounded AI automation evidence |
| B — M4 services | [OPS-01–19](04-operations-assistant.md) | Complete operational, KB/RAG/assistant and reporting services |
| C — Real integration | [INT-01–06](07-integration.md) | Replace mock adapters by module; verify UI with actual scoped services and outcomes |
| D — M5 acceptance | [QA-01–05](05-acceptance.md) | Whole-system AC/security/UX/live-model evidence and isolated recovery |

Start the next authorized coding session with **FE-02.02**, then follow the existing leaf dependencies across A1–A4. All frontend batches are already decomposed. **FE-18.03** is the Phase A exit and an ancestor of all Phase B/C/D work. PRE-02 decisions precede workforce/concurrency consumers, PRE-03 precedes AI/knowledge consumers and PRE-04 precedes recovery; unresolved choices do not become approved merely because task records exist.

M1–M5 still describe system capabilities/acceptance, while phases A–D describe the requested implementation order. A frontend DEMO is not a completed M1–M4 capability. Within B, preserve the original service dependencies: AI-01/02 supply minimum sources before M3; full KB/RAG remains OPS-06/07. Phase C can integrate each module as its B dependencies become ready. Phase D starts after all six INT tasks. Batches are not timeboxed sprints and carry no duration commitment.

**Reuse rule for original cards:** their UI outcomes now belong to the matching FE tasks in [coverage](coverage.md). In B, implement remaining real schema/service/API/worker behavior, review the existing UI contract and reuse Phase A screens/components. In C, finish real wiring and integration checks. Do not rebuild the same UI or mark an original task DONE merely because its mock frontend passed; original full-stack outcomes close only after relevant INT evidence. Service-dependent cards may start once prerequisite service outcomes have evidence, even if those prerequisites await UI integration; track that partial evidence without falsely marking them DONE. During leaf expansion, model the exact service-to-integration edges and validate them without requiring partially complete leaf tasks.

Dependencies allow independent work; they do not request agent delegation or authorize concurrent edits. No story-point, token-saving percentage or fixed duration is assumed. All packages now have bounded executable tasks using the [task template](workflow/task-template.md); refresh context before start and refine further only for actual changed scope/evidence. Parent completion requires every child, every parent criterion and its named external integration closure.

## 2. Working on one task with bounded context

1. Select one refined executable task from the execution board. Read its embedded context package and relevant predecessor evidence; avoid loading all package files. Use the task workflow when readiness/state rules are needed.
2. Read the task's named source sections by AC/BR/API/D IDs. Use [HTTP operations](../api/operations.md), [draft OpenAPI](../api/openapi.json), [DBML guide](../database/README.md) and [screen gallery](../design/final/README.md) only for the affected module. Review/update affected DTO/schema projections before coding; the UI format is PO-approved v1.3 under D-51, while implementation/service acceptance remains pending. Read [design authority](../design/approval.md) and read [current format](../design/approved-format.md) with the retained task-specific business-layout specimens; old Graphite colors/type are superseded.
3. With application code present, query CodeGraph first for the relevant module/file/symbol and call paths. In PowerShell use `codegraph.cmd`; the bare `codegraph` shim was blocked by execution policy during inspection. The current index has no application symbols because src contains only .gitkeep files. Use normal document reads for specifications; do not expect CodeGraph to replace them.
4. Implement only the selected phase scope: A frontend/mock transport; B real service behavior; C adapter/integration; D system acceptance. Reuse existing components, native forms and domain services. Do not create backend/worker/model infrastructure while doing an FE task.
5. Run the selected task's meaningful checks. FE uses deterministic mock/browser/component checks; B/C/D use real PostgreSQL for DB guarantees and actual model evidence where required. Recheck CodeGraph freshness after edits; if automatic sync is unavailable, run `codegraph.cmd sync` and check `codegraph.cmd status`.
6. Append the actual attempt report to [task history](workflow/task-history.md#reports), link it from the task's Evidence and handoff and the latest summary in current context, and update the execution-board task state. Preserve older reports; link large artifacts instead of pasting logs. Do not require a commit merely to record progress.

Use the single task lifecycle **pending → in-progress → review → done**, with **blocked/cancelled** as defined in the task workflow. The execution board is the only leaf status/owner registry. Package states use EPIC_* in section 4. Finishing frontend work does not complete the story's real-service acceptance; [coverage](coverage.md) identifies later owners. Specification readiness does not authorize application coding.

Suggested prompt for a future coding session:

```text
Use docs/implementation/workflow/task-execution-prompt.md to implement task FE-01.01.
```

The [reusable execution prompt](workflow/task-execution-prompt.md) selects one child task, validates prerequisites, bounds context/edits/checks and records the handoff. Replace the ID for each assignment; do not automatically run its predecessors or the next task. The [task record template](workflow/task-template.md) is for writing/refining task specifications, while the execution prompt is for assigning implementation.

## 3. Shared definition of done

FE tasks use the frontend-specific definition below. For real service/integration tasks, every applicable item is part of the task, not postponed to M5:

**Frontend DONE:** the named screen/interaction and state variants work with explicit synthetic fixtures, role-based mock projections, preserved forms, keyboard/responsive behavior and reproducible checks. A typed transport and API handoff record exist. No real secrets/providers/backend are needed, no hidden DEMO fallback exists in real mode, and server security/transactions/persistence/business AC remain unverified until B/C/D.

- Server-derived identity, current role/record scope and audience apply before reads/counts and writes; direct API bypass cases are tested. Use current source permissions when condensed AC wording differs.
- Mutations enforce input/state/expected versions; relevant multi-record changes, audit and outbox are atomic. Retry/idempotency and conflict UX preserve intent without silent overwrite.
- Schema changes have reviewed migrations and actual generated API/client types; UI uses real scoped data with preserved forms and distinct loading/empty/error states.
- Keyboard/focus, responsive layout, safe user-switch cache handling and time conventions apply to changed UI.
- Tests/checks cover the task's business and failure outcomes; evidence states what ran and what remains untested. Model proposals/202 jobs/Approved decisions are not successful domain effects.
- No invented permissions, automatic completion/closure/account creation, enterprise defaults or production approval. Capture a missing business decision in D-40 with its affected task; continue independent work.
- Documentation/task status reflects actual behavior, with no fake fixtures presented as production/report results. Full M5 acceptance also requires A1–A13.

Some source details need review before the affected slice: draft DTOs/schema, account emergency handover, workforce period/lock rules, KB rights, inventory reservation semantics, and actor-specific asset-link permissions (the permissions matrix distinguishes M/A from personal Requester/T flows). PRE tasks track these; this backlog does not silently settle them.

## 4. Task tracker

This **work-package/epic registry** retains all 88 stable scope IDs. FE-01 is EPIC_DONE after all three children and parent criteria pass; the other 87 packages remain EPIC_READY at the bounded-specification level. This state does not satisfy prerequisites or decide D-40 values. Package planning links are navigational; the [230-task board](workflow/execution-board.md) and leaf cards define executable artifact dependencies. **FE-18.03** gates subsequent phases. [Coverage/closure](package-task-coverage.md) distinguishes DONE service output from package acceptance awaiting actual UI integration.

| Work package | Outcome | Planning dependencies | Epic state |
| --- | --- | --- | --- |
| [FE-01](06-frontend-first.md#fe-01) | Frontend scaffold and mock contract | — | EPIC_DONE |
| [FE-02](06-frontend-first.md#fe-02) | Design system and responsive workspace shell | FE-01 | EPIC_IN_PROGRESS |
| [FE-03](06-frontend-first.md#fe-03) | Login, profile and password interaction | FE-02 | EPIC_READY |
| [FE-04](06-frontend-first.md#fe-04) | Administration and SLA configuration screens | FE-03 | EPIC_READY |
| [FE-05](06-frontend-first.md#fe-05) | Ticket list, search and create form | FE-03 | EPIC_READY |
| [FE-06](06-frontend-first.md#fe-06) | Ticket conversation, actions, timeline and SLA presentation | FE-05 | EPIC_READY |
| [FE-07](06-frontend-first.md#fe-07) | Attachment upload and download experience | FE-06 | EPIC_READY |
| [FE-08](06-frontend-first.md#fe-08) | Task board, plan and progress forms | FE-06 | EPIC_READY |
| [FE-09](06-frontend-first.md#fe-09) | Workforce skills, calendars and absence forms | FE-08 | EPIC_READY |
| [FE-10](06-frontend-first.md#fe-10) | Workflow, policy and coordination activity screens | FE-08 | EPIC_READY |
| [FE-11](06-frontend-first.md#fe-11) | Exception review and approval dialogs | FE-09 FE-10 | EPIC_READY |
| [FE-12](06-frontend-first.md#fe-12) | Asset inventory and lifecycle interactions | FE-05 | EPIC_READY |
| [FE-13](06-frontend-first.md#fe-13) | Knowledge browsing, authoring and source states | FE-03 | EPIC_READY |
| [FE-14](06-frontend-first.md#fe-14) | Assistant conversation, sources and availability | FE-06 FE-12 FE-13 | EPIC_READY |
| [FE-15](06-frontend-first.md#fe-15) | Trusted action cards and shared AI Workspace | FE-08 FE-11 FE-14 | EPIC_READY |
| [FE-16](06-frontend-first.md#fe-16) | Role dashboards and reporting interactions | FE-09 FE-10 FE-12 FE-14 | EPIC_READY |
| [FE-17](06-frontend-first.md#fe-17) | Notifications and scoped audit screens | FE-04 FE-06 FE-10 | EPIC_READY |
| [FE-18](06-frontend-first.md#fe-18) | Frontend DEMO acceptance and API handoff | FE-07 FE-15 FE-16 FE-17 | EPIC_READY |
| [INT-01](07-integration.md#int-01) | Connect identity, administration and shared transport | FE-18 FND-03 FND-04 FND-07 FND-08 FND-17 | EPIC_READY |
| [INT-02](07-integration.md#int-02) | Connect ticket lifecycle, attachments, SLA and notifications | INT-01 FND-13 OPS-03 OPS-04 OPS-05 | EPIC_READY |
| [INT-03](07-integration.md#int-03) | Connect workforce, plans, policy, approvals and runs | INT-01 FND-15 FND-16 WF-10 AI-08 | EPIC_READY |
| [INT-04](07-integration.md#int-04) | Connect asset inventory and ticket references | INT-02 OPS-02 | EPIC_READY |
| [INT-05](07-integration.md#int-05) | Connect knowledge, assistant and confirmed action forms | INT-02 INT-03 INT-04 OPS-15 OPS-19 | EPIC_READY |
| [INT-06](07-integration.md#int-06) | Connect dashboards, report facts, notifications and audit | INT-02 INT-03 INT-04 INT-05 FND-18 OPS-16 OPS-18 | EPIC_READY |
| [PRE-01](00-decisions.md#pre-01) | Review foundation contracts and identity decisions | — | EPIC_READY |
| [PRE-02](00-decisions.md#pre-02) | Define workforce and workflow concurrency contracts | — | EPIC_READY |
| [PRE-03](00-decisions.md#pre-03) | Define minimum AI, knowledge and inventory data contracts | — | EPIC_READY |
| [PRE-04](00-decisions.md#pre-04) | Define deployment and recovery targets | — | EPIC_READY |
| [FND-01](01-foundation.md#fnd-01) | Create reproducible development scaffold | [PRE-01](00-decisions.md#pre-01) | EPIC_READY |
| [FND-02](01-foundation.md#fnd-02) | Create database, transaction, audit and outbox primitives | [FND-01](01-foundation.md#fnd-01) | EPIC_READY |
| [FND-03](01-foundation.md#fnd-03) | Create accessible shell and typed API client | [FND-01](01-foundation.md#fnd-01) | EPIC_READY |
| [FND-04](01-foundation.md#fnd-04) | Implement login, logout and current-session authorization | [FND-02](01-foundation.md#fnd-02), [FND-03](01-foundation.md#fnd-03) | EPIC_READY |
| [FND-05](01-foundation.md#fnd-05) | Manage departments, teams and safe reference lookups | [FND-04](01-foundation.md#fnd-04) | EPIC_READY |
| [FND-06](01-foundation.md#fnd-06) | Provision accounts through the authorized Admin flow | [FND-05](01-foundation.md#fnd-05) | EPIC_READY |
| [FND-07](01-foundation.md#fnd-07) | Implement own profile and password changes | [FND-04](01-foundation.md#fnd-04) | EPIC_READY |
| [FND-08](01-foundation.md#fnd-08) | Configure categories and versioned default SLA | [FND-05](01-foundation.md#fnd-05) | EPIC_READY |
| [FND-09](01-foundation.md#fnd-09) | Create a text ticket with priority and SLA snapshot | [FND-06](01-foundation.md#fnd-06), [FND-08](01-foundation.md#fnd-08) | EPIC_READY |
| [FND-10](01-foundation.md#fnd-10) | Implement scoped ticket search and details | [FND-09](01-foundation.md#fnd-09) | EPIC_READY |
| [FND-11](01-foundation.md#fnd-11) | Assign, transfer, claim and start tickets | [FND-10](01-foundation.md#fnd-10) | EPIC_READY |
| [FND-12](01-foundation.md#fnd-12) | Implement public comments, notes and ticket lifecycle | [FND-11](01-foundation.md#fnd-11) | EPIC_READY |
| [FND-13](01-foundation.md#fnd-13) | Implement priority changes and authorized timeline | [FND-12](01-foundation.md#fnd-12) | EPIC_READY |
| [FND-14](01-foundation.md#fnd-14) | Manage verified workforce skills | [FND-05](01-foundation.md#fnd-05), [PRE-02](00-decisions.md#pre-02) | EPIC_READY |
| [FND-15](01-foundation.md#fnd-15) | Manage calendars, budgets and absences | [FND-14](01-foundation.md#fnd-14), [PRE-02](00-decisions.md#pre-02) | EPIC_READY |
| [FND-16](01-foundation.md#fnd-16) | Create and execute manual tasks with remaining effort | [FND-11](01-foundation.md#fnd-11), [FND-15](01-foundation.md#fnd-15), [PRE-02](00-decisions.md#pre-02) | EPIC_READY |
| [FND-17](01-foundation.md#fnd-17) | Complete access revocation and assignment handover | [FND-06](01-foundation.md#fnd-06), [FND-16](01-foundation.md#fnd-16) | EPIC_READY |
| [FND-18](01-foundation.md#fnd-18) | Expose scoped audit search | [FND-13](01-foundation.md#fnd-13), [FND-17](01-foundation.md#fnd-17) | EPIC_READY |
| [WF-01](02-workflows.md#wf-01) | Validate and activate versioned plan DAGs | [FND-16](01-foundation.md#fnd-16) | EPIC_READY |
| [WF-02](02-workflows.md#wf-02) | Publish verified workflow templates | [WF-01](02-workflows.md#wf-01), [PRE-02](00-decisions.md#pre-02) | EPIC_READY |
| [WF-03](02-workflows.md#wf-03) | Manage default-deny policies and grants | [WF-02](02-workflows.md#wf-02) | EPIC_READY |
| [WF-04](02-workflows.md#wf-04) | Filter candidates and atomically allocate capacity | [WF-01](02-workflows.md#wf-01), [FND-15](01-foundation.md#fnd-15), [PRE-02](00-decisions.md#pre-02) | EPIC_READY |
| [WF-05](02-workflows.md#wf-05) | Deliver durable outbox through Linux workers | [FND-02](01-foundation.md#fnd-02), [PRE-02](00-decisions.md#pre-02) | EPIC_READY |
| [WF-06](02-workflows.md#wf-06) | Implement exception proposals and approval decisions | [WF-03](02-workflows.md#wf-03), [WF-04](02-workflows.md#wf-04) | EPIC_READY |
| [WF-07](02-workflows.md#wf-07) | Respect manual locks, overrides and disable | [WF-06](02-workflows.md#wf-06) | EPIC_READY |
| [WF-08](02-workflows.md#wf-08) | Execute idempotent service commands from deterministic proposals | [WF-05](02-workflows.md#wf-05), [WF-07](02-workflows.md#wf-07) | EPIC_READY |
| [WF-09](02-workflows.md#wf-09) | Evaluate affected work after operational changes | [WF-08](02-workflows.md#wf-08) | EPIC_READY |
| [WF-10](02-workflows.md#wf-10) | Expose run traces and controlled recovery | [WF-08](02-workflows.md#wf-08), [FND-18](01-foundation.md#fnd-18) | EPIC_READY |
| [AI-01](03-ai-automation.md#ai-01) | Persist minimum versioned knowledge and ACL sources | [FND-04](01-foundation.md#fnd-04), [PRE-03](00-decisions.md#pre-03) | EPIC_READY |
| [AI-02](03-ai-automation.md#ai-02) | Persist minimum inventory for planning evidence | [FND-05](01-foundation.md#fnd-05), [PRE-03](00-decisions.md#pre-03) | EPIC_READY |
| [AI-03](03-ai-automation.md#ai-03) | Build provider adapter and shared usage budget ledger | [FND-02](01-foundation.md#fnd-02), [PRE-03](00-decisions.md#pre-03) | EPIC_READY |
| [AI-04](03-ai-automation.md#ai-04) | Clarify missing request information | [AI-01](03-ai-automation.md#ai-01), [AI-02](03-ai-automation.md#ai-02), [AI-03](03-ai-automation.md#ai-03), [FND-12](01-foundation.md#fnd-12), [WF-02](02-workflows.md#wf-02) | EPIC_READY |
| [AI-05](03-ai-automation.md#ai-05) | Generate and commit valid sourced AI plans | [AI-04](03-ai-automation.md#ai-04), [WF-08](02-workflows.md#wf-08) | EPIC_READY |
| [AI-06](03-ai-automation.md#ai-06) | Rank eligible candidates and assign through services | [AI-05](03-ai-automation.md#ai-05), [WF-04](02-workflows.md#wf-04) | EPIC_READY |
| [AI-07](03-ai-automation.md#ai-07) | Replan after absence, blocker and risk events | [AI-06](03-ai-automation.md#ai-06), [WF-09](02-workflows.md#wf-09), [WF-10](02-workflows.md#wf-10) | EPIC_READY |
| [AI-08](03-ai-automation.md#ai-08) | Validate fixed M3 scenarios with a real model | [AI-07](03-ai-automation.md#ai-07) | EPIC_READY |
| [OPS-01](04-operations-assistant.md#ops-01) | Complete asset records, scoped lookup and history | [AI-02](03-ai-automation.md#ai-02), [FND-10](01-foundation.md#fnd-10) | EPIC_READY |
| [OPS-02](04-operations-assistant.md#ops-02) | Implement asset issue, return, state changes and ticket links | [OPS-01](04-operations-assistant.md#ops-01) | EPIC_READY |
| [OPS-03](04-operations-assistant.md#ops-03) | Complete SLA displays and independent alert scans | [FND-13](01-foundation.md#fnd-13), [WF-05](02-workflows.md#wf-05) | EPIC_READY |
| [OPS-04](04-operations-assistant.md#ops-04) | Deliver authorized in-app notifications | [OPS-03](04-operations-assistant.md#ops-03), [WF-05](02-workflows.md#wf-05) | EPIC_READY |
| [OPS-05](04-operations-assistant.md#ops-05) | Implement private attachments and recovery | [FND-12](01-foundation.md#fnd-12) | EPIC_READY |
| [OPS-06](04-operations-assistant.md#ops-06) | Complete KB authoring, publishing and ACL UI | [AI-01](03-ai-automation.md#ai-01) | EPIC_READY |
| [OPS-07](04-operations-assistant.md#ops-07) | Build pgvector indexing and authorized retrieval | [OPS-06](04-operations-assistant.md#ops-06), [AI-03](03-ai-automation.md#ai-03), [WF-05](02-workflows.md#wf-05) | EPIC_READY |
| [OPS-08](04-operations-assistant.md#ops-08) | Implement private chats and assistant availability | [FND-04](01-foundation.md#fnd-04), [AI-03](03-ai-automation.md#ai-03), [PRE-03](00-decisions.md#pre-03) | EPIC_READY |
| [OPS-09](04-operations-assistant.md#ops-09) | Answer cited questions and scoped ticket/asset lookup | [OPS-07](04-operations-assistant.md#ops-07), [OPS-08](04-operations-assistant.md#ops-08), [OPS-02](04-operations-assistant.md#ops-02) | EPIC_READY |
| [OPS-10](04-operations-assistant.md#ops-10) | Generate audience-safe summaries and reply drafts | [OPS-08](04-operations-assistant.md#ops-08), [FND-12](01-foundation.md#fnd-12) | EPIC_READY |
| [OPS-11](04-operations-assistant.md#ops-11) | Confirm conversational ticket creation | [OPS-08](04-operations-assistant.md#ops-08), [FND-09](01-foundation.md#fnd-09), [OPS-02](04-operations-assistant.md#ops-02), [OPS-05](04-operations-assistant.md#ops-05) | EPIC_READY |
| [OPS-12](04-operations-assistant.md#ops-12) | Confirm ticket replies and lifecycle actions in cards | [OPS-10](04-operations-assistant.md#ops-10), [OPS-11](04-operations-assistant.md#ops-11) | EPIC_READY |
| [OPS-13](04-operations-assistant.md#ops-13) | Confirm specialist task progress in cards | [OPS-12](04-operations-assistant.md#ops-12), [FND-16](01-foundation.md#fnd-16), [WF-01](02-workflows.md#wf-01) | EPIC_READY |
| [OPS-14](04-operations-assistant.md#ops-14) | Confirm authorized management actions through trusted forms | [OPS-13](04-operations-assistant.md#ops-13), [WF-06](02-workflows.md#wf-06), [WF-07](02-workflows.md#wf-07), [FND-17](01-foundation.md#fnd-17), [OPS-02](04-operations-assistant.md#ops-02) | EPIC_READY |
| [OPS-15](04-operations-assistant.md#ops-15) | Compose one independent AI Workspace | [OPS-09](04-operations-assistant.md#ops-09), [OPS-12](04-operations-assistant.md#ops-12), [OPS-13](04-operations-assistant.md#ops-13), [OPS-14](04-operations-assistant.md#ops-14), [WF-10](02-workflows.md#wf-10) | EPIC_READY |
| [OPS-16](04-operations-assistant.md#ops-16) | Build requester and technician dashboards | [OPS-02](04-operations-assistant.md#ops-02), [OPS-03](04-operations-assistant.md#ops-03), [OPS-04](04-operations-assistant.md#ops-04), [FND-16](01-foundation.md#fnd-16) | EPIC_READY |
| [OPS-17](04-operations-assistant.md#ops-17) | Build management ticket, workload and warranty reports | [OPS-02](04-operations-assistant.md#ops-02), [OPS-03](04-operations-assistant.md#ops-03), [FND-13](01-foundation.md#fnd-13) | EPIC_READY |
| [OPS-18](04-operations-assistant.md#ops-18) | Report coordination facts and sourced AI usage | [WF-10](02-workflows.md#wf-10), [AI-07](03-ai-automation.md#ai-07), [OPS-07](04-operations-assistant.md#ops-07) | EPIC_READY |
| [OPS-19](04-operations-assistant.md#ops-19) | Explain authorized reports through the assistant | [OPS-08](04-operations-assistant.md#ops-08), [OPS-17](04-operations-assistant.md#ops-17), [OPS-18](04-operations-assistant.md#ops-18) | EPIC_READY |
| [QA-01](05-acceptance.md#qa-01) | Complete CI, contracts and reproducible release checks | [FND-18](01-foundation.md#fnd-18), [WF-10](02-workflows.md#wf-10), [AI-07](03-ai-automation.md#ai-07), [OPS-04](04-operations-assistant.md#ops-04), [OPS-05](04-operations-assistant.md#ops-05), [OPS-15](04-operations-assistant.md#ops-15), [OPS-16](04-operations-assistant.md#ops-16), [OPS-19](04-operations-assistant.md#ops-19), INT-01, INT-02, INT-03, INT-04, INT-05, INT-06 | EPIC_READY |
| [QA-02](05-acceptance.md#qa-02) | Verify integrated authorization and failure recovery | [QA-01](05-acceptance.md#qa-01) | EPIC_READY |
| [QA-03](05-acceptance.md#qa-03) | Verify responsive accessibility and measured performance | [QA-01](05-acceptance.md#qa-01) | EPIC_READY |
| [QA-04](05-acceptance.md#qa-04) | Run complete MVP journeys and real-model acceptance | [QA-02](05-acceptance.md#qa-02), [QA-03](05-acceptance.md#qa-03), [AI-08](03-ai-automation.md#ai-08), [OPS-19](04-operations-assistant.md#ops-19) | EPIC_READY |
| [QA-05](05-acceptance.md#qa-05) | Rehearse release, backup/restore and finish handover | [QA-04](05-acceptance.md#qa-04), [PRE-04](00-decisions.md#pre-04) | EPIC_READY |

## 5. Traceability and evidence

[Story-to-task coverage](coverage.md) maps all 47 core, 12 OPS and 8 assistant stories to both frontend and original delivery owners. Task acceptance supplements the original criteria; it is not a replacement specification. [Master traceability](../traceability/master-traceability.md) retains UC/screens/BR mappings. [Roadmap](../09-design-readiness.md) owns milestone acceptance and validation conditions.

The 00–07 files are concise **group summaries**: goal, scope/trace, numbered completion criteria, child task links and handoff. Exact source sections, file boundaries and task evidence pointers belong in `tasks/*.md`; full chronological reports are retained in `workflow/task-history.md`. Do not copy that execution detail back into group summaries. The execution board owns task state, while package-task-coverage maps criterion ownership and external integration closure.

At task completion append:

```text
Completion record
- Result/date:
- Changed paths and key symbols:
- Checks run and actual results:
- Evidence/commit/build (if available):
- Remaining decisions/defects:
- Next eligible task:
```

Application evidence is currently **NOT RUN**. Documentation checks for this backlog establish only link/ID/coverage/dependency consistency.


Parent delivery: one PR per completed work package, using the shared phase branch. [FE-01 PR #1](https://github.com/congminh1705/IT-Operation-Hub/pull/1) awaits PO review/merge before starting FE-02. Preserve the phase branch; follow [workflow PR rules](workflow/task-workflow.md#parent-pull-requests).
