---
id: itoh-docs-research-validation-plan
title: "Research and design validation plan"
type: planning
domain: quality
module: discovery
tags: [quality, discovery, planning]
priority: 1
status: planned
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Plan research, usability, and evidence collection without claiming field results."
---

# Research and design validation plan

**Not conducted.** No actual participant counts/success rates/interview quotations. Plan to validate H01–H06 after document review.

## Proposed questions and participants

Discovery:2–3 Requesters from different departments, 2 specialist Technicians, 1 IT Manager, 1 Admin. Purposive qualitative sample, not statistical representation. Consent before recording; fictitious scenarios, no passwords/sensitive tickets.

| Role | Open, nonleading questions | Evidence sought |
| --- | --- | --- |
| Requester | Describe the last IT problem, submission channel/follow-up/completion definition | Actual channels/repeated inquiries/state comprehension |
| Technician | How prioritize? Where consult colleagues? Last team transfer? | Queues/minimum context/public-internal risks |
| Manager | How find forgotten/overdue work? What supports reassignment/transfer? | Priority metrics/backlog/load meaning |
| Admin | How handle departure/team changes/sessions/tickets/assets? Who edits SLA? | Provision/revoke/invalid assignees/password handover |

Observe real tasks if permitted; desired answers are not observed behavior. Record observations/consented quotes/team inferences/hypotheses/confidence separately.

## Tree testing and terminology

Find where to report network failure/reply to IT/accept resolution/view assigned devices/find unclaimed team work/change members/view default SLA. Measure first choice/path/time/naming without suggesting menus. Compare My requests/IT work when IT is also requester.

## Moderated usability

Static SVGs support walkthrough only, not interactive click time/task-success measurement. Facilitated paper prototypes may switch drawings with explicit simulation disclosure. Use synthetic data in future prototypes/apps.

| Task | Participant / prompt | Observation / target |
| --- | --- | --- |
| UT01 | R shared-folder failure affecting department | Correct type/category/impact/urgency, explain priority, no assignee choice |
| UT02 | R answer IT's screenshot request | Find Pending/question, understand resume on send |
| UT03 | R failed solution, later successful solution | Reasoned reopen versus close; no accidental closure |
| UT04 | T claim unassigned ticket/find asset context | Team scope/self-claim/authorized history |
| UT05 | T public reply then IT-only note | Correct audience, note not first response |
| UT06 | M find/transfer work | Current KPI versus period, eligible assignee/reason |
| UT07 | M P3→P1 after 3 h | 1 hremaining, not extra 4 h; breach history |
| UT08 | M issue laptop/return for repair | One assignment/no repair reissue/history |
| UT09 | A edit SLA/lock assigned user | New-ticket scope/revoke/handover |
| UT10 | Keyboard/mobile filters/dialog/field error | No traps/readable errors/retained forms/main actions |

**Proposed** first-round target:≥80%unassisted core-task completion on the trial sample; **0 wrong-audience internal posts/authorization misunderstandings** before design sign-off. Record success/critical errors/help/first click/self-rated ease 1–7. Timing only with suitable interactive environments, no arbitrary SVG seconds.

## Expert and quality review

[NN/g heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/): visibility/prevention/consistency/recovery. Accessibility checklist, conformance only on live UI. Process-owner review for states/first response/D-09 snapshot/D-12 invalid-assignee reopen/MET07–08.

Severity: **critical** access leaks/data loss/wrong audience/incorrect state-SLA; **high** task blocked/closure-reopen misunderstanding; **medium** help needed; **low** slow/readability difficulty but completed. Fix/retest critical/high before implementation design sign-off.

## Results template

Finding ID/date/task-role/observed facts/impact/severity/screen-story/proposed change/retest. Never invent results. Update decisions/traceability after confirming/rejecting assumptions.

## Task and coordination validation

| Task | Role / prompt | Observation / evidence |
| --- | --- | --- |
| UT-OPS01 | M verifies skills/schedules/grants onboarding | Default deny/workflow-team-priority-actions/disable |
| UT-OPS02 | R conversational ticket/edit-confirm preview | Draft/confirmation/real result distinction |
| UT-OPS03 | T plan/dependency-start/progress-result | Guard reasons/Ticket≠Task/Done≠Closed |
| UT-OPS04 | M absence/reassign/exception | Automatic versus locked/in-progress decision |
| UT-OPS05 | M approves then data/policy changes | Stale/conflict/re-evaluation/decision≠execution |
| UT-OPS06 | M run/report/cost/manual intervention | Source-event-policy-actor-result/unknown cost/manual lock |
| UT-OPS07 | Reader/publisher publish/revoke/re-read | Draft/Published/version/audience/no revoked content |
| UT-OPS08 | Keyboard/mobile/reduced motion | Board table/DAG list/readable diff/focus/errors/drafts |

Technical TC-OPS01–12/A1–A13 acceptance is separate from usability. No research/benchmarks/model eval/application tests run; plan-only work.

## D-42 — Shared workspace validation

AI catalog UT-AI07: R replies/T updates/M approves through cards; distinguish asked/sent/approved/executed. Observe reading effort/action discovery/same-screen completion, no invented success metrics/results. Test compact tabs/focus/drafts/provider unavailable. PLANNED/NOT RUN.

## Recognize and start assistance

Extend UT-AI07: on first visit identify assistant/background activity, name a supported action, start from shortcut/example. Distinguish Send to assistant from Reply/Save progress. Test targets/compact/revocation/unavailable provider/existing drafts. No research results/success rates.

## Coordination example versus assistant scope

Simultaneous replacement proposal/report chat: recognize other assistant work without approving/waiting for run. Test no run/pending approval/automation off with available assistant, unchanged permissions/sources. No results.

## Default-screen recognition

Compare UI37/UI23: normal versus exception; chat without approvals; 4 successful assignment steps do not mean specialist completion. Test no-run/new-existing chats/R-T-M-A/exception-count changes/revocation. No usability results.
