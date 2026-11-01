---
id: itoh-docs-requirements-conceptual-data-model
title: "Target data model and ERD"
type: reference
domain: database
module: domain-model
tags: [database, domain-model, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Define logical entities, relationships, cardinalities, invariants, and data lifecycles."
---

# Target data model and ERD

**31 October 2026 · Logical model, not a running schema/DDL/migration.** Retain core entities and add work management/workforce/automation/knowledge. Physical fields/types/indexes need PostgreSQL + SQLAlchemy + Alembic refinement, not Django ORM.

## Core entities

| Entity | Data/constraints |
| --- | --- |
| User / Department | Normalized unique email, role/active/department/version; Argon2id; preserve history |
| Session | User, opaque token hash, expiry/revoked, CSRF; user lock revokes sessions |
| Team / TeamMembership / TicketCategory | Active/intake, current membership; referenced history retained |
| Ticket | Requester/type/category/impact/urgency/priority/team/assignee/asset/status/version; workflow goal/deadline/structured data where applicable |
| TicketComment / TicketEvent / Attachment | Visibility, actor, content/old-new-reason events, private object keys; parent authorization |
| SLAPolicy / TicketSLA / SLAInterval / SLAViolation | P1–P4 snapshot, clocks/elapsed/first response, adjustment revision, breach/dedup |
| Asset / AssetAssignment | Code/serial/model/warranty/status; user/department snapshot/actor/returnedAt; at most one active assignment |
| Notification / AuditLog | Recipient/event/readAt; redacted actor/time/before-after/reason; current scope |

## Work, workforce, automation, and AI entities

| Entity | Data/constraints |
| --- | --- |
| WorkPlan / PlanVersion | Ticket/goal/version/Draft/Effective/Superseded/Cancelled/sources; one Effective version per ticket; immutable previous versions |
| Task | PlanVersion/title/team/assignee/state/version/estimated-remaining minutes/earliestStart/deadline/skills/result/assignment lock-actor-reason |
| TaskDependency | Task/predecessor in same version; no self/cycle; required predecessors Done before Ready/start |
| TaskSkillRequirement | Task/skill/optional minimum level/source; verified taxonomy, no inferred certifications |
| Skill / UserSkill | Standard label/optional level/verifier/time/version; unverified skill not automatically eligible |
| WorkCalendar / AvailabilityException | User/timezone/work intervals/weekdays/absence/version; not attendance tracking |
| CapacityPeriod / WorkAllocation | User/period/capacity; task/version remaining by period/slot; total within absence-adjusted capacity |
| WorkflowTemplate / TemplateVersion | Workflow/Published-Draft-Retired/reviewed steps-DAG-skills-effort/sources/version; model estimates not automatically verified |
| AutomationPolicy / PolicyVersion | Enabled/workflow/team/priority/action/limits/grantor/expiry/version; default deny |
| ServiceIdentity / PolicyGrant | AI_COORDINATOR/scoped grants/grantor; no generic Admin login |
| DomainEvent / OutboxDelivery | Event ID/type/aggregate/version/correlation/actor/minimal payload; attempt/lease/nextAttempt/result |
| AutomationRun / AutomationAction | Event/purpose/policy/grantor/source/model-prompt versions/snapshot/proposal-tool intent/target/idempotency/result/error/usage |
| ApprovalRequest / ApprovalDecision | Before-after/impact/reason/snapshot; owner/decider/decision; decision separate from execution |
| AIConversation / AIMessage / AISourceReference / AIDraft | Owner/visibility/context/source-version-ACL; drafts are not domain entities |
| ConfirmedCommand | User/preview digest-version/confirmation-TTL/idempotency/result reference; same key/different content conflicts |
| KnowledgeArticle / KnowledgeVersion / KnowledgeACL | Draft/Published/Retired/immutable versions/owner-publisher-read scope; immediate revocation |
| KnowledgeChunk / KnowledgeEmbedding | Version/chunk/vector/model/dimension/index state; current ACL still checked |
| AIUsage / AIBudgetLedger | Run/request/input-output-cached-reasoning usage if provided/price-version-date/reserved-actual-unknown cost/quota-calls |

[DBML/schema mapping](../database/README.md) provides selected fields, not DDL/migrations. source_versions/snapshot_versions maps are multi-aggregate/version JSON, not integers.

## Logical ERD

Views separate domains to show entities/keys/cardinality. Selected fields are not the full schema. Logical names/types require SQLAlchemy/Alembic review; physical nullability/indexes/FKs/naming remain open. Repeated entities are the same entity, not new tables. Preserve overall-source cardinalities.

| View | Scope |
| --- | --- |
| FIG-ERD02 | [Identity and organization](../diagrams/erd-identity.svg) |
| FIG-ERD03 | [Tickets, conversations, and files](../diagrams/erd-ticket-sla.svg) |
| FIG-ERD04 | [Assets and assignment history](../diagrams/erd-assets.svg) |
| FIG-ERD05 | [Plans, tasks, and dependencies](../diagrams/erd-work-plans.svg) |
| FIG-ERD06 | [Skills, schedules, and allocations](../diagrams/erd-workforce.svg) |
| FIG-ERD07 | [Policies, versions, and grants](../diagrams/erd-policy.svg) |
| FIG-ERD08 | [Events, execution, and audit](../diagrams/erd-execution.svg) |
| FIG-ERD09 | [Knowledge, ACL, and indexing](../diagrams/erd-knowledge.svg) |
| FIG-ERD10 | [Conversations and source references](../diagrams/erd-assistant.svg) |
| FIG-ERD11 | [Ticket confirmation and AI costs](../diagrams/erd-confirmation-usage.svg) |
| FIG-ERD12 | [SLA snapshots and clocks](../diagrams/erd-sla-clocks.svg) |


TaskDependency endpoints are task/predecessor in the same version. Actor/source fields are typed logical references, not promised polymorphic FKs. External entities repeat for context. Actor/usage-source/partial-unique rules are below.

### FIG-ERD02 — Identity and organization

![Identity and organization](../diagrams/erd-identity.svg)

<details>
<summary>Mermaid source and cardinality</summary>

```mermaid
erDiagram
    direction TB
    Department {
        uuid id PK
        string name
        boolean active
    }
    Session {
        uuid id PK
        uuid user_id FK
        string token_hash
        datetime expires_at
        datetime revoked_at
    }
    Team {
        uuid id PK
        string name
        boolean active
    }
    TeamMembership {
        uuid id PK
        uuid team_id FK
        uuid user_id FK
        boolean active
    }
    Ticket {
        uuid id PK
        uuid requester_id FK
        uuid team_id FK
        enum status
        enum priority
        int version
    }
    User {
        uuid id PK
        uuid department_id FK
        enum role
        boolean active
        int version
    }
    Department ||--o{ User : contains
    User ||--o{ Session : authenticates
    User ||--o{ TeamMembership : joins
    Team ||--o{ TeamMembership : includes
    User ||--o{ Ticket : requests
    Team ||--o{ Ticket : handles
```

</details>

### FIG-ERD03 — Tickets, conversations, and files

![Tickets, conversations, and files](../diagrams/erd-ticket-sla.svg)

<details>
<summary>Mermaid source and cardinality</summary>

```mermaid
erDiagram
    direction TB
    Attachment {
        uuid id PK
        uuid ticket_id FK
        string private_object_key
        enum parent_visibility
        int size_bytes
    }
    Ticket {
        uuid id PK
        uuid requester_id FK
        uuid team_id FK
        enum status
        enum priority
        int version
    }
    TicketComment {
        uuid id PK
        uuid ticket_id FK
        enum visibility
        string content
        datetime created_at
    }
    TicketEvent {
        uuid id PK
        uuid ticket_id FK
        string event_type
        enum visibility
        datetime occurred_at
    }
    Ticket ||--o{ TicketComment : discusses
    Ticket ||--o{ TicketEvent : records
    Ticket ||--o{ Attachment : protects
```

</details>

### FIG-ERD04 — Assets and assignment history

![Assets and assignment history](../diagrams/erd-assets.svg)

<details>
<summary>Mermaid source and cardinality</summary>

```mermaid
erDiagram
    direction LR
    Asset {
        uuid id PK
        string code
        string serial
        enum status
        int version
    }
    AssetAssignment {
        uuid id PK
        uuid asset_id FK
        uuid user_id FK
        datetime assigned_at
        datetime returned_at
    }
    Ticket {
        uuid id PK
        uuid requester_id FK
        uuid team_id FK
        enum status
        enum priority
        int version
    }
    User {
        uuid id PK
        uuid department_id FK
        enum role
        boolean active
        int version
    }
    User ||--o{ Ticket : requests
    Asset ||--o{ AssetAssignment : tracks
    User ||--o{ AssetAssignment : receives
    Ticket }o--o| Asset : references
```

</details>

### FIG-ERD05 — Plans, tasks, and dependencies

![Plans, tasks, and dependencies](../diagrams/erd-work-plans.svg)

<details>
<summary>Mermaid source and cardinality</summary>

```mermaid
erDiagram
    direction TB
    PlanVersion {
        uuid id PK
        uuid work_plan_id FK
        uuid template_version_id FK
        int revision
        enum state
        json sources
    }
    Skill {
        uuid id PK
        string name
        boolean active
    }
    Task {
        uuid id PK
        uuid plan_version_id FK
        enum status
        int estimated_minutes
        int remaining_minutes
        int version
    }
    TaskDependency {
        uuid id PK
        uuid task_id FK
        uuid predecessor_id FK
    }
    TaskSkillRequirement {
        uuid id PK
        uuid task_id FK
        uuid skill_id FK
        string required_level
    }
    TemplateVersion {
        uuid id PK
        uuid template_id FK
        int revision
        enum state
        json steps_dag
    }
    Ticket {
        uuid id PK
        uuid requester_id FK
        uuid team_id FK
        enum status
        enum priority
        int version
    }
    WorkPlan {
        uuid id PK
        uuid ticket_id FK
        string goal
    }
    WorkflowTemplate {
        uuid id PK
        string workflow_type
        boolean active
    }
    Ticket ||--o{ WorkPlan : scopes
    WorkPlan ||--|{ PlanVersion : versions
    PlanVersion ||--o{ Task : defines
    Task ||--o{ TaskDependency : depends
    Task ||--o{ TaskDependency : predecessor
    Task ||--o{ TaskSkillRequirement : requires
    Skill ||--o{ TaskSkillRequirement : specifies
    WorkflowTemplate ||--|{ TemplateVersion : versions
    TemplateVersion ||--o{ PlanVersion : informs
```

</details>

### FIG-ERD06 — Skills, schedules, and allocations

![Skills, schedules, and allocations](../diagrams/erd-workforce.svg)

<details>
<summary>Mermaid source and cardinality</summary>

```mermaid
erDiagram
    direction TB
    AvailabilityException {
        uuid id PK
        uuid calendar_id FK
        datetime starts_at
        datetime ends_at
        int version
    }
    CapacityPeriod {
        uuid id PK
        uuid calendar_id FK
        datetime starts_at
        datetime ends_at
        int budget_minutes
    }
    Skill {
        uuid id PK
        string name
        boolean active
    }
    Task {
        uuid id PK
        uuid plan_version_id FK
        enum status
        int estimated_minutes
        int remaining_minutes
        int version
    }
    User {
        uuid id PK
        uuid department_id FK
        enum role
        boolean active
        int version
    }
    UserSkill {
        uuid id PK
        uuid user_id FK
        uuid skill_id FK
        datetime verified_at
        int version
    }
    WorkAllocation {
        uuid id PK
        uuid task_id FK
        uuid user_id FK
        json period_allocations
        int reserved_minutes
    }
    WorkCalendar {
        uuid id PK
        uuid user_id FK
        string timezone
        json work_intervals
        int version
    }
    Task ||--o{ WorkAllocation : reserves
    User ||--o{ WorkAllocation : receives
    User ||--o{ UserSkill : verifies
    Skill ||--o{ UserSkill : labels
    User ||--o{ WorkCalendar : schedules
    WorkCalendar ||--o{ AvailabilityException : excludes
    WorkCalendar ||--o{ CapacityPeriod : budgets
```

</details>

### FIG-ERD07 — Policies, versions, and grants

![Policies, versions, and grants](../diagrams/erd-policy.svg)

<details>
<summary>Mermaid source and cardinality</summary>

```mermaid
erDiagram
    direction TB
    AutomationPolicy {
        uuid id PK
        boolean enabled
        string workflow_scope
    }
    AutomationRun {
        uuid id PK
        uuid event_id FK
        uuid policy_version_id FK
        enum status
        json source_versions
    }
    PolicyGrant {
        uuid id PK
        uuid policy_version_id FK
        uuid grantor_user_id FK
        uuid service_identity_id FK
        json scope
    }
    PolicyVersion {
        uuid id PK
        uuid policy_id FK
        int revision
        json actions_limits
        datetime expires_at
    }
    ServiceIdentity {
        uuid id PK
        string name
        boolean active
    }
    User {
        uuid id PK
        uuid department_id FK
        enum role
        boolean active
        int version
    }
    AutomationPolicy ||--|{ PolicyVersion : versions
    User ||--o{ PolicyGrant : authorizes
    ServiceIdentity ||--o{ PolicyGrant : receives
    PolicyVersion ||--o{ PolicyGrant : restricts
    PolicyVersion ||--o{ AutomationRun : governs
```

</details>

### FIG-ERD08 — Events, execution, and audit

![Events, execution, and audit](../diagrams/erd-execution.svg)

<details>
<summary>Mermaid source and cardinality</summary>

```mermaid
erDiagram
    direction TB
    ApprovalDecision {
        uuid id PK
        uuid approval_id FK
        uuid decider_user_id FK
        enum decision
        string reason
    }
    ApprovalRequest {
        uuid id PK
        uuid action_id FK
        json before_after
        json snapshot_versions
        string decision_status
    }
    AuditLog {
        uuid id PK
        enum actor_type
        string actor_reference
        uuid action_id FK
        json before_after_redacted
    }
    AutomationAction {
        uuid id PK
        uuid run_id FK
        uuid target_id
        string intent_key
        enum result
    }
    AutomationRun {
        uuid id PK
        uuid event_id FK
        uuid policy_version_id FK
        enum status
        json source_versions
    }
    DomainEvent {
        uuid id PK
        string event_type
        uuid aggregate_id
        int aggregate_version
        uuid correlation_id
    }
    Notification {
        uuid id PK
        uuid event_id FK
        uuid recipient_id FK
        datetime read_at
    }
    OutboxDelivery {
        uuid id PK
        uuid event_id FK
        string handler_purpose
        int attempt
        datetime lease_until
    }
    ServiceIdentity {
        uuid id PK
        string name
        boolean active
    }
    User {
        uuid id PK
        uuid department_id FK
        enum role
        boolean active
        int version
    }
    DomainEvent ||--o{ OutboxDelivery : delivers
    DomainEvent ||--o{ AutomationRun : triggers
    AutomationRun ||--o{ AutomationAction : executes
    AutomationAction ||--o{ ApprovalRequest : requests
    ApprovalRequest ||--o{ ApprovalDecision : decides
    DomainEvent ||--o{ Notification : notifies
    AutomationAction o|--o{ AuditLog : traces
    User o|--o{ AuditLog : human_actor
    ServiceIdentity o|--o{ AuditLog : service_actor
```

</details>

### FIG-ERD09 — Knowledge, ACL, and indexing

![Knowledge, ACL, and indexing](../diagrams/erd-knowledge.svg)

<details>
<summary>Mermaid source and cardinality</summary>

```mermaid
erDiagram
    direction LR
    KnowledgeACL {
        uuid id PK
        uuid article_id FK
        json audience
        int version
    }
    KnowledgeArticle {
        uuid id PK
        string title
        enum state
        string owner_reference
    }
    KnowledgeChunk {
        uuid id PK
        uuid source_version_id FK
        int sequence_no
        string text
    }
    KnowledgeEmbedding {
        uuid id PK
        uuid chunk_id FK
        string model
        int dimension
        vector embedding_vector
        enum index_state
    }
    KnowledgeVersion {
        uuid id PK
        uuid article_id FK
        int revision
        enum state
        string content
    }
    KnowledgeArticle ||--|{ KnowledgeVersion : versions
    KnowledgeArticle ||--o{ KnowledgeACL : restricts
    KnowledgeVersion ||--o{ KnowledgeChunk : chunks
    KnowledgeChunk ||--o{ KnowledgeEmbedding : indexes
```

</details>

### FIG-ERD10 — Conversations and source references

![Conversations and source references](../diagrams/erd-assistant.svg)

<details>
<summary>Mermaid source and cardinality</summary>

```mermaid
erDiagram
    direction TB
    AIConversation {
        uuid id PK
        uuid owner_id FK
        enum visibility
        datetime created_at
    }
    AIDraft {
        uuid id PK
        uuid conversation_id FK
        string preview_digest
        int version
        datetime expires_at
    }
    AIMessage {
        uuid id PK
        uuid conversation_id FK
        enum role
        string content_redacted
    }
    AISourceReference {
        uuid id PK
        uuid message_id FK
        string source_reference
        int source_version
    }
    User {
        uuid id PK
        uuid department_id FK
        enum role
        boolean active
        int version
    }
    User ||--o{ AIConversation : owns
    AIConversation ||--o{ AIMessage : contains
    AIMessage ||--o{ AISourceReference : cites
    AIConversation ||--o{ AIDraft : prepares
```

</details>

### FIG-ERD11 — Ticket confirmation and AI costs

![Ticket confirmation and AI costs](../diagrams/erd-confirmation-usage.svg)

<details>
<summary>Mermaid source and cardinality</summary>

```mermaid
erDiagram
    direction TB
    AIBudgetLedger {
        uuid id PK
        decimal hard_cap
        decimal actual_spent
        decimal reserved_in_flight
        decimal unknown_cost
    }
    AIMessage {
        uuid id PK
        uuid conversation_id FK
        enum role
        string content_redacted
    }
    AIUsage {
        uuid id PK
        uuid budget_ledger_id FK
        uuid run_id FK
        uuid message_id FK
        enum cost_state
        decimal actual_cost
        decimal reserved_cost
    }
    AutomationRun {
        uuid id PK
        uuid event_id FK
        uuid policy_version_id FK
        enum status
        json source_versions
    }
    ConfirmedCommand {
        uuid id PK
        uuid actor_user_id FK
        string preview_digest
        string idempotency_key
        uuid result_ticket_id FK
    }
    Ticket {
        uuid id PK
        uuid requester_id FK
        uuid team_id FK
        enum status
        enum priority
        int version
    }
    User {
        uuid id PK
        uuid department_id FK
        enum role
        boolean active
        int version
    }
    User ||--o{ Ticket : requests
    User ||--o{ ConfirmedCommand : confirms
    ConfirmedCommand }o--o| Ticket : creates
    AutomationRun o|--o{ AIUsage : incurs
    AIMessage o|--o{ AIUsage : incurs
    AIBudgetLedger ||--o{ AIUsage : accounts
```

</details>

### FIG-ERD12 — SLA snapshots and clocks

![SLA snapshots and clocks](../diagrams/erd-sla-clocks.svg)

<details>
<summary>Mermaid source and cardinality</summary>

```mermaid
erDiagram
    direction TB
    SLAInterval {
        uuid id PK
        uuid ticket_sla_id FK
        enum clock_type
        datetime starts_at
        datetime ends_at
    }
    SLAPolicy {
        uuid id PK
        int policy_version
        json priority_budgets
        boolean active
    }
    SLAViolation {
        uuid id PK
        uuid ticket_sla_id FK
        enum clock_type
        int threshold
        datetime breached_at
    }
    Ticket {
        uuid id PK
        uuid requester_id FK
        uuid team_id FK
        enum status
        enum priority
        int version
    }
    TicketSLA {
        uuid ticket_id PK, FK
        json budget_snapshot
        int response_used
        int resolution_used
        int adjustment_revision
    }
    Ticket ||--|| TicketSLA : snapshots
    TicketSLA ||--o{ SLAInterval : accumulates
    TicketSLA ||--o{ SLAViolation : retains
    SLAPolicy ||--o{ TicketSLA : supplies
```

</details>

### FIG-ERD01 — Overall relationship list

<details>
<summary>All relationships used to reconcile domain views</summary>

```mermaid
erDiagram
    Department ||--o{ User : contains
    User ||--o{ Session : authenticates
    User ||--o{ TeamMembership : joins
    Team ||--o{ TeamMembership : includes
    User ||--o{ Ticket : requests
    Team ||--o{ Ticket : handles
    Ticket ||--|| TicketSLA : snapshots
    Ticket ||--o{ TicketComment : discusses
    Ticket ||--o{ TicketEvent : records
    Ticket ||--o{ Attachment : protects
    TicketSLA ||--o{ SLAInterval : accumulates
    TicketSLA ||--o{ SLAViolation : retains
    SLAPolicy ||--o{ TicketSLA : supplies
    Asset ||--o{ AssetAssignment : tracks
    User ||--o{ AssetAssignment : receives
    Ticket }o--o| Asset : references
    Ticket ||--o{ WorkPlan : scopes
    WorkPlan ||--|{ PlanVersion : versions
    PlanVersion ||--o{ Task : defines
    Task ||--o{ TaskDependency : depends
    Task ||--o{ TaskDependency : predecessor
    Task ||--o{ TaskSkillRequirement : requires
    Skill ||--o{ TaskSkillRequirement : specifies
    Task ||--o{ WorkAllocation : reserves
    User ||--o{ WorkAllocation : receives
    User ||--o{ UserSkill : verifies
    Skill ||--o{ UserSkill : labels
    User ||--o{ WorkCalendar : schedules
    WorkCalendar ||--o{ AvailabilityException : excludes
    WorkCalendar ||--o{ CapacityPeriod : budgets
    WorkflowTemplate ||--|{ TemplateVersion : versions
    TemplateVersion ||--o{ PlanVersion : informs
    AutomationPolicy ||--|{ PolicyVersion : versions
    User ||--o{ PolicyGrant : authorizes
    ServiceIdentity ||--o{ PolicyGrant : receives
    PolicyVersion ||--o{ PolicyGrant : restricts
    DomainEvent ||--o{ OutboxDelivery : delivers
    DomainEvent ||--o{ AutomationRun : triggers
    PolicyVersion ||--o{ AutomationRun : governs
    AutomationRun ||--o{ AutomationAction : executes
    AutomationAction ||--o{ ApprovalRequest : requests
    ApprovalRequest ||--o{ ApprovalDecision : decides
    KnowledgeArticle ||--|{ KnowledgeVersion : versions
    KnowledgeArticle ||--o{ KnowledgeACL : restricts
    KnowledgeVersion ||--o{ KnowledgeChunk : chunks
    KnowledgeChunk ||--o{ KnowledgeEmbedding : indexes
    User ||--o{ AIConversation : owns
    AIConversation ||--o{ AIMessage : contains
    AIMessage ||--o{ AISourceReference : cites
    AIConversation ||--o{ AIDraft : prepares
    User ||--o{ ConfirmedCommand : confirms
    ConfirmedCommand }o--o| Ticket : creates
    AutomationRun o|--o{ AIUsage : incurs
    AIMessage o|--o{ AIUsage : incurs
    AIBudgetLedger ||--o{ AIUsage : accounts
    DomainEvent ||--o{ Notification : notifies
    AutomationAction o|--o{ AuditLog : traces
    User o|--o{ AuditLog : human_actor
    ServiceIdentity o|--o{ AuditLog : service_actor
```

</details>

## Versions, constraints, authorization

Do not make Ticket→Plan globally unique: retain history with one conditionally unique effective version. TaskDependency is same-version, service-validated DAG before commit. Plan changes review active/locked tasks rather than replacing performed work. AssetAssignment partial uniqueness applies where returnedAt is null; optional inventory reservation needs a separate undecided lifecycle/entity under D-40.

Allocation checks/writes use resource transactions/locks, not model workload numbers. Events/actions/confirmed commands/notifications have architectural unique business keys; mutations are versioned. No chat/KB/vector cascade deletes of domain records. Retention/tombstones/audit require policy.

Requester projections exclude workforce/internal plans/actions/approvals. Current KB ACL overrides stale vectors/caches; citations reference readable versions. Service identities/grantors differ from humans. Decide physical schema/index/isolation/exact names before implementation.

## Relationship dictionary and cross-entity invariants

FIG-ERD01 uses crow's-foot: `||` exactly one, `o|` zero/one, `o{` zero/many, `|{` one/many. Task–TaskDependency edges represent `task_id`/`predecessor_id`, not two tables. Dictionary entities without diagram fields do not imply CRUD.

| Relationship / invariant | Logical meaning | Proposed enforcement |
| --- | --- | --- |
| Ticket → WorkPlan → PlanVersion | Proposal history; one effective version per ticket | Transactions/versions/conditional uniqueness; physical key refinement |
| TaskDependency endpoints | Same version, no self/cycle, predecessor Done before Ready/start | FKs/checks plus service DAG/state validation, not frontend-only |
| Task → TaskSkillRequirement → Skill | Required skills differ from verified user skills | Standard taxonomy/server eligibility/version rechecks |
| Task → WorkAllocation → User | Scheduled remaining effort per period within current capacity | Atomic calendar/absence/load locks/rechecks; schedule edits share ordering |
| Asset → AssetAssignment | Many historical, at most one unreturned | Partial unique/transaction; reservations separate/undecided |
| PolicyVersion / PolicyGrant → Run/Action | Preserve used authorization evidence; current rights still rechecked | Grantor/scope/expiry/active/version; audit is not authority |
| Approval → Decision/execution | Immutable decision/decider, separate effect result | Snapshot/transition guards/action idempotency; Approved ≠ Succeeded |
| AIUsage → Run or AIMessage | Automation/assistant charges; retries separate usage | Typed request/run/message sources; not every chat needs a run |
| AuditLog → User or ServiceIdentity | Manual/automatic actors, optional action reference | Human User versus service identity/grantor; not every audit needs action |
| KB version/chunk/embedding | Derived data does not own reading rights | Current source article/version ACL; no retained revoked cache/index permissions |

## Lifecycles, storage, deletion

Deleting chat/vectors never cascades to Ticket/Task/AssetAssignment/AuditLog/event history. Locked users retain historical references with immediate session/access revocation. Published/Effective versions/recorded decisions retain historical content; new linked versions/decisions replace them.

Conversation deletion follows approved chat retention; ConfirmedCommand/domain results retain required dedup/audit evidence. Files need stage/finalize/reconciliation since DB cannot roll back objects. KB revocation blocks reads before chunk/cache cleanup. Retention/anonymization/tombstones/purge/key-ledger lifetimes remain D-40; no deletion jobs/migrations exist.

[Business rules](business-rules.md) · [Permissions](permissions-matrix.md) · [Architecture/transactions](../technical/architecture.md) · [API design](../technical/api-design.md).

## Shared-workspace action cards — D-42

Action cards are AssistantResult/message/draft UI declarations under owner/resource scope, not permission-granting entities. ConfirmedCommand/result_ticket_id retain ticket-draft meaning. Other forms store domain aggregate/audit/idempotency results, not tasks/assets/approvals in result_ticket_id. Redacted conversation/message/card correlation grants no chat access. Physical card storage/redaction/retention needs D-40 refinement; selected ERDs are not migrations. Automation event/run lifetimes do not depend on conversations.
