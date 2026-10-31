---
id: itoh-docs-technical-api-design
title: "Thiết kế API mục tiêu"
type: reference
domain: api
module: contracts
tags: [api, contracts, reference]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Định nghĩa hợp đồng HTTP/schema/event và truy vết, với OpenAPI tĩnh, chưa có API thực thi."
---

# Thiết kế API mục tiêu

**Tài liệu thiết kế 31/10/2026; đã có [OpenAPI tĩnh](../api/openapi.json), chưa có endpoint runtime.** REST JSON dưới /api/v1; [hướng dẫn](../api/README.md) và [operation catalog](../api/operations.md) đặc tả DTO/HTTP design draft. FastAPI/Pydantic tương lai phải export/diff với hợp đồng đã review. Không tạo router/schema code/config ở đợt này.

## Hợp đồng chung

Human request dùng server session cookie/CSRF; role/scope từ backend, không từ userId/role client. Worker dùng service identity gắn run/event/policy/grantor, không có public endpoint cho phép giả AI_COORDINATOR. GET không đổi nghiệp vụ. List/filter/sort/paging áp scope trước count; mặc định 20, tối đa 100, tie-breaker ID; query allowlist.

Mutation nhận expectedVersion và idempotency key khi có thể retry (header dự kiến Idempotency-Key); digest gắn actor/action/target/payload. Cùng key/nội dung trả cùng result, khác nội dung trả 409. Không auto retry stale mutation. Error envelope: code/message/field_errors/request_id; 401/403/404 scoped/409 conflict/422 validation/429 limit/503 unavailable. Datetime ISO8601 UTC aware; không đưa secret vào URL/body audit.

## Nhóm endpoint dự kiến

Method/path dưới đây là hợp đồng review, không lệnh thực thi.

| Nhóm | Method/path tương đối | Quyền và nội dung |
|---|---|---|
| Auth | GET /auth/csrf; POST /auth/login, /auth/logout; GET /auth/me; POST /auth/password | Origin/pre-session CSRF cho login; session/CSRF và revoke/rotate |
| Quản trị | /users, /departments, /teams, /teams/{id}/members, /categories | GET lookup tối thiểu đúng scope; POST/PATCH Admin, version/audit, xử lý assignment ảnh hưởng |
| Ticket | GET/POST /tickets; GET /tickets/{id}; POST /tickets/{id}/transitions, /assignment, /priority | Quyền lõi, không DELETE; priority từ ma trận/override có lý do; snapshot SLA |
| Nội dung | GET/POST /tickets/{id}/comments; POST /tickets/{id}/attachments; GET /attachments/{id}/download | Visibility/tệp/quyền cha; note không first response; public requester reply resume Pending |
| Kế hoạch | GET /tickets/{id}/plans; GET /plans/{id}/versions; POST /tickets/{id}/plan-proposals; POST /plans/{id}/activate | T trong scope đọc, M/A sửa/activate; service identity chỉ trong policy; Draft không effective |
| Task | GET /tasks; GET /tasks/{id}; POST /tasks/{id}/transitions, /progress, /assignment | T nhóm đọc, assignee tiến độ/kết quả; M/A điều phối; expectedVersion, dependency/capacity/lock |
| Nhân lực | GET /workforce; GET/PATCH /workforce/{id}; POST /workforce/{id}/absences | M/A cấu hình/xác nhận; T chỉ dữ liệu bản thân và lookup tối thiểu; sự kiện thay đổi lịch |
| Workflow | GET /workflows; POST /workflows; POST /workflows/{id}/versions, /publish | M/A, schema steps/DAG/effort/source; version Published không sửa tại chỗ |
| Policy | GET/POST /automation/policies; PATCH /automation/policies/{id}; POST /automation/policies/{id}/disable | M/A có thẩm quyền; default deny, grantor/scope/limits/version |
| Runs/actions | GET /automation/runs; GET /automation/runs/{id}; POST /automation/runs/{id}/retry | M/A scoped/redacted; retry intent đã thành công không ghi trùng; thất bại nghiệp vụ cần re-evaluate |
| Phê duyệt | GET /approvals; GET /approvals/{id}; POST /approvals/{id}/decisions | M/A, before/after/impact/snapshot; quyết định tách executionStatus; stale 409 |
| Trợ lý | POST /assistant/conversations; GET/DELETE /assistant/conversations/{id}; POST /assistant/conversations/{id}/messages | Chỉ owner, nguồn/visibility hiện tại; DELETE chỉ dữ liệu chat theo retention |
| Xác nhận ticket | POST /assistant/ticket-drafts; POST /assistant/ticket-drafts/{id}/confirm | User xác nhận preview digest/version/TTL, idempotency; gọi cùng Ticket service |
| KB | GET /knowledge, /knowledge/{id}/versions/{version}; POST /knowledge, /knowledge/{id}/versions; POST /knowledge/{id}/publish, /access | Chỉ Published còn quyền để đọc; M/A biên soạn/xuất bản/ACL theo policy, audit; quyền sửa KB cụ thể D-40 |
| Tài sản | GET/POST /assets; GET/PATCH /assets/{id}; POST /assets/{id}/assignments, /returns, /transitions | R/T scoped read; M/A write, atomic one assignment; AI không tự cấp phát |
| Vận hành | GET /notifications; POST /notifications/{id}/read; GET /reports, /audit | Recipient hoặc M/A theo metric/audit scope; không expose payload nội bộ cho R |
| Cấu hình AI | GET/PATCH /admin/assistant | Admin cấu hình khả dụng, không trả secret hoặc đọc chat mọi người; Manager policy là nhóm khác |
| Health | GET /health/live; GET /health/ready | Chỉ trạng thái tối thiểu; không secret/hostname nội bộ; provider lỗi không chặn core |

