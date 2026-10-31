---
id: itoh-docs-ai-integration-and-non-regression
title: "Tích hợp AI và bảo toàn nghiệp vụ"
type: reference
domain: ai
module: integration
tags: [ai, integration, reference]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Định nghĩa tool boundary, giao dịch, retry và bảo toàn bất biến khi tích hợp AI."
---

# Tích hợp AI và bảo toàn nghiệp vụ

**Thiết kế mục tiêu 31/10/2026; chưa có adapter, endpoint hoặc test thực thi.** D-35 thay cấm mutation tuyệt đối của D-23; Q&A/summary/nháp phản hồi vẫn chỉ đọc/nháp. Đợt này chỉ sửa tài liệu.

## Tool và danh tính

| Tool khái niệm | Actor/scope | Điều kiện |
|---|---|---|
| Search/read KB, ticket, asset, report | User hoặc service identity đúng policy | Chỉ đọc; lọc trước retrieval/provider/trả kết quả và đọc lại |
| Prepare ticket/reply draft | Chủ phiên, audience rõ | Không ticket/comment/SLA/event nghiệp vụ |
| Confirm/create ticket | User xác nhận preview cụ thể | Validation lõi, digest/version/idempotency; không chọn requester/role/priority override tùy ý |
| Propose/validate plan, eligible candidates | AI_COORDINATOR gắn run/event/policy/grantor | DAG/estimate/deadline/inventory; proposal chưa có hiệu lực |
| Activate plan/create/assign/reassign tasks | AI_COORDINATOR trong allowlist | Policy/grantor hiện tại, scope/version/capacity/transaction; ngoài quyền trình duyệt |
| Approval/reminder/report | Cùng actor và visibility | Dedup/tần suất; approval chưa là execution |
| Hoàn thành task, giải quyết/đóng ticket | Người có quyền | State machine; model không tự xác nhận |
| User/role/SLA/asset mutation | Người có quyền, service chuyên trách | AI không tự cấp user/role/tài sản; sửa SLA/cam kết cần đúng quyền và duyệt |

Provider không nhận DB credential/session/credential nghiệp vụ hoặc quyền Admin. Dữ liệu KB/ticket không cấp quyền. Không shell, SQL hoặc HTTP tùy ý.

## Giao dịch, sự kiện và retry

1. Transaction nghiệp vụ lưu thay đổi + OutboxEvent.
2. Worker claim event bằng DB/lease, tạo hoặc tiếp tục run theo event ID, commit.
3. Snapshot nguồn/candidates đúng quyền; đóng transaction trước gọi model.
4. Schema/refusal/timeout lỗi → run failure có thể xử lý lại, không task nửa vời.
5. Transaction mới re-read, khóa nguồn lực theo thứ tự, kiểm tra version/policy/grantor/ACL/capacity; ghi domain/action/audit/notification/outbox nguyên tử.
6. Ack sau commit; redelivery dùng khóa nghiệp vụ và kết quả đã lưu.

PostgreSQL là nguồn khôi phục khi broker lỗi; Redis lock/Celery task ID không thay dedup domain. Xem [kiến trúc](../technical/architecture.md) về key, backoff và dead-letter.

## Public/internal và dữ liệu

PUBLIC không nhận internal fields; INTERNAL gắn ticket và quyền IT hiện tại. Không handoff nội bộ ra public. Cache/history/nguồn kiểm tra lại ACL; mất quyền thì che cả nội dung phụ thuộc nguồn, không chỉ bỏ citation. KB phải Published/version hợp lệ; thu hồi hiệu lực ngay tại truy vấn.

Chỉ render text escape và source cards server xác nhận, không thực thi HTML/JS/tải URL model. Tệp private vẫn qua quyền cha, không đưa binary/URL public cho provider mặc định. Không hứa nhận diện hoàn hảo bí mật do user tự dán.

## Bất biến và mutation hợp lệ

| Nghiệp vụ | Bảo toàn | Thay đổi được phép |
|---|---|---|
| Ticket BR-02–06 | Requester, ma trận priority, state/quyền/version | Tạo sau xác nhận; không tự giải quyết/đóng |
| Plan/task BR-14–15 | Tách ticket, DAG, một plan version hiệu lực | Tạo/giao/giao lại theo policy; Done do người thực hiện |
| Phân bổ BR-16 | Thành viên/kỹ năng/lịch/tải thật | Recheck/giữ chỗ atomic; không ép vượt tải |
| SLA BR-08–10 | 24/7, snapshot, pause/reopen, dedup/history | Lịch nhân lực không đổi SLA; thay SLA/cam kết phải duyệt |
| First response | Chỉ public IT comment hợp lệ | Nháp do IT gửi thật mới xét; AI message/nhắc không tính |
| Assets BR-11 | Một cấp phát hiệu lực | Task tham chiếu/kiểm kê; không tự cấp phát hoặc mua |
| MET01–22 | Facts theo scope/kỳ/timestamp | Đếm thực thể/action đã commit; không đếm nháp |
| Manual/approval | Không ghi đè lock/đang làm, chặn stale | Approved vẫn recheck policy/quyền/capacity |

## Dữ liệu AI

Conversation/Message/SourceReference/Draft tách domain; xóa chat không xóa ticket/task/audit. ConfirmedCommand lưu owner/digest nội dung/version/TTL/idempotency. Run/Action/Approval/Outbox/Usage lưu provenance và trạng thái/result/error. Không log prompt/body/secrets mặc định; retention/redaction/quyền review trace: Cần quyết định D-40.

## Tắt automation và hoàn tác

Tắt trợ lý dừng sinh nội dung; tắt automation chặn lệnh nền mới. Task chờ provider recheck trước ghi. Không xóa task đã tạo khi tắt AI; hoàn tác bằng hành động bù còn hợp lệ, có quyền/version/audit, không lùi âm thầm việc đã bắt đầu/hoàn thành. Luồng thủ công và SLA tiếp tục hoạt động.

Retry hữu hạn/backoff; lỗi nghiệp vụ không khả thi chuyển ngoại lệ. Timeout kết quả phí không rõ phải giữ reservation chi phí bảo thủ; không retry vô hạn. Mất broker khôi phục từ event DB.

## Kế hoạch kiểm tra không hồi quy

PLANNED/NOT RUN: giữ 47 AC lõi, 10 AC-X, 12 TC-SLA và 8 AC-AI/12 TC-AI. Q&A/summary/nháp chưa xác nhận không đổi domain. Xác nhận ticket chỉ tạo một ticket/SLA/event. Automation được cấp phải đổi task/assignment/action/notification đúng phạm vi và đủ trace; không áp điều kiện database luôn bất biến cho mọi lệnh AI.

Bổ sung AC-OPS01–12/A1–A13: lọc cứng candidates, cycle, nghỉ phép, task lock/đang làm, approval stale, 2 workers/replay/retry, policy/KB revoked, injection/provider/broker lỗi, report source và restore. Kiểm tra payload gửi model và API, không chỉ đáp án. Không chạy test trong đợt tài liệu.

[Catalog AI](use-cases-stories-and-acceptance.md) · [AC tổng](../06-acceptance-criteria.md) · [Truy vết](../traceability/master-traceability.md) · [Lộ trình](../09-design-readiness.md).
