---
id: itoh-docs-decisions-design-decisions
title: "Design decisions and assumptions"
type: reference
domain: project
module: decisions
tags: [project, decisions, reference]
priority: 1
status: design-draft
owner: "Hoang Cong Minh"
approval: needs-review
updated: 2026-11-09
authority: primary
purpose: "Record decisions, assumptions, their status, and matters requiring the project owner’s decision."
---

# Design decisions and assumptions

**Status:** D-29–D-39 and D-41 record confirmed business, architecture, documentation-scope, and test-configuration decisions within each entry's limits. D-42 records the unified AI Workspace direction; D-43 confirms frontend-first task planning; D-44 extends decomposition to the complete project. Unconfirmed assumptions/proposals and operational details remain explicit in D-40. Design finalization does not mean software implementation or acceptance.

**D-29 — internal account provisioning** is confirmed at business level; technical implementation details remain part of M1.

## Status, authority, and interpretation

The user/project owner decides scope; the agent documents decisions and impacts. D-01–21 are proposed assumptions/design decisions, read alongside D-29–41, not blanket user approvals. D-22–28 retain history with their current scope identified. D-29–39 are confirmed within their stated limits; D-40 contains open decisions; D-41 confirms the role model. No entry proves implementation.

Each entry records ID, choice, rationale/consequences, and affected documents. Explicit constraints reject Django ORM replacing SQLAlchemy/Alembic, a chatbot-only or recommendation-only MVP, and unrestricted AI Admin access. Do not invent evaluation/approval history for unselected details. Changes to confirmed decisions need a superseding entry/impact link rather than silent removal.

| ID | Proposed decision | Rationale, impact, and confirmation needed |
| --- | --- | --- |
| D-01 | One role per user; IT users can submit personal requests, with separate My requests/IT work scopes | Avoid duplicate accounts; prevent accidental access to internal content on personal tickets outside the user's team |
| D-02 | New tickets enter one Admin-selected intake team | No automatic classification added; configure an active team before operations |
| D-03 | M/A change priority; T verifies through discussion and suggests changes | Follows the specified Manager authority without inventing additional permissions |
| D-04 | Ticket creation/details use pages; assignment/state changes use short dialogs | Conversations/files/timelines need URLs and space for reading/tracking/handling |
| D-05 | Public/internal composers have separate in-memory drafts; no durable draft storage | Reduce wrong-audience posting without adding server-persisted drafts |
| D-06 | PNG/JPEG/WebP/PDF; 10 MB means 10, 000, 000 bytes; at most 5 per submission | Defines images/PDF; excludes active SVG content; extend allowlist only after assessment |
| D-07 | Content/files in one submission have a consistent business outcome; retries prevent duplicates | Avoid ambiguous partial tickets; file-storage transaction strategy belongs to technical architecture |
| D-08 | Pending questions/solutions create public comments; IT cannot count its own reply as first response to its own ticket | Preserve substantive public-response semantics; state events are not responses |
| D-09 | Snapshot the full P1–P4 table at creation; priority overrides use that snapshot | Change the budget by priority without retroactive changes from Admin defaults |
| D-10 | Alert assignee and active Managers; fall back to Admin if no Manager | IT Manager is Head of IT, no team-lead tier; AI policy coordination still has human supervision |
| D-11 | Serial optional; supplied serial unique; repair may retain assignment | Preserve usage responsibility during repair; UX shows state and responsible holder |
| D-12 | Reopening requires a valid assignee; M/A reassign first if the historical assignee is locked/outside the team | Preserve In Progress assignee invariant; confirm this edge case with the business owner; no invented reopening-request state |
| D-13 | Current queue KPIs are not hidden by date filters; period charts/reports are labeled separately | Avoid hiding backlog; publish latest-resolution formulas in metrics catalog |
| D-14 | Requester sees currently assigned assets and own related tickets; Technician sees assets needed for team tickets | Minimize unrelated device/personnel exposure; Manager/Admin see all |
| D-15 | Out-of-scope records appear not found; role-level functions return 403 | Prevent existence probing; use safe generic UX and return paths |
| D-16 | Admin enters initial passwords, hands them over internally under D-29; no automated email/email reset | Provisioning/handover business flow confirmed; password/forgotten-password details need M1 refinement |
| D-17 | Locking users/removing IT roles/membership requires handling open ticket/task assignments; preserve history | Revoke access immediately; no active work left with an unauthorized assignee; never lock the last active Admin |
| D-18 | Light interface, Inter/Segoe UI, blue, distinct identity | Consistent identity for an IT operations tool |
| D-19 | No report export, signup, email password-reset control, or dark mode; AI now follows D-35 | Earlier AI exclusions are replaced by MVP assistant/policy automation |
| D-20 | Historical: stack left open during early design; superseded by D-30–32 | Target technologies selected; dependency install/lockfiles/runtime verification remain future M1 work |
| D-21 | IT self-handled tickets without another IT person's valid response do not satisfy first response; stop monitoring at termination and resume from creation when reopened | Clarifies D-08; avoid fake timestamps/alerts on terminated tickets; confirm IT self-service process before M3 |

Field lengths, paging default 20/maximum 100, a 30-day warranty window, and a 60-second worker cadence are **proposed values**, not researched enterprise policies. Adjusting them must not alter permissions, states, or MVP goals.

## Additional AI assistant decisions

| ID | Decision | Rationale and impact |
| --- | --- | --- |
| D-22 | Historical assistant addition; current MVP scope follows D-33/D-35; 8 UC/US and 3 AI screen patterns use separate namespaces | Supersedes earlier AI exclusion; retain core IDs/invariants and add OPS under the current design |
| D-23 | **Partly superseded by D-35:** Q&A/summaries/reply drafts stay read-only/draft; the blanket mutation ban no longer applies to D-42 user-confirmed actions, including ticket creation, or policy automation | Preserve state/validation/version/SLA; services, not models, authorize and write |
| D-24 | Independent feature flags/provider adapter; do not enable without configuration | AI is not a startup/core/worker dependency; production vendor/model undecided; no dependencies added in documentation work |
| D-25 | Conversations/messages/sources/drafts are separate data | No mandatory Ticket/SLA/Asset fields; deleting chat does not delete business records; decide retention before operations |
| D-26 | Separate PUBLIC/INTERNAL sessions; no internal-to-public handoff | Avoid mixed-history self-filtering; filter public sources before model calls; IT reviews before sending |
| D-27 | Server determines citations, metrics, and scope from existing sources/services | No model-written SQL/metrics; revocation applies to caches/history/in-flight output |

## UI v0.4 decision

| ID | Decision | Rationale and impact |
| --- | --- | --- |
| D-28 | Refresh 13 UI designs, add 2 boards, 44 custom vector icons, motion/responsive specification; retain v0.3 | Requested friendlier, polished UI; presentation only, no new screen IDs/business behavior; motion is proposed, no runnable prototype; see [visual direction](../design/visual-refresh.md) |

## Confirmed account-provisioning decision

