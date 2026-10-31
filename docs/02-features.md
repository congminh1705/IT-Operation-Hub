---
id: itoh-docs-02-features
title: "Danh mục năng lực và ưu tiên"
type: reference
domain: business
module: requirements
tags: [business, requirements, reference]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Định danh năng lực và độ ưu tiên, liên hệ story và mốc dự kiến."
---

# Danh mục năng lực và ưu tiên

> **Thiết kế mục tiêu:** Chỉ tài liệu thiết kế; chưa triển khai/kiểm thử. AI trong MVP gồm trợ lý và điều phối theo policy; Ticket khác Task; KB/RAG trong phạm vi. Xem quyết định D-34–40 và tài liệu nguồn theo chủ đề.

Tất cả tính năng dưới đây ở trạng thái **đã đặc tả / chưa triển khai**. “Bắt buộc MVP” là độ ưu tiên phạm vi, không phải thứ tự đưa mọi thứ vào một sprint. `P1–P4` dành riêng cho độ ưu tiên ticket; backlog dùng Must/Should để tránh nhầm.

| ID | Năng lực và giá trị | Mốc tương lai | Stories | Phạm vi |
|---|---|---|---|---|
| F01 | Danh tính, phiên server, hồ sơ, mật khẩu | M1 | US01–US04 | Must |
| F02 | User, vai trò, khóa tài khoản, phòng ban | M1 | US05–US08 | Must |
| F03 | Nhóm IT, thành viên, danh mục | M1 | US09–US11 | Must |
| F04 | Chính sách SLA mặc định có audit | M1 chuẩn bị; M4 hoàn thiện | US12 | Must |
| F05 | Tạo ticket với ưu tiên từ ma trận | M1 cơ bản; M2 hoàn thiện | US13 | Must |
| F06 | Danh sách và chi tiết có giới hạn quyền | M1 cơ bản; M2 hoàn thiện | US14–US15 | Must |
| F07 | Phân công, tự nhận, tiếp nhận, bắt đầu | M1 cơ bản; M2 hoàn thiện | US16–US19 | Must |
| F08 | Hội thoại công khai và ghi chú nội bộ | M1 cơ bản; M2 hoàn thiện | US20–US21 | Must |
| F09 | Tệp ảnh/PDF có kiểm tra quyền | M4 | US22–US23 | Must |
| F10 | Pending, giải quyết, đóng, mở lại, hủy | M1 cơ bản; M2 hoàn thiện | US24–US29 | Must |
| F11 | Đổi ưu tiên có lý do và timeline | M1 cơ bản; M2 hoàn thiện | US30–US31 | Must |
| F12 | Đồng hồ, lịch sử vi phạm, worker chống trùng | M4 | US32–US33 | Must |
| F13 | Thông báo theo người nhận và trạng thái đọc | M4; sự kiện M1–M2 chuẩn bị | US34 | Must |
| F14 | Hồ sơ và tra cứu tài sản | M4 | US35–US37 | Must |
| F15 | Cấp phát, thu hồi và trạng thái | M4 | US38–US40 | Must |
| F16 | Dashboard cá nhân, nhóm và toàn tổ chức | M4 | US41–US43 | Must |
| F17 | Xu hướng, thời gian giải quyết, tải, bảo hành | M4 | US44–US46 | Must |
| F18 | Nhật ký nghiệp vụ có quyền | M1–M5 xuyên suốt | US47 | Must |
| F19 | Responsive, accessibility, phục hồi lỗi, tài liệu | M5 và xuyên suốt | AC-X01–AC-X10 | Must |

Should chỉ dùng cho tinh chỉnh bố cục, độ rộng cột và gợi ý nội dung sau usability test. Không hạ các ràng buộc quyền, lưu trữ, SLA hoặc kiểm thử xuống Should.

## Lát cắt đầu tiên khi triển khai

Admin tạo tài khoản/nhóm → Requester tạo ticket → Manager giao Technician → Technician tiếp nhận và phản hồi công khai → xử lý và ghi giải pháp → Requester đóng. Lát cắt này cần quyền, lịch sử và lỗi cơ bản ngay từ đầu. M1 chuẩn bị ticket/task thủ công và dữ liệu tối thiểu; M2 hoàn thiện bảo đảm plan/policy/outbox; M3 AI automation; M4 hoàn thiện tệp, SLA và nghiệp vụ hỗ trợ, không dùng countdown giả để biểu diễn đã có worker.

