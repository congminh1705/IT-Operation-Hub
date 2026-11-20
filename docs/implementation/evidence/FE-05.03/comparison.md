# FE-05.03 — Gửi, chi tiết và danh sách DEMO

| Màn | Mẫu 1440/390 | Ứng dụng 1440/390 |
| --- | --- | --- |
| Tạo | [1440](reference-create-1440.png) / [390](reference-create-390.png) | [1440](actual-create-1440.png) / [390](actual-create-390.png) |
| Chi tiết | [1440](reference-detail-1440.png) / [390](reference-detail-390.png) | [1440](actual-detail-1440.png) / [390](actual-detail-390.png) |

Cùng Requester, Chromium, reduced motion. Hai mẫu mở trước khi triển khai phần tương ứng. Mẫu ticket-active minh họa ticket đang xử lý có phần phản hồi công khai. Chi tiết đang nghiệm thu là ticket mới chờ tiếp nhận, chỉ hiển thị nội dung, mã, nhóm và SLA để xác minh điều hướng. Phản hồi công khai và nghiệp vụ chi tiết tiếp theo nằm ngoài task. Mẫu không có trạng thái gửi chưa rõ kết quả. UI sử dụng thông báo và nút kiểm tra kết quả. Thanh tìm kiếm trong ảnh có chỉnh sửa cục bộ giữ ngoài commit. PO review đang chờ.

Mở http://127.0.0.1:3121/login?returnTo=%2Ftickets%2Fnew bằng requester@demo.invalid / demo. Chọn Sự cố, Thiết bị, điền tiêu đề/mô tả DEMO, Cá nhân và Bình thường. Kiểm tra P4, xem trước, xác nhận gửi, rồi về danh sách và mở lại bản ghi. Với Yêu cầu dịch vụ, bật onboarding để thử các trường chỉ bắt buộc tại nhánh này. Thiết bị ngoài phạm vi không xuất hiện. Để thử lỗi, dùng /login?returnTo=%2Ftickets%2Fnew%3Fdemo%3Dunknown (cũng hỗ trợ failure hoặc stale), nhập lại dữ liệu thử nghiệm và kiểm tra bản nháp. Không nhập dữ liệu thật. Fixture chỉ lưu trong bộ nhớ; reload xóa bản ghi mới. [Log gộp](browser.log).
