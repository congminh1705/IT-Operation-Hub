---
id: itoh-execution-board
title: "Executable task board"
type: planning
domain: development
module: delivery
tags: [tasks, planning, implementation]
priority: 1
status: planned
owner: PO
approval: needs-review
updated: 2026-11-09
authority: primary
purpose: "Maintain the single status and owner registry for every refined executable task."
---

# Executable task board

## 1. Scope and authority

All **88 work packages are decomposed into 230 executable tasks**: **63 frontend (A), 137 decisions/services (B), 16 real integration (C), and 14 acceptance/recovery (D)**. FE-01.01 through FE-01.03 and FE-02.01/.02 are **done**; FE-02.03 is in review; 224 tasks remain pending. Owner is **PO** for every task. AI Agent support is documented in the workflow; the board has no Executor column.

The [package registry](../README.md#4-task-tracker) holds epic state; this board alone holds task state and PO ownership. Use the [task workflow](task-workflow.md). [Parent coverage and closure](../package-task-coverage.md) maps every parent criterion to outputs and names any external integration evidence. Package readiness means defined scope; dependencies, affected decisions and future coding authorization still gate execution.

All non-frontend work descends from the Phase A exit FE-18.03. Task prerequisites are direct required outputs and omit redundant transitive edges. Only FE-01.01 has no prerequisite. Table position is for navigation, not permission to skip dependencies or a request for parallel agents.

## 2. Task records

### Phase A — Frontend DEMO first

| Task | Parent | Deliverable | Depends on | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| [FE-01.01](../tasks/FE-01.01.md) | [FE-01](../06-frontend-first.md#fe-01) | Create the reproducible frontend scaffold | None | PO | done |
| [FE-01.02](../tasks/FE-01.02.md) | [FE-01](../06-frontend-first.md#fe-01) | Define the typed mock contract and synthetic fixtures | [FE-01.01](../tasks/FE-01.01.md) | PO | done |
| [FE-01.03](../tasks/FE-01.03.md) | [FE-01](../06-frontend-first.md#fe-01) | Implement the isolated mock gateway | [FE-01.02](../tasks/FE-01.02.md) | PO | done |
| [FE-02.01](../tasks/FE-02.01.md) | [FE-02](../06-frontend-first.md#fe-02) | Implement visual tokens and basic primitives | [FE-01.01](../tasks/FE-01.01.md) | PO | done |
| [FE-02.02](../tasks/FE-02.02.md) | [FE-02](../06-frontend-first.md#fe-02) | Implement form feedback and accessible dialogs | [FE-02.01](../tasks/FE-02.01.md) | PO | done |
| [FE-02.03](../tasks/FE-02.03.md) | [FE-02](../06-frontend-first.md#fe-02) | Build the role-aware responsive shell | [FE-01.02](../tasks/FE-01.02.md), [FE-02.02](../tasks/FE-02.02.md) | PO | review |
| [FE-02.04](../tasks/FE-02.04.md) | [FE-02](../06-frontend-first.md#fe-02) | Implement query lifecycle and timezone helpers | [FE-01.03](../tasks/FE-01.03.md), [FE-02.02](../tasks/FE-02.02.md) | PO | pending |
| [FE-03.01](../tasks/FE-03.01.md) | [FE-03](../06-frontend-first.md#fe-03) | Build the complete login form interaction | [FE-01.03](../tasks/FE-01.03.md), [FE-02.02](../tasks/FE-02.02.md) | PO | pending |
| [FE-03.02](../tasks/FE-03.02.md) | [FE-03](../06-frontend-first.md#fe-03) | Wire mock session routing and scoped entry | [FE-03.01](../tasks/FE-03.01.md), [FE-02.03](../tasks/FE-02.03.md), [FE-02.04](../tasks/FE-02.04.md) | PO | pending |
| [FE-03.03](../tasks/FE-03.03.md) | [FE-03](../06-frontend-first.md#fe-03) | Implement own profile editing | [FE-03.02](../tasks/FE-03.02.md) | PO | pending |
| [FE-03.04](../tasks/FE-03.04.md) | [FE-03](../06-frontend-first.md#fe-03) | Implement own password change interaction | [FE-03.02](../tasks/FE-03.02.md) | PO | pending |
| [FE-03.05](../tasks/FE-03.05.md) | [FE-03](../06-frontend-first.md#fe-03) | Verify logout, account switching and A1 handoff | [FE-03.03](../tasks/FE-03.03.md), [FE-03.04](../tasks/FE-03.04.md) | PO | pending |
| [FE-04.01](../tasks/FE-04.01.md) | [FE-04](../06-frontend-first.md#fe-04) | Build user management list and provisioning form | [FE-03.05](../tasks/FE-03.05.md) | PO | pending |
| [FE-04.02](../tasks/FE-04.02.md) | [FE-04](../06-frontend-first.md#fe-04) | Build account access-change and handover review | [FE-04.01](../tasks/FE-04.01.md) | PO | pending |
| [FE-04.03](../tasks/FE-04.03.md) | [FE-04](../06-frontend-first.md#fe-04) | Build department and category management | [FE-04.02](../tasks/FE-04.02.md) | PO | pending |
| [FE-04.04](../tasks/FE-04.04.md) | [FE-04](../06-frontend-first.md#fe-04) | Build team membership and intake management | [FE-04.03](../tasks/FE-04.03.md) | PO | pending |
| [FE-04.05](../tasks/FE-04.05.md) | [FE-04](../06-frontend-first.md#fe-04) | Build versioned SLA editor | [FE-04.04](../tasks/FE-04.04.md) | PO | pending |
| [FE-05.01](../tasks/FE-05.01.md) | [FE-05](../06-frontend-first.md#fe-05) | Build scoped ticket list and query navigation | [FE-03.05](../tasks/FE-03.05.md) | PO | pending |
| [FE-05.02](../tasks/FE-05.02.md) | [FE-05](../06-frontend-first.md#fe-05) | Build ticket form and conditional clarification | [FE-05.01](../tasks/FE-05.01.md) | PO | pending |
| [FE-05.03](../tasks/FE-05.03.md) | [FE-05](../06-frontend-first.md#fe-05) | Complete mock ticket submission and detail navigation | [FE-05.02](../tasks/FE-05.02.md) | PO | pending |
| [FE-06.01](../tasks/FE-06.01.md) | [FE-06](../06-frontend-first.md#fe-06) | Build ticket detail projection and authorized timeline | [FE-05.03](../tasks/FE-05.03.md) | PO | pending |
| [FE-06.02](../tasks/FE-06.02.md) | [FE-06](../06-frontend-first.md#fe-06) | Build public reply and internal-note composer | [FE-06.01](../tasks/FE-06.01.md) | PO | pending |
| [FE-06.03](../tasks/FE-06.03.md) | [FE-06](../06-frontend-first.md#fe-06) | Build acceptance, start and cancellation dialogs | [FE-06.02](../tasks/FE-06.02.md) | PO | pending |
| [FE-06.04](../tasks/FE-06.04.md) | [FE-06](../06-frontend-first.md#fe-06) | Build wait, resolve, close and reopen dialogs | [FE-06.03](../tasks/FE-06.03.md) | PO | pending |
| [FE-06.05](../tasks/FE-06.05.md) | [FE-06](../06-frontend-first.md#fe-06) | Build assignment, self-claim and priority dialogs | [FE-06.04](../tasks/FE-06.04.md) | PO | pending |
| [FE-06.06](../tasks/FE-06.06.md) | [FE-06](../06-frontend-first.md#fe-06) | Build separate SLA clock displays | [FE-06.05](../tasks/FE-06.05.md) | PO | pending |
| [FE-07.01](../tasks/FE-07.01.md) | [FE-07](../06-frontend-first.md#fe-07) | Build attachment selection and validation feedback | [FE-06.06](../tasks/FE-06.06.md) | PO | pending |
| [FE-07.02](../tasks/FE-07.02.md) | [FE-07](../06-frontend-first.md#fe-07) | Build upload outcome and retry interaction | [FE-07.01](../tasks/FE-07.01.md) | PO | pending |
| [FE-07.03](../tasks/FE-07.03.md) | [FE-07](../06-frontend-first.md#fe-07) | Build audience-safe attachment download controls | [FE-07.02](../tasks/FE-07.02.md) | PO | pending |
| [FE-08.01](../tasks/FE-08.01.md) | [FE-08](../06-frontend-first.md#fe-08) | Build scoped task card and table views | [FE-06.06](../tasks/FE-06.06.md) | PO | pending |
| [FE-08.02](../tasks/FE-08.02.md) | [FE-08](../06-frontend-first.md#fe-08) | Build plan version, DAG and dependency detail | [FE-08.01](../tasks/FE-08.01.md) | PO | pending |
| [FE-08.03](../tasks/FE-08.03.md) | [FE-08](../06-frontend-first.md#fe-08) | Build task progress and human completion forms | [FE-08.02](../tasks/FE-08.02.md) | PO | pending |
| [FE-08.04](../tasks/FE-08.04.md) | [FE-08](../06-frontend-first.md#fe-08) | Build manual assignment lock and impact controls | [FE-08.03](../tasks/FE-08.03.md) | PO | pending |
| [FE-09.01](../tasks/FE-09.01.md) | [FE-09](../06-frontend-first.md#fe-09) | Build workforce skill and capacity views | [FE-08.04](../tasks/FE-08.04.md) | PO | pending |
| [FE-09.02](../tasks/FE-09.02.md) | [FE-09](../06-frontend-first.md#fe-09) | Build calendar, skill and absence edits | [FE-09.01](../tasks/FE-09.01.md) | PO | pending |
| [FE-09.03](../tasks/FE-09.03.md) | [FE-09](../06-frontend-first.md#fe-09) | Complete saved-change and evaluation-pending flow | [FE-09.02](../tasks/FE-09.02.md) | PO | pending |
| [FE-10.01](../tasks/FE-10.01.md) | [FE-10](../06-frontend-first.md#fe-10) | Build workflow version editor and publish preview | [FE-08.04](../tasks/FE-08.04.md) | PO | pending |
| [FE-10.02](../tasks/FE-10.02.md) | [FE-10](../06-frontend-first.md#fe-10) | Build policy scope and enable-disable confirmation | [FE-10.01](../tasks/FE-10.01.md) | PO | pending |
| [FE-10.03](../tasks/FE-10.03.md) | [FE-10](../06-frontend-first.md#fe-10) | Build coordination run timeline and recovery states | [FE-10.02](../tasks/FE-10.02.md) | PO | pending |
| [FE-11.01](../tasks/FE-11.01.md) | [FE-11](../06-frontend-first.md#fe-11) | Build proposal diff and impact detail | [FE-09.03](../tasks/FE-09.03.md), [FE-10.03](../tasks/FE-10.03.md) | PO | pending |
| [FE-11.02](../tasks/FE-11.02.md) | [FE-11](../06-frontend-first.md#fe-11) | Build approve-reject and stale decision interaction | [FE-11.01](../tasks/FE-11.01.md) | PO | pending |
| [FE-12.01](../tasks/FE-12.01.md) | [FE-12](../06-frontend-first.md#fe-12) | Build scoped asset list, detail and history | [FE-05.03](../tasks/FE-05.03.md) | PO | pending |
| [FE-12.02](../tasks/FE-12.02.md) | [FE-12](../06-frontend-first.md#fe-12) | Build asset metadata create-edit forms | [FE-12.01](../tasks/FE-12.01.md) | PO | pending |
| [FE-12.03](../tasks/FE-12.03.md) | [FE-12](../06-frontend-first.md#fe-12) | Build issue, return, repair and retire dialogs | [FE-12.02](../tasks/FE-12.02.md) | PO | pending |
| [FE-12.04](../tasks/FE-12.04.md) | [FE-12](../06-frontend-first.md#fe-12) | Connect permitted ticket asset picker | [FE-12.03](../tasks/FE-12.03.md) | PO | pending |
| [FE-13.01](../tasks/FE-13.01.md) | [FE-13](../06-frontend-first.md#fe-13) | Build published knowledge search and versioned reader | [FE-03.05](../tasks/FE-03.05.md) | PO | pending |
| [FE-13.02](../tasks/FE-13.02.md) | [FE-13](../06-frontend-first.md#fe-13) | Build author, publisher and ACL interactions | [FE-13.01](../tasks/FE-13.01.md) | PO | pending |
| [FE-13.03](../tasks/FE-13.03.md) | [FE-13](../06-frontend-first.md#fe-13) | Build indexing, retired and revoked source states | [FE-13.02](../tasks/FE-13.02.md) | PO | pending |
| [FE-14.01](../tasks/FE-14.01.md) | [FE-14](../06-frontend-first.md#fe-14) | Build owner-specific chat and conversation lifecycle | [FE-06.06](../tasks/FE-06.06.md), [FE-12.04](../tasks/FE-12.04.md), [FE-13.03](../tasks/FE-13.03.md) | PO | pending |
| [FE-14.02](../tasks/FE-14.02.md) | [FE-14](../06-frontend-first.md#fe-14) | Build source, lookup, summary and draft cards | [FE-14.01](../tasks/FE-14.01.md) | PO | pending |
| [FE-14.03](../tasks/FE-14.03.md) | [FE-14](../06-frontend-first.md#fe-14) | Build assistant availability and manual fallback | [FE-14.02](../tasks/FE-14.02.md) | PO | pending |
| [FE-15.01](../tasks/FE-15.01.md) | [FE-15](../06-frontend-first.md#fe-15) | Build allowlisted intent and resource selection registry | [FE-11.02](../tasks/FE-11.02.md), [FE-14.03](../tasks/FE-14.03.md) | PO | pending |
| [FE-15.02](../tasks/FE-15.02.md) | [FE-15](../06-frontend-first.md#fe-15) | Build confirmed ticket creation and reply cards | [FE-15.01](../tasks/FE-15.01.md) | PO | pending |
| [FE-15.03](../tasks/FE-15.03.md) | [FE-15](../06-frontend-first.md#fe-15) | Build task and management action cards | [FE-15.02](../tasks/FE-15.02.md) | PO | pending |
| [FE-15.04](../tasks/FE-15.04.md) | [FE-15](../06-frontend-first.md#fe-15) | Compose normal and exception AI Workspace | [FE-15.03](../tasks/FE-15.03.md) | PO | pending |
| [FE-16.01](../tasks/FE-16.01.md) | [FE-16](../06-frontend-first.md#fe-16) | Build personal and Technician dashboard actions | [FE-09.03](../tasks/FE-09.03.md), [FE-10.03](../tasks/FE-10.03.md), [FE-14.03](../tasks/FE-14.03.md) | PO | pending |
| [FE-16.02](../tasks/FE-16.02.md) | [FE-16](../06-frontend-first.md#fe-16) | Build management ticket, SLA and warranty reports | [FE-16.01](../tasks/FE-16.01.md) | PO | pending |
| [FE-16.03](../tasks/FE-16.03.md) | [FE-16](../06-frontend-first.md#fe-16) | Build work, usage and assistant fact parity | [FE-16.02](../tasks/FE-16.02.md) | PO | pending |
| [FE-17.01](../tasks/FE-17.01.md) | [FE-17](../06-frontend-first.md#fe-17) | Build own notification list and read interaction | [FE-04.05](../tasks/FE-04.05.md), [FE-10.03](../tasks/FE-10.03.md) | PO | pending |
| [FE-17.02](../tasks/FE-17.02.md) | [FE-17](../06-frontend-first.md#fe-17) | Build scoped audit search and history | [FE-17.01](../tasks/FE-17.01.md) | PO | pending |
| [FE-18.01](../tasks/FE-18.01.md) | [FE-18](../06-frontend-first.md#fe-18) | Verify complete frontend screen and state coverage | [FE-07.03](../tasks/FE-07.03.md), [FE-15.04](../tasks/FE-15.04.md), [FE-16.03](../tasks/FE-16.03.md), [FE-17.02](../tasks/FE-17.02.md) | PO | pending |
| [FE-18.02](../tasks/FE-18.02.md) | [FE-18](../06-frontend-first.md#fe-18) | Verify frontend accessibility and resilient state handling | [FE-18.01](../tasks/FE-18.01.md) | PO | pending |
| [FE-18.03](../tasks/FE-18.03.md) | [FE-18](../06-frontend-first.md#fe-18) | Finalize frontend contract and Phase A handoff | [FE-18.02](../tasks/FE-18.02.md) | PO | pending |

### Phase B — Decisions and real services

| Task | Parent | Deliverable | Depends on | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| [PRE-01.01](../tasks/PRE-01.01.md) | [PRE-01](../00-decisions.md#pre-01) | Resolve bootstrap and identity lifecycle decisions | [FE-18.03](../tasks/FE-18.03.md) | PO | pending |
| [PRE-01.02](../tasks/PRE-01.02.md) | [PRE-01](../00-decisions.md#pre-01) | Review foundation DTO and physical schema contracts | [PRE-01.01](../tasks/PRE-01.01.md) | PO | pending |
| [PRE-02.01](../tasks/PRE-02.01.md) | [PRE-02](../00-decisions.md#pre-02) | Resolve workforce periods and verified effort inputs | [FE-18.03](../tasks/FE-18.03.md) | PO | pending |
| [PRE-02.02](../tasks/PRE-02.02.md) | [PRE-02](../00-decisions.md#pre-02) | Resolve concurrency, event and approval contracts | [PRE-02.01](../tasks/PRE-02.01.md) | PO | pending |
| [PRE-02.03](../tasks/PRE-02.03.md) | [PRE-02](../00-decisions.md#pre-02) | Resolve bounded automation policy configuration | [PRE-02.02](../tasks/PRE-02.02.md) | PO | pending |
| [PRE-03.01](../tasks/PRE-03.01.md) | [PRE-03](../00-decisions.md#pre-03) | Resolve KB publication, ACL and embedding contracts | [FE-18.03](../tasks/FE-18.03.md) | PO | pending |
| [PRE-03.02](../tasks/PRE-03.02.md) | [PRE-03](../00-decisions.md#pre-03) | Resolve assistant confirmation, retention and shared budget | [PRE-03.01](../tasks/PRE-03.01.md) | PO | pending |
| [PRE-03.03](../tasks/PRE-03.03.md) | [PRE-03](../00-decisions.md#pre-03) | Resolve inventory reservation and minimum source rules | [PRE-03.02](../tasks/PRE-03.02.md) | PO | pending |
| [PRE-04.01](../tasks/PRE-04.01.md) | [PRE-04](../00-decisions.md#pre-04) | Agree deployment, ownership and measurable targets | [FE-18.03](../tasks/FE-18.03.md) | PO | pending |
| [PRE-04.02](../tasks/PRE-04.02.md) | [PRE-04](../00-decisions.md#pre-04) | Finalize release and isolated recovery sequence | [PRE-04.01](../tasks/PRE-04.01.md) | PO | pending |
| [FND-01.01](../tasks/FND-01.01.md) | [FND-01](../01-foundation.md#fnd-01) | Initialize reproducible backend runtime and local services | [PRE-01.02](../tasks/PRE-01.02.md) | PO | pending |
| [FND-01.02](../tasks/FND-01.02.md) | [FND-01](../01-foundation.md#fnd-01) | Expose safe health and establish build checks | [FND-01.01](../tasks/FND-01.01.md) | PO | pending |
| [FND-02.01](../tasks/FND-02.01.md) | [FND-02](../01-foundation.md#fnd-02) | Create SQLAlchemy session and migration foundation | [FND-01.02](../tasks/FND-01.02.md) | PO | pending |
| [FND-02.02](../tasks/FND-02.02.md) | [FND-02](../01-foundation.md#fnd-02) | Implement atomic unit of work, audit and outbox writers | [FND-02.01](../tasks/FND-02.01.md) | PO | pending |
| [FND-02.03](../tasks/FND-02.03.md) | [FND-02](../01-foundation.md#fnd-02) | Implement expected-version and command idempotency primitives | [FND-02.02](../tasks/FND-02.02.md) | PO | pending |
| [FND-03.01](../tasks/FND-03.01.md) | [FND-03](../01-foundation.md#fnd-03) | Review real API projections against frontend transport | [FND-01.02](../tasks/FND-01.02.md) | PO | pending |
| [FND-03.02](../tasks/FND-03.02.md) | [FND-03](../01-foundation.md#fnd-03) | Prepare production API/query infrastructure boundary | [FND-03.01](../tasks/FND-03.01.md) | PO | pending |
| [FND-04.01](../tasks/FND-04.01.md) | [FND-04](../01-foundation.md#fnd-04) | Implement credential verification and server session creation | [FND-02.03](../tasks/FND-02.03.md), [FND-03.02](../tasks/FND-03.02.md) | PO | pending |
| [FND-04.02](../tasks/FND-04.02.md) | [FND-04](../01-foundation.md#fnd-04) | Implement current-principal, logout and session revocation | [FND-04.01](../tasks/FND-04.01.md) | PO | pending |
| [FND-05.01](../tasks/FND-05.01.md) | [FND-05](../01-foundation.md#fnd-05) | Implement department and category-safe reference ownership | [FND-04.02](../tasks/FND-04.02.md) | PO | pending |
| [FND-05.02](../tasks/FND-05.02.md) | [FND-05](../01-foundation.md#fnd-05) | Implement teams, memberships and single intake configuration | [FND-05.01](../tasks/FND-05.01.md) | PO | pending |
| [FND-06.01](../tasks/FND-06.01.md) | [FND-06](../01-foundation.md#fnd-06) | Implement verified account provisioning command | [FND-05.02](../tasks/FND-05.02.md) | PO | pending |
| [FND-06.02](../tasks/FND-06.02.md) | [FND-06](../01-foundation.md#fnd-06) | Implement secure provisioning result and audit contract | [FND-06.01](../tasks/FND-06.01.md) | PO | pending |
| [FND-07.01](../tasks/FND-07.01.md) | [FND-07](../01-foundation.md#fnd-07) | Implement restricted own-profile update | [FND-04.02](../tasks/FND-04.02.md) | PO | pending |
| [FND-07.02](../tasks/FND-07.02.md) | [FND-07](../01-foundation.md#fnd-07) | Implement current-password verification and password rotation | [FND-07.01](../tasks/FND-07.01.md) | PO | pending |
| [FND-08.01](../tasks/FND-08.01.md) | [FND-08](../01-foundation.md#fnd-08) | Implement ticket category lifecycle and permitted lookups | [FND-05.02](../tasks/FND-05.02.md) | PO | pending |
| [FND-08.02](../tasks/FND-08.02.md) | [FND-08](../01-foundation.md#fnd-08) | Implement immutable versioned default SLA publication | [FND-08.01](../tasks/FND-08.01.md) | PO | pending |
| [FND-09.01](../tasks/FND-09.01.md) | [FND-09](../01-foundation.md#fnd-09) | Implement ticket intake validation and server-derived facts | [FND-06.02](../tasks/FND-06.02.md), [FND-08.02](../tasks/FND-08.02.md) | PO | pending |
| [FND-09.02](../tasks/FND-09.02.md) | [FND-09](../01-foundation.md#fnd-09) | Persist ticket, SLA snapshot and events atomically | [FND-09.01](../tasks/FND-09.01.md) | PO | pending |
| [FND-10.01](../tasks/FND-10.01.md) | [FND-10](../01-foundation.md#fnd-10) | Implement scoped ticket search and count query | [FND-09.02](../tasks/FND-09.02.md) | PO | pending |
| [FND-10.02](../tasks/FND-10.02.md) | [FND-10](../01-foundation.md#fnd-10) | Implement authorized ticket detail projections | [FND-10.01](../tasks/FND-10.01.md) | PO | pending |
| [FND-11.01](../tasks/FND-11.01.md) | [FND-11](../01-foundation.md#fnd-11) | Implement eligible assignment and team transfer | [FND-10.02](../tasks/FND-10.02.md) | PO | pending |
| [FND-11.02](../tasks/FND-11.02.md) | [FND-11](../01-foundation.md#fnd-11) | Implement concurrent self-claim and accept-start commands | [FND-11.01](../tasks/FND-11.01.md) | PO | pending |
| [FND-12.01](../tasks/FND-12.01.md) | [FND-12](../01-foundation.md#fnd-12) | Implement audience-separated comment and note commands | [FND-11.02](../tasks/FND-11.02.md) | PO | pending |
| [FND-12.02](../tasks/FND-12.02.md) | [FND-12](../01-foundation.md#fnd-12) | Implement atomic Pending question and requester resume | [FND-12.01](../tasks/FND-12.01.md) | PO | pending |
| [FND-12.03](../tasks/FND-12.03.md) | [FND-12](../01-foundation.md#fnd-12) | Implement resolution and requester closure | [FND-12.02](../tasks/FND-12.02.md) | PO | pending |
| [FND-12.04](../tasks/FND-12.04.md) | [FND-12](../01-foundation.md#fnd-12) | Implement reasoned reopen and cancellation branches | [FND-12.03](../tasks/FND-12.03.md) | PO | pending |
| [FND-13.01](../tasks/FND-13.01.md) | [FND-13](../01-foundation.md#fnd-13) | Implement priority adjustment without SLA reset | [FND-12.04](../tasks/FND-12.04.md) | PO | pending |
| [FND-13.02](../tasks/FND-13.02.md) | [FND-13](../01-foundation.md#fnd-13) | Implement visibility-filtered event timeline query | [FND-13.01](../tasks/FND-13.01.md) | PO | pending |
| [FND-14.01](../tasks/FND-14.01.md) | [FND-14](../01-foundation.md#fnd-14) | Implement skill taxonomy and authorized verification | [FND-05.02](../tasks/FND-05.02.md), [PRE-02.03](../tasks/PRE-02.03.md) | PO | pending |
| [FND-14.02](../tasks/FND-14.02.md) | [FND-14](../01-foundation.md#fnd-14) | Publish auditable skill-change effects | [FND-14.01](../tasks/FND-14.01.md) | PO | pending |
| [FND-15.01](../tasks/FND-15.01.md) | [FND-15](../01-foundation.md#fnd-15) | Implement period calendar and absence union calculations | [FND-14.02](../tasks/FND-14.02.md) | PO | pending |
| [FND-15.02](../tasks/FND-15.02.md) | [FND-15](../01-foundation.md#fnd-15) | Implement authorized calendar and absence mutations | [FND-15.01](../tasks/FND-15.01.md) | PO | pending |
| [FND-16.01](../tasks/FND-16.01.md) | [FND-16](../01-foundation.md#fnd-16) | Persist manual plan/task and enforce internal scope | [FND-11.02](../tasks/FND-11.02.md), [FND-15.02](../tasks/FND-15.02.md) | PO | pending |
| [FND-16.02](../tasks/FND-16.02.md) | [FND-16](../01-foundation.md#fnd-16) | Implement atomic manual assignment and remaining allocations | [FND-16.01](../tasks/FND-16.01.md) | PO | pending |
| [FND-16.03](../tasks/FND-16.03.md) | [FND-16](../01-foundation.md#fnd-16) | Implement guarded human task progress and completion | [FND-16.02](../tasks/FND-16.02.md) | PO | pending |
| [FND-17.01](../tasks/FND-17.01.md) | [FND-17](../01-foundation.md#fnd-17) | Implement immediate access loss and protected account invariants | [FND-16.03](../tasks/FND-16.03.md) | PO | pending |
| [FND-17.02](../tasks/FND-17.02.md) | [FND-17](../01-foundation.md#fnd-17) | Implement transactional active-work handover | [FND-17.01](../tasks/FND-17.01.md) | PO | pending |
| [FND-17.03](../tasks/FND-17.03.md) | [FND-17](../01-foundation.md#fnd-17) | Publish affected-work changes and complete team deactivation | [FND-17.02](../tasks/FND-17.02.md) | PO | pending |
| [FND-18.01](../tasks/FND-18.01.md) | [FND-18](../01-foundation.md#fnd-18) | Implement business versus administration audit projection | [FND-13.02](../tasks/FND-13.02.md), [FND-17.03](../tasks/FND-17.03.md) | PO | pending |
| [FND-18.02](../tasks/FND-18.02.md) | [FND-18](../01-foundation.md#fnd-18) | Implement bounded audit search and shared projection contract | [FND-18.01](../tasks/FND-18.01.md) | PO | pending |
| [WF-01.01](../tasks/WF-01.01.md) | [WF-01](../02-workflows.md#wf-01) | Validate sourced same-version plan DAGs | [FND-16.03](../tasks/FND-16.03.md) | PO | pending |
| [WF-01.02](../tasks/WF-01.02.md) | [WF-01](../02-workflows.md#wf-01) | Activate one effective plan version atomically | [WF-01.01](../tasks/WF-01.01.md) | PO | pending |
| [WF-01.03](../tasks/WF-01.03.md) | [WF-01](../02-workflows.md#wf-01) | Revalidate task readiness against effective predecessors | [WF-01.02](../tasks/WF-01.02.md) | PO | pending |
| [WF-02.01](../tasks/WF-02.01.md) | [WF-02](../02-workflows.md#wf-02) | Implement sourced workflow draft/version ownership | [WF-01.03](../tasks/WF-01.03.md) | PO | pending |
| [WF-02.02](../tasks/WF-02.02.md) | [WF-02](../02-workflows.md#wf-02) | Publish immutable verified workflow versions | [WF-02.01](../tasks/WF-02.01.md) | PO | pending |
| [WF-03.01](../tasks/WF-03.01.md) | [WF-03](../02-workflows.md#wf-03) | Persist bounded policies and service grants | [WF-02.02](../tasks/WF-02.02.md) | PO | pending |
| [WF-03.02](../tasks/WF-03.02.md) | [WF-03](../02-workflows.md#wf-03) | Evaluate live grant authority and default-deny effects | [WF-03.01](../tasks/WF-03.01.md) | PO | pending |
| [WF-03.03](../tasks/WF-03.03.md) | [WF-03](../02-workflows.md#wf-03) | Expose policy commands and availability projections | [WF-03.02](../tasks/WF-03.02.md) | PO | pending |
| [WF-04.01](../tasks/WF-04.01.md) | [WF-04](../02-workflows.md#wf-04) | Filter eligible candidate evidence | [WF-01.03](../tasks/WF-01.03.md) | PO | pending |
| [WF-04.02](../tasks/WF-04.02.md) | [WF-04](../02-workflows.md#wf-04) | Compute period allocations and feasibility | [WF-04.01](../tasks/WF-04.01.md) | PO | pending |
| [WF-04.03](../tasks/WF-04.03.md) | [WF-04](../02-workflows.md#wf-04) | Commit competing allocations under one lock protocol | [WF-04.02](../tasks/WF-04.02.md) | PO | pending |
| [WF-05.01](../tasks/WF-05.01.md) | [WF-05](../02-workflows.md#wf-05) | Configure Linux worker queues and one scheduler | [FND-02.03](../tasks/FND-02.03.md), [PRE-02.03](../tasks/PRE-02.03.md) | PO | pending |
| [WF-05.02](../tasks/WF-05.02.md) | [WF-05](../02-workflows.md#wf-05) | Implement durable delivery claims and idempotent consumers | [WF-05.01](../tasks/WF-05.01.md) | PO | pending |
| [WF-05.03](../tasks/WF-05.03.md) | [WF-05](../02-workflows.md#wf-05) | Implement bounded retry, dead-letter and outage visibility | [WF-05.02](../tasks/WF-05.02.md) | PO | pending |
| [WF-06.01](../tasks/WF-06.01.md) | [WF-06](../02-workflows.md#wf-06) | Persist sourced exception proposal snapshots | [WF-03.03](../tasks/WF-03.03.md), [WF-04.03](../tasks/WF-04.03.md) | PO | pending |
| [WF-06.02](../tasks/WF-06.02.md) | [WF-06](../02-workflows.md#wf-06) | Implement authorized current approval decisions | [WF-06.01](../tasks/WF-06.01.md) | PO | pending |
| [WF-07.01](../tasks/WF-07.01.md) | [WF-07](../02-workflows.md#wf-07) | Implement reasoned manual assignment locks and override | [WF-06.02](../tasks/WF-06.02.md) | PO | pending |
| [WF-07.02](../tasks/WF-07.02.md) | [WF-07](../02-workflows.md#wf-07) | Implement live disable and valid compensation guards | [WF-07.01](../tasks/WF-07.01.md) | PO | pending |
| [WF-08.01](../tasks/WF-08.01.md) | [WF-08](../02-workflows.md#wf-08) | Build scoped snapshot-to-command execution boundary | [WF-05.03](../tasks/WF-05.03.md), [WF-07.02](../tasks/WF-07.02.md) | PO | pending |
| [WF-08.02](../tasks/WF-08.02.md) | [WF-08](../02-workflows.md#wf-08) | Commit idempotent actions with all domain facts | [WF-08.01](../tasks/WF-08.01.md) | PO | pending |
| [WF-08.03](../tasks/WF-08.03.md) | [WF-08](../02-workflows.md#wf-08) | Classify transient, stale, denied and infeasible failures | [WF-08.02](../tasks/WF-08.02.md) | PO | pending |
| [WF-09.01](../tasks/WF-09.01.md) | [WF-09](../02-workflows.md#wf-09) | Select affected work from operational event versions | [WF-08.03](../tasks/WF-08.03.md) | PO | pending |
| [WF-09.02](../tasks/WF-09.02.md) | [WF-09](../02-workflows.md#wf-09) | Apply deterministic bounded re-evaluation and reminders | [WF-09.01](../tasks/WF-09.01.md) | PO | pending |
| [WF-10.01](../tasks/WF-10.01.md) | [WF-10](../02-workflows.md#wf-10) | Expose scoped redacted run and action provenance | [WF-08.03](../tasks/WF-08.03.md), [FND-18.02](../tasks/FND-18.02.md) | PO | pending |
| [WF-10.02](../tasks/WF-10.02.md) | [WF-10](../02-workflows.md#wf-10) | Implement audited retry and re-evaluation commands | [WF-10.01](../tasks/WF-10.01.md) | PO | pending |
| [AI-01.01](../tasks/AI-01.01.md) | [AI-01](../03-ai-automation.md#ai-01) | Persist minimum approved knowledge sources and ACL | [FND-04.02](../tasks/FND-04.02.md), [PRE-03.03](../tasks/PRE-03.03.md) | PO | pending |
| [AI-01.02](../tasks/AI-01.02.md) | [AI-01](../03-ai-automation.md#ai-01) | Provide live authorized source and citation query | [AI-01.01](../tasks/AI-01.01.md) | PO | pending |
| [AI-02.01](../tasks/AI-02.01.md) | [AI-02](../03-ai-automation.md#ai-02) | Persist minimum planning inventory and restricted reads | [FND-05.02](../tasks/FND-05.02.md), [PRE-03.03](../tasks/PRE-03.03.md) | PO | pending |
| [AI-02.02](../tasks/AI-02.02.md) | [AI-02](../03-ai-automation.md#ai-02) | Implement shortage and adopted reservation lifecycle | [AI-02.01](../tasks/AI-02.01.md) | PO | pending |
| [AI-03.01](../tasks/AI-03.01.md) | [AI-03](../03-ai-automation.md#ai-03) | Implement minimal structured provider adapter | [FND-02.03](../tasks/FND-02.03.md), [PRE-03.03](../tasks/PRE-03.03.md) | PO | pending |
| [AI-03.02](../tasks/AI-03.02.md) | [AI-03](../03-ai-automation.md#ai-03) | Implement atomic shared budget reservation ledger | [AI-03.01](../tasks/AI-03.01.md) | PO | pending |
| [AI-03.03](../tasks/AI-03.03.md) | [AI-03](../03-ai-automation.md#ai-03) | Persist sourced usage and bounded retry settlement | [AI-03.02](../tasks/AI-03.02.md) | PO | pending |
| [AI-04.01](../tasks/AI-04.01.md) | [AI-04](../03-ai-automation.md#ai-04) | Validate structured intake source completeness | [AI-01.02](../tasks/AI-01.02.md), [AI-02.02](../tasks/AI-02.02.md), [AI-03.03](../tasks/AI-03.03.md), [FND-12.04](../tasks/FND-12.04.md), [WF-02.02](../tasks/WF-02.02.md) | PO | pending |
| [AI-04.02](../tasks/AI-04.02.md) | [AI-04](../03-ai-automation.md#ai-04) | Persist deduplicated clarification without effective work | [AI-04.01](../tasks/AI-04.01.md) | PO | pending |
| [AI-05.01](../tasks/AI-05.01.md) | [AI-05](../03-ai-automation.md#ai-05) | Generate and validate sourced plan proposals | [AI-04.02](../tasks/AI-04.02.md), [WF-08.03](../tasks/WF-08.03.md) | PO | pending |
| [AI-05.02](../tasks/AI-05.02.md) | [AI-05](../03-ai-automation.md#ai-05) | Activate eligible AI plans through the shared executor | [AI-05.01](../tasks/AI-05.01.md) | PO | pending |
| [AI-06.01](../tasks/AI-06.01.md) | [AI-06](../03-ai-automation.md#ai-06) | Rank only backend-filtered candidates | [AI-05.02](../tasks/AI-05.02.md) | PO | pending |
| [AI-06.02](../tasks/AI-06.02.md) | [AI-06](../03-ai-automation.md#ai-06) | Commit source-current AI assignments or shortage exceptions | [AI-06.01](../tasks/AI-06.01.md) | PO | pending |
| [AI-07.01](../tasks/AI-07.01.md) | [AI-07](../03-ai-automation.md#ai-07) | Generate event-scoped replanning proposals | [AI-06.02](../tasks/AI-06.02.md), [WF-09.02](../tasks/WF-09.02.md), [WF-10.02](../tasks/WF-10.02.md) | PO | pending |
| [AI-07.02](../tasks/AI-07.02.md) | [AI-07](../03-ai-automation.md#ai-07) | Execute guarded reassignment or exception path | [AI-07.01](../tasks/AI-07.01.md) | PO | pending |
| [AI-08.01](../tasks/AI-08.01.md) | [AI-08](../03-ai-automation.md#ai-08) | Prepare verified live-model test entry and fixed cases | [AI-07.02](../tasks/AI-07.02.md) | PO | pending |
| [AI-08.02](../tasks/AI-08.02.md) | [AI-08](../03-ai-automation.md#ai-08) | Execute bounded M3 real-model scenario evidence | [AI-08.01](../tasks/AI-08.01.md) | PO | pending |
| [OPS-01.01](../tasks/OPS-01.01.md) | [OPS-01](../04-operations-assistant.md#ops-01) | Implement complete asset metadata and scoped search | [AI-02.02](../tasks/AI-02.02.md), [FND-10.02](../tasks/FND-10.02.md) | PO | pending |
| [OPS-01.02](../tasks/OPS-01.02.md) | [OPS-01](../04-operations-assistant.md#ops-01) | Implement authorized asset detail and assignment history | [OPS-01.01](../tasks/OPS-01.01.md) | PO | pending |
| [OPS-02.01](../tasks/OPS-02.01.md) | [OPS-02](../04-operations-assistant.md#ops-02) | Implement atomic eligible asset issue | [OPS-01.02](../tasks/OPS-01.02.md) | PO | pending |
| [OPS-02.02](../tasks/OPS-02.02.md) | [OPS-02](../04-operations-assistant.md#ops-02) | Implement idempotent return and guarded asset transitions | [OPS-02.01](../tasks/OPS-02.01.md) | PO | pending |
| [OPS-02.03](../tasks/OPS-02.03.md) | [OPS-02](../04-operations-assistant.md#ops-02) | Enforce ticket asset lookup and reservation reconciliation | [OPS-02.02](../tasks/OPS-02.02.md) | PO | pending |
| [OPS-03.01](../tasks/OPS-03.01.md) | [OPS-03](../04-operations-assistant.md#ops-03) | Expose shared two-clock SLA projection | [FND-13.02](../tasks/FND-13.02.md), [WF-05.03](../tasks/WF-05.03.md) | PO | pending |
| [OPS-03.02](../tasks/OPS-03.02.md) | [OPS-03](../04-operations-assistant.md#ops-03) | Persist deduplicated scan thresholds and recipient intents | [OPS-03.01](../tasks/OPS-03.01.md) | PO | pending |
| [OPS-03.03](../tasks/OPS-03.03.md) | [OPS-03](../04-operations-assistant.md#ops-03) | Recover delayed scans with observable freshness | [OPS-03.02](../tasks/OPS-03.02.md) | PO | pending |
| [OPS-04.01](../tasks/OPS-04.01.md) | [OPS-04](../04-operations-assistant.md#ops-04) | Deliver current-authorized deduplicated notification intents | [OPS-03.03](../tasks/OPS-03.03.md) | PO | pending |
| [OPS-04.02](../tasks/OPS-04.02.md) | [OPS-04](../04-operations-assistant.md#ops-04) | Implement own notification paging and idempotent read | [OPS-04.01](../tasks/OPS-04.01.md) | PO | pending |
| [OPS-05.01](../tasks/OPS-05.01.md) | [OPS-05](../04-operations-assistant.md#ops-05) | Implement content-validated private staging | [FND-12.04](../tasks/FND-12.04.md) | PO | pending |
| [OPS-05.02](../tasks/OPS-05.02.md) | [OPS-05](../04-operations-assistant.md#ops-05) | Finalize attachment ownership with domain outcome recovery | [OPS-05.01](../tasks/OPS-05.01.md) | PO | pending |
| [OPS-05.03](../tasks/OPS-05.03.md) | [OPS-05](../04-operations-assistant.md#ops-05) | Implement current-parent authorized downloads | [OPS-05.02](../tasks/OPS-05.02.md) | PO | pending |
| [OPS-06.01](../tasks/OPS-06.01.md) | [OPS-06](../04-operations-assistant.md#ops-06) | Implement full KB author/publisher version lifecycle | [AI-01.02](../tasks/AI-01.02.md) | PO | pending |
| [OPS-06.02](../tasks/OPS-06.02.md) | [OPS-06](../04-operations-assistant.md#ops-06) | Implement immediate ACL revocation and index projections | [OPS-06.01](../tasks/OPS-06.01.md) | PO | pending |
| [OPS-07.01](../tasks/OPS-07.01.md) | [OPS-07](../04-operations-assistant.md#ops-07) | Implement idempotent version-bound chunk and embedding jobs | [OPS-06.02](../tasks/OPS-06.02.md), [AI-03.03](../tasks/AI-03.03.md), [WF-05.03](../tasks/WF-05.03.md) | PO | pending |
| [OPS-07.02](../tasks/OPS-07.02.md) | [OPS-07](../04-operations-assistant.md#ops-07) | Implement live-ACL vector retrieval and source validation | [OPS-07.01](../tasks/OPS-07.01.md) | PO | pending |
| [OPS-08.01](../tasks/OPS-08.01.md) | [OPS-08](../04-operations-assistant.md#ops-08) | Implement owner-specific conversation and retention storage | [FND-04.02](../tasks/FND-04.02.md), [AI-03.03](../tasks/AI-03.03.md) | PO | pending |
| [OPS-08.02](../tasks/OPS-08.02.md) | [OPS-08](../04-operations-assistant.md#ops-08) | Implement validated assistant availability configuration | [OPS-08.01](../tasks/OPS-08.01.md) | PO | pending |
| [OPS-08.03](../tasks/OPS-08.03.md) | [OPS-08](../04-operations-assistant.md#ops-08) | Enforce source-current history and cache projections | [OPS-08.02](../tasks/OPS-08.02.md) | PO | pending |
| [OPS-09.01](../tasks/OPS-09.01.md) | [OPS-09](../04-operations-assistant.md#ops-09) | Implement allowlisted scoped reads and cited guidance | [OPS-07.02](../tasks/OPS-07.02.md), [OPS-08.03](../tasks/OPS-08.03.md), [OPS-02.03](../tasks/OPS-02.03.md) | PO | pending |
| [OPS-09.02](../tasks/OPS-09.02.md) | [OPS-09](../04-operations-assistant.md#ops-09) | Validate output, citation and history access before release | [OPS-09.01](../tasks/OPS-09.01.md) | PO | pending |
| [OPS-10.01](../tasks/OPS-10.01.md) | [OPS-10](../04-operations-assistant.md#ops-10) | Implement visibility-bound summaries and draft generation | [OPS-08.03](../tasks/OPS-08.03.md), [FND-12.04](../tasks/FND-12.04.md) | PO | pending |
| [OPS-10.02](../tasks/OPS-10.02.md) | [OPS-10](../04-operations-assistant.md#ops-10) | Expose deliberate draft insertion and native submission contract | [OPS-10.01](../tasks/OPS-10.01.md) | PO | pending |
| [OPS-11.01](../tasks/OPS-11.01.md) | [OPS-11](../04-operations-assistant.md#ops-11) | Persist exact confirmed ticket preview contract | [OPS-08.03](../tasks/OPS-08.03.md), [OPS-02.03](../tasks/OPS-02.03.md), [OPS-05.03](../tasks/OPS-05.03.md) | PO | pending |
| [OPS-11.02](../tasks/OPS-11.02.md) | [OPS-11](../04-operations-assistant.md#ops-11) | Execute idempotent confirmed ticket service command | [OPS-11.01](../tasks/OPS-11.01.md) | PO | pending |
| [OPS-12.01](../tasks/OPS-12.01.md) | [OPS-12](../04-operations-assistant.md#ops-12) | Register trusted ticket reply and lifecycle intents | [OPS-10.02](../tasks/OPS-10.02.md), [OPS-11.02](../tasks/OPS-11.02.md) | PO | pending |
| [OPS-12.02](../tasks/OPS-12.02.md) | [OPS-12](../04-operations-assistant.md#ops-12) | Execute current-content confirmed ticket actions | [OPS-12.01](../tasks/OPS-12.01.md) | PO | pending |
| [OPS-13.01](../tasks/OPS-13.01.md) | [OPS-13](../04-operations-assistant.md#ops-13) | Register and execute authorized specialist progress intents | [OPS-12.02](../tasks/OPS-12.02.md), [WF-01.03](../tasks/WF-01.03.md) | PO | pending |
| [OPS-13.02](../tasks/OPS-13.02.md) | [OPS-13](../04-operations-assistant.md#ops-13) | Expose committed task result and safe deny/handoff | [OPS-13.01](../tasks/OPS-13.01.md) | PO | pending |
| [OPS-14.01](../tasks/OPS-14.01.md) | [OPS-14](../04-operations-assistant.md#ops-14) | Inventory management intents and secure form ownership | [OPS-13.02](../tasks/OPS-13.02.md), [WF-07.02](../tasks/WF-07.02.md), [FND-17.03](../tasks/FND-17.03.md) | PO | pending |
| [OPS-14.02](../tasks/OPS-14.02.md) | [OPS-14](../04-operations-assistant.md#ops-14) | Execute bounded assignment, lock and approval cards | [OPS-14.01](../tasks/OPS-14.01.md) | PO | pending |
| [OPS-14.03](../tasks/OPS-14.03.md) | [OPS-14](../04-operations-assistant.md#ops-14) | Execute authorized asset and account native confirmations | [OPS-14.02](../tasks/OPS-14.02.md) | PO | pending |
| [OPS-15.01](../tasks/OPS-15.01.md) | [OPS-15](../04-operations-assistant.md#ops-15) | Expose independent scoped workspace activity contract | [OPS-09.02](../tasks/OPS-09.02.md), [OPS-14.03](../tasks/OPS-14.03.md), [WF-10.02](../tasks/WF-10.02.md) | PO | pending |
| [OPS-15.02](../tasks/OPS-15.02.md) | [OPS-15](../04-operations-assistant.md#ops-15) | Wire trusted workspace forms and outcome projections | [OPS-15.01](../tasks/OPS-15.01.md) | PO | pending |
| [OPS-16.01](../tasks/OPS-16.01.md) | [OPS-16](../04-operations-assistant.md#ops-16) | Implement personal waiting-request and asset facts | [OPS-02.03](../tasks/OPS-02.03.md), [OPS-04.02](../tasks/OPS-04.02.md), [FND-16.03](../tasks/FND-16.03.md) | PO | pending |
| [OPS-16.02](../tasks/OPS-16.02.md) | [OPS-16](../04-operations-assistant.md#ops-16) | Implement Technician assigned and unclaimed team facts | [OPS-16.01](../tasks/OPS-16.01.md) | PO | pending |
| [OPS-17.01](../tasks/OPS-17.01.md) | [OPS-17](../04-operations-assistant.md#ops-17) | Implement current queue and cohort trend queries | [OPS-02.03](../tasks/OPS-02.03.md), [OPS-03.03](../tasks/OPS-03.03.md) | PO | pending |
| [OPS-17.02](../tasks/OPS-17.02.md) | [OPS-17](../04-operations-assistant.md#ops-17) | Implement active resolution and current workload facts | [OPS-17.01](../tasks/OPS-17.01.md) | PO | pending |
| [OPS-17.03](../tasks/OPS-17.03.md) | [OPS-17](../04-operations-assistant.md#ops-17) | Implement warranty window and report projection scope | [OPS-17.02](../tasks/OPS-17.02.md) | PO | pending |
| [OPS-18.01](../tasks/OPS-18.01.md) | [OPS-18](../04-operations-assistant.md#ops-18) | Implement work, capacity and action fact queries | [AI-07.02](../tasks/AI-07.02.md), [OPS-07.02](../tasks/OPS-07.02.md) | PO | pending |
| [OPS-18.02](../tasks/OPS-18.02.md) | [OPS-18](../04-operations-assistant.md#ops-18) | Implement sourced AI usage and cost reporting | [OPS-18.01](../tasks/OPS-18.01.md) | PO | pending |
| [OPS-19.01](../tasks/OPS-19.01.md) | [OPS-19](../04-operations-assistant.md#ops-19) | Implement allowlisted metric intent-to-query tool | [OPS-08.03](../tasks/OPS-08.03.md), [OPS-17.03](../tasks/OPS-17.03.md), [OPS-18.02](../tasks/OPS-18.02.md) | PO | pending |
| [OPS-19.02](../tasks/OPS-19.02.md) | [OPS-19](../04-operations-assistant.md#ops-19) | Generate explanations with native fact parity | [OPS-19.01](../tasks/OPS-19.01.md) | PO | pending |

### Phase C — Real integration

| Task | Parent | Deliverable | Depends on | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| [INT-01.01](../tasks/INT-01.01.md) | [INT-01](../07-integration.md#int-01) | Replace mock identity with real cookie-session adapter | [FND-07.02](../tasks/FND-07.02.md), [FND-17.03](../tasks/FND-17.03.md) | PO | pending |
| [INT-01.02](../tasks/INT-01.02.md) | [INT-01](../07-integration.md#int-01) | Connect profile, password and administrator flows | [INT-01.01](../tasks/INT-01.01.md) | PO | pending |
| [INT-01.03](../tasks/INT-01.03.md) | [INT-01](../07-integration.md#int-01) | Verify identity-scoped query and error lifecycle | [INT-01.02](../tasks/INT-01.02.md) | PO | pending |
| [INT-02.01](../tasks/INT-02.01.md) | [INT-02](../07-integration.md#int-02) | Connect real ticket search, create and native actions | [INT-01.03](../tasks/INT-01.03.md), [OPS-04.02](../tasks/OPS-04.02.md), [OPS-05.03](../tasks/OPS-05.03.md) | PO | pending |
| [INT-02.02](../tasks/INT-02.02.md) | [INT-02](../07-integration.md#int-02) | Connect private attachment upload and outcome recovery | [INT-02.01](../tasks/INT-02.01.md) | PO | pending |
| [INT-02.03](../tasks/INT-02.03.md) | [INT-02](../07-integration.md#int-02) | Connect real SLA and recipient notification projections | [INT-02.02](../tasks/INT-02.02.md) | PO | pending |
| [INT-03.01](../tasks/INT-03.01.md) | [INT-03](../07-integration.md#int-03) | Connect real workforce, plans and task commands | [INT-01.03](../tasks/INT-01.03.md), [AI-08.02](../tasks/AI-08.02.md) | PO | pending |
| [INT-03.02](../tasks/INT-03.02.md) | [INT-03](../07-integration.md#int-03) | Connect policies, exception decisions and live run activity | [INT-03.01](../tasks/INT-03.01.md) | PO | pending |
| [INT-03.03](../tasks/INT-03.03.md) | [INT-03](../07-integration.md#int-03) | Verify independent background operational effects | [INT-03.02](../tasks/INT-03.02.md) | PO | pending |
| [INT-04.01](../tasks/INT-04.01.md) | [INT-04](../07-integration.md#int-04) | Connect scoped asset records and ticket pickers | [INT-02.03](../tasks/INT-02.03.md), [OPS-02.03](../tasks/OPS-02.03.md) | PO | pending |
| [INT-04.02](../tasks/INT-04.02.md) | [INT-04](../07-integration.md#int-04) | Connect atomic issue, return and state outcomes | [INT-04.01](../tasks/INT-04.01.md) | PO | pending |
| [INT-05.01](../tasks/INT-05.01.md) | [INT-05](../07-integration.md#int-05) | Connect real KB, retrieval, chat ownership and availability | [INT-03.03](../tasks/INT-03.03.md), [INT-04.02](../tasks/INT-04.02.md), [OPS-15.02](../tasks/OPS-15.02.md), [OPS-19.02](../tasks/OPS-19.02.md) | PO | pending |
| [INT-05.02](../tasks/INT-05.02.md) | [INT-05](../07-integration.md#int-05) | Connect confirmed native action cards and independent activity | [INT-05.01](../tasks/INT-05.01.md) | PO | pending |
| [INT-05.03](../tasks/INT-05.03.md) | [INT-05](../07-integration.md#int-05) | Verify cited generation and safe provider failures | [INT-05.02](../tasks/INT-05.02.md) | PO | pending |
| [INT-06.01](../tasks/INT-06.01.md) | [INT-06](../07-integration.md#int-06) | Connect role dashboards and reconciled report facts | [INT-05.03](../tasks/INT-05.03.md), [OPS-16.02](../tasks/OPS-16.02.md) | PO | pending |
| [INT-06.02](../tasks/INT-06.02.md) | [INT-06](../07-integration.md#int-06) | Connect notifications, audit and complete adapter inventory | [INT-06.01](../tasks/INT-06.01.md) | PO | pending |

### Phase D — Whole-system acceptance

| Task | Parent | Deliverable | Depends on | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| [QA-01.01](../tasks/QA-01.01.md) | [QA-01](../05-acceptance.md#qa-01) | Run reproducible full-stack build and contract CI | [INT-06.02](../tasks/INT-06.02.md) | PO | pending |
| [QA-01.02](../tasks/QA-01.02.md) | [QA-01](../05-acceptance.md#qa-01) | Verify empty/upgrade migrations and release compatibility | [QA-01.01](../tasks/QA-01.01.md) | PO | pending |
| [QA-02.01](../tasks/QA-02.01.md) | [QA-02](../05-acceptance.md#qa-02) | Verify integrated authorization and source revocation | [QA-01.02](../tasks/QA-01.02.md) | PO | pending |
| [QA-02.02](../tasks/QA-02.02.md) | [QA-02](../05-acceptance.md#qa-02) | Verify concurrency, idempotency and outage recovery | [QA-02.01](../tasks/QA-02.01.md) | PO | pending |
| [QA-02.03](../tasks/QA-02.03.md) | [QA-02](../05-acceptance.md#qa-02) | Verify manual core continuity and regression closure | [QA-02.02](../tasks/QA-02.02.md) | PO | pending |
| [QA-03.01](../tasks/QA-03.01.md) | [QA-03](../05-acceptance.md#qa-03) | Verify responsive keyboard and accessibility journeys | [QA-01.02](../tasks/QA-01.02.md) | PO | pending |
| [QA-03.02](../tasks/QA-03.02.md) | [QA-03](../05-acceptance.md#qa-03) | Verify preserved input, polling and workspace interaction | [QA-03.01](../tasks/QA-03.01.md) | PO | pending |
| [QA-03.03](../tasks/QA-03.03.md) | [QA-03](../05-acceptance.md#qa-03) | Measure environment-specific performance and scan lag | [QA-03.02](../tasks/QA-03.02.md) | PO | pending |
| [QA-04.01](../tasks/QA-04.01.md) | [QA-04](../05-acceptance.md#qa-04) | Execute full native business acceptance journeys | [QA-02.03](../tasks/QA-02.03.md), [QA-03.03](../tasks/QA-03.03.md) | PO | pending |
| [QA-04.02](../tasks/QA-04.02.md) | [QA-04](../05-acceptance.md#qa-04) | Complete real-model RAG and assistant scenario evidence | [QA-04.01](../tasks/QA-04.01.md) | PO | pending |
| [QA-04.03](../tasks/QA-04.03.md) | [QA-04](../05-acceptance.md#qa-04) | Reconcile every acceptance gate and outstanding defect | [QA-04.02](../tasks/QA-04.02.md) | PO | pending |
| [QA-05.01](../tasks/QA-05.01.md) | [QA-05](../05-acceptance.md#qa-05) | Rehearse clean setup and controlled release startup | [QA-04.03](../tasks/QA-04.03.md), [PRE-04.02](../tasks/PRE-04.02.md) | PO | pending |
| [QA-05.02](../tasks/QA-05.02.md) | [QA-05](../05-acceptance.md#qa-05) | Rehearse isolated database and private-file restore | [QA-05.01](../tasks/QA-05.01.md) | PO | pending |
| [QA-05.03](../tasks/QA-05.03.md) | [QA-05](../05-acceptance.md#qa-05) | Finalize operations evidence and owner handover | [QA-05.02](../tasks/QA-05.02.md) | PO | pending |

## 3. Start and phase exit

FE-01.01 through FE-01.03 and FE-02.01/.02 are complete; FE-02.03 awaits PO review. FE-02.04 is the next sequential candidate after this review. Complete A1 foundations, then A2 core, A3 coordination/assistant and A4 visibility/handoff according to exact leaf dependencies. All frontend batches are already decomposed; refresh their assumptions at start.

Phase A exits at **FE-18.03** after all frontend output/checks are complete. Phase B decisions/services may then execute according to their leaf graph. Phase C integrates modules after named service outputs, and Phase D starts after integration readiness. A parent may await external integration evidence even when its service leaves are done; never leave those leaf tasks falsely “partially done.”

Evidence exists for completed tasks and the current FE-02.03 review; unopened tasks remain NOT RUN. See [current context](current-context.md), the [task template](task-template.md) and [coverage/closure](../package-task-coverage.md). Preserve stable IDs when later implementation discovers a justified refinement; record changed edges and evidence instead of silently broadening scope.

The owner-facing [latest task report](current-context.md#latest-task-report) is maintained only in current context; this board remains the task state/owner/dependency registry.