| ID | Decision | Status and scope |
| --- | --- | --- |
| D-29 | Department head submits a Service Request / Account ticket as Requester in the app. Admin verifies requester, need, and IT-role approval, then creates the user under Administration → Users, defaulting to Requester. Password handover uses an enterprise channel; the department head tracks/accepts the ticket result | Updated by user instruction on 30 October 2026: requester is a department head and requests stay in-app. No HR/head role or automatic ticket-to-user provisioning; existing states/SLA apply. First Admin/department-head accounts use authorized setup; bootstrap/password policy still need M1 refinement. [Detailed flow](../requirements/account-provisioning.md) |

## Target architecture confirmed on 30 October 2026

| ID | Decision | Basis and impact |
| --- | --- | --- |
| D-30 | Next.js App Router/React/TypeScript frontend; FastAPI/Python REST backend; modular monolith in one repository | FastAPI owns APIs/business logic, Next.js owns frontend; [stack](../technical/tech-stack.md) |
| D-31 | PostgreSQL + synchronous SQLAlchemy Session + Alembic/Psycopg 3; PostgreSQL server sessions, pwdlib Argon2id, CSRF | FastAPI owns authentication/authorization; a maintained hashing library is not an end-to-end session service. Test sessions/CSRF/scope/transactions/versions; [architecture](../technical/architecture.md) |
| D-32 | Celery, one 60-second Beat, Redis broker; private local/S3; pnpm/uv, Compose/Linux, selected tests | PostgreSQL owns SLA/breaches/dedup, not UI/Redis; Linux workers even for Windows development. Candidate versions have metadata checks but need resolve/build/test/lock in M1; [versions](../technical/version-baseline.md) |
| D-33 | Integrated AI assistant is included in MVP implementation/acceptance; enable/disable is operational, not a scope exclusion | Retain 8 assistant UC/US and source/visibility/permission constraints; D-35–38 add automation/KB. D-23 now applies only to read/draft operations. Require 8 AI AC, 18 verification cases, core regression before MVP handover; production provider/model/SDK/data policy undecided; M3 tests only under D-39; no running chatbot |

## Decisions updated 31 October 2026 — current direction

Assistant, coordination, and KB/RAG are in the MVP with the M0–M5 roadmap. Confirmed targets do not mean implemented or accepted software.

| ID | Status | Decision and impact |
| --- | --- | --- |
| D-34 | Current work scope confirmed | Design documentation only; no application code/migrations/dependencies/application tests/operational configuration. M0–M5 plans do not activate implementation |
| D-35 | MVP target confirmed | AI assistant and automatic coordination; retain Q&A/search/summaries/reply drafts and user-confirmed conversational ticket creation. Plan/assign/monitor/reassign through services under policy; supersedes global D-23 write ban |
| D-36 | Target confirmed | Ticket intake/SLA separate from task execution; versioned plans/DAG, one effective version; verified skills/schedules/capacity/remaining work, manual override/lock |
| D-37 | Scope confirmed | KB/RAG in MVP: Draft/Published/version/ACL/citations; PostgreSQL + pgvector; background indexing does not replace current authorization |
| D-38 | Principles confirmed | Default deny, AI_COORDINATOR tied to policy/grantor; recheck permissions/policy/version/capacity per action; outbox/retry/idempotency/audit; block stale approvals; no locks across model calls |
| D-39 | Historical test selection; provider and paid allowance superseded by D-48 | Initial M3 uses OpenAI API/gpt-5-mini, maximum USD 5 total including retries/embeddings, DEMO data and test DB only. text-embedding-3-small is proposed if testing RAG and must be verified. No cap increases/more expensive fallback. Verify model access/billing/quota/pricing before running; no keys in chat/logs/repository. Not production approval |
| D-40 | Decision required before affected implementation | Open list below; documented proposals do not automatically become enterprise policy |
| D-41 | Role model confirmed by user | IT_MANAGER is Head of IT; no separate IT Team Lead role/tier. AI coordinates under policy; IT Manager sets policies, supervises, intervenes, approves exceptions. IT staff do specialist work; Team groups specialists. Other department heads use Requester. Affects scope/permissions/research/UI/diagrams |
| D-42 | UI and action-assistant direction confirmed, 1 November 2026 | One AI Workspace for assistant and automatic coordination; assistant performs existing use cases through cards/forms/user-authorized confirmation. Background coordination continues when chat closes. Separate identities/permissions. Model/adapter may be shared with separate prompts/contexts/tools/limits; production provider/model undecided. Assistant does not depend on runs/approvals; automation does not depend on chat. Current UI spec defines layout/login/stepper; no implementation activation |

### D-40 — Open decisions

| Topic | Status / next step |
| --- | --- |
| Production provider/model/embedding/SDK | Decide by quality/data/budget; D-39 is not production approval |
| M3 runtime prices/quotas/model access | Verify at execution; no key/billing/model-call evidence exists. If unavailable, report alternatives/costs rather than switching autonomously |
| Production budget/retention/provider data | Decision required; DEMO-only permission does not authorize real data; no uncontracted no-retention/no-training claims |
| Capacity periods/slots, work hours/daily budgets, holidays, skill verifiers | Decide operational values; BR-16 defines conservative handling for missing data; label DEMO seeds |
| Workflow/team/priority/action scope, adjustment limits, reminder cadence | Manager configuration/approval before enabling; no grants by default |
| Templates, skills taxonomy, effort samples | Manager-verified initial data; unverified model estimates cannot authorize auto-assignment |
| KB author/publisher/ACL, chunking/dimensions/index freshness | Refine; immediate ACL revocation is confirmed |
| Chat/run/action/audit retention/redaction, incident investigation rights | Decide; Admin does not automatically read all chats or prompt/body logs |
| Inventory reservations | Decide whether used, TTL/release/owner, relation to issue; reservations are not assignments |
| Password/bootstrap/non-email reset and D-12/D-17 reassignment after access loss | Refine; immediate revocation/no last-Admin lock remain |
| Emergency revocation without eligible handover assignee | Decide process preserving In Progress/Pending ticket and in-progress/locked task invariants; do not retain revoked access or report false locking success. Open branch in Flow 5/FIG-FLOW07 |
| DB lock granularity/isolation, exact idempotency keys, post-approval exception grants, retry/backoff | Review schema before code; atomicity/no duplicate effects/no overbooking/no locks during model waits are mandatory |
| OpenAPI DTO/vocabulary and physical DBML | Static design-draft contracts exist; review fields/projections/cookie names/exact schema/nullability/indexes/FKs/omitted selected-view fields before code. Artifacts do not approve schemas/DTOs or create migrations |
| Backup retention/RPO/RTO, deployment environment, operations owner | Decide/measure after implementation; daily backup/restore rehearsal is a target |


### D-40 identity and access — PRE-01.01 review

This section records confirmed requirements and candidates for PO review. Candidate names, times, thresholds and operations below are not an approved environment configuration.

