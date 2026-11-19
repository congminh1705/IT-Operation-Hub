# FE-03.04 — Đối chiếu màn đổi mật khẩu

Mẫu `docs/design/final/01-account.html#security` được mở trong Chromium trước khi triển khai. Cặp ảnh cùng kích thước, vai trò Requester, trạng thái ban đầu và reduced motion.

| Viewport | Mẫu | Ứng dụng |
| --- | --- | --- |
| 1440×1000 | [Mẫu](reference-1440.png) | [Thực tế](actual-1440.png) |
| 390×1000 | [Mẫu](reference-390.png) | [Thực tế](actual-390.png) |

Ứng dụng dùng thẻ một cột rộng tối đa 780px, ba trường và thông báo “Mật khẩu không đi qua AI” như mẫu. Các khác biệt: bổ sung nút hiện/ẩn từng trường, quy tắc DEMO trước khi nhập, nhãn lưu thực tế thay cho nút xem trước của mẫu, shell và footer ứng dụng hiện có. Mẫu không có trạng thái lỗi/đăng nhập lại riêng. Ứng dụng dùng phản hồi có focus và vùng thông báo có sẵn trên login. Agent đối chiếu ở cả hai viewport. PO review đang chờ.

Mở http://127.0.0.1:3107/login?returnTo=%2Fprofile%2Fsecurity với requester@demo.invalid và mật khẩu DEMO không rỗng. Thử ô trống, xác nhận không khớp, các nút hiện/ẩn và Hủy. Nhập giá trị giả hợp lệ, gửi, kiểm tra thông báo kết thúc phiên và đăng nhập lại với form trống. Tại /preview/session, chọn REQUESTER rồi Wrong current password hoặc Password network error trước khi chọn Open password form. Hai lỗi phải giữ phiên hiện tại và đưa focus đến phản hồi.

Gateway mô phỏng kết quả, không lưu hoặc so sánh mật khẩu thật. Việc đăng nhập lại dùng quy tắc của DEMO. [Log Chromium](browser.log).
