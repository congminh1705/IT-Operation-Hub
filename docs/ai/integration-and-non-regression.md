---
id: itoh-docs-ai-integration-and-non-regression
title: "AI integration and business invariants"
type: reference
domain: ai
module: integration
tags: [ai, integration, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Define tool boundaries, transactions, retries, and invariant preservation for AI integration."
---

# AI integration and business invariants

**Target design, 31 October 2026; no executable adapter/endpoint/tests.** D-35 replaces D-23's absolute mutation ban; Q&A/summaries/reply drafts remain read-only/draft. Documentation changes only.

## Tools and identities

| Conceptual tool | Actor/scope | Conditions |
| --- | --- | --- |
| Search/read KB/tickets/assets/reports | User or policy-authorized service | Read-only; filter before retrieval/provider/results and recheck |
| Prepare existing-use-case card/form/preview | Conversation owner, explicit audience/resource | No mutation; server registry/schema allowlist, no arbitrary URL/JS/tool |
| Confirm/create ticket | User confirms exact preview | Core validation, digest/version/idempotency; no arbitrary requester/role/priority override |
| Propose/validate plan, eligible candidates | AI_COORDINATOR/run/event/policy/grantor | DAG/estimates/deadlines/inventory; proposal not effective |
| Activate plans/create/assign/reassign tasks | Allowlisted AI_COORDINATOR | Current policy/grantor/scope/version/capacity/transaction; outside authority needs approval |
| Approval/reminder/report | Same actor/visibility | Dedup/rate limits; approval is not execution |
| Complete tasks/resolve/close tickets | Authorized human | State machine, no autonomous model confirmation |
| User/role/SLA/asset mutation | Authorized human/specialist service | No autonomous AI users/roles/assets; SLA/commitments need proper rights/approval |

Providers get no DB/session/business credentials/Admin rights. Ticket/KB data grants no authority. No arbitrary shell/SQL/HTTP.

## Transactions, events, retries

1. Business transaction persists changes + OutboxEvent.
2. Worker claims through DB/lease, creates/resumes run by event ID, commits.
3. Read scoped sources/candidates; close snapshot transaction before model.
4. Schema/refusal/timeout failures produce recoverable run failure, no partial tasks.
5. New transaction re-reads/locks in order, checks versions/policy/grantor/ACL/capacity; atomically writes domain/action/audit/notification/outbox.
6. Acknowledge after commit; redelivery uses business keys/stored results.

PostgreSQL is recovery authority for broker failures; Redis locks/Celery IDs do not replace domain dedup. See [architecture](../technical/architecture.md) for keys/backoff/dead-letter.

## Public/internal and data

PUBLIC receives no internal fields; INTERNAL binds ticket/current IT rights. No internal-to-public handoff. Cache/history/sources recheck ACL; revocation hides source-dependent content, not only citations. KB requires valid Published/version; query-time revocation is immediate.

Render escaped text/server-verified source cards, never model HTML/JS/URL fetches. Private files retain parent permissions; binaries/public URLs are not sent by default. No promise of perfect detection of user-pasted secrets.

## Invariants and valid mutations

| Domain | Preserve | Allowed change |
| --- | --- | --- |
| Tickets BR-02–06 | Requester, priority matrix, state/rights/version | Confirmed creation, no autonomous resolution/closure |
| Plans/tasks BR-14–15 | Ticket separation, DAG, one effective version | Policy create/assign/reassign; human Done |
| Allocation BR-16 | Real membership/skills/schedule/load | Atomic recheck/reservation; no overbooking |
| SLA BR-08–10 | 24/7, snapshot, pause/reopen, dedup/history | Workforce schedule does not change SLA; changes need approval |
| First response | Eligible public IT comment only | Reviewed draft must actually be sent; AI messages/reminders do not count |
| Assets BR-11 | One active assignment | Task references/inventory, no autonomous issue/purchase |
| MET01–22 | Scoped/period/timestamp facts | Committed entities/actions, not drafts |
| Manual/approval | Respect locks/in-progress work; reject stale | Approved still rechecks policy/rights/capacity |

## AI data

Conversation/Message/SourceReference/Draft are separate from domain data; deleting chat deletes no ticket/task/audit. ConfirmedCommand retains ticket-creation owner/digest/version/TTL/idempotency. Other cards use their original API commands/validation/idempotency, not every result in result_ticket_id. Run/Action/Approval/Outbox/Usage retain provenance/status/results/errors. No default prompt/body/secret logging; retention/redaction/trace-review rights require D-40 decisions.

## Disable automation and compensate

Disabling assistant stops generation; disabling automation blocks new background commands. Provider-waiting work rechecks before writing. Disabling AI does not delete created tasks; undo uses authorized/versioned/audited valid compensation, never silent regression of active/completed work. Manual flows/SLA continue.

Bounded retries/backoff; infeasibility becomes exception. Unknown timeout charges retain conservative cost reservations; no infinite retries. Recover broker failure from DB events.

## Non-regression plan

PLANNED/NOT RUN: retain 47 core AC, 10 AC-X, 12 TC-SLA, 8 AC-AI/18 TC-AI. Unconfirmed Q&A/summaries/drafts do not change domains. Ticket confirmation creates exactly one ticket/SLA/event. Granted automation changes tasks/assignments/actions/notifications within scope with full traces; do not require immutable databases for every AI command.

Add AC-OPS01–12/A1–A13: hard candidate filters, cycles, absence, locks/in-progress work, stale approval, two workers/replay/retry, revoked policies/KB, injection/provider/broker failure, report sources, restore. Inspect provider/API payloads, not only answers. No application tests run during documentation work.

[AI catalog](use-cases-stories-and-acceptance.md) · [AC](../06-acceptance-criteria.md) · [Traceability](../traceability/master-traceability.md) · [Roadmap](../09-design-readiness.md).

## Shared assistant-action and coordination screen

Provider-suggested cards are data; backend chooses `form_key` from a user/source-authorized registry. Frontend uses trusted form renderers, not model HTML/JS. Registry maps to existing operations/schemas, not model/client-selected endpoint/method/actor/role/credentials. `AssistantResult.action_cards` prepares/hands off; it is not effect evidence.

After explicit form confirmation, call the original API with session/CSRF/expectedVersion/idempotency. Recheck scope/state/validation; atomically persist domain/audit/outbox like the original screen. Freeze submitted payload; edits to data/resource/audience need renewed preview/confirmation. Tickets retain digest/TTL draft/confirm routes; other actions retain core contracts. “Confirmed” in a prompt is not HTTP confirmation. Unsupported intents cannot dispatch.

Audit actor is the submitting user; correlation may link conversation/message/card without secrets/raw prompts. UI traces do not authorize Manager chat access. Background tasks keep AI_COORDINATOR/event/policy/grantor; tabs never change actors or let sessions borrow grants.

Only trusted security forms accept passwords; no secrets in messages/prefill/card history/models. Cancelling unsent forms does not mutate. Closing chat does not cancel committed requests/workers; check in-flight outcomes before retry. Result cards use domain responses/current records, not model claims.

Shared model/adapters are permitted with separate rate/concurrency/subquotas under one total budget including in-flight/unknown reservations. No model call merely to render existing activity. Provider failure retains native forms/read projections/SLA/recovery.
