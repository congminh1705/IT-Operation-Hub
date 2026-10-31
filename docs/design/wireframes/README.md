---
id: itoh-docs-design-wireframes-readme
title: "Bộ bản vẽ UI/UX"
type: reference
domain: design
module: wireframes
tags: [design, wireframes, reference]
priority: 2
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: derived
purpose: "Điều hướng bản vẽ tới screen nguồn và nêu rõ dữ liệu minh họa/độ phủ."
---

# Bộ bản vẽ UI/UX

> **Thiết kế mục tiêu:** Chỉ tài liệu thiết kế; chưa triển khai/kiểm thử. AI trong MVP gồm trợ lý và điều phối theo policy; Ticket khác Task; KB/RAG trong phạm vi. Xem quyết định D-34–40 và tài liệu nguồn theo chủ đề.

**16 bản UI tĩnh (13 bản lõi và 3 bản AI) và 2 board thiết kế, phiên bản v0.4**, dùng dữ liệu hư cấu có nhãn. SVG là tài liệu thiết kế có thể phóng to, không có tương tác, không gửi request và không chứng minh ứng dụng đã có dữ liệu bền vững. Các thao tác lõi và AI đều thuộc phạm vi MVP; nghiệm thu yêu cầu chức năng thực tế thay cho tương tác hoặc phản hồi mẫu.

Mở trực tiếp SVG trong trình duyệt hoặc công cụ thiết kế để xem và chỉnh sửa. Các bản xuất PNG giao diện đã được bỏ; thư mục chỉ giữ SVG, tài liệu và [use-cases-overview.png](use-cases-overview.png) theo yêu cầu. Riêng login có [minh họa PNG nền trong suốt](../illustrations/login-it-support.png) nhúng trực tiếp trong SVG. Hiển thị font có thể khác nhẹ theo thiết bị.

| Bản vẽ SVG | Vai trò / nhiệm vụ | Điểm cần review |
|---|---|---|
| [01 — Đăng nhập](01-login.svg) | Tất cả · SCR01 | Một luồng truy cập, không đăng ký hoặc gửi mail giả |
| [02 — Dashboard Manager](02-dashboard-manager.svg) | M/A · SCR12 | Hàng đợi hiện tại tách khỏi phân tích theo kỳ; KPI có thể chồng lấn |
| [03 — Danh sách ticket](03-tickets.svg) | M/A · SCR20 | Tìm/filter/sort, trạng thái có chữ, SLA chỉ rõ loại đồng hồ |
| [04 — Tạo yêu cầu](04-create-ticket.svg) | Requester · SCR21 | Priority đề xuất, tài sản tùy chọn, tệp có giới hạn |
| [05 — Ticket Technician](05-ticket-technician.svg) | Assignee · SCR22 | Công khai/nội bộ, hành động phù hợp trạng thái và người phụ trách |
| [06 — Ticket Requester](06-ticket-requester.svg) | Chủ ticket Resolved · SCR22 | Giải pháp, xác nhận đóng/mở lại, hoàn toàn không có nội dung nội bộ |
| [07 — Tài sản](07-asset.svg) | M/A · SCR32 | User hiện tại qua assignment, history giữ lại, thu hồi rõ |
| [08 — Cấu hình SLA](08-admin-sla.svg) | Admin · SCR64 | P1–P4, đơn vị thời lượng, phiên bản, tác động ticket mới |
| [09 — Mobile](09-mobile.svg) | Requester · SCR20/22 | Hai view390 px, trả lời Pending và thao tác chính |
| [10 — Trạng thái UX](10-ux-states.svg) | Các vai trò · mẫu dùng chung | Validation, conflict, filter rỗng và tải lỗi |
| [11 — Trợ lý AI](11-ai-assistant.svg) | Requester · SCR-AI01/02 | Nguồn, preview rồi xác nhận tạo hoặc chỉnh form; chưa xác nhận chưa tạo |
| [12 — AI trong ticket](12-ai-ticket-assistant.svg) | Technician · SCR-AI01/02 | Tóm tắt public và nháp phản hồi, chưa gửi bình luận |
| [13 — Trạng thái AI](13-ai-states.svg) | Mẫu bổ sung | Lỗi, thiếu nguồn, mất quyền và tách nội bộ/công khai |
| [14 — Icon và component](14-icons-and-components.svg) | Board thiết kế | 44 icon, nhãn, focus, hover và loading |
| [15 — Responsive và motion](15-responsive-motion.svg) | Storyboard tĩnh | Desktop/tablet/mobile và các khung mở panel; chưa chạy animation |
| [16 — Dashboard Requester/trưởng phòng](16-dashboard-requester.svg) | Requester · SCR10 | Chỉ dữ liệu cá nhân; Pending/Resolved và yêu cầu nhân sự mới theo D-29 |
| [17 — Dashboard Admin](17-dashboard-admin.svg) | Admin · biến thể SCR12 | Hàng đợi dịch vụ/Tài khoản; KPI tổ chức tách biệt; quản lý user chỉ Admin |
| [18 — Ticket cấp tài khoản](18-ticket-account-provisioning.svg) | Admin · SCR22 → SCR60 | Xác minh đề nghị, mở form quản trị; không tự tạo user/giải quyết ticket |