## Ranh giới phụ trợ

Tìm kiếm topbar là lối tắt tìm **ticket trong phạm vi quyền**, chưa phải bộ máy tìm kiếm toàn hệ thống. Trang “Tài sản của tôi” khác danh mục tài sản quản trị. “Nhật ký” khác timeline công khai của một ticket. Báo cáo không có nút xuất cho đến khi phạm vi đó được bổ sung chính thức.

## Năng lực AI trong MVP, có thể bật/tắt khi vận hành

F01–F19 và lát cắt nghiệp vụ đầu tiên giữ nguyên. Luồng lõi không phụ thuộc khả dụng AI; tuy nhiên AI là điều kiện nghiệm thu MVP mở rộng theo D-33.

| ID | Năng lực | Stories | Trạng thái |
|---|---|---|---|
| F-AI01 | Hỏi đáp hướng dẫn có nguồn | US-AI01 | Đã đặc tả, chưa triển khai |
| F-AI02 | Tra cứu ticket/tài sản đúng quyền | US-AI02 | Đã đặc tả, chưa triển khai |
| F-AI03 | Tạo ticket qua hội thoại sau xác nhận, hoặc chuyển form để chỉnh | US-AI03 | Đã đặc tả, chưa triển khai |
| F-AI04 | Tóm tắt ticket đúng visibility | US-AI04 | Đã đặc tả, chưa triển khai |
| F-AI05 | Soạn nháp phản hồi, người IT kiểm tra/gửi | US-AI05 | Đã đặc tả, chưa triển khai |
| F-AI06 | Giải thích báo cáo theo metric hiện có | US-AI06 | Đã đặc tả, chưa triển khai |
| F-AI07 | Quản lý hội thoại cá nhân | US-AI07 | Đã đặc tả, chưa triển khai |
| F-AI08 | Bật/tắt trợ lý theo mức sẵn sàng | US-AI08 | Đã đặc tả, chưa triển khai |

Chi tiết: [Thiết kế chatbot](10-ai-assistant.md), [stories/AC](ai/use-cases-stories-and-acceptance.md) và [ranh giới tích hợp](ai/integration-and-non-regression.md).

## Năng lực quản lý công việc và điều phối

Các mốc dưới đây chỉ là kế hoạch tài liệu; chưa có chức năng thực thi.

| ID | Năng lực | Story / AC | Mốc dự kiến |
|---|---|---|---|
| F-OPS01 | Skills xác nhận, lịch khả dụng, ngân sách công việc | US-OPS01 / AC-OPS01 | M1 |
| F-OPS02 | Workflow/template có version, policy/default deny/grantor | US-OPS02 / AC-OPS02 | M2 |
| F-OPS03 | Hiểu mục tiêu/hạn và hỏi thiếu dữ liệu | US-OPS03 / AC-OPS03 | M3 |
| F-OPS04 | Plan/version, task/DAG và feasibility | US-OPS04 / AC-OPS04 | M2–M3 |
| F-OPS05 | Candidate/ranking, assignment và allocation atomic | US-OPS05 / AC-OPS05 | M2–M3 |
| F-OPS06 | Task progress/remaining/result và state/dependency | US-OPS06 / AC-OPS06 | M1–M2 |
| F-OPS07 | Event theo dõi, nguy cơ và điều phối lại | US-OPS07 / AC-OPS07 | M2–M3 |
| F-OPS08 | Approval before/after/impact, revalidation và execution | US-OPS08 / AC-OPS08 | M2–M3 |
| F-OPS09 | Manual override/lock/tắt automation | US-OPS09 / AC-OPS09 | M2 |
| F-OPS10 | Run/action/outbox/retry/audit/idempotency | US-OPS10 / AC-OPS10 | M2–M3 |
| F-OPS11 | KB Draft/Published/version/ACL và RAG/citation | US-OPS11 / AC-OPS11 | Nguồn tối thiểu M3; đầy đủ M4 |
| F-OPS12 | Báo cáo task/capacity/risk/action/usage từ nguồn | US-OPS12 / AC-OPS12 | M4 |

AI trợ lý và automation đều Must MVP. M2 có thể chạy input cấu trúc để chứng minh bảo đảm nghiệp vụ, nhưng M3 phải kiểm chứng model thật và hành động thật ở giai đoạn sau. Xem [scope](01-scope.md), [AI](10-ai-assistant.md), [lộ trình M0–M5](09-design-readiness.md).