### Định danh và cách đọc hợp đồng

Các dòng trên là nhóm route; những path sau dấu phẩy dùng cùng prefix tài nguyên, không phải endpoint ở root. Không suy ra CRUD hoặc DELETE khi chưa được nêu. Các nhóm hợp đồng có ID ổn định dưới đây để truy vết; path/schema chi tiết nằm trong OpenAPI tĩnh và cần review trước triển khai.

| ID | Nhóm hợp đồng | UC nguồn | BR / điều kiện chính |
|---|---|---|---|
| API01 | Auth | UC01–04 | BR-01, NFR02/15 |
| API02 | User/department/team/category | UC05–08 | BR-01/02/05; chỉ Admin mutation |
| API03 | Ticket và transitions/assignment/priority | UC10–14, UC18–23 | BR-02–05/08/09 |
| API04 | Comments và attachments | UC15–17 | BR-06–08; scope nội dung cha |
| API05 | Plans/proposals/activate | UC-OPS04 | BR-14/15/17; một effective version |
| API06 | Tasks/progress/assignment/lock | UC-OPS05–07 | BR-15–18; manual lock/version/capacity |
| API07 | Workforce/absence | UC-OPS01 | BR-16; không nguồn rảnh mặc định |
| API08 | Workflow versions/publish | UC-OPS02 | BR-14/17/21; published immutable |
| API09 | Automation policies/grants | UC-OPS02/07 | BR-17/18; grantor và default deny |
| API10 | Runs/actions/retry | UC-OPS09 | BR-19/22; quyền retry không bỏ dedup |
| API11 | Approval/decision | UC-OPS08 | BR-18; decision khác execution |
| API12 | Assistant conversations/messages | UC-AI01/02/04–07 | BR-20/21; owner và public/internal |
| API13 | Ticket draft/confirm | UC-AI03, UC-OPS03 | BR-02/20; preview digest/TTL/idempotency |
| API14 | Knowledge/version/publish/access | UC-OPS10, UC-AI01 | BR-21; quyền biên soạn còn D-40 |
| API15 | Assets/assignments/returns/transitions | UC27–31 | BR-11; atomic assignment |
| API16 | Notifications/reports/audit | UC26/32/33, UC-OPS09 | BR-12/22; recipient và MET scope |
| API17 | Assistant admin settings | UC-AI08 | D-24/33; không trả secret hoặc chat của người khác |
| API18 | Health | NFR04/21 | Tín hiệu tối thiểu, không dữ liệu hạ tầng nhạy cảm |
| API19 | SLA configuration / clocks | UC09/24/25 | BR-08–10; GET/PATCH /sla/policy (Admin), clock qua ticket projection; quét SLA là worker nội bộ |

API06 có `POST /tasks/{id}/assignment-lock` để đặt/bỏ khóa có lý do bởi M/A, không dùng thao tác assignment ngầm bỏ khóa. API09 chỉ cấp grant trong thẩm quyền hiện tại của người cấp; không có public route giả service identity. API19 bổ sung route cấu hình SLA vốn thuộc UC09; thay đổi chỉ áp ticket mới, không sửa snapshot cũ.

### HTTP, đồng thời và kết quả bất đồng bộ

