# FE-04.03 — Đối chiếu phòng ban và danh mục

Chromium, Admin DEMO, reduced motion. Hai mẫu đã mở trước triển khai.

| Màn | Mẫu desktop / mobile | Ứng dụng desktop / mobile |
| --- | --- | --- |
| Phòng ban | [1440](reference-departments-1440.png) / [390](reference-departments-390.png) | [1440](actual-departments-1440.png) / [390](actual-departments-390.png) |
| Danh mục | [1440](reference-categories-1440.png) / [390](reference-categories-390.png) | [1440](actual-categories-1440.png) / [390](actual-categories-390.png) |

Bố cục giữ bảng, nút thêm teal và thẻ kiểm tra bên cạnh. Mobile xếp thẻ dọc, bảng cuộn trong khung riêng. Ứng dụng thêm chuyển màn, các nút sửa/ngừng sử dụng, biểu mẫu và lựa chọn DEMO để đối chiếu lịch sử. Mẫu không minh họa trạng thái ngừng sử dụng; dùng trạng thái xám có nhãn. Nhóm tiếp nhận hiển thị IT Support dưới dạng fixture, phần cấu hình thuộc FE-04.04. Agent đã đối chiếu; PO review đang chờ.

Mở http://127.0.0.1:3115/login?returnTo=%2Fadmin%2Fdepartments bằng admin@demo.invalid với mật khẩu DEMO demo. Thử thêm, báo tên trùng, đổi tên Kế toán hoặc Tài khoản, chọn ngừng sử dụng rồi hủy hoặc xác nhận. Kiểm tra bản ghi vẫn tra cứu được trong lịch sử và biến mất khỏi lựa chọn mới. Form tạo người dùng cũng loại phòng ban đã ngừng. Thử requester@demo.invalid để thấy bị chặn.

Dữ liệu chỉ ở bộ nhớ ứng dụng. [Hồi quy Chromium](browser.log) · [Kiểm tra lại trên build cuối](final-browser.log).