[Use case tổng quan hiện hành — PNG](use-cases-overview.png) · [SVG nguồn](../../diagrams/use-cases-overview.svg). Đây là sơ đồ phụ lục, không tính vào 16 bản UI hoặc 2 board.

Các ảnh cũng được đính kèm trong [file UI/UX XMind](../../xmind/07-uiux.xmind); phần sơ đồ hành trình và cấu trúc dùng topic XMind chỉnh sửa được. Ảnh wireframe đính kèm không biến thành các control UI chỉnh sửa riêng trong XMind.

Xem [định hướng thị giác v0.4](../visual-refresh.md), [44 icon nguồn](../icons/), [motion/responsive](../motion-and-responsive.md) và [bản lưu giao diện v0.3](../archive/ui-v0.3.zip). Hai board bổ trợ không tạo thêm screen hoặc chức năng nghiệp vụ.

## Gallery

![Icon và component](14-icons-and-components.svg)

![Đăng nhập](01-login.svg)

![Dashboard Manager](02-dashboard-manager.svg)

![Dashboard Requester/trưởng phòng](16-dashboard-requester.svg)

![Dashboard Admin](17-dashboard-admin.svg)

![Ticket cấp tài khoản — Admin](18-ticket-account-provisioning.svg)

![Tạo yêu cầu](04-create-ticket.svg)

![Ticket Technician](05-ticket-technician.svg)

![Ticket Requester](06-ticket-requester.svg)

![Tài sản](07-asset.svg)

![SLA Admin](08-admin-sla.svg)

![Mobile](09-mobile.svg)

![Trạng thái UX](10-ux-states.svg)

![Trợ lý AI](11-ai-assistant.svg)

![AI theo ngữ cảnh ticket](12-ai-ticket-assistant.svg)

![Trạng thái AI](13-ai-states.svg)

![Responsive và motion — storyboard tĩnh](15-responsive-motion.svg)

## Ranh giới độ phủ bản vẽ

Wireframe tập trung luồng ticket và các quyết định UX rủi ro. Dashboard cá nhân/trưởng phòng và biến thể Admin đã có bản vẽ 16/17; bản 18 minh họa xử lý yêu cầu cấp tài khoản. Dashboard Technician, báo cáo chi tiết, thông báo, hồ sơ, đổi password và các form quản trị khác **đã có đặc tả trong [UI/UX](../../07-uiux-specification.md), chưa có bản vẽ riêng**. Form tạo người dùng SCR60 đã có đặc tả nhưng chưa có bản vẽ riêng. Các dialog chưa được vẽ ở mọi biến thể; đây chưa phải prototype tương tác cho mọi screen.

Hai bản chi tiết ticket minh họa các thời điểm khác nhau của cùng ticket: Technician ở In Progress và Requester ở Resolved. Dữ liệu trong dashboard/bảng là bố cục minh họa, không phải một seed dataset đã kiểm chứng liên kết chéo.

Ba bản AI là mẫu trợ lý trong MVP, có thể bật/tắt khi vận hành; không phủ hết automation. Bộ 13 bản ban đầu được làm mới ở v0.4; ba bản 16–18 bổ sung góc nhìn D-29 trên các screen hiện có. Không tạo role trưởng phòng hoặc trạng thái ticket mới. Task/approval có trạng thái riêng theo thiết kế hiện hành. Menu AI minh họa cấu hình đang bật; ẩn các điểm truy cập AI khi tắt tính năng. [Thiết kế chatbot](../../10-ai-assistant.md) mô tả ranh giới hành động và nguồn; chưa có chatbot thực thi.

Các hình 16/17/18 thể hiện mốc thời gian khác nhau. Xem [dữ liệu và công thức đối chiếu](../../requirements/account-provisioning.md) trước khi so sánh trạng thái cùng ticket giữa các bản.

## Nguồn và trạng thái thiết kế

36 mẫu screen/interaction mục tiêu gồm 26 lõi, 3 AI, 7 OPS. 16 UI SVG + 2 board hiện có chưa phải hi-fi cho mọi mẫu. Đặc tả task board/plan/nhân lực/điều phối/phê duyệt/policy/KB nằm trực tiếp trong [UI/UX](../../07-uiux-specification.md) và [IA](../../04-information-architecture.md); các panel/empty/error/forbidden/conflict đã được mô tả.

SVG trợ lý 11 được sửa nội dung xác nhận ticket và tái xuất vào ba bản ảnh nhúng XMind tương ứng. PNG use-case tổng quan được cập nhật từ SVG hiện hành. Các ảnh UI không đổi giữ phạm vi minh họa; đặc tả Markdown quản lý nghiệp vụ mới. Không dùng ảnh tĩnh hoặc nút minh họa làm bằng chứng automation đã chạy.
