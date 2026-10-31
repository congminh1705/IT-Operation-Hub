---
id: itoh-docs-05-user-flows
title: "User journeys và task flows"
type: reference
domain: design
module: workflows
tags: [design, workflows, reference]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Mô tả hành trình nghiệp vụ, nhánh ngoại lệ và kết thúc tác vụ."
---

# User journeys và task flows

Các journey là **giả thuyết trải nghiệm**, chưa mô tả hành vi đã quan sát. Flow thể hiện thiết kế đích và các nhánh lỗi cần kiểm chứng.

Bảy hình Journey 1–3 và Flow 4–7 là luồng hoạt động có hướng: khung là hành động kèm bên chịu trách nhiệm, hình thoi là điều kiện và nhãn mũi tên là nhánh xử lý. Viền xanh đậm có lớp xanh sáng bên ngoài giúp tách khung; màu phụ luôn có nhãn. Đọc từng flow cùng BR/ma trận quyền; đây không phải cây chủ đề, state machine đầy đủ hoặc bằng chứng quy trình doanh nghiệp đã được xác nhận.

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

Trưởng phòng IT xác nhận dữ liệu kỹ năng/lịch/capacity và workflow, thiết lập policy có giới hạn, rồi theo dõi run/action, tiến độ và ngoại lệ. AI tự điều phối trong grant hiện hành; không bắt buộc Trưởng phòng giao từng ticket/task. Khi cần can thiệp, M/A có thẩm quyền xem before/after, nguồn, version và tác động trước khi duyệt hoặc từ chối. Domain service kiểm lại quyền/policy/capacity/lock trước commit; Approved chưa phải Succeeded. Thiếu nguồn lực thì xử lý ngoại lệ, không ép giao. Không có cấp Trưởng nhóm IT.

Phân công/chuyển nhóm thủ công là can thiệp có thẩm quyền. Nếu đổi priority, dialog hiển thị ngân sách mới trên thời gian đã dùng và yêu cầu lý do; không hứa “gia hạn từ bây giờ”. Quản trị user/role vẫn chỉ thuộc Admin.

![Sơ đồ XMind — 09-flow-manager](xmind/previews/09-flow-manager.svg)

[Mở file XMind](xmind/04-user-flows.xmind)

## Flow 4 — Tài sản

![Sơ đồ XMind — 10-flow-asset](xmind/previews/10-flow-asset.svg)

[Mở file XMind](xmind/04-user-flows.xmind)

Không có nút cấp phát trên thiết bị Đang sửa chữa/Ngừng sử dụng. Với thiết bị Đang sử dụng, thao tác phù hợp là thu hồi; không “chuyển người” bằng sửa metadata.

## Flow 5 — Admin khóa user hoặc đổi membership

![Luồng quản trị XMind](xmind/previews/11-flow-admin.svg)

[Mở file XMind](xmind/04-user-flows.xmind)

Mở user/thành viên → xem vai trò và ticket/task đang giao → chọn chuyển giao/bỏ assignment phù hợp, giữ dependency/capacity và task đang làm/lock → xác nhận → server kiểm tra Admin cuối cùng và version → thu hồi quyền/phiên → lưu audit. Nếu không giải quyết được tác động, giữ màn hình và giải thích từng ticket cần xử lý; không báo khóa thành công trước khi thu hồi phiên.

**Cần quyết định D-40:** cơ chế thu hồi quyền khẩn khi chưa có người thay hợp lệ, nhất là ticket In Progress/Pending và task đang làm/khóa. Hình đánh dấu nhánh này chưa hoàn tất thiết kế; không xem chặn thay đổi không hợp lệ là quy trình offboarding doanh nghiệp đã được duyệt.

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

## Flow 8 — Onboarding và automation mục tiêu

![Automation onboarding và nhánh ngoại lệ](diagrams/automation-flow.svg)

Đây là flow thiết kế, không engine đã chạy. Không giữ transaction/lock trong lúc chờ model; bước thực thi đọc lại snapshot và kiểm tra ràng buộc trước commit. Nhánh chuẩn: kiểm kê → chuẩn bị máy → cài đặt; đề nghị cấp tài khoản cho Admin có thể song song khi đủ đầu vào; kiểm tra chờ hai nhánh → bàn giao. Dependency không cho start sớm.

### Task DAG minh họa — dữ liệu DEMO

![Task, phụ thuộc và trách nhiệm](diagrams/onboarding-task-dag.svg)

