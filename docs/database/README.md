---
id: itoh-db-contract
title: "Database — DBML và ER Mermaid"
type: reference
domain: database
module: schema
tags: [database, schema, design]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Định nghĩa biểu diễn DBML, ER Mermaid và giới hạn schema thiết kế."
---

# Database — DBML và ER Mermaid

**Thiết kế mục tiêu; chưa có database, DDL hoặc migration.** Nguồn chuẩn entity/cardinality/invariant là [mô hình logic](../requirements/conceptual-data-model.md). Giữ PostgreSQL + SQLAlchemy đồng bộ + Alembic.

## Phạm vi và artifacts

| Artifact | Nội dung | Trạng thái |
|---|---|---|
| [schema.dbml](schema.dbml) | 52 entity logic, 59 reference có cột | Design draft, trường chọn lọc |
| [ER Mermaid](../requirements/conceptual-data-model.md) | 11 góc nhìn, PK/FK/cardinality và graph tổng | Nguồn chuẩn quan hệ |
| [ERD SVG](../diagrams/README.md) | Xem nhanh các miền | Dẫn xuất |
| DDL/Alembic | Schema vật lý | Chưa tạo |

## Ánh xạ và giới hạn

DBML giữ tên CamelCase để đối chiếu ER; tên bảng snake_case vật lý cần review. Timestamp dự kiến timestamptz, JSON là jsonb; enum dùng varchar placeholder. Vector không cố định dimension/model khi chưa chốt. Scalar nullable trong DBML thể hiện chưa đủ đặc tả, không cho phép bỏ qua validation nghiệp vụ. FK mandatory/optional là đề xuất cần refinement.

`AutomationRun.source_versions` và `ApprovalRequest.snapshot_versions` là map JSON nhiều aggregate/version; sửa kiểu chọn lọc cũ ghi int để đồng nhất hợp đồng snapshot. TicketSLA.ticket_id vừa PK vừa FK; interval/violation trỏ cột này, không giả có TicketSLA.id. Ticket.asset_id và TicketSLA.policy_id làm rõ quan hệ đã có ở ER tổng. Actor/source đa hình không dựng FK giả.

DBML không tự bảo đảm min-child cardinality, XOR actor, DAG, ACL, partial unique hoặc atomic capacity. TicketCategory, đầy đủ trường user/ticket/tệp và dữ liệu workflow đã có trong nghiệp vụ nhưng chưa đủ trong view chọn lọc; cần hoàn thiện hợp đồng vật lý trước M1. Không tuyên bố đây là schema hoàn chỉnh.

## Invariant và kiểm soát giao dịch

| Nhóm | Yêu cầu khi triển khai |
|---|---|
| Plan | Tối đa một version Effective/ticket; lịch sử bất biến |
| Task | Dependency cùng version, không cycle/self; predecessor Done trước start |
| Capacity | Skills/lịch/absence xác nhận, remaining theo kỳ; kiểm/giữ chỗ atomic |
| Asset | Một assignment chưa thu hồi/asset; partial unique và transaction; giữ lịch sử |
| Actor/ACL | Human/service phân biệt; quyền thu hồi ngay; không cascade xóa domain qua chat |
| Outbox/idempotency | Dedup theo actor/action/target/digest và delivery purpose; replay không nhân effect |
| AI usage | Ledger gồm actual, in-flight, unknown; nguồn run/message XOR theo loại call |
| Knowledge | Published immutable, ACL hiện hành; index không là nguồn quyền |

Thiếu lịch/skills/estimate đã xác nhận thì hỏi bổ sung/ngoại lệ; không tạo capacity giả. Lock/isolation, exact key, retention và tên/schema vật lý theo [D-40](../decisions/design-decisions.md).

## Kiểm chứng và nguồn

Kiểm entity/field/reference endpoints và đối chiếu Mermaid. Chưa chạy DBML CLI/PostgreSQL migration/concurrency/restore; không gửi tài liệu lên dịch vụ vẽ online.

[DBML syntax](https://dbml.dbdiagram.io/docs/) · [BR](../requirements/business-rules.md) · [API](../api/README.md) · [Kiến trúc](../technical/architecture.md).
