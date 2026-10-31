---
id: itoh-code-structure
title: "Code structure — folders và files dự kiến"
type: reference
domain: development
module: structure
tags: [development, structure, design]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Phân biệt cây repo hiện có với cấu trúc Next.js/FastAPI mục tiêu và ownership."
---

# Code structure — folders và files dự kiến

**Chỉ tài liệu thiết kế.** Không tạo package, router, model, migration, dependency, test hoặc cấu hình vận hành. Cây dưới đây có chú thích planned; không mô tả source code đang có.

## 1. Hiện trạng repo

```text
IT-Operation-Hub/
├── README.md
├── docs/
│   ├── requirements/              # BR, quyền, mô hình/ER Mermaid hiện có
│   ├── api/                       # OpenAPI JSON, operation catalog, hướng dẫn
│   ├── database/                  # DBML và ánh xạ ER
│   ├── architecture/c4/           # C1–C4 design documentation
│   ├── technical/                 # Architecture, stack, API rationale, code structure
│   ├── diagrams/                  # SVG và nguồn diagram trong Markdown
│   ├── design/                    # UI/UX và wireframe tĩnh
│   └── xmind/                     # Native XMind + SVG preview
└── src/
    ├── frontend/.gitkeep           # Chưa có ứng dụng Next.js
    └── backend/.gitkeep            # Chưa có ứng dụng FastAPI
```

Chỉ docs/ và hai .gitkeep đã tồn tại trong src/. Không coi cây rút gọn là danh sách đầy đủ file tài liệu.

## 2. Frontend Next.js mục tiêu — PLANNED

```text
src/frontend/
├── package.json                         # PLANNED, không cài dependency ở đợt tài liệu
├── next.config.ts                       # PLANNED
├── tsconfig.json                        # PLANNED
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root document, providers, font
│   │   ├── providers.tsx                 # QueryClient, UI state
│   │   ├── login/page.tsx
│   │   ├── (workspace)/
│   │   │   ├── layout.tsx                # Shell/menu từ quyền server
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── profile/security/page.tsx
│   │   │   ├── tickets/page.tsx
│   │   │   ├── tickets/new/page.tsx
│   │   │   ├── tickets/[id]/page.tsx
│   │   │   ├── tickets/[id]/plan/page.tsx
│   │   │   ├── work/page.tsx
│   │   │   ├── workforce/page.tsx
│   │   │   ├── coordination/page.tsx
│   │   │   ├── approvals/page.tsx
│   │   │   ├── automation/policies/page.tsx
│   │   │   ├── knowledge/page.tsx
│   │   │   ├── assets/page.tsx
│   │   │   ├── assets/new/page.tsx
│   │   │   ├── assets/[id]/page.tsx
│   │   │   ├── assets/[id]/edit/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   ├── audit/page.tsx
│   │   │   ├── assistant/page.tsx
│   │   │   └── admin/
│   │   │       ├── users/page.tsx
│   │   │       ├── departments/page.tsx
│   │   │       ├── teams/page.tsx
│   │   │       ├── teams/[id]/page.tsx
│   │   │       ├── categories/page.tsx
│   │   │       ├── sla/page.tsx
│   │   │       └── assistant/page.tsx
│   │   ├── 403/page.tsx
│   │   ├── 404/page.tsx
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   ├── features/
│   │   ├── auth/
│   │   ├── tickets/
│   │   ├── work-management/
│   │   ├── workforce/
│   │   ├── automation/
│   │   ├── assistant/
│   │   ├── knowledge/
│   │   ├── assets/
│   │   ├── notifications/
│   │   ├── reports/
│   │   ├── audit/
│   │   └── administration/
│   ├── components/
│   │   ├── ui/                          # shadcn primitives
│   │   ├── layout/                      # Shell/topbar/sidebar
│   │   └── feedback/                    # Loading/error/permission states
│   └── lib/
│       ├── api/
│       │   ├── generated/schema.d.ts     # PLANNED từ OpenAPI, không tự sửa
│       │   ├── client.ts                # Cookie/CSRF/idempotency/error mapping
│       │   └── query-keys.ts             # Partition theo user/scope/resource
│       ├── auth/session.ts
│       ├── dates.ts
│       └── validation.ts
├── public/
└── tests/                               # PLANNED, không tạo test thực thi
    ├── components/
    └── e2e/
```

