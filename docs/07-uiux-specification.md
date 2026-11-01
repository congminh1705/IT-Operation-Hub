---
id: itoh-docs-07-uiux-specification
title: "Screen-by-screen UI/UX specification"
type: reference
domain: design
module: screens
tags: [design, screens, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Specify fields, actions, states, and feedback for each screen."
---

# Screen-by-screen UI/UX specification

**Target design — not implemented or tested.** This phase covers documentation only. MVP AI includes an assistant and policy-based coordination; Tickets and execution Tasks are separate. KB/RAG is in scope. See decisions D-34–42 and the authoritative documents for each topic.

Status: **target design, no executable UI**. Read with [IA](04-information-architecture.md), [permissions](requirements/permissions-matrix.md), [design system](design/design-system.md), [content/states](design/content-and-states.md). Screen IDs support AC/traceability. Documentation is English; **all UI/dashboard artwork and its user-facing copy remain Vietnamese**.

Visual refresh **v0.6** introduced more space, 16 px body/14.5 px tables/24 px icons/controlled motion; current AI/login refinements are v0.8. See [visual direction](design/visual-refresh.md), [components](design/wireframes/14-icons-and-components.svg), [responsive/motion](design/motion-and-responsive.md). Core IDs retained; OPS/automation specified below.

## 1. App shell and interaction principles

Desktop 1440 px: 244 px rail with 220 px floating sidebar at x12/y12; 60 px topbar at x260/y16 in 80 px header; 32 px content margins/24 px panel gaps. Light sidebar, pale blue selection/dark blue icon/text, concise IT Operations Hub branding. Topbar searches ticket code/title, has named notifications/account menu. Details use breadcrumbs, one H1/page.

One task-appropriate primary action. Cancellation and submission have distinct emphasis. Named state actions, not arbitrary state dropdowns. Hide unauthorized actions; disabled eligible actions may explain missing conditions accessibly.

Text and icons indicate status. Ordinary flows hide technical snapshot JSON/version/endpoint details; Managers see SLA durations/adjustment history.

## 2. Accounts — SCR01/02/03

**Login:** short introduction left/form right; mobile title and form only. Labeled email/password, named show/hide. Primary “Đăng nhập”; Enter submits; pending “Đang đăng nhập…”. No signup/role picker/email reset/fake CTA. Static notice says Admin provisions accounts/contact internal IT. No DEMO passwords/default production accounts.

**Profile:** permitted name/contact editable; email/role/department read-only. Save only with changes, no self-role elevation. **Password:** current/new/confirmation with policy help before entry. Preserve nonsensitive data on errors, never log passwords. Clear passwords after success/session exit; independent show/hide controls.

## 3. Role dashboards — SCR10/11/12

### Requester

[Personal dashboard](design/wireframes/16-dashboard-requester.svg) shows assistant card, six shortcuts, requests needing response. Device/network/account/other support opens SCR21 with category suggestions; tracking opens own SCR20; Knowledge opens Published/ACL. Cards never submit/create users. Assigned assets remain in navigation; dashboard need not contain every module.

Pending/Resolved display clear states/links; actual reply/acceptance happens in details. Filter by logged-in requester, not entire department; department-head title grants no scope. New-account requests follow D-29.

### Technician

[T dashboard](design/wireframes/19-dashboard-technician.svg) prioritizes assigned work/start guards, tickets needing reply, team queues. T03 is locked with Minh's changed schedule, not ready to start; TKT-000122 has 22 h40 resolution remaining. Ticket/task states remain separate; cards do not reassign.

Existing queues filter membership/unassigned/at-risk/overdue, showing state/priority/SLA/assignee. Self-claim only unassigned current-team tickets, not colleagues' assignment. T has no SCR60/user creation; waiting for internal Admin is not requester Pending.

### Manager/Admin

[M dashboard](design/wireframes/02-dashboard-manager.svg) prioritizes exceptions, operational snapshot, shortcuts. DEMO12 unfinished tickets/3 blocked tasks/1 pending exception/4 at-risk SLA are different overlapping sets, not additive. Minh→Bình proposal retains not-yet-reassigned/lock/window/deadline. Shortcuts OPS01/03/06.

Metrics open exact authorized populations; current queues retain old tickets despite period filters. Period analytics/formulas stay SCR40, not removed by dashboard simplification. No invented percentage trends/AI confidence.

[A dashboard](design/wireframes/17-dashboard-admin.svg) prioritizes TKT-000123 verification, users/organization/categories/SLA/AI availability/audit. TKT-000125 login support is separate; title alone does not imply provisioning. Account queue filters Service Request/Account/nonterminal states, not automation approvals. Opening cards saves nothing.

Only Admin has user/team administration; Manager supervises/intervenes/policies/exceptions, not user admin. Organization reports/queues remain scoped without every KPI on every dashboard. Approval is a separate object/state, not a new ticket state.

## 4. Ticket list — SCR20

Scoped title/description/Create request CTA. Search/state/priority/team toolbar; extra category/assignee/SLA filters; named chips/removal/reset. Choices are authorized. Topbar/toolbar use one ticket search model.

Desktop columns: code/title, requester where useful, state, priority, team/assignee, relevant SLA, updated. Long text has full-reading paths; codes are focusable links. Priority sorts P1→P4, not alphabetically. SLA explicitly identifies response/resolution.

Pagination: scoped count/current page/20-50-100/previous-next labels. No bulk actions in MVP. Mobile cards order code/title→state/priority→assignee→SLA; key deadlines/actions do not require horizontal scrolling.

## 5. Create ticket — SCR21

Page with main form/next-steps panel. Groups: request details, impact, device/files. User does not directly choose team/assignee/priority.

| Field | Input / default | Validation / help |
| --- | --- | --- |
| Title* | Text | 5–180 characters; example shared-folder access issue |
| Type* | Two radios | Personal incident/service request, short explanations |
| Category* | Select | Active only, none preselected |
| Description* | Textarea | 10–10, 000; desired outcome/symptoms/time; no passwords/access codes |
| Impact* | Radio/select | Individual/team-department/organization, no preset |
| Urgency* | Radio/select | Low/medium/high with ability-to-continue examples |
| Suggested priority | Read-only | Compute after both inputs, IT verifies |
| Asset | Searchable select | Optional; R/T personal current assignments only, M/A matrix; device-unrelated option |
| Attachments | Named picker | PNG/JPEG/WebP/PDF, ≤10 MB/file, ≤5; names/sizes/removal before send |

Onboarding adds employee list/configuration-model/quantity/timezoned handover deadline, possibly collected conversationally then confirmed. Requester-provided inputs, not employee-directory/HR access. Missing fields prompt clarification; not mandatory for all tickets.

Primary Submit request, secondary Cancel to list; confirm leaving dirty forms. Next-steps panel explains New/in-app replies/requester closure without promising SLA before valid priority/snapshot. Client assists, server decides. Ambiguous network results need outcome checks, not repeated blind submission.

## 6. Ticket details — SCR22

[Admin provisioning ticket](design/wireframes/18-ticket-account-provisioning.svg) shows In Progress. Admin-only action opens SCR60 to review/enter description data; opening creates no user, passes no personal data in URLs, resolves no ticket. Preserve drafts per recovery rules. R/T/M neither see this block nor bypass backend Admin authorization. Head remains requester; employee is provisioning subject. No new Ticket–User link/automatic created-account detection is required.

Desktop 2/3 content, 1/3 context. Header code/title/state/priority and role/state actions. Public/internal audience clear; internal label states only authorized IT can read. Requester gets no empty internal tabs/note-count badges.

Newest messages at bottom, each with person/role/time/internal visibility/files. New data does not displace reading position; offer refresh conversation. No unsupported real-time promises.

Context: minimal requester/department, type/category, impact/urgency, team/assignee, separate SLA cards, asset. Completed response shows actual duration/outcome; Pending resolution shows paused/used/remaining/history. M/A priority change only; T may suggest in notes.

Timeline separates authorized before/after/reason, never copies notes into public events. Asset links/tooltips require independent permissions.

### State banners and actions

| State | Requester | IT |
| --- | --- | --- |
| New | Track/comment/cancel | Team T accepts/self-claims if unassigned; M/A assigns |
| Open | Track/comment | Assignee starts; M/A assigns |
| In Progress | Comment | Assignee/M/A waits/proposes resolution |
| Pending | Question banner/reply | Assignee/M/A reasoned resume; no direct resolve |
| Resolved | Solution/confirm closure/request further work | Await requester; M/A reasoned reopen |
| Closed | Read-only/contact IT | M/A reasoned reopen |
| Cancelled | Read-only/reason | Read-only |

## 7. Business dialogs — SCR23/24/25

| Dialog/action | Content | Guards / cautions |
| --- | --- | --- |
| Self-claim | Self/current team | Assigned/lost membership/stale version |
| Assign/transfer | Team/assignee/transfer reason/current→proposed | In Progress/Pending replacement; no outside-team assignee |
| Accept/start | Explicit transition, no redundant input | Start needs assignee; no New→In Progress |
| Wait | Public question/audience/optional files | Required content, resolution pause reminder |
| Resume | Reason | Do not pretend requester replied |
| Propose resolution | Work/result/check steps/public preview | Required content; resolve is not close |
| Confirm closure | Solution summary | Ticket requester only |
| Reopen | Reason/current assignee/elapsed SLA | Closed M/A only; invalid-assignee D-12 |
| Cancel | Target state/actor-specific reason | Destructive primary, not deletion |
| Change priority | Current/suggested/new/budget/elapsed/reason | Keep breach history; no SLA reset |

Named title/description/labels/Cancel/specific primary, not generic OK. Escape closes when not sending; dirty outside-close requires confirmation. Sending prevents repeats; errors preserve dialog.

## 8. Assets — SCR30/31/32/33

**List:** code/name/serial/type/brand-model/state/holder-department/warranty. Add asset M/A only; personal view has no all-user filter.

**Form:** required code, optional serial, type/brand-model/purchase-warranty dates/notes. No arbitrary holder/status mass-edit; new assets In Stock. **Details:** profile/current holder/history/related-ticket tabs under scope. Requester reduced view, no previous holders/others' tickets.

**Issue:** active user/display department/date/notes/asset summary. **Return:** date/notes/resulting state. **State:** reason/active-assignment warning. No history edit/delete or issuance of repair/retired devices.

## 9. Reports and notifications — SCR40/50

Report tabs Ticket/SLA/Workload. Date range/team/priority filters follow [metrics](requirements/metrics-catalog.md). Current workload is labeled, not a historical snapshot. Charts provide equivalent table/list for screen readers. No export.

Notifications: All/Unread/time/type; opening rechecks rights/marks readAt. Mark-all-read scoped to self. Empty differs from load error. Badge reveals no content; revoked internal previews become generic.

## 10. Administration — SCR60–65

**Account request reuses SCR21/SCR22:** department head Requester submits Service Request/Account with employee details; no signup/new head role. Admin verifies/records results; head tracks/replies/accepts. No passwords.

**Create user SCR60:** [D-29](requirements/account-provisioning.md), Admin only after verified ticket/authorized setup. Name/work email/department/role/initial password; default Requester. IT roles remind authorized approval. Success confirms creation/enterprise handover, never redisplays password/puts it in ticket/claims email sent. No ticket auto-transition.

| Screen | Components/actions | Error prevention |
| --- | --- | --- |
| Users | Search role/department/active, create/edit/lock/unlock | No delete; show session/ticket impacts; preserve last Admin |
| Departments | Code/name/state/create/edit/deactivate | Retain references/history, no delete |
| IT teams | Lists/form/intake flag/members | Handle assigned work; membership revokes immediately |
| Categories | Create/edit/deactivate | Historical labels remain |
| SLA | P1–P4/duration-units/version/editor/history | New-tickets-only banner, preview, positive values |
| Audit | Actor/action/entity/date filters, redacted diff | M scoped business audit; A additional user/SLA; no secrets |

## 11. Responsive and validation

Desktop cards for shortcuts/tasks/KB; tables for ticket/SLA/audit comparison. Tablet collapsible labeled navigation/context below chat. Mobile drawer/single-column forms/44 px primary targets/tabs or SLA shortcuts. Sticky composers/footers leave keyboard/focus clearance. Mobile samples do not promise every page/breakpoint.

Keyboard/contrast/states/errors in design system/content; future [user validation](research/validation-plan.md).

## 12. Shared AI Workspace — SCR-AI01/02/03 and OPS04

One sidebar “Không gian AI”, `/assistant`. Regular chat/cards+activity simultaneously; compact same-page tabs preserving drafts/focus/context. Background policy automation needs neither chat nor open page. Ticket panel is the same contextual workspace.

Assistant: intent→clarify→trusted form/card→preview/audience/impact→confirm→core API→actual outcome. Reply composer in card/original without overwriting drafts, IT confirms. Separate public/internal sources/forms. Ticket draft/digest/TTL; credentials/rights use trusted security forms, outside models. [Allowlist/flows](10-ai-assistant.md).

Activity identifies policy automation; user cards identify requested actions. M/A scoped runs/proposals/approvals/results; T authorized work; R own public progress. No others' chats/internal client-hidden payloads. Approved ≠ Succeeded.

AI02 previews inside shell, OPS04 activity detail, OPS05 contextual decision; 36 patterns retained, no added page. Provider/assistant disable retains status/manual forms; background policy separately configured. AI03 remains Admin availability with no chat secrets.

[AI design](10-ai-assistant.md) · [Requester](design/wireframes/11-ai-assistant.svg) · [IT actions](design/wireframes/12-ai-ticket-assistant.svg) · [Manager exception state](design/wireframes/23-coordination.svg).

## 13. Work and plans — SCR-OPS01/02

Board shows To Do/Ready/In Progress/Blocked/Done/Cancelled, equivalent keyboard table. Dragging is neither sole transition mechanism nor bypass of services/dependencies. Cards show assignee/remaining-estimate/deadline/dependency-lock/ticket link.

Plan details: goal/effective-history/source/DAG/equivalent list; candidate/schedule/load explanations only scoped IT. Version/assignment/lock changes show diffs/reasons/conflicts, not raw JSON. State-appropriate start/block/remaining/complete CTAs; Done needs substantive result/remaining 0. No AI-complete button.

Requester sees filtered public progress, not workforce/internal reasons. Task completion does not mark ticket Closed.

## 14. Workforce — SCR-OPS03

M/A sees skills/verifier/calendar/absence intervals/budgets/capacity/load/free/unallocated tasks. T self/minimal lookup, no productivity ranking. Explicit minute/hour/period/timezone, missing differs from free. Saved absence shows affected tasks, not claimed reassignment before worker commit.

## 15. Coordination and approval — SCR-OPS04/05

Run timeline: event→sources→proposal→tool→result/error. Distinguish Proposed/Pending approval/Executed/Execution failed. Authorized source/time/actor-policy/reference; no default secrets/raw prompts. Retry only eligible states/intents.

Approval: current/proposed/reason/recipient-load-deadline-SLA impact/policy scope/snapshot age/action. Authorized approve/reject with reason. Conflict retains decision input/re-evaluation; Approved is not execution success. Infeasible means adjust resources/plans, never force assignment.

## 16. Policies/templates and KB — SCR-OPS06/07

Manager configures workflow/team/priority/actions/limits/grantor, previews scope/impact before toggling; no default grants. Templates Draft/Published/version/steps/skills/effort/dependencies/sources/feasibility. Manual locks/decisions show reasons, never removed by polling.

KB search/Published/version/audience/citations. Granted authors/publishers have draft/edit/publish/access/history distinct from readers. ACL changes immediate; indexing state cannot reveal revoked content. Detailed editor/publisher rights remain D-40.

## 17. States, polling, design coverage

Loading/empty/filter-empty/error/forbidden/conflict per panel. No DEMO fill-in or pending/approved-as-success. Default 30 s active-tab polling, user/scope caches cleared on revoke/logout; polling never triggers workflows.

Keyboard/focus/reduced-motion/mobile design system. DAG list alternative; mobile approval current then proposed, no mandatory horizontal scroll. All 7 OPS illustrated, no full prototype/a11 y/every state/breakpoint; [gallery](design/wireframes/README.md).

## 18. v0.6 design crosswalk and business gates

37 SVG=34 UI+3 boards; [crosswalk](design/wireframes/README.md) links 36 IA patterns. Screen IDs/51 UC/67 stories/states/roles/SLA/APIs unchanged. [Apple review](design/uiux-review.md) records principles/hex measurements/judgment/unrun gates.

| Confirmed journey | v0.6 examples | Invariant actions/conditions |
| --- | --- | --- |
| Submit/track/clarify/accept | 04/09/16/06 | R form/matrix priority/public Pending/requester guarded close-reopen |
| Technician intake/execution | 05/19/20/35 | Ticket≠Task; scoped self-claim; progress/result/remaining/dependencies; no colleague assignment |
| AI understand/plan/select/assign/monitor | 11/20/21/22/23 | Clarify missing data/Published sources/skills-calendar-load/proposal≠action |
| Absence/lock/exception | 22/23/24/25 | M reviews impact/grants/locks; approval grants neither success nor extra authority |
| New account | 17/18/27 | Head R requests/Admin verifies/creates/no secrets/auto-close |
| Assets | 07/29 | M/A mutations/single active assignment/preserved history |
| KB/AI settings | 26/34 | Published/ACL readers; publisher D-40; Admin availability≠Manager policy |
| Admin/audit/feedback | 28/30/31/32/33/10/13 | Own profile/source metrics/recipient/redacted audit/preserved drafts |

UI35 T07/TKT-000126 for Bình DEMO is separate from onboardingT03. Unsubmitted 45 remaining versus stored 60. Bình11–14 forT03 still rechecks at execution. UI20–25 T03 locked→approval does not change unlocked automatic diagram branch.

### v0.6 shell and grouped patterns

Light selected navigation, distinct primary button; one task primary. Medium/compact drawers, no mandatory role-native tab bars. Profile 02/03, assets 30/31, organization 61/62/63, errors 90/91 share views/boards; dialogs 23/24/25/33 contextual, not every modal separate. T07 completion opens confirmation; only domain transition means Done. Policy edits/disable previews; absence entry leads to affected tasks.

Artifact pixels are references, not screenshot-scaled CSS; implement auto-height/reflow at 320 px/200% zoom. Assistive technology/semantic HTML/keyboard/animation/HTTP untested.

## 19. Cards and reduced reading load v0.6

Combine earlier UI/P-047 shortcuts/Apple principles. [Sources/tradeoffs](design/visual-refresh.md), [tokens](design/design-system.md), [destinations/effects](design/content-and-states.md).

One main task per region, short label/supporting line, labeled icons rather than icon-only language. Disclose long explanations without smaller text/poor contrast/truncated tickets/hidden mutation consequences.

| Context | Always visible before action | Expandable |
| --- | --- | --- |
| Ticket/reply | Sender/assignee/state/SLA/audience/draft status | History/technical sources |
| Task | State/assignee/remaining-units/deadline/dependency-lock/ticket | Estimates/history/guard explanations |
| Workforce | Verified skills/window/remaining-free/timezone/missing data | Sources/detailed schedule |
| Approval | Before-after/exception-lock reason/feasibility/deadline-SLA impact/snapshot/decision≠effect | Excluded candidates/policies/sources; always recheck rights |
| AI | Sources/versions/missing data/unsent-uncreated/confirmation | Scoped history/citation details |
| User admin | Request ticket/identity/role-department/empty password/Admin-only | Permitted handover/authority evidence |
| Reports | Period/scope/value/denominator where needed | Formula/source drill-down |

UI20 uses 3×2 task cards; equivalent keyboard table, no new Kanban/drag transition capability. Position does not change state. Topbar searches SCR20 tickets, not globally. Quick cards open screens/forms, no implicit actions. Actual HTML card/accordion/toggle/zoom/focus gates NOT RUN.

## 20. AI Workspace interaction states

Action card: Not sent→Sending→Saved or Failed/Outcome unknown. Runs separately track event/proposal/approval/execution/result; do not merge lifecycles. Tabs/reading do not retry/mutate. Recheck scope/version at confirmation/render/poll; conflicts preserve input. Saved only from domain response/link, never draft/stream/model completion. Approval retains diff/impact/reason despite shorter copy.

## 21. Button alignment and login v0.8

Primary/secondary/destructive/AI buttons center the entire icon-label group horizontally/vertically, 8 px gap, not separately centered text. Icon-only centers icon; menus/cards/rows remain content-left/chevron-trailing. Implement inline-flex center, not SVG coordinates. Standard CTA: at least 44 px, login 52 px/16 px text. Loading preserves size/blocks repeat click/Enter.

Regular SCR01: compact branding, 644 px introduction/624 px form card on a 1440 px canvas; 512 px form/52 px inputs/clear spacing. Mobile 320 px+ brand/form/help, decorative illustration hidden, auto-height single column.

- Email label/type=email/inputmode=email/autocomplete=username, API normalization, no autocorrect/capitalization. Password/current-password permits paste/managers, no trim/case conversion/truncation/prefill.
- Show/hide 44 px, named/pressed/type=button, preserves value/caret/focus; Caps Lock only when actually active.
- Required/email validation after blur/submit, not before interaction. Focus first error with aria-invalid/describedby; text/icon not border alone.
- Enter shares validation; sending stays positioned with status/aria-busy, no repeated submits/layout shifts.
- Generic auth failure hides existence/lock state; preserve email, password only in current form if policy permits, never log/persist/chat. Clear sensitive data on success/exit.
- Network versus auth errors distinct; timeout does not mean wrong password. Check session before ambiguous retry; no automatic password retries/invented rate counters/locks.
- Success uses current session/rights and allowed page/internal allowlisted return path; no open redirect/protected-data remnants.
- D-16/19 retained: Admin accounts/internal IT help, no signup/role picker/email reset/SSO/MFA/remember-me without policy decisions.

[Login](design/wireframes/01-login.svg) · [Six interaction groups](design/wireframes/36-login-states.svg). SVG design only, no working inputs/ARIA/auth.

SCR-AI02 represents the scoped forms and previews inside the workspace. SCR-OPS04 provides activity drill-down, and SCR-OPS05 provides exception decisions in the same context. These are regions or interaction patterns within the existing inventory of 36 patterns. SCR-AI03 remains an Admin settings screen; secrets never belong in chat. When the provider is disabled or unavailable, authorized manual forms and recorded activity remain accessible. Assistant generation and background policy controls have separate availability states.

## 22. Recognizing the assistant and supported work

AI Workspace is the shared page; prominent **Trợ lý AI** name/purple AI avatar/tagline/four role shortcuts identify its interaction area. Assistant cards/messages retain identity; user messages identify self. Chat is not public IT conversation.

| Role / example | Four initial shortcuts | Limits |
| --- | --- | --- |
| R/UI11 | Create request; Track requests; Reply to IT; Find guidance | Own/public/KB ACL, no workforce/internal coordination |
| T/UI12 | Summarize ticket; Draft reply; Update progress; Find guidance | Explicit eligible ticket/task/assignee/state/audience; do not guess task |
| M/UI37, exception view UI23 | View work; Record absence; View exceptions; View reports | Current rights; absence/decisions still preview/confirm |
| A | Granted capabilities/context | Shared component; no secret/grant actions in composer |

Shortcuts are registry examples, no new rights/endpoints/universal adapters. Choosing intent opens forms/suggestions, not implicit model/mutation; retain existing drafts. Ask/select missing resources before preview; confirmation has its own action verb.

Composer explicitly names messaging the assistant, with role examples and send-to-assistant control. Short help says assistant prepares; user reviews/confirms before send/save. AI-send is not public-comment send/task completion; form submission separately confirms business action.

Right region has clock icon/automatic coordination for M/A or automatic updates for R/T, no composer. Real configured running/off/waiting state, not permanently green. D-42 unchanged.

Empty chats keep capabilities/examples. Compact ongoing chat may collapse suggestions behind a reopen control without losing identity/composer/drafts. Intent switches preserve input and are explicit, no silent send. Unavailable provider explains reason/manual fallback without promising disabled actions.

## 23. Assistant card immediately above chat

UI11/12/23/37 use one column: identity+four suggestions immediately above chat, 12 px gap, no intervening module. One continuous chat frame contains user/assistant messages/requested forms/composer, not independent detached panels.

Full replacement proposal retains before-after/window/remaining/skills/lock/deadline/SLA/view-approve SCR-OPS05 (UI24). Independent coordination region outside chat, conditional on authorization/proposal, not default assistant reply. UI23 places proposal above workspace, assistant immediately above chat, background activity right. Chat demonstrates separate reporting work. Approval remains after proposal/before effects with unchanged rights/versions/feasibility.

### Assistant independent of coordination cases

Authorized work may start without runs/proposals, before/during/after coordination, or with automation policies off if assistant/data/access are valid. Do not bind all chat to latest absence/reassignment. User selects/confirms context; ask for missing targets rather than using the displayed run task.

UI23 October DEMO report:24 created/18 resolved/5 h20, n=18 matches UI30; different populations, not UI18/24 inferred rate. Assistant also supports role-based creation/lookup/replies/progress. UI11/12 retain separate cases. Without proposals remove the region/raise assistant-chat, no empty placeholder or approval prerequisite.

## 24. Sequential coordination progress

UI23 uses numbered vertical stepper/next arrows/text states. Locked DEMO-004 has 5 steps:

1. Absence recorded — done 10:00, Hà DEMO source.
2. Replacement proposed — done 10:01, not reassigned.
3. Exception approval — awaiting authorized decision because locked.
4. Recheck rights/schedule/load and reassign — not run; approval does not skip guards.
5. Notify/monitor — not run; only after successful assignment.

Header identifies 3/5 waiting. Done numbers/green/status text; current amber outline/label; future outlined/Not run. Completed connectors solid with arrows; future dashed arrows. Not color/ambiguous timestamps alone.

One run's progress, not forced sequential execution of parallel task DAGs. Eligible unstarted/unlocked policy work may omit/mark no-approval and adjust step count, no fake approval. Rejection stops execution; stale/revoked/infeasible step 4 shows error/re-evaluation, not successful step 5. Presentation steps add no backend enums/rights.

Future ordered-list/step semantics, aria-current=step, textual concise updates without focus jumps. Progress comes from persisted events/decisions/executions, not animation/model text. Illustration only.

## 25. Normal AI Workspace is default

| Design state | Figure | Rule |
| --- | --- | --- |
| Normal, no exception | UI37 | No approval proposal; assistant/suggestions immediately above top chat; authorized automatic activity remains |
| Exception needing action | UI23 | Explicit exception title, authorized M/A only; full proposal/5 steps/current 3/5 locked fixture |
| Review/decide exception | UI24 | Before-after/impact/reason/state/version/authority; decision≠execution |

UI37 is default representative; UI23 caption explicitly exceptional, not always-present reassignment. Same SCR-AI01/02/OPS04 and `/assistant`; 36 IA patterns/37 artifacts=34 UI+3 boards. No new role/UC/API.

Independent NORMAL(DEMO-N01) and EXCEPTION(DEMO-004/T03) fixtures, not before/after one snapshot. NORMAL has granted DEMO onboarding policy/Published data/sources/feasible candidates/no locks/out-of-scope work: received 09:00, plan checked 09:01, assigned 09:02, notified 09:02. Four-step no-approval run is not specialist Task Done/Ticket Closed. IT staff continue execution; AI monitors events.

UI37 starts a new empty chat with static greeting, no model call needed to open. Selected existing conversations preserve context/history. No recent runs→empty activity, disabled policies/provider failure→actual state under separate assistant configuration. Production logs/counts/status derive from real records, never hard-coded fixtures.
