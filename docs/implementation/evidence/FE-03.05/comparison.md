# FE-03.05 — Bàn giao A1

Cùng viewport 1440×1000 và 390×1000, Chromium, Requester, reduced motion. Các màn đăng nhập và hồ sơ đã được PO duyệt ở các task trước. Lượt đối chiếu FE-03.05 là kiểm tra của agent, bộ ảnh mới đang chờ PO.

| Màn | Mẫu desktop / mobile | Ứng dụng desktop / mobile |
| --- | --- | --- |
| Login | [1440](reference-login-1440.png) / [390](reference-login-390.png) | [1440](actual-login-1440.png) / [390](actual-login-390.png) |
| Hồ sơ | [1440](reference-profile-1440.png) / [390](reference-profile-390.png) | [1440](actual-profile-1440.png) / [390](actual-profile-390.png) |

Mẫu là login.html và 01-account.html#profile. Login giữ bố cục đã duyệt. Trên mobile card ứng dụng thấp hơn mẫu khoảng 18px và footer có helper DEMO thay mục catalog. Hồ sơ giữ form và thẻ tài khoản/bảo mật, xếp dọc trên mobile. Mẫu có điện thoại, chức danh và phòng ban, các trường này không thuộc DTO mock. Ứng dụng có email chỉ đọc và nút lưu trực tiếp. Mẫu login không có trạng thái riêng cho việc quay lại sau đăng xuất. FE-03.05 xác minh UI hiện có và không thay giao diện.

Hai test A1 đi qua bốn tài khoản trong cùng tab, lưu tên, mở form mật khẩu, xem lỗi xác nhận, đăng xuất bằng phím, dùng Back rồi đăng nhập lại. Kiểm tra quyền menu và tên/email chủ phiên, sau đó trở lại Admin để kiểm tra tên fixture đã khôi phục. Bộ hồi quy phiên xác nhận expiry/revoke/401, xóa cache và loại phản hồi cũ sau logout/đổi tài khoản. Bộ hồi quy mật khẩu xác nhận kết quả thành công và lỗi DEMO. [Log Chromium](browser.log).

## Handoff API01

| Hành vi frontend | Hợp đồng tích hợp |
| --- | --- |
| Login rồi xác định principal | GET /auth/csrf, POST /auth/login, GET /auth/me. Quyền và danh tính từ phiên xác thực. |
| Logout và xóa cache | POST /auth/logout. UI hiện xóa theo phiên DEMO trong bộ nhớ; tích hợp phải xác minh server invalidation, cookie/CSRF và xử lý kết quả chưa xác nhận. |
| Hồ sơ chính mình | PATCH /auth/profile. Chỉ display_name và expectedVersion theo mock hiện tại; xử lý xung đột, không nhận role/email/userId từ client. |
| Đổi mật khẩu | POST /auth/password. Tiêu chí mật khẩu thật, hashing và thu hồi phiên thuộc backend/tích hợp. |

Giữ UI guard và cache phân vùng theo principal, scope và epoch. Xóa/hủy cache khi kết thúc phiên hoặc chuyển tài khoản, bỏ kết quả đến muộn. Browser fixture kiểm tra NFR02/16 phía frontend; việc thử lại cookie cũ và xác nhận server authorization vẫn thuộc tích hợp. A1 có dữ liệu kiểm tra frontend, còn PO review FE-03.05 và rà soát đóng Parent. FE-03.01 có nợ kiểm tra chi tiết về auth delay/network và vòng đời hiệu ứng/zoom như hồ sơ cũ đã ghi; hồi quy A1 không thay thế toàn bộ các ca đó. FE-02 tracker vẫn EPIC_IN_PROGRESS, cần đối chiếu tiêu chí Parent và trạng thái PR trước khi đóng. FE-04.01 là ứng viên kế tiếp sau khi FE-03.05 done và cổng PR Parent được giải quyết.

PO có thể mở http://127.0.0.1:3109/login. Dùng requester@demo.invalid, technician@demo.invalid, it_manager@demo.invalid, admin@demo.invalid với mật khẩu DEMO không rỗng như demo. Đăng nhập, chỉnh tên, thử xác nhận mật khẩu sai, đăng xuất bằng menu tài khoản, nhấn Back rồi đăng nhập vai trò khác. Kiểm tra phiên và hồ sơ mới đúng tài khoản. Các tình huống chậm/hết hạn có trong /preview/session.
