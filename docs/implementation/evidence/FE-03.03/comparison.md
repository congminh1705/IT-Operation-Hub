# FE-03.03 — Đối chiếu hồ sơ cá nhân

Mẫu: `docs/design/final/01-account.html#profile`. Đã mở bằng Chromium trước khi sửa. Ảnh ở 1440×1000 và 390×1000, vai trò Requester, trạng thái ban đầu, giảm chuyển động.

| Viewport | HTML đã duyệt | Ứng dụng |
| --- | --- | --- |
| Desktop | [Mẫu](reference-1440.png) | [Thực tế](actual-1440.png) |
| Mobile | [Mẫu](reference-390.png) | [Thực tế](actual-390.png) |

Form và thẻ tài khoản/bảo mật giữ bố cục hai cột trên desktop, xếp dọc trên mobile. Ứng dụng dùng shell và tài khoản tổng hợp hiện có. Mẫu hiển thị số điện thoại, chức danh và phòng ban, nhưng DTO phiên hiện tại không có các trường đó. Form chỉ sửa tên hiển thị, hiển thị email chỉ đọc và vai trò hiện tại. Nút Lưu thay đổi thực hiện lưu trực tiếp thay cho nút xem trước của mẫu. Liên kết bảo mật đi đến route hiện có dành cho FE-03.04. Phản hồi lỗi dùng pattern của ứng dụng vì mẫu không có trạng thái lỗi riêng cho hồ sơ.

Agent đối chiếu giao diện và kiểm tra focus, không cuộn ngang trên hai viewport. PO review FE-03.03 đang chờ.

Mở http://127.0.0.1:3106/login?returnTo=%2Fprofile và đăng nhập `requester@demo.invalid` với mật khẩu DEMO không rỗng. Thử lưu tên, kiểm tra tên ở menu tài khoản, sửa rồi Hủy và thử tên chỉ có khoảng trắng. Tại /preview/session, chọn REQUESTER, chọn Profile conflict hoặc Profile network error rồi mở hồ sơ bằng liên kết thử nghiệm. Kiểm tra bản nháp còn nguyên và focus vào lỗi. Với xung đột, tải bản hiện tại rồi kiểm tra tên trước khi lưu lại.
