---
id: itoh-docs-ai-use-cases-stories-and-acceptance
title: "On-demand AI assistant: use cases, INVEST, and acceptance"
type: reference
domain: ai
module: assistant
tags: [ai, assistant, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Maintain the single catalog for assistant UC/US/AC and validation cases."
---

# On-demand AI assistant: use cases, INVEST, and acceptance

**Target design — not implemented or tested.** This phase covers documentation only. MVP AI includes an assistant and policy-based coordination; Tickets and execution Tasks are separate. KB/RAG is in scope. See decisions D-34–42 and the authoritative documents for each topic.

**Additional scope:** 8 use cases/8 stories, all design only; retain core 33 UC/47 US IDs. `UC-AI`, `US-AI`, `AC-AI`, `SCR-AI` are separate namespaces.

## Use-case catalog

| ID | Goal / actor | Preconditions and main flow | Outcome / exceptions |
| --- | --- | --- | --- |
| UC-AI01 | Cited guidance — all users | Enabled assistant/approved sources; ask → resolve scope → valid retrieval → answer/cite | Explicit lack of sources; no guessed enterprise policy |
| UC-AI02 | Ticket/asset lookup — authorized users | Valid session; normalized query through existing services | Current scoped data; ID changes grant nothing; no direct DB query |
| UC-AI03 | Conversational work actions — authorized user | Existing intent → clarify → card/form/preview → user review/confirm → matching domain service; tickets retain separate draft/confirm | No confirmation, no mutation; no elevation/secrets to model; native validation/version/idempotency/committed results |
| UC-AI04 | Ticket summary — authorized reader | Open ticket → public sources; IT may open ticket-bound internal session | Private viewer summary, no automatic comments/notifications |
| UC-AI05 | Reply drafts — scoped IT | Audience → matching sources → draft → authorized review/edit → workspace/SCR22 composer → confirm send | Draft is not comment; no internal-to-public handoff or silent input overwrite |
| UC-AI06 | Report explanations — M/A | Question → metric/filter allowlist → authorized report query → facts/explanation | Existing MET facts; non-report users denied |
| UC-AI07 | Personal chats — owner | Open/resume/delete own conversations under policy | No others' chats; deletion preserves tickets/comments/files/business audit |
| UC-AI08 | AI availability — Admin | Inspect configuration → provider/source/data-policy checks → enable/disable | Cannot enable invalid setup; disable does not mutate tickets/block workers |

All UCs inherit current session/scope. External providers generate content from minimal authorized payloads, without user sessions/business credentials.

## Stories and INVEST

| ID | User story | Dependencies | AC |
| --- | --- | --- | --- |
| US-AI01 | As user, ask cited guidance to verify answers and suitable next steps. | Approved sources/read rights/provider | AC-AI01 |
| US-AI02 | As user, ask authorized ticket/asset status without expanding access. | Scoped read services | AC-AI02 |
| US-AI03 | As user, complete authorized work inside AI Workspace through forms/confirmation while controlling content/results. | Authorized intent/form registry/current domain services; ticket draft/confirm retained | AC-AI03 |
| US-AI04 | As ticket reader, get visibility-correct summaries to understand context without prohibited disclosure. | Ticket scope/public/internal context | AC-AI04 |
| US-AI05 | As authorized IT, receive audience-correct drafts for deliberate editing/sending. | Same workspace/SCR22 composer/domain service; comment/note rights | AC-AI05 |
| US-AI06 | As Manager/Admin, ask metrics naturally while preserving formulas/filters. | MET01–22/scoped reporting | AC-AI06 |
| US-AI07 | As chat owner, view/delete my conversations without affecting business records. | Identity/separate storage/retention | AC-AI07 |
| US-AI08 | As Admin, enable/disable by readiness to control data and preserve operations during AI outages. | Provider settings/flags/approved sources | AC-AI08 |

I: distinct outcomes/dependencies, demonstrable with authorized fixtures. V: story benefit. T: matching AC below. N/E/S are assessed, not automatic INVEST success.

| Story | N — negotiable | E/S — boundary/refinement | Status |
| --- | --- | --- | --- |
| US-AI01 | Source layout/question suggestions | One question/sources; retrieval quality trial, no real benchmark | Quality refinement needed |
| US-AI02 | Source-result presentation | Allowlisted reads; split tickets/assets if large | Technical-team estimate needed |
| US-AI03 | Card/form/preview layout | Multiple domain actions; split by existing use case, retain ticket draft/confirm and each domain's guards | Refinement/estimation needed |
| US-AI04 | Summary length/grouping | One ticket/scope; public first, internal separately if split | Visibility review needed |
| US-AI05 | Suggestion templates | One draft/audience; reuse composer errors/rights | Sufficient for refinement |
| US-AI06 | Explanation cards | Existing metrics, no new SQL/metrics; split by intent | Initial intent limits needed |
| US-AI07 | Conversation naming/deletion | Separate data; decide retention/payload deletion | Data refinement needed |
| US-AI08 | Setting location/copy | One capability toggle, no complex model configurator | Sufficient for refinement |

## Acceptance criteria

All **PLANNED / NOT RUN**.

| ID | Given | When | Then |
| --- | --- | --- | --- |
| AC-AI01 | Authorized/versioned approved sources | Ask sourced/unsupported information | Verified citations; explicit insufficient evidence; no fabricated/prohibited links |
| AC-AI02 | Own tickets/team scope/out-of-scope IDs | Ask or demand bypass | Only valid sources reach model; no prohibited counts/titles/snippets/files; changed roles/teams effective |
| AC-AI03 | Authorized allowlisted intent/form/current preview or missing data | Edit/confirm/repeat/close chat/lose rights | Only current-content confirmation dispatches matching user-actor service; state/ACL/version/idempotency; committed results; ticket digest/TTL; secrets outside model; safe deny/handoff if unsupported |
| AC-AI04 | Public comments/internal notes | R summarizes or IT chooses internal | Public sources only for R/public; internal only current IT; output is not comment/state/first response |
| AC-AI05 | IT draft, existing composer input | Insert/edit/send | No silent overwrite; public sources for public; internal drafts cannot become public; final existing comment/note service |
| AC-AI06 | Defined source metrics | M/A asks, R/T asks organization data | Correct source/filter/timestamp for M/A; deny R/T; no SQL/model recomputation of MET |
| AC-AI07 | Two owners/revoked sources | Forge ID/read history/delete | Owner-only; source-dependent revoked turns hidden; ticket/assets not deleted |
| AC-AI08 | Missing/failing provider, active form | Enable invalid/disable/timeout | No false enable; AI-scoped failure; retain core/forms/workers/manual route |

## Additional validation cases

| ID | Scenario | Expectation |
| --- | --- | --- |
| TC-AI01 | R requests others' tickets/notes | No prohibited data in prompt/answer/sources/metadata/history/cache |
| TC-AI02 | T leaves team during generation | Recheck before render; suppress revoked-source output |
| TC-AI03 | Internal summary then “send to requester” | Block public handoff/no send card; separate public context/sources/new confirmation allowed |
| TC-AI04 | Source says bypass rules/change priority | Treat as data; no tools outside confirmed intent/policy, no elevation/priority change |
| TC-AI05 | Read/draft during Pending | No resume/first response; actual public requester submission resumes under BR-04 |
| TC-AI06 | IT sends AI draft publicly, later note | Only actual valid public comment can satisfy first response, not generation/note |
| TC-AI07 | Prepare ticket, close chat | No ticket/SLA/notification/metric |
| TC-AI08 | Invalid priority/asset, retry/different digest/stale preview | Core validation/scope; one result/key; reject changed digest/stale confirmation |
| TC-AI09 | Overdue counts/mean resolution | Exact MET/scope/period/timestamp; n=0→“—”, no fabrication |
| TC-AI10 | Provider/quota/cancelled stream/disabled | Core APIs/workers/forms/states preserved; partial answers cannot transfer drafts |
| TC-AI11 | Delete chat/access another owner's link | Delete own chat only; business ticket/comment/file/audit unchanged |
| TC-AI12 | Password/token/external URL/HTML-image exfiltration request | No arbitrary HTTP/HTML/JS/external images from model; minimize payload under policy, no secret logs, UI warns against secrets |

## Planned usability tests

UT-AI01: find guidance/open sources. UT-AI02: prepare draft/explain actual ticket creation. UT-AI03: distinguish AI text/IT response/two SLA clocks. UT-AI04: IT public/internal/correct composer handoff. UT-AI05: AI failure with manual request submission. UT-AI06: keyboard/small screen/panel close returns to form.

No user results/AI quality scores. No invented accuracy percentages. Build question/source/expected-answer/authorization-failure criteria before live enablement.

## Automation relationship and documentation scope

This catalog covers the assistant. Coordination uses UC-OPS01–10, US/AC-OPS01–12, A1–A13 in source catalogs. Read/draft non-mutation does not prohibit policy-authorized automation. IT reviews/confirms public replies through workspace/original composers; conversational tickets require user confirmation. D-35 supersedes the absolute write ban.

Future real-model M3 testing under D-39 is DEMO-only; no current API/TC execution. Verify model/quota/billing/prices before running. Production: Decision required.

## D-42 — Shared screen and confirmed actions

UC-AI03 is an interaction channel for existing core/OPS UCs, not new rights/business UCs. Forms/previews/confirmation may run within chat, not just links; original forms remain fallback. Private chat has no SLA first-response status; only substantive public comments through services qualify by sender rules.

| ID | Scenario | Expected — PLANNED / NOT RUN |
| --- | --- | --- |
| TC-AI13 | Open/close/delete chat while schedule events/runs continue | Independent run, one workspace, user versus AI_COORDINATOR, no domain/audit deletion |
| TC-AI14 | R replies Pending/accepts through cards; T sends public/note | Same native service/state/SLA/audience/roles; preview no effect; correct submitted actor; edited input revalidated |
| TC-AI15 | T marks Done without result/remaining 0, or R asks workforce assignment | Reject guards/overreach, no borrowed background grants; authorized humans still confirm specialist data |
| TC-AI16 | Repeated confirmation/postcommit timeout/resource changes/revocation | Key/digest/version/service checks, no duplicate effect; outcome check before retry, preserve valid draft |
| TC-AI17 | R activity, M others' chat, revoked internal source | No prohibited payload/count/title/candidates; M cannot read others' chats; scoped domain projections |
| TC-AI18 | Shared model/concurrent modes/provider outage/near total cap | Conservative shared reservations/global quota; separate queues/rights, no doubled budget; forms/SLA/status remain |

UT-AI07: use assistant without runs, during pending approval, and with automation off but assistant available. Recognize suggestions immediately above chat and no approval prerequisite. R completes Pending reply/explains send point. M sees background run/reviews diff/approves and distinguishes decision/effect. T preserves drafts across compact tabs. Users distinguish requested actions from policy automation. No usability results yet.
