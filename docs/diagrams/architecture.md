---
id: itoh-docs-diagrams-architecture
title: "Các góc nhìn kiến trúc"
type: reference
domain: architecture
module: diagrams
tags: [architecture, diagrams, reference]
priority: 2
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: derived
purpose: "Biểu diễn context/container/sequence/deployment từ kiến trúc mục tiêu."
---

# Các góc nhìn kiến trúc

SVG dưới đây đã được render từ nguồn Mermaid đi kèm. Các hình mô tả thiết kế mục tiêu, không phải triển khai đã chạy. Ký pháp context/container phân tầng theo C4; sequence thể hiện thứ tự gọi và transaction. [Kiến trúc chuẩn](../technical/architecture.md), [API/event](../technical/api-design.md) và [BR-14–22](../requirements/business-rules.md) quy định hành vi.

## FIG-CTX01 — Bối cảnh và ranh giới hệ thống

Bốn vai trò người dùng; AI_COORDINATOR ở trong Hub; provider ở ngoài trust boundary.

![Bối cảnh và ranh giới hệ thống](system-context.svg)

<details>
<summary>Nguồn Mermaid</summary>

```mermaid
flowchart LR
    R["Requester<br/>Gửi / bổ sung / nghiệm thu"]
    T["Technician<br/>Thực hiện chuyên môn"]
    M["Trưởng phòng IT<br/>Policy / giám sát / ngoại lệ"]
    A["Admin<br/>Tài khoản / cấu hình"]
    H["IT Operations Hub<br/>Ticket / Task / Workforce / SLA / Assets / KB<br/>AI trợ lý + điều phối nội bộ"]
    P["AI provider bên ngoài<br/>Model / embedding qua adapter<br/>Production: cần quyết định"]
    R -->|"Yêu cầu của mình"| H
    T -->|"Task, public reply, kết quả"| H
    M -->|"Scope, can thiệp, duyệt ngoại lệ"| H
    A -->|"Quản trị đúng quyền"| H
    H -->|"Payload lọc; M3 chỉ DEMO"| P
    P -->|"Output chưa tin cậy"| H
    classDef human fill:#F5F8FC,stroke:#B8CADD,color:#14283F
    classDef system fill:#EDF4FF,stroke:#2457C5,color:#14283F,stroke-width:2px
    classDef external fill:#FFF8ED,stroke:#B58437,color:#14283F
    class R,T,M,A human
    class H system
    class P external
```

</details>

## FIG-CNT01 — Container và đường dữ liệu

Frontend không đọc DB; broker không là nguồn chuẩn; model không giữ transaction/lock.

![Container và đường dữ liệu](system-containers.svg)

<details>
<summary>Nguồn Mermaid</summary>

```mermaid
flowchart TB
    B["Browser<br/>Cookie session / CSRF"]
    N["Nginx / TLS<br/>Một origin"]
    F["Next.js frontend<br/>Form / URL filters / polling"]
    API["FastAPI API<br/>Auth → router/schema → domain service"]
    BT["Một Celery Beat<br/>Lịch quét định kỳ"]
    R[("Redis broker<br/>At-least-once")]
    W["Celery workers<br/>Outbox / automation / SLA / indexing<br/>Domain service chung, Session riêng"]
    PG[("PostgreSQL + pgvector<br/>Domain / sessions / event-outbox / dedup<br/>Audit / run-action / ACL / usage")]
    FS[("Private storage<br/>Local dev / S3 production")]
    AD["Provider adapter<br/>Model ngoài DB transaction<br/>Schema + semantic validation"]
    P["AI provider bên ngoài"]
    B -->|"HTTPS"| N
    N -->|"Trang / assets"| F
    N -->|"/api/v1"| API
    API -->|"Scope + mutation atomic"| PG
    API -->|"Download kiểm quyền cha"| FS
    BT -->|"Lịch công việc"| R
    R -->|"Deliver / redeliver"| W
    W -->|"Claim/lease, revalidate, commit"| PG
    W -->|"Publish / ack sau commit"| R
    W -->|"Nguồn đã lọc"| FS
    W -->|"Budget + request"| AD
    AD -->|"Egress theo chính sách"| P
    P -->|"Plan / ranking / embedding"| AD
    classDef app fill:#EEF5FF,stroke:#8BA9CF,color:#14283F
    classDef data fill:#EFF8F6,stroke:#68A49B,color:#14283F
    classDef external fill:#FFF8ED,stroke:#B58437,color:#14283F
    class API,W,F,N,BT,AD app
    class PG,FS,R data
    class P external
```

</details>

## FIG-SEQ01 — Ticket đến đề xuất và hành động

Model đề xuất; domain service kiểm lại quyền, nguồn lực và version trước commit.

![Ticket đến đề xuất và hành động](automation-sequence.svg)

<details>
<summary>Nguồn Mermaid</summary>

