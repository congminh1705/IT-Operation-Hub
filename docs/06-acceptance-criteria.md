---
id: itoh-docs-06-acceptance-criteria
title: "Acceptance criteria and business scenarios"
type: reference
domain: quality
module: acceptance
tags: [quality, acceptance, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Define planned AC and scenarios for core business and coordination."
---

# Acceptance criteria and business scenarios

**All AC/TC are PLANNED, not run on an application.** AC numbers match their stories. Given–When–Then defines observable outcomes, not executable tests. Acceptance requires the story's own and relevant cross-cutting AC.

## Story acceptance criteria

| AC | Given — context | When — action | Then — required outcome |
| --- | --- | --- | --- |
| AC01 | Active user, valid credentials | Submit login | Server session/correct dashboard; generic wrong-password/locked-account error without existence disclosure |
| AC02 | Valid session | Logout, reuse session | Rejected; clear private client data, not only navigation |
| AC03 | Signed in | Edit profile/forge role or userId | Only allowed personal fields change; no role/ID mass assignment; preserve errors |
| AC04 | Correct current password | Change to valid password | New password works, old fails, other sessions revoked; wrong current password changes nothing |
| AC05 | Admin/active department; verified D-29 head ticket or authorized setup | Create user | Default Requester, unique email/valid role; IT-role approval; no password response/audit/ticket or unconfigured email. R/T/M API denied; ticket alone creates no user |
| AC06 | Historical user | Admin changes role/department | Preserve history/current access/audited old-new; handle assignments losing IT eligibility; preserve last active Admin |
| AC07 | Multiple user sessions | Admin locks; old-session API call | All denied; unlock restores no sessions; history retained; handle open assignments before completing lock |
| AC08 | Referenced department | Admin deactivates | Absent from new choices, readable history; no deletion of referenced records |
| AC09 | Active intake team | Change/deactivate intake | Exactly one valid intake; no teamless tickets; transfer open work before team deactivation |
| AC10 | T member with team tickets | Remove membership | Next-request scope revoked, assigned tickets handled; other-team membership grants only that team's scope |
| AC11 | Category has tickets | Deactivate | Historical labels retained, unavailable for new forms; names/codes unique under rules |
| AC12 | Existing old-snapshot tickets | Save new SLA table | Audited version; existing budgets unchanged, new tickets use new version; reject nonpositive budgets |
| AC13 | Own asset, complete configuration | Submit valid ticket | New/unique code/session requester/matrix priority/snapshot/event; reject others' assets/arbitrary priority. D-29 creates ticket only; head remains requester |
| AC14 | Multiple ticket scopes | Search/filter/sort/page | Authorized population/count, stable sorting, filter resets page 1, back preserves query, no total-count leaks |
| AC15 | A requester, B ticket with note | A changes URL/API ID | No B access; own-ticket projection excludes notes/note files/internal metadata |
| AC16 | M/A assignment dialog | Change team/assignee with reason | New-team eligible assignee, old/new event/notification, no SLA reset; no empty assignee in In Progress/Pending |
| AC17 | Two team T, unassigned ticket | Same-version simultaneous claims | One success, other conflict/fresh state; cannot claim for others |
| AC18 | New team ticket | T accepts | Open/event, firstResponseAt empty absent public comment |
| AC19 | Open ticket | Start with/without assignee | Valid assignee/actor required; New→In Progress rejected |
| AC20 | Requester's Pending ticket | Substantive public reply | Atomic comment/In Progress/resume; first eligible public IT comment sets firstResponseAt, notes/content-free files do not |
| AC21 | Authorized T and requester | T posts note; requester reads comments/files | T sees note, requester no content/metadata/notification; no first response |
| AC22 | Files in form | Send ≤5 allowed files, each ≤10, 000, 000 bytes | Server validates; reject sixth file, one-byte oversize, MIME/extension spoof, SVG; preserve text |
| AC23 | Public/internal files | Requester/other-team T/old post-transfer URL download | Only readable parent content downloads; no public directory/path traversal |
| AC24 | In Progress with assignee | Wait with question; IT resumes with reason | Pending/public comment/resolution pause; resume preserves usage; empty question/direct Pending→Resolved rejected |
| AC25 | In Progress | Submit solution/empty text | Substantive public solution/Resolved/stopped resolution; empty preserves state/form; no auto-close |
| AC26 | R's Resolved ticket | R closes; unrelated IT attempts | R→Closed, non-requester IT denied; preserve solution/events |
| AC27 | Resolved, valid assignee | Requester reopens with reason | In Progress, remaining budget/history/reason retained; plain Resolved comment does not reopen |
| AC28 | Closed | M/A reopens with reason; R/T direct call | M/A only; elapsed/breaches preserved; invalid assignee requires reassignment first |
| AC29 | New/Open/Resolved, different actors | Cancel | Requester own New only; M/A New/Open/In Progress/Pending with reason; terminal Cancelled, no deletion/reopen |
| AC30 | P3, elapsed time/breaches | M/A priority/reason | Snapshot budget, elapsed unchanged/history preserved; T/R/missing reason denied |
| AC31 | Public/internal timeline | Read/page | Stable timestamp/tie-breaker, authorized actor/old/new/reason; no note leaks in event text |
| AC32 | Running/paused/resolved/reopened | View clocks at fixed time | BR-08–10; 80% risk, 100% overdue; Pending pauses resolution only; completed clocks do not count down |
| AC33 | Threshold crossed, UI closed | Repeat/concurrent workers | Correct recipients, one notification/key, history retained through priority/reopen; first scan after 100% skips obsolete warning |
| AC34 | Two users' notifications | Read/mark/forge recipient ID | Own only, idempotent readAt, current link rights; no internal previews after revocation |
| AC35 | M/A asset form | Create/edit/forge assignee | BR-11 code/serial/date validity; holder changes only through issue/return, no mass assignment |
| AC36 | Multiple assets | R/T search/filter | R current assigned only; T own/team-ticket support assets; scoped lookups/counts |
| AC37 | Multiple assignments/requesters | Asset details | M/A history; R reduced view/own tickets; T scoped; no asset-to-ticket authorization bypass |
| AC38 | In Stock, active user | Concurrent M/A issue | One active assignment, atomic In Use; no repair/retired issue |
| AC39 | Active assignment | Return to stock/repair | End assignment, actor/date/correct state/history; repeated return adds nothing |
| AC40 | Assigned/unassigned asset | Reasoned state change | BR-11; return before retirement, no repair issuance; old/new audit/event |
| AC41 | R with Pending/Resolved/assets | Personal dashboard | Scoped MET11/12/My requests; correct reply/accept CTA, no organization KPIs |
| AC42 | T in two teams | Work dashboard | MET13/14/team SLA union without duplicates/out-of-team data |
| AC43 | Old tickets/new period, M/A | Dashboard/date filter | Current queue retains old backlog; labeled cohort charts; MET01–05 exact drill-down, no sum of overlapping KPIs |
| AC44 | Repeated resolve/reopen/Pending | Trends/mean | MET06–08, once per latest resolution, active duration, n=0→“—”, source reconciliation |
| AC45 | In Progress/Pending/unassigned | Current workload | MET09 by assignee, separate unassigned, counts not performance scores, source totals |
| AC46 | Warranty within/outside 30 days/missing | Warranty module | MET10 local-day boundaries; missing not expiring, retired excluded |
| AC47 | User/SLA/ticket/asset audit | M/A reads | M scoped ticket/asset/workforce/automation; A authorized user/SLA admin; actor/time/old/new, no passwords/tokens/file bodies |

## Cross-cutting criteria

| ID | Condensed Given–When–Then |
| --- | --- |
| AC-X01 | Forged role/userId/teamId/ticketId/assetId: authorization derives from server session/relationships, not request body |
| AC-X02 | Field errors/conflicts preserve forms and focus errors/conflict banner; no silent overwrite |
| AC-X03 | Network/5 xx never shows zero/success; controlled retry without duplicate mutations |
| AC-X04 | Keyboard reaches navigation/filters/table links/tabs/dialogs; visible focus, correct modal trap/return |
| AC-X05 | 320/390/768/1440 and 200% zoom retain main tasks; textual state/priority/SLA, not color alone |
| AC-X06 | Expiry hides protected data/returns to login; suitable unsent input only in page memory, no localStorage/token URL |
| AC-X07 | Period boundaries convert Asia/Ho_Chi_Minh→UTC; history/SLA use one source timestamp |
| AC-X08 | Test app/DB restarts retain tickets/comments/files/assignments; DEMO marked separately |
| AC-X09 | Stale concurrent versions conflict; no partial state without event/assignment |
| AC-X10 | Distinguish no data/filter no matches/load error; no DEMO insertion into actual reports |

## SLA examples for future automation

All timestamps UTC, continuous durations; TCs are plans only.

| ID | Data/action | Expected |
| --- | --- | --- |
| TC-SLA01 | P2 created 08:00, assigned 08:05, note 08:10, public IT08:20 | First response 20 m; assignment/note do not stop clock |
| TC-SLA02 | Created 08:00, Pending 09:00, requester 11:00, Resolved 12:00 | Active resolution 2 h; Pending 2 h excluded |
| TC-SLA03 | TC02, Closed 13:00, M reopen 15:00, Resolved 16:00 | Total 3 h; 12:00–15:00 excluded |
| TC-SLA04 | P3 used 3 h→P1 | Resolution budget 4 h, remaining 1 h; no reset |
| TC-SLA05 | P1 used 5 h/breached→P3 | Snapshot remaining 19 h; P1 breach retained |
| TC-SLA06 | P2 resolution 6 h24 m then 8 h | 80% at risk, 100% breached; dedup each threshold |
| TC-SLA07 | Two runs/two concurrent workers | One notification/recipient/key, not four |
| TC-SLA08 | Default P3 24 h→12 h | Old 24 h/new 12 h; old ticket priority changes use old snapshot |
| TC-SLA09 | Reopen used 9 h/8 h | Immediately overdue; no extra 8 h or repeated prior alert |
| TC-SLA10 | No first response, engine Pending fixture | Response now-createdAt; resolution paused. Engine fixture despite normal UI Pending creating public question |
| TC-SLA11 | IT self-created/self-handled, no other eligible IT public reply | No fake timestamp/met result; termination stops alerts, reopen response counts from creation under D-21 |
| TC-SLA12 | P2 response 20 m→P1 | Compare 20/15, retain firstResponseAt; adjustment breach recorded now, prior budgets unchanged |

Technical/accessibility testing requires an application. See [user validation plan](research/validation-plan.md).

## Work/automation AC — PLANNED / NOT RUN

| ID | Given / When | Future required outcome |
| --- | --- | --- |
| AC-OPS01 | Staff/skills/calendar; M updates or T self-verifies | Only authorized verification, version/audit/event; missing ≠ free; absence overlaps subtracted once |
| AC-OPS02 | Draft/Published template/policy; M grants/disables | Default deny, valid workflow/team/priority/actions/limits/grantor/version; changes effective before writes |
| AC-OPS03 | Missing employee list/configuration/deadline | Structured deduplicated clarification; no fabricated people/devices or incomplete execution |
| AC-OPS04 | Schema/DAG proposal, cycle/stale version | Valid sourced/verified-effort DAG only; one effective version; no partial tasks on invalid/stale |
| AC-OPS05 | Ineligible group/skills/schedule/load; two assignment workers | Eligible only, atomic per-period/slot allocation, no overbooking; infeasibility exception |
| AC-OPS06 | Missing predecessors or In Progress | Reject premature/invalid transitions; authorized human result/remaining 0 for Done; no ticket closure |
| AC-OPS07 | Absence/load/blocker/risk | Affected-task events; policy unstarted reassignment, otherwise exception; no autonomous SLA change |
| AC-OPS08 | Pending approval/data/policy/capacity changes | Correct authority/version; stale/revoked/infeasible blocked/re-evaluated; separate decision/execution |
| AC-OPS09 | Manual lock/in-progress or disable while model runs | No overwrite/post-revocation writes; valid audited compensation only; no history deletion |
| AC-OPS10 | Duplicate events/postcommit retry/broker/provider failure | No duplicate tasks/allocations/actions/notifications; outbox recovery/bounded retry/failed state/provenance |
| AC-OPS11 | KB Draft/Published/internal; ACL revoked during index/model | Authorized sources only before retrieval/provider/citation; immediate removal, not embedding-dependent; injection grants no tools |
| AC-OPS12 | Reports/runs with/without usage | MET/source/period/scope consistency, no draft execution counts; sourced latency/tokens/cost or explicit unknown, no invented effectiveness |

## MVP gates A1–A13

| ID | Target condition | Main trace |
| --- | --- | --- |
| A1 | Eligible ticket triggers real persisted AI plans/tasks/assignments under enabled policy | AC-OPS03–05 |
| A2 | Valid schema/DAG, predecessor start guards | AC-OPS04/06 |
| A3 | Correct team/skills/calendar/capacity; infeasible exception | AC-OPS01/05 |
| A4 | Schedule changes trigger evaluation/policy reassignment/out-of-authority escalation | AC-OPS07/08 |
| A5 | Two workers/replay/retry without duplicates/overbooking | AC-OPS05/10 |
| A6 | Reject stale approval, respect manual decisions | AC-OPS08/09 |
| A7 | Action provenance event/policy/source/grantor/result | AC-OPS10/12, AC47 |
| A8 | Ticket/SLA/scope/notes/assets correct through direct APIs | AC13–40, AC-X01/09, TC-SLA01–12 |
| A9 | Authorized cited KB, no chat/run/retrieval leakage | AC-AI01/02/04/07, AC-OPS11 |
| A10 | Timeout/invalid output/injection/broker outage safe; manual flows usable | AC-AI08, AC-OPS09–11 |
| A11 | Fixed real-model scenarios before acceptance; mocks do not replace gate | TC-OPS01–12, D-39/40 |
| A12 | Reports reconcile sources; supplied latency/usage/cost recorded | AC41–46, AC-OPS12, MET16–22 |
| A13 | README clean setup, controlled migrations, restart persistence, backup/restore | AC-X08/09, architecture operations |

All NOT RUN. Design schemas/APIs alone do not satisfy A1/A11/A13.

## Fixed automation/AI scenarios — planned

| ID | Scenario | Expectation / distinguishable failures |
| --- | --- | --- |
| TC-OPS01 | Complete 10-person onboarding, enabled policy | Model plans/ranks; service creates/assigns/notifies; distinguish planning/execution failures |
| TC-OPS02 | Missing list/configuration/deadline | Deduplicated clarification, no fabrication |
| TC-OPS03 | Device/staff/skill/capacity shortage | Evidence-backed exception, no forced assignment |
| TC-OPS04 | Cycle/unknown dependency/premature start | Schema/domain rejection, no partial plan |
| TC-OPS05 | Sudden absence, unstarted task, eligible replacement | Event→re-evaluation→policy assignment |
| TC-OPS06 | In-progress/locked/out-of-scope/commitment change | Specific approval, no overwrite/SLA extension |
| TC-OPS07 | Duplicates/retries/two workers competing | One effect/intent, no overbooking; actual PostgreSQL uniqueness/locks |
| TC-OPS08 | Changed data/policy after proposal/approval | Stale/revoked blocked before write, new proposal if needed |
| TC-OPS09 | Timeout/refusal/invalid output/missing usage | Bounded retryable failure, no partial tasks, conservative unknown cost |
| TC-OPS10 | KB injection/ACL revoked during generation | No elevated tools/rights/source/history leaks; suppress revoked output |
| TC-OPS11 | Broker down/worker dies postcommit pre-ack | Core API if DB healthy; durable outbox/dedup; monitor SLA scan delay, recover from PG without resets |
| TC-OPS12 | Human Done/requester acceptance; restart/restore/report | No auto-close; trace facts/persistence/usage; no unintended restore replay |

When implementation is separately requested, use labeled synthetic DEMO/test DB separate from production. Report provider/model/version, inputs/sources/expected outcomes, tools/results, model versus domain failures, tokens/latency/cost/unknown. No unmeasured improvement claims.

## D-42 — Shared screen and action-channel acceptance

Inherit AC-AI03/TC-AI13–18 in the [AI catalog](ai/use-cases-stories-and-acceptance.md), all PLANNED/NOT RUN. Complete a native card action with actual user-actor domain effects and observe scoped background runs with chat opened/closed. Model “done” text/static UI is not commit evidence. Retain original AC/SLA/states/permissions; no open-chat prerequisite for automation.

### UI gates for confirmed requirements

Keep existing AC/TC IDs; add subcases rather than new UC/story counts. TC-AI13/UT-AI07 cover independent chat/worker behavior without run, while approval pending, and with automation disabled. TC-AI14 covers confirmed real form submission. TC-OPS05/06/08 cover automatic/locked/stale-approval branches. Stepper shows committed/current/future steps with arrows; Approved is not an effect.

Login 01/board 36/action buttons require future keyboard/focus/show-hide/Caps Lock/validation/password-manager/loading/duplicate-submit/error/return-path/group-alignment checks. Usability must verify the full proposal, assistant immediately above chat, and recognition of non-reassignment intents. Future criteria, not passing test results.
