# FE-04.02 — Đối chiếu và kiểm tra bàn giao quyền

Admin DEMO, Chromium reduced motion, 1440×1000 và 390×1000. Hai mẫu được mở trước triển khai.

| Trạng thái | Mẫu desktop / mobile | Ứng dụng desktop / mobile |
| --- | --- | --- |
| Danh sách | [1440](reference-users-1440.png) / [390](reference-users-390.png) | [1440](actual-users-1440.png) / [390](actual-users-390.png) |
| Review tác động | [Luồng provision 1440](reference-provision-1440.png) / [390](reference-provision-390.png) | [1440](actual-review-1440.png) / [390](actual-review-390.png) |

Danh sách giữ Mac/Teal và thêm thao tác trên từng dòng. Mobile cuộn ngang riêng trong bảng. Mẫu provision là màn kiểm tra yêu cầu tài khoản, không có panel thiếu người bàn giao hoặc mở khóa. Ứng dụng tái sử dụng bố cục thẻ, thông báo amber và trạng thái bị chặn màu rose, đồng thời trình bày trước/sau trong panel của danh sách thay vì dựng màn ticket. Bàn phím mở panel, chuyển focus đến kết quả và quay lại nút sau khi đóng. Agent đã đối chiếu. PO review FE-04.02 đang chờ.

Mở http://127.0.0.1:3113/login?returnTo=%2Fadmin%2Fusers, đăng nhập admin@demo.invalid với mật khẩu DEMO demo. Cuộn bảng nếu cần.

1. DEMO ADMIN → Khóa. Kiểm tra cả tự khóa và bảo vệ Admin cuối. Chuyển vai trò đề xuất sang Requester để thử bảo vệ Admin cuối khi hạ quyền.
2. DEMO IT_MANAGER → Đổi phòng ban → Nhân sự. Kiểm tra công việc đang xử lý, ứng viên DEMO và báo thu hồi phiên nếu áp dụng.
3. DEMO TECHNICIAN → Khóa → bật tình huống khẩn cấp. Kiểm tra không có người thay thế, bị chặn, và quy trình bàn giao còn chờ quyết định D-40.
4. Nhân viên DEMO đã khóa → Mở khóa. Kiểm tra phiên cũ không được khôi phục và dòng danh sách vẫn ở trạng thái đã khóa vì đây là xem trước.

Bản xem trước không thực hiện thay đổi tài khoản, phiên, ticket hoặc công việc. Các tình huống khẩn cấp chỉ giải thích xung đột, không áp dụng chính sách mới. [Hồi quy](browser.log) · [Kiểm tra lại sau chỉnh bố cục](final-layout-browser.log).
