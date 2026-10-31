---
id: itoh-c4-components
title: "C3 — Components của API và worker"
type: reference
domain: architecture
module: c4
tags: [architecture, c4, design]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Phân chia trách nhiệm bên trong API và worker, với failure và transaction boundary."
---

# C3 — Components của API và worker

**Thiết kế mục tiêu.** Đây là các component trong modular monolith; không tách thành microservice. API và worker nạp chung các package domain nhưng có entrypoint, Session và principal khác nhau.

## C3 API — FIG-CMP01

![API components](../../diagrams/c4-components-api.svg)

<details>
<summary>Nguồn Mermaid</summary>

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
<summary>Nguồn Mermaid</summary>

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

## Ownership và phụ thuộc

| Component | Sở hữu | Không được làm |
|---|---|---|
| HTTP/IAM | DTO/error mapping; session/CSRF/current scope | Tin role/requester/grantor do client truyền |
| Tickets/SLA/assets | State, public/internal, snapshot/clock, asset assignment | Task Done tự đóng ticket; model tự cấp tài sản |
| Work/workforce | Plan/DAG/task/skills/lịch/capacity/allocation | Dùng estimate/lịch chưa xác nhận để tự giao |
| Automation controls | Workflow/policy/grant/run/action/approval | Coi Approved là Succeeded hoặc bỏ revalidation |
| Assistant/knowledge | Owner chat/draft/confirm, Published/version/ACL | SQL/shell từ model; cache vượt quyền |
| UoW/repository | Một Session/transaction cho domain + audit + outbox | Repository tự commit tách hoặc giữ lock qua model |
| Adapter | Provider protocol/schema/result/usage | Quyền domain, tự tăng model/budget |
| SLA/notification/index | Tính từ dữ liệu nguồn, dedup, ACL | Chờ model để chạy clock; notification tự cấp quyền |

Service call cross-module qua public application contract; router không truy cập repo module khác. Worker re-read policy/ACL/candidate/locks/capacity trong execution transaction; stale/refusal/schema/provider lỗi không partial effect. Reservation actual/unknown/in-flight được ledger hóa.

## Truy vết và kiểm chứng

API01–19 → module tại [code structure](../../technical/code-structure.md); command HTTP tại [OpenAPI](../../api/openapi.json); EVT01–17 tại [catalog nguồn](../../technical/api-design.md). Kiểm render/metadata/relationship; chưa benchmark, test application hoặc verify runtime dependency graph. Grant ngoại lệ, key TTL/lease/retry và lịch/capacity còn D-40.
