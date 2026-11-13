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
