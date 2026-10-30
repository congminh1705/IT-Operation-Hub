# Danh mục năng lực và ưu tiên

> **Phạm vi cập nhật 30/10/2026 — D-33:** Trợ lý AI thuộc phạm vi và nghiệm thu MVP theo xác nhận mới nhất của chủ dự án. Có thể bật/tắt khi vận hành, nhưng không được bỏ qua triển khai hoặc nghiệm thu AI. Giữ nguyên quyền và luồng nghiệp vụ lõi; hiện mới có thiết kế, chưa có provider hoặc chức năng hoạt động. [Tech stack và đối chiếu](technical/tech-stack.md).

Tất cả tính năng dưới đây ở trạng thái **đã đặc tả / chưa triển khai**. “Bắt buộc MVP” là độ ưu tiên phạm vi, không phải thứ tự đưa mọi thứ vào một sprint. `P1–P4` dành riêng cho độ ưu tiên ticket; backlog dùng Must/Should để tránh nhầm.

| ID | Năng lực và giá trị | Mốc tương lai | Stories | Phạm vi |
|---|---|---|---|---|
| F01 | Danh tính, phiên server, hồ sơ, mật khẩu | M1 | US01–US04 | Must |
| F02 | User, vai trò, khóa tài khoản, phòng ban | M1 | US05–US08 | Must |
| F03 | Nhóm IT, thành viên, danh mục | M1 | US09–US11 | Must |
| F04 | Chính sách SLA mặc định có audit | M1 chuẩn bị; M3 hoàn thiện | US12 | Must |
| F05 | Tạo ticket với ưu tiên từ ma trận | M2 | US13 | Must |
| F06 | Danh sách và chi tiết có giới hạn quyền | M2 | US14–US15 | Must |
| F07 | Phân công, tự nhận, tiếp nhận, bắt đầu | M2 | US16–US19 | Must |
| F08 | Hội thoại công khai và ghi chú nội bộ | M2 | US20–US21 | Must |
| F09 | Tệp ảnh/PDF có kiểm tra quyền | M2 | US22–US23 | Must |
| F10 | Pending, giải quyết, đóng, mở lại, hủy | M2 | US24–US29 | Must |
| F11 | Đổi ưu tiên có lý do và timeline | M2 | US30–US31 | Must |
| F12 | Đồng hồ, lịch sử vi phạm, worker chống trùng | M3 | US32–US33 | Must |
| F13 | Thông báo theo người nhận và trạng thái đọc | M3; sự kiện M2 chuẩn bị | US34 | Must |
| F14 | Hồ sơ và tra cứu tài sản | M4 | US35–US37 | Must |
| F15 | Cấp phát, thu hồi và trạng thái | M4 | US38–US40 | Must |
| F16 | Dashboard cá nhân, nhóm và toàn tổ chức | M5 | US41–US43 | Must |
| F17 | Xu hướng, thời gian giải quyết, tải, bảo hành | M5 | US44–US46 | Must |
| F18 | Nhật ký nghiệp vụ có quyền | M1–M6 xuyên suốt | US47 | Must |
| F19 | Responsive, accessibility, phục hồi lỗi, tài liệu | M6 và xuyên suốt | AC-X01–AC-X10 | Must |

Should chỉ dùng cho tinh chỉnh bố cục, độ rộng cột và gợi ý nội dung sau usability test. Không hạ các ràng buộc quyền, lưu trữ, SLA hoặc kiểm thử xuống Should.

## Lát cắt đầu tiên khi triển khai

Admin tạo tài khoản/nhóm → Requester tạo ticket → Manager giao Technician → Technician tiếp nhận và phản hồi công khai → xử lý và ghi giải pháp → Requester đóng. Lát cắt này cần quyền, lịch sử và lỗi cơ bản ngay từ đầu. Tệp, mở lại và các nhánh Pending hoàn thiện trong M2; SLA đầy đủ triển khai M3, không dùng countdown giả để biểu diễn đã có worker.

## Ranh giới phụ trợ

Tìm kiếm topbar là lối tắt tìm **ticket trong phạm vi quyền**, chưa phải bộ máy tìm kiếm toàn hệ thống. Trang “Tài sản của tôi” khác danh mục tài sản quản trị. “Nhật ký” khác timeline công khai của một ticket. Báo cáo không có nút xuất cho đến khi phạm vi đó được bổ sung chính thức.

## Năng lực AI trong MVP, có thể bật/tắt khi vận hành

F01–F19 và lát cắt nghiệp vụ đầu tiên giữ nguyên. Luồng lõi không phụ thuộc khả dụng AI; tuy nhiên AI là điều kiện nghiệm thu MVP mở rộng theo D-33.

| ID | Năng lực | Stories | Trạng thái |
|---|---|---|---|
| F-AI01 | Hỏi đáp hướng dẫn có nguồn | US-AI01 | Đã đặc tả, chưa triển khai |
| F-AI02 | Tra cứu ticket/tài sản đúng quyền | US-AI02 | Đã đặc tả, chưa triển khai |
| F-AI03 | Chuẩn bị yêu cầu và chuyển về form | US-AI03 | Đã đặc tả, chưa triển khai |
| F-AI04 | Tóm tắt ticket đúng visibility | US-AI04 | Đã đặc tả, chưa triển khai |
| F-AI05 | Soạn nháp phản hồi, người IT kiểm tra/gửi | US-AI05 | Đã đặc tả, chưa triển khai |
| F-AI06 | Giải thích báo cáo theo metric hiện có | US-AI06 | Đã đặc tả, chưa triển khai |
| F-AI07 | Quản lý hội thoại cá nhân | US-AI07 | Đã đặc tả, chưa triển khai |
| F-AI08 | Bật/tắt trợ lý theo mức sẵn sàng | US-AI08 | Đã đặc tả, chưa triển khai |

Chi tiết: [Thiết kế chatbot](10-ai-assistant.md), [stories/AC](ai/use-cases-stories-and-acceptance.md) và [ranh giới tích hợp](ai/integration-and-non-regression.md).
