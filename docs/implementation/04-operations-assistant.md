---
id: itoh-implementation-04-operations-assistant
title: "M4 — Operations, RAG and assistant"
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
purpose: "Summarize group scope, completion criteria, child tasks and handoff."
---

# M4 — Operations, RAG and assistant

M4 groups complete assets, files, SLA, notifications, KB/RAG, assistant and reporting services. Reuse the frontend already delivered; real wiring belongs to the linked integration groups.

These are group/epic summaries. Each heading names the group goal. Implementation context, file boundaries, detailed checks and handoff evidence live in the linked task files. The [task workflow](workflow/task-workflow.md) defines the shared completion rule: every child and group criterion must pass, including any external integration closure. [Execution board](workflow/execution-board.md) owns task status/owner; [package registry](README.md#4-task-tracker) owns epic state. Application evidence remains **NOT RUN**.

<a id="ops-01"></a>

## OPS-01 — Complete asset records, scoped lookup and history

**Scope:** Complete scoped asset records, metadata and assignment history.

**Trace:** US35–37; AC35–37.

**Completion criteria**

1. M/A edits valid code/serial/type/date metadata; current holder cannot be mass-assigned.
2. R sees currently held assets with reduced history; T only own/support scope; counts and related ticket links enforce independent scope.
3. Preserve assignment history and display repair devices with retained holder; reject invalid dates/duplicate serial.

**Child tasks:** [OPS-01.01](tasks/OPS-01.01.md), [OPS-01.02](tasks/OPS-01.02.md).

**Handoff:** Verified outputs feed [OPS-02](04-operations-assistant.md#ops-02) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-04](07-integration.md#int-04). [Criterion owners and closure](package-task-coverage.md#ops-01).

<a id="ops-02"></a>

## OPS-02 — Implement asset issue, return, state changes and ticket links

**Scope:** Atomic issue/return/state lifecycle and authorized ticket asset references.

**Trace:** US13 (asset), US38–40; AC13, AC38–40.

**Completion criteria**

1. Concurrent issue of In Stock asset permits one active assignment and atomic In Use state; active recipient required.
2. Return ends assignment once to stock/repair; reasoned transitions obey BR-11 and retirement requires return first.
3. Ticket asset picker/backend use actor-specific permission rules; linking never grants access to other tickets; reconcile reservations if adopted.

**Child tasks:** [OPS-02.01](tasks/OPS-02.01.md), [OPS-02.02](tasks/OPS-02.02.md), [OPS-02.03](tasks/OPS-02.03.md).

**Handoff:** Verified outputs feed [INT-04](07-integration.md#int-04), [OPS-09](04-operations-assistant.md#ops-09), [OPS-11](04-operations-assistant.md#ops-11), [OPS-14](04-operations-assistant.md#ops-14), [OPS-16](04-operations-assistant.md#ops-16), [OPS-17](04-operations-assistant.md#ops-17) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-04](07-integration.md#int-04). [Criterion owners and closure](package-task-coverage.md#ops-02).

<a id="ops-03"></a>

## OPS-03 — Complete SLA displays and independent alert scans

**Scope:** Persisted two-clock SLA projections, threshold scans and delayed-scan recovery.

**Trace:** US32, US33; AC32, AC33; TC-SLA01–12.

**Completion criteria**

1. Display separate response/resolution clocks with 80/100 thresholds, paused/stopped states and preserved breach history.
2. One Beat schedules scans independently of pages; persist breach facts and deduplicated recipient intents by BR-10, beyond-100 first scan skips obsolete warning.
3. Broker recovery catches up from PostgreSQL without resetting time; expose scan delay, no outage-time 60-second guarantee.

**Child tasks:** [OPS-03.01](tasks/OPS-03.01.md), [OPS-03.02](tasks/OPS-03.02.md), [OPS-03.03](tasks/OPS-03.03.md).

**Handoff:** Verified outputs feed [INT-02](07-integration.md#int-02), [OPS-04](04-operations-assistant.md#ops-04), [OPS-16](04-operations-assistant.md#ops-16), [OPS-17](04-operations-assistant.md#ops-17) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-02](07-integration.md#int-02). [Criterion owners and closure](package-task-coverage.md#ops-03).

<a id="ops-04"></a>

## OPS-04 — Deliver authorized in-app notifications

**Scope:** Deduplicated authorized in-app notifications and own read state.

**Trace:** US16 (notification), US33, US34; AC16, AC33, AC34.

**Completion criteria**

1. Consume persisted assignment/comment/state/SLA intents with correct recipients, actor exclusion and unique effect keys.
2. Own list/count/readAt only; repeated read is idempotent and current record access controls previews/links.
3. Notes never notify/requester-leak; disabled accounts/revoked scope lose sensitive previews; no MVP email.

**Child tasks:** [OPS-04.01](tasks/OPS-04.01.md), [OPS-04.02](tasks/OPS-04.02.md).

**Handoff:** Verified outputs feed [INT-02](07-integration.md#int-02), [OPS-16](04-operations-assistant.md#ops-16), [QA-01](05-acceptance.md#qa-01) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-02](07-integration.md#int-02), [INT-06](07-integration.md#int-06). [Criterion owners and closure](package-task-coverage.md#ops-04).

<a id="ops-05"></a>

## OPS-05 — Implement private attachments and recovery

**Scope:** Private file validation/staging, consistent finalization and authorized downloads.

**Trace:** US22, US23; AC22, AC23; NFR06.

**Completion criteria**

1. Accept only PNG/JPEG/WebP/PDF, at most 5/action and 10,000,000 bytes/file; verify extension/MIME/content, reject SVG/spoof/oversize.
2. Stage/finalize/reconcile files with domain transaction outcome; invalid submission has no partial domain commit, preserves text and prevents duplicate tickets after interrupted upload.
3. Download rechecks current parent audience/scope, safe headers/path handling, private local/S3 contract; no public object path.

**Child tasks:** [OPS-05.01](tasks/OPS-05.01.md), [OPS-05.02](tasks/OPS-05.02.md), [OPS-05.03](tasks/OPS-05.03.md).

**Handoff:** Verified outputs feed [INT-02](07-integration.md#int-02), [OPS-11](04-operations-assistant.md#ops-11), [QA-01](05-acceptance.md#qa-01) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-02](07-integration.md#int-02). [Criterion owners and closure](package-task-coverage.md#ops-05).

<a id="ops-06"></a>

## OPS-06 — Complete KB authoring, publishing and ACL UI

**Scope:** Full KB version/publication lifecycle, live ACL and index-state projections.

**Trace:** US-OPS11 (publishing); AC-OPS11.

**Completion criteria**

1. Approved authors/publishers manage Draft→Published/Retired and immutable versions with explicit ACL.
2. ACL changes take effect immediately in reads and emit index/revocation events; technical Admin has no blanket content bypass.
3. UI shows publication/index status separately, authorized source/version links and accessible empty/error states.

**Child tasks:** [OPS-06.01](tasks/OPS-06.01.md), [OPS-06.02](tasks/OPS-06.02.md).

**Handoff:** Verified outputs feed [OPS-07](04-operations-assistant.md#ops-07) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-05](07-integration.md#int-05). [Criterion owners and closure](package-task-coverage.md#ops-06).

<a id="ops-07"></a>

## OPS-07 — Build pgvector indexing and authorized retrieval

**Scope:** Version-bound pgvector indexing and source-current authorized retrieval.

**Trace:** US-OPS11 (RAG); AC-OPS11; NFR22.

**Completion criteria**

1. Chunk/embed Published versions using reviewed dimensions/model metadata; idempotent background jobs track failure/staleness.
2. Filter SQL by current source/version/ACL before retrieval/provider; recheck before output and citations despite stale vectors.
3. Return explicit insufficient evidence and source-bound results; injection grants no tools; embedding spend uses shared ledger.

**Child tasks:** [OPS-07.01](tasks/OPS-07.01.md), [OPS-07.02](tasks/OPS-07.02.md).

**Handoff:** Verified outputs feed [OPS-09](04-operations-assistant.md#ops-09), [OPS-18](04-operations-assistant.md#ops-18) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-05](07-integration.md#int-05). [Criterion owners and closure](package-task-coverage.md#ops-07).

<a id="ops-08"></a>

## OPS-08 — Implement private chats and assistant availability

**Scope:** Owner-specific chat/retention, validated availability and source-current history.

**Trace:** US-AI07, US-AI08; AC-AI07, AC-AI08.

**Completion criteria**

1. Owner-only conversations use separate PUBLIC/INTERNAL contexts and approved retention; deletion preserves business data/audit.
2. Admin enables only valid provider/source/data-policy configuration; disabled/failing assistant preserves core forms and independent workers.
3. Recheck source access on history/cache, clear private state on user switch and never expose secrets or other owners' chats.

**Child tasks:** [OPS-08.01](tasks/OPS-08.01.md), [OPS-08.02](tasks/OPS-08.02.md), [OPS-08.03](tasks/OPS-08.03.md).

**Handoff:** Verified outputs feed [OPS-09](04-operations-assistant.md#ops-09), [OPS-10](04-operations-assistant.md#ops-10), [OPS-11](04-operations-assistant.md#ops-11), [OPS-19](04-operations-assistant.md#ops-19) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-05](07-integration.md#int-05). [Criterion owners and closure](package-task-coverage.md#ops-08).

<a id="ops-09"></a>

## OPS-09 — Answer cited questions and scoped ticket/asset lookup

**Scope:** Allowlisted scoped read/guidance tools and current verified citations.

**Trace:** US-AI01, US-AI02; AC-AI01, AC-AI02.

**Completion criteria**

1. Use authorized Published RAG sources for guidance and existing scoped ticket/asset services for live facts.
2. Server controls tools/citations; no model SQL/arbitrary URL fetches/external image exfiltration or fabricated sources.
3. Recheck access before render/history; unsupported questions state insufficient evidence without revealing prohibited counts/snippets.

**Child tasks:** [OPS-09.01](tasks/OPS-09.01.md), [OPS-09.02](tasks/OPS-09.02.md).

**Handoff:** Verified outputs feed [OPS-15](04-operations-assistant.md#ops-15) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-05](07-integration.md#int-05). [Criterion owners and closure](package-task-coverage.md#ops-09).

<a id="ops-10"></a>

## OPS-10 — Generate audience-safe summaries and reply drafts

**Scope:** Audience-bound summaries/reply drafts and deliberate native-composer handoff.

**Trace:** US-AI04, US-AI05; AC-AI04, AC-AI05.

**Completion criteria**

1. Public summary/draft uses only public context; internal sessions require current IT scope and cannot hand off to public.
2. Generation creates no comment, first response or state transition; insertion never silently overwrites existing text.
3. User edits/sends through the existing authorized composer/service and its native errors.

**Child tasks:** [OPS-10.01](tasks/OPS-10.01.md), [OPS-10.02](tasks/OPS-10.02.md).

**Handoff:** Verified outputs feed [OPS-12](04-operations-assistant.md#ops-12) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-05](07-integration.md#int-05). [Criterion owners and closure](package-task-coverage.md#ops-10).

<a id="ops-11"></a>

## OPS-11 — Confirm conversational ticket creation

**Scope:** Exact ticket preview contract and idempotent user-confirmed creation.

**Trace:** US-AI03 (ticket); AC-AI03.

**Completion criteria**

1. Trusted form binds exact preview digest/version/TTL and actor; edited data requires reconfirmation.
2. User confirmation calls the same ticket service with current scope/asset/file/priority rules and idempotent result.
3. Close chat/unconfirmed preview creates no ticket; postcommit timeout resolves saved outcome before retry.

**Child tasks:** [OPS-11.01](tasks/OPS-11.01.md), [OPS-11.02](tasks/OPS-11.02.md).

**Handoff:** Verified outputs feed [OPS-12](04-operations-assistant.md#ops-12) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-05](07-integration.md#int-05). [Criterion owners and closure](package-task-coverage.md#ops-11).

<a id="ops-12"></a>

## OPS-12 — Confirm ticket replies and lifecycle actions in cards

**Scope:** Trusted ticket reply/lifecycle intents and current-content confirmed commands.

**Trace:** US-AI03 (ticket actions); AC-AI03; AC20, AC21, AC24–29.

**Completion criteria**

1. Map allowlisted reply/note/Pending/resolve/accept/reopen/cancel intents to existing native services under current user.
2. Preview has no effect; explicit edited-content confirmation rechecks state/version/audience and original requester closure rule.
3. Public requester reply resumes Pending only after commit; internal draft cannot become public, stale forms preserve safe input.

**Child tasks:** [OPS-12.01](tasks/OPS-12.01.md), [OPS-12.02](tasks/OPS-12.02.md).

**Handoff:** Verified outputs feed [OPS-13](04-operations-assistant.md#ops-13), [OPS-15](04-operations-assistant.md#ops-15) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-05](07-integration.md#int-05). [Criterion owners and closure](package-task-coverage.md#ops-12).

<a id="ops-13"></a>

## OPS-13 — Confirm specialist task progress in cards

**Scope:** Human-authorized task progress cards and committed-result projections.

**Trace:** US-AI03 (task); AC-AI03, AC-OPS06.

**Completion criteria**

1. Authorized assignee/M/A confirms progress/result through native task service, including dependency/remaining/version guards.
2. Done requires human substantive result and remaining=0; model cannot infer completion or borrow service grants.
3. Unsupported/requester intents use safe deny/handoff; show persisted result, never model-text success.

**Child tasks:** [OPS-13.01](tasks/OPS-13.01.md), [OPS-13.02](tasks/OPS-13.02.md).

**Handoff:** Verified outputs feed [OPS-14](04-operations-assistant.md#ops-14), [OPS-15](04-operations-assistant.md#ops-15) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-05](07-integration.md#int-05). [Criterion owners and closure](package-task-coverage.md#ops-13).

<a id="ops-14"></a>

## OPS-14 — Confirm authorized management actions through trusted forms

**Scope:** Explicit management intent registry and secure native command confirmations.

**Trace:** US-AI03 (management); AC-AI03; AC-OPS08, AC-OPS09; D-29/42.

**Completion criteria**

1. Inventory the existing management intents explicitly: each maps to a reviewed native form/service or documented unsupported handoff; no arbitrary endpoint dispatch.
2. Enabled assignment/lock/approval/asset/admin forms keep original role, reason, version, feasibility and confirmation; M cannot administer users.
3. Credentials and sensitive account provisioning inputs stay in secure native form fields outside model payloads; model never autonomously creates accounts or assumes AI_COORDINATOR.

**Child tasks:** [OPS-14.01](tasks/OPS-14.01.md), [OPS-14.02](tasks/OPS-14.02.md), [OPS-14.03](tasks/OPS-14.03.md).

**Handoff:** Verified outputs feed [OPS-15](04-operations-assistant.md#ops-15) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-05](07-integration.md#int-05). [Criterion owners and closure](package-task-coverage.md#ops-14).

<a id="ops-15"></a>

## OPS-15 — Compose one independent AI Workspace

**Scope:** Independent scoped activity and the real shared workspace contract.

**Trace:** US-AI03 (workspace); AC-AI03; D-42; NFR26.

**Completion criteria**

1. Compose conversation, suggestions immediately above chat, trusted action forms and scoped activity/details; full exception proposal remains readable.
2. Assistant works with no run, pending approval or automation disabled; closing/deleting chat never stops or deletes background work.
3. Activity polling reveals no internal requester payload; stepper shows committed/current/future steps and separates approval from effect; keyboard/mobile/reduced-motion work.

**Child tasks:** [OPS-15.01](tasks/OPS-15.01.md), [OPS-15.02](tasks/OPS-15.02.md).

**Handoff:** Verified outputs feed [INT-05](07-integration.md#int-05), [QA-01](05-acceptance.md#qa-01) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-05](07-integration.md#int-05). [Criterion owners and closure](package-task-coverage.md#ops-15).

<a id="ops-16"></a>

## OPS-16 — Build requester and technician dashboards

**Scope:** Personal and Technician source-based dashboard queries.

**Trace:** US41, US42; AC41, AC42; MET11–14.

**Completion criteria**

1. Requester sees own waiting requests/assets and correct reply/accept CTA, no organization KPIs.
2. T sees current assigned/team-unclaimed work with multi-team union and scoped SLA pressure.
3. Freshness/loading/empty/error remain explicit; drill-down population equals displayed count.

**Child tasks:** [OPS-16.01](tasks/OPS-16.01.md), [OPS-16.02](tasks/OPS-16.02.md).

**Handoff:** Verified outputs feed [INT-06](07-integration.md#int-06), [QA-01](05-acceptance.md#qa-01) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-06](07-integration.md#int-06). [Criterion owners and closure](package-task-coverage.md#ops-16).

<a id="ops-17"></a>

## OPS-17 — Build management ticket, workload and warranty reports

**Scope:** Management queue/cohort/resolution/workload/warranty facts.

**Trace:** US43–46; AC43–46; MET01–10, MET15.

**Completion criteria**

1. Scope before counting; current queue includes old backlog, cohort charts use labeled date windows and exact drill-downs.
2. Use latest-resolution tickets, active duration and n=0 dash; preserve historical breaches and separate unassigned workload.
3. Warranty uses local today-through-day-30 boundaries, excludes retired/missing dates; no invented productivity scores.

**Child tasks:** [OPS-17.01](tasks/OPS-17.01.md), [OPS-17.02](tasks/OPS-17.02.md), [OPS-17.03](tasks/OPS-17.03.md).

**Handoff:** Verified outputs feed [OPS-19](04-operations-assistant.md#ops-19) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-06](07-integration.md#int-06). [Criterion owners and closure](package-task-coverage.md#ops-17).

<a id="ops-18"></a>

## OPS-18 — Report coordination facts and sourced AI usage

**Scope:** Source-based coordination, capacity, action and AI usage reporting.

**Trace:** US-OPS12; AC-OPS12; MET16–22; A7, A12.

**Completion criteria**

1. Compute defined task/capacity/risk/action metrics from authorized persisted facts with period/timestamp provenance.
2. Drafts/approvals count separately from executed effects; unallocated/unknown work is visible rather than free capacity.
3. Display sourced model latency/tokens/cost and separate estimated/reserved/unknown; reconcile usage with shared budget ledger.

**Child tasks:** [OPS-18.01](tasks/OPS-18.01.md), [OPS-18.02](tasks/OPS-18.02.md).

**Handoff:** Verified outputs feed [INT-06](07-integration.md#int-06), [OPS-19](04-operations-assistant.md#ops-19) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-06](07-integration.md#int-06). [Criterion owners and closure](package-task-coverage.md#ops-18).

<a id="ops-19"></a>

## OPS-19 — Explain authorized reports through the assistant

**Scope:** Allowlisted report explanations with native metric parity.

**Trace:** US-AI06; AC-AI06.

**Completion criteria**

1. M/A intent maps to allowlisted existing metric queries with source/filter/time shown.
2. Model explains supplied facts without SQL or recomputing MET; R/T cannot obtain organization data.
3. No-data/unknown usage stays explicit; cited facts match native report and drill-down.

**Child tasks:** [OPS-19.01](tasks/OPS-19.01.md), [OPS-19.02](tasks/OPS-19.02.md).

**Handoff:** Verified outputs feed [INT-05](07-integration.md#int-05), [QA-01](05-acceptance.md#qa-01), [QA-04](05-acceptance.md#qa-04) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-05](07-integration.md#int-05), [INT-06](07-integration.md#int-06). [Criterion owners and closure](package-task-coverage.md#ops-19).
