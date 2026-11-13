---
id: itoh-implementation-01-foundation
title: "M1 — Foundation and manual work"
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

# M1 — Foundation and manual work

M1 foundation groups cover real identity, persistence, manual ticket/task work, workforce and audit. Reuse Phase A frontend; the task graph keeps implementation after the frontend exit.

These are group/epic summaries. Each heading names the group goal. Implementation context, file boundaries, detailed checks and handoff evidence live in the linked task files. The [task workflow](workflow/task-workflow.md) defines the shared completion rule: every child and group criterion must pass, including any external integration closure. [Execution board](workflow/execution-board.md) owns task status/owner; [package registry](README.md#4-task-tracker) owns epic state. Application evidence remains **NOT RUN**.

<a id="fnd-01"></a>

## FND-01 — Create reproducible development scaffold

**Scope:** Reproducible backend/runtime setup and minimal health/build capability; reuse the delivered frontend.

**Trace:** NFR14, NFR17; A13 (foundation).

**Completion criteria**

1. Create uv/pnpm manifests and real lockfiles after revalidating candidate runtime/package versions; use the agreed modular monolith.
2. Start Next.js, FastAPI and PostgreSQL in a documented local setup, with Linux worker support planned for Windows; expose safe liveness/readiness.
3. Frozen installs, lint/type checks and builds run from a clean checkout; no frontend DB access or business API duplication.

**Child tasks:** [FND-01.01](tasks/FND-01.01.md), [FND-01.02](tasks/FND-01.02.md).

**Handoff:** Verified outputs feed [FND-02](01-foundation.md#fnd-02), [FND-03](01-foundation.md#fnd-03) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#fnd-01).

<a id="fnd-02"></a>

## FND-02 — Create database, transaction, audit and outbox primitives

**Scope:** Database/session/migration foundation, atomic audit/outbox and version/idempotency primitives.

**Trace:** AC-X08, AC-X09; NFR03, NFR13, NFR21.

**Completion criteria**

1. Migrations initialize the required foundation schema; each request/job gets its own synchronous Session and injectable UTC clock.
2. One unit of work commits domain, redacted audit and durable outbox together; failure rolls all back.
3. Expected-version and idempotency conflict behavior matches reviewed contracts; no MAX+1 IDs, global Session or publish-before-commit.

**Child tasks:** [FND-02.01](tasks/FND-02.01.md), [FND-02.02](tasks/FND-02.02.md), [FND-02.03](tasks/FND-02.03.md).

**Handoff:** Verified outputs feed [FND-04](01-foundation.md#fnd-04), [WF-05](02-workflows.md#wf-05), [AI-03](03-ai-automation.md#ai-03) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#fnd-02).

<a id="fnd-03"></a>

## FND-03 — Create accessible shell and typed API client

**Scope:** Reviewed real-API/client contracts and shared transport boundary; reuse the existing frontend shell.

**Trace:** AC-X02–07, AC-X10; NFR07–10, NFR16–17.

**Completion criteria**

1. Generate DTOs from reviewed API contracts; centralize cookie/CSRF/error handling and user/scope query keys.
2. Provide responsive navigation, loading/empty/error/forbidden/conflict states, keyboard/focus behavior and Vietnamese UI copy.
3. Use Asia/Ho_Chi_Minh display, bounded pagination and active-tab 30-second polling; failed reads never render fake zero data.

**Child tasks:** [FND-03.01](tasks/FND-03.01.md), [FND-03.02](tasks/FND-03.02.md).

**Handoff:** Verified outputs feed [INT-01](07-integration.md#int-01), [FND-04](01-foundation.md#fnd-04) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-01](07-integration.md#int-01). [Criterion owners and closure](package-task-coverage.md#fnd-03).

<a id="fnd-04"></a>

## FND-04 — Implement login, logout and current-session authorization

**Scope:** Real login/session principal, CSRF, logout and access revocation.

**Trace:** US01, US02; AC01, AC02; NFR01, NFR02, NFR15–16.

**Completion criteria**

1. Authorized bootstrap creates the initial account without public signup; Argon2id and opaque PostgreSQL sessions follow PRE-01.
2. Login validates Origin/pre-session CSRF and rotates session; logout invalidates it server-side, and expired/revoked cookies fail direct API access.
3. Login preserves validation feedback and safe return paths; logout/user switch clears private caches; forged roles cannot grant scope.

**Child tasks:** [FND-04.01](tasks/FND-04.01.md), [FND-04.02](tasks/FND-04.02.md).

**Handoff:** Verified outputs feed [INT-01](07-integration.md#int-01), [FND-05](01-foundation.md#fnd-05), [FND-07](01-foundation.md#fnd-07), [AI-01](03-ai-automation.md#ai-01), [OPS-08](04-operations-assistant.md#ops-08) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-01](07-integration.md#int-01). [Criterion owners and closure](package-task-coverage.md#fnd-04).

<a id="fnd-05"></a>

## FND-05 — Manage departments, teams and safe reference lookups

**Scope:** Departments, teams, memberships, intake and restricted reference lookups.

**Trace:** US08, US09, US10 (creation); AC08–10.

**Completion criteria**

1. Admin creates/edits departments and teams, sets one active intake and adds eligible members; non-admin management calls fail.
2. Historical references survive deactivation; lookup endpoints disclose only fields needed by the caller, never a requester employee directory.
3. Destructive eligibility changes are blocked until FND-17 supplies the reviewed handover flow; a team cannot be deactivated with unmanaged open work.

**Child tasks:** [FND-05.01](tasks/FND-05.01.md), [FND-05.02](tasks/FND-05.02.md).

**Handoff:** Verified outputs feed [FND-06](01-foundation.md#fnd-06), [FND-08](01-foundation.md#fnd-08), [FND-14](01-foundation.md#fnd-14), [AI-02](03-ai-automation.md#ai-02) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-01](07-integration.md#int-01). [Criterion owners and closure](package-task-coverage.md#fnd-05).

<a id="fnd-06"></a>

## FND-06 — Provision accounts through the authorized Admin flow

**Scope:** Verified Admin provisioning and secure account result/handover under D-29.

**Trace:** US05; AC05; D-29.

**Completion criteria**

1. Create accounts with normalized unique email, valid department and default Requester; elevated roles require verified authorization.
2. Support authorized initial setup and later verified D-29 request references; a ticket or model message never creates an account automatically.
3. Passwords use the approved enterprise handover process, never response/audit/ticket content; reject non-admin calls.

**Child tasks:** [FND-06.01](tasks/FND-06.01.md), [FND-06.02](tasks/FND-06.02.md).

**Handoff:** Verified outputs feed [FND-09](01-foundation.md#fnd-09), [FND-17](01-foundation.md#fnd-17) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-01](07-integration.md#int-01). [Criterion owners and closure](package-task-coverage.md#fnd-06).

<a id="fnd-07"></a>

## FND-07 — Implement own profile and password changes

**Scope:** Restricted own-profile update and real password/session rotation.

**Trace:** US03, US04; AC03, AC04.

**Completion criteria**

1. Update allowed personal fields only; forged role/email/user ID is rejected or excluded by the reviewed DTO.
2. Password change verifies the current password, applies approved policy and revokes other sessions.
3. Validation/network failures preserve safe form state and focus; old password fails after successful change.

**Child tasks:** [FND-07.01](tasks/FND-07.01.md), [FND-07.02](tasks/FND-07.02.md).

**Handoff:** Verified outputs feed [INT-01](07-integration.md#int-01) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-01](07-integration.md#int-01). [Criterion owners and closure](package-task-coverage.md#fnd-07).

<a id="fnd-08"></a>

## FND-08 — Configure categories and versioned default SLA

**Scope:** Ticket category lifecycle and immutable default SLA publication.

**Trace:** US11, US12; AC11, AC12.

**Completion criteria**

1. Admin manages unique categories; deactivated values remain readable historically but cannot be selected for new tickets.
2. Publish a positive P1–P4 SLA table with version/audit; changing defaults does not mutate existing ticket snapshots.
3. Expose only allowed reference projections for request forms.

**Child tasks:** [FND-08.01](tasks/FND-08.01.md), [FND-08.02](tasks/FND-08.02.md).

**Handoff:** Verified outputs feed [INT-01](07-integration.md#int-01), [FND-09](01-foundation.md#fnd-09) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-01](07-integration.md#int-01). [Criterion owners and closure](package-task-coverage.md#fnd-08).

<a id="fnd-09"></a>

## FND-09 — Create a text ticket with priority and SLA snapshot

**Scope:** Server-derived ticket intake and atomic initial SLA/event persistence.

**Trace:** US13; AC13; BR-02, BR-03, BR-08, BR-09.

**Completion criteria**

1. Valid submission creates New ticket, unique code, session requester, active intake, matrix priority and full immutable SLA snapshot.
2. Persist initial clock facts, event/audit/outbox atomically; repeat same intent returns one ticket and altered digest conflicts.
3. Reject arbitrary requester/priority. Defer optional asset selection to OPS-02 and files to OPS-05; do not show nonfunctional controls as working.

**Child tasks:** [FND-09.01](tasks/FND-09.01.md), [FND-09.02](tasks/FND-09.02.md).

**Handoff:** Verified outputs feed [FND-10](01-foundation.md#fnd-10), [OPS-11](04-operations-assistant.md#ops-11) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-02](07-integration.md#int-02). [Criterion owners and closure](package-task-coverage.md#fnd-09).

<a id="fnd-10"></a>

## FND-10 — Implement scoped ticket search and details

**Scope:** Authorized ticket search/count/detail projections and bounded paging.

**Trace:** US14, US15; AC14, AC15.

**Completion criteria**

1. Scope before count/search/paging; Requester sees own, Technician active-team union plus own public view, M/A permitted organization records.
2. Stable sorting, 20-default/100-max paging, filter reset and back-navigation preserve the query.
3. Out-of-scope IDs return generic 404; requester projection contains no notes, internal metadata, plans or candidate counts.

**Child tasks:** [FND-10.01](tasks/FND-10.01.md), [FND-10.02](tasks/FND-10.02.md).

**Handoff:** Verified outputs feed [FND-11](01-foundation.md#fnd-11), [OPS-01](04-operations-assistant.md#ops-01) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-02](07-integration.md#int-02). [Criterion owners and closure](package-task-coverage.md#fnd-10).

<a id="fnd-11"></a>

## FND-11 — Assign, transfer, claim and start tickets

**Scope:** Eligible assignment/transfer, concurrent self-claim and accept/start commands.

**Trace:** US16–19; AC16–19.

**Completion criteria**

1. M/A assignments/transfers require reason and eligible current-team assignee; In Progress/Pending never becomes ownerless.
2. Technician self-claims only unassigned own-team tickets; simultaneous claims yield one success and one conflict.
3. New→Open creates no first response; Open→In Progress requires valid assignee, actor and version; SLA never resets.

**Child tasks:** [FND-11.01](tasks/FND-11.01.md), [FND-11.02](tasks/FND-11.02.md).

**Handoff:** Verified outputs feed [FND-12](01-foundation.md#fnd-12), [FND-16](01-foundation.md#fnd-16) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-02](07-integration.md#int-02). [Criterion owners and closure](package-task-coverage.md#fnd-11).

<a id="fnd-12"></a>

## FND-12 — Implement public comments, notes and ticket lifecycle

**Scope:** Public/internal conversations and the complete guarded ticket lifecycle.

**Trace:** US20, US21, US24–29; AC20, AC21, AC24–29.

**Completion criteria**

1. Public/internal drafts remain separate; notes never leak or satisfy first response. Only eligible substantive public IT content stops response clock.
2. Pending+question and Resolved+solution commit atomically; requester public reply resumes Pending; implement permitted close/reopen/cancel branches with reasons/assignee guards.
3. Closed/Cancelled are read-only; reopening preserves consumed budget/breaches; no auto-close or New→In Progress shortcut.

**Child tasks:** [FND-12.01](tasks/FND-12.01.md), [FND-12.02](tasks/FND-12.02.md), [FND-12.03](tasks/FND-12.03.md), [FND-12.04](tasks/FND-12.04.md).

**Handoff:** Verified outputs feed [FND-13](01-foundation.md#fnd-13), [AI-04](03-ai-automation.md#ai-04), [OPS-05](04-operations-assistant.md#ops-05), [OPS-10](04-operations-assistant.md#ops-10) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-02](07-integration.md#int-02). [Criterion owners and closure](package-task-coverage.md#fnd-12).

<a id="fnd-13"></a>

## FND-13 — Implement priority changes and authorized timeline

**Scope:** Reasoned priority adjustment and authorized event history without SLA reset.

**Trace:** US30, US31; AC30, AC31.

**Completion criteria**

1. M/A priority changes require reason and use the ticket's original snapshot against unchanged elapsed usage.
2. Persist adjustment versions and newly detected breaches without erasing earlier history or changing firstResponseAt.
3. Timeline is stably paginated and visibility-filtered, including event text and reasons.

**Child tasks:** [FND-13.01](tasks/FND-13.01.md), [FND-13.02](tasks/FND-13.02.md).

**Handoff:** Verified outputs feed [INT-02](07-integration.md#int-02), [FND-18](01-foundation.md#fnd-18), [OPS-03](04-operations-assistant.md#ops-03), [OPS-17](04-operations-assistant.md#ops-17) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-02](07-integration.md#int-02). [Criterion owners and closure](package-task-coverage.md#fnd-13).

<a id="fnd-14"></a>

## FND-14 — Manage verified workforce skills

**Scope:** Skill taxonomy, authorized verification and auditable affected-work events.

**Trace:** US-OPS01 (skills); AC-OPS01.

**Completion criteria**

1. Authorized M/A records taxonomy, required skills and verification provenance/version; T cannot self-verify.
2. Missing/unverified skill is not eligible by default; self/minimal team views follow permissions.
3. Changes emit affected-work events and redacted audit in the same transaction.

**Child tasks:** [FND-14.01](tasks/FND-14.01.md), [FND-14.02](tasks/FND-14.02.md).

**Handoff:** Verified outputs feed [FND-15](01-foundation.md#fnd-15) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-03](07-integration.md#int-03). [Criterion owners and closure](package-task-coverage.md#fnd-14).

<a id="fnd-15"></a>

## FND-15 — Manage calendars, budgets and absences

**Scope:** Schedules, budgets, absence unions and authorized availability changes.

**Trace:** US-OPS01 (calendar); AC-OPS01; BR-16.

**Completion criteria**

1. Use agreed concrete periods/timezone/daily budgets and subtract union of overlapping absences once.
2. Missing schedules are unknown, never free capacity; preserve history/version and publish availability changes.
3. UI exposes available/unknown/absent distinctions; work calendars do not alter 24/7 ticket SLA.

**Child tasks:** [FND-15.01](tasks/FND-15.01.md), [FND-15.02](tasks/FND-15.02.md).

**Handoff:** Verified outputs feed [INT-03](07-integration.md#int-03), [FND-16](01-foundation.md#fnd-16), [WF-04](02-workflows.md#wf-04) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-03](07-integration.md#int-03). [Criterion owners and closure](package-task-coverage.md#fnd-15).

<a id="fnd-16"></a>

## FND-16 — Create and execute manual tasks with remaining effort

**Scope:** Persisted manual plans/tasks, atomic allocations and human progress/completion.

**Trace:** US-OPS06; AC-OPS06; BR-14–16.

**Completion criteria**

1. Persist a minimal versioned manual plan/task structure ready for WF-01; verify team/skills/schedule/effort and atomically allocate manual assignments.
2. Authorized progress changes preserve versions/results and recheck increased remaining load; valid human Done requires substantive result and remaining=0.
3. Reject invalid task transitions and requester access; finishing tasks never resolves/closes the ticket; provide keyboard/list alternative to board.

**Child tasks:** [FND-16.01](tasks/FND-16.01.md), [FND-16.02](tasks/FND-16.02.md), [FND-16.03](tasks/FND-16.03.md).

**Handoff:** Verified outputs feed [INT-03](07-integration.md#int-03), [FND-17](01-foundation.md#fnd-17), [WF-01](02-workflows.md#wf-01), [OPS-13](04-operations-assistant.md#ops-13), [OPS-16](04-operations-assistant.md#ops-16) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-03](07-integration.md#int-03). [Criterion owners and closure](package-task-coverage.md#fnd-16).

<a id="fnd-17"></a>

## FND-17 — Complete access revocation and assignment handover

**Scope:** Immediate access loss, active-work handover and safe team/account deactivation.

**Trace:** US06, US07, US09, US10; AC06, AC07, AC09, AC10.

**Completion criteria**

1. Role/department/membership/lock changes preserve historical identities and last active Admin; old access and sessions are revoked per policy.
2. Apply reviewed handover to active tickets/tasks atomically; implement PRE-01 emergency no-replacement decision without retaining revoked access or reporting false success.
3. Unlock restores no old session; team deactivation transfers open work; emit affected-work evaluation events.

**Child tasks:** [FND-17.01](tasks/FND-17.01.md), [FND-17.02](tasks/FND-17.02.md), [FND-17.03](tasks/FND-17.03.md).

**Handoff:** Verified outputs feed [INT-01](07-integration.md#int-01), [FND-18](01-foundation.md#fnd-18), [OPS-14](04-operations-assistant.md#ops-14) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-01](07-integration.md#int-01), [INT-03](07-integration.md#int-03). [Criterion owners and closure](package-task-coverage.md#fnd-17).

<a id="fnd-18"></a>

## FND-18 — Expose scoped audit search

**Scope:** Role-scoped audit projection and bounded search for shared business history.

**Trace:** US47; AC47; NFR13, NFR24.

**Completion criteria**

1. M reads permitted business audit; Admin additionally reads authorized identity/SLA administration audit, without all-chat access.
2. Search/paging/counts apply scope and retain actor/time/old-new/reason; redact secrets and bodies.
3. Define reusable audit projection for later automation/assets; later slices supply their own events.

**Child tasks:** [FND-18.01](tasks/FND-18.01.md), [FND-18.02](tasks/FND-18.02.md).

**Handoff:** Verified outputs feed [INT-06](07-integration.md#int-06), [WF-10](02-workflows.md#wf-10), [QA-01](05-acceptance.md#qa-01) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-06](07-integration.md#int-06). [Criterion owners and closure](package-task-coverage.md#fnd-18).
