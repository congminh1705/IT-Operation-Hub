---
id: itoh-docs-requirements-account-provisioning
title: "Cấp tài khoản nội bộ"
type: reference
domain: domain
module: identity
tags: [domain, identity, reference]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Đặc tả trưởng phòng ban gửi ticket và Admin xác minh/cấp tài khoản."
---

# Cấp tài khoản nội bộ

**Đã thống nhất về nghiệp vụ ngày 30/10/2026 — D-29.** Đây là đặc tả cho bước triển khai sau này; hiện chưa có hệ thống tạo tài khoản chạy thật.

**Trưởng phòng tạo ticket yêu cầu cấp tài khoản ngay trong IT Operations Hub; Admin IT kiểm tra và cấp tại Quản trị → Người dùng.** Trưởng phòng sử dụng tài khoản đã có với vai trò Requester. Hệ thống giữ bốn vai trò hiện tại, không có đăng ký công khai.

## Trách nhiệm và phạm vi

| Bên tham gia | Trách nhiệm |
|---|---|
| Trưởng phòng | Đăng nhập bằng tài khoản hiện có, tạo ticket yêu cầu cấp tài khoản; bổ sung thông tin và xác nhận kết quả |
| Người có thẩm quyền nội bộ | Xác nhận nhu cầu cấp Technician, IT Manager hoặc Admin theo quy định doanh nghiệp; Admin ghi nhận kết quả hợp lệ trên ticket |
| Admin IT | Kiểm tra yêu cầu, tạo user, chọn phòng ban và vai trò; bàn giao thông tin đăng nhập; khóa tài khoản khi cần |
| Người dùng | Nhận tài khoản, đăng nhập, sử dụng hồ sơ và chức năng đổi mật khẩu trong phạm vi quyền |
| Người triển khai được ủy quyền | Khởi tạo Admin đầu tiên trong bước thiết lập hệ thống |

“Trưởng phòng” là chức danh tổ chức, không phải vai trò ứng dụng mới và không đồng nghĩa IT Manager. MVP dùng góc nhìn Requester để gửi yêu cầu; Admin xác minh chức trách và thẩm quyền đề nghị theo thông tin tổ chức trước khi cấp. Role Requester hoặc việc cùng phòng ban không tự chứng minh một người là trưởng phòng.

Không giới hạn toàn bộ danh mục Tài khoản chỉ cho trưởng phòng: mọi người vẫn có thể gửi các yêu cầu hỗ trợ tài khoản thông thường. Riêng yêu cầu cấp tài khoản cho nhân sự mới phải được Admin xác minh là đề nghị hợp lệ của trưởng phòng. Không tự cấp user từ nội dung ticket hoặc từ quyền Requester.

## Luồng cấp tài khoản

1. Trưởng phòng đăng nhập, chọn **Tạo yêu cầu → Yêu cầu dịch vụ → Danh mục Tài khoản**. Tiêu đề ví dụ: “Cấp tài khoản cho nhân viên mới”.
2. Trong mô tả, cung cấp họ tên nhân viên, email công ty, phòng ban, nhu cầu quyền và ngày bắt đầu làm việc nếu có. Không nhập mật khẩu. Ticket có người yêu cầu là trưởng phòng; nhân viên mới là đối tượng được đề nghị cấp, không thay thế requester của ticket.
3. Ticket đi qua nhóm tiếp nhận, phân công và xử lý theo luồng hiện có. Admin xác minh người đề nghị, thông tin nhân sự, email duy nhất và phòng ban hoạt động. Thiếu thông tin thì trao đổi trên ticket; chỉ chuyển Pending theo đúng điều kiện trạng thái và có câu hỏi công khai.
4. Mặc định cấp **Requester**. Với Technician, IT Manager hoặc Admin, phải có xác nhận của người có thẩm quyền; Admin ghi nhận kết quả kiểm tra/phê duyệt trên ticket trước khi tạo. Trưởng phòng không tự cấp vai trò cho mình hoặc người khác.
5. Chỉ Admin tạo user tại **Quản trị → Người dùng**, nhập mật khẩu ban đầu theo D-16. Membership nhóm được thiết lập riêng khi phù hợp; Technician không tự được tham gia mọi nhóm. Ticket không tự động tạo tài khoản.
6. Admin bàn giao địa chỉ ứng dụng, email đăng nhập và mật khẩu ban đầu cho người nhận qua kênh doanh nghiệp. Không đưa mật khẩu vào ticket, ghi chú nội bộ, giải pháp hoặc thông báo; không tự gửi email khi chưa cấu hình nhà cung cấp.
7. Nhân sự IT ghi giải pháp và chuyển Resolved theo luồng hợp lệ; trưởng phòng là requester nên xác nhận đóng hoặc yêu cầu xử lý lại. Người được cấp tài khoản đăng nhập và có thể đổi mật khẩu qua chức năng hiện có.

