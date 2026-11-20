# FE-04.04 — So sánh màn Nhóm IT

Admin DEMO, Chromium reduced motion, 1440×1000 và 390×1000. Mẫu 08-admin-states.html#teams được mở trước triển khai.

| Viewport | Mẫu | Ứng dụng |
| --- | --- | --- |
| 1440×1000 | [Mẫu](reference-1440.png) | [Thực tế](actual-1440.png) |
| 390×1000 | [Mẫu](reference-390.png) | [Thực tế](actual-390.png) |

Bảng nhóm, thành viên/phạm vi và thẻ kiểm tra giữ bố cục Mac/Teal. Ứng dụng thêm form và kết quả xem trước để thực hiện thao tác thật trong DEMO. Thẻ bên phải xếp dưới bảng trên mobile; bảng cuộn riêng. Mẫu không có trạng thái riêng cho intake không hợp lệ hoặc đang cần bàn giao. Ứng dụng dùng thông báo và chặn nút lưu. Shell trong ảnh có chỉnh sửa tìm kiếm riêng đang giữ ở working tree. PO review chưa thực hiện.

Mở http://127.0.0.1:3117/login?returnTo=%2Fadmin%2Fteams bằng admin@demo.invalid và mật khẩu DEMO demo. Thử bỏ intake, chọn Legacy đã ngừng, chuyển intake sang Infrastructure, rồi thử ngừng IT Support. Thử gỡ DEMO TECHNICIAN ở IT Support và Infrastructure để phân biệt nhóm đang có công việc với nhóm không có. Màn Danh mục phản ánh nhóm tiếp nhận mới. Đăng nhập technician@demo.invalid để thử truy cập bị chặn.

Chỉ dữ liệu bộ nhớ. Transfer-required hiển thị công việc cần xử lý và chặn thay đổi; không thực hiện chuyển ticket/task và không thay thế kiểm tra quyền backend. [Log Chromium](browser.log).
