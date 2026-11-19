# FE-04.01 — Đối chiếu danh sách và tạo người dùng

Admin DEMO, 1440×1000 và 390×1000, Chromium và reduced motion. Đã mở cả hai mẫu trước khi triển khai.

| Màn | Mẫu desktop / mobile | Ứng dụng desktop / mobile |
| --- | --- | --- |
| Người dùng | [1440](reference-users-1440.png) / [390](reference-users-390.png) | [1440](actual-users-1440.png) / [390](actual-users-390.png) |
| Tạo người dùng | [1440](reference-user-create-1440.png) / [390](reference-user-create-390.png) | [1440](actual-user-create-1440.png) / [390](actual-user-create-390.png) |

Danh sách giữ panel, tìm kiếm, lọc trạng thái và bảng. Trên mobile, bảng cuộn trong khung riêng để xem cột trạng thái; toàn trang không tràn ngang. Các thao tác đổi quyền/khóa và bộ lọc chi tiết của mẫu thuộc phạm vi kế tiếp. Form giữ hai cột desktop và xếp dọc mobile. Ứng dụng thêm mã yêu cầu xác minh và xác nhận lưu, dùng vai trò Requester duy nhất vì fixture này không có phê duyệt quyền IT. Khác biệt shell/fixture được giữ theo frontend hiện tại. PO review đang chờ.

Kiểm tra ở http://127.0.0.1:3111/login?returnTo=%2Fadmin%2Fusers bằng admin@demo.invalid và mật khẩu demo. Tìm tên/email hoặc lọc Đã khóa. Tạo bằng TKT-000123, tên Nhân viên DEMO B, demo-b@example.invalid, Kế toán và mật khẩu thử nghiệm bất kỳ không rỗng. Xem trước không hiển thị mật khẩu. Hủy không tạo bản ghi. Xác nhận tạo mới xuất hiện trong danh sách. Dùng TKT-000125 để thử lỗi xác minh và admin@demo.invalid để thử email trùng. Đăng nhập vai trò khác để kiểm tra truy cập bị chặn.

Dữ liệu lưu trong bộ nhớ ứng dụng. Bản ghi mới là fixture danh sách và không trở thành thông tin đăng nhập. Không tự chuyển ticket hoặc gửi email. [Log Chromium](browser.log).
