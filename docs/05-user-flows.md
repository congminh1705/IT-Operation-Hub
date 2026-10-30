# User journeys và task flows

Các journey là **giả thuyết trải nghiệm**, chưa mô tả hành vi đã quan sát. Flow thể hiện thiết kế đích và các nhánh lỗi cần kiểm chứng.

## Journey 1 — Nhân viên cần hỗ trợ

| Bước | Mục tiêu / câu hỏi | Điểm chạm | Rủi ro và hỗ trợ thiết kế |
|---|---|---|---|
| Nhận ra vấn đề | “Tôi gửi ở đâu?” | Dashboard cá nhân, CTA Tạo yêu cầu | Một CTA rõ, ví dụ hai loại yêu cầu |
| Gửi | “Tôi cần mô tả gì?” | SCR21 | Nhãn/gợi ý, priority tính tự động, asset tùy chọn |
| Theo dõi | “Có ai đang xử lý không?” | SCR22, notification | Tên nhóm/người, phân biệt tiếp nhận và phản hồi |
| Bổ sung | “IT đang chờ tôi làm gì?” | Banner Pending, composer public | Hiện câu hỏi gần nhất; gửi câu trả lời tự resume |
| Kiểm tra | “Vấn đề đã ổn chưa?” | Banner Resolved, giải pháp | Hai lựa chọn đóng/mở lại có ngữ cảnh |
| Hoàn tất | “Lần sau có xem lại được không?” | Closed, timeline | Chỉ đọc; cần tiếp tục sau đóng liên hệ M/A |

![Sơ đồ XMind — 07-flow-requester](xmind/previews/07-flow-requester.svg)

[Mở file XMind](xmind/04-user-flows.xmind)

## Journey 2 — Technician bắt đầu và xử lý việc

| Bước | Câu hỏi | Thiết kế |
|---|---|---|
| Chọn việc | Việc nào đã giao, việc nào nhóm chưa nhận? | Hai hàng đợi, filter SLA, sort rõ |
| Nhận | Có người vừa nhận trước không? | Version conflict; không ghi đè |
| Hiểu bối cảnh | Đã trao đổi gì, thiết bị có vấn đề gì trước đây? | Public conversation, note nội bộ theo quyền, asset liên quan |
| Xử lý | Tôi đang gửi cho ai? | Composer có nhãn audience và màu phụ trợ |
| Chờ | Cần người yêu cầu bổ sung thông tin nào? | Pending bắt buộc câu hỏi public |
| Kết thúc phần IT | Requester kiểm tra lại bằng cách nào? | Giải pháp có kết quả/hướng kiểm tra, chuyển Resolved |

![Sơ đồ XMind — 08-flow-technician](xmind/previews/08-flow-technician.svg)

[Mở file XMind](xmind/04-user-flows.xmind)

## Journey 3 — Manager điều phối

Từ KPI hiện tại → danh sách đúng tập → kiểm tra impact/urgency và nội dung → giao/chuyển nhóm → xem tải mới và lịch sử. Nếu cần đổi priority, dialog hiển thị ngân sách mới trên thời gian đã dùng và yêu cầu lý do; không hứa “gia hạn từ bây giờ”.

![Sơ đồ XMind — 09-flow-manager](xmind/previews/09-flow-manager.svg)

[Mở file XMind](xmind/04-user-flows.xmind)

## Flow 4 — Tài sản

![Sơ đồ XMind — 10-flow-asset](xmind/previews/10-flow-asset.svg)

[Mở file XMind](xmind/04-user-flows.xmind)

Không có nút cấp phát trên thiết bị Đang sửa chữa/Ngừng sử dụng. Với thiết bị Đang sử dụng, thao tác phù hợp là thu hồi; không “chuyển người” bằng sửa metadata.

## Flow 5 — Admin khóa user hoặc đổi membership

![Luồng quản trị XMind](xmind/previews/11-flow-admin.svg)

[Mở file XMind](xmind/04-user-flows.xmind)

Mở user/thành viên → xem vai trò và ticket đang giao → chọn chuyển giao/bỏ assignment phù hợp → xác nhận → server kiểm tra Admin cuối cùng và version → thu hồi quyền/phiên → lưu audit. Nếu không giải quyết được tác động, giữ màn hình và giải thích từng ticket cần xử lý; không báo khóa thành công trước khi thu hồi phiên.

## Flow 6 — Xung đột và phục hồi lỗi

![Sơ đồ XMind — 12-flow-conflict](xmind/previews/12-flow-conflict.svg)

[Mở file XMind](xmind/04-user-flows.xmind)

Tải bản mới không tự hợp nhất trạng thái, priority hoặc assignee. Nội dung nhạy cảm chưa gửi không được lưu trong URL/localStorage. Kết quả không rõ do mạng cần cơ chế chống trùng khi triển khai.

## Flow 7 — Thông báo

![Luồng thông báo XMind](xmind/previews/13-flow-notification.svg)

[Mở file XMind](xmind/04-user-flows.xmind)

Sự kiện → xác định người còn quyền → lưu thông báo với khóa chống trùng → badge unread → user mở danh sách → mở ticket qua kiểm tra quyền hiện tại → đánh dấu đọc. Nếu đã chuyển nhóm/mất quyền thì hiển thị thông báo chung không có preview nhạy cảm, không mở lại snapshot riêng tư từ thời điểm gửi.

## Mẫu điều hướng kết thúc tác vụ

Sau tạo ticket → chi tiết ticket, có thông báo mã đã tạo. Sau dialog thành công → đóng dialog, refresh phần bị ảnh hưởng, focus về trigger hoặc banner kết quả. Sau hủy/đóng → vẫn ở chi tiết để đọc lịch sử. Sau lỗi field → giữ dialog/form và focus trường đầu lỗi; sau conflict → focus banner giải thích thay đổi.
