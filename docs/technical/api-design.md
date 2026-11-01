---
id: itoh-docs-technical-api-design
title: "Target API design"
type: reference
domain: api
module: contracts
tags: [api, contracts, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Define HTTP/schema/event contracts and traceability using static OpenAPI, without executable APIs."
---

# Target API design

**Design dated 31 October 2026; [static OpenAPI](../api/openapi.json) exists, runtime endpoints do not.** REST JSON under /api/v1; [guide](../api/README.md)/[operations](../api/operations.md) define draft DTO/HTTP contracts. Future FastAPI/Pydantic exports must be compared with reviewed contracts. No router/schema code/config is created now.

## Shared contract

Human requests use server-session cookies/CSRF; backend supplies role/scope, not client userId/role. Workers use service identity tied to run/event/policy/grantor; no public AI_COORDINATOR impersonation endpoint. GET does not mutate business data. Scope precedes list/count/lookup/report; default 20/maximum 100, ID tie-breaker, allowlisted queries/sorts.

Retryable mutations use expectedVersion/idempotency (proposed Idempotency-Key header), with actor/action/target/payload digest. Same key/content returns same result; different content 409. No automatic stale-mutation retry. Error code/message/field_errors/request_id; 401/403/scoped 404/409/422/429/503. ISO8601 aware UTC; no secrets in URLs/audit bodies.

## Proposed endpoint groups

Methods/paths are review contracts, not execution commands.

| Group | Relative method/path | Permissions/content |
| --- | --- | --- |
| Auth | GET /auth/csrf; POST /auth/login, /auth/logout; GET /auth/me; POST /auth/password | Login Origin/pre-session CSRF; session/CSRF/revoke/rotate |
| Administration | /users, /departments, /teams, /teams/{id}/members, /categories | Scoped minimal lookup; Admin POST/PATCH/version/audit/assignment impacts |
| Tickets | GET/POST /tickets; GET /tickets/{id}; POST /tickets/{id}/transitions, /assignment, /priority | Core rights, no DELETE; matrix priority/reasoned override; SLA snapshot |
| Content | GET/POST /tickets/{id}/comments; POST /tickets/{id}/attachments; GET /attachments/{id}/download | Parent visibility/files/authorization; notes not first response; requester public reply resumes Pending |
| Plans | GET /tickets/{id}/plans; GET /plans/{id}/versions; POST /tickets/{id}/plan-proposals; POST /plans/{id}/activate | Scoped T reads, M/A edit/activate, policy service identity; Draft not effective |
| Tasks | GET /tasks; GET /tasks/{id}; POST /tasks/{id}/transitions, /progress, /assignment | Team T reads/assignee results; M/A coordinate; version/dependency/capacity/lock |
| Workforce | GET /workforce; GET/PATCH /workforce/{id}; POST /workforce/{id}/absences | M/A configure/verify; T self/minimal lookup; schedule events |
| Workflows | GET/POST /workflows; POST /workflows/{id}/versions, /publish | M/A, steps/DAG/effort/sources; immutable Published |
| Policies | GET/POST /automation/policies; PATCH /automation/policies/{id}; POST /automation/policies/{id}/disable | Authorized M/A, default deny/grantor/scope/limits/version |
| Runs/actions | GET /automation/runs; GET /automation/runs/{id}; POST /automation/runs/{id}/retry | Scoped/redacted M/A; no repeat successful intents; business failures need re-evaluation |
| Approvals | GET /approvals; GET /approvals/{id}; POST /approvals/{id}/decisions | M/A, before/after/impact/snapshot, separate executionStatus, stale 409 |
| Assistant | POST /assistant/conversations; GET/DELETE /assistant/conversations/{id}; POST /assistant/conversations/{id}/messages | Owner/current visibility/sources only; DELETE chat under retention |
| Ticket confirmation | POST /assistant/ticket-drafts; POST /assistant/ticket-drafts/{id}/confirm | Exact user-confirmed digest/version/TTL/idempotency, same Ticket service |
| KB | GET /knowledge, /knowledge/{id}/versions/{version}; POST /knowledge, /knowledge/{id}/versions; POST /knowledge/{id}/publish, /access | Read accessible Published only; author/publish/ACL under separate policy/audit, D-40 |
| Assets | GET/POST /assets; GET/PATCH /assets/{id}; POST /assets/{id}/assignments, /returns, /transitions | R/T scoped reads, M/A writes, atomic single assignment; no autonomous AI issue |
| Operations | GET /notifications; POST /notifications/{id}/read; GET /reports, /audit | Recipient/M/A metric/audit scope, no internal R payloads |
| AI settings | GET/PATCH /admin/assistant | Admin availability, no secrets/others' chats; Manager policies separate |
| Health | GET /health/live; GET /health/ready | Minimal status, no secrets/internal hosts; provider failure does not block core |

### Identification and interpretation

Comma-separated suffixes share their resource prefix, not root routes. Do not infer unspecified CRUD/DELETE. Stable group IDs support traceability; detailed paths/schemas are in static OpenAPI and need review.

| ID | Contract group | Source UC | BR / main conditions |
| --- | --- | --- | --- |
| API01 | Auth | UC01–04 | BR-01, NFR02/15 |
| API02 | Users/departments/teams/categories | UC05–08 | BR-01/02/05; Admin mutations |
| API03 | Tickets/transitions/assignments/priority | UC10–14, UC18–23 | BR-02–05/08/09 |
| API04 | Comments/attachments | UC15–17 | BR-06–08; parent scope |
| API05 | Plans/proposals/activate | UC-OPS04 | BR-14/15/17; one effective version |
| API06 | Tasks/progress/assignments/locks | UC-OPS05–07 | BR-15–18; manual lock/version/capacity |
| API07 | Workforce/absence | UC-OPS01 | BR-16; no default availability |
| API08 | Workflow versions/publish | UC-OPS02 | BR-14/17/21; immutable Published |
| API09 | Automation policies/grants | UC-OPS02/07 | BR-17/18; grantor/default deny |
| API10 | Runs/actions/retry | UC-OPS09 | BR-19/22; retries retain dedup |
| API11 | Approval/decision | UC-OPS08 | BR-18; decision ≠ execution |
| API12 | Assistant conversations/messages | UC-AI01/02/04–07 | BR-20/21; owner/public/internal |
| API13 | Ticket draft/confirm | UC-AI03, UC-OPS03 | BR-02/20; digest/TTL/idempotency |
| API14 | Knowledge/version/publish/access | UC-OPS10, UC-AI01 | BR-21; author rights D-40 |
| API15 | Assets/assignments/returns/transitions | UC27–31 | BR-11; atomic assignment |
| API16 | Notifications/reports/audit | UC26/32/33, UC-OPS09 | BR-12/22; recipient/MET scope |
| API17 | Assistant admin settings | UC-AI08 | D-24/33; no secrets/others' chats |
| API18 | Health | NFR04/21 | Minimal signal, no sensitive infrastructure data |
| API19 | SLA settings/clocks | UC09/24/25 | BR-08–10; Admin GET/PATCH /sla/policy; ticket clock projection; internal scans |

API06 includes M/A reasoned `POST /tasks/{id}/assignment-lock`; assignments never silently unlock. API09 grants cannot exceed grantor authority; no public service impersonation. API19 implements existing UC09; new defaults affect future tickets only.

### HTTP, concurrency, asynchronous outcomes

| Case | Expected result |
| --- | --- |
| Lists/details | 200, scoped items/page/page_size/total, allowlisted queries/sorts |
| Committed resource | 201, ID/version/reference; saved ticket does not imply task assignment |
| Background acceptance | 202, run/proposal reference for polling, not unexecuted-effect success |
| Synchronous mutation | 200/current version; logout/password/chat deletion 204 in draft |
| Conflict | 409 stale version/approval, same key/different digest, capacity/assignment conflict; no blind retry |
| Other errors | 401 session, 403 function, 404 scope/missing, 422 input, 429 limits, 503 dependency; no stack |

`expectedVersion` belongs to the edited aggregate. Approval also carries plan/task/workforce/policy snapshots. Failed conditional updates write no effects. Idempotency/effects are atomic; same in-flight key returns clear status, not arbitrary repeated provider calls. Command/key TTL/wait durations remain D-40.

## Conceptual schemas for review

| Name | Main fields / validation |
| --- | --- |
| TicketCreate / ConfirmedTicket | title/description/type/category/impact/urgency/asset; applicable workflow goal/deadline/onboarding; session requester |
| PlanProposal | plan/needs_information/exception, source IDs/versions, stable task keys/titles/skills/estimates/deadlines/dependencies/reasons; no cycles/unknown refs |
| CandidateSet / AssignmentCommand | Server eligible IDs/skills/calendar/capacity evidence/time/versions; target/version/policy/run/idempotency; model cannot add prohibited candidates |
| ApprovalView / Decision | before/after/impact/reason/snapshot; expectedVersion/approve-or-reject/reason; separate execution |
| ProgressUpdate | task/version/state/remaining/result; Done requires result/remaining 0/valid predecessors |
| RunView | event/policy/grantor/actor/sources/versions/actions/results/errors; sourced latency/usage/cost; permission redaction |
| KnowledgeView | article/version/state/ACL/citation; immediate read checks, no overprivileged caches |

Never return internal data for frontend hiding. Requester projections exclude workforce plans/actions/approvals/skills/load. Structured tool arguments remain untrusted service inputs.

## Conceptual response examples

Ticket creation returns id/code/status=New/version/request_id. Same-key replay returns same id without another SLA/event. Stale taskVersion approval returns STALE_APPROVAL/409, retains proposal for comparison, applies no old plan.

## Internal event contract

Events describe committed domain facts, not HTTP requests/permissions. Logical names below need wire-version/schema/physical-key review before code. Consumers receive minimal IDs/payloads and re-read current data/rights.

| ID | Event type | Transaction-owning producer | Expected consumer handling | Source |
| --- | --- | --- | --- | --- |
| EVT01 | ticket.created | Ticket service | Input evaluation; scoped notifications | UC10, UC-AI03, BR-02/19 |
| EVT02 | information.updated | Ticket/context service | Re-evaluate missing fields, no repeated questions | UC-OPS03, BR-20 |
| EVT03 | plan.activated | Work management | Monitor/notify; no task recreation | UC-OPS04, BR-14 |
| EVT04 | task.assigned | Assignment service | Notify/load-risk evaluation; producer already allocated atomically | UC-OPS05, BR-16/19 |
| EVT05 | task.progressed | Task service | Source-based monitoring/risk, no performer-result overwrite | UC-OPS06, BR-15 |
| EVT06 | task.blocked | Task service | Dependencies/reason/policy exceptions | UC-OPS06/07, BR-15/18 |
| EVT07 | task.completed | Task service | Eligible successor Ready; report; no ticket auto-close | UC-OPS06, BR-15 |
| EVT08 | availability.changed | Workforce service | Affected-task replanning/reassignment/approval | UC-OPS01/07, BR-16 |
| EVT09 | skills.changed | Workforce service | Recheck eligibility; unverified ≠ qualified | UC-OPS01/07, BR-16 |
| EVT10 | membership.changed | Team service | Immediate scope revocation, assignment/re-evaluation | UC07, UC-OPS07, BR-01/05 |
| EVT11 | sla.risk | SLA service | BR-10 recipient/threshold-dedup alerts | UC25, BR-10 |
| EVT12 | deadline.risk | Work/risk service | Remind/escalate, no deadline/SLA extension | UC-OPS07, BR-17 |
| EVT13 | load.changed | Allocation service | Recalculate affected-work feasibility | UC-OPS05/07, BR-16 |
| EVT14 | policy.changed | Policy service | Block/revalidate uncommitted intents; disable effective at service commit | UC-OPS02/07, BR-17 |
| EVT15 | approval.decided | Approval service | Execution rechecks rights/grants/snapshots/capacity | UC-OPS08, BR-18 |
| EVT16 | knowledge.published | Knowledge service | Index published version, not read authorization | UC-OPS10, BR-21 |
| EVT17 | access.revoked | Knowledge ACL service | Invalidate cache/retrieval; DB ACL effective without consumer delay | UC-OPS10, BR-21 |

Envelope: `event_id`, `event_type`, `schema_version`, `aggregate_type/id/version`, UTC `occurred_at`, `actor_type/id`, `correlation_id`, optional `causation_id`, minimal `payload`. No credentials/session tokens/full prompts/files. Payload actor is not authority evidence; services verify current principals/grants. Incompatible versions produce error/quarantine, not ignored successful ack.

At-least-once delivery. OutboxDelivery owns claims/leases/nextAttempt/retry/dead-letter, never rewriting occurred facts. Event+handler/purpose dedups runs; intent+target/version dedups effects. Late/out-of-order events re-read aggregates/versions and audit skipped obsolete intents or re-evaluate, never reverse old snapshots. Bounded transient retries; no blind schema/access/conflict retries. Counts/backoff D-40.

## Contract examples — synthetic data

Expected inputs/outputs, not captured app responses. DEMO IDs; final field naming must match OpenAPI.

```json
{
  "expectedVersion": 3,
  "decision": "approve",
  "reason": "DEMO: authorize the replacement within the approved scope",
  "snapshot": {"taskVersion": 7, "policyVersion": 2, "workforceVersion": 9}
}
```

API11 records the decision after rights/version checks. Conceptual response: `decisionStatus: Approved`, `executionStatus: Pending`, `approvalId: demo-approval-01`, `version: 4`. Only a successful execution transaction means Succeeded; enqueuing is not assignment success.

```json
{
  "code": "STALE_APPROVAL",
  "message": "The proposal has changed. Review the latest proposal.",
  "field_errors": {},
  "request_id": "demo-request-01"
}
```

HTTP409; no workforce snapshots outside scope. Review field_errors/codes/200/201/202/204 consistently with static OpenAPI before code; no running client/API.

## Contract completion conditions

Static design-draft OpenAPI covers API01–19 including timelines/asset histories/messages/minimal lookups. Review DTOs/names/enums/projections → separately authorized Pydantic/FastAPI implementation/runtime export comparison → TypeScript generation → contract/negative-scope/concurrency CI. No runtime/generated client. PATCH /auth/profile and GET /lookups clarify UC03/forms without admin permissions.

[Permissions](../requirements/permissions-matrix.md) · [Data/ERD](../requirements/conceptual-data-model.md) · [Architecture](architecture.md) · [Business rules](../requirements/business-rules.md).

## D-42 — Action cards in shared workspace

API12 adds AssistantResult.action_cards: allowlisted form_key/prefill declarations, no endpoints/methods/actors/secrets/executable code. Trusted frontend registry, not dynamic HTML. Confirmed forms call existing core APIs with original session/CSRF/role/scope/version/idempotency/validation. API13 draft/confirm stays ticket-specific; result_ticket_id is not generalized.

No generic command executor/new routes for UI unification. API12 prepares, not executes. Result cards read domain responses/current records; running/timeouts follow original APIs. Authorized automation APIs supply runs/activity; R reads public ticket projections rather than client-filtered run payloads. New OpenAPI card schema is not an operating endpoint.