| Trường hợp | Kết quả dự kiến |
|---|---|
| Đọc danh sách/chi tiết | 200; collection gồm items, page, page_size, total sau scope; các query/sort được allowlist |
| Tạo tài nguyên đã commit | 201; ID/version và tham chiếu tài nguyên; ví dụ ticket đã lưu không đồng nghĩa task đã giao |
| Chấp nhận yêu cầu xử lý nền | 202; run/proposal reference để polling; không trả success cho domain effect chưa thực hiện |
| Mutation đồng bộ | 200 với version hiện tại; logout/đổi password/xóa chat dùng 204 trong OpenAPI draft |
| Xung đột | 409; stale version/approval, duplicate key với digest khác, capacity/assignment conflict; không retry mù |
| Lỗi khác | 401 session, 403 chức năng, 404 scope/không tồn tại, 422 input, 429 hạn mức, 503 phụ thuộc không sẵn sàng; không stack trace |

`expectedVersion` thuộc aggregate bị sửa; approval còn mang snapshot versions của plan/task/workforce/policy. Update điều kiện thất bại không ghi domain effect. Idempotency record và effect phải có tính nguyên tử; request cùng key đang chạy phải trả trạng thái rõ và không gọi provider lần nữa tùy tiện. TTL của command/key và thời gian chờ cần refinement D-40.

## Schema khái niệm cần review

| Tên | Trường chính / validation |
|---|---|
| TicketCreate / ConfirmedTicket | title/description/type/category/impact/urgency/asset; workflow goal/deadline/onboarding data nếu áp dụng; requester từ phiên |
| PlanProposal | outcome plan/needs_information/exception, source ID/version, tasks với stable key/title/skills/estimate/deadline/dependencies, lý do; không cycle/unknown reference |
| CandidateSet / AssignmentCommand | server-generated eligible IDs, skills/calendar/capacity evidence/time/versions; target/version/policy/run/idempotency; không nhận candidate cấm do model tự thêm |
| ApprovalView / Decision | before/after/impact/reason/snapshot, expectedVersion/approve-or-reject/reason; execution result riêng |
| ProgressUpdate | task/version, state/remaining/result; Done cần kết quả và remaining=0, predecessor hợp lệ |
| RunView | event/policy/grantor/actor/sources/versions, actions/results/errors, latency/usage/cost nếu có; redaction theo quyền |
| KnowledgeView | article/version/state/ACL/citation; Published/ACL check ngay tại đọc, không cache vượt quyền |

Không trả một response chứa nội bộ rồi yêu cầu frontend ẩn field. Requester ticket response không có plan nhân sự/action/approval/skills/load. Structured tool args là input chưa tin cậy, luôn validate tại service.

## Ví dụ phản hồi khái niệm

Tạo ticket thành công trả id/code/status=New/version cùng request_id. Nếu request bị gửi lại với cùng key thì cùng id, không thêm SLA/event. Duyệt một đề nghị có taskVersion cũ trả code STALE_APPROVAL/status 409, giữ proposal để đối chiếu; không thực thi phương án cũ.

## Hợp đồng sự kiện nội bộ

Sự kiện là thông tin domain đã commit, không phải HTTP request hoặc quyền thực thi. Catalog sau định nghĩa tên logic dùng cho thiết kế; wire schema/version và business key vật lý cần review trước code. Consumer chỉ nhận ID/payload tối thiểu, đọc lại dữ liệu và quyền hiện hành trước effect.

| ID | Event type | Producer sở hữu transaction | Consumer / xử lý dự kiến | Nguồn |
|---|---|---|---|---|
| EVT01 | ticket.created | Ticket service | Automation kiểm đầu vào; notification theo scope | UC10, UC-AI03, BR-02/19 |
| EVT02 | information.updated | Ticket/context service | Đánh giá lại phần thông tin còn thiếu; không lặp câu hỏi cũ | UC-OPS03, BR-20 |
| EVT03 | plan.activated | Work management | Theo dõi kế hoạch và notification; không tạo lại cùng task | UC-OPS04, BR-14 |
| EVT04 | task.assigned | Assignment service | Notification và load/risk evaluation; allocation đã nằm trong transaction producer | UC-OPS05, BR-16/19 |
| EVT05 | task.progressed | Task service | Cập nhật quan sát/risk từ nguồn, không ghi đè kết quả người thực hiện | UC-OPS06, BR-15 |
| EVT06 | task.blocked | Task service | Rà dependency, nguyên nhân và ngoại lệ theo policy | UC-OPS06/07, BR-15/18 |
| EVT07 | task.completed | Task service | Kiểm successor đủ Ready; báo cáo; không tự Resolved/Closed ticket | UC-OPS06, BR-15 |
| EVT08 | availability.changed | Workforce service | Tìm task chịu ảnh hưởng, replan/giao lại hoặc approval | UC-OPS01/07, BR-16 |
| EVT09 | skills.changed | Workforce service | Kiểm lại eligibility; không mặc định kỹ năng chưa xác nhận | UC-OPS01/07, BR-16 |
| EVT10 | membership.changed | Team service | Thu hồi scope ngay; xử lý assignment và re-evaluate | UC07, UC-OPS07, BR-01/05 |
| EVT11 | sla.risk | SLA service | Cảnh báo theo BR-10, dedup ngưỡng/người nhận | UC25, BR-10 |
| EVT12 | deadline.risk | Work/risk service | Nhắc hoặc trình ngoại lệ; không tự nới hạn/SLA | UC-OPS07, BR-17 |
| EVT13 | load.changed | Allocation service | Tính lại feasibility của công việc ảnh hưởng | UC-OPS05/07, BR-16 |
| EVT14 | policy.changed | Policy service | Revalidate/chặn intent chưa ghi; disable có hiệu lực ở service ngay khi commit | UC-OPS02/07, BR-17 |
| EVT15 | approval.decided | Approval service | Execution kiểm lại quyền/grant/snapshot/capacity | UC-OPS08, BR-18 |
| EVT16 | knowledge.published | Knowledge service | Index version đã publish; index không là quyền đọc | UC-OPS10, BR-21 |
| EVT17 | access.revoked | Knowledge ACL service | Vô hiệu cache/retrieval; ACL DB đã có hiệu lực không chờ consumer | UC-OPS10, BR-21 |