Mỗi feature có `components/`, `api.ts`, `queries.ts`, `schemas.ts` và `types.ts` khi cần; không tạo một cây chứa mọi tên file giống nhau khi chưa có use case. Ví dụ tickets/components/ticket-form.tsx + ticket-conversation.tsx; automation/components/approval-diff.tsx; work-management/components/task-board.tsx.

`app/` chỉ route/layout/composition; `(workspace)` là route group không xuất hiện trong URL. SCR23/24/25/33 là dialog của ticket/asset, không tạo page giả. Mobile và desktop dùng cùng quyền/backend; không thêm trang đăng ký/reset email hoặc Trưởng nhóm IT. Không coi file 403/404 là mục menu.

Không sao chép domain/policy sang Next.js route handler để tạo backend thứ hai. API client dùng same-origin cookie; server rendering nếu gọi API phải chuyển tiếp phiên theo request hợp lệ và không cache dữ liệu riêng tư xuyên user. Query cache invalidated/partition khi logout/chuyển scope; mutation thành công mới refresh dữ liệu nguồn.

## 3. Backend FastAPI mục tiêu — PLANNED

```text
src/backend/
├── pyproject.toml                         # PLANNED, uv.lock chỉ tạo lúc triển khai
├── alembic.ini                            # PLANNED, chưa tạo cấu hình
├── migrations/
│   ├── env.py                             # PLANNED
│   └── versions/                          # PLANNED, hiện không có migration
├── app/
│   ├── main.py                            # FastAPI composition root
│   ├── api/
│   │   ├── router.py                      # Mount /api/v1
│   │   ├── dependencies.py                # Principal, session, CSRF/UoW
│   │   └── errors.py                      # Error envelope
│   ├── core/
│   │   ├── settings.py                    # Config/secrets injection, không secret literals
│   │   ├── security.py                    # Session hashing/Argon2id/CSRF primitives
│   │   ├── principals.py                  # Human vs service-grant context
│   │   └── clock.py                       # UTC clock abstraction
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── teams/
│   │   ├── tickets/
│   │   ├── sla/
│   │   ├── assets/
│   │   ├── work_management/
│   │   │   ├── router.py                  # API05/06 transport
│   │   │   ├── schemas.py                 # Pydantic input/output projections
│   │   │   ├── service.py                 # Use case + transaction owner
│   │   │   ├── policy.py                  # Current actor/grant/scope/state
│   │   │   ├── domain.py                  # DAG/transition/value rules
│   │   │   ├── models.py                  # SQLAlchemy mapping
│   │   │   └── repository.py              # Scoped SQL, no autonomous commit
│   │   ├── workforce/
│   │   ├── automation/
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   ├── service.py
│   │   │   ├── executor.py                # Snapshot → adapter → revalidate → command
│   │   │   ├── policy.py
│   │   │   ├── models.py
│   │   │   └── repository.py
│   │   ├── ai_assistant/
│   │   ├── knowledge/
│   │   ├── notifications/
│   │   ├── reports/
│   │   └── audit/
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── base.py
│   │   │   ├── session.py                 # Sync SQLAlchemy/Psycopg; per request/job
│   │   │   └── unit_of_work.py            # Domain + audit + outbox, one commit
│   │   ├── events/
│   │   │   ├── writer.py                  # Same transaction, IDs/digests
│   │   │   └── delivery.py                # Claim/lease/publish/ack/retry
│   │   ├── ai/
│   │   │   ├── provider.py                # Interface, no DB mutation
│   │   │   ├── embedding.py
│   │   │   ├── budget.py                  # Reserve actual/in-flight/unknown
│   │   │   └── openai_adapter.py          # Future DEMO adapter per D-39, not configured
│   │   └── storage/
│   │       ├── private_files.py           # Interface / ACL caller contract
│   │       ├── local.py
│   │       └── s3.py
│   └── workers/
│       ├── celery_app.py
│       ├── schedule.py                    # One Beat, separate queues
│       ├── outbox_jobs.py
│       ├── automation_jobs.py
│       ├── sla_jobs.py
│       ├── notification_jobs.py
│       └── knowledge_jobs.py
└── tests/                                 # PLANNED, không tạo trong đợt tài liệu
    ├── unit/
    ├── integration/
    └── contract/
```

