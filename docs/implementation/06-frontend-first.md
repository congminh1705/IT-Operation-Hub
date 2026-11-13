---
id: itoh-implementation-frontend-first
title: "Phase A — Frontend DEMO first"
type: planning
domain: development
module: delivery
tags: [frontend, implementation, backlog]
priority: 1
status: planned
owner: PO
approval: needs-review
updated: 2026-11-09
authority: derived
purpose: "Summarize group scope, completion criteria, child tasks and handoff."
---

# Phase A — Frontend DEMO first

**Approved frontend scope:** [v1.3 / D-51](../design/approved-format.md), including the final interactive login. Use the [63-task design map](../design/implementation-scope.md#task-map). Existing IDs, dependencies, business acceptance and lifecycle remain authoritative; visual approval does not start implementation.

Phase A delivers the 63 interactive frontend DEMO tasks first, using the agreed Next.js stack, Vietnamese UI and existing designs. Synthetic outcomes establish frontend behavior only; they do not prove server security, transactions, live AI or production readiness.

These are group/epic summaries. Each heading names the group goal. Implementation context, file boundaries, detailed checks and handoff evidence live in the linked task files. The [task workflow](workflow/task-workflow.md) defines the shared completion rule: every child and group criterion must pass, including any external integration closure. [Execution board](workflow/execution-board.md) owns task status/owner; [package registry](README.md#4-task-tracker) owns epic state. Application evidence remains **NOT RUN**.

## Working boundary and source context

Use explicit synthetic fixtures and a typed mock boundary; real mode cannot silently return DEMO data. Follow the [frontend boundaries](workflow/task-workflow.md#5-frontend-first-boundaries-and-handoff) and each task's embedded context.

## Frontend delivery batches

| Batch | Groups | Exit |
| --- | --- | --- |
| A1 — Foundation | FE-01–03 | Reproducible frontend, shared shell and four-role entry |
| A2 — Core screens | FE-04–09, FE-12 | Administration, tickets/files, tasks, workforce and assets |
| A3 — Coordination and assistant | FE-10–11, FE-13–15 | Policies, approvals, knowledge and confirmed-action workspace |
| A4 — Visibility and handoff | FE-16–18 | Dashboards/reports, notifications/audit and frontend acceptance |

Batches express dependency-aware delivery, not timeboxed sprints. Start [FE-01.01](tasks/FE-01.01.md) only when coding is requested. Follow exact leaf dependencies; **FE-18.03** closes Phase A before subsequent phases.

<a id="fe-01"></a>

## FE-01 — Frontend scaffold and mock contract

**Scope:** Frontend runtime/lockfile, minimal typed DEMO fixtures and explicit mock gateway.

**Trace:** All stories; NFR14/17 (frontend subset).

**Completion criteria**

1. Create only the frontend scaffold and reproducible frontend lockfile; no backend, database, worker, deployment or provider setup.
2. Define a typed transport boundary with deterministic DEMO fixtures, reset behavior and success/loading/empty/error/conflict responses; never silently fall back to mock data in real API mode.
3. Mark all DEMO data and simulated outcomes; use synthetic identities only, do not persist passwords/tokens or claim real authorization.

**Child tasks:** [FE-01.01](tasks/FE-01.01.md), [FE-01.02](tasks/FE-01.02.md), [FE-01.03](tasks/FE-01.03.md).

**Handoff:** Verified outputs feed [FE-02](06-frontend-first.md#fe-02) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#fe-01).

<a id="fe-02"></a>

## FE-02 — Design system and responsive workspace shell

**Scope:** Shared visual primitives, feedback/dialogs, role-aware shell and query/time lifecycle.

**Trace:** AC-X02–07/10; NFR07–10/16.

**Completion criteria**

1. Implement reusable buttons, fields, dialogs, status badges, tables/cards and feedback states using the approved Mac/Teal palette, Inter typography hierarchy and semantic luminous KPI accents (v1.3 / D-51); reserve Night City for coordination and retain the original login.
2. Build role-aware navigation, scoped ticket search entry, account menu and compact navigation; retain one AI Workspace entry.
3. Keyboard focus/trap/return and 320/390/768/1440 layouts work; query keys distinguish mock users and polling runs only in active tabs.

**Child tasks:** [FE-02.01](tasks/FE-02.01.md), [FE-02.02](tasks/FE-02.02.md), [FE-02.03](tasks/FE-02.03.md), [FE-02.04](tasks/FE-02.04.md).

**Handoff:** Verified outputs feed [FE-03](06-frontend-first.md#fe-03) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#fe-02).

<a id="fe-03"></a>

## FE-03 — Login, profile and password interaction

**Scope:** DEMO login/session entry, profile/password and isolated logout/account switching.

**Trace:** US01–04; AC01–04 (UI subset).

**Completion criteria**

1. Implement the approved centered login, local architectural background and ten interactive circuits with pause/reduced motion under FE-03.01; implement validation, transparent stable eye hover/visibility/Caps Lock/loading/auth/network errors and safe internal return navigation with the mock transport.
2. Provide four synthetic accounts through a clearly separate DEMO helper; do not add a production role picker or signup flow.
3. Profile/password forms preserve safe input, distinguish failures and clear mock user caches on logout/switch; simulated password/session outcomes are labeled.

**Child tasks:** [FE-03.01](tasks/FE-03.01.md), [FE-03.02](tasks/FE-03.02.md), [FE-03.03](tasks/FE-03.03.md), [FE-03.04](tasks/FE-03.04.md), [FE-03.05](tasks/FE-03.05.md).

**Handoff:** Verified outputs feed [FE-04](06-frontend-first.md#fe-04), [FE-05](06-frontend-first.md#fe-05), [FE-13](06-frontend-first.md#fe-13) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#fe-03).

<a id="fe-04"></a>

## FE-04 — Administration and SLA configuration screens

**Scope:** Interactive user/access, department/category/team and SLA administration screens.

**Trace:** US05–12; AC05–12 (UI subset).

**Completion criteria**

1. Build create/edit/list/filter interactions for users, departments, teams/membership and categories with role-based mock access.
2. Display request verification, affected assignments, last-Admin/handover/error states and separate secure credential fields; no automatic account creation from ticket text.
3. SLA editor shows version history and old-versus-new snapshot impact; field errors and confirmation preserve input. Unresolved D-40 cases use explicit example fixtures, not invented enterprise rules.

**Child tasks:** [FE-04.01](tasks/FE-04.01.md), [FE-04.02](tasks/FE-04.02.md), [FE-04.03](tasks/FE-04.03.md), [FE-04.04](tasks/FE-04.04.md), [FE-04.05](tasks/FE-04.05.md).

**Handoff:** Verified outputs feed [FE-17](06-frontend-first.md#fe-17) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#fe-04).

<a id="fe-05"></a>

## FE-05 — Ticket list, search and create form

**Scope:** Scoped ticket list/navigation, intake/clarification form and mock submission.

**Trace:** US13–15; US-OPS03; AC13–15/AC-OPS03 (UI subset).

**Completion criteria**

1. Implement query-string-backed search, filters, stable paging/sorting and mine/work views over scoped synthetic fixtures.
2. Create form collects title/description/type/category/impact/urgency and optional asset, previews derived priority and submits once through the mock transport. Onboarding-specific fixtures request missing employee/configuration/quantity/deadline information without making those fields mandatory on every ticket.
3. Successful mock submission creates a visible DEMO record/detail route; validation/conflict/unknown-outcome states retain input and never display failed reads as empty success.

**Child tasks:** [FE-05.01](tasks/FE-05.01.md), [FE-05.02](tasks/FE-05.02.md), [FE-05.03](tasks/FE-05.03.md).

**Handoff:** Verified outputs feed [FE-06](06-frontend-first.md#fe-06), [FE-12](06-frontend-first.md#fe-12) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#fe-05).

<a id="fe-06"></a>

## FE-06 — Ticket conversation, actions, timeline and SLA presentation

**Scope:** Ticket detail/history, separate audiences, lifecycle/assignment/priority actions and SLA display.

**Trace:** US16–21, US24–32; AC16–21/24–32 (UI subset).

**Completion criteria**

1. Implement assignment/claim/priority and permitted transition dialogs with actor/reason/assignee guards simulated against fixture versions.
2. Keep public/internal drafts separate; Pending question, resolution, reply, requester acceptance and reopen flows show preview→submission→result.
3. Render separate response/resolution clocks, paused/stopped/breached states and filtered timeline; changing priority/reopening must not visually reset fixture history.

**Child tasks:** [FE-06.01](tasks/FE-06.01.md), [FE-06.02](tasks/FE-06.02.md), [FE-06.03](tasks/FE-06.03.md), [FE-06.04](tasks/FE-06.04.md), [FE-06.05](tasks/FE-06.05.md), [FE-06.06](tasks/FE-06.06.md).

**Handoff:** Verified outputs feed [FE-07](06-frontend-first.md#fe-07), [FE-08](06-frontend-first.md#fe-08), [FE-14](06-frontend-first.md#fe-14), [FE-17](06-frontend-first.md#fe-17) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#fe-06).

<a id="fe-07"></a>

## FE-07 — Attachment upload and download experience

**Scope:** Attachment selection, simulated upload outcome recovery and audience-safe download UI.

**Trace:** US22–23; AC22–23 (UI subset).

**Completion criteria**

1. Implement selection/removal, maximum five files, 10,000,000-byte boundary, allowed formats and progress/error states for ticket/comment/note forms.
2. Show creation outcome separately from interrupted uploads; preserve text/valid selections and support deliberate retry without duplicate visual records.
3. Mock download uses only synthetic/session-local files in the visible parent scope; no public upload service, real storage or antivirus claim.

**Child tasks:** [FE-07.01](tasks/FE-07.01.md), [FE-07.02](tasks/FE-07.02.md), [FE-07.03](tasks/FE-07.03.md).

**Handoff:** Verified outputs feed [FE-18](06-frontend-first.md#fe-18) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#fe-07).

<a id="fe-08"></a>

## FE-08 — Task board, plan and progress forms

**Scope:** Task card/table, plan/dependency, human progress and manual-control interfaces.

**Trace:** US-OPS04–06/09; AC-OPS04–06/09 (UI subset).

**Completion criteria**

1. Build equivalent task card/table views, filters, plan version/history and readable DAG/list dependencies.
2. Implement simulated start/block/unblock/progress/Done forms with remaining effort, result, dependency and conflict checks; Done never closes the ticket.
3. Show assignment/lock reasons and unavailable actions; management changes require preview and explicit confirmation.

**Child tasks:** [FE-08.01](tasks/FE-08.01.md), [FE-08.02](tasks/FE-08.02.md), [FE-08.03](tasks/FE-08.03.md), [FE-08.04](tasks/FE-08.04.md).

**Handoff:** Verified outputs feed [FE-09](06-frontend-first.md#fe-09), [FE-10](06-frontend-first.md#fe-10), [FE-15](06-frontend-first.md#fe-15) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#fe-08).

<a id="fe-09"></a>

## FE-09 — Workforce skills, calendars and absence forms

**Scope:** Workforce evidence, calendar/absence forms and evaluation-pending outcomes.

**Trace:** US-OPS01/07; AC-OPS01/07 (UI subset).

**Completion criteria**

1. Present verified skills, calendar, daily budgets, remaining/allocated work and available versus unknown capacity.
2. Manager absence/skill/schedule forms show affected work and preview; Technician sees self/minimal allowed mock scope.
3. Use explicit DEMO periods and staffing values; saved absence shows evaluation pending, not completed reassignment.

**Child tasks:** [FE-09.01](tasks/FE-09.01.md), [FE-09.02](tasks/FE-09.02.md), [FE-09.03](tasks/FE-09.03.md).

**Handoff:** Verified outputs feed [FE-11](06-frontend-first.md#fe-11), [FE-16](06-frontend-first.md#fe-16) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#fe-09).

<a id="fe-10"></a>

## FE-10 — Workflow, policy and coordination activity screens

**Scope:** Workflow/policy controls and scoped coordination activity/recovery states.

**Trace:** US-OPS02/07/09/10; AC-OPS02/07/09/10 (UI subset).

**Completion criteria**

1. Build workflow/version editor and policy scope/limit/enable/disable forms with explicit confirmation and mock validation.
2. Render scoped run/action timeline, provenance, errors, manual locks and controlled retry fixtures.
3. Distinguish queued/proposed/approved/executed; no-run, no-approval, disabled and failed paths are explicit. Opening a page does not simulate an automatic domain mutation.

**Child tasks:** [FE-10.01](tasks/FE-10.01.md), [FE-10.02](tasks/FE-10.02.md), [FE-10.03](tasks/FE-10.03.md).

**Handoff:** Verified outputs feed [FE-11](06-frontend-first.md#fe-11), [FE-16](06-frontend-first.md#fe-16), [FE-17](06-frontend-first.md#fe-17) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#fe-10).

<a id="fe-11"></a>

## FE-11 — Exception review and approval dialogs

**Scope:** Readable exception impact/diff and current approve/reject interaction.

**Trace:** US-OPS08; AC-OPS08 (UI subset).

**Completion criteria**

1. Show candidate/current assignment, skills/window/remaining effort, lock reason, task deadline, handover and unchanged SLA impact.
2. Approve/reject requires role and reason; stale/revoked/infeasible fixtures preserve input and direct re-evaluation.
3. Approved remains a decision; execution results come from a separate explicit mock response/fixture, never immediate optimistic success.

**Child tasks:** [FE-11.01](tasks/FE-11.01.md), [FE-11.02](tasks/FE-11.02.md).

**Handoff:** Verified outputs feed [FE-15](06-frontend-first.md#fe-15) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#fe-11).

<a id="fe-12"></a>

## FE-12 — Asset inventory and lifecycle interactions

**Scope:** Scoped asset records, metadata/lifecycle forms and eligible ticket picker.

**Trace:** US35–40; AC35–40 (UI subset).

**Completion criteria**

1. Build scoped list/search/detail/history and metadata forms; current holder is edited only through lifecycle actions.
2. Issue/return/repair/retire dialogs show recipient, reason and state guards; concurrent fixture conflicts do not silently overwrite.
3. Connect ticket asset selection to eligible mock assets; preserve independent permissions for related ticket links.

**Child tasks:** [FE-12.01](tasks/FE-12.01.md), [FE-12.02](tasks/FE-12.02.md), [FE-12.03](tasks/FE-12.03.md), [FE-12.04](tasks/FE-12.04.md).

**Handoff:** Verified outputs feed [FE-14](06-frontend-first.md#fe-14), [FE-16](06-frontend-first.md#fe-16) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#fe-12).

<a id="fe-13"></a>

## FE-13 — Knowledge browsing, authoring and source states

**Scope:** Knowledge search/version reader, author/publisher forms and index/revocation states.

**Trace:** US-OPS11; AC-OPS11 (UI subset).

**Completion criteria**

1. Implement search/category/article/version/source views over public and internal DEMO fixtures.
2. Provide author/publisher-granted mock personas or explicit fixture permissions; no automatic Admin/Manager content bypass.
3. Draft/edit/publish/access forms and loading/stale/indexing/revoked/insufficient-source states work without embeddings or provider calls.

**Child tasks:** [FE-13.01](tasks/FE-13.01.md), [FE-13.02](tasks/FE-13.02.md), [FE-13.03](tasks/FE-13.03.md).

**Handoff:** Verified outputs feed [FE-14](06-frontend-first.md#fe-14) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#fe-13).

<a id="fe-14"></a>

## FE-14 — Assistant conversation, sources and availability

**Scope:** Owner chat, sources/lookups/summaries/drafts and assistant availability.

**Trace:** US-AI01/02/04–08; AC-AI01/02/04–08 (UI subset).

**Completion criteria**

1. Build owner-specific mock chats, source cards, ticket/asset lookups, ticket summaries and audience-safe editable reply drafts using deterministic responses.
2. Delete a chat without deleting DEMO business records; revoked-source/history and provider-error fixtures preserve safe manual fallback.
3. Admin availability controls are separate from automation policy; disclose that answers, usage and availability are simulated, with no model calls.

**Child tasks:** [FE-14.01](tasks/FE-14.01.md), [FE-14.02](tasks/FE-14.02.md), [FE-14.03](tasks/FE-14.03.md).

**Handoff:** Verified outputs feed [FE-15](06-frontend-first.md#fe-15), [FE-16](06-frontend-first.md#fe-16) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#fe-14).

<a id="fe-15"></a>

## FE-15 — Trusted action cards and shared AI Workspace

**Scope:** Trusted intent selection and confirmed native forms within the shared AI Workspace.

**Trace:** US-AI03; AC-AI03; D-42; TC-AI13–18 (UI subset).

**Completion criteria**

1. Reuse the ticket/task/management forms through an allowlisted intent registry; select missing resources explicitly, preview exact content and confirm before simulated mutation.
2. Cover ticket creation/replies/acceptance, task progress and permitted management actions; expose supported/unsupported intents explicitly. Model text never selects endpoints or supplies actor rights.
3. Compose suggestions immediately above chat and separately scoped activity; normal view has no permanent exception block. Closing chat does not stop mock background activity; credentials stay outside chat.

**Child tasks:** [FE-15.01](tasks/FE-15.01.md), [FE-15.02](tasks/FE-15.02.md), [FE-15.03](tasks/FE-15.03.md), [FE-15.04](tasks/FE-15.04.md).

**Handoff:** Verified outputs feed [FE-18](06-frontend-first.md#fe-18) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#fe-15).

<a id="fe-16"></a>

## FE-16 — Role dashboards and reporting interactions

**Scope:** Role dashboards, mock report facts and consistent assistant explanations.

**Trace:** US41–46; US-OPS12; US-AI06; AC41–46/AC-OPS12/AC-AI06 (UI subset).

**Completion criteria**

1. Build personal/Technician/Manager/Admin views with relevant next-action cards and matching source-record drill-downs.
2. Use one mock metric adapter for reports/charts/assistant facts; separate current backlog from date cohorts, no-data from errors and counts from productivity.
3. Filters/timezone boundaries, task/load/warranty/usage views work with DEMO provenance; unknown cost remains unknown and no real AI efficiency claims appear.

**Child tasks:** [FE-16.01](tasks/FE-16.01.md), [FE-16.02](tasks/FE-16.02.md), [FE-16.03](tasks/FE-16.03.md).

**Handoff:** Verified outputs feed [FE-18](06-frontend-first.md#fe-18) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#fe-16).

<a id="fe-17"></a>

## FE-17 — Notifications and scoped audit screens

**Scope:** Own notification/read state and role-scoped audit interfaces.

**Trace:** US34/47; AC34/47 (UI subset).

**Completion criteria**

1. Build unread/all lists, badge/read marking and current-scope link navigation with synthetic recipient events.
2. Render Manager business versus Admin identity/SLA audit fixtures; search/paging/filter state is preserved.
3. Revoked-record previews become generic; no internal note notification for Requester or simulated email delivery.

**Child tasks:** [FE-17.01](tasks/FE-17.01.md), [FE-17.02](tasks/FE-17.02.md).

**Handoff:** Verified outputs feed [FE-18](06-frontend-first.md#fe-18) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#fe-17).

<a id="fe-18"></a>

## FE-18 — Frontend DEMO acceptance and API handoff

**Scope:** Full frontend coverage/checks and an explicit API/Phase A handoff.

**Trace:** All 67 stories (frontend coverage); AC-X02–07/10; NFR07–10/16/17/26 (UI subset).

**Completion criteria**

1. Inventory every agreed screen/interaction against its FE owner and native route/modal; complete four-role mock journeys without dead primary actions or unlabeled placeholder results.
2. Run clean frontend build/typecheck and meaningful component/browser checks, keyboard/focus/320–1440/200% zoom, form/error/conflict and mock isolation tests.
3. Deliver endpoint/DTO/error/confirmation mapping, fixture assumptions and unresolved backend decisions. FE DONE means frontend DEMO accepted, not business AC, security, live AI, database or production acceptance.

**Child tasks:** [FE-18.01](tasks/FE-18.01.md), [FE-18.02](tasks/FE-18.02.md), [FE-18.03](tasks/FE-18.03.md).

**Handoff:** Complete **FE-18.03** and the full frontend acceptance before any Phase B/C/D task may start. Pass the typed API/fixture assumptions and actual frontend evidence to service/integration owners. [Criterion owners and closure](package-task-coverage.md#fe-18).
