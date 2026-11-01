---
id: itoh-db-contract
title: "Database — DBML and ER Mermaid"
type: reference
domain: database
module: schema
tags: [database, schema, design]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Define DBML, ER Mermaid, and the limits of the design schema."
---

# Database — DBML and ER Mermaid

**Target design; no database, DDL, or migration exists.** The [logical model](../requirements/conceptual-data-model.md) is authoritative for entities/cardinalities/invariants. PostgreSQL + synchronous SQLAlchemy + Alembic is retained.

## Scope and artifacts

| Artifact | Content | Status |
| --- | --- | --- |
| [schema.dbml](schema.dbml) | 52 logical entities, 59 column-level references | Design draft, selected fields |
| [ER Mermaid](../requirements/conceptual-data-model.md) | 11 views, PK/FK/cardinality and an overall graph | Authoritative relationship source |
| [ERD SVGs](../diagrams/README.md) | Domain previews | Derived |
| DDL/Alembic | Physical schema | Not created |

## Mappings and limits

DBML retains CamelCase names to match ER; physical snake_case table names require review. Proposed timestamps use timestamptz, JSON uses jsonb, and enum placeholders use varchar. Vector dimensions/models remain unset until approved. Nullable scalars in DBML indicate incomplete specification, not permission to bypass business validation. Mandatory/optional FK choices are proposals requiring refinement.

`AutomationRun.source_versions` and `ApprovalRequest.snapshot_versions` are JSON maps of multiple aggregates/versions; earlier selected int types were corrected to match snapshot contracts. TicketSLA.ticket_id is both PK and FK; intervals/violations reference it, without inventing TicketSLA.id. Ticket.asset_id and TicketSLA.policy_id make existing overall ER relationships explicit. Polymorphic actors/sources have no fabricated foreign keys.

DBML does not enforce minimum-child cardinality, actor XOR, DAGs, ACLs, partial uniqueness, or atomic capacity by itself. TicketCategory and complete user/ticket/file/workflow fields exist in the business specification but are incomplete in these selected views; complete physical contracts before M1. This is not a complete physical schema.

## Invariants and transaction controls

| Group | Implementation requirement |
| --- | --- |
| Plan | At most one Effective version per ticket; immutable history |
| Task | Dependencies within one version; no cycles/self-dependency; predecessors Done before start |
| Capacity | Verified skills/schedule/absence, remaining effort per period; atomic checks/reservations |
| Asset | One unreturned assignment per asset; partial uniqueness and transaction; preserve history |
| Actor/ACL | Separate human/service actors; immediate revocation; no cascading domain deletion through chat |
| Outbox/idempotency | Dedup by actor/action/target/digest and delivery purpose; replay does not duplicate effects |
| AI usage | Ledger includes actual, in-flight, unknown; run/message source XOR by call type |
| Knowledge | Immutable Published versions, current ACL; index is not an authorization source |

Missing verified schedules/skills/estimates lead to clarification/exception, not invented capacity. Locks/isolation, exact keys, retention, physical names/schema remain under [D-40](../decisions/design-decisions.md).

## Verification and sources

Check entity/field/reference endpoints against Mermaid. DBML CLI, PostgreSQL migrations, concurrency, and restore have not run. Documents are not uploaded to online diagram services.

[DBML syntax](https://dbml.dbdiagram.io/docs/) · [BR](../requirements/business-rules.md) · [API](../api/README.md) · [Architecture](../technical/architecture.md).

## D-42 — Shared UI does not merge entities

Conversations/messages/drafts remain separate from runs/actions/approvals; sharing a screen adds no authorization relationships or conversation-based deletion. ConfirmedCommand.result_ticket_id is only a ticket-creation result; other native action forms use existing aggregates/idempotency/audit. Filtered payload storage for action-card declarations/correlation requires D-40 schema review; no table/migration is created in this phase.