| Topic | Confirmed baseline | Proposed implementation or open decision | Consumer |
| --- | --- | --- | --- |
| Initial accounts | D-29 authorizes setup for the first Admin and initial department heads. Department heads remain Requesters. Regular creation follows Admin verification of a request and separate approval for IT roles. | An operator runs a one-time setup command under recorded authorization. Serialize creation of the initial Admin, refuse a second bootstrap, require unique normalized email and hand over an expiring initial credential over the enterprise channel. No default account, public bootstrap route or secret in ticket/audit output. PO names the operator and approved channel. | FND-06.01, FND-06.02 |
| Password and recovery | D-29 uses enterprise handover. D-31 and NFR15 require Argon2id. An unsolicited email reset flow is outside the selected scope. | For single-factor passwords, propose 15–128 characters, Unicode/space support, blocklist, no composition or periodic changes. Never silently truncate. Propose 24-hour candidate lifetime for a single-use temporary credential, with change required before workspace entry. Reset requires Admin/operator identity verification via an approved internal channel, revokes existing sessions and gives a fresh temporary credential. The requester-verification procedure, expiry and password policy need PO approval. | FND-04.01, FND-04.02, FND-06.02, INT-01.02 |
| Session lifetime and rotation | D-31/NFR15 require PostgreSQL-backed opaque sessions, restricted cookies and immediate revocation. Locking an account preserves history. Unlock does not restore sessions. | Propose 30 minutes idle and 12 hours absolute, enforced by the server. Background polling should not renew an idle session. Replace the pre-session after login; revoke existing sessions on password reset/change and on effective access loss. Recheck scoped access and optimistic version at the final mutation boundary. Timeout values and legitimate activity signals need PO approval. | FND-04.01, FND-04.02, FND-17.01, INT-01.01, INT-01.03 |
| Cookies, CSRF and login errors | HttpOnly session cookie, Secure in production, SameSite, mutation CSRF and login Origin check are required. The server supplies the principal. Scoped GET requests do not mutate business data. | For the same-origin deployment, propose `__Host-itoh_session` and `__Host-itoh_pre` (Path=/, no Domain, Secure in production, HttpOnly, SameSite=Lax); separate local-only names if development uses HTTP. `GET /auth/csrf` returns a non-cacheable token bound to the pre-session/current session; send it as `X-CSRF-Token` on unsafe requests. Verify login Origin against configured origins. Propose a generic 401 for invalid credentials (draft login response does not currently list 401), 403 for rejected Origin/CSRF, and 429 with Retry-After for throttling. Exact names/statuses remain draft inputs for PRE-01.02. | PRE-01.02, FND-03.01, FND-04.01, FND-04.02, INT-01.01 |
| Login/reset limits | Shared API error rules include 429. The project has no approved auth quota. | Candidate for load testing: after 5 consecutive failed attempts per normalized identifier in 15 minutes, progressively delay further attempts and cap the delay at 15 minutes. Add a separate source budget (candidate 30 login attempts per minute), subject to shared-office traffic review. Apply equivalent outward behavior for unknown identifiers, avoid permanent lockout and never log submitted secrets. Reset/provisioning limits require an operations decision. The thresholds, trusted proxy/origin boundary and failure behavior of the rate-limit store need approval. | FND-04.01, FND-06.01, INT-01.01 |
| Access loss and regular handover | D-17/NFR01 require immediate access loss and protect the last active Admin. History is retained. Reassignment must preserve ticket/task eligibility and lock invariants. | Review replacement eligibility, reason and affected versions before a regular change. At confirmation serialize the last-Admin check, recheck eligibility/versions and apply handover and access changes consistently. Reject normal deactivation when no eligible replacement exists and escalate to an authorized owner. | FND-17.01, FND-17.02, FND-17.03 |
| Emergency without replacement | D-40 leaves this branch open. Immediate access loss and assignment invariants are still binding. | First preference is an already eligible designated on-call replacement. When none exists, temporary authorization suspension, active-work containment and repair need an explicit approved contract, including authority, allowable state transitions, SLA and lock semantics. Do not auto-assign the last Admin, reactivate a revoked principal, silently clear a lock or report handover as complete. | FND-17.01, FND-17.02, FND-17.03 |

<a id="d-40-workforce-periods-pre-0201"></a>

### D-40 workforce periods and verified inputs (PRE-02.01)

PO approved local-day periods, explicit schedule slots and the missing-input behavior on 2026-11-25. Production calendars, daily budgets and verification sources remain inputs to supply before operational use.

| Topic | Confirmed behavior | Proposed setting or pending operational input | Consumer |
| --- | --- | --- | --- |
| Periods and boundaries | UTC storage and Asia/Ho_Chi_Minh business display. Measure capacity and allocations in integer minutes. | Use local calendar days as budget periods and explicitly bounded schedule intersections as slots. Represent every interval as [start, end), split at local midnight and convert to UTC before intersecting. Use minute precision and no blanket minimum slot duration until operations supplies one. | FND-15.01, WF-04 |
| Working calendar and budget | Only configured working intervals count. Per-day capacity is the lesser of the configured budget and scheduled minutes remaining after absences. SLA clocks follow BR-08 through BR-10 independently of staff schedules. | Operations supplies the work schedules, holiday calendar and per-person daily budget. A configured day off has zero capacity. Missing schedule, holiday coverage or budget is unknown and blocks automatic allocation. No implicit weekday schedule, eight-hour budget or holiday feed. | FND-15, WF-04 |
| Overlaps and multi-day work | Union overlapping schedule and absence intervals before calculating availability. Sum allocated remaining minutes for unfinished work, including Blocked. Every slot and period must fit. | Clip absences to scheduled intervals and allocation windows to approved slots. Allocate a multi-day task explicitly by period, totaling remaining effort exactly. If allocation is incomplete, show unallocated work as a risk and request clarification. | FND-15, FND-16, WF-04 |
| Skill evidence | IT Manager and Admin configure and verify skills within their current authorized scope. Technician self records and model output are not verification. | Persist verifier identity, effective scope, verification time and evidence reference/version. Missing, expired or superseded evidence cannot satisfy a required skill. The real skill taxonomy and any validity policy need PO/operations approval. | FND-14, WF-02, WF-04 |
| Effort source | Published template versions are immutable. Automation needs verified effort; undocumented work is not zero minutes. | IT Manager verifies a scoped estimate or template effort against traceable evidence such as a prior completed run or reviewed technical estimate. Record the source, version, verifier and positive minutes per step. AI suggestions may be reviewed as drafts. Without verified input, keep manual planning/clarification available and leave automation unable to assign. | WF-02, FND-16, WF-04 |

**Scenario review using synthetic minutes**

| Scenario | Inputs | Expected |
| --- | --- | --- |
| Overlapping absences | Schedule 09:00-12:00, daily budget 150, absences 09:30-10:30 and 10:00-11:00 | Union is 90 minutes. Scheduled remainder and effective capacity are 90 minutes. |
| Multi-period fit | Remaining effort 150. Free capacity 120 on day 1 and 30 on day 2. | Explicit allocation 120 + 30 fits if both slots fit. Allocation 100 + 50 fails on day 2 even though the aggregate is 150. Repeating 150 into each day is invalid. |
| Unknown evidence | Missing calendar or required skill verification, with positive verified effort | Automatic assignments are denied. The existing manual clarification path remains available with the missing field identified. |
| Unknown effort | Verified skill and calendar, but an AI-only effort estimate | Keep it as a draft. It cannot authorize automated assignment or count as zero load. |

<a id="d-40-concurrency-outbox-approval-pre-0202"></a>

### D-40 concurrency, outbox and approval contracts (PRE-02.02)

PO accepted this contract on 2026-11-25. Timing values are for the pilot; production use requires validation and operational signoff.

