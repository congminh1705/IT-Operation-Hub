---
id: itoh-docs-technical-tech-stack
title: "Stack mục tiêu — IT Operations Hub"
type: reference
domain: architecture
module: technology
tags: [architecture, technology, reference]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Ghi stack đã thống nhất và trách nhiệm từng nhóm công nghệ."
---

# Stack mục tiêu — IT Operations Hub

**Thiết kế mục tiêu · Chỉ thiết kế.** Stack đã thống nhất; chưa có ứng dụng hoặc bộ dependency/runtime được nghiệm thu. Đợt này không cài dependency/sửa cấu hình/code.

## Công nghệ giữ nguyên

| Thành phần | Lựa chọn và trách nhiệm |
|---|---|
| Frontend | Next.js App Router/React/TypeScript strict, chỉ UI/REST; Tailwind CSS, shadcn/ui, Lucide React |
| Forms | React Hook Form/Zod/resolvers; UX validation không thay backend |
| Server state/table | TanStack Query/Table; query/paging/sort phía server, cache user/scope; polling 30 giây tab hoạt động |
| Chart/time | Recharts, date-fns và timezone; UTC storage/ISO API, Asia/Ho_Chi_Minh display |
| Backend | Python/FastAPI/Pydantic/pydantic-settings; modular monolith |
| Database/ORM | PostgreSQL/SQLAlchemy Session đồng bộ/Alembic/Psycopg 3; không Django ORM |
| Auth | PG server session, opaque cookie HttpOnly/Secure production/SameSite, Argon2id qua pwdlib và CSRF/login Origin |
| Worker | Celery + Redis + một Beat; worker Linux kể cả Windows dev; tách queue AI/SLA/index |
| AI | Provider/model/embedding adapter, structured output/tool allowlist; service backend giữ quyền ghi |
| KB/RAG | PostgreSQL + pgvector; version/ACL/Published, chunk/embedding/indexing nền Celery; quyền runtime không phụ thuộc index |
| Storage | Private local dev/S3 production qua boto3; API download kiểm scope cha |
| Dependency | uv/pnpm, lock thật khi bắt đầu giai đoạn lập trình |
| Quality/test | Ruff/mypy/ESLint/Prettier; pytest/HTTPX, Vitest/RTL, Playwright theo kế hoạch |
| Deploy/ops | Docker Compose/Nginx/Uvicorn/Linux VPS/HTTPS, JSON logs/request ID, health/backup/restore, GitHub Actions nếu repo GitHub |

Không Next.js business API/Prisma/Better Auth/BullMQ hoặc microservice mới. Route/dependency có query đồng bộ dùng cách phù hợp FastAPI để không blocking async event loop; Session riêng request/task, không global shared session.

## Phân hệ và trách nhiệm

| Nhóm module | Trách nhiệm thiết kế |
|---|---|
| auth/users/teams | Danh tính, session/CSRF, role, phòng ban, nhóm và membership |
| tickets/sla/assets | Yêu cầu/SLA 24/7, hội thoại/tệp và vòng đời tài sản |
| work_management/workforce | Plan/version/DAG, task, kỹ năng/lịch/capacity/allocation |
| automation | Policy/grant, outbox/events, run/action, approval và retry/idempotency |
| ai_assistant/knowledge | Hội thoại/xác nhận/nguồn, adapter model/embedding, KB/version/ACL/RAG |
| notifications/reports/audit | Thông báo, facts theo phạm vi và lịch sử hành động |

D-30–32 giữ stack; D-34 giới hạn tài liệu; D-35–38 mở rộng mục tiêu AI/KB; D-39 chỉ cấu hình kiểm thử demo; production Cần quyết định D-40. Nhánh Node/Python/PG cụ thể và mọi patch trong [danh mục phiên bản](version-baseline.md) là ứng viên lịch sử cần kiểm chứng lại, không tự nâng major.

## Chưa triển khai

Không có API/worker/AI/RAG/auth/DB/migration đang chạy hoặc test ứng dụng đã pass. Tài liệu API không phải OpenAPI được sinh, ERD không phải schema đã migrate. Không publish site hoặc đổi hosting để thay stack đã chốt.

[Architecture/ops](architecture.md) · [API thiết kế](api-design.md) · [ERD](../requirements/conceptual-data-model.md) · [Lộ trình M0–M5](../09-design-readiness.md).
