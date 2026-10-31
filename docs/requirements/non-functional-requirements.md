---
id: itoh-docs-requirements-non-functional-requirements
title: "Yêu cầu phi chức năng"
type: reference
domain: quality
module: non-functional
tags: [quality, non-functional, reference]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Định danh yêu cầu chất lượng và phương pháp kiểm chứng, phân biệt mục tiêu với số đo."
---

# Yêu cầu phi chức năng

Đây là mục tiêu thiết kế/kiểm thử tương lai, không phải kết quả đo. Ngưỡng hiệu năng cần hiệu chỉnh với môi trường và quy mô dữ liệu sau M1.

| ID | Yêu cầu kiểm chứng được | Cách xác nhận tương lai |
|---|---|---|
| NFR01 | Mọi đọc/ghi kiểm tra phiên, role và scope bản ghi; cả count, lookup, tệp và notification | Negative test đổi ID/role/team và đọc trực tiếp API |
| NFR02 | Khóa tài khoản thu hồi mọi phiên; logout vô hiệu phiên hiện tại | Dùng cookie/phiên cũ gọi lại không được truy cập |
| NFR03 | Mutation nhiều bản ghi nhất quán, có version; không lost update | Hai người đổi trạng thái/nhận ticket/cấp tài sản cùng lúc |
| NFR04 | Dữ liệu tồn tại sau restart; backup PostgreSQL và private files, có hướng dẫn restore | Restart ứng dụng/DB, đối chiếu ticket/comment/assignment; diễn tập phục hồi, chưa cam kết RPO/RTO |
| NFR05 | SLA chuẩn UTC, 24/7, Pending/reopen/priority chính xác; worker idempotent | Bộ ví dụ thời gian cố định và chạy worker lại nhiều lần |
| NFR06 | Tệp riêng tư, allowlist, ≤10 MB/tệp, ≤5/lần, quyền theo nội dung cha | Biên kích thước, giả MIME, note attachment và quyền sau chuyển nhóm |
| NFR07 | Phản hồi lỗi thống nhất; giữ form, chỉ rõ trường, không lộ stack hoặc bí mật | Kiểm tra validation, hết phiên, không quyền, xung đột, lỗi mạng |
| NFR08 | Mục tiêu WCAG 2.2 AA; có nhãn, bàn phím, focus, không chỉ màu | Review thủ công kết hợp công cụ khi đã có UI thực thi |
| NFR09 | Dùng được ở320/390,768 và1440 CSS px; zoom200%, kiểm tra reflow ở320 px | Thử không mất tác vụ chính, không kẹt focus, bảng có phương án đọc |
| NFR10 | Danh sách phân trang20 mặc định, tối đa100; search/filter/sort có giới hạn | Test paging ổn định, cùng giá trị sort có tie-breaker |
| NFR11 | Mục tiêu đề xuất: p95 đọc danh sách≤2s, ghi≤3s trên tập20 user/60 ticket/30 asset trong môi trường được ghi nhận | Chưa là SLA hiệu năng production; đo và điều chỉnh sau |
| NFR12 | Worker SLA kiểm tra tối đa60s/lần; UI hiển thị mốc dữ liệu gần nhất | Worker độc lập dashboard; khi broker gián đoạn theo dõi scan delay và quét bù từ PG, không cam kết nhịp 60 giây trong outage |
| NFR13 | Audit đủ actor/thời gian/cũ/mới/lý do cho các thay đổi bắt buộc, không bí mật | Review event mẫu user role/SLA/ticket/asset |
| NFR14 | Next.js không đọc DB; FastAPI/worker dùng chung service và Session đồng bộ riêng; khóa pnpm/uv dependency | Architecture review, frozen install, clean build/test tại M1 |
| NFR15 | Session PostgreSQL, token opaque HttpOnly/Secure/SameSite; Argon2id và CSRF cho mutation/login | Test expiry/revoke/rotate, cookie và Origin/CSRF; request sau thu hồi không đọc được dữ liệu |
| NFR16 | Polling 30 giây chỉ tab hoạt động; cache phân biệt user/scope, xóa khi logout | Fake-clock/frontend test, đổi user/role và API negative test; worker không phụ thuộc polling |
| NFR17 | API OpenAPI khớp TypeScript sinh tự động; UTC/Asia/Ho_Chi_Minh; backend phân trang/lọc | Contract CI, test timezone và filter/page; không dùng lọc client thay scope server |