| Boundary | Contract proposal | Consumer |
| --- | --- | --- |
| Lock order and isolation | PostgreSQL READ COMMITTED with explicit transaction row locks. Each command locks its affected authorization/grant and policy rows, then ticket, plan and task rows, then workforce and normalized local-day capacity rows, in that order and ascending stable keys within each group. All allocation and capacity writers use the same order. For missing period rows use a unique person/day row and insert-or-get before locking. Read authoritative versions, schedules, slot demand and current load after obtaining the locks. Retain conditional versions on writes. Close read transactions before external calls; lock contention retries may reuse the same intent only for known rolled-back transient transactions. | WF-04, FND-15, FND-16, FND-17 |
| Uniqueness and capacity | Enforce one active assignment per task and one allocation row per assignment/person/period/slot; retain history. Period rows serialize competing aggregate and slot checks across all relevant plans. Verify required minutes against every slot and period after acquiring the capacity lock. Required assignment, allocations, audit and outbox commit together. Partial reassignment or overbooking rolls back. | WF-04, WF-07 |
| Intent and delivery | API retries use the existing actor/operation/idempotency-key ledger and canonical validated payload digest. Worker transport dedupe uses event ID and handler. Business-effect identity is separate: use an immutable confirmed command or approved proposal ID plus action and target, enforced uniquely in the effect transaction. Do not derive identity from broker message, worker attempt or model output. Same intent/digest reconciles the prior result after current read authorization; changed digest conflicts. A new approval receives a new intent and checks current versions and scope again. | WF-05, WF-07, WF-08, AI-08 |
| Lease and retry | Claim a committed delivery in a short transaction using a unique lease owner/token, DB-clock deadline and conditional heartbeat/finalization. An expired lease can be claimed by another worker. For a new database effect, lock and verify the current lease after domain locks in the same effect transaction, and commit the effect and completion together. A stale token cannot finalize or start a fresh effect. Finish the DB effect before queue ack. Candidate pilot values: lease 60 s, heartbeat 20 s, up to five attempts, with 5/15/45/120 s retry delays plus bounded jitter. Retry transient failure or known rollback. Terminal validation/authorization conflicts go to terminal outcome. Exhausted transient deliveries retain a redacted dead-letter record. Redrive uses the original identity after operator review. For an unconfirmed external result, reconcile by downstream idempotency key or status before redrive. | WF-05, WF-07, PRE-04 |
| Approvals and exceptions | Approval is a decision, with execution tracked separately. A Pending record expires at its earliest validity limit; candidate default maximum is 24 h, clamped by applicable grant/policy/window end. Approve/deny only while pending and valid under the current authority and snapshot. If stale before decision, supersede and issue a fresh proposal only after re-evaluation. If expired, stale or revoked before effect, prevent execution and retain its conflict/expired reason. Explicit exception scope and expiry bind the approved intent and never extend deadlines, restore revoked rights or bypass capacity checks. | WF-08, WF-09, AI-08 |

