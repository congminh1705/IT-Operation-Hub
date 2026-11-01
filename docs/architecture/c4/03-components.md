---
id: itoh-c4-components
title: "C3 — API and worker components"
type: reference
domain: architecture
module: c4
tags: [architecture, c4, design]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Assign responsibilities inside the API and worker, including failure and transaction boundaries."
---

# C3 — API and worker components

**Target design.** These components belong to a modular monolith, not separate microservices. API and worker load shared domain packages but use different entrypoints, Sessions, and principals.

## C3 API — FIG-CMP01

![API components](../../diagrams/c4-components-api.svg)

<details>
<summary>Mermaid source</summary>

```mermaid
flowchart TB
    WEB["Next.js UI<br/>Container"]
    subgraph API["FastAPI API · Container"]
      HTTP["HTTP routers / Pydantic<br/>Input, output, error mapping"]
      IAM["Identity and scope<br/>Session, CSRF, current membership"]
      TICKET["Tickets / SLA / Assets<br/>State, snapshot, assignment"]
      WORK["Work management / Workforce<br/>DAG, remaining, capacity"]
      CONTROL["Automation controls<br/>Policy, grant, approval"]
      ASSIST["Assistant / Knowledge<br/>Owner, visibility, Published ACL"]
      UOW["SQLAlchemy Unit of Work<br/>Atomic domain + audit + outbox"]
    end
    PG[("PostgreSQL + pgvector<br/>Container")]
    STORE[("Private storage<br/>Container")]
    WORKER["Celery worker<br/>Separate container"]
    WEB -->|"HTTPS JSON / session CSRF"| HTTP
    HTTP -->|"Authenticate every request"| IAM
    IAM -->|"Scoped commands and queries"| TICKET
    IAM -->|"Scoped commands and queries"| WORK
    IAM -->|"MA control scope"| CONTROL
    IAM -->|"Owner / source scope"| ASSIST
    TICKET -->|"Atomic mutation"| UOW
    WORK -->|"Lock / version / allocation"| UOW
    CONTROL -->|"Decision not execution"| UOW
    ASSIST -->|"Confirmed ticket via Ticket service"| TICKET
    ASSIST -->|"Read sources / persist chat"| UOW
    UOW -->|"Sync SQLAlchemy / Psycopg"| PG
    TICKET -->|"Authorized file operation"| STORE
    WORKER -->|"Same domain services, own Session"| WORK
    classDef core fill:#14283F,color:#fff,stroke:#60BFFF,stroke-width:3px
    classDef service fill:#EDF4FF,color:#14283F,stroke:#2457C5,stroke-width:2px
    class HTTP,IAM,UOW core
    class TICKET,WORK,CONTROL,ASSIST,WEB,WORKER,PG,STORE service
```

</details>

## C3 worker — FIG-CMP02

![Worker components](../../diagrams/c4-components-worker.svg)

<details>
<summary>Mermaid source</summary>

```mermaid
flowchart TB
    BROKER["Redis broker<br/>At least once · Container"]
    BEAT["One Celery Beat<br/>Container"]
    subgraph W["Celery workers · Container"]
      CLAIM["Claim / lease / dedup<br/>Event + purpose + intent"]
      SNAP["Scoped source snapshot<br/>Policy / grant / ACL / candidates"]
      ADAPTER["Provider adapter<br/>No open DB transaction while waiting"]
      CHECK["Schema and semantic checks<br/>DAG / eligible IDs / version evidence"]
      EXEC["Execution gate<br/>Re-read rights / lock / capacity"]
      DOMAIN["Shared domain services<br/>Atomic effect + action + audit + outbox"]
      SLA["SLA / notification / KB indexing<br/>Queues isolated from model calls"]
    end
    PG[("PostgreSQL + pgvector<br/>Durable event / intent / facts")]
    PROVIDER["External AI provider<br/>DEMO M3 only until production approved"]
    BEAT -->|"Periodic dispatch"| BROKER
    BROKER -->|"Deliver / redeliver"| CLAIM
    CLAIM -->|"Read committed source IDs"| SNAP
    SNAP -->|"Filtered payload, reserve cost"| ADAPTER
    ADAPTER -->|"External request"| PROVIDER
    PROVIDER -->|"Untrusted proposal / usage"| CHECK
    CHECK -->|"Valid intent only"| EXEC
    EXEC -->|"Fresh snapshot and grant"| DOMAIN
    DOMAIN -->|"Commit before acknowledgement"| PG
    CLAIM -->|"Claim / dedup state"| PG
    CLAIM -->|"Non-model periodic work"| SLA
    SLA -->|"Facts and dedup"| PG
    EXEC -->|"Stale / revoked / no capacity: no effect"| PG
    classDef gate fill:#14283F,color:#fff,stroke:#60BFFF,stroke-width:3px
    classDef service fill:#EDF4FF,color:#14283F,stroke:#2457C5,stroke-width:2px
    class CLAIM,EXEC,DOMAIN gate
    class SNAP,ADAPTER,CHECK,SLA,BROKER,BEAT,PG,PROVIDER service
```

</details>

## Ownership and dependencies

| Component | Owns | Must not do |
| --- | --- | --- |
| HTTP/IAM | DTO/error mapping; session/CSRF/current scope | Trust client-supplied role/requester/grantor |
| Tickets/SLA/assets | State, public/internal visibility, snapshots/clocks, asset assignments | Close tickets automatically when tasks are Done; let models allocate assets |
| Work/workforce | Plans/DAG/tasks/skills/schedules/capacity/allocation | Auto-assign using unverified estimates/schedules |
| Automation controls | Workflows/policies/grants/runs/actions/approvals | Treat Approved as Succeeded or skip revalidation |
| Assistant/knowledge | Chat ownership/drafts/confirmation, Published/version/ACL | Execute model SQL/shell; serve caches beyond current permissions |
| UoW/repository | One Session/transaction for domain + audit + outbox | Commit separately in repositories or hold locks through model calls |
| Adapter | Provider protocol/schema/results/usage | Own domain permissions or increase model cost/budget autonomously |
| SLA/notification/index | Source-based calculations, deduplication, ACL | Wait for a model to advance clocks; grant access through notifications |

Cross-module service calls use public application contracts; routers do not access another module's repository. Workers re-read policies/ACL/candidates/locks/capacity inside the execution transaction. Stale data, refusal, schema errors, or provider failures have no partial effect. Reservations for actual/unknown/in-flight costs are recorded in the ledger.

## Traceability and verification

API01–19 map to modules in [code structure](../../technical/code-structure.md); HTTP commands are in [OpenAPI](../../api/openapi.json); EVT01–17 are in the [source catalog](../../technical/api-design.md). Rendering/metadata/relationships are checked; no benchmarks, application tests, or runtime dependency-graph verification have run. Exception grants, key TTL/leases/retry, and calendar/capacity details remain under D-40.
