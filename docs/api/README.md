---
id: itoh-api-contract
title: "OpenAPI Document"
type: reference
domain: api
module: contracts
tags: [api, contracts, design]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Định nghĩa hợp đồng OpenAPI, bảo mật, ví dụ DEMO và điều kiện kiểm chứng."
---

# OpenAPI Document

**Hợp đồng thiết kế tĩnh; chưa có API server, client đã sinh hoặc kết quả API test.** Dùng [OpenAPI 3.1.1 JSON](openapi.json), cùng ý định contract-first của repo mẫu, giữ stack FastAPI/Pydantic và schema JSON hiện có. Đây không phải OpenAPI export từ runtime.

## Phạm vi và trạng thái

| Nội dung | Artifact / kết quả |
|---|---|
| Hợp đồng máy đọc | [openapi.json](openapi.json): 74 paths, 96 operations, 95 schemas |
| Truy vết | [Operation catalog](operations.md): API01–19 → operationId/method/path/role/scope; UC/BR tại catalog nguồn |
| Quy tắc, TX và event | [API design](../technical/api-design.md): EVT01–17 nội bộ, không biến thành HTTP routes |
| Nghiệp vụ/quyền | [BR](../requirements/business-rules.md), [permissions](../requirements/permissions-matrix.md) |
| Thẩm quyền | Chủ đề tài review; detailed contract design-draft, không tự ghi được phê duyệt |

## Authentication, concurrency và lỗi

Session PostgreSQL, cookie HttpOnly; tên dự kiến itoh_session cần review, không JWT/localStorage. Login lấy pre-session CSRF rồi gửi X-CSRF-Token; mutation có CSRF/Origin và idempotency, GET không đổi domain. Principal/role/grantor từ backend; public API không nhận requester giả hoặc service identity. DTO chặn field không được khai báo.

Mutation versioned dùng expectedVersion; cùng idempotency key/digest trả lại kết quả trước, khác digest 409. Request đang chạy không gọi provider/ghi effect lần hai; thời hạn key/retry D-40. 201 nghĩa tài nguyên đã commit; 202 chỉ tiếp nhận xử lý nền; 200 kết quả đồng bộ; 204 logout/đổi password/xóa chat. Decision approval có execution_status riêng. Asset/Task allocation vẫn kiểm atomic ở domain service.

Error envelope code/message/field_errors/request_id; 401/403/404 scoped/409/422/429/503. Không tồn tại và ngoài quyền cùng thông điệp 404. File quá lớn 413. List items/page/page_size/total sau scope; page default1, page_size20, tối đa100. UTC có offset, không secret trong URL/log/error.

## Projection và điểm cần refinement

TicketPublic không chứa plan nhân sự/approval/note. TicketInternal chỉ scoped IT; hai response schema tách biệt, không tải dữ liệu riêng tư rồi ẩn client. Workforce T chỉ bản thân/lookup tối thiểu; Admin không mặc định đọc mọi chat. Trợ lý own conversation, KB Published và ACL hiện hành; retention/xóa chat không xóa nghiệp vụ/audit/idempotency. MA chỉ author/publisher KB khi có quyền riêng được chốt; trước đó default deny.

Hai route làm rõ UC hiện có: PATCH /auth/profile (UC03, tự sửa tên hiển thị/thông tin liên hệ), GET /lookups (dữ liệu tối thiểu cho form, không user directory). Trường profile/lookup naming, vocabulary enum DTO, cookie name, limits, publisher policy, handover khẩn và grant ngoại lệ vẫn là đề xuất cần review D-40, không quyết định vận hành mới. Upload một file/operation, tối đa5 file trong một thao tác UI, mỗi file ≤10MB, không thay giới hạn nghiệp vụ. Đã có GET timeline ticket, lịch sử cấp phát, ticket liên quan asset và lịch sử messages; mỗi danh sách kiểm scope trước count. Không suy CRUD/DELETE từ các nhóm.

## Ví dụ luồng DEMO để review contract

Dùng UUID giả đã được tạo trong môi trường test khi triển khai. Không đưa cookie/API key/password thật vào ví dụ hoặc repository. Header token bên dưới chỉ là placeholder.

```http
POST /api/v1/tickets
Content-Type: application/json
X-CSRF-Token: DEMO-CSRF-PLACEHOLDER
Idempotency-Key: DEMO-ticket-001

{"title":"DEMO — chuẩn bị máy cho nhân viên giả","description":"DEMO — cần xác nhận cấu hình và thời hạn bàn giao.","type":"SERVICE_REQUEST","category_id":"00000000-0000-4000-8000-000000000001","impact":"LOW","urgency":"LOW"}
```

Expected: 201/New/version; requester từ phiên, SLA snapshot; replay cùng key không tạo ticket/event lần hai. Không có grant thì automation không tự giao.

```http
POST /api/v1/approvals/00000000-0000-4000-8000-000000000002/decisions
Content-Type: application/json
X-CSRF-Token: DEMO-CSRF-PLACEHOLDER
Idempotency-Key: DEMO-approval-001

{"expectedVersion":2,"decision":"APPROVE","reason":"DEMO — đã kiểm tra nguồn lực","snapshot_versions":{"00000000-0000-4000-8000-000000000003":4}}
```

Expected: quyết định được lưu khác execution; nếu version/policy/skills/capacity đổi thì 409 hoặc execution Conflict sau revalidate, không giao theo snapshot cũ.

## Kiểm chứng và bàn giao tương lai

Kiểm JSON, local refs, operationId/path params, schema/required, scope metadata và coverage API01–19. Chưa chạy official OpenAPI validator/client generator hoặc test HTTP thật. Trước code phải review DTO enum/naming, hoàn thiện projection/historical resource shape và vận hành D-40; sau đó FastAPI export cần semantic diff với contract đã duyệt, sinh TypeScript và chạy negative scope/version/concurrency/CSRF tests. Không có lệnh bắt đầu M1–M5 trong tài liệu này.

[OpenAPI 3.1.1](https://spec.openapis.org/oas/v3.1.1.html) · [C4](../architecture/c4/README.md) · [DBML/ER](../database/README.md).