Envelope logic gồm `event_id`, `event_type`, `schema_version`, `aggregate_type/id/version`, `occurred_at` UTC, `actor_type/id`, `correlation_id`, `causation_id` nếu có, và `payload` tối thiểu. Không chứa credential, session token, toàn bộ prompt hay nội dung tệp. Consumer không lấy actor trong payload làm bằng chứng authority; service kiểm principal/grant hiện tại. Schema version không tương thích phải được ghi lỗi/quarantine, không tự bỏ qua rồi ack thành công.

Delivery là at-least-once. Claim/lease, retry/nextAttempt và dead-letter thuộc OutboxDelivery, không sửa sự kiện domain đã xảy ra. Cặp event + handler/purpose chống trùng run; business intent + target/version chống trùng effect. Event đến chậm/lệch thứ tự phải re-read aggregate/version, bỏ qua intent không còn áp dụng với lý do audit hoặc lập đánh giá mới; không đảo ngược snapshot cũ. Lỗi transient có retry hữu hạn; lỗi schema/quyền/business conflict không retry mù. Số lần và backoff cụ thể còn D-40.

## Ví dụ hợp đồng — dữ liệu tổng hợp

Ví dụ biểu diễn input/output dự kiến, không phải response thu từ ứng dụng. Các ID có nhãn demo; tên field cuối cùng cần thống nhất trong OpenAPI.

```json
{
  "expectedVersion": 3,
  "decision": "approve",
  "reason": "DEMO: cho phép phương án thay người trong phạm vi được duyệt",
  "snapshot": {"taskVersion": 7, "policyVersion": 2, "workforceVersion": 9}
}
```

Command ở API11 chỉ ghi quyết định sau kiểm tra quyền/version. Ví dụ phần response nghiệp vụ: `decisionStatus: Approved`, `executionStatus: Pending`, `approvalId: demo-approval-01`, `version: 4`. Chỉ sau transaction execution thành công mới là Succeeded; không trả assignment thành công ngay trong phản hồi quyết định nếu mới đưa vào queue.

```json
{
  "code": "STALE_APPROVAL",
  "message": "Phương án đã thay đổi. Hãy xem lại đề nghị mới nhất.",
  "field_errors": {},
  "request_id": "demo-request-01"
}
```

Response lỗi ví dụ dùng HTTP 409, không tiết lộ snapshot workforce cho người ngoài scope. Cấu trúc field_errors, error codes và phân biệt 200/201/202/204 phải được review đồng nhất với OpenAPI tĩnh trước code; chưa có client hoặc API hoạt động.

## Điều kiện hoàn thiện hợp đồng

Đã có OpenAPI JSON design draft bao phủ API01–19, gồm timeline/lịch sử cấp phát/lịch sử message và lookup tối thiểu. Review DTO/naming/vocabulary/projection → khi được yêu cầu code, triển khai Pydantic/FastAPI và diff runtime export → sinh TypeScript → kiểm contract/negative scope/concurrency trong CI. Chưa có runtime hoặc client đã sinh. PATCH /auth/profile và GET /lookups làm rõ UC03/form lookup, không thêm quyền quản trị.

[Quyền](../requirements/permissions-matrix.md) · [Mô hình/ERD](../requirements/conceptual-data-model.md) · [Kiến trúc](architecture.md) · [Nghiệp vụ](../requirements/business-rules.md).
