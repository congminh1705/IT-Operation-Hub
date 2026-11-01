---
id: itoh-docs-10-ai-assistant
title: "AI assistant and automatic coordination design"
type: reference
domain: ai
module: orchestration
tags: [ai, orchestration, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Define the AI assistant/coordinator, sources, policies, and action boundaries."
---

# AI assistant and automatic coordination design

**Target design · Not implemented or tested.** D-35 supersedes the old global D-23 “read-only/drafts only” limit. Current work updates documentation only.

## One AI Workspace, two execution modes

| Mode | Identity/permissions | Actions |
| --- | --- | --- |
| On-demand assistant | Current user; role/scope/visibility checked before each tool and response | Q&A/search/summaries and existing use-case actions through cards/forms/confirmation; services write under user permissions |
| Background coordination | AI_COORDINATOR tied to event/run/policy version/grantor | Generate plans/tasks, assign/reassign, remind/report within policy; escalate exceptions to management |

Providers generate schema-constrained output/tool proposals; the backend decides authorization, validity, and transactions. Models have no database/session credentials. Requesters cannot read workforce data, internal plans, traces, or approvals.

## Assistant retained in the MVP

- Q&A uses accessible Published KB with document name/version/openable links; insufficient evidence must be explicit. Revocation applies at retrieval without waiting for embeddings.
- Ticket/asset search and summaries follow API scope; report facts come from metric allowlists. No generated SQL.
- Ticket creation: collect fields → preview → user confirms that exact content/version → service creates with user permissions/idempotency → return persisted ID/result. No confirmation or changed content means no write. SCR21 editing is optional, not a mandatory chat exit.
- Reply drafts: separate PUBLIC/INTERNAL; no internal-to-public handoff. IT reviews/edits and sends through the original composer or a card composer in the AI Workspace using the same service. Chat/drafts are not public comments, first responses, or technical completion.
- Personal sessions/history recheck source access; Admin cannot automatically read others' chats. Retention: Decision required, D-40.

## Event- and policy-driven coordination

Understand goal/deadline/missing information → retrieve authorized workflow/template/sources → generate tasks/skills/effort/dependencies → backend validates schema/DAG/feasibility → filter eligible team/skills/schedule/workload candidates → AI ranks only eligible candidates with operational evidence → services create/assign tasks → notifications/audit/outbox → progress/schedule/load/blocked/deadline events → re-evaluate → reassign under authorization or escalate.

Missing information leads to structured, deduplicated clarification, not assumed free capacity. Unverified model estimates require approved template values or clarification before automatic assignment. Deterministic M2 templates do not replace real-model M3/A11 evidence.

## Policies and approval

| Action | Rule |
| --- | --- |
| Create plans/tasks | Automatic within granted workflow/team/priority/limits; otherwise draft/approval |
| Assign unstarted tasks | Eligible candidates only, within capacity; recheck before writing |
| Reassign unstarted tasks | Policy permitted, commitments unchanged, manual locks respected |
| Change assignee on In Progress/locked tasks | Manager approves a specific proposal; no overwrite of manual decisions |
| Change internal deadlines | Within policy, commitments/SLA/dependencies preserved |
| Change SLA/commitments/priority or transfer outside team | Authorized IT_MANAGER/ADMIN approval and pre-write revalidation |
| Remind/report | Rate/recipient limits and correct source/visibility |
| Done/Resolved/Closed/account creation | Authorized human actions; no autonomous AI confirmation |

Default deny. Manager can disable/narrow policies or lock assignments. Execution/retries/post-approval steps all recheck current policies/grantors. Approval shows current state, changes, impact, rationale, and snapshot versions. Stale/infeasible proposals are rejected or re-evaluated; approval never bypasses capacity/permission checks.

## Onboarding scenario

For 10 employees with complete names/configuration/deadline, a Published workflow, and enabled policy: inventory → device preparation → installation → testing → handover. Account requests can run in parallel once inputs are sufficient and must finish before testing. AI cannot purchase devices/create accounts.

Absence events identify affected tasks, reassign eligible unstarted work, and open exceptions for in-progress/locked/infeasible work. Technicians record completion; ticket resolution/acceptance remain separate. AI summarizes persisted outcomes.

## Integration and security

Provider/model/embedding adapters are separate from domains, with output schemas, tool allowlists, timeouts, call/token/retry limits. Snapshot → close read transaction → call model → new transaction re-reads versions/policies/ACL/capacity → atomically write domain/action/audit/outbox. No locks during model waits; no partial application of invalid plans.

Runs/actions trace event/policy/grantor/actor, sources/versions, model/prompt version, redacted arguments, results/errors/usage where available. KB/ticket content is untrusted instruction data; no arbitrary shell/HTTP/SQL. Escape rendered text and restrict links to server-verified sources. Provider failures do not block core operations/SLA workers. See [integration boundaries](ai/integration-and-non-regression.md).

## AI configuration and decisions

Prior confirmation applies only to **initial M3 testing**: OpenAI API, `gpt-5-mini`, maximum USD 5 total including retries/embeddings, DEMO data and test database. `text-embedding-3-small` is proposed if testing RAG and requires verification. No more expensive model switch/cap increase. Current instructions authorize documentation only, not API calls.

Account model access, billing/quota, runtime prices, tool/schema support, and quality are unverified. Production provider/model/embedding/budget/data policy: **Decision required**, D-39/40. No keys in chat/logs/repository; DEMO permission does not authorize real data.

## Screens and acceptance

Retain SCR-AI01–03 and SCR-OPS01–07 in [IA](04-information-architecture.md): task board, plans, workforce, coordination, approval, policies/templates, KB. Drafts/proposals differ from execution outcomes.

The [AI catalog](ai/use-cases-stories-and-acceptance.md) has 8 assistant UC/US/AC; original catalogs contain 10 UC-OPS, 12 US/AC-OPS, and A1–A13. All PLANNED/NOT RUN. Both successful automation and exceptions require real-model/persisted-data evidence in an authorized environment; static UI/chat is insufficient.

## AI Workspace and action assistant — D-42

**One main screen at `/assistant`, labeled “Không gian AI” in the Vietnamese UI.** Regular layouts show conversation/action cards beside activity; compact layouts use two same-page tabs preserving drafts/context. SCR-AI01 is the shared shell; SCR-AI02 is preview/form inside it; SCR-OPS04 is scoped activity. `/coordination` is only an alias for `/assistant?view=activity`, not another sidebar item. OPS05 approval may open in the same shell's detail area; `/approvals` deep links preserve context.

The assistant is an alternative app interaction channel, not only chat/links. User states a goal → retrieve authorized data → ask for missing details → build a trusted-registry card/form → user edits/reviews impact → explicitly confirm the action → domain service rechecks/writes → show the committed response result. The flow can finish on the same screen. Original forms remain available during AI failures.

| User group | Supported work in the shared screen | Execution conditions |
| --- | --- | --- |
| R and all users in personal scope | Create/track requests; answer Pending; review results, confirm closure/request further work/cancel where allowed; consult assets/KB/notifications | Correct ticket/audience/content preview; separately confirmed requester actions; no internal/workforce data |
| T | Search/self-claim eligible tickets; draft/send public replies or private notes; update tickets; progress/remaining effort/blockers/results on assigned tasks | Current team/assignee/state/dependency checks; IT confirms public submission; Done requires human result and remaining 0; no assigning others |
| M/A within authority | Review plans/schedules/load, record absence, prepare interventions/assignments, decide exceptions, edit policies; assets and reports | Before/after, reason, expectedVersion, feasibility/capacity, proper domain service; decision differs from execution |
| A and separately authorized users | Prepare existing administrative forms; KB only with granted author/publisher rights | Users/roles/passwords/secrets/permission changes use secure in-shell forms or contextual handoff; no secrets through models, no autonomous user/role grants; D-29 unchanged |

This table grants no new rights and promises no universal model-driven CRUD. Registry entries are existing intents/use cases with reviewed schemas; unsupported intents say so and offer manual forms. Admin still verifies, enters passwords in secure forms, and explicitly creates users. Department-head status does not grant IT privileges.

Cards identify user-requested actions with Not sent/Sending/Saved/Outcome unknown/Failed states. Background activity identifies policy automation with filtered run/action/approval/result records. Model replies/stream completion do not mean action success. Users need not chat to start/sustain coordination; closing/deleting a conversation does not stop workers, cancel tasks, or delete audit.

Requesters receive only filtered public progress for their own tickets, never internal run/policy/candidate payloads hidden in the client. T sees authorized team/assigned work; M/A see scoped management activity, not others' private chats. The shared screen does not merge private histories.

Both modes may share a model/provider adapter with separate system prompts, context, tool registries, actors, rate limits, queues/concurrency, and subquotas. One global budget limits both modes together: not USD 5 per mode or duplicate calls for one interaction. D-42 does not select production providers/models. Assistant availability and automation policies are independent; the workspace can still display status/manual actions when the provider fails or assistant is disabled.

## Independent capabilities in one screen

The assistant does not require a completed reassignment. It accepts supported intents with or without runs/exceptions and whether automation policies are enabled, subject to current user/permissions/data/assistant configuration. Conversely, workers do not need open chat. The UI does not attach every conversation to the latest task/run; context must be selected/confirmed by the user. A replacement proposal is a separate business example, not the chatbot's sole purpose.

## When coordination starts and when work is manual

Workers process committed domain events, not merely opening/messaging the AI Workspace. Each event checks workflow/policy/data/scope before effects; new tickets do not all require automatic plans/tasks.

| Event / source | Expected handling |
| --- | --- |
| Ticket created or information added | Check workflow/policy eligibility; ask for missing information; plan/assign only when eligible |
| Task progress/completion/blocker | Evaluate affected dependencies/risks, not regenerate the entire plan |
| Schedule/absence/skills/membership/load change | Filter affected tasks; reassign under policy or escalate locked/in-progress/out-of-scope work |
| Deadline/SLA risk | Remind/alert/re-evaluate under policy; do not extend SLA/commitments autonomously |
| Approval decision or policy change | Recheck rights/grants/versions/schedules/load; do not execute stale snapshots |

Concrete events/producers/consumers are in the [API/event catalog](technical/api-design.md). Scheduler handles risk scans/reminders/retries; UI polling reads status and does not continually trigger replanning.

Authorized M/A may manually plan/assign/reassign, lock assignments, disable/narrow automation. T may execute/self-claim within permissions, not assign colleagues. Manual actions still check state/version/dependencies/skills/schedules/capacity and record audit/outbox. AI respects manual decisions/locks; Done/Resolved/Closed require valid performer/requester actions.

UI23 shows one locked replan run in five steps: record absence → propose → approve → recheck/reassign → notify/monitor; currently waiting at 3/5. Eligible unstarted/unlocked tasks can follow a no-approval branch. Rejected/stale proposals do not falsely continue. The proposal and report chatbot are independent regions, not prerequisites.

## Normal and exception screens

[UI37 — normal AI Workspace](design/wireframes/37-ai-workspace.svg) is the default representative; the assistant does not need approval to function. [UI23 — exception proposal](design/wireframes/23-coordination.svg) appears only for an authorized exception, not permanently. The fixtures are independent, sharing route/actor/permission boundaries/capabilities. Normal activity may show automatic assignment without approval; this does not mean specialist tasks are Done.
