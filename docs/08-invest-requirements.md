---
id: itoh-docs-08-invest-requirements
title: "User stories and INVEST review"
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
purpose: "Define core/OPS stories, dependencies, AC, and INVEST refinement assessments."
---

# User stories and INVEST review

**Retain 47 core story IDs; add 8 assistant and 12 work/coordination stories for the target MVP. Not implemented or estimated by a development team.** IDs are stable for traceability; numbering is not a sprint-order commitment.

## Reading INVEST

[Bill Wake](https://xp123.com/invest-in-good-stories-and-smart-tasks/): Independent, Negotiable, Valuable, Estimable, Small, Testable. Independence here means a demonstrable outcome with suitable fixtures, not absence of data/permission dependencies. Mandatory AC/constraints are not negotiable. Do not mark everything PASS.

Each story records role/outcome/value/dependencies/AC. E/S readiness is a **desk assessment**: `R` ready for refinement; `C` needs splitting/estimation consideration. No story points/fixed schedule exist.

## Backlog

| ID | User story | Minimum dependencies | AC |
| --- | --- | --- | --- |
| US01 | As an active account holder, I want to sign in to access an authorized workspace. | Admin-provisioned account | AC01 |
| US02 | As a signed-in user, I want to log out to end current-session access. | Valid session | AC02 |
| US03 | As a user, I want to view/edit my name/contact details to keep support information accurate. | Valid session | AC03 |
| US04 | As a user, I want to change my password after current-password verification to protect my account. | Valid session | AC04 |
| US05 | As Admin, I want to create an account with role/department to grant a new employee access. | Department, Admin | AC05 |
| US06 | As Admin, I want audited role/department changes so access matches responsibilities. | Existing user | AC06 |
| US07 | As Admin, I want to lock/unlock accounts to control access while retaining history. | Existing user | AC07 |
| US08 | As Admin, I want to manage departments/status to organize personnel data. | Admin | AC08 |
| US09 | As Admin, I want IT/intake teams so requests have accountable owners. | Admin | AC09 |
| US10 | As Admin, I want to add/remove members so work scope reflects actual responsibilities. | Team/user | AC10 |
| US11 | As Admin, I want to maintain ticket categories for consistent classification. | Admin | AC11 |
| US12 | As Admin, I want to publish a default SLA version for future tickets. | Admin | AC12 |
| US13 | As Requester, I want to submit context/impact/urgency so IT receives enough information. | Categories/intake/SLA | AC13 |
| US14 | As user, I want scoped ticket search/filter/sort to find relevant work. | Ticket fixtures | AC14 |
| US15 | As user, I want authorized ticket details to see status/ownership. | Scoped ticket | AC15 |
| US16 | As Manager/Admin, I want reasoned assignments/transfers to give the right person responsibility. | Teams/members/ticket | AC16 |
| US17 | As Technician, I want to claim unassigned team tickets without duplicate claims. | Membership/unassigned ticket | AC17 |
| US18 | As team Technician, I want to accept New tickets to acknowledge intake. | New ticket | AC18 |
| US19 | As assignee, I want to start Open tickets to show work is underway. | Open/valid assignment | AC19 |
| US20 | As authorized participant, I want public comments to discuss progress/answer questions. | Nonterminated ticket | AC20 |
| US21 | As scoped IT, I want internal notes for private collaboration. | Ticket IT scope | AC21 |
| US22 | As content sender, I want valid images/PDFs to provide evidence. | Ticket/parent form | AC22 |
| US23 | As authorized reader, I want to download evidence while preserving privacy. | Attachment | AC23 |
| US24 | As assignee, I want to ask for details and set Pending to show who is awaited and pause resolution. | In Progress | AC24 |
| US25 | As assignee, I want a solution/Resolved proposal so requester can verify. | In Progress | AC25 |
| US26 | As Resolved-ticket requester, I want to confirm closure to record completion. | Resolved | AC26 |
| US27 | As Resolved-ticket requester, I want reasoned reopening when the solution fails. | Resolved/valid assignee | AC27 |
| US28 | As Manager/Admin, I want to reopen Closed with a reason for issues found after acceptance. | Closed/valid assignee | AC28 |
| US29 | As New-ticket requester or authorized Manager/Admin, I want to cancel unnecessary work while retaining history. | Allowed state | AC29 |
| US30 | As Manager/Admin, I want reasoned priority changes reflecting verified impact. | Snapshot/ticket | AC30 |
| US31 | As ticket reader, I want an authorized timeline of who changed what/when. | TicketEvent | AC31 |
| US32 | As ticket follower, I want separate response/resolution SLA clocks. | Snapshot/state history | AC32 |
| US33 | As Manager/assignee, I want background deduplicated SLA alerts to intervene promptly. | SLA/scheduler/recipients | AC33 |
| US34 | As user, I want own notifications/read marking to find items needing attention. | Notification | AC34 |
| US35 | As Manager/Admin, I want asset records as one source of device information. | Asset management | AC35 |
| US36 | As user, I want authorized asset lookup to find devices. | Asset/assignment/related ticket | AC36 |
| US37 | As authorized user, I want assignment/related-ticket history for operational context. | Scoped asset/assignments/tickets | AC37 |
| US38 | As Manager/Admin, I want to issue an In Stock asset to record one accountable holder. | In Stock/active user | AC38 |
| US39 | As Manager/Admin, I want asset return to end assignment and retain handover history. | Active assignment | AC39 |
| US40 | As Manager/Admin, I want reasoned asset-state changes to prevent unready issuance. | Valid state/assignment | AC40 |
| US41 | As employee, I want requests awaiting me/my assets to know next steps. | Own tickets/assignments | AC41 |
| US42 | As Technician, I want assigned/unclaimed team work and SLA pressure to prioritize. | Team scope/SLA | AC42 |
| US43 | As Manager/Admin, I want backlog/unassigned/team/state/priority totals for coordination. | Scoped tickets | AC43 |
| US44 | As Manager/Admin, I want period creation/resolution trends and active duration to evaluate operations. | State/SLA history | AC44 |
| US45 | As Manager/Admin, I want current assignee ticket loads for evidence-based allocation. | Assignees/scope | AC45 |
| US46 | As Manager/Admin, I want expiring warranties to prepare before deadlines. | Warranty dates | AC46 |
| US47 | As Manager/Admin, I want scoped audit search for accountable changes. | Authorized AuditLog | AC47 |

## INVEST review by story

I/V follow dependencies/value above; T maps to matching [AC](06-acceptance-criteria.md). This table adds negotiable details N and estimation/size boundaries E/S. `R` does not promise iteration-sized delivery.

| Story | N — negotiable detail | E/S — basis and boundary | Assessment |
| --- | --- | --- | --- |
| US01 | Form/error wording | One authentication, no SSO/MFA; password policy refinement | R |
| US02 | Control location/message | One revoked session, not all-device logout | R |
| US03 | Contact fields/form grouping | No role/email through own profile | R |
| US04 | Strength help/confirmation | One change; policy/library M1 | R |
| US05 | User form layout | One user/default Requester/D-29 verified ticket; no imports/bulk invites | R |
| US06 | Dialog/page | One user; affected memberships/assignments | R |
| US07 | Lock impact display | Revocation/handover may be large; split lock/unlock | C |
| US08 | Table/inline form | One department, preserve history | R |
| US09 | Intake selection | One team, no automatic routing | R |
| US10 | Member picker | One membership change; affected tickets | R |
| US11 | Category order | One category, no deep taxonomy | R |
| US12 | Save preview | One versioned table, old tickets immutable | R |
| US13 | Grouping/help | One text ticket; files US22/download US23; asset lookup complete M4 | R |
| US14 | Presets/default columns | Broad search/filters; split basic paging/search and advanced filters if needed | C |
| US15 | Panel arrangement | One page; scoped internal data; timeline US31 | R |
| US16 | Assignment dialog | Split within-team and transfer if needed | C |
| US17 | Claim location | One unassigned ticket, concurrency AC | R |
| US18 | Acceptance label | New→Open only, no first response | R |
| US19 | Start label | Open→In Progress/assignee guard | R |
| US20 | Text editor/help | One public comment; Pending resume part of same action | R |
| US21 | Tab/separate composer | One note with leakage tests | R |
| US22 | File picker | ≤5 files; consistency/storage spike; split ticket/comment if needed | C |
| US23 | Download label | One file/parent authorization | R |
| US24 | Clarification dialog | Atomic Pending/question; small manual-resume branch | R |
| US25 | Solution template | One public solution/Resolved, no auto-close | R |
| US26 | Confirmation copy | Requester Resolved→Closed only | R |
| US27 | Reason help | Resolved→In Progress, D-12 assignee exception | R |
| US28 | Dialog entry | M/A Closed→In Progress only | R |
| US29 | Confirmation copy | Requester New/M/A branches; split by actor if needed | R |
| US30 | Budget comparison | One priority change, explicit snapshot/elapsed | R |
| US31 | Event grouping/order | One paginated, visibility-filtered timeline | R |
| US32 | Progress bar/duration | Two multi-branch clocks; split displays if large | C |
| US33 | Alert copy/location | Worker/dedup/recipients; spike/split warning/breach/dedup before sprint | C |
| US34 | Day grouping | List/readAt, no push/email | R |
| US35 | Field grouping | One create/edit record; split on estimation; no assignment editing | R |
| US36 | Columns/filters | Scoped lookup, no CMDB | R |
| US37 | History/ticket tabs | Two asset populations; possible split, no expanded access | R |
| US38 | Short handover text | One asset/user, concurrency constraint, no e-signature | R |
| US39 | Return layout | End one assignment/select state | R |
| US40 | State warnings | One state edit, no automatic maintenance | R |
| US41 | Block priority | Three personal blocks; split ticket/asset under roadmap | R |
| US42 | Queue presets | One team dashboard/shared SLA formulas | R |
| US43 | Chart type | Broad KPI/three distributions; split queue KPIs/distributions | C |
| US44 | Line/bar | Trends/mean share sources; split if beyond iteration | C |
| US45 | Table/bar | One grouping, no performance ranking | R |
| US46 | Warning placement | One 30-day window, no email reminders | R |
| US47 | Audit filters | One role-scoped audit set, no SIEM | R |

`C` stories are not claimed fully INVEST-compliant; splitting needs delivery-team assessment. DB/API/UI layers are not standalone user value. Security/concurrency/accessibility belong in every slice.

## Work and coordination stories — US-OPS01–12

Design only, not implemented/estimated. Core US01–47/assistant US-AI01–08 retain IDs. Metrics/permissions stay authoritative in their catalogs, not copied into frontend formulas.

| ID / capability | Story and value | Dependencies / UC | AC / screen / planned milestone |
| --- | --- | --- | --- |
| US-OPS01 / F-OPS01 | As IT Manager, verify skills/schedules/budgets for source-based assignments | Teams/users, UC-OPS01 | AC-OPS01 / SCR-OPS03 / M1 |
| US-OPS02 / F-OPS02 | As Manager, publish workflows/grant/disable policies to bound AI actions | Source/schema/permissions, UC-OPS02 | AC-OPS02 / SCR-OPS06 / M2 |
| US-OPS03 / F-OPS03 | As Requester, understand missing information for correct planning | Ticket/context, UC-OPS03 | AC-OPS03 / SCR21/22/AI01 / M3 |
| US-OPS04 / F-OPS04 | As Manager, review sourced/versioned plans/tasks/DAG for supervision | Template/KB, UC-OPS04 | AC-OPS04 / SCR-OPS02 / M2–M3 |
| US-OPS05 / F-OPS05 | As Manager, let AI assign eligible/available people to reduce manual allocation | Capacity/policy/candidates, UC-OPS05 | AC-OPS05 / SCR-OPS01/04 / M2–M3 |
| US-OPS06 / F-OPS06 | As Technician, update progress/remaining/results under dependencies for accurate tracking | Task/assignment, UC-OPS06 | AC-OPS06 / SCR-OPS01/02 / M1–M2 |
| US-OPS07 / F-OPS07 | As Manager, schedule/load changes trigger evaluation for affected work | Outbox/policy, UC-OPS07 | AC-OPS07 / SCR-OPS03/04 / M2–M3 |
| US-OPS08 / F-OPS08 | As Manager, approve/reject clear-impact exception proposals | Snapshot/policy, UC-OPS08 | AC-OPS08 / SCR-OPS05 / M2–M3 |
| US-OPS09 / F-OPS09 | As Manager, lock assignments/stop automation so AI respects manual decisions | Policy/task version, UC-OPS02/07 | AC-OPS09 / SCR-OPS02/06 / M2 |
| US-OPS10 / F-OPS10 | As Manager, trace runs/actions/control retries without lost/duplicate work | Events/runs/audit, UC-OPS09 | AC-OPS10 / SCR-OPS04 / M2–M3 |
| US-OPS11 / F-OPS11 | As authorized reader, consult Published/versioned/ACL sources; as publisher, manage evidence for answers/plans | KB/index/ACL, UC-OPS10 | AC-OPS11 / SCR-OPS07/AI01 / M4, minimum sources M3 |
| US-OPS12 / F-OPS12 | As Manager, review source-based progress/load/risk/action reports | MET16–22, UC-OPS09 | AC-OPS12 / SCR12/40/OPS04 / M4 |

### INVEST for US-OPS01–12

I: distinct business outcomes/dependencies, not DB/API/UI splits. V: story value. T: matching AC-OPS/A1–A13. Specification alone is not PASS.

| Stories | N — negotiable | E/S — refinement |
| --- | --- | --- |
| OPS01/02 | Calendar/skill entry, scope/publish layout | Split skills/calendar and workflows/policies if large; decide capacity periods/slots/thresholds |
| OPS03/04 | Clarification wording, DAG display | Split intake/plan validation; manager-verified template estimates |
| OPS05/06 | Candidate explanations, board/table | Atomic assignment and progress/dependency separate slices; do not defer authorization/concurrency |
| OPS07/08/09 | Impact/diff/lock layout | Split absence→reassign and stale approvals/manual override if needed; preserve policy rechecks |
| OPS10 | Run timeline/filters | Split retry/observability; define exact business keys |
| OPS11 | Editor/source cards | Split publish/ACL/index/RAG; no production embedding selection |
| OPS12 | Chart/table | Define queries/denominators; no unmeasured performance commitments |

Total target backlog: 47 core + 8 assistant + 12 OPS = 67. M1–M5 is a documented roadmap, not coding authorization.

## US-AI03 and AI Workspace — D-42

US-AI03 in the AI catalog covers authorized cards/forms/confirmation for creation, replies, progress, existing decisions. Retain 67 stories; split domain implementation slices when separately requested. Expanded scope is not an estimated small task. One workspace still separates user actions/background events.
