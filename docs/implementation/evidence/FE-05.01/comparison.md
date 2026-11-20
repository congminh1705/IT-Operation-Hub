# FE-05.01 — Danh sách yêu cầu DEMO

Mở hai mẫu 02-tickets.html#tickets và #my-tickets trước triển khai. Chromium, reduced motion, so sánh 1440×1000 và 390×1000.

| Màn | Mẫu desktop / mobile | Ứng dụng desktop / mobile |
| --- | --- | --- |
| Hàng chờ IT | [Desktop](reference-tickets-1440.png) / [Mobile](reference-tickets-390.png) | [Desktop](actual-tickets-1440.png) / [Mobile](actual-tickets-390.png) |
| Yêu cầu của tôi | [Desktop](reference-my-tickets-1440.png) / [Mobile](reference-my-tickets-390.png) | [Desktop](actual-my-tickets-1440.png) / [Mobile](actual-my-tickets-390.png) |

Giữ cấu trúc Mac/Teal với bảng desktop và card mobile. Ứng dụng có dữ liệu đủ hai trang và thêm bộ lọc, sắp xếp, số dòng và chip xóa lọc. Form tạo và liên kết chi tiết thuộc các task tạo/điều hướng hoặc chi tiết tiếp theo. Thanh tìm kiếm shell trong ảnh có chỉnh sửa cục bộ giữ ngoài commit. Lỗi đọc DEMO dùng pattern phản hồi sẵn có. Agent đã đối chiếu, PO review còn chờ.

Mở http://127.0.0.1:3119/login?returnTo=%2Ftickets%3Fscope%3Dwork với mật khẩu DEMO demo. Tài khoản requester@demo.invalid thấy 4 bản ghi của mình dù URL yêu cầu work. technician@demo.invalid thấy 22 bản ghi thuộc nhóm, it_manager@demo.invalid hoặc admin@demo.invalid thấy 26 bản ghi DEMO (20 ở trang đầu). Chuyển giữa Của tôi/Công việc IT nếu được cấp quyền. Thử tìm VPN, lọc P4, đổi thứ tự, phân trang, đặt lại và dùng Back. Vai trò và nhóm lấy từ phiên, tham số tự thêm không cấp quyền.

Thử lỗi mô phỏng tại /login?returnTo=%2Ftickets%3Fscope%3Dmine%26q%3DVPN%26demo%3Dunavailable. Thử lại bỏ fixture lỗi nhưng giữ truy vấn. Không có dữ liệu thật hay backend. [Log trình duyệt](browser.log).