Tái sử dụng form ticket và trường mô tả hiện có, không thêm entity yêu cầu cấp tài khoản hoặc trạng thái ticket phê duyệt mới. Approval automation là đối tượng riêng, không thay quyền Admin/phê duyệt role IT D-29. Ngày bắt đầu làm việc chỉ là thông tin xử lý trong mô tả, không tự bổ sung trường bắt buộc hoặc lịch kích hoạt vào User. SLA bắt đầu khi tạo ticket và tuân thủ quy tắc hiện có; tạo user không tự chuyển trạng thái hoặc đóng ticket.

## Mật khẩu và Admin đầu tiên

- Mật khẩu ban đầu do Admin nhập; ứng dụng không trả lại mật khẩu đã lưu hoặc hiển thị lại sau khi tạo. Không ghi vào audit, log, ticket hay thông báo trong ứng dụng.
- Cách bàn giao cụ thể tuân thủ kênh nội bộ của doanh nghiệp. Chính sách mật khẩu và hỗ trợ quên mật khẩu vẫn cần refinement trước M1; không tự thêm reset qua email.
- Admin đầu tiên được tạo trong bước thiết lập bởi người triển khai được ủy quyền. Cách bootstrap kỹ thuật sẽ chốt ở M1; không đưa tài khoản/mật khẩu mặc định công khai vào môi trường vận hành.
- Sau bootstrap, Admin thiết lập các tài khoản trưởng phòng ban đầu theo danh sách được doanh nghiệp xác nhận để họ có thể gửi ticket. Đây là bước thiết lập ban đầu; luồng yêu cầu cấp tài khoản cho nhân sự mới vận hành qua ticket nêu trên.
- Các Admin tiếp theo được quản lý bằng chức năng tài khoản và yêu cầu phê duyệt vai trò nêu trên. Không khóa Admin hoạt động cuối cùng.

## Nghỉ việc hoặc ngừng truy cập

Trưởng phòng tạo yêu cầu dịch vụ trong hệ thống, nêu tài khoản cần ngừng truy cập; Admin xác minh và khóa user, thu hồi các phiên đăng nhập. Xử lý chuyển giao ticket đang mở và thu hồi tài sản theo các luồng hiện có. Không xóa tài khoản đã có lịch sử; mở khóa không khôi phục phiên cũ.

## Bản vẽ và dữ liệu minh họa

| Bản vẽ | Màn hình hiện có | Thời điểm / ý nghĩa |
|---|---|---|
| [Dashboard Requester/trưởng phòng](../design/wireframes/16-dashboard-requester.svg) | SCR10 | 30/10/2026 12:00; chỉ dữ liệu của Nguyễn Thu Hà, yêu cầu cần phản hồi/xác nhận và tài sản được cấp |
| [Dashboard Admin](../design/wireframes/17-dashboard-admin.svg) | Biến thể SCR12 | 30/10/2026 11:00; KPI tổ chức và hàng đợi Yêu cầu dịch vụ / Tài khoản, không coi mọi ticket Tài khoản là cấp mới |
| [Ticket cấp tài khoản](../design/wireframes/18-ticket-account-provisioning.svg) | SCR22, liên kết SCR60 | 30/10/2026 11:00; Admin xử lý TKT-000128, chưa tạo user; chỉ Admin có thao tác mở form tạo người dùng |