Auth/users/teams/sla/assets/... có thể dùng mẫu router/schemas/service/policy/models/repository khi có trách nhiệm tương ứng; không ép mọi module có file rỗng. Department/category quản trị nằm users/teams/tickets theo ownership, không thêm service triển khai độc lập.

## 4. Dependency và transaction rules

| Tầng | Gọi được | Không được |
|---|---|---|
| Frontend route/feature | API client + generated DTO | DB/SQLAlchemy hoặc tự cấp role |
| Router/schema | Auth dependency, application service | Tự commit, query repository module khác |
| Application service | Domain policy, own repo, public service hợp đồng khác, UoW | Tin model/client role, giữ TX qua model |
| Domain policy | Value objects/current evidence | HTTP/provider/storage side effects |
| Repository | SQLAlchemy Session được truyền | Tự tạo commit/Session tách để lách invariant |
| Worker job | Claim/dedup + shared service + service principal | HTTP giả phiên Admin; ORM write bỏ qua policy |
| Provider/storage adapter | External protocol/I/O | Tự cấp quyền; domain effect ngoài command |
| Audit/outbox | Writer trong UoW | Audit secret hoặc publish trước commit |

Không dùng async SQLAlchemy Session với ORM đồng bộ. FastAPI sync route/service và Celery sync worker dùng Session riêng; không share Session giữa request/thread/job. Lock order vật lý/capacity grain vẫn D-40.

## 5. Module → contract → dữ liệu → view

| Module | API group | Entity chính | C4 |
|---|---|---|---|
| auth/users/teams | API01/02 | User/Session/Department/Team/Membership | IAM/API |
| tickets/sla | API03/04/19 | Ticket/Comment/Event/Attachment/TicketSLA | Ticket/API + periodic worker |
| work_management/workforce | API05/06/07 | WorkPlan/PlanVersion/Task/skills/calendar/allocation | Work/API + executor |
| automation | API08–11 | Templates/policy/grant/event/run/action/approval | Controls/API + worker |
| ai_assistant/knowledge | API12–14/17 | Chat/draft/confirmed command/KB/ACL/usage | Assistant/API + adapter/index worker |
| assets | API15 | Asset/AssetAssignment | Assets/API |
| notifications/reports/audit | API16 | Recipient/facts/AuditLog | Query/API + worker |

Full route/operation mapping tại [operation catalog](../api/operations.md); entity có thể lặp trong view nhưng chỉ có một owner. D-40 về KB author/publisher không được suy từ thư mục module.

## 6. Kế hoạch triển khai và kiểm chứng sau này

Chỉ khi có yêu cầu lập trình riêng: khởi tạo manifest/lock → API export/DTO review → modules lõi/session/CSRF → Alembic/schema refinement → domain state/concurrency → worker/SLA → automation/KB/provider theo mốc đã chốt. Cây thư mục không tự bắt đầu M1–M5. CI contract/client generation, import boundary, unit/integration/e2e, restore và security tests hiện PLANNED/NOT RUN.

Repo có chưa: docs và .gitkeep. Repo chưa có: package manifests/lock, source modules, migrations, worker/config, generated clients hoặc tests. Tài liệu này không tạo các file planned.

[C4 L4](../architecture/c4/04-code.md) · [Architecture](architecture.md) · [API](../api/README.md) · [Database](../database/README.md) · [D-40](../decisions/design-decisions.md).
