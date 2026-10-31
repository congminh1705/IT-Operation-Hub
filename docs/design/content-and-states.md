---
id: itoh-docs-design-content-and-states
title: "Nội dung giao diện, lỗi và trạng thái"
type: reference
domain: design
module: content
tags: [design, content, reference]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Chuẩn hóa thuật ngữ, thông báo, lỗi và nội dung trạng thái giao diện."
---

# Nội dung giao diện, lỗi và trạng thái

## Nguyên tắc lời văn

Viết ngắn, nói rõ việc đã xảy ra và bước tiếp theo. Dùng động từ cụ thể: Gửi yêu cầu, Tiếp nhận, Bắt đầu xử lý, Chờ phản hồi, Đề xuất giải quyết, Xác nhận đóng, Yêu cầu xử lý lại. Tránh “OK”, “Submit”, “Thành công” đứng riêng hoặc nội dung làm người dùng tưởng SLA là thời gian còn tính từ lúc nhận việc.

## Nội dung mẫu

| Tình huống | Nội dung đề xuất |
|---|---|
| Gửi thành công | “Đã tạo yêu cầu TKT-000123. Bạn có thể theo dõi trao đổi tại đây.” |
| Pending | “IT đang cần bạn bổ sung thông tin. Trả lời câu hỏi bên dưới để tiếp tục xử lý.” |
| Resolved | “IT đã đề xuất giải pháp. Hãy kiểm tra kết quả rồi xác nhận đóng hoặc yêu cầu xử lý lại.” |
| Closed | “Yêu cầu đã được bạn xác nhận hoàn tất. Nếu cần mở lại, liên hệ trưởng phòng IT.” |
| Internal composer | “Ghi chú nội bộ · Chỉ nhóm IT có quyền xem ticket.” |
| Public composer | “Trao đổi công khai · Người yêu cầu và IT có quyền sẽ xem được.” |
| Priority đề xuất | “Ưu tiên đề xuất: P3 — Trung bình. IT sẽ xác minh mức ảnh hưởng và khẩn cấp.” |
| Priority đổi | “Ngân sách mới áp dụng trên thời gian đã sử dụng. Lịch sử vi phạm vẫn được giữ.” |
| Resolution pause | “Tạm dừng khi chờ phản hồi. Đã dùng 2 giờ/8 giờ; còn6 giờ.” |
| Cấu hình SLA | “Chỉ áp dụng cho ticket được tạo sau khi lưu. Ticket hiện có giữ chính sách đã ghi nhận.” |
| Khóa user | “Tài khoản sẽ không thể đăng nhập và các phiên hiện tại sẽ bị vô hiệu. Lịch sử được giữ lại.” |

## Hợp đồng trạng thái

| State | Hành vi UI và focus | Điều tránh |
|---|---|---|
| Tải lần đầu | Giữ shell, skeleton vùng nội dung, thông báo đang tải cho công nghệ hỗ trợ | Flash dữ liệu user/role trước đó |
| Đang refresh | Giữ nội dung cũ với nhãn đang cập nhật, khóa action nếu version chưa xác thực | Xóa bảng rồi hiện0 |
| Chưa có dữ liệu | Giải thích chưa có yêu cầu/tài sản; CTA tạo nếu có quyền | Dùng dữ liệu demo để lấp |
| Filter rỗng | “Không có kết quả phù hợp”, giữ filter, có Xóa bộ lọc | Nói chưa có ticket trong hệ thống |
| Đang gửi | Đổi nhãn nút, chặn gửi lặp, vẫn đọc được form | Bỏ dữ liệu trước khi server xác nhận |
| Field error | Giữ form, lỗi sát input, liên kết accessible, focus đầu lỗi; summary nếu nhiều lỗi | Chỉ toast, xóa toàn form |
| Conflict | Banner “Thông tin đã thay đổi. Tải bản mới để kiểm tra trước khi gửi lại.”; giữ nháp | Ghi đè hoặc merge tự động trạng thái |
| Mất quyền bản ghi | Thông điệp404chung, dừng tải dữ liệu bảo vệ, lối về danh sách | Lộ tiêu đề/người tạo trong lỗi |
| Forbidden chức năng | Trang403 có heading, giải thích và lối về tổng quan | Tự cấp quyền do query scope |
| Hết phiên | Đăng nhập lại; bỏ nội dung bảo vệ khỏi màn hình | Để trang cache hiện nội bộ trên máy chia sẻ |
| Lỗi mạng chưa rõ kết quả | Nêu chưa xác nhận kết quả; kiểm tra ticket trước retry có khóa chống trùng | “Gửi thất bại” chắc chắn khi server có thể đã commit |
| Lỗi tải | Panel lỗi và Thử lại, thông tin mã hỗ trợ nếu có | Stack trace hoặc giả số0 |
| Thành công | Update dữ liệu nguồn, banner/toast ngắn, focus hợp lý | Nút giả hay số liệu chưa refresh |

## Lỗi tại trường