```mermaid
sequenceDiagram
    actor U as Người gửi yêu cầu
    participant API as Ticket service
    participant DB as PostgreSQL
    participant W as Worker / coordinator
    participant P as Provider adapter
    U->>API: API03 create / API13 confirm (key,<br/>version)
    API->>DB: TX1: quyền / ticket / SLA / audit /<br/>EVT01/outbox
    DB-->>API: COMMIT: ticket ID / version
    API-->>U: Ticket đã lưu, chưa tuyên bố đã giao<br/>task
    W->>DB: Claim event/purpose, run dedup, đọc<br/>snapshot
    DB-->>W: Sources, candidates,<br/>record/policy/workforce versions
    Note over DB,W: Kết thúc transaction đọc trước model call
    W->>DB: Reserve upper-bound budget, COMMIT
    W->>P: Plan / DAG / ranking trong eligible<br/>IDs
    alt Provider timeout / refusal / schema không hợp lệ
        P-->>W: Lỗi hoặc output không đạt
        W->>DB: Run/error, retry hữu hạn nếu<br/>transient
        Note over DB,W: Không có plan/task/assignment nửa vời
    else Output hợp lệ
        P-->>W: Proposal / nguồn/lý do
        W->>DB: TX2: re-read<br/>policy/grant/version/capacity/DAG
        alt Trong policy và khả thi
            W->>DB: Plan / task/allocation /<br/>action/audit/outbox
            DB-->>W: COMMIT to action Succeeded
        else Thiếu quyền / stale / không có nghiệm
            W->>DB: Draft / exception / approval hoặc<br/>Conflict, COMMIT
            Note over DB,W: Chưa có assignment hiệu lực, tiếp FIG-SEQ02
        end
    end
    Note over W,DB: Ack sau commit, retry cùng intent đọc kết quả<br/>cũ
```

</details>

## FIG-SEQ02 — Phê duyệt đến kết quả thực thi

Approved khác Succeeded; stale, revoke hoặc thiếu capacity không được ép ghi.

![Phê duyệt đến kết quả thực thi](approval-sequence.svg)

<details>
<summary>Nguồn Mermaid</summary>

```mermaid
sequenceDiagram
    actor M as Trưởng phòng IT
    participant API as Approval service
    participant DB as PostgreSQL
    participant W as Execution worker
    M->>API: API11: decision / expectedVersion
    API->>DB: Kiểm quyền/snapshot, ghi<br/>decision/audit / EVT15
    alt Từ chối / hết hạn / proposal bị thay
        DB-->>API: COMMIT: Rejected / Expired /<br/>Superseded
        API-->>M: Không enqueue domain effect
    else Approved
        DB-->>API: COMMIT: Approved, execution Pending
        API-->>M: Đã duyệt, chưa khẳng định đã phân<br/>công
        W->>DB: Claim intent, execution Running
        W->>DB: TX mới:<br/>grant/ACL/policy/version/capacity/lock
        alt Quyền và phương án hiện tại hợp lệ
            W->>DB: Effect / allocation /<br/>action/audit/outbox
            DB-->>W: COMMIT: execution Succeeded
        else Stale / revoked / thiếu capacity / bị khóa
            W->>DB: COMMIT: Conflict, giữ<br/>proposal/decision cũ
            Note over M,W: Đánh giá mới, không ép snapshot cũ hoặc tự nới<br/>quyền
        end
    end
    Note over W,DB: Lỗi effect to Failed có lý do, retry vẫn<br/>idempotent
    Note over M,W: Approval không cấp quyền Admin chung,<br/>BR-18/D-40
```

</details>

## FIG-DEP01 — Triển khai và phục hồi dự kiến

Topology logic; chưa chốt hosting/HA/RPO/RTO và chưa có production chạy.

![Triển khai và phục hồi dự kiến](deployment-topology.svg)

<details>
<summary>Nguồn Mermaid</summary>

```mermaid
flowchart TB
    USER["Thiết bị người dùng"]
    EDGE["Nginx / TLS<br/>Cổng công khai"]
    subgraph APP["MẠNG ỨNG DỤNG RIÊNG · LINUX DỰ KIẾN"]
        direction TB
        FE["Frontend process"]
        API["API process"]
        W["Workers<br/>SLA / automation / indexing"]
        BEAT["Một Beat"]
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
    PROVIDER["AI provider<br/>Outbound theo policy / budget"]
    BACKUP["Backup DB + files<br/>Quyền riêng / retention cần chốt"]
    RESTORE["Restore cách ly<br/>Pause workers + chặn outbound<br/>Kiểm references / SLA / dedup"]
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

## Điều kiện đọc và giới hạn

Không có cấp Trưởng nhóm IT riêng. AI/provider không có credential domain; Trưởng phòng IT thiết lập policy, giám sát và duyệt ngoại lệ. Core cần PG/storage sẵn sàng; lỗi provider không tự làm mất khả dụng core. Broker outage có thể làm SLA scan trễ và phải quét bù. Approval không thay quyền Admin cấp tài khoản. M3 chỉ thử DEMO/test trong giới hạn D-39 khi được yêu cầu triển khai riêng.