| Task DEMO | Kết quả | Công sức mẫu | Phụ thuộc / người thực hiện |
|---|---|---|---|
| T01 | Kiểm kê đủ 10 máy theo cấu hình | 30 phút | Đầu vào đã xác minh; Technician/hardware; thiếu máy chuyển ngoại lệ |
| T02 | Chuẩn bị máy | 120 phút | T01 Done; Technician/hardware |
| T03 | Cài cấu hình | 180 phút | T02 Done; Technician/software |
| T04 | Tạo tài khoản sau xác minh thẩm quyền | 60 phút | Đủ dữ liệu cấp tài khoản; Admin thực hiện, AI chỉ giao task |
| T05 | Kiểm tra tích hợp | 60 phút | T03 và T04 Done; người IT có quyền |
| T06 | Bàn giao | 60 phút | T05 Done; người IT có quyền ghi kết quả |

Đây là công sức cho kịch bản tổng hợp 10 nhân viên, không là ước lượng thực địa hoặc policy đã phê duyệt. Không nhân các giá trị này thành định mức doanh nghiệp. Template/skill/calendar/capacity phải được xác nhận theo D-40 trước tự giao. T04 có thể chạy song song nhánh máy khi đủ đầu vào; việc Done của T06 không tự đóng ticket.

## Flow 9 — Nghỉ phép và phê duyệt ngoại lệ

![Nghỉ phép, ứng viên và kiểm soát giao lại](diagrams/replanning-flow.svg)

M cập nhật absence/skills/capacity có version → domain + outbox → worker tìm task chịu ảnh hưởng → kiểm current policy/candidates/load → chưa bắt đầu/không lock/còn khả thi thì giao lại → task đang làm/lock/vượt quyền hoặc không đủ người thì tạo approval có before/after/impact/reason.

M approve/reject → quyết định lưu riêng → recheck quyền/policy/versions/capacity → succeeded/failed/conflict. Snapshot cũ không được dùng lại khi người nhận đã bận hoặc policy tắt. Không nghiệm thì cần quản lý sửa nguồn lực/kế hoạch/cam kết qua quyền riêng, không nút duyệt ép vượt capacity.

### Ca điều phối lại cụ thể — dữ liệu DEMO

Tại 10:00, T02 đã Done, T03 chưa bắt đầu và chưa khóa, remaining 180 phút, deadline 14:00. Nhân sự A vắng 10:00–14:00. Trong cùng nhóm/hành động/skill được phép, B bận 10:00–11:00 rồi có cửa sổ 11:00–14:00 (180 phút), C chỉ rảnh 12:00–14:00 (120 phút). B là ứng viên khả thi trong ví dụ; C bị loại vì thiếu phút. Không suy ra mọi người đều rảnh hoặc chỉ kiểm tổng giờ mà bỏ cửa sổ lịch.

Nếu policy cho giao lại task chưa start, service phải đọc lại versions và giữ chỗ nguyên tử rồi mới giao B; lịch/tải đổi giữa ranking và commit thì Conflict/re-evaluate. Nhánh task khác đang làm/khóa cần ngoại lệ, không tự đổi assignee. Các giá trị DEMO không là lịch nhân sự thật hoặc quyết định capacity vận hành.

[Sequence lập/giao việc](diagrams/architecture.md#fig-seq01--ticket-đến-đề-xuất-và-hành-động) và [sequence phê duyệt](diagrams/architecture.md#fig-seq02--phê-duyệt-đến-kết-quả-thực-thi) làm rõ transaction, provider lỗi và stale approval.

## Flow 10 — Trợ lý tạo ticket và KB

Hội thoại → draft preview → user xác nhận đúng nội dung/version → service create idempotent bằng quyền user → trả mã đã lưu; chưa xác nhận thì chưa ticket/SLA/event. Chỉnh draft hủy xác nhận cũ; có thể mở SCR21 để sửa. Nháp reply vẫn phải IT gửi qua composer.

KB Draft → publisher được cấp review/publish version → index nền → reader theo Published/ACL/version → trả lời có nguồn mở được. Thu hồi ACL có hiệu lực ngay ở query và output/history; không đợi embedding. Lịch sử nội bộ không chuyển sang public.

## Nhánh lỗi và phạm vi hiện tại

Retry/redelivery không trùng domain; provider/output lỗi không tạo plan một phần; broker outage giữ outbox bền vững và luồng thủ công qua API; quét SLA nền có thể chậm trong lúc broker ngắt, cần cảnh báo và quét bù sau phục hồi từ PG, không reset đồng hồ. Manual lock và việc Done không tự bị lùi. Hết retry mở failed state để quản lý xử lý có audit. Các flow này mới đặc tả; không chạy model, worker hoặc test ở đợt tài liệu.
