---
id: itoh-docs-diagrams-architecture
title: "Architecture views"
type: reference
domain: architecture
module: diagrams
tags: [architecture, diagrams, reference]
priority: 2
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: derived
purpose: "Represent target context, containers, sequences, and deployment."
---

# Architecture views

SVGs are rendered from accompanying Mermaid sources. Target design, not deployed systems. C4-style context/container views separate levels; sequences show order/transactions. [Architecture](../technical/architecture.md), [API/events](../technical/api-design.md), [BR-14–22](../requirements/business-rules.md) define behavior.

## FIG-CTX01 — System context and boundaries

Four user roles; AI_COORDINATOR inside Hub; provider outside trust boundary.

![System context and boundaries](system-context.svg)

<details>
<summary>Mermaid source</summary>

```mermaid
flowchart LR
    R["Requester<br/>Submit / clarify / accept"]
    T["Technician<br/>Perform specialist work"]
    M["IT Manager<br/>Policies / supervision / exceptions"]
    A["Admin<br/>Accounts / settings"]
    H["IT Operations Hub<br/>Ticket / Task / Workforce / SLA / Assets / KB<br/>Internal AI assistant + coordinator"]
    P["External AI provider<br/>Models / embeddings through adapter<br/>Production: decision required"]
    R -->|"Own requests"| H
    T -->|"Tasks, public replies, results"| H
    M -->|"Scope, intervention, exception approval"| H
    A -->|"Authorized administration"| H
    H -->|"Filtered payload; M3 DEMO only"| P
    P -->|"Untrusted output"| H
    classDef human fill:#F5F8FC,stroke:#B8CADD,color:#14283F
    classDef system fill:#EDF4FF,stroke:#2457C5,color:#14283F,stroke-width:2px
    classDef external fill:#FFF8ED,stroke:#B58437,color:#14283F
    class R,T,M,A human
    class H system
    class P external
```

</details>

## FIG-CNT01 — Containers and data paths

Frontend has no DB access; broker is not the system of record; model waits hold no transactions/locks.

![Containers and data paths](system-containers.svg)

<details>
<summary>Mermaid source</summary>

```mermaid
flowchart TB
    B["Browser<br/>Cookie session / CSRF"]
    N["Nginx / TLS<br/>One origin"]
    F["Next.js frontend<br/>Form / URL filters / polling"]
    API["FastAPI API<br/>Auth → router/schema → domain service"]
    BT["One Celery Beat<br/>Periodic scanning"]
    R[("Redis broker<br/>At-least-once")]
    W["Celery workers<br/>Outbox / automation / SLA / indexing<br/>Shared domain services, own Session"]
    PG[("PostgreSQL + pgvector<br/>Domain / sessions / event-outbox / dedup<br/>Audit / run-action / ACL / usage")]
    FS[("Private storage<br/>Local dev / S3 production")]
    AD["Provider adapter<br/>Model outside DB transaction<br/>Schema + semantic validation"]
    P["External AI provider"]
    B -->|"HTTPS"| N
    N -->|"Pages / assets"| F
    N -->|"/api/v1"| API
    API -->|"Scope + atomic mutation"| PG
    API -->|"Parent-authorized download"| FS
    BT -->|"Scheduled jobs"| R
    R -->|"Deliver / redeliver"| W
    W -->|"Claim/lease, revalidate, commit"| PG
    W -->|"Publish / ack after commit"| R
    W -->|"Filtered sources"| FS
    W -->|"Budget + request"| AD
    AD -->|"Policy-controlled egress"| P
    P -->|"Plan / ranking / embedding"| AD
    classDef app fill:#EEF5FF,stroke:#8BA9CF,color:#14283F
    classDef data fill:#EFF8F6,stroke:#68A49B,color:#14283F
    classDef external fill:#FFF8ED,stroke:#B58437,color:#14283F
    class API,W,F,N,BT,AD app
    class PG,FS,R data
    class P external
```

</details>

## FIG-SEQ01 — Ticket to proposal and action

Model proposes; domain services recheck rights/resources/versions before commit.

![Ticket to proposal and action](automation-sequence.svg)

<details>
<summary>Mermaid source</summary>

