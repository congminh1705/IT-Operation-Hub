---
id: itoh-docs-04-information-architecture
title: "Information architecture"
type: reference
domain: design
module: navigation
tags: [design, navigation, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Define information areas, navigation, screen IDs, and access scope."
---

# Information architecture

**Target design — not implemented or tested.** This phase covers documentation only. MVP AI includes an assistant and policy-based coordination; Tickets and execution Tasks are separate. KB/RAG is in scope. See decisions D-34–42 and the authoritative documents for each topic.

## Information model

**Tickets** capture requests; **plans/tasks** represent execution. Workforce, policies, KB, assets, SLA, and history provide context. Personal requests and IT work use distinct scopes/navigation with shared authorized ticket details, not four separate role-based applications.

![XMind diagram — 06-information-architecture](xmind/previews/06-information-architecture.svg)

[Open XMind](xmind/03-information-architecture.xmind)

The diagram retains its center/groups/two-sided branches with thicker borders/bright outlines. All 36 screen/interaction patterns carry IDs/names/routes; presentation/access details are in catalogs/XMind notes. PAGE/LIST/BOARD are pages/list regions; DIALOG/PREVIEW are contextual interactions; ERROR is not a sidebar item. R/T/M/A mean Requester/Technician/IT Manager/Admin. Group frames organize information without granting access to every child; full URLs are in the catalog/notes. Admin assistant-availability settings differ from M/A business coordination policies. KB publishing rights remain D-40.

The sitemap is conditional; unauthorized nodes are absent. Requesters cannot see IT work, reports, audit, or administration. Technicians cannot see organization reports/admin/global audit; scoped ticket timelines remain available.

## Role-based navigation

| Area | Requester | Technician | Manager | Admin |
| --- | --- | --- | --- | --- |
| First sidebar item | Overview | Overview | Overview | Overview |
| Tickets | My requests | My requests; IT work | My requests; All tickets | Same as Manager |
| Work | Filtered public ticket progress only | My/team work; scoped plans | IT task board/plans | Under management permissions |
| Workforce | — | Self/minimal lookup | Skills/schedules/capacity | Under management permissions |
| AI Workspace | Personal chat/actions + public progress | Chat/actions + scoped work | Chat/actions + scoped runs/approvals | Current permissions, not others' chats |
| Knowledge | Published under ACL | Published under ACL | ACL/publisher rights | ACL/granted rights |
| Assets | My assets | My assets; support assets | Asset catalog | Asset catalog |
| Monitoring | Notifications | Notifications | Reports; Notifications; Audit | Same as Manager |
| Administration | — | — | — | Users; Departments; Teams; Categories; SLA |
| Account menu | Profile; Password; Logout | Same as R | Same as R | Same as R |

Sidebar groups Workspace, Monitoring, Administration appear when populated. Topbar has scoped ticket search, unread notifications, account; no role switch/dark mode. AI Workspace is one entry; unavailable generation still allows authorized status/manual cards/forms without provider calls.

## Screen inventory and proposed routes

URLs are **navigation designs**, not implemented routes. `:id` is an internal identifier; ticket codes display inside pages. Dialogs may use page state; deep-linked dialogs are not promised.

| Screen | Name / route | Presentation | Permission / use case |
| --- | --- | --- | --- |
| SCR01 | Login `/login` | Public page | UC01 |
| SCR02 | Profile `/profile` | Page | UC03, all users |
| SCR03 | Password `/profile/security` | Page | UC04, all users |
| SCR10 | Personal overview `/dashboard?view=personal` | Page | UC32, all users |
| SCR11 | Technician overview `/dashboard?view=work` | Page | UC32, T team scope |
| SCR12 | Manager/Admin overview `/dashboard?view=work` | Page | UC32, M/A |
| SCR20 | Tickets `/tickets?scope=mine\|work` | Table/cards | UC11, authorized scope |
| SCR21 | Create `/tickets/new` | Page form | UC10, all users |
| SCR22 | Details `/tickets/:id` | Page | UC12, 15–17, 24 within scope |
| SCR23 | Assign/claim | Dialog on SCR20/22 | UC13 |
| SCR24 | Accept/start/wait/resolve/close/reopen/cancel | Action + dialog on SCR22 | UC14, 18–22 |
| SCR25 | Change priority | Dialog on SCR22 | UC23, M/A |
| SCR30 | Assets `/assets?scope=mine\|work` | Table/cards | UC27, scoped |
| SCR31 | Create/edit `/assets/new`, `/assets/:id/edit` | Page form | UC27, M/A |
| SCR32 | Details `/assets/:id` | Page/tabs | UC28, scoped |
| SCR33 | Issue/return/state | Dialog on SCR32 | UC29–31, M/A |
| SCR40 | Reports `/reports` | Page, ticket/SLA/load tabs | UC32, M/A |
| SCR50 | Notifications `/notifications` | List page | UC26, own only |
| SCR60 | Users `/admin/users` | Page + form dialog | UC05, A |
| SCR61 | Departments `/admin/departments` | Page + dialog | UC06, A |
| SCR62 | Teams `/admin/teams`, `/admin/teams/:id` | Page + members panel | UC07, A |
| SCR63 | Categories `/admin/categories` | Page + dialog | UC08, A |
| SCR64 | SLA `/admin/sla` | Form page + history | UC09, A |
| SCR65 | Audit `/audit` | Table page | UC33, scoped M/A |
| SCR90 | Access denied `/403` | Page | Role-prohibited function |
| SCR91 | Not found `/404` | Page | Missing/out-of-scope record, generic message |

SCR23/24/25/33 are interaction patterns with variants, not multiple independent pages. Scope query parameters never grant access.

## Ticket detail structure

1. Breadcrumb/code → title → state/priority badges.
2. Next-action banner for Pending/Resolved or changed data.
3. Main region: description, public conversation, composer; internal tab only for scoped IT.
4. Context: requester, team/assignee, category/type, impact/urgency, two SLAs, asset link.
5. IT-authorized plans/tasks; Requester gets filtered public progress only, no workforce data.
6. Filtered public/internal timeline and readable timestamps.

Do not embed full user profiles/all assets. Asset links require separate authorization; ticket access does not grant every related user/asset detail.

## Taxonomy, search, and filters

| Object | Search fields | Main filters | Sort |
| --- | --- | --- | --- |
| Ticket | Code, title | State, priority, category, team, assignee, SLA type/threshold, creation date; latest resolution date for report drill-down | Latest update default; oldest/newest creation; P1→P4; nearest deadline |
| Asset | Code, serial, brand/model | Type, state, authorized user/department, warranty | Code; warranty; updated |
| Admin user | Name, email | Role, department, active | Name; created |
| Notification | No MVP search needed | All/unread, type | Newest |
| Audit | Object code, authorized actor | Object type, action, date | Newest |

SLA filters select Response/Resolution/Either; Historical breach differs from Currently overdue. Values within a filter use OR, filters combine with AND. Page sizes 20/50/100; filter changes reset page to 1; no infinite scroll for business tables.

Filter/sort query URLs support return/sharing under the same rights; no descriptions/notes/tokens in URLs. Back navigation preserves position/filters if access remains. Do not retain another account's role-specific filters.

## Labels and language

Vietnamese UI uses “Yêu cầu” for employees and “Ticket” for IT where suitable, both referring to the same object. Vietnamese state labels map to standard API/glossary terms. Accepted does not mean Responded; Resolved requires requester checking; Closed means acceptance. SLA tooltips explain continuous 24/7 support commitments. English documentation retains Vietnamese quoted control labels where needed.

## MVP assistant — SCR-AI01–03

Retain all 26 core screen/interaction patterns and scopes; add three patterns:

| Screen | Route / presentation | Permissions and behavior |
| --- | --- | --- |
| SCR-AI01 | `/assistant`; shared AI Workspace | Chat/action cards + authorized activity; context panel within workspace |
| SCR-AI02 | Card/form/preview in AI Workspace | Existing use cases: clarify → edit → preview → confirm → domain result; secure forms bypass model |
| SCR-AI03 | `/admin/assistant`; availability settings | Admin only; no secrets in chat or access to others' chats |

One AI Workspace sidebar item, not separate Assistant/Coordinator items. Missing configuration hides/disables model capabilities with reasons, retaining existing activity/manual forms. SCR22 opens the assistant with correct ticket/audience, not a second AI app. Personal chats/sources recheck permissions; no role switch.

[AI design](10-ai-assistant.md) · [8 use cases/stories](ai/use-cases-stories-and-acceptance.md) · [AI XMind](xmind/08-ai-assistant.xmind).

## Work management and coordination — SCR-OPS01–07

Seven additional patterns: 26 core + 3 AI + 7 OPS = 36 target screen/interaction patterns. Routes are not implemented.

| Screen | Proposed route / presentation | Permissions / UC / content |
| --- | --- | --- |
| SCR-OPS01 | /work?scope=mine or team — board/table | Team-scoped T, M/A; UC-OPS05/06; task state/remaining/assignee/dependencies; My work filters assignee |
| SCR-OPS02 | /tickets/:id/plan — plan/task details | Scoped IT; UC-OPS04/06/07; effective/history/DAG/estimate/deadline/lock/reason |
| SCR-OPS03 | /workforce — workforce | M/A; T self/minimal lookup; UC-OPS01; verified skills/schedule/absence/capacity/load |
| SCR-OPS04 | /assistant?view=activity — shared activity region | M/A; UC-OPS09; filtered events/runs/proposals/actions/results/errors/retries/usage; no others' chats |
| SCR-OPS05 | /approvals — queue/details | Authorized M/A; UC-OPS08; before/after/impact/reason/snapshot, separate decision/execution |
| SCR-OPS06 | /automation/policies — policies/workflows | M/A; UC-OPS02; scope/actions/limits/grantor, templates/versions/publish, disable automation |
| SCR-OPS07 | /knowledge — knowledge base | ACL readers/granted publishers; UC-OPS10; search/article/version, draft/publish/ACL/sources |

T navigation includes My work, Team work, Knowledge under ACL. M/A get Workforce, AI Workspace, Approvals, Policies & workflows. Approval is a shortcut to decision context inside the workspace. Requesters get authorized KB/AI Workspace, no task board/workforce/approval.

Task filters: state/team/assignee/deadline/blocked/plan. Approval: pending/decision/execution. Runs: event/policy/outcome/time. URLs preserve filter/page/sort without sensitive bodies/notes/sources. Scope counts before returning; do not load the entire IT department for client filtering.

Earlier core SVGs illustrate only part of the design; [UI/UX](07-uiux-specification.md) specifies OPS additions. Updated XMind/previews do not prove working routes.

## One screen, retained IDs

D-42 retains 36 interaction patterns, not 36 independent pages. SCR-AI01/02 and OPS04 share a shell; OPS05 drills down there. Specialist routes/forms work independently or contextually embedded. Regular layouts show chat/activity side by side; compact tabs do not reset drafts/create chats/retrigger runs. View/tab queries do not grant access. Revocation refreshes cards/panels/citations; never poll internal payloads for R.

## Two AI Workspace states

UI37 is the normal default without exceptions; UI23 shows an authorized exception proposal; UI24 drills into the decision. Same `/assistant`, SCR-AI01/02/OPS04, and 36 interaction patterns; no added menu/route/role. Opening AI Workspace does not preselect an approval/reassignment task. R/T retain UI11/12 variants within scope.
