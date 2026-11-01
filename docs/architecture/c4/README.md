---
id: itoh-c4-index
title: "C4 Documentation"
type: reference
domain: architecture
module: c4
tags: [architecture, c4, design]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: derived
purpose: "Link C1–C4 responsibilities, boundaries, and design evidence."
---

# C4 Documentation

**Target architecture / design-draft.** No application code or deployment exists. C4 Level 4 is a proposed code design, not reverse engineering. The project owner reviews it; detailed designs are not self-approved.

## Levels and authoritative sources

| Level | Question | Document |
| --- | --- | --- |
| C1 Context | Who uses the Hub, and which external systems interact with it? | [01-context](01-context.md) |
| C2 Container | How do running and storage units communicate? | [02-containers](02-containers.md) |
| C3 Components | What are the responsibilities inside the API/worker? | [03-components](03-components.md) |
| C4 Code | How does a command coordinate policy/service/repository? | [04-code](04-code.md) |
| Dynamic | How do snapshot/model/approval/transaction/retry interact? | [Sequence sources](../../diagrams/architecture.md) |
| Deployment | How are one origin, queues, storage, and recovery arranged? | [Topology](../../diagrams/deployment-topology.svg), [architecture](../../technical/architecture.md) |

Existing context/container/deployment views are reused, rather than defining a parallel system. Mermaid flowchart/class notation represents C4 levels; this is not a claim of Structurizr DSL or certified UML. The authoritative architecture source is technical/architecture.md; C4 views explain the same boundaries.

## Constraints and decisions

One organization, R/T/M/A, no IT Team Lead. AI_COORDINATOR is internal, not a fifth human actor. Next.js UI contains no domain/DB logic; FastAPI owns APIs with synchronous SQLAlchemy/Alembic/PostgreSQL. Workers share domain services rather than impersonating Admin over HTTP. Redis is a broker, not the system of record. One Beat; SLA queues are separate from model queues. KB pgvector uses current ACLs. No transaction spans a model call.

## Verification and limits

Mermaid sources and SVGs are checked for rendering/references. Module ownership, trust boundaries, transactions, and failure paths are compared with BR/NFR/API. No runtime, application tests, independent review, or C4 certification exists. Physical cookie/DTO details, calendar/capacity, production provider/retention/budget, and RPO/RTO/hosting remain under D-40.

[C4 model diagrams](https://c4model.com/diagrams) · [Stack](../../technical/tech-stack.md) · [Proposed code structure](../../technical/code-structure.md).