PostgreSQL reference: [Row-level locks](https://www.postgresql.org/docs/18/explicit-locking.html#LOCKING-ROWS) and [transaction isolation](https://www.postgresql.org/docs/18/transaction-iso.html).

**Contract walkthroughs (synthetic examples)**

| Scenario | Input | Expected |
| --- | --- | --- |
| Competing assignments | Two different tasks each request 60 minutes against the same 90-minute slot and person-day. | First transaction commits 60. Second rereads 30 free under the shared lock and returns conflict. One allocation/audit/outbox set persists. |
| Approval becomes stale | Proposal uses workforce version 7. An absence changes it to 8 after approval or before the decision. | Before decision, supersede the stale proposal. After approval, execution reports conflict with zero writes and no blind retry. A replacement uses a new proposal and intent. |
| Postcommit redelivery | The worker commits a confirmed effect and crashes before queue ack. | Redelivery observes the committed business-intent result and records delivery completion without another effect or audit. A different payload for that intent conflicts. |
| Lease expires and external result is unknown | Worker A loses its lease. Worker B claims the delivery. A later response arrives. | A cannot finalize with its stale token. B reconciles the original intent/provider status before any retry. Exhaustion retains redacted dead-letter evidence. |

<a id="d-40-bounded-automation-pre-0203"></a>

### D-40 bounded automation policy (PRE-02.03)

PO accepted the bounded automation design for PRE-02 closure on 2026-11-25. BR-17, BR-18 and D-38 remain the baseline. Live grants and numerical pilot caps must be explicitly configured and approved before automation uses them.

| Boundary | Confirmed or proposed contract | Consumer |
| --- | --- | --- |
| Scope and grantor | An enabled, versioned policy must explicitly bind the published workflow ID/version, team IDs, priorities, action allowlist, grantor, limits and effective UTC interval. A manager grants only within current management authority and team scope. A policy cannot grant itself new rights, and a service identity cannot stand in for the grantor. Empty or omitted allowlists do not match any target. | WF-03, WF-07, AI-08 |
| Assignment and adjustments | Within a current grant, automated assignment/reassignment is limited to eligible unstarted tasks. Verify current lock, dependencies, skills, period/slot capacity, and concurrency snapshots at commit. In-progress, manually locked, cross-team, priority, SLA or commitment changes require the relevant authorized management decision. An approval does not remove hard authorization and capacity constraints. | WF-04, WF-08, WF-09 |
| Admin and restricted operations | Account creation/role changes, autonomous completion or closure, and shell execution are unavailable to AI_COORDINATOR. Human work uses existing service authorization; automation policy configuration cannot switch these actions on. | FND-06, WF-03, AI-08 |
| Limits | Require explicit nonnegative adjustment limits and explicit reminder interval, recipient scope and rate limits before permitting the respective action. Missing, exhausted or zero action allowance denies the action. Count committed effects atomically under their intent keys. Candidate pilot for review: at most one automated reassignment per task per local day and one deadline reminder per task per eligible recipient per local day. These are proposed caps, never fallback settings. | WF-03, WF-06, WF-07, WF-09 |
| Revocation, missing data and intervention | Disable/revoke effective immediately at the domain commit boundary. Re-evaluate claims, retries and approvals against the latest policy, grantor and state. Missing verification or a stale proposal leaves the action unapplied and surfaces a safe reason. A manager can use current permissions to manually intervene, preserving the existing preview, explicit confirmation, audit and feasibility checks. Human decisions remain distinct from automated effects. | FND-14, FND-15, WF-07, WF-08, WF-09 |

**Scenario review**

| Scenario | Expected |
| --- | --- |
| Disabled policy or grantor revoked after worker claim | Reject before write. A pending or previously approved action cannot re-enable the grant. Record the safe blocked reason. |
| Allowed workflow but wrong team, priority or action | Reject the effect despite other fields matching. Empty scope cannot act as a wildcard. |
| An eligible unstarted task is in scope but data or capacity is missing | Do not assign. Surface clarification when authorized, without substituting estimates or availability. |
| Manager intervenes on in-progress or locked work | Show current record and affected allocations; require confirmation and applicable approval. Any stale version or overbooking blocks the write. |
| Reminder limit has been reached or recipient lost scope | Suppress the reminder. Current recipient authorization is checked before delivery and repeated intents do not consume the budget twice. |

<a id="d-40-knowledge-access-index-pre-0301"></a>

### D-40 knowledge publication, ACL and indexing (PRE-03.01)

PO approved this contract on 2026-11-25. D-37, BR-21 and D-48 remain binding. Named production grants and verified account/model eligibility must be supplied separately. Listed index settings are pilot candidates.

| Boundary | Confirmed rule and review proposal | Consumer |
| --- | --- | --- |
| Author, publisher and ACL authority | Default deny. Propose separately granted author, publisher and ACL-management capabilities scoped to a collection or article. An author can edit permitted Draft content. Eligible IT Manager/Admin staff still need the relevant explicit scoped grant to publish or alter ACLs. Holding a role or publishing a document adds no implicit read access. Record grantor, scope, version and expiry. Named role assignments and separation-of-duty requirements await PO. | AI-01, OPS-06, INT-05 |
| Immutable source version | Publish with reviewed version, audience and current permission. Published content and provenance remain immutable; edit by creating a new Draft. Track the current Published version explicitly. Superseded/Retired versions are excluded from current retrieval; historical citations resolve only under current ACL, valid version policy and intended audience. A missing or hidden citation uses unavailable state and exposes no title, excerpt or metadata. | AI-01, OPS-06, INT-05 |
| Revocation and output | Current DB scope/ACL governs candidate filtering before ranking/token budgeting, source loading before provider context, and revalidation before output, citation or history display. Caches include identity/current policy/version; invalidation events accelerate cleanup. If authority changes during a model call, discard the affected output and refuse stale citations. If a historical answer includes content from an unreadable source, hide that source-derived answer or excerpt with a generic unavailable state. Index state never authorizes reads. | OPS-07, OPS-09, INT-05 |
| Chunks and embeddings | Preserve article/version, chunk order, source offsets/heading, normalized content digest, and parser/config/model/dimension/index revisions. Candidate synthetic pilot: heading-aware text, up to 512 tokens per chunk with up to 64 tokens of overlap, split on paragraphs when possible, 768 dimensions with Gemini Embedding 2 in text mode. Verify per-account model/region/quota compatibility with D-48 before any call. Query vectors and indexed vectors must match the approved model, dimension and preprocessing profile; mismatches require a new generation, never a mixed index. Numerical values and model are candidates pending PO and test evidence. | OPS-07, AI-03, PRE-03.02 |
| Freshness and fallback | Background reindex tasks are idempotent per source version and index profile. Activate a ready generation only after all expected chunks match manifest digests and that version is still current and readable. A new publication with failed/pending indexing cannot use a superseded version as current evidence. A stale or mismatched generation returns a typed unavailable/insufficient-evidence result. Proposal for pilot alert: current approved source pending more than 15 minutes; the alert does not change authorization or imply successful indexing. | OPS-07, WF-05, INT-05 |

Google documents [embedding dimensionality](https://ai.google.dev/gemini-api/docs/embeddings), [public pricing](https://ai.google.dev/gemini-api/docs/pricing/) and [unpaid data-use terms](https://ai.google.dev/gemini-api/terms#unpaid-services). Treat free-tier availability as account-dependent and use synthetic data only under D-48. This review did not call Google or validate a real account.

**Scenario review**

| Scenario | Expected |
| --- | --- |
| Draft or internal-only version appears in an old index for a Requester | Current version and ACL remove it before ranking or provider context. Citation lookup does not disclose a title or excerpt. |
| Access revoked after prompt assembly or answer stored in history | Recheck before output and history display. Hide unauthorized evidence even if the old vector, cache or citation is still present. |
| New publication replaces a source before asynchronous indexing completes | Previous version does not become current evidence. Return unavailable/insufficient evidence until a matching generation is ready. |
| Mixed embedding dimensions or configuration | Reject candidate vectors and rebuild a separate generation. Input never crosses D-48 data-use boundaries. |

<a id="d-40-assistant-confirmation-budget-pre-0302"></a>

### D-40 assistant confirmation, retention and shared budget (PRE-03.02)

PO approved this contract and its numeric synthetic-pilot settings on 2026-11-25. D-25, D-42, BR-20 and D-48 remain binding. Production values and provider execution require separate verification and authorization.

| Boundary | Contract |
| --- | --- |
| Registry and actor | A trusted server registry maps a versioned, allowlisted intent/form key to the existing published domain action and closed input projection. Cards contain only safe form key and prefill. User confirms through the existing service with their current identity and CSRF. The service supplies actor and authorization; model output cannot supply endpoint, privilege or credentials. Automated policy effects stay under AI_COORDINATOR and current grantor authority. |
| Preview and confirmation | Bind draft ID/version, registry revision, actor, target and canonical validated fields to a server-generated digest and expiration. Propose 15 minutes for synthetic pilot, shortened by any relevant source/grant expiry. Recheck the digest, version and current rights in the effect transaction. Changed fields or expired drafts require a new preview and confirmation; cancellation before commit cannot create an effect. Approved repeat with same key/digest returns the safe prior result after current scope check. Different digest conflicts. Lost response after commit reconciles the existing effect instead of issuing another one. |
| Chat and run retention | Keep conversation ownership and current source ACL checks through output, history and citations. Proposal: synthetic pilot chat messages expire 30 days after creation and redacted run summaries after 90 days. User chat deletion hides chat immediately and queues purge. Chat deletion does not delete confirmed domain data, runs, audit or durable command outcomes. Define operational purge windows, incident access and retention independently before production. Admin has no implicit access to others' conversations. |
| Redaction | Logs and audit keep actor, scope, version, correlation, model/config ID, safe outcome and measured usage when present. Exclude raw prompts, answers, credential values and private source excerpts by default. Redacted run history is separately scoped. Content needed for authorized chat history is stored separately and revalidated at read; provider dispatch is restricted to the approved data policy. |
| Shared budget and sublimits | One atomic ledger per provider account/model/quota window constrains both modes, including embeddings and retries where they share a provider quota. Reserve request/token units against both global ceiling and mode sublimit before dispatch. Use a unique call intent and bounded attempts. Proposed synthetic split for remaining shared quota: up to 60 percent assistant and 40 percent background, with no borrowing in the pilot. Respect registered provider quota dimensions and use actual verified quota snapshots rather than fixed vendor assumptions. D-48 authorizes USD 0 paid spend: deny paid, unknown-billing and unverified configurations. |
| Cancellation and reconciliation | Release reservation only if dispatch did not occur or provider confirms no usage. In-flight cancellation, timeout or missing usage keeps reservation held pending authenticated reconciliation or expiry of its quota window. Record unknown usage/cost as unknown. Exhaustion returns typed unavailable/limited and leaves authorized manual flows usable. |

**Synthetic scenario review**

| Scenario | Expected |
| --- | --- |
| Edit, expire or cancel a draft before confirmation | No write. Edit or expiry requires a new preview. Cancellation after commit reconciles the actual saved result. |
| Repeat same confirmation or send different digest with same key | Existing authorized result is returned for the same digest. Changed digest conflicts. |
| Assistant and background both request shared allowance | A single atomic ledger checks total and mode ceilings. Their reservations cannot create additional global quota. |
| Cancelled request after dispatch or unknown provider cost | Hold reservation and mark unknown until reconciliation. Do not refund early, silently count zero, retry blindly or activate billing. |

<a id="d-40-inventory-source-pre-0303"></a>

### D-40 inventory planning and minimum sources (PRE-03.03)

**PO decision on 2026-11-25: exclude durable inventory reservations in MVP.** Asset reads and plan previews show current availability and source version. They never hold an asset, give a plan ownership, decrement stock or promise fulfillment. There is no hold TTL, owner, release endpoint or expiry job in the approved MVP scope. A future reservation feature requires a separate approved decision covering these rules.

| Boundary | Contract | Consumer |
| --- | --- | --- |
| Planning and shortage | Distinguish eligible In Stock, shortage and unknown inventory. Record demand, quantity, current availability timestamp and source/version as preview evidence. Availability shown to two plans is informational and must not be summed as guaranteed supply. For unknown, stale or insufficient inventory, show the risk and route to human clarification, with no invented device or stock. | AI-02, AI-05 |
| Confirmed asset issue | Use only the existing authorized issue action with explicit confirmation. Lock and re-read the exact asset, eligibility, active recipient, state and expected version in the transaction. Issue creates the durable active assignment/history under BR-11. Different plans racing for the same asset yield one issue and one conflict. Same command replay reconciles its existing result; previews and proposal expiry never return or revoke an issued asset. | OPS-02, INT-04 |
| Minimum approved sources | Domain services supply access-filtered asset availability and source time/version, published and readable knowledge, and verified skill/calendar/template inputs when needed. Emit the minimum necessary projection; ordinary Requester never sees other holders or internal workforce/source details. Missing or revoked evidence yields clarification/unavailable. Raw ticket, prompt and personnel data remain outside unapproved provider dispatch. | AI-01, AI-02, AI-03, OPS-07 |
| Provider and spend | D-48 authorizes future validated Gemini free-tier calls on synthetic DEMO/test data only and USD 0 paid spend. Keep provider/account/region/quotas and production data/retention/budget as separately confirmed choices. No paid fallback, production calls or actual account verification in this decision leaf. | AI-03, PRE-04 |

**Synthetic scenario review**

| Scenario | Expected |
| --- | --- |
| Two assets requested, one eligible In Stock | Report shortage of one; no effect is committed by plan preview. |
| Two plans preview the same asset and both attempt a hold | Both previews may report current availability. Hold is unsupported; neither receives priority or exclusivity. |
| Proposal expires before issue confirmation | No release job or stock change, because no inventory was reserved. |
| Two authorized issue commands race for a single asset | First valid transaction writes one active assignment; second re-reads committed state and conflicts. Same-key replay cannot duplicate an issue. |

<a id="d-40-deployment-recovery-pre-0401"></a>

### D-40 deployment ownership and measurable targets (PRE-04.01)

PO approved the PRE-04.01 pilot plan on 2026-11-25, including RPO <= 24 h, RTO <= 4 h, 14 daily recovery points and a monthly rehearsal. The settings are pilot targets. Production SLA, hosting, spend, named owners and deployment authorization remain separate.

| Boundary | Pilot proposal and measurement contract | Unresolved / owner |
| --- | --- | --- |
| Environments | Keep local DEMO and an isolated Linux staging/recovery environment with synthetic fixtures. Production target follows the existing single-node Linux/Nginx/FastAPI/Celery/Beat/PostgreSQL/Redis/private object-storage architecture. Keep separate secrets, buckets, DBs and credentials by environment. Production host, region, capacity, data handling and spend need separate approval. | PO appoints platform owner and confirms hosting before procurement. |
| Ownership and alerts | Proposed routing: operations primary owns host/readiness, backup, broker/outbox and SLA scan alerts; a named backup operator receives escalation; service maintainer handles application faults; PO approves traffic switch or a business-impacting failover. Test the route with a staging alert, record acknowledged timestamp and owner. If roles, channel or coverage hours are unset, readiness is incomplete. | Names, channel, coverage hours and escalation windows to be confirmed by PO/operations. |
| Load and response | Start with the NFR11 fixture: 20 accounts, 60 tickets and 30 assets. Pilot traffic uses 10 simultaneous authenticated sessions for 15 minutes after 2 minutes warm-up, with a documented read/write mix. Candidate p95 thresholds: list reads <= 2 s; writes <= 3 s; record success/error counts separately so failed calls cannot improve the result. Record instance profile, fixture sizes, browser/API boundary and observation window. | Operations validates the profile and targets. No production SLO is asserted. |
| Outage and lag | Healthy SLA scheduler scan target stays at <= 60 s. Report last successful scan age, oldest eligible outbox age, failures and queue depth. Pilot candidates: alert after two consecutive failed 30 s readiness probes; alert on oldest eligible outbox item > 120 s or SLA scan age > 120 s across two 30 s observations. Measure alerts from validated probe/timestamp through delivery and acknowledgement. Provider failure degrades the AI path only; broker outage has explicit catch-up evidence and no scan guarantee. | Operations confirms thresholds, alert channel and actual incident response. |
| Backups and access | Daily encrypted PostgreSQL backup plus private object/version manifest copied to a separately controlled store. Only named backup/recovery operators have scoped rights; routine write access does not grant restore rights. Record a coherent recovery point, object versions/checksums, restore key custody and audit. Pilot proposal: retain 14 daily recovery points and run an isolated restore rehearsal monthly. A missing, unreadable or unmatched backup is a failed backup, not a recovery point. | PO/operations confirm key custody, retention and authorized operators. |
| RPO and RTO | Candidate targets for a complete host-loss test: RPO <= 24 h and RTO <= 4 h. Calculate RPO from incident time to the newest verified coherent DB/object recovery point. Calculate RTO from recorded incident declaration until validated service readiness after data, ACL, clocks/outbox and integration checks. Include detection-to-declaration separately. A backup schedule alone does not prove either. | QA-05 measures from isolated exercises. PRE-04.02 defines the release/recovery sequence. |

**Review fixtures**

| Scenario | Expected |
| --- | --- |
| Incident at 10:00 and newest coherent recovery point at 02:00 | Measured RPO is 8 h. Declaration 10:05 and validated readiness 13:05 give RTO 3 h. Compare with candidate targets, not production evidence. |
| Daily DB file exists but its private object manifest cannot be resolved | That timestamp does not qualify as a coherent recovery point. Alert operations and select the newest demonstrably restorable pair. |
| Outbox age exceeds the pilot threshold while DB remains healthy and broker is unavailable | Show backlog and notify operations. Core writes retain durable outbox state; recovery uses the recorded intent and measures catch-up. |
| No approved operator or no escalation acknowledgement | Mark deployment readiness incomplete and record the missing assignment or alert route. |

<a id="d-40-release-isolated-recovery-pre-0402"></a>

### D-40 controlled release and isolated recovery (PRE-04.02)

PO approved this release and recovery contract on 2026-11-25. Use the approved PRE-04.01 pilot targets when evaluating rehearsal results. Production deployment, failover and external egress each require their own authorization.

| Gate | Required sequence and evidence |
| --- | --- |
| 1. Release preparation | Pin the image or artifact digest, expected schema revision, compatible previous release, migration plan and identity of the single migration runner. Verify change approval, environment-specific secrets and a readable, coherent DB/object recovery point. Stage the upgrade and compatibility checks for API plus worker. Record release ID and affected data. Block traffic switch while prerequisites are missing. |
| 2. Single upgrade | Pause incompatible traffic and consumers, and stop Beat when the migration plan requires a maintenance window. Exactly one authorized migration runner acquires an environment-level database lock before checking the starting revision and migrating. Replica startup never migrates. Save before/after schema revision, timestamps and commit status. |
| 3. Failed migration | Keep new traffic and incompatible workers stopped. Check whether the transaction rolled back and whether any nontransactional or external step applied. If cleanly rolled back, verify the old schema, artifacts and worker compatibility before returning to the old deployment. If state is partial or schema is incompatible, quarantine and follow the approved forward-fix or coherent restoration path. No blind downgrade or repeated upgrade against unknown state. |
| 4. Isolated recovery | Use separate staging/recovery DB, storage, broker and credentials. Deny provider, email and other external effect egress before restore and verify those blocks. Keep workers and Beat stopped and avoid importing live queue messages. Select a verified coherent database point plus object-version manifest and restore privately. Record backup identity, event watermarks and incident/declaration times. |
| 5. Validation and effect reconciliation | Check schema, DB/object linkage, checksums, ACL/session projections, ticket clocks and preserved snapshots, durable outbox, confirmed command ledger and redacted audit. Compare pre-loss effect identifiers from independent records with restored state. If an external effect may have succeeded after the restore point or a result is unknown, quarantine it and reconcile with operators/provider before any replay. Do not assume a restored missing ledger row proves the effect did not happen. |
| 6. Controlled resume | Keep production side effects blocked during rehearsal. Bring up read-only readiness first, then explicitly release a scoped worker and one Beat only after ACLs, leases, verified outbox intent identity and backlog are reviewed. Reconcile before retry. Observe lag, errors, duplicate effects and SLA catch-up. Authorized production release separately decides egress and traffic switch after checks pass. If a gate regresses, stop progression and retain logs/evidence. |

**QA-05 handoff evidence:** artifact and migration runner identity, source and target revisions, clean vs partial failure outcome, backup/manifest checks, proof egress remained blocked, worker/Beat status, reconciliation sample, before/after ACL and clock evidence, actual RPO/RTO and approver for any production resume.

| Synthetic walkthrough | Expected |
| --- | --- |
| Migration fails before commit and previous revision remains intact. | Do not switch to new traffic. Only return to the previous version after compatibility and readiness pass. |
| Migration fails after a nontransactional change or schema state is unknown. | Quarantine new deployment. Require an explicit forward-fix or coherent restore plan before resume. |
| Recovery manifest is incomplete or an effect is unconfirmed after the recovery point. | Keep workers and external traffic blocked. Resolve missing objects or reconcile the original effect before actions can resume. |
| Isolated restore validates identity, clocks and outbox. | Record measured rehearsal results. Start authorized scoped rehearsal workers with egress blocked. Production switch is a separate decision. |

### D-40 login policy approved for FND-04.01

PO approved the internal-app login policy on 2026-11-25. This supersedes the proposed values above for this scope.

- PostgreSQL stores opaque session token hashes and per-normalized-identity login budgets. Session limits are 30 minutes idle and 12 hours absolute. Background polls do not renew idle time. Successful login consumes the pre-session and rotates any presented existing session.
- Production cookies are __Host-itoh_pre and __Host-itoh_session, using Secure, HttpOnly, SameSite=Lax and Path=/ without Domain. Local HTTP uses itoh_dev_pre and itoh_dev_session. Login checks an exact allowlisted Origin and the pre-session-bound CSRF header.
- Use Argon2id. Password creation accepts 15 to 128 characters including Unicode and spaces and checks a password blocklist. Temporary credentials expire after 24 hours, are single-use and only allow the password-change workflow.
- Begin progressive delays after five failed attempts per normalized identity within 15 minutes, capped at 15 minutes. Return generic 401 for invalid or inactive accounts, 403 for Origin/CSRF rejection, 429 with Retry-After while throttled and 503 when a required login store is unavailable. Existing sessions remain usable if their session store can still be read.
- Nginx is the sole public entry point. It replaces forwarded client address headers and FastAPI trusts only the configured Nginx peer. The pilot starts at 120 login requests/minute/IP at Nginx, alongside the authoritative PostgreSQL per-identity budget. Deployment configuration and pilot tuning remain with the deployment owner.
- First-Admin setup requires an authorized operator shell and a recorded authorization reference. The operator and internal handover channel are selected before any real bootstrap. The local tests use synthetic authorization and accounts.

Reference guidance for candidates: [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html) for password length, blocklist and throttling. [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) for server-side expiry, cookie settings and renewal on authentication changes. These references do not set this project's timeouts or quotas.

The companion [PRE-01.02 foundation contract reconciliation](../technical/api-design.md#pre-0102-foundation-contract-reconciliation) records the API/DBML differences and downstream review gates.

#### Scenario walkthrough

| Scenario | Required result | Review finding |
| --- | --- | --- |
| First Admin | Authorized setup, exactly one initial bootstrap, no credential in business outputs | Proposal covers serialization and repeat refusal. Operator and handover channel need PO confirmation. |
| Access loss with eligible handover | Prior session loses access; new owner is eligible; historical author/assignee remains visible where allowed | Normal path preserves scoped access and history. A stale confirmation must be re-reviewed before writing. |
| Last active Admin | Two concurrent access changes cannot remove the last active Admin | Serialize the invariant at commit and reject the losing change. No implicit bypass or emergency credentials were approved. |
| Emergency with no eligible replacement | Revoke access without silently breaking work-state invariants or claiming handover | Unresolved. Designated coverage helps only when eligible. PO needs to approve the no-coverage procedure with operations before FND-17 implements it. |

Diagrams/SVG/XMind are documents, not implementation evidence. [M0–M5 roadmap](../09-design-readiness.md) replaces earlier milestone allocation; archives are historical only.

## D-43 - Frontend-first task planning

**Confirmed by the project owner on 9 November 2026.** Adopt the SDLC Kit principles of outcome-oriented task decomposition, explicit parent/dependency links, bounded context packages and evidence-based completion. This instruction updates planning documents only; it does not request application code.

- Delivery order is Phase A frontend with DEMO data and complete interactions, then Phase B real backend/API, Phase C integration, and Phase D whole-system acceptance. M1-M5 remain capability/acceptance milestones.
- Retain the existing 88 scope IDs as work packages (epic-level records), with all 67 user stories in scope. Refine only the next selected batch into executable child tasks, beginning with the 12 A1 tasks under FE-01/02/03.
- Each executable task has one deliverable, included/excluded scope, exact child dependencies, context source sections, planned outputs and verification/evidence requirements. Use the [project task contract](../implementation/workflow/task-workflow.md) and [execution board](../implementation/workflow/execution-board.md).
- Use one lowercase task lifecycle: pending, in-progress, blocked, review, done, cancelled. Package readiness is separate from execution authorization. Assign the executor and activate the parent when a subsequent coding request authorizes work.
- Reuse frontend components for later service integration. Mock success does not establish server authorization, database guarantees, actual AI outcomes or production readiness. Do not copy the kit installation/governance records or assume its CLI is installed.

This records the user's method/phase direction, not approval of open D-40 business/production choices or a software acceptance result.

## D-44 - Complete project task decomposition

**Confirmed by the project owner on 9 November 2026:** expand all work packages into executable task records now. This supersedes only D-43's preference to expand one batch at a time; it retains frontend-first order, bounded context, one deliverable per task and evidence-based lifecycle.

- Preserve all 88 package IDs and all 67 user stories. The [execution board](../implementation/workflow/execution-board.md) now defines 230 pending tasks: 63 frontend, 137 decisions/services, 16 integration and 14 acceptance/recovery.
- Every task has explicit artifact dependencies, scope/exclusions, source context, expected outputs, verification and handoff. [Parent criterion coverage/closure](../implementation/package-task-coverage.md) assigns all 264 numbered parent criteria and real integration evidence owners.
- Complete Phase A frontend DEMO first; FE-18.03 is an ancestor of all later work. Backend and integration tasks reuse frontend output. Service leaf completion and package-level UI acceptance are distinct, with no circular dependency through unfinished integration.
- All packages are bounded-specification-ready; no package/task is executing, no executor is assigned and no application check has run. A future coding request, satisfied prerequisites and affected business decisions are required at start.
- Refresh individual task context before execution and refine further only when code/contract evidence warrants it. Full decomposition is not an effort/sprint estimate or approval of open production choices.

This request changes documentation only; no application code, dependency installation, model invocation or deployment is requested.

## D-45 - Previous UI baseline (superseded)

Hoang Cong Minh approved the preceding visual baseline on 9 November 2026. D-46 supersedes it; old design artifacts were removed at the owner's request.

## D-46 - Final frontend design and consolidation

**Status:** approved by Hoang Cong Minh on 10 November 2026.

The final frontend baseline is v1.0 Nexus × Spectrum / Graphite: compact typography, neutral charcoal surfaces, vivid sharp luminous borders and matching text, ACCESS / 01 login, four role dashboards and all eight screen groups. Preserve the established AI Workspace composition and apply the same visual language throughout.

Use [approval](../design/approval.md) and the [final catalog](../design/final/index.html). Remove superseded designs and preview sets; retain only the final editable source, canonical figures and regeneration/check tools. This approval does not start or accept implementation tasks, change application roles, or settle open business decisions.

## D-47 - Approved frontend revision and implementation alignment

**Status:** approved by Hoang Cong Minh on 10 November 2026. **Historical baseline: v1.1**, superseding v1.0/D-46 at that date; D-50 now supersedes post-login presentation and retains this login.

The owner approved the latest full frontend, including the centered slate-glass login, restrained navy architectural background, ten brighter staggered circuit tracks, region exploration/zoom, parallax/light/ripple effects and transparent eye hover/press. Retain the rest of the Nexus/Graphite screen suite and AI Workspace composition.

Bind the final source to all 63 FE task cards and constrain later INT/QA work to preserve it. FE-03.01 owns the complete decorative login scene; FE-18 owns its acceptance/handoff checks. Resolve stale light-palette, two-column-login and blanket no-parallax instructions in current documents. The [scope map](../design/implementation-scope.md) is the focused reading/ownership guide.

No task ID, dependency, lifecycle state, business requirement or Phase A exit gate changes. No coding task starts, no implementation report is fabricated, and no backend/AI/3D business feature is added by this approval. See the [approval record](../design/approval.md).


## D-48 - Gemini free-tier provider direction

**Status:** confirmed by Hoang Cong Minh on 11 November 2026. Supersedes D-39's OpenAI/gpt-5-mini selection, proposed OpenAI embeddings and USD 5 paid test allowance. Preserve D-39 as historical context only.

Use Gemini Developer API models eligible for the account's free tier. Paid spending authorized: **USD 0**. Select and verify exact generation/embedding model IDs, SDK, region/account access, free-tier quotas, structured outputs/tool capability and data handling terms before real integration. Never activate billing, switch to a paid model/provider or treat exhausted quota as permission to spend. Use bounded retries and explicit unavailability/manual fallback. No guarantee of unlimited or permanent free service.

Keep provider/model/embedding adapters, FastAPI, Celery/Redis, PostgreSQL/pgvector, ACL-aware RAG, confirmation and domain authorization unchanged. Embedding selection remains a separate verified free-tier-compatible decision; generation model selection alone does not settle it. Only synthetic DEMO data/test DB are authorized for future tests; production data policy remains D-40. Google free-tier data-use terms must be reviewed before any non-DEMO deployment.

Official verification sources: [pricing](https://ai.google.dev/gemini-api/docs/pricing), [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits), [terms](https://ai.google.dev/gemini-api/terms). This change updates planning only: no task statuses/dependencies changed, no API call, SDK installation or application test claimed. FE DEMO scope and v1.1 / D-47 visual baseline remain unchanged.


## D-49 - Future RAG, context and orchestration direction

**Status:** future direction acknowledged by Hoang Cong Minh on 11 November 2026; no framework adoption approved.

Prioritize ACL-aware, versioned RAG and selective context management as AI capabilities mature. Keep current operational facts behind authorized domain services/tools. Evaluate LangGraph for evidenced multi-step, branching, human-confirmed or resumable workflows, and LangChain for useful integrations only when justified. Neither dependency is currently selected or required. The existing RAG scope remains in force.

Preserve D-48 Gemini free-tier/zero-paid-spend constraints and D-47 frontend baseline. This records future architecture guidance only: no new tasks, status/dependency/acceptance changes, code, installations or API calls. Adoption requires a concrete technical decision and scoped implementation refinement. Details: [future AI evolution](../10-ai-assistant.md#future-ai-evolution-direction).

## D-50 - Approved light purple format with Night City coordination

**Status:** approved by PO on 12 November 2026 for all application screens. [Current visual standard](../design/approved-format.md) supersedes D-47 post-login presentation. Preserve the existing D-47 login, all role/business contracts and AI Workspace composition. Use the selected light purple dashboard shell/typography globally; Night City is a scoped interactive coordination panel, not a global dark theme or a video-based business object.

The combined dashboard is the approved format reference. Other retained specimens, AI SVGs and README/XMind figures still represent previous layouts and have not all been re-rendered or visually accepted in v1.2. Each UI task must apply the new format to its owned surfaces and supply reference/actual evidence. Existing 230 task IDs, dependencies, implementation status, Parent PR policy and Gemini direction remain unchanged.


## D-51 - Final Mac/Teal UI and consolidation

- Date: 2026-11-13. Owner and approver: PO.
- Supersedes D-50 presentation: light Mac/Apple-inspired shell, teal #087F78, Inter, restrained materials and purposeful motion across 50 post-login screens. D-47 login unchanged; semantic luminous KPI edges and Night City coordination retained.
- Canonical source is docs/design/final only. Remove rejected Industrial and duplicate Taste review directories after promotion. Preserve required fonts, icons, evidence and shared dependencies.
- All 63 FE and 30 INT/QA cards bind to the current format; 230 task IDs, state and functional scope unchanged. No application completion or AI/backend integration is implied.
- PO design approval does not change the recorded open Taste catalog gate or replace per-task application acceptance.