Tham chiếu accessibility: [WCAG 2.2](https://www.w3.org/TR/WCAG22/). Phạm vi hiện tại chưa cho phép đo các tiêu chí trên; không đánh dấu PASS dựa trên bản vẽ.

## NFR18–26 — Điều phối, kiến thức và khả năng vận hành

| ID | Yêu cầu thiết kế | Cách kiểm chứng tương lai |
|---|---|---|
| NFR18 | Policy/default deny, scoped AI identity, grantor/policy/version recheck trước mỗi effect kể cả sau duyệt | Revoke trong lúc model chạy, forged principal, vượt nhóm/priority/actions |
| NFR19 | Atomic capacity/allocation, một plan effective, DAG và idempotent intents | PostgreSQL hai workers/events/retries; không dùng SQLite để chứng minh locks/constraints PG |
| NFR20 | Không giữ DB transaction/lock khi chờ model; output lỗi không partial domain | Timeout/refusal/invalid schema; quan sát lock/transaction và domain diff |
| NFR21 | Outbox bền vững/replay, bounded retry/backoff/dead-letter và core/SLA độc lập provider | Ngắt broker/kill sau commit trước ack; core API khi DB còn sẵn sàng, outbox phục hồi, SLA quét bù không reset; retry cùng intent |
| NFR22 | KB Published/version/ACL áp trước retrieval/provider/render/history, revoke ngay cả vector cũ | ACL đổi khi indexing/model pending, cache/history/citation negative tests |
| NFR23 | Usage/cost có nguồn; ngân sách/calls/tokens/retries hữu hạn, reservation cho request đang chạy/unknown | Concurrent calls, timeout không rõ usage, stop trước budget; không tự tăng quota/model |
| NFR24 | Trace event/run/policy/grantor/source/tool/result/error và redaction | Đối chiếu audit/action, không password/session/key/prompt nhạy cảm mặc định |
| NFR25 | Manual lock/đang làm/stale approval không bị ghi đè, undo có compensation/audit | Manager can thiệp giữa proposal và execution, task đã Done |
| NFR26 | Task board/DAG/approval có bàn phím/list thay thế, responsive và status rõ | Keyboard/mobile/reduced-motion/focus; chưa đánh giá bằng SVG tĩnh |

Độ trễ điều phối/event/index và retry/backoff cụ thể Cần quyết định trước vận hành; không áp nhịp SLA 60 giây thành cam kết mọi model call hoàn thành trong 60 giây. Cấu hình thử nghiệm D-39 không thay ngân sách/quyền dữ liệu production.

## Phạm vi đo và tiêu chí kết luận

NFR01–26 là yêu cầu/ứng viên ngưỡng của thiết kế, không có kết quả đo hiện tại. NFR11 là mục tiêu hiệu năng đề xuất trên dataset minh họa; chưa là SLO production đã được phê duyệt. NFR12 quy định nhịp quét khi scheduler/broker/DB hoạt động, không cam kết phát hiện vi phạm trong 60 giây lúc outage. NFR08 là mục tiêu accessibility, không tuyên bố chứng nhận WCAG từ ảnh tĩnh.

Khi kiểm chứng, ghi rõ data size, concurrency, môi trường, khoảng đo, percentile và query/action đo được. Chi phí/usage phải tách actual, reserved và unknown. Availability, event/index latency, rate limit/TTL, retention và RPO/RTO cần quyết định ở D-40 trước cam kết vận hành. [Kế hoạch kiểm chứng](../09-design-readiness.md) định nghĩa các lớp test và evidence tương lai; [kiến trúc](../technical/architecture.md) chỉ rõ kiểm soát tương ứng.
