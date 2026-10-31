---
id: itoh-c4-containers
title: "C2 — Container"
type: reference
domain: architecture
module: c4
tags: [architecture, c4, design]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: derived
purpose: "Định nghĩa đơn vị chạy, giao thức và nguồn dữ liệu chuẩn."
---

# C2 — Container

**Target containers; chưa deploy.** Dùng lại FIG-CNT01 trong [nguồn Mermaid](../../diagrams/architecture.md).

![C2 — Containers](../../diagrams/system-containers.svg)

## Container catalog

| Container | Công nghệ / trách nhiệm | Giao thức / dữ liệu |
|---|---|---|
| Web UI | Next.js/React/TypeScript, navigation/forms/query | HTTPS cùng origin tới /api/v1; không DB |
| API | FastAPI/Pydantic, auth/scope/domain HTTP | JSON/multipart; session cookie + CSRF |
| Worker | Celery, shared domain services, Session riêng/job | Redis deliver/ack, PostgreSQL transaction, provider HTTPS |
| Scheduler | Một Celery Beat | Phát job định kỳ, không tự đổi trạng thái nghiệp vụ |
| Broker | Redis | At-least-once; không sole durable event/session store |
| Database | PostgreSQL/pgvector, domain/session/outbox/audit/KB/usage | SQLAlchemy đồng bộ qua Psycopg; ACL vẫn ở domain |
| Private file store | Local dev / S3 private production dự kiến | API kiểm quyền cha; DB/object storage có reconcile |
| Reverse proxy | Nginx/TLS, một origin | /api → API; phần còn lại → Next.js |

Provider là external software system. ProviderAdapter là component trong backend/worker, không một microservice/container độc lập. Module trong monolith không tự thành container.

## Reliability và deployment

Outbox/event persisted trước publish; worker claim/dedup/re-read trước effect và ack sau commit. Model call ngoài DB transaction. Queue SLA/notification/indexing tách AI để provider chậm không chặn clock. Một Beat không đồng nghĩa một worker. Database down → readiness không sẵn sàng; provider down → degrade AI, core vẫn dùng được nếu các phụ thuộc core còn tốt.

[Deployment topology](../../diagrams/deployment-topology.svg) mô tả layout logic; VPS/HA/capacity/RPO/RTO/owner vẫn D-40. Không hard-code địa chỉ production.

## Liên quan

[Architecture](../../technical/architecture.md) · [API](../../api/README.md) · [C3](03-components.md).
