# Sơ đồ IT Operations Hub — XMind

File tổng [it-operations-hub.xmind](it-operations-hub.xmind) có **27 sheet**. Các topic, nhánh, ghi chú, quan hệ và màu được lưu trong file `.xmind` để chỉnh sửa; không chỉ là ảnh đặt trong một file có đuôi XMind.

## Mở và sử dụng

1. Mở file tổng bằng XMind, hoặc chọn file chuyên đề bên dưới.
2. Chọn sheet theo chủ đề; mở/thu nhánh để điều chỉnh mức chi tiết.
3. Đọc ghi chú của topic để xem actor, điều kiện phạm vi hoặc đầy đủ câu user story và AC.
4. Chỉnh màu, bố cục và topic trong XMind; khi xuất ảnh mới, cập nhật ảnh xem nhanh tương ứng trong tài liệu.

Các bản đồ actor–goal hỗ trợ review use case; ký pháp UML hình thức được giữ ở phụ lục trong [use case catalog](../03-use-cases.md). Bản đồ mô hình thông tin mô tả đối tượng ở mức khái niệm, không phải ERD vật lý hoặc schema database.

## Các file chuyên đề

| File | Sheet | Nội dung |
|---|---|---|
| [Toàn bộ dự án](it-operations-hub.xmind) | 27 | Tất cả sơ đồ, backlog, UI/UX và lộ trình |
| [01 — Product map](01-product-map.xmind) | 2 | Sản phẩm và research top down |
| [02 — Use cases](02-use-cases.xmind) | 4 | Tổng quan vai trò; tài khoản; ticket/SLA; tài sản/báo cáo |
| [03 — Information architecture](03-information-architecture.xmind) | 1 | Phân cấp workspace, navigation và màn hình |
| [04 — User flows](04-user-flows.xmind) | 7 | Nhân viên, Technician, Manager, tài sản, Admin, lỗi, thông báo |
| [05 — Business rules](05-business-rules.xmind) | 5 | Trạng thái ticket, SLA, tài sản, ưu tiên và mô hình khái niệm |
| [06 — INVEST backlog](06-invest-backlog.xmind) | 1 | 47 story, phụ thuộc và AC trong ghi chú |
| [07 — UI/UX](07-uiux.xmind) | 2 | Trải nghiệm, chất lượng và 15 ảnh: 13 bản UI + 2 board thiết kế |
| [08 — Chatbot AI](08-ai-assistant.xmind) | 4 | Phạm vi AI, 8 UC/stories, handoff, bất biến và 3 ảnh AI đính kèm |

## Danh mục sheet và ảnh SVG xem nhanh

| # | Nội dung | Xem ảnh |
|---|---|---|
| 1 | Tổng quan sản phẩm | [Product map](previews/01-product-map.svg) |
| 2 | Phân tích top down | [Research](previews/02-research.svg) |
| 3 | Use case tổng quan theo vai trò | [Actor–goal overview](previews/00-use-cases-overview.svg) |
| 4 | Use case tài khoản và quản trị | [Access](previews/03-use-cases-access.svg) |
| 5 | Use case ticket, SLA, thông báo | [Ticket](previews/04-use-cases-ticket.svg) |
| 6 | Use case tài sản và quan sát | [Operations](previews/05-use-cases-operations.svg) |
| 7 | Kiến trúc thông tin | [IA](previews/06-information-architecture.svg) |
| 8 | Luồng nhân viên | [Requester flow](previews/07-flow-requester.svg) |
| 9 | Luồng kỹ thuật viên | [Technician flow](previews/08-flow-technician.svg) |
| 10 | Luồng điều phối | [Manager flow](previews/09-flow-manager.svg) |
| 11 | Luồng tài sản | [Asset flow](previews/10-flow-asset.svg) |
| 12 | Luồng quản trị quyền | [Admin flow](previews/11-flow-admin.svg) |
| 13 | Luồng phục hồi lỗi | [Conflict/error flow](previews/12-flow-conflict.svg) |
| 14 | Luồng thông báo | [Notification flow](previews/13-flow-notification.svg) |
| 15 | Trạng thái và chuyển tiếp ticket | [State graph](previews/14-ticket-states.svg) |
| 16 | Hai đồng hồ SLA | [SLA](previews/15-sla.svg) |
| 17 | Trạng thái tài sản | [Asset states](previews/16-asset-states.svg) |
| 18 | Ma trận ưu tiên | [Priority](previews/17-priority.svg) |
| 19 | Mô hình thông tin khái niệm | [Conceptual model](previews/18-conceptual-model.svg) |
| 20 | User stories INVEST | [Backlog](previews/19-invest.svg) |
| 21 | Trải nghiệm và wireframes | [UI/UX](previews/20-uiux.svg) |
| 22 | Trạng thái và accessibility | [UX quality](previews/21-ux-quality.svg) |
| 23 | Lộ trình M1–M6 | [Roadmap](previews/22-roadmap.svg) |
| 24 | AI hỗ trợ tùy chọn | [AI overview](previews/23-ai-overview.svg) |
| 25 | 8 use case/stories AI | [AI catalog](previews/24-ai-use-cases.svg) |
| 26 | Handoff về form/composer hiện có | [AI flow](previews/25-ai-handoff.svg) |
| 27 | Bất biến ticket/SLA/tài sản/quyền | [AI boundaries](previews/26-ai-boundaries.svg) |

## Wireframe đính kèm

Sheet UI/UX có 15 ảnh v0.4 (13 bản UI và 2 board thiết kế) nằm trong archive, không cần tải từ URL bên ngoài. Nhánh “Wireframe màn hình” được thu gọn ban đầu để tránh canvas quá dài; mở nhánh để xem ảnh.

Ảnh màn hình là tài liệu UI/UX tĩnh; XMind không chuyển chúng thành từng input, button hay bảng có thể sửa độc lập. Nguồn vector và đặc tả tương tác được giữ ở [wireframe gallery](../design/wireframes/README.md); có thêm [44 icon SVG](../design/icons/) và [quy định motion/responsive](../design/motion-and-responsive.md). Các sơ đồ phân tích, IA, backlog và luồng dùng topic/quan hệ XMind thực sự.

## Giới hạn kiểm tra

Đã kiểm tra archive, JSON, ID topic/quan hệ, ảnh đính kèm và độ phủ UC/US/SCR. Chưa mở trực tiếp bằng ứng dụng XMind Desktop trong môi trường này. Ảnh SVG xem nhanh được dựng từ cùng dữ liệu sơ đồ, không được mô tả là ảnh xuất từ ứng dụng XMind; bố cục tự động trong XMind có thể khác.

Cấu trúc archive/topic/style/image được đối chiếu với [mô hình chính thức của XMind SDK](https://github.com/xmindltd/xmind-sdk-js/blob/master/src/common/model.ts) và [cách đóng gói của SDK](https://github.com/xmindltd/xmind-sdk-js/blob/master/src/utils/zipper.ts). Không cài dependency vào dự án hoặc thêm mã ứng dụng để tạo bộ tài liệu.
