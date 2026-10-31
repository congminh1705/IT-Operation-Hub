---
id: itoh-c4-index
title: "C4 Documentation"
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
purpose: "Liên kết C1–C4, trách nhiệm, ranh giới và bằng chứng thiết kế."
---

# C4 Documentation

**Target architecture / design-draft.** Chưa có code hoặc deployment; C4 L4 là thiết kế code dự kiến, không reverse engineering. Chủ đề tài review; không tự phê duyệt thiết kế chi tiết.

## Các mức và nguồn chuẩn

| Mức | Câu hỏi | Tài liệu |
|---|---|---|
| C1 Context | Ai dùng Hub; hệ thống ngoài nào? | [01-context](01-context.md) |
| C2 Container | Các đơn vị chạy/lưu trữ giao tiếp thế nào? | [02-containers](02-containers.md) |
| C3 Components | Trách nhiệm bên trong API/worker? | [03-components](03-components.md) |
| C4 Code | Một command phối hợp policy/service/repository thế nào? | [04-code](04-code.md) |
| Dynamic | Snapshot/model/approval/transaction/retry? | [Sequences nguồn](../../diagrams/architecture.md) |
| Deployment | Một origin, queues, storage và phục hồi? | [Topology](../../diagrams/deployment-topology.svg), [kiến trúc](../../technical/architecture.md) |

Context/container/deployment hiện có được tái sử dụng, không tạo một hệ thống song song. Mermaid dùng ký pháp flowchart/class để thể hiện mức C4, không tuyên bố Structurizr DSL hoặc UML được chứng nhận. Nguồn kiến trúc chuẩn: technical/architecture.md; các view C4 diễn giải cùng ranh giới.

## Ràng buộc và quyết định

Một tổ chức, R/T/M/A; không Trưởng nhóm IT. AI_COORDINATOR nội bộ, không human actor thứ năm. Next.js UI không chứa domain/DB; FastAPI sở hữu API, SQLAlchemy sync/Alembic/PostgreSQL; worker dùng chung domain service, không HTTP giả Admin. Redis broker không nguồn dữ liệu chuẩn; một Beat; queue SLA tách model. KB pgvector có ACL hiện hành. Không giữ transaction qua model call.

## Kiểm chứng và giới hạn

Source Mermaid và SVG được kiểm render/refs. Module ownership, trust boundary, transaction và failure flows đối chiếu BR/NFR/API. Chưa có runtime, test ứng dụng, independent review hoặc chứng nhận C4. Cookie/DTO physical details, calendar/capacity, production provider/retention/budget và RPO/RTO/hosting theo D-40.

[C4 model diagrams](https://c4model.com/diagrams) · [Stack](../../technical/tech-stack.md) · [Cấu trúc code dự kiến](../../technical/code-structure.md).
