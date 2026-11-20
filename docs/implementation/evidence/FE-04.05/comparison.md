# FE-04.05 — Đối chiếu trình chỉnh SLA

Admin DEMO, Chromium reduced motion. Mẫu 08-admin-states.html#sla được mở trước triển khai.

| Viewport | Mẫu | Ứng dụng |
| --- | --- | --- |
| 1440×1000 | [Mẫu](reference-1440.png) | [Thực tế](actual-1440.png) |
| 390×1000 | [Mẫu](reference-390.png) | [Thực tế](actual-390.png) |

Ứng dụng giữ bảng ngân sách P1–P4, bộ chọn ưu tiên, hai trường phút, lý do và cột lịch sử. Mobile xếp phần lịch sử dưới form. Bổ sung so sánh ngân sách trước/sau, xác nhận lưu và đối chiếu ticket cũ/mới. HTML mẫu chưa có trạng thái lỗi và xác nhận riêng. Ảnh có thay đổi tìm kiếm cục bộ đang được giữ ngoài commit. Agent đối chiếu, PO review đang chờ.

Mở http://127.0.0.1:3118/login?returnTo=%2Fadmin%2Fsla bằng admin@demo.invalid và mật khẩu DEMO demo. Với P3, thử nhập 0 hoặc -1, kiểm tra lỗi và dữ liệu form. Sau đó nhập 75/540 phút cùng lý do. Mở xem trước v3 → v4 rồi hủy. Kiểm tra bản nháp còn nguyên và phiên bản vẫn là v3. Xem trước lại và xác nhận. Kiểm tra lịch sử có v4, TKT-000125 vẫn v3 với 60/480 phút, mẫu ticket mới dùng v4 với 75/540 phút.

Đây là fixture trong bộ nhớ. Không có lưu trữ thật hoặc thay đổi SLA trên ticket thật. [Log kiểm tra](browser.log).
