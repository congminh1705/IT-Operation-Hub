# Hướng kết hợp do PO chọn — 12/11/2026

- Giao diện chung theo `prompt-dashboard/site/`: nền sáng, sidebar sáng, xanh teal và Inter. Áp dụng cho cả bốn dashboard theo vai trò.
- Riêng vùng **Không gian điều phối** của Manager/Admin dùng SVG tương tác và hệ màu navy/cyan/lime của `night-city/night.js` và `night-city/dispatch.css`.
- Requester/Technician giữ bố cục và scope riêng, không thêm tổng quan điều phối tổ chức.
- Chọn nhóm, lớp Yêu cầu / Nhân lực / SLA, xem chi tiết và lọc hàng đợi dùng cùng tập DEMO. Không có API hoặc ghi nghiệp vụ.
- Màn đăng nhập giữ bản đã chốt trước đó.

Wrapper React truyền `dispatch=night` cho Manager/Admin. `dashboard.js` chỉ tải panel khi có tham số này; không tải `night.css` vào bản sáng, nên màu nền và điều hướng chung không đổi. Bản Night City độc lập vẫn dùng được để đối chiếu.

Đây là cấu hình format được PO duyệt theo D-51 cho toàn bộ màn. Toàn bộ 47 specimen và bốn dashboard đã có nguồn thiết kế/ảnh mới; các task đã được cập nhật chỉ dẫn v1.3. Việc triển khai ứng dụng và nghiệm thu từng task vẫn tách biệt với bàn giao thiết kế.

PO approved this format for all screens on 13 November 2026 under [D-51](../../../approved-format.md). The preview is now the approved format reference; individual feature screens still require task-owned implementation and visual evidence.
