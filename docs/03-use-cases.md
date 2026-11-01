---
id: itoh-docs-03-use-cases
title: "Actors and use cases"
type: reference
domain: business
module: requirements
tags: [business, requirements, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Specify actors, goals, flows, and conditions for core and OPS use cases."
---

# Actors and use cases

## System boundary

The system is **IT Operations Hub for one organization**. Primary actors: Requester, Technician, IT Manager, Admin. A ticket's requester is a record relationship and may have any user role. Service identity **AI_COORDINATOR** coordinates under policy; the internal **Scheduler** triggers SLA/risk evaluation. Workers are internal and have no human interaction rights. Database/file storage are internal details, not business actors.

Login is a separate use case and precondition for protected work; do not add login includes to every UC. Actor associations indicate participation, not blanket record authorization. Read with the [permissions matrix](requirements/permissions-matrix.md).

## XMind use-case diagrams

![Use cases by role](xmind/previews/00-use-cases-overview.svg)

[Open XMind](xmind/02-use-cases.xmind). Four sheets provide a 51-UC overview and three core views: accounts/admin, tickets/SLA, assets/monitoring. Topics carry UC IDs; notes record actors/stories/scope.

XMind actor–goal maps support reading/editing, not replacement of formal UML notation. UML appendices retain associations/system boundaries:

- [Accounts and administration — SVG](diagrams/use-cases-access.svg): UC01–UC09.
- [Tickets, SLA, notifications — SVG](diagrams/use-cases-ticket.svg): UC10–UC26.
- [Assets and monitoring — SVG](diagrams/use-cases-operations.svg): UC27–UC33.
- [UML overview SVG](diagrams/use-cases-overview.svg).
- [AI assistant — UC-AI01–08](diagrams/use-cases-ai.svg).
- [Work/coordination/KB — UC-OPS01–10](diagrams/use-cases-work-management.svg).

[All diagrams and VS Code/GitHub viewing instructions](diagrams/README.md).

SVGs use actor views of the same system. Repeated IDs denote the same UC; Admin inherits IT Manager capabilities and all roles have shared actions. Detailed read/write scope follows permissions.

## Core catalog — UC01–UC33

| ID | Goal | Primary actor | Stories | Outcome |
| --- | --- | --- | --- | --- |
| UC01 | Log in | All | US01 | Valid session, authorized workspace |
| UC02 | Log out | All | US02 | Current session invalidated |
| UC03 | View/update profile | All | US03 | Personal details updated within limits |
| UC04 | Change password | All | US04 | New password effective, other sessions revoked |
| UC05 | Manage accounts | Admin | US05–US07 | Audited creation/role/department changes/lock/unlock |
| UC06 | Manage departments | Admin | US08 | Status-aware catalog, preserved history |
| UC07 | Manage teams/members | Admin | US09–US10 | Configured team scope |
| UC08 | Manage ticket categories | Admin | US11 | New/current/inactive categories |
| UC09 | Configure default SLA | Admin | US12 | New default version; old tickets unchanged |
| UC10 | Create ticket | All, for self | US13 | ID, New, priority, snapshot |
| UC11 | Search/filter tickets | All | US14 | Scoped, sorted, paginated results |
| UC12 | Read details/timeline | All within scope | US15, US31 | Correct content/history visibility |
| UC13 | Assign/transfer/self-claim | T, M, A | US16–US17 | Eligible assignee; no SLA reset |
| UC14 | Accept/start work | T, M, A | US18–US19 | Valid state transitions |
| UC15 | Public conversation | Ticket requester, scoped IT | US20 | Persisted content, notification, possible Pending resume |
| UC16 | Internal notes | Scoped IT | US21 | Authorized IT-only reading |
| UC17 | Upload/download files | Parent-content authorized user | US22–US23 | Valid files, authorized downloads |
| UC18 | Wait/resume | Assignee, M, A | US24 | Public question, clock pause/resume |
| UC19 | Propose resolution | Assignee, M, A | US25 | Public solution, Resolved |
| UC20 | Confirm closure | Ticket requester | US26 | Closed, preserved history |
| UC21 | Reopen | Requester when Resolved; M/A | US27–US28 | Reasoned In Progress, resumed SLA |
| UC22 | Cancel | Requester when New; M/A before Resolved | US29 | Cancelled, preserved history |
| UC23 | Change priority | M, A | US30 | Reason, snapshot-based new budget |
| UC24 | Track both SLA clocks | All within scope | US32 | Consistent labels/timing/history |
| UC25 | Detect/alert SLA | M/assignee receive results; internal scheduler triggers | US33 | Deduplicated background alerts |
| UC26 | View/read notifications | All | US34 | Own notifications only, readAt |
| UC27 | Search/manage assets | Scoped R/T read, M/A manage | US35–US36 | Authorized catalog, valid data |
| UC28 | Asset/ticket history | All within scope | US37 | No out-of-scope history/tickets |
| UC29 | Issue asset | M, A | US38 | One active assignment |
| UC30 | Return asset | M, A | US39 | Ended assignment, history retained |
| UC31 | Change asset state | M, A | US40 | Consistent with assignment, reason |
| UC32 | Dashboards/reports | All within scope; reports M/A | US41–US46 | Correct formulas/source data |
| UC33 | Search audit trail | M, A | US47 | Scoped events, no secrets |

## Shared contracts

### Specification structure and actor classification

Read each catalog row (ID/goal/actor/story/conditions) with shared contracts, related story AC, and detailed flows where provided. OPS separately specifies preconditions/flow/postconditions/exceptions. The assistant catalog is the sole source for UC-AI01–08; do not duplicate them as new core UCs.

| Element | Source / convention |
| --- | --- |
| ID / goal / scope | Catalog row; stable code across actor views |
| Initiating / supervising actor | External R/T/M/A; IT Manager means Head of IT, no team-lead tier |
| Trigger | User action on its screen; automation also uses EVT01–17 |
| Preconditions | Shared contract + catalog/flow guards; DEMO data is not production configuration |
| Main / alternative flows | Critical flows, AC, user flows; UI steps grant no additional rights |
| Success postcondition | AC outcome; persisted domain + audit/outbox for mutations; background run reference is not successful effect |
| Failure guarantee | No unauthorized/partial effects or leaks; API/BR validation/401/403/404/409/provider errors |
| Traceability | US/AC/SCR/BR/API/EVT matrix; all application AC remain NOT RUN |

AI_COORDINATOR/workers are **internal executors**, not user actors/managers. OPS service-AI entries execute operational goals supervised by M/A without adding a fifth use-case actor. Scheduler is an internal technical trigger, distinct from alert recipients. Use [sequences](diagrams/architecture.md) for call/transaction order, not UC associations.

### Shared preconditions and guarantees

**Preconditions:** valid server session, active account, role/record relations matching permissions. **Minimum guarantees:** denials change no data, reveal no out-of-scope content, and preserve correctable input. **Mutations:** check versions; persist changes/history consistently; notifications reference deduplicated events. **Shared failures:** validation, expired sessions, lost access, conflicts, persistence/files. No silent user-mutation retry; worker retries use BR-19 idempotency/audit.

## Critical use cases

### UC10 — Create ticket

- **Trigger:** user selects Create request. Additional preconditions: active intake team/category/default SLA. UC-AI03 may call the same service after preview confirmation, never before.
- **Main flow:** title/description/type/category → impact/urgency → suggested priority → optional own asset/files → submit → server rechecks access/data → generate ID, New, intake team, SLA snapshot, event → open details/success.
- **Branches:** no-longer-assigned asset/invalid file → preserve form/field error; missing intake configuration → explain inability to submit, retain input/contact Admin; network replay → no duplicate ticket.
- **Postcondition:** actor is requester; client cannot supply arbitrary priority/assignee.

### UC11/UC12 — Lists and details

- Select My requests/IT work by role → search code/title → combine state/priority/category/team/assignee/SLA filters → sort → paginate → open details.
- Back navigation preserves filters/page. Out-of-scope and nonexistent IDs share messages. Counts/comments/files/timeline share scope.
- Requesters receive no internal tab/content metadata. Post-transfer access loss exits protected data and stops loading.

### UC13 — Assignment or team transfer

- M/A opens assignment → team → active member → reason if team changes → summary → confirm.
- Check version/membership/state/required assignee during active work → old/new event + notification → show new assignee. Preserve SLA usage.
- T self-claims an unassigned team ticket, never selects another user. Concurrent claim returns conflict/fresh state without overwrite.

### UC14 — Accept and start

- Team T accepts New→Open; assignee may still be empty.
- Valid assignee starts Open→In Progress. Without assignee, suggest self-claim/contact M/A; reject direct API attempts.
- Neither action is first response; no hidden New→In Progress transition in one button.

### UC15/UC16 — Public and internal

- Choose composer, enter content/optional files, review audience, send.
- First eligible public IT comment records firstResponseAt. Requester public reply while Pending atomically resumes In Progress/resolution SLA.
- Notes do not satisfy first response or expose content to requesters. Composer changes never copy notes into public. Closed/Cancelled are read-only.

### UC18 — Wait for requester

- Assignee/M/A in In Progress selects waiting → substantive question → confirms public submission.
- Save public comment + Pending, close current resolution interval, notify requester. Only a valid comment, not state change, satisfies first response.
- Requester replies via UC15 to resume. IT-initiated resume requires a reason; no direct Pending→Resolved.

### UC19/UC20 — Resolve and close

- Assignee/M/A in In Progress proposes resolution with work/result/test instructions publicly.
- Save solution/public comment/Resolved event and stop resolution clock; requester sees acceptance banner.
- Requester tests → confirms closure → summary dialog → Closed. No auto-close; higher IT roles cannot close on behalf of requester.

### UC21 — Reopen

- Requester requests further work from Resolved with a reason; M/A may reopen Resolved/Closed with a reason.
- Recheck version/current assignee → In Progress → resume remaining budget, retain all breaches → notify eligible parties.
- Requester cannot reopen Closed through API. Locked/out-of-team old assignees require M/A reassignment, not a new transition [D-12].

### UC23/UC24/UC25 — Priority and SLA

- M/A reviews suggestion/current priority/budget/elapsed use → new level/reason → apply snapshot budget, record adjustment/event.
- Separate response/resolution UI; remaining time may be negative; preserve breach history. Pending pauses resolution only.
- Scheduler checks unsent thresholds → uniquely keyed breaches/notifications → repeated runs do not duplicate. Worker runs without browser sessions.

### UC29/UC30/UC31 — Asset assignment lifecycle

- M/A opens In Stock asset → issue → active user/date/notes → version/no-active-assignment check → assignment, In Use, audit.
- Return chooses In Stock/Under Repair → ends assignment/audits without deleting history.
- Reject issue of Under Repair/Retired/already-held assets; concurrent issuance permits one success.

### UC05/UC07/UC09 — Safe administration

- Under [D-29](requirements/account-provisioning.md), department heads use UC10 for in-app Service Request / Account tickets as Requester. Admin verifies and creates through UC05, default Requester; IT roles need proper approval. Head tracks/accepts the ticket; requester is not replaced by the employee. No HR/head role or automatic ticket-to-user creation.
- Admin supplies role/department/initial password or confirms role edits/locking. Passwords never reappear in lists/audit.
- Membership removal/locking requires handling open assignments, immediate access/session revocation, and history retention. Do not disable the last active Admin.
- SLA edits create a new default version with P1–P4 preview and new-tickets-only scope; old snapshots remain. Important changes are audited.

### UC32 — Dashboards and reports

- Resolve role/scope → current-queue KPIs and separately labeled date-period reports → filter → metric details.
- Drill-down retains exact formulas/source population. Empty data stays empty, never DEMO substitution; loading failure is not zero.

Other UCs use shared contracts and related AC; fields/interactions are in [UI/UX specification](07-uiux-specification.md).

## Work management and coordination — UC-OPS01–10

Retain core UC01–33 and assistant UC-AI01–08; add UC-OPS01–10. All are specified, not executed.

| ID | Goal / actor | Preconditions → flow → postconditions | Exceptions |
| --- | --- | --- | --- |
| UC-OPS01 | Manage skills/schedules — M/A | Valid teams/staff → verify skills/calendar/budget/absence → audited versions/events for affected tasks | Invalid rights/missing/overlapping schedules handled explicitly; no assumed availability |
| UC-OPS02 | Policies/templates — M/A | Reviewed template/schema/DAG/effort/source → publish/version → grant scope/actions/limits/grantor → enable/disable/lock | Default deny; no DEMO policy promoted to operations |
| UC-OPS03 | Understand/clarify — user/AI service | Authorized ticket/context → extract goal/deadline/fields → structured deduplicated questions → wait | Missing/invalid sources cannot create effective plans |
| UC-OPS04 | Plan/activate — AI_COORDINATOR or M/A | Published template/KB, complete inputs → model schema/DAG/estimate/feasibility → effective version/tasks through service | No policy: Draft/approval; cycle/stale/inventory/staff shortage: no execution |
| UC-OPS05 | Select/assign — policy AI_COORDINATOR; manual M/A | Backend candidate filter → reasoned AI ranking → version/recheck/atomic allocation → assignment/notification/action | Lost capacity/rights: re-evaluate/exception; no forced assignment |
| UC-OPS06 | Execute tasks — assignee/M/A | Valid scope/dependency/assignment → Ready/In Progress/Blocked/progress/Done with result → events/unlock successors | Reject premature/invalid transitions or result-free Done; no automatic ticket closure |
| UC-OPS07 | Monitor/replan — AI service/M/A | Schedule/load/blocker/risk events → affected tasks → respect locks/in-progress work → policy reassignment or approval | Infeasible/out-of-scope/commitment changes: approval, no autonomous SLA change |
| UC-OPS08 | Decide exceptions — M/A | Before/after/impact/reason/snapshot proposal → approve/reject → execution recheck → separate result | Stale/revoked policy/changed capacity: conflict/new proposal, no old snapshot |
| UC-OPS09 | Run/audit/reporting — M/A | Authorized scope → event/policy/grantor/source/action/result/usage → facts/controlled retries | No internal exposure to R, duplicate effects, or fabricated costs/results |
| UC-OPS10 | Manage/retrieve KB — ACL reader; granted publisher | Draft/version → publish → background index → Published/ACL/version retrieval → openable sources | Immediate ACL revocation; explicit lack of evidence; publisher rights require decision |

### Cross-use-case scenario

UC10 or confirmed UC-AI03 → UC-OPS03 → UC-OPS04/05 → UC-OPS06 → absence UC-OPS01 → UC-OPS07 → UC-OPS08 if needed → IT UC19, requester UC20 → UC-OPS09. UC-OPS02/10 supply approved policy/templates/knowledge. Account provisioning is an authorized person's D-29 task, not model execution of UC05.

Rejection/timeouts preserve committed data and traceable proposals/errors, without false success or partial plans. BR-14–22 and API design define permissions/states.

## Shared AI action channel — D-42

UC-AI03 covers existing use-case actions through cards/forms/confirmation; ticket creation is one subflow. UC01–33/OPS permissions and AC remain. Users review/confirm replies, progress, and decisions through domain services. Shared UI does not change background event actors, add UCs, or imply implemented actions.
