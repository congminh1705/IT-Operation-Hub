---
id: itoh-c4-containers
title: "C2 — Container"
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
purpose: "Define runtime units, protocols, and systems of record."
---

# C2 — Container

**Target containers; not deployed.** Reuses FIG-CNT01 in the [Mermaid source](../../diagrams/architecture.md).

![C2 — Containers](../../diagrams/system-containers.svg)

## Container catalog

| Container | Technology / responsibility | Protocol / data |
| --- | --- | --- |
| Web UI | Next.js/React/TypeScript, navigation/forms/queries | Same-origin HTTPS to /api/v1; no DB access |
| API | FastAPI/Pydantic, auth/scope/domain HTTP | JSON/multipart; session cookie + CSRF |
| Worker | Celery, shared domain services, separate Session per job | Redis delivery/ack, PostgreSQL transaction, provider HTTPS |
| Scheduler | One Celery Beat | Enqueues periodic jobs; does not change business state itself |
| Broker | Redis | At-least-once delivery; not the sole durable event/session store |
| Database | PostgreSQL/pgvector, domain/session/outbox/audit/KB/usage | Synchronous SQLAlchemy via Psycopg; ACL remains in the domain |
| Private file store | Local development / proposed private S3 in production | API checks parent-record access; DB/object-store reconciliation |
| Reverse proxy | Nginx/TLS, one origin | /api → API; other paths → Next.js |

The provider is an external software system. ProviderAdapter is a backend/worker component, not an independent microservice/container. Monolith modules are not automatically containers.

## Reliability and deployment

Persist the outbox/event before publishing; workers claim/deduplicate/re-read before effects and acknowledge after commit. Model calls run outside database transactions. Separate SLA/notification/indexing queues from AI so slow providers do not block clocks. One Beat does not mean one worker. Database failure makes readiness fail; provider failure degrades AI while core features remain usable if core dependencies are healthy.

[Deployment topology](../../diagrams/deployment-topology.svg) describes the logical layout. VPS/HA/capacity/RPO/RTO/ownership remain D-40 decisions. Do not hard-code production addresses.

## Related documents

[Architecture](../../technical/architecture.md) · [API](../../api/README.md) · [C3](03-components.md).

## D-42 — One frontend workspace

Chat/action forms and activity share the Web UI screen. FastAPI retains assistant preparation and domain APIs; Celery runs event/policy automation independently of browser/chat lifetimes. Model/adapters may be shared, with separate contexts, actors, tool grants, and limits. A unified UI does not create a new container. See [flows and permissions](../../10-ai-assistant.md).