- Tiêu đề: “Nhập tiêu đề từ5đến180 ký tự.”
- Mô tả: “Mô tả thêm hiện tượng và thời điểm xảy ra, tối thiểu10 ký tự.”
- Pending: “Nhập câu hỏi hoặc thông tin bạn đang chờ người yêu cầu bổ sung.”
- Giải pháp: “Ghi cách xử lý và kết quả để người yêu cầu kiểm tra.”
- Lý do: “Nhập lý do thay đổi, tối thiểu10 ký tự.”
- Tệp: “Tệp này vượt10MB. Chọn tệp nhỏ hơn hoặc bỏ khỏi lần gửi.” / “Chỉ nhận PNG, JPEG, WebP và PDF.”
- Assignee: “Chọn người hoạt động thuộc nhóm phụ trách.”
- Cấp phát: “Tài sản đã được cấp hoặc vừa thay đổi. Tải lại để kiểm tra.”
- Mở lại: “Người phụ trách trước đây không còn đủ điều kiện. Trưởng phòng IT cần phân công lại trước khi mở lại.”

Độ dài trường là đề xuất cần test; không dùng lỗi đếm ký tự làm thay thế cho yêu cầu nội dung có nghĩa. Lỗi backend được ánh xạ sang các thông điệp này, không đưa message kỹ thuật trực tiếp ra giao diện.

## Glossary sản phẩm

| Thuật ngữ | Cách hiểu thống nhất |
|---|---|
| Requester / Người yêu cầu | User tạo ticket, không đồng nghĩa người đang giữ một role duy nhất |
| Technician / Kỹ thuật viên | Người IT trong nhóm có phạm vi xử lý |
| Assignee / Người phụ trách | Cá nhân đang chịu trách nhiệm trên ticket, phải thuộc nhóm |
| Open / Đã tiếp nhận | IT ghi nhận trong hàng đợi, chưa phải phản hồi đầu tiên |
| Pending / Chờ phản hồi | Chờ người yêu cầu; pause giải quyết |
| Resolved / Đã giải quyết | IT có giải pháp, chờ xác nhận; resolution dừng |
| Closed / Đã đóng | Người yêu cầu xác nhận; chỉ M/A được mở lại có lý do |
| SLA phản hồi | Thời gian từ tạo đến public comment đầu hợp lệ của IT |
| SLA giải quyết | Tổng thời gian hoạt động; không tính Pending/Resolved/Closed |
| Snapshot | Chính sách được ghi nhận cho ticket; UI thường gọi “Chính sách trên yêu cầu” |
| Assignment / Lượt cấp phát | Một lần giao tài sản có đầu/cuối, lịch sử không bị xóa |

## Nội dung điều phối, phê duyệt và KB

| Tình huống | Nội dung đề xuất / yêu cầu |
|---|---|
| Ticket preview | “Chưa tạo yêu cầu. Kiểm tra nội dung rồi xác nhận.” CTA “Xác nhận tạo yêu cầu” hoặc “Chỉnh trong form” |
| Policy chưa cấp | “Quy trình chưa được cấp quyền tự động. Kế hoạch đang ở bản nháp.” |
| Thiếu dữ liệu | “Cần bổ sung danh sách nhân viên, cấu hình máy hoặc hạn bàn giao trước khi lập kế hoạch.” Chỉ hỏi field thực sự thiếu |
| Không nghiệm | “Chưa có người đủ điều kiện nhận việc trong khoảng này. Cần quản lý điều chỉnh nguồn lực hoặc kế hoạch.” |
| Dependency | “Chưa thể bắt đầu: công việc phụ thuộc chưa hoàn thành.” |
| Đã đề xuất | “Phương án đã được tạo, chưa áp dụng thay đổi.” |
| Giao việc thành công | “Đã giao công việc cho [người có quyền hiển thị].” Chỉ sau service xác nhận commit |
| Đang chờ duyệt | “Cần quản lý quyết định phương án này.” Không nói đã giao |
| Approval stale | “Dữ liệu đã thay đổi từ lúc đề xuất. Đánh giá lại trước khi duyệt.” Giữ lý do đang nhập |
| Approved, chờ execution | “Đã duyệt phương án. Đang kiểm tra điều kiện thực thi.” |
| Manual lock | “Phân công đã được quản lý khóa. AI sẽ không tự thay đổi.” |
| Provider/broker lỗi | “Chưa hoàn tất điều phối. Các thao tác thủ công vẫn dùng được.” Nêu trạng thái retry/failed thực tế |
| Budget/usage | “Đã dừng trước giới hạn kiểm thử.” / “Chi phí chưa xác định” nếu không có usage, không ghi 0 USD |
| KB bị thu hồi | “Nguồn không còn khả dụng trong phạm vi của bạn.” Không lộ title/snippet cấm |

Glossary: Ticket = yêu cầu/SLA; Task = công việc thực thi; Plan = tập task/phụ thuộc có phiên bản; Allocation = phân bổ công sức theo kỳ; AssetAssignment = lượt cấp phát tài sản (khác task assignment); Approval = quyết định phương án, không phải execution; AI_COORDINATOR = danh tính dịch vụ giới hạn theo policy.

Error/empty/loading/forbidden/conflict của OPS dùng hợp đồng chung. Source/record ID kỹ thuật chỉ có ở vùng tra cứu cần thiết, không trộn vào form nghiệp vụ thường.