Ba hình dùng dữ liệu hư cấu, không phải seed hoặc ảnh ứng dụng. TKT-000128 do Nguyễn Thu Hà đề nghị cấp cho Võ Minh Khang, P3: tạo 09:00, phản hồi công khai 09:05, tiếp nhận 09:10, bắt đầu xử lý 09:15, xác minh 10:45. Lúc 11:00, phản hồi đã dùng 5 phút/4 giờ; giải quyết đã dùng 2/24 giờ, còn 22 giờ. Hình Requester thể hiện thời điểm sau đó: IT đã giải quyết lúc 11:30, chờ trưởng phòng kiểm tra; đây là hai thời điểm khác nhau của cùng ví dụ.

Dashboard cá nhân có 7 ticket: New 1, Open 1, In Progress 1, Pending 1, Resolved 1, Closed 2. Chưa xong = 4 theo MET01; cần phản hồi = Pending + Resolved = 2 theo MET11; “Đã giải quyết” đếm riêng trạng thái Resolved = 1; tài sản được cấp = 1 theo MET12. Không cộng các KPI thành tổng vì các tập có thể chồng lấn.

Dashboard Admin dùng KPI minh họa MET01–04 là 42/12/8/6, tách khỏi 6 ticket trong hàng đợi lọc; hình rút gọn 4 dòng. Tổng tổ chức và hàng đợi này là ví dụ thiết kế, chưa phải dataset đầy đủ để chạy query. Khi triển khai phải tính từ dữ liệu thật theo [metrics catalog](metrics-catalog.md).

## Đối chiếu nghiệm thu dự kiến

Các điều kiện này làm rõ **UC10/US13/AC13** cho bước trưởng phòng gửi yêu cầu và **UC05/US05/AC05** cho bước Admin tạo user; dùng lại UC04, UC07, UC15 và các bước giải quyết/đóng hiện có. D-29 vẫn dùng các mã lõi hiện có; UC/US-OPS bổ sung cho điều phối không tự cho phép cấp tài khoản hoặc thêm trạng thái ticket.

- Chỉ Admin tạo tài khoản; Requester, Technician và IT Manager gọi API trực tiếp bị từ chối.
- Form tạo user mặc định Requester; email phải duy nhất, role hợp lệ và phòng ban hoạt động.
- Trưởng phòng gửi ticket bằng Requester; gửi thành công chỉ tạo ticket, chưa tạo user. Admin xác minh chức trách người đề nghị và ghi nhận kết quả trên ticket; đề nghị không hợp lệ không được thực hiện cấp tài khoản.
- Cấp vai trò IT dựa trên phê duyệt đúng thẩm quyền; thay đổi role vẫn được ghi audit theo đặc tả hiện có.
- Sau giải quyết, requester là trưởng phòng xác nhận đóng hoặc mở lại theo trạng thái cho phép; người được cấp không trở thành requester của ticket.
- Sau tạo user, không có mật khẩu trong phản hồi, danh sách, audit hoặc thông báo; không có email tự gửi khi chưa cấu hình.
- Khóa tài khoản thu hồi phiên và giữ lịch sử; không khóa Admin cuối cùng.

Chưa chạy các điều kiện này trên ứng dụng. Đọc cùng [ma trận quyền](permissions-matrix.md), [quy tắc nghiệp vụ](business-rules.md), [UC05](../03-use-cases.md) và [quyết định thiết kế](../decisions/design-decisions.md).

## Quan hệ với onboarding và AI điều phối — thiết kế hiện hành

AI có thể chia/giao/theo dõi task “Xác minh và cấp tài khoản” cho người có quyền trong workflow đã duyệt, nhắc tiến độ và trình ngoại lệ; **không gọi tool tạo user/đổi role hoặc bàn giao mật khẩu**. Backend vẫn kiểm quyền Admin tại lần tạo tài khoản; một kỹ thuật viên được giao task không nhờ đó có thêm quyền quản trị. Nếu chỉ Admin mới đủ quyền thực hiện thì candidate phải thỏa cả quyền hành động lẫn skills/team/lịch/capacity.

Trưởng phòng IT (IT_MANAGER) cấu hình policy/duyệt ngoại lệ vận hành khác trưởng phòng ban gửi đề nghị bằng Requester. Approval automation không thay chứng cứ phê duyệt cấp vai trò IT và không tự đóng ticket. Kết quả cấp tài khoản được người thực hiện ghi; requester vẫn nghiệm thu theo BR-04. Chi tiết task/plan ở BR-14–18; không tạo code/API thực thi trong đợt tài liệu.
