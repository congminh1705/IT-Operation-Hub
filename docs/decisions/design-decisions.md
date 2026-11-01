---
id: itoh-docs-decisions-design-decisions
title: "Design decisions and assumptions"
type: reference
domain: project
module: decisions
tags: [project, decisions, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Record decisions, assumptions, their status, and matters requiring the project owner’s decision."
---

# Design decisions and assumptions

**Status:** D-29–D-39 and D-41 record confirmed business, architecture, documentation-scope, and test-configuration decisions within each entry's limits. D-42 records the unified AI Workspace direction. Unconfirmed assumptions/proposals and operational details remain explicit in D-40. Design finalization does not mean software implementation or acceptance.

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
| D-39 | Confirmed for testing only; execution not authorized in this documentation phase | Initial M3 uses OpenAI API/gpt-5-mini, maximum USD 5 total including retries/embeddings, DEMO data and test DB only. text-embedding-3-small is proposed if testing RAG and must be verified. No cap increases/more expensive fallback. Verify model access/billing/quota/pricing before running; no keys in chat/logs/repository. Not production approval |
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

Diagrams/SVG/XMind are documents, not implementation evidence. [M0–M5 roadmap](../09-design-readiness.md) replaces earlier milestone allocation; archives are historical only.
