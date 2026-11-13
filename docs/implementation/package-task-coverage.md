---
id: itoh-package-task-coverage
title: "Package acceptance, task ownership and closure"
type: planning
domain: development
module: delivery
tags: [tasks, planning, implementation]
priority: 1
status: planned
owner: PO
approval: needs-review
updated: 2026-11-11
authority: derived
purpose: "Map every package criterion and external acceptance closure to executable task evidence."
---

# Package acceptance, task ownership and closure

**Approved frontend scope:** [v1.1 / D-47](../design/approval.md), including the final interactive login. Use the [63-task design map](../design/implementation-scope.md#task-map). Existing IDs, dependencies, business acceptance and lifecycle remain authoritative; visual approval does not start implementation.

## 1. Interpretation

This matrix covers **88 packages, all 264 numbered parent acceptance criteria, and 230 task files**. It complements the [67-story matrix](coverage.md): story → package → selected criterion → leaf output/check. FE-01 criteria 1-3 now have actual evidence in its completed child task handoffs; other package outcomes remain unverified.

A leaf is DONE when its **own bounded output and required checks** pass. A package is EPIC_DONE only when all children and every parent criterion pass, including any external frontend/integration closure below. For service-phase packages, UI phrases in the parent are completed by the existing FE and named INT outputs; B leaves establish actual service contracts, not a second set of screens. External closure is a package acceptance requirement, not a dependency that blocks production of its service leaves.

For each table row, the exact criterion text remains in the linked parent card. Tasks define the bounded implementation; the matrix assigns evidence ownership without rewriting the source requirements. Overlapping owners cover distinct parts/checks and do not authorize duplicate implementations. Where a referenced runtime contract, business decision or provider access is unavailable, refresh context and keep the consumer pending/blocked as appropriate.

## 2. Package acceptance records

<a id="fe-01"></a>

### FE-01 — Frontend scaffold and mock contract

[Authoritative package acceptance](06-frontend-first.md#fe-01). Current closure: EPIC_DONE for the DEMO foundation; [actual closure evidence](tasks/FE-01.03.md#6-evidence-and-handoff).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Create only the frontend scaffold and reproducible frontend lockfile; no backend, database, worker, deployment or provider setup. | [FE-01.01](tasks/FE-01.01.md) |
| 2 | Define a typed transport boundary with deterministic DEMO fixtures, reset behavior and success/loading/empty/error/conflict responses; never silently fall back to mock data in real API mode. | [FE-01.02](tasks/FE-01.02.md), [FE-01.03](tasks/FE-01.03.md) |
| 3 | Mark all DEMO data and simulated outcomes; use synthetic identities only, do not persist passwords/tokens or claim real authorization. | [FE-01.02](tasks/FE-01.02.md), [FE-01.03](tasks/FE-01.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="fe-02"></a>

### FE-02 — Design system and responsive workspace shell

[Authoritative package acceptance](06-frontend-first.md#fe-02).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Implement reusable buttons, fields, dialogs, status badges, tables/cards and feedback states using the approved v1.3 Mac/Teal palette and Inter typography hierarchy; retain semantic luminous KPI accents, scope Night City to coordination and preserve the original login (D-51). | [FE-02.01](tasks/FE-02.01.md), [FE-02.02](tasks/FE-02.02.md) |
| 2 | Build role-aware navigation, scoped ticket search entry, account menu and compact navigation; retain one AI Workspace entry. | [FE-02.03](tasks/FE-02.03.md) |
| 3 | Keyboard focus/trap/return and 320/390/768/1440 layouts work; query keys distinguish mock users and polling runs only in active tabs. | [FE-02.01](tasks/FE-02.01.md), [FE-02.02](tasks/FE-02.02.md), [FE-02.03](tasks/FE-02.03.md), [FE-02.04](tasks/FE-02.04.md), [FE-03.05](tasks/FE-03.05.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="fe-03"></a>

### FE-03 — Login, profile and password interaction

[Authoritative package acceptance](06-frontend-first.md#fe-03).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Implement the approved centered login, local architectural background and ten interactive circuits with pause/reduced motion under FE-03.01; implement validation, transparent stable eye hover/visibility/Caps Lock/loading/auth/network errors and safe internal return navigation with the mock transport. | [FE-03.01](tasks/FE-03.01.md), [FE-03.02](tasks/FE-03.02.md) |
| 2 | Provide four synthetic accounts through a clearly separate DEMO helper; do not add a production role picker or signup flow. | [FE-03.01](tasks/FE-03.01.md) |
| 3 | Profile/password forms preserve safe input, distinguish failures and clear mock user caches on logout/switch; simulated password/session outcomes are labeled. | [FE-03.03](tasks/FE-03.03.md), [FE-03.04](tasks/FE-03.04.md), [FE-03.05](tasks/FE-03.05.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="fe-04"></a>

### FE-04 — Administration and SLA configuration screens

[Authoritative package acceptance](06-frontend-first.md#fe-04).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Build create/edit/list/filter interactions for users, departments, teams/membership and categories with role-based mock access. | [FE-04.01](tasks/FE-04.01.md), [FE-04.03](tasks/FE-04.03.md), [FE-04.04](tasks/FE-04.04.md) |
| 2 | Display request verification, affected assignments, last-Admin/handover/error states and separate secure credential fields; no automatic account creation from ticket text. | [FE-04.01](tasks/FE-04.01.md), [FE-04.02](tasks/FE-04.02.md), [FE-04.04](tasks/FE-04.04.md) |
| 3 | SLA editor shows version history and old-versus-new snapshot impact; field errors and confirmation preserve input. Unresolved D-40 cases use explicit example fixtures, not invented enterprise rules. | [FE-04.05](tasks/FE-04.05.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="fe-05"></a>

### FE-05 — Ticket list, search and create form

[Authoritative package acceptance](06-frontend-first.md#fe-05).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Implement query-string-backed search, filters, stable paging/sorting and mine/work views over scoped synthetic fixtures. | [FE-05.01](tasks/FE-05.01.md) |
| 2 | Create form collects title/description/type/category/impact/urgency and optional asset, previews derived priority and submits once through the mock transport. Onboarding-specific fixtures request missing employee/configuration/quantity/deadline information without making those fields mandatory on every ticket. | [FE-05.02](tasks/FE-05.02.md) |
| 3 | Successful mock submission creates a visible DEMO record/detail route; validation/conflict/unknown-outcome states retain input and never display failed reads as empty success. | [FE-05.03](tasks/FE-05.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="fe-06"></a>

### FE-06 — Ticket conversation, actions, timeline and SLA presentation

[Authoritative package acceptance](06-frontend-first.md#fe-06).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Implement assignment/claim/priority and permitted transition dialogs with actor/reason/assignee guards simulated against fixture versions. | [FE-06.02](tasks/FE-06.02.md) |
| 2 | Keep public/internal drafts separate; Pending question, resolution, reply, requester acceptance and reopen flows show preview→submission→result. | [FE-06.03](tasks/FE-06.03.md), [FE-06.04](tasks/FE-06.04.md), [FE-06.05](tasks/FE-06.05.md) |
| 3 | Render separate response/resolution clocks, paused/stopped/breached states and filtered timeline; changing priority/reopening must not visually reset fixture history. | [FE-06.01](tasks/FE-06.01.md), [FE-06.05](tasks/FE-06.05.md), [FE-06.06](tasks/FE-06.06.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="fe-07"></a>

### FE-07 — Attachment upload and download experience

[Authoritative package acceptance](06-frontend-first.md#fe-07).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Implement selection/removal, maximum five files, 10,000,000-byte boundary, allowed formats and progress/error states for ticket/comment/note forms. | [FE-07.01](tasks/FE-07.01.md) |
| 2 | Show creation outcome separately from interrupted uploads; preserve text/valid selections and support deliberate retry without duplicate visual records. | [FE-07.02](tasks/FE-07.02.md) |
| 3 | Mock download uses only synthetic/session-local files in the visible parent scope; no public upload service, real storage or antivirus claim. | [FE-07.03](tasks/FE-07.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="fe-08"></a>

### FE-08 — Task board, plan and progress forms

[Authoritative package acceptance](06-frontend-first.md#fe-08).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Build equivalent task card/table views, filters, plan version/history and readable DAG/list dependencies. | [FE-08.01](tasks/FE-08.01.md), [FE-08.02](tasks/FE-08.02.md) |
| 2 | Implement simulated start/block/unblock/progress/Done forms with remaining effort, result, dependency and conflict checks; Done never closes the ticket. | [FE-08.02](tasks/FE-08.02.md), [FE-08.03](tasks/FE-08.03.md) |
| 3 | Show assignment/lock reasons and unavailable actions; management changes require preview and explicit confirmation. | [FE-08.04](tasks/FE-08.04.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="fe-09"></a>

### FE-09 — Workforce skills, calendars and absence forms

[Authoritative package acceptance](06-frontend-first.md#fe-09).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Present verified skills, calendar, daily budgets, remaining/allocated work and available versus unknown capacity. | [FE-09.01](tasks/FE-09.01.md) |
| 2 | Manager absence/skill/schedule forms show affected work and preview; Technician sees self/minimal allowed mock scope. | [FE-09.02](tasks/FE-09.02.md), [FE-09.03](tasks/FE-09.03.md) |
| 3 | Use explicit DEMO periods and staffing values; saved absence shows evaluation pending, not completed reassignment. | [FE-09.02](tasks/FE-09.02.md), [FE-09.03](tasks/FE-09.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="fe-10"></a>

### FE-10 — Workflow, policy and coordination activity screens

[Authoritative package acceptance](06-frontend-first.md#fe-10).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Build workflow/version editor and policy scope/limit/enable/disable forms with explicit confirmation and mock validation. | [FE-10.01](tasks/FE-10.01.md), [FE-10.02](tasks/FE-10.02.md) |
| 2 | Render scoped run/action timeline, provenance, errors, manual locks and controlled retry fixtures. | [FE-10.02](tasks/FE-10.02.md), [FE-10.03](tasks/FE-10.03.md) |
| 3 | Distinguish queued/proposed/approved/executed; no-run, no-approval, disabled and failed paths are explicit. Opening a page does not simulate an automatic domain mutation. | [FE-10.03](tasks/FE-10.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="fe-11"></a>

### FE-11 — Exception review and approval dialogs

[Authoritative package acceptance](06-frontend-first.md#fe-11).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Show candidate/current assignment, skills/window/remaining effort, lock reason, task deadline, handover and unchanged SLA impact. | [FE-11.01](tasks/FE-11.01.md) |
| 2 | Approve/reject requires role and reason; stale/revoked/infeasible fixtures preserve input and direct re-evaluation. | [FE-11.02](tasks/FE-11.02.md) |
| 3 | Approved remains a decision; execution results come from a separate explicit mock response/fixture, never immediate optimistic success. | [FE-11.02](tasks/FE-11.02.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="fe-12"></a>

### FE-12 — Asset inventory and lifecycle interactions

[Authoritative package acceptance](06-frontend-first.md#fe-12).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Build scoped list/search/detail/history and metadata forms; current holder is edited only through lifecycle actions. | [FE-12.01](tasks/FE-12.01.md), [FE-12.02](tasks/FE-12.02.md) |
| 2 | Issue/return/repair/retire dialogs show recipient, reason and state guards; concurrent fixture conflicts do not silently overwrite. | [FE-12.03](tasks/FE-12.03.md) |
| 3 | Connect ticket asset selection to eligible mock assets; preserve independent permissions for related ticket links. | [FE-12.01](tasks/FE-12.01.md), [FE-12.04](tasks/FE-12.04.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="fe-13"></a>

### FE-13 — Knowledge browsing, authoring and source states

[Authoritative package acceptance](06-frontend-first.md#fe-13).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Implement search/category/article/version/source views over public and internal DEMO fixtures. | [FE-13.01](tasks/FE-13.01.md) |
| 2 | Provide author/publisher-granted mock personas or explicit fixture permissions; no automatic Admin/Manager content bypass. | [FE-13.02](tasks/FE-13.02.md) |
| 3 | Draft/edit/publish/access forms and loading/stale/indexing/revoked/insufficient-source states work without embeddings or provider calls. | [FE-13.03](tasks/FE-13.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="fe-14"></a>

### FE-14 — Assistant conversation, sources and availability

[Authoritative package acceptance](06-frontend-first.md#fe-14).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Build owner-specific mock chats, source cards, ticket/asset lookups, ticket summaries and audience-safe editable reply drafts using deterministic responses. | [FE-14.01](tasks/FE-14.01.md), [FE-14.02](tasks/FE-14.02.md) |
| 2 | Delete a chat without deleting DEMO business records; revoked-source/history and provider-error fixtures preserve safe manual fallback. | [FE-14.01](tasks/FE-14.01.md), [FE-14.03](tasks/FE-14.03.md) |
| 3 | Admin availability controls are separate from automation policy; disclose that answers, usage and availability are simulated, with no model calls. | [FE-14.02](tasks/FE-14.02.md), [FE-14.03](tasks/FE-14.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="fe-15"></a>

### FE-15 — Trusted action cards and shared AI Workspace

[Authoritative package acceptance](06-frontend-first.md#fe-15).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Reuse the ticket/task/management forms through an allowlisted intent registry; select missing resources explicitly, preview exact content and confirm before simulated mutation. | [FE-15.01](tasks/FE-15.01.md), [FE-15.02](tasks/FE-15.02.md), [FE-15.03](tasks/FE-15.03.md) |
| 2 | Cover ticket creation/replies/acceptance, task progress and permitted management actions; expose supported/unsupported intents explicitly. Model text never selects endpoints or supplies actor rights. | [FE-15.02](tasks/FE-15.02.md), [FE-15.03](tasks/FE-15.03.md) |
| 3 | Compose suggestions immediately above chat and separately scoped activity; normal view has no permanent exception block. Closing chat does not stop mock background activity; credentials stay outside chat. | [FE-15.04](tasks/FE-15.04.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="fe-16"></a>

### FE-16 — Role dashboards and reporting interactions

[Authoritative package acceptance](06-frontend-first.md#fe-16).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Build personal/Technician/Manager/Admin views with relevant next-action cards and matching source-record drill-downs. | [FE-16.01](tasks/FE-16.01.md) |
| 2 | Use one mock metric adapter for reports/charts/assistant facts; separate current backlog from date cohorts, no-data from errors and counts from productivity. | [FE-16.02](tasks/FE-16.02.md), [FE-16.03](tasks/FE-16.03.md) |
| 3 | Filters/timezone boundaries, task/load/warranty/usage views work with DEMO provenance; unknown cost remains unknown and no real AI efficiency claims appear. | [FE-16.02](tasks/FE-16.02.md), [FE-16.03](tasks/FE-16.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="fe-17"></a>

### FE-17 — Notifications and scoped audit screens

[Authoritative package acceptance](06-frontend-first.md#fe-17).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Build unread/all lists, badge/read marking and current-scope link navigation with synthetic recipient events. | [FE-17.01](tasks/FE-17.01.md) |
| 2 | Render Manager business versus Admin identity/SLA audit fixtures; search/paging/filter state is preserved. | [FE-17.02](tasks/FE-17.02.md) |
| 3 | Revoked-record previews become generic; no internal note notification for Requester or simulated email delivery. | [FE-17.01](tasks/FE-17.01.md), [FE-17.02](tasks/FE-17.02.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="fe-18"></a>

### FE-18 — Frontend DEMO acceptance and API handoff

[Authoritative package acceptance](06-frontend-first.md#fe-18).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Inventory every agreed screen/interaction against its FE owner and native route/modal; complete four-role mock journeys without dead primary actions or unlabeled placeholder results. | [FE-18.01](tasks/FE-18.01.md) |
| 2 | Run clean frontend build/typecheck and meaningful component/browser checks, keyboard/focus/320–1440/200% zoom, form/error/conflict and mock isolation tests. | [FE-18.02](tasks/FE-18.02.md) |
| 3 | Deliver endpoint/DTO/error/confirmation mapping, fixture assumptions and unresolved backend decisions. FE DONE means frontend DEMO accepted, not business AC, security, live AI, database or production acceptance. | [FE-18.03](tasks/FE-18.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="pre-01"></a>

### PRE-01 — Review foundation contracts and identity decisions

[Authoritative package acceptance](00-decisions.md#pre-01).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Document bootstrap, password/reset policy, session lifetime/rotation, cookie/CSRF names, rate limits, and emergency revocation/handover behavior with explicit unresolved items. | [PRE-01.01](tasks/PRE-01.01.md) |
| 2 | Review foundation DTOs, public/internal projections, nullability, uniqueness, optimistic versions, domain/audit/outbox transaction boundaries and ticket idempotency; reconcile API/DBML discrepancies. | [PRE-01.02](tasks/PRE-01.02.md) |
| 3 | Record approved versus proposed values and the affected task IDs; no invented enterprise approval. FND-01 may start only with the foundation choices needed for its scaffold; affected domain tasks require their remaining decisions. | [PRE-01.01](tasks/PRE-01.01.md), [PRE-01.02](tasks/PRE-01.02.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="pre-02"></a>

### PRE-02 — Define workforce and workflow concurrency contracts

[Authoritative package acceptance](00-decisions.md#pre-02).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Specify periods/slots, calendar timezone, daily budgets, skill verifiers and manager-verified effort/template sources; DEMO values are labeled. | [PRE-02.01](tasks/PRE-02.01.md) |
| 2 | Specify fixed lock order/isolation, allocation uniqueness, event/run/action intent keys, lease/retry limits, approval expiry and bounded exception grants. | [PRE-02.02](tasks/PRE-02.02.md) |
| 3 | Record policy scope/adjustment/reminder limits and missing-data behavior; preserve default deny and no overbooking. | [PRE-02.03](tasks/PRE-02.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="pre-03"></a>

### PRE-03 — Define minimum AI, knowledge and inventory data contracts

[Authoritative package acceptance](00-decisions.md#pre-03).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Record KB author/publisher/ACL rights, versioning, embedding dimensions/chunking and index freshness choices; no role gets implicit all-content access. | [PRE-03.01](tasks/PRE-03.01.md) |
| 2 | Define chat/run retention and redaction, confirmation digest/TTL, trusted intent/form registry, shared budget reservations and mode sublimits. | [PRE-03.02](tasks/PRE-03.02.md) |
| 3 | Decide whether inventory reservations are used; if so define TTL/release/owner/issue distinction and cross-plan constraints. Preserve D-48 DEMO-only Gemini free-tier policy (USD 0 paid spend); production decisions remain separate. | [PRE-03.03](tasks/PRE-03.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="pre-04"></a>

### PRE-04 — Define deployment and recovery targets

[Authoritative package acceptance](00-decisions.md#pre-04).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Identify target environment, operations owner, backup access/encryption/retention and proposed RPO/RTO with measurement method. | [PRE-04.01](tasks/PRE-04.01.md) |
| 2 | Define release/migration/recovery sequence, alert ownership and measurable environment-specific performance/queue targets. | [PRE-04.01](tasks/PRE-04.01.md), [PRE-04.02](tasks/PRE-04.02.md) |
| 3 | Distinguish local rehearsal from production deployment and production provider/data/budget decisions. | [PRE-04.02](tasks/PRE-04.02.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="fnd-01"></a>

### FND-01 — Create reproducible development scaffold

[Authoritative package acceptance](01-foundation.md#fnd-01).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Create uv/pnpm manifests and real lockfiles after revalidating candidate runtime/package versions; use the agreed modular monolith. | [FND-01.01](tasks/FND-01.01.md) |
| 2 | Start Next.js, FastAPI and PostgreSQL in a documented local setup, with Linux worker support planned for Windows; expose safe liveness/readiness. | [FND-01.01](tasks/FND-01.01.md), [FND-01.02](tasks/FND-01.02.md) |
| 3 | Frozen installs, lint/type checks and builds run from a clean checkout; no frontend DB access or business API duplication. | [FND-01.02](tasks/FND-01.02.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="fnd-02"></a>

### FND-02 — Create database, transaction, audit and outbox primitives

[Authoritative package acceptance](01-foundation.md#fnd-02).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Migrations initialize the required foundation schema; each request/job gets its own synchronous Session and injectable UTC clock. | [FND-02.01](tasks/FND-02.01.md) |
| 2 | One unit of work commits domain, redacted audit and durable outbox together; failure rolls all back. | [FND-02.02](tasks/FND-02.02.md) |
| 3 | Expected-version and idempotency conflict behavior matches reviewed contracts; no MAX+1 IDs, global Session or publish-before-commit. | [FND-02.03](tasks/FND-02.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="fnd-03"></a>

### FND-03 — Create accessible shell and typed API client

[Authoritative package acceptance](01-foundation.md#fnd-03).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Generate DTOs from reviewed API contracts; centralize cookie/CSRF/error handling and user/scope query keys. | [FND-03.01](tasks/FND-03.01.md) |
| 2 | Provide responsive navigation, loading/empty/error/forbidden/conflict states, keyboard/focus behavior and Vietnamese UI copy. | [FND-03.02](tasks/FND-03.02.md) |
| 3 | Use Asia/Ho_Chi_Minh display, bounded pagination and active-tab 30-second polling; failed reads never render fake zero data. | [FND-03.02](tasks/FND-03.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-01](07-integration.md#int-01) ([INT-01.01](tasks/INT-01.01.md), [INT-01.02](tasks/INT-01.02.md), [INT-01.03](tasks/INT-01.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="fnd-04"></a>

### FND-04 — Implement login, logout and current-session authorization

[Authoritative package acceptance](01-foundation.md#fnd-04).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Authorized bootstrap creates the initial account without public signup; Argon2id and opaque PostgreSQL sessions follow PRE-01. | [FND-04.01](tasks/FND-04.01.md) |
| 2 | Login validates Origin/pre-session CSRF and rotates session; logout invalidates it server-side, and expired/revoked cookies fail direct API access. | [FND-04.01](tasks/FND-04.01.md), [FND-04.02](tasks/FND-04.02.md) |
| 3 | Login preserves validation feedback and safe return paths; logout/user switch clears private caches; forged roles cannot grant scope. | [FND-04.02](tasks/FND-04.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-01](07-integration.md#int-01) ([INT-01.01](tasks/INT-01.01.md), [INT-01.02](tasks/INT-01.02.md), [INT-01.03](tasks/INT-01.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="fnd-05"></a>

### FND-05 — Manage departments, teams and safe reference lookups

[Authoritative package acceptance](01-foundation.md#fnd-05).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Admin creates/edits departments and teams, sets one active intake and adds eligible members; non-admin management calls fail. | [FND-05.01](tasks/FND-05.01.md), [FND-05.02](tasks/FND-05.02.md) |
| 2 | Historical references survive deactivation; lookup endpoints disclose only fields needed by the caller, never a requester employee directory. | [FND-05.01](tasks/FND-05.01.md) |
| 3 | Destructive eligibility changes are blocked until FND-17 supplies the reviewed handover flow; a team cannot be deactivated with unmanaged open work. | [FND-05.02](tasks/FND-05.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-01](07-integration.md#int-01) ([INT-01.01](tasks/INT-01.01.md), [INT-01.02](tasks/INT-01.02.md), [INT-01.03](tasks/INT-01.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="fnd-06"></a>

### FND-06 — Provision accounts through the authorized Admin flow

[Authoritative package acceptance](01-foundation.md#fnd-06).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Create accounts with normalized unique email, valid department and default Requester; elevated roles require verified authorization. | [FND-06.01](tasks/FND-06.01.md) |
| 2 | Support authorized initial setup and later verified D-29 request references; a ticket or model message never creates an account automatically. | [FND-06.01](tasks/FND-06.01.md) |
| 3 | Passwords use the approved enterprise handover process, never response/audit/ticket content; reject non-admin calls. | [FND-06.02](tasks/FND-06.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-01](07-integration.md#int-01) ([INT-01.01](tasks/INT-01.01.md), [INT-01.02](tasks/INT-01.02.md), [INT-01.03](tasks/INT-01.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="fnd-07"></a>

### FND-07 — Implement own profile and password changes

[Authoritative package acceptance](01-foundation.md#fnd-07).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Update allowed personal fields only; forged role/email/user ID is rejected or excluded by the reviewed DTO. | [FND-07.01](tasks/FND-07.01.md) |
| 2 | Password change verifies the current password, applies approved policy and revokes other sessions. | [FND-07.02](tasks/FND-07.02.md) |
| 3 | Validation/network failures preserve safe form state and focus; old password fails after successful change. | [FND-07.01](tasks/FND-07.01.md), [FND-07.02](tasks/FND-07.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-01](07-integration.md#int-01) ([INT-01.01](tasks/INT-01.01.md), [INT-01.02](tasks/INT-01.02.md), [INT-01.03](tasks/INT-01.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="fnd-08"></a>

### FND-08 — Configure categories and versioned default SLA

[Authoritative package acceptance](01-foundation.md#fnd-08).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Admin manages unique categories; deactivated values remain readable historically but cannot be selected for new tickets. | [FND-08.01](tasks/FND-08.01.md) |
| 2 | Publish a positive P1–P4 SLA table with version/audit; changing defaults does not mutate existing ticket snapshots. | [FND-08.02](tasks/FND-08.02.md) |
| 3 | Expose only allowed reference projections for request forms. | [FND-08.01](tasks/FND-08.01.md), [FND-08.02](tasks/FND-08.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-01](07-integration.md#int-01) ([INT-01.01](tasks/INT-01.01.md), [INT-01.02](tasks/INT-01.02.md), [INT-01.03](tasks/INT-01.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="fnd-09"></a>

### FND-09 — Create a text ticket with priority and SLA snapshot

[Authoritative package acceptance](01-foundation.md#fnd-09).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Valid submission creates New ticket, unique code, session requester, active intake, matrix priority and full immutable SLA snapshot. | [FND-09.01](tasks/FND-09.01.md) |
| 2 | Persist initial clock facts, event/audit/outbox atomically; repeat same intent returns one ticket and altered digest conflicts. | [FND-09.02](tasks/FND-09.02.md) |
| 3 | Reject arbitrary requester/priority. Defer optional asset selection to OPS-02 and files to OPS-05; do not show nonfunctional controls as working. | [FND-09.01](tasks/FND-09.01.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-02](07-integration.md#int-02) ([INT-02.01](tasks/INT-02.01.md), [INT-02.02](tasks/INT-02.02.md), [INT-02.03](tasks/INT-02.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="fnd-10"></a>

### FND-10 — Implement scoped ticket search and details

[Authoritative package acceptance](01-foundation.md#fnd-10).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Scope before count/search/paging; Requester sees own, Technician active-team union plus own public view, M/A permitted organization records. | [FND-10.01](tasks/FND-10.01.md) |
| 2 | Stable sorting, 20-default/100-max paging, filter reset and back-navigation preserve the query. | [FND-10.01](tasks/FND-10.01.md) |
| 3 | Out-of-scope IDs return generic 404; requester projection contains no notes, internal metadata, plans or candidate counts. | [FND-10.02](tasks/FND-10.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-02](07-integration.md#int-02) ([INT-02.01](tasks/INT-02.01.md), [INT-02.02](tasks/INT-02.02.md), [INT-02.03](tasks/INT-02.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="fnd-11"></a>

### FND-11 — Assign, transfer, claim and start tickets

[Authoritative package acceptance](01-foundation.md#fnd-11).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | M/A assignments/transfers require reason and eligible current-team assignee; In Progress/Pending never becomes ownerless. | [FND-11.01](tasks/FND-11.01.md) |
| 2 | Technician self-claims only unassigned own-team tickets; simultaneous claims yield one success and one conflict. | [FND-11.02](tasks/FND-11.02.md) |
| 3 | New→Open creates no first response; Open→In Progress requires valid assignee, actor and version; SLA never resets. | [FND-11.02](tasks/FND-11.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-02](07-integration.md#int-02) ([INT-02.01](tasks/INT-02.01.md), [INT-02.02](tasks/INT-02.02.md), [INT-02.03](tasks/INT-02.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="fnd-12"></a>

### FND-12 — Implement public comments, notes and ticket lifecycle

[Authoritative package acceptance](01-foundation.md#fnd-12).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Public/internal drafts remain separate; notes never leak or satisfy first response. Only eligible substantive public IT content stops response clock. | [FND-12.01](tasks/FND-12.01.md) |
| 2 | Pending+question and Resolved+solution commit atomically; requester public reply resumes Pending; implement permitted close/reopen/cancel branches with reasons/assignee guards. | [FND-12.02](tasks/FND-12.02.md), [FND-12.03](tasks/FND-12.03.md), [FND-12.04](tasks/FND-12.04.md) |
| 3 | Closed/Cancelled are read-only; reopening preserves consumed budget/breaches; no auto-close or New→In Progress shortcut. | [FND-12.04](tasks/FND-12.04.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-02](07-integration.md#int-02) ([INT-02.01](tasks/INT-02.01.md), [INT-02.02](tasks/INT-02.02.md), [INT-02.03](tasks/INT-02.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="fnd-13"></a>

### FND-13 — Implement priority changes and authorized timeline

[Authoritative package acceptance](01-foundation.md#fnd-13).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | M/A priority changes require reason and use the ticket's original snapshot against unchanged elapsed usage. | [FND-13.01](tasks/FND-13.01.md) |
| 2 | Persist adjustment versions and newly detected breaches without erasing earlier history or changing firstResponseAt. | [FND-13.01](tasks/FND-13.01.md) |
| 3 | Timeline is stably paginated and visibility-filtered, including event text and reasons. | [FND-13.02](tasks/FND-13.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-02](07-integration.md#int-02) ([INT-02.01](tasks/INT-02.01.md), [INT-02.02](tasks/INT-02.02.md), [INT-02.03](tasks/INT-02.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="fnd-14"></a>

### FND-14 — Manage verified workforce skills

[Authoritative package acceptance](01-foundation.md#fnd-14).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Authorized M/A records taxonomy, required skills and verification provenance/version; T cannot self-verify. | [FND-14.01](tasks/FND-14.01.md) |
| 2 | Missing/unverified skill is not eligible by default; self/minimal team views follow permissions. | [FND-14.01](tasks/FND-14.01.md) |
| 3 | Changes emit affected-work events and redacted audit in the same transaction. | [FND-14.02](tasks/FND-14.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-03](07-integration.md#int-03) ([INT-03.01](tasks/INT-03.01.md), [INT-03.02](tasks/INT-03.02.md), [INT-03.03](tasks/INT-03.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="fnd-15"></a>

### FND-15 — Manage calendars, budgets and absences

[Authoritative package acceptance](01-foundation.md#fnd-15).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Use agreed concrete periods/timezone/daily budgets and subtract union of overlapping absences once. | [FND-15.01](tasks/FND-15.01.md) |
| 2 | Missing schedules are unknown, never free capacity; preserve history/version and publish availability changes. | [FND-15.01](tasks/FND-15.01.md), [FND-15.02](tasks/FND-15.02.md) |
| 3 | UI exposes available/unknown/absent distinctions; work calendars do not alter 24/7 ticket SLA. | [FND-15.02](tasks/FND-15.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-03](07-integration.md#int-03) ([INT-03.01](tasks/INT-03.01.md), [INT-03.02](tasks/INT-03.02.md), [INT-03.03](tasks/INT-03.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="fnd-16"></a>

### FND-16 — Create and execute manual tasks with remaining effort

[Authoritative package acceptance](01-foundation.md#fnd-16).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Persist a minimal versioned manual plan/task structure ready for WF-01; verify team/skills/schedule/effort and atomically allocate manual assignments. | [FND-16.01](tasks/FND-16.01.md), [FND-16.02](tasks/FND-16.02.md) |
| 2 | Authorized progress changes preserve versions/results and recheck increased remaining load; valid human Done requires substantive result and remaining=0. | [FND-16.02](tasks/FND-16.02.md), [FND-16.03](tasks/FND-16.03.md) |
| 3 | Reject invalid task transitions and requester access; finishing tasks never resolves/closes the ticket; provide keyboard/list alternative to board. | [FND-16.01](tasks/FND-16.01.md), [FND-16.03](tasks/FND-16.03.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-03](07-integration.md#int-03) ([INT-03.01](tasks/INT-03.01.md), [INT-03.02](tasks/INT-03.02.md), [INT-03.03](tasks/INT-03.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="fnd-17"></a>

### FND-17 — Complete access revocation and assignment handover

[Authoritative package acceptance](01-foundation.md#fnd-17).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Role/department/membership/lock changes preserve historical identities and last active Admin; old access and sessions are revoked per policy. | [FND-17.01](tasks/FND-17.01.md) |
| 2 | Apply reviewed handover to active tickets/tasks atomically; implement PRE-01 emergency no-replacement decision without retaining revoked access or reporting false success. | [FND-17.02](tasks/FND-17.02.md), [FND-17.03](tasks/FND-17.03.md) |
| 3 | Unlock restores no old session; team deactivation transfers open work; emit affected-work evaluation events. | [FND-17.01](tasks/FND-17.01.md), [FND-17.03](tasks/FND-17.03.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-01](07-integration.md#int-01) ([INT-01.01](tasks/INT-01.01.md), [INT-01.02](tasks/INT-01.02.md), [INT-01.03](tasks/INT-01.03.md)); [INT-03](07-integration.md#int-03) ([INT-03.01](tasks/INT-03.01.md), [INT-03.02](tasks/INT-03.02.md), [INT-03.03](tasks/INT-03.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="fnd-18"></a>

### FND-18 — Expose scoped audit search

[Authoritative package acceptance](01-foundation.md#fnd-18).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | M reads permitted business audit; Admin additionally reads authorized identity/SLA administration audit, without all-chat access. | [FND-18.01](tasks/FND-18.01.md) |
| 2 | Search/paging/counts apply scope and retain actor/time/old-new/reason; redact secrets and bodies. | [FND-18.01](tasks/FND-18.01.md), [FND-18.02](tasks/FND-18.02.md) |
| 3 | Define reusable audit projection for later automation/assets; later slices supply their own events. | [FND-18.02](tasks/FND-18.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-06](07-integration.md#int-06) ([INT-06.01](tasks/INT-06.01.md), [INT-06.02](tasks/INT-06.02.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="wf-01"></a>

### WF-01 — Validate and activate versioned plan DAGs

[Authoritative package acceptance](02-workflows.md#wf-01).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Validate same-version dependencies, known references, no self-edge/cycle and verified effort/source data. | [WF-01.01](tasks/WF-01.01.md) |
| 2 | Activate only one Effective version atomically while preserving older versions and active/locked tasks. | [WF-01.02](tasks/WF-01.02.md) |
| 3 | Recheck predecessors before task start; Cancelled predecessor is not Done; stale/invalid activation creates no partial tasks. | [WF-01.03](tasks/WF-01.03.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-03](07-integration.md#int-03) ([INT-03.01](tasks/INT-03.01.md), [INT-03.02](tasks/INT-03.02.md), [INT-03.03](tasks/INT-03.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="wf-02"></a>

### WF-02 — Publish verified workflow templates

[Authoritative package acceptance](02-workflows.md#wf-02).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | M/A creates Draft versions and publishes valid sourced DAGs with verified effort. | [WF-02.01](tasks/WF-02.01.md), [WF-02.02](tasks/WF-02.02.md) |
| 2 | Published versions are immutable; changes create a new version and retain source/author evidence. | [WF-02.02](tasks/WF-02.02.md) |
| 3 | T sees execution-required versions only; unsupported/unknown estimates cannot authorize assignment. | [WF-02.01](tasks/WF-02.01.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-03](07-integration.md#int-03) ([INT-03.01](tasks/INT-03.01.md), [INT-03.02](tasks/INT-03.02.md), [INT-03.03](tasks/INT-03.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="wf-03"></a>

### WF-03 — Manage default-deny policies and grants

[Authoritative package acceptance](02-workflows.md#wf-03).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Bound grants to workflow/team/priority/action/limits/grantor/expiry/version with no self-grants or public service login. | [WF-03.01](tasks/WF-03.01.md) |
| 2 | Every policy command checks current grantor authority; disabled/expired/missing policy allows no service effect. | [WF-03.02](tasks/WF-03.02.md) |
| 3 | UI distinguishes template publication, policy enablement and assistant availability. | [WF-03.03](tasks/WF-03.03.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-03](07-integration.md#int-03) ([INT-03.01](tasks/INT-03.01.md), [INT-03.02](tasks/INT-03.02.md), [INT-03.03](tasks/INT-03.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="wf-04"></a>

### WF-04 — Filter candidates and atomically allocate capacity

[Authoritative package acceptance](02-workflows.md#wf-04).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Filter current authority/team/verified skills/availability before ranking; account work requires an authorized Admin. | [WF-04.01](tasks/WF-04.01.md) |
| 2 | Allocate explicit periods/slots totaling remaining effort; include Blocked load, unknown/unallocated risk and DAG/deadline constraints. | [WF-04.02](tasks/WF-04.02.md) |
| 3 | Concurrent assignment/schedule edits use consistent locks/versions; insufficient capacity becomes a reasoned exception, not overbooking. | [WF-04.03](tasks/WF-04.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="wf-05"></a>

### WF-05 — Deliver durable outbox through Linux workers

[Authoritative package acceptance](02-workflows.md#wf-05).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Run Linux Celery with separate queues and one Beat; claim/lease/ack durable outbox with bounded retries/dead-letter. | [WF-05.01](tasks/WF-05.01.md), [WF-05.02](tasks/WF-05.02.md) |
| 2 | Crash after commit/before ack or broker outage does not lose events or duplicate consumer effects. | [WF-05.02](tasks/WF-05.02.md), [WF-05.03](tasks/WF-05.03.md) |
| 3 | Expose minimal health and delivery lag; provider/broker failures do not pretend core DB operations failed after commit. | [WF-05.03](tasks/WF-05.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="wf-06"></a>

### WF-06 — Implement exception proposals and approval decisions

[Authoritative package acceptance](02-workflows.md#wf-06).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Persist before/after/reason/impact/sources and ticket/plan/task/policy/workforce snapshots. | [WF-06.01](tasks/WF-06.01.md) |
| 2 | Authorized M/A approves/rejects current proposals; stale/expired/revoked decisions conflict and require re-evaluation. | [WF-06.02](tasks/WF-06.02.md) |
| 3 | Decision status and execution status are separate; approval never grants overbooking or unrestricted Admin authority. | [WF-06.02](tasks/WF-06.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-03](07-integration.md#int-03) ([INT-03.01](tasks/INT-03.01.md), [INT-03.02](tasks/INT-03.02.md), [INT-03.03](tasks/INT-03.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="wf-07"></a>

### WF-07 — Respect manual locks, overrides and disable

[Authoritative package acceptance](02-workflows.md#wf-07).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | M/A reasoned locks/overrides are versioned/audited and checked before every automated effect. | [WF-07.01](tasks/WF-07.01.md) |
| 2 | In-progress/locked changes use the authorized exception path; ordinary assignment never silently unlocks. | [WF-07.01](tasks/WF-07.01.md) |
| 3 | Disabling policy blocks pending effects; undo uses valid compensation without deleting history or regressing Done. | [WF-07.02](tasks/WF-07.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-03](07-integration.md#int-03) ([INT-03.01](tasks/INT-03.01.md), [INT-03.02](tasks/INT-03.02.md), [INT-03.03](tasks/INT-03.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="wf-08"></a>

### WF-08 — Execute idempotent service commands from deterministic proposals

[Authoritative package acceptance](02-workflows.md#wf-08).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Separate snapshot preparation from execution; re-read rights/policy/versions/capacity in the new effect transaction. | [WF-08.01](tasks/WF-08.01.md) |
| 2 | Domain changes, allocation, action outcome, audit and outbox commit together; repeat intent returns saved outcome. | [WF-08.02](tasks/WF-08.02.md) |
| 3 | Rights/stale/infeasible failures re-evaluate or escalate; transient failures retry within limits; no direct policy-bypassing ORM writes. | [WF-08.03](tasks/WF-08.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="wf-09"></a>

### WF-09 — Evaluate affected work after operational changes

[Authoritative package acceptance](02-workflows.md#wf-09).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Availability/skills/membership/progress/load/risk events select affected tasks rather than unrelated work. | [WF-09.01](tasks/WF-09.01.md) |
| 2 | Deterministic re-evaluation respects policy and unstarted-task limits; locked/in-progress/commitment changes produce exceptions. | [WF-09.02](tasks/WF-09.02.md) |
| 3 | Duplicate/out-of-order events cannot undo newer state or extend SLA; reminders obey recipient/rate limits. | [WF-09.02](tasks/WF-09.02.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="wf-10"></a>

### WF-10 — Expose run traces and controlled recovery

[Authoritative package acceptance](02-workflows.md#wf-10).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Show scoped/redacted event/run/policy/grantor/source/version/action/result/error provenance. | [WF-10.01](tasks/WF-10.01.md) |
| 2 | Authorized retry preserves successful-intent dedup and distinguishes retryable failure from required new evaluation. | [WF-10.02](tasks/WF-10.02.md) |
| 3 | UI shows committed/current/future progress, no-approval and exception paths; approved/queued is never success. | [WF-10.01](tasks/WF-10.01.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-03](07-integration.md#int-03) ([INT-03.01](tasks/INT-03.01.md), [INT-03.02](tasks/INT-03.02.md), [INT-03.03](tasks/INT-03.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ai-01"></a>

### AI-01 — Persist minimum versioned knowledge and ACL sources

[Authoritative package acceptance](03-ai-automation.md#ai-01).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Persist source/version/status/ACL and allow publication only under PRE-03 rights; immutable Published sources have provenance. | [AI-01.01](tasks/AI-01.01.md) |
| 2 | Filter readable Published versions before provider payloads and citations; revocation immediately affects runtime queries. | [AI-01.02](tasks/AI-01.02.md) |
| 3 | Provide synthetic source fixtures for planning; mark this as minimum sources, not completed embedding/RAG. | [AI-01.02](tasks/AI-01.02.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="ai-02"></a>

### AI-02 — Persist minimum inventory for planning evidence

[Authoritative package acceptance](03-ai-automation.md#ai-02).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Store uniquely identified persisted DEMO assets, states and available quantities with source provenance; no fabricated stock. | [AI-02.01](tasks/AI-02.01.md) |
| 2 | Only eligible M/A setup writes inventory; model read contracts disclose only authorized planning facts. | [AI-02.01](tasks/AI-02.01.md) |
| 3 | Handle shortage explicitly; if PRE-03 adopts reservations, implement separate bounded reservation lifecycle before any planning action relies on it. | [AI-02.02](tasks/AI-02.02.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="ai-03"></a>

### AI-03 — Build provider adapter and shared usage budget ledger

[Authoritative package acceptance](03-ai-automation.md#ai-03).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Provider accepts minimal scoped inputs and returns validated structured proposals without DB/session credentials or domain writes. | [AI-03.01](tasks/AI-03.01.md) |
| 2 | Reserve actual/in-flight/unknown costs conservatively across modes/retries/embeddings; unknown timeout cost is not zero and aggregate cap cannot race. | [AI-03.02](tasks/AI-03.02.md) |
| 3 | Bound tokens/calls/timeouts/retries; persist sourced usage/model/latency or explicit unknown; no transaction/lock held while waiting. | [AI-03.01](tasks/AI-03.01.md), [AI-03.03](tasks/AI-03.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="ai-04"></a>

### AI-04 — Clarify missing request information

[Authoritative package acceptance](03-ai-automation.md#ai-04).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Validate employee list/configuration/quantity/deadline and verified source references before onboarding plans. | [AI-04.01](tasks/AI-04.01.md) |
| 2 | Missing data creates deduplicated structured clarification; do not fabricate people/devices/effort. | [AI-04.02](tasks/AI-04.02.md) |
| 3 | Distinguish persisted/public authorized clarification from private model text; no incomplete effective plan or unauthorized notification. | [AI-04.02](tasks/AI-04.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-03](07-integration.md#int-03) ([INT-03.01](tasks/INT-03.01.md), [INT-03.02](tasks/INT-03.02.md), [INT-03.03](tasks/INT-03.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ai-05"></a>

### AI-05 — Generate and commit valid sourced AI plans

[Authoritative package acceptance](03-ai-automation.md#ai-05).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Model proposes schema-valid sourced tasks/DAG using published templates and verified effort. | [AI-05.01](tasks/AI-05.01.md) |
| 2 | Semantic validation rejects cycles/unknown dependencies; stale context re-evaluates before atomic plan activation. | [AI-05.01](tasks/AI-05.01.md), [AI-05.02](tasks/AI-05.02.md) |
| 3 | Enabled policy creates actual persisted work; disabled/out-of-scope proposals stay drafts or use the allowed approval path. | [AI-05.02](tasks/AI-05.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-03](07-integration.md#int-03) ([INT-03.01](tasks/INT-03.01.md), [INT-03.02](tasks/INT-03.02.md), [INT-03.03](tasks/INT-03.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ai-06"></a>

### AI-06 — Rank eligible candidates and assign through services

[Authoritative package acceptance](03-ai-automation.md#ai-06).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Model ranks only backend-filtered candidates using operational evidence, never invents personnel or skill verification. | [AI-06.01](tasks/AI-06.01.md) |
| 2 | Recheck current membership/skills/schedule/policy and every allocation window immediately before commit. | [AI-06.02](tasks/AI-06.02.md) |
| 3 | Insufficient resources yield evidence-backed exception; no forced allocation or autonomous account/asset issuance. | [AI-06.02](tasks/AI-06.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-03](07-integration.md#int-03) ([INT-03.01](tasks/INT-03.01.md), [INT-03.02](tasks/INT-03.02.md), [INT-03.03](tasks/INT-03.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ai-07"></a>

### AI-07 — Replan after absence, blocker and risk events

[Authoritative package acceptance](03-ai-automation.md#ai-07).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Events invoke real proposal generation for affected work; policy may reassign eligible unstarted tasks. | [AI-07.01](tasks/AI-07.01.md) |
| 2 | Locked/in-progress/out-of-scope/commitment changes produce explicit impact/approval, not silent overwrite or SLA extension. | [AI-07.02](tasks/AI-07.02.md) |
| 3 | Revalidate even after approval/model wait; chat lifecycle does not start/stop these background runs. | [AI-07.02](tasks/AI-07.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-03](07-integration.md#int-03) ([INT-03.01](tasks/INT-03.01.md), [INT-03.02](tasks/INT-03.02.md), [INT-03.03](tasks/INT-03.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ai-08"></a>

### AI-08 — Validate fixed M3 scenarios with a real model

[Authoritative package acceptance](03-ai-automation.md#ai-08).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | At execution verify D-39 model access, billing/quota/current pricing and safely configured keys; fixed test DB/synthetic inputs only. | [AI-08.01](tasks/AI-08.01.md) |
| 2 | Run complete/missing-input/shortage/cycle/absence/locked/stale/injection/provider-failure scenarios against persisted actions; retain model-versus-domain outcomes. | [AI-08.02](tasks/AI-08.02.md) |
| 3 | Record actual/reserved/unknown cost and stay within verified Gemini free-tier quotas including retries/embeddings, with USD 0 paid spend; do not substitute mocks or silently switch model if live access is unavailable. | [AI-08.02](tasks/AI-08.02.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="ops-01"></a>

### OPS-01 — Complete asset records, scoped lookup and history

[Authoritative package acceptance](04-operations-assistant.md#ops-01).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | M/A edits valid code/serial/type/date metadata; current holder cannot be mass-assigned. | [OPS-01.01](tasks/OPS-01.01.md) |
| 2 | R sees currently held assets with reduced history; T only own/support scope; counts and related ticket links enforce independent scope. | [OPS-01.01](tasks/OPS-01.01.md), [OPS-01.02](tasks/OPS-01.02.md) |
| 3 | Preserve assignment history and display repair devices with retained holder; reject invalid dates/duplicate serial. | [OPS-01.02](tasks/OPS-01.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-04](07-integration.md#int-04) ([INT-04.01](tasks/INT-04.01.md), [INT-04.02](tasks/INT-04.02.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ops-02"></a>

### OPS-02 — Implement asset issue, return, state changes and ticket links

[Authoritative package acceptance](04-operations-assistant.md#ops-02).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Concurrent issue of In Stock asset permits one active assignment and atomic In Use state; active recipient required. | [OPS-02.01](tasks/OPS-02.01.md) |
| 2 | Return ends assignment once to stock/repair; reasoned transitions obey BR-11 and retirement requires return first. | [OPS-02.02](tasks/OPS-02.02.md) |
| 3 | Ticket asset picker/backend use actor-specific permission rules; linking never grants access to other tickets; reconcile reservations if adopted. | [OPS-02.03](tasks/OPS-02.03.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-04](07-integration.md#int-04) ([INT-04.01](tasks/INT-04.01.md), [INT-04.02](tasks/INT-04.02.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ops-03"></a>

### OPS-03 — Complete SLA displays and independent alert scans

[Authoritative package acceptance](04-operations-assistant.md#ops-03).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Display separate response/resolution clocks with 80/100 thresholds, paused/stopped states and preserved breach history. | [OPS-03.01](tasks/OPS-03.01.md) |
| 2 | One Beat schedules scans independently of pages; persist breach facts and deduplicated recipient intents by BR-10, beyond-100 first scan skips obsolete warning. | [OPS-03.02](tasks/OPS-03.02.md) |
| 3 | Broker recovery catches up from PostgreSQL without resetting time; expose scan delay, no outage-time 60-second guarantee. | [OPS-03.03](tasks/OPS-03.03.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-02](07-integration.md#int-02) ([INT-02.01](tasks/INT-02.01.md), [INT-02.02](tasks/INT-02.02.md), [INT-02.03](tasks/INT-02.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ops-04"></a>

### OPS-04 — Deliver authorized in-app notifications

[Authoritative package acceptance](04-operations-assistant.md#ops-04).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Consume persisted assignment/comment/state/SLA intents with correct recipients, actor exclusion and unique effect keys. | [OPS-04.01](tasks/OPS-04.01.md) |
| 2 | Own list/count/readAt only; repeated read is idempotent and current record access controls previews/links. | [OPS-04.02](tasks/OPS-04.02.md) |
| 3 | Notes never notify/requester-leak; disabled accounts/revoked scope lose sensitive previews; no MVP email. | [OPS-04.01](tasks/OPS-04.01.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-02](07-integration.md#int-02) ([INT-02.01](tasks/INT-02.01.md), [INT-02.02](tasks/INT-02.02.md), [INT-02.03](tasks/INT-02.03.md)); [INT-06](07-integration.md#int-06) ([INT-06.01](tasks/INT-06.01.md), [INT-06.02](tasks/INT-06.02.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ops-05"></a>

### OPS-05 — Implement private attachments and recovery

[Authoritative package acceptance](04-operations-assistant.md#ops-05).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Accept only PNG/JPEG/WebP/PDF, at most 5/action and 10,000,000 bytes/file; verify extension/MIME/content, reject SVG/spoof/oversize. | [OPS-05.01](tasks/OPS-05.01.md) |
| 2 | Stage/finalize/reconcile files with domain transaction outcome; invalid submission has no partial domain commit, preserves text and prevents duplicate tickets after interrupted upload. | [OPS-05.02](tasks/OPS-05.02.md) |
| 3 | Download rechecks current parent audience/scope, safe headers/path handling, private local/S3 contract; no public object path. | [OPS-05.03](tasks/OPS-05.03.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-02](07-integration.md#int-02) ([INT-02.01](tasks/INT-02.01.md), [INT-02.02](tasks/INT-02.02.md), [INT-02.03](tasks/INT-02.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ops-06"></a>

### OPS-06 — Complete KB authoring, publishing and ACL UI

[Authoritative package acceptance](04-operations-assistant.md#ops-06).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Approved authors/publishers manage Draft→Published/Retired and immutable versions with explicit ACL. | [OPS-06.01](tasks/OPS-06.01.md) |
| 2 | ACL changes take effect immediately in reads and emit index/revocation events; technical Admin has no blanket content bypass. | [OPS-06.02](tasks/OPS-06.02.md) |
| 3 | UI shows publication/index status separately, authorized source/version links and accessible empty/error states. | [OPS-06.02](tasks/OPS-06.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-05](07-integration.md#int-05) ([INT-05.01](tasks/INT-05.01.md), [INT-05.02](tasks/INT-05.02.md), [INT-05.03](tasks/INT-05.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ops-07"></a>

### OPS-07 — Build pgvector indexing and authorized retrieval

[Authoritative package acceptance](04-operations-assistant.md#ops-07).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Chunk/embed Published versions using reviewed dimensions/model metadata; idempotent background jobs track failure/staleness. | [OPS-07.01](tasks/OPS-07.01.md) |
| 2 | Filter SQL by current source/version/ACL before retrieval/provider; recheck before output and citations despite stale vectors. | [OPS-07.02](tasks/OPS-07.02.md) |
| 3 | Return explicit insufficient evidence and source-bound results; injection grants no tools; embedding spend uses shared ledger. | [OPS-07.02](tasks/OPS-07.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-05](07-integration.md#int-05) ([INT-05.01](tasks/INT-05.01.md), [INT-05.02](tasks/INT-05.02.md), [INT-05.03](tasks/INT-05.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ops-08"></a>

### OPS-08 — Implement private chats and assistant availability

[Authoritative package acceptance](04-operations-assistant.md#ops-08).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Owner-only conversations use separate PUBLIC/INTERNAL contexts and approved retention; deletion preserves business data/audit. | [OPS-08.01](tasks/OPS-08.01.md) |
| 2 | Admin enables only valid provider/source/data-policy configuration; disabled/failing assistant preserves core forms and independent workers. | [OPS-08.02](tasks/OPS-08.02.md) |
| 3 | Recheck source access on history/cache, clear private state on user switch and never expose secrets or other owners' chats. | [OPS-08.03](tasks/OPS-08.03.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-05](07-integration.md#int-05) ([INT-05.01](tasks/INT-05.01.md), [INT-05.02](tasks/INT-05.02.md), [INT-05.03](tasks/INT-05.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ops-09"></a>

### OPS-09 — Answer cited questions and scoped ticket/asset lookup

[Authoritative package acceptance](04-operations-assistant.md#ops-09).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Use authorized Published RAG sources for guidance and existing scoped ticket/asset services for live facts. | [OPS-09.01](tasks/OPS-09.01.md) |
| 2 | Server controls tools/citations; no model SQL/arbitrary URL fetches/external image exfiltration or fabricated sources. | [OPS-09.01](tasks/OPS-09.01.md) |
| 3 | Recheck access before render/history; unsupported questions state insufficient evidence without revealing prohibited counts/snippets. | [OPS-09.02](tasks/OPS-09.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-05](07-integration.md#int-05) ([INT-05.01](tasks/INT-05.01.md), [INT-05.02](tasks/INT-05.02.md), [INT-05.03](tasks/INT-05.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ops-10"></a>

### OPS-10 — Generate audience-safe summaries and reply drafts

[Authoritative package acceptance](04-operations-assistant.md#ops-10).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Public summary/draft uses only public context; internal sessions require current IT scope and cannot hand off to public. | [OPS-10.01](tasks/OPS-10.01.md) |
| 2 | Generation creates no comment, first response or state transition; insertion never silently overwrites existing text. | [OPS-10.01](tasks/OPS-10.01.md), [OPS-10.02](tasks/OPS-10.02.md) |
| 3 | User edits/sends through the existing authorized composer/service and its native errors. | [OPS-10.02](tasks/OPS-10.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-05](07-integration.md#int-05) ([INT-05.01](tasks/INT-05.01.md), [INT-05.02](tasks/INT-05.02.md), [INT-05.03](tasks/INT-05.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ops-11"></a>

### OPS-11 — Confirm conversational ticket creation

[Authoritative package acceptance](04-operations-assistant.md#ops-11).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Trusted form binds exact preview digest/version/TTL and actor; edited data requires reconfirmation. | [OPS-11.01](tasks/OPS-11.01.md) |
| 2 | User confirmation calls the same ticket service with current scope/asset/file/priority rules and idempotent result. | [OPS-11.02](tasks/OPS-11.02.md) |
| 3 | Close chat/unconfirmed preview creates no ticket; postcommit timeout resolves saved outcome before retry. | [OPS-11.02](tasks/OPS-11.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-05](07-integration.md#int-05) ([INT-05.01](tasks/INT-05.01.md), [INT-05.02](tasks/INT-05.02.md), [INT-05.03](tasks/INT-05.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ops-12"></a>

### OPS-12 — Confirm ticket replies and lifecycle actions in cards

[Authoritative package acceptance](04-operations-assistant.md#ops-12).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Map allowlisted reply/note/Pending/resolve/accept/reopen/cancel intents to existing native services under current user. | [OPS-12.01](tasks/OPS-12.01.md) |
| 2 | Preview has no effect; explicit edited-content confirmation rechecks state/version/audience and original requester closure rule. | [OPS-12.02](tasks/OPS-12.02.md) |
| 3 | Public requester reply resumes Pending only after commit; internal draft cannot become public, stale forms preserve safe input. | [OPS-12.02](tasks/OPS-12.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-05](07-integration.md#int-05) ([INT-05.01](tasks/INT-05.01.md), [INT-05.02](tasks/INT-05.02.md), [INT-05.03](tasks/INT-05.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ops-13"></a>

### OPS-13 — Confirm specialist task progress in cards

[Authoritative package acceptance](04-operations-assistant.md#ops-13).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Authorized assignee/M/A confirms progress/result through native task service, including dependency/remaining/version guards. | [OPS-13.01](tasks/OPS-13.01.md) |
| 2 | Done requires human substantive result and remaining=0; model cannot infer completion or borrow service grants. | [OPS-13.01](tasks/OPS-13.01.md) |
| 3 | Unsupported/requester intents use safe deny/handoff; show persisted result, never model-text success. | [OPS-13.02](tasks/OPS-13.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-05](07-integration.md#int-05) ([INT-05.01](tasks/INT-05.01.md), [INT-05.02](tasks/INT-05.02.md), [INT-05.03](tasks/INT-05.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ops-14"></a>

### OPS-14 — Confirm authorized management actions through trusted forms

[Authoritative package acceptance](04-operations-assistant.md#ops-14).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Inventory the existing management intents explicitly: each maps to a reviewed native form/service or documented unsupported handoff; no arbitrary endpoint dispatch. | [OPS-14.01](tasks/OPS-14.01.md) |
| 2 | Enabled assignment/lock/approval/asset/admin forms keep original role, reason, version, feasibility and confirmation; M cannot administer users. | [OPS-14.02](tasks/OPS-14.02.md), [OPS-14.03](tasks/OPS-14.03.md) |
| 3 | Credentials and sensitive account provisioning inputs stay in secure native form fields outside model payloads; model never autonomously creates accounts or assumes AI_COORDINATOR. | [OPS-14.01](tasks/OPS-14.01.md), [OPS-14.03](tasks/OPS-14.03.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-05](07-integration.md#int-05) ([INT-05.01](tasks/INT-05.01.md), [INT-05.02](tasks/INT-05.02.md), [INT-05.03](tasks/INT-05.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ops-15"></a>

### OPS-15 — Compose one independent AI Workspace

[Authoritative package acceptance](04-operations-assistant.md#ops-15).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Compose conversation, suggestions immediately above chat, trusted action forms and scoped activity/details; full exception proposal remains readable. | [OPS-15.02](tasks/OPS-15.02.md) |
| 2 | Assistant works with no run, pending approval or automation disabled; closing/deleting chat never stops or deletes background work. | [OPS-15.01](tasks/OPS-15.01.md) |
| 3 | Activity polling reveals no internal requester payload; stepper shows committed/current/future steps and separates approval from effect; keyboard/mobile/reduced-motion work. | [OPS-15.01](tasks/OPS-15.01.md), [OPS-15.02](tasks/OPS-15.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-05](07-integration.md#int-05) ([INT-05.01](tasks/INT-05.01.md), [INT-05.02](tasks/INT-05.02.md), [INT-05.03](tasks/INT-05.03.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ops-16"></a>

### OPS-16 — Build requester and technician dashboards

[Authoritative package acceptance](04-operations-assistant.md#ops-16).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Requester sees own waiting requests/assets and correct reply/accept CTA, no organization KPIs. | [OPS-16.01](tasks/OPS-16.01.md) |
| 2 | T sees current assigned/team-unclaimed work with multi-team union and scoped SLA pressure. | [OPS-16.02](tasks/OPS-16.02.md) |
| 3 | Freshness/loading/empty/error remain explicit; drill-down population equals displayed count. | [OPS-16.01](tasks/OPS-16.01.md), [OPS-16.02](tasks/OPS-16.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-06](07-integration.md#int-06) ([INT-06.01](tasks/INT-06.01.md), [INT-06.02](tasks/INT-06.02.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ops-17"></a>

### OPS-17 — Build management ticket, workload and warranty reports

[Authoritative package acceptance](04-operations-assistant.md#ops-17).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Scope before counting; current queue includes old backlog, cohort charts use labeled date windows and exact drill-downs. | [OPS-17.01](tasks/OPS-17.01.md) |
| 2 | Use latest-resolution tickets, active duration and n=0 dash; preserve historical breaches and separate unassigned workload. | [OPS-17.02](tasks/OPS-17.02.md) |
| 3 | Warranty uses local today-through-day-30 boundaries, excludes retired/missing dates; no invented productivity scores. | [OPS-17.03](tasks/OPS-17.03.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-06](07-integration.md#int-06) ([INT-06.01](tasks/INT-06.01.md), [INT-06.02](tasks/INT-06.02.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ops-18"></a>

### OPS-18 — Report coordination facts and sourced AI usage

[Authoritative package acceptance](04-operations-assistant.md#ops-18).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Compute defined task/capacity/risk/action metrics from authorized persisted facts with period/timestamp provenance. | [OPS-18.01](tasks/OPS-18.01.md) |
| 2 | Drafts/approvals count separately from executed effects; unallocated/unknown work is visible rather than free capacity. | [OPS-18.01](tasks/OPS-18.01.md) |
| 3 | Display sourced model latency/tokens/cost and separate estimated/reserved/unknown; reconcile usage with shared budget ledger. | [OPS-18.02](tasks/OPS-18.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-06](07-integration.md#int-06) ([INT-06.01](tasks/INT-06.01.md), [INT-06.02](tasks/INT-06.02.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="ops-19"></a>

### OPS-19 — Explain authorized reports through the assistant

[Authoritative package acceptance](04-operations-assistant.md#ops-19).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | M/A intent maps to allowlisted existing metric queries with source/filter/time shown. | [OPS-19.01](tasks/OPS-19.01.md) |
| 2 | Model explains supplied facts without SQL or recomputing MET; R/T cannot obtain organization data. | [OPS-19.01](tasks/OPS-19.01.md) |
| 3 | No-data/unknown usage stays explicit; cited facts match native report and drill-down. | [OPS-19.02](tasks/OPS-19.02.md) |

**Package closure:** Children establish service behavior; full parent UI/real-effect acceptance also needs [INT-05](07-integration.md#int-05) ([INT-05.01](tasks/INT-05.01.md), [INT-05.02](tasks/INT-05.02.md), [INT-05.03](tasks/INT-05.03.md)); [INT-06](07-integration.md#int-06) ([INT-06.01](tasks/INT-06.01.md), [INT-06.02](tasks/INT-06.02.md)). Reuse the FE owners linked in story coverage; do not rebuild their screens.

<a id="int-01"></a>

### INT-01 — Connect identity, administration and shared transport

[Authoritative package acceptance](07-integration.md#int-01).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Replace mock auth/admin calls with real cookie/CSRF APIs and reviewed generated DTOs; remove DEMO login helpers from real mode. | [INT-01.01](tasks/INT-01.01.md) |
| 2 | Verify real session expiry/revocation/user switch, allowed projections, handover conflicts and preserved forms; server rights are authoritative. | [INT-01.02](tasks/INT-01.02.md), [INT-01.03](tasks/INT-01.03.md) |
| 3 | Real mode has no mock fallback or synthetic data insertion; retain explicit isolated DEMO mode for frontend checks. | [INT-01.01](tasks/INT-01.01.md), [INT-01.03](tasks/INT-01.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="int-02"></a>

### INT-02 — Connect ticket lifecycle, attachments, SLA and notifications

[Authoritative package acceptance](07-integration.md#int-02).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Wire native ticket/assignment/comment/transition/priority/upload flows to real services with expected versions and idempotency. | [INT-02.01](tasks/INT-02.01.md) |
| 2 | Handle upload partial/unknown outcomes, current parent ACL and actual SLA clocks/alerts; remove fake optimistic success on timeouts. | [INT-02.02](tasks/INT-02.02.md) |
| 3 | Reconcile real ticket timeline and recipient notification effects with backend responses while preserving drafts and error focus. | [INT-02.03](tasks/INT-02.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="int-03"></a>

### INT-03 — Connect workforce, plans, policy, approvals and runs

[Authoritative package acceptance](07-integration.md#int-03).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Replace fixture schedules/tasks/DAG/candidates/policies/runs with real scoped endpoints and actual model-run outcomes. | [INT-03.01](tasks/INT-03.01.md), [INT-03.02](tasks/INT-03.02.md) |
| 2 | Revalidate current versions/rights/capacity at commands; render real stale/locked/failed responses and separate decision from effect. | [INT-03.01](tasks/INT-03.01.md), [INT-03.03](tasks/INT-03.03.md) |
| 3 | Background execution works while the workspace is closed; polling never creates actions and recovery never repeats successful intents. | [INT-03.02](tasks/INT-03.02.md), [INT-03.03](tasks/INT-03.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="int-04"></a>

### INT-04 — Connect asset inventory and ticket references

[Authoritative package acceptance](07-integration.md#int-04).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Connect metadata/read/history/issue/return/state endpoints and actor-specific ticket asset lookup. | [INT-04.01](tasks/INT-04.01.md) |
| 2 | Display atomic conflict results and updated assignment history; support-scope access does not expand ticket visibility. | [INT-04.02](tasks/INT-04.02.md) |
| 3 | Prevent real mode from reading fixture inventory or using model-proposed devices as actual stock. | [INT-04.02](tasks/INT-04.02.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="int-05"></a>

### INT-05 — Connect knowledge, assistant and confirmed action forms

[Authoritative package acceptance](07-integration.md#int-05).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Wire chat/source/KB/index/provider availability to real scoped services, with source revocation before render/history. | [INT-05.01](tasks/INT-05.01.md) |
| 2 | Bind trusted forms to current user-actor commands with reviewed digest/version/TTL/idempotency; no borrowed background grant. | [INT-05.02](tasks/INT-05.02.md) |
| 3 | Run independent chat/automation and real failure/unknown-outcome paths. Reuse D-39 evidence and shared cost limits; no paid calls merely to test static rendering. | [INT-05.03](tasks/INT-05.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="int-06"></a>

### INT-06 — Connect dashboards, report facts, notifications and audit

[Authoritative package acceptance](07-integration.md#int-06).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Replace fixture metrics/usage/activity with authorized backend facts and matching filters/timezone/source timestamps. | [INT-06.01](tasks/INT-06.01.md), [INT-06.02](tasks/INT-06.02.md) |
| 2 | Keep reports and assistant fact cards consistent, including unknown usage, draft-versus-executed counts and inaccessible drill-downs. | [INT-06.01](tasks/INT-06.01.md) |
| 3 | Verify all frontend routes use the intended real adapter in real mode, with mock data restricted to explicit DEMO mode. | [INT-06.02](tasks/INT-06.02.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="qa-01"></a>

### QA-01 — Complete CI, contracts and reproducible release checks

[Authoritative package acceptance](05-acceptance.md#qa-01).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Frozen dependencies, lint/type/build, meaningful unit/integration/browser suites run on clean environment. | [QA-01.01](tasks/QA-01.01.md) |
| 2 | Export runtime OpenAPI and verify reviewed contract/generated TypeScript drift, including all implemented operations/projections. | [QA-01.01](tasks/QA-01.01.md) |
| 3 | Validate empty/upgrade migrations and frontend/API/worker compatibility; persist artifact/version/command evidence. | [QA-01.02](tasks/QA-01.02.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="qa-02"></a>

### QA-02 — Verify integrated authorization and failure recovery

[Authoritative package acceptance](05-acceptance.md#qa-02).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Direct API cross-role/team/ID/session/CSRF tests cover counts/files/notes/chats/KB/history/actions, including revocation mid-call. | [QA-02.01](tasks/QA-02.01.md) |
| 2 | Inject two-worker races, stale approvals, broker loss, postcommit crash, invalid model output and provider outage; no duplicate effects/overbooking/partial commits. | [QA-02.02](tasks/QA-02.02.md) |
| 3 | Core forms/SLA/manual work remain usable during AI failure; record defects with reproducible evidence. | [QA-02.03](tasks/QA-02.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="qa-03"></a>

### QA-03 — Verify responsive accessibility and measured performance

[Authoritative package acceptance](05-acceptance.md#qa-03).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Exercise main role flows at 320/390/768/1440, 200% zoom, keyboard/focus/reduced motion; board/DAG alternatives preserve tasks. | [QA-03.01](tasks/QA-03.01.md) |
| 2 | Check login states, safe drafts/conflicts, active-tab polling/cache switch and workspace no-approval behavior. | [QA-03.02](tasks/QA-03.02.md) |
| 3 | Measure agreed environment/data/load and p95/scan lag, separate provisional targets from actual results; no static-image accessibility claim. | [QA-03.03](tasks/QA-03.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="qa-04"></a>

### QA-04 — Run complete MVP journeys and real-model acceptance

[Authoritative package acceptance](05-acceptance.md#qa-04).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Run requester→IT→requester acceptance, D-29 account request/provisioning, assets, workforce/absence/approval, KB and confirmed assistant actions. | [QA-04.01](tasks/QA-04.01.md) |
| 2 | Cover TC-OPS01–12/TC-AI01–18 including actual RAG/assistant behavior and persisted real-model effects; reuse valid AI-08 evidence without unnecessary paid reruns. | [QA-04.02](tasks/QA-04.02.md) |
| 3 | Record every AC/gate as pass/fail/not-run with commit/environment/evidence; keep D-39 aggregate budget across milestones and report unavailable live validation instead of claiming A11. | [QA-04.03](tasks/QA-04.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.

<a id="qa-05"></a>

### QA-05 — Rehearse release, backup/restore and finish handover

[Authoritative package acceptance](05-acceptance.md#qa-05).

| Criterion | Parent outcome | Leaf evidence owners |
| --- | --- | --- |
| 1 | Document clean setup, authorized bootstrap, one migration runner, controlled startup/health and policy pause/resume on target-like isolated environment. | [QA-05.01](tasks/QA-05.01.md) |
| 2 | Restore PostgreSQL/private files consistently with workers/egress blocked; verify references, SLA snapshots, outbox/dedup and usage so successful actions are not replayed. | [QA-05.02](tasks/QA-05.02.md) |
| 3 | Record measured RPO/RTO versus agreed targets, release/recovery owners and remaining production decisions; final handover includes actual results, not a deployment claim. | [QA-05.03](tasks/QA-05.03.md) |

**Package closure:** All child outputs/checks plus the parent's own acceptance and relevant prerequisites; no additional UI closure owner is assigned here.