```mermaid
sequenceDiagram
    actor U as Requester
    participant API as Ticket service
    participant DB as PostgreSQL
    participant W as Worker / coordinator
    participant P as Provider adapter
    U->>API: API03 create / API13 confirm (key,<br/>version)
    API->>DB: TX1: rights / ticket / SLA / audit /<br/>EVT01/outbox
    DB-->>API: COMMIT: ticket ID / version
    API-->>U: Ticket saved, no task assignment<br/>claimed
    W->>DB: Claim event/purpose, run dedup, read<br/>snapshot
    DB-->>W: Sources, candidates,<br/>record/policy/workforce versions
    Note over DB,W: Close read transaction before model call
    W->>DB: Reserve upper-bound budget, COMMIT
    W->>P: Plan / DAG / ranking within eligible<br/>IDs
    alt Provider timeout / refusal / invalid schema
        P-->>W: Error or invalid output
        W->>DB: Run/error, bounded retry if<br/>transient
        Note over DB,W: No partial plan/task/assignment
    else Valid output
        P-->>W: Proposal / sources/reasons
        W->>DB: TX2: re-read<br/>policy/grant/version/capacity/DAG
        alt Within policy and feasible
            W->>DB: Plan / task/allocation /<br/>action/audit/outbox
            DB-->>W: COMMIT to action Succeeded
        else Unauthorized / stale / infeasible
            W->>DB: Draft / exception / approval or<br/>Conflict, COMMIT
            Note over DB,W: No effective assignment, continue FIG-SEQ02
        end
    end
    Note over W,DB: Ack after commit, same-intent retry reads<br/>stored result
```

</details>

## FIG-SEQ02 — Approval to execution outcome

Approved differs from Succeeded; stale/revoked/insufficient capacity cannot force writes.

![Approval to execution outcome](approval-sequence.svg)

<details>
<summary>Mermaid source</summary>

```mermaid
sequenceDiagram
    actor M as IT Manager
    participant API as Approval service
    participant DB as PostgreSQL
    participant W as Execution worker
    M->>API: API11: decision / expectedVersion
    API->>DB: Check rights/snapshot, write<br/>decision/audit / EVT15
    alt Rejected / expired / superseded
        DB-->>API: COMMIT: Rejected / Expired /<br/>Superseded
        API-->>M: No domain effect enqueued
    else Approved
        DB-->>API: COMMIT: Approved, execution Pending
        API-->>M: Approved, assignment not yet<br/>confirmed
        W->>DB: Claim intent, execution Running
        W->>DB: New TX:<br/>grant/ACL/policy/version/capacity/lock
        alt Current rights and proposal valid
            W->>DB: Effect / allocation /<br/>action/audit/outbox
            DB-->>W: COMMIT: execution Succeeded
        else Stale / revoked / no capacity / locked
            W->>DB: COMMIT: Conflict, retain<br/>prior proposal/decision
            Note over M,W: Re-evaluate, no forced old snapshot or expanded<br/>authority
        end
    end
    Note over W,DB: Effect errors become Failed with reason,<br/>retries stay idempotent
    Note over M,W: Approval grants no general Admin rights,<br/>BR-18/D-40
```

</details>

## FIG-DEP01 — Proposed deployment and recovery

Logical topology; hosting/HA/RPO/RTO remain undecided, no production deployment.

![Proposed deployment and recovery](deployment-topology.svg)

<details>
<summary>Mermaid source</summary>

```mermaid
flowchart TB
    USER["User device"]
    EDGE["Nginx / TLS<br/>Public entry"]
    subgraph APP["PRIVATE APP NETWORK · PROPOSED LINUX"]
        direction TB
        FE["Frontend process"]
        API["API process"]
        W["Workers<br/>SLA / automation / indexing"]
        BEAT["One Beat"]
        RED[("Redis")]
        PG[("PostgreSQL / pgvector")]
        STORE[("Private files")]
        FE ~~~ API
        API -->|"Transaction / session"| PG
        API -->|"Scoped file I/O"| STORE
        BEAT --> RED
        RED --> W
        W -->|"Claim / dedup / commit"| PG
        W --> STORE
    end
    PROVIDER["AI provider<br/>Outbound under policy / budget"]
    BACKUP["Backup DB + files<br/>Private access / retention undecided"]
    RESTORE["Isolated restore<br/>Pause workers + block outbound<br/>Check references / SLA / dedup"]
    USER -->|"HTTPS"| EDGE
    EDGE --> FE
    EDGE -->|"/api/v1"| API
    W --> PROVIDER
    PG --> BACKUP
    STORE --> BACKUP
    BACKUP --> RESTORE
    classDef dat fill:#EFF8F6,stroke:#68A49B,color:#14283F
    class PG,RED,STORE dat
    classDef ext fill:#FFF8ED,stroke:#B58437,color:#14283F
    class PROVIDER,BACKUP,RESTORE ext
```

</details>


## Interpretation and limits

No IT Team Lead tier. AI/providers have no domain credentials; IT Manager sets policy/supervises/approves exceptions. Core requires healthy PostgreSQL/storage; provider failure alone does not disable it. Broker outages may delay SLA scans and require catch-up. Approval never replaces Admin provisioning rights. Future M3 is DEMO/test only within D-39 after a separate implementation request.
