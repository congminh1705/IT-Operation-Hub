# Yêu cầu chất lượng ảnh hưởng tới UX

Đây là mục tiêu thiết kế/kiểm thử tương lai, không phải kết quả đo. Ngưỡng hiệu năng cần hiệu chỉnh với môi trường và quy mô dữ liệu sau M1.

| ID | Yêu cầu kiểm chứng được | Cách xác nhận tương lai |
|---|---|---|
| NFR01 | Mọi đọc/ghi kiểm tra phiên, role và scope bản ghi; cả count, lookup, tệp và notification | Negative test đổi ID/role/team và đọc trực tiếp API |
| NFR02 | Khóa tài khoản thu hồi mọi phiên; logout vô hiệu phiên hiện tại | Dùng cookie/phiên cũ gọi lại không được truy cập |
| NFR03 | Mutation nhiều bản ghi nhất quán, có version; không lost update | Hai người đổi trạng thái/nhận ticket/cấp tài sản cùng lúc |
| NFR04 | Dữ liệu tồn tại sau restart, có cơ chế backup được chọn khi triển khai | Restart ứng dụng/DB, đối chiếu ticket/comment/assignment |
| NFR05 | SLA chuẩn UTC, 24/7, Pending/reopen/priority chính xác; worker idempotent | Bộ ví dụ thời gian cố định và chạy worker lại nhiều lần |
| NFR06 | Tệp riêng tư, allowlist, ≤10 MB/tệp, ≤5/lần, quyền theo nội dung cha | Biên kích thước, giả MIME, note attachment và quyền sau chuyển nhóm |
| NFR07 | Phản hồi lỗi thống nhất; giữ form, chỉ rõ trường, không lộ stack hoặc bí mật | Kiểm tra validation, hết phiên, không quyền, xung đột, lỗi mạng |
| NFR08 | Mục tiêu WCAG 2.2 AA; có nhãn, bàn phím, focus, không chỉ màu | Review thủ công kết hợp công cụ khi đã có UI thực thi |
| NFR09 | Dùng được ở320/390,768 và1440 CSS px; zoom200%, kiểm tra reflow ở320 px | Thử không mất tác vụ chính, không kẹt focus, bảng có phương án đọc |
| NFR10 | Danh sách phân trang20 mặc định, tối đa100; search/filter/sort có giới hạn | Test paging ổn định, cùng giá trị sort có tie-breaker |
| NFR11 | Mục tiêu đề xuất: p95 đọc danh sách≤2s, ghi≤3s trên tập20 user/60 ticket/30 asset trong môi trường được ghi nhận | Chưa là SLA hiệu năng production; đo và điều chỉnh sau |
| NFR12 | Worker kiểm tra tối đa60s/lần; UI hiển thị mốc dữ liệu gần nhất | Worker chạy độc lập khi không ai mở dashboard; có theo dõi lỗi vận hành |
| NFR13 | Audit đủ actor/thời gian/cũ/mới/lý do cho các thay đổi bắt buộc, không bí mật | Review event mẫu user role/SLA/ticket/asset |
| NFR14 | UI không truy cập DB, business rules dùng chung API/worker; khóa dependency khi khởi tạo | Architecture review và kiểm tra repository lúc triển khai |

Tham chiếu accessibility: [WCAG 2.2](https://www.w3.org/TR/WCAG22/). Phạm vi hiện tại chưa cho phép đo các tiêu chí trên; không đánh dấu PASS dựa trên bản vẽ.
