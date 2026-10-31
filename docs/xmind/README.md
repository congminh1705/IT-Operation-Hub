---
id: itoh-docs-xmind-readme
title: "Sơ đồ IT Operations Hub — XMind"
type: reference
domain: design
module: mindmaps
tags: [design, mindmaps, reference]
priority: 2
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: derived
purpose: "Định nghĩa cách xem, nguồn, độ phủ và quan hệ master/subset của XMind."
---

# Sơ đồ IT Operations Hub — XMind

**Thiết kế mục tiêu · Chỉ tài liệu thiết kế, chưa triển khai/kiểm thử.** File tổng [it-operations-hub.xmind](it-operations-hub.xmind) giữ 27 sheet; 8 file chuyên đề, tổng 9 archive. Topic/notes đã đối chiếu từng mã và định nghĩa với trợ lý + automation, KB/ACL, task/policy/approval và lộ trình M0–M5.

## Cách đọc

Mở .xmind bằng XMind, chọn sheet, mở nhánh và notes. Topic/quan hệ là dữ liệu chỉnh sửa được. Bộ 27 preview gồm **18 mind map (gồm Product và IA), 7 luồng hoạt động có hướng và 2 state graph**. Product và IA giữ bố cục trung tâm, nhóm và nhánh hai phía như trước, chỉ tăng nét khung và thêm viền sáng; IA đủ 36 mẫu với ID/route, loại/scope chi tiết trong notes/catalog; bảy flow có hành động, bên chịu trách nhiệm và nhánh điều kiện. Các preview này dùng viền xanh đậm với lớp xanh sáng bên ngoài. Native XMind dùng chữ lớn, khung viền xanh và relationships có hướng; hai state graph ticket/asset giữ 12/8 cạnh.

Giữ mã nghiệp vụ UC/US/SCR. Bảy sheet flow chuyển từ cây chủ đề sang các topic hoạt động và quan hệ có hướng, nên ID topic nội bộ được tái tạo; chi tiết tham chiếu giữ trong notes theo guard/quyền hiện hành. Product/IA giữ ID topic hiện có, Product thêm hai ý kiểm soát. Master/subset đồng bộ cùng nội dung. Điều kiện dài/AC, route và nguồn nằm trong notes/catalog Markdown. Preview SVG được bố cục riêng, không phải ảnh chụp/export XMind Desktop; chưa mở bằng XMind Desktop trong đợt này.

Các ý ngoài cùng của Product/IA có khung kín, viền đậm kèm viền sáng, ô và chữ lớn hơn; giữ bố cục trung tâm/nhánh hai phía. Nội dung gồm 44 ý Product và 36 mẫu màn hình IA. Product là tổng quan năng lực, IA là nhóm thông tin/route thiết kế; phạm vi ghi/đọc và điều kiện nghiệp vụ vẫn theo catalog/BR/ma trận quyền, không suy quyền từ một nhánh cùng nhóm.

Ô trung tâm được tăng kích thước và cỡ chữ; nhóm bậc hai cũng lớn hơn, dùng chữ sáng trên nền đậm theo màu riêng từng nhánh. Native master và hai file Product/IA đồng bộ màu nền/cỡ chữ của hai cấp này; các ý ngoài cùng tiếp tục dùng nền sáng. Nội dung, topic ID và thứ tự nhóm giữ nguyên khi chỉnh phân cấp hiển thị.

Các sơ đồ/core use cases cũ giữ mã; thêm nhánh công việc và điều phối và liên hệ nguồn. Bốn sheet AI được sửa nội dung thành trợ lý/điều phối/tool scope; sheet lộ trình đổi M0–M5. Quan hệ của các sheet tái cấu trúc dùng cây topic mới, không để edge trỏ topic đã bỏ.

## File chuyên đề

| File | Sheet | Nội dung hiện hành |
|---|---|---|
| [Tổng](it-operations-hub.xmind) | 27 | Core, AI, OPS, UI và roadmap |
| [01 Product](01-product-map.xmind) | 2 | Product/research và mục tiêu điều phối |
| [02 Use cases](02-use-cases.xmind) | 4 | Tổng quan đủ 51 UC riêng (33 core + 8 AI + 10 OPS); ba sheet core giữ actor/scope |
| [03 IA](03-information-architecture.xmind) | 1 | Đủ 36 node screen riêng (26 core + 3 AI + 7 OPS), route/quyền/UC trong notes |
| [04 Flows](04-user-flows.xmind) | 7 | Bảy góc nhìn lõi, bổ sung xác nhận/replan/approval |
| [05 Business rules](05-business-rules.xmind) | 5 | State/SLA/assets/priority/model, liên hệ BR-14–22 |
| [06 Backlog](06-invest-backlog.xmind) | 1 | Đủ 67 story riêng: 47 core + 8 AI + 12 OPS, notes nối AC/phụ thuộc từ nguồn hiện hành |
| [07 UI/UX](07-uiux.xmind) | 2 | UI/quality và độ phủ OPS, 18 ảnh minh họa giữ trong archive |
| [08 AI](08-ai-assistant.xmind) | 4 | Trợ lý/điều phối, đủ 8 UC-AI + 10 UC-OPS và liên hệ story/AC; ảnh trợ lý 11 cập nhật, 12/13 không đổi |

## Preview SVG cùng cây chủ đề

| Nhóm | Xem sơ đồ nút/nhánh |
|---|---|
| Product/research | [01](previews/01-product-map.svg), [02](previews/02-research.svg) |
| Use cases | [Tổng quan](previews/00-use-cases-overview.svg), [Access](previews/03-use-cases-access.svg), [Ticket](previews/04-use-cases-ticket.svg), [Operations](previews/05-use-cases-operations.svg) |
| IA | [Screens](previews/06-information-architecture.svg) |
| Flows | [Requester](previews/07-flow-requester.svg), [Technician](previews/08-flow-technician.svg), [Manager](previews/09-flow-manager.svg), [Asset](previews/10-flow-asset.svg), [Admin](previews/11-flow-admin.svg), [Conflict](previews/12-flow-conflict.svg), [Notification](previews/13-flow-notification.svg) |
| Rules/model | [Ticket state](previews/14-ticket-states.svg), [SLA](previews/15-sla.svg), [Asset state](previews/16-asset-states.svg), [Priority](previews/17-priority.svg), [Model](previews/18-conceptual-model.svg) |
| Backlog/UI | [INVEST](previews/19-invest.svg), [UI/UX](previews/20-uiux.svg), [Quality](previews/21-ux-quality.svg) |
| Roadmap | [M0–M5](previews/22-roadmap.svg) |
| AI | [Tổng quan](previews/23-ai-overview.svg), [Catalog](previews/24-ai-use-cases.svg), [Flows](previews/25-ai-handoff.svg), [Policy/boundaries](previews/26-ai-boundaries.svg) |

## Độ phủ và ảnh nhúng

16 UI SVG + 2 board hiện có là mẫu thị giác; SCR-OPS01–07 có đặc tả trong [UI/UX](../07-uiux-specification.md), chưa hi-fi riêng toàn bộ. Ảnh trợ lý 11 trong ba archive liên quan đã tái xuất từ SVG hiện hành; các ảnh UI khác giữ nội dung minh họa không đổi, có note phạm vi. Không dùng ảnh tĩnh làm nguồn quyết định nghiệp vụ mới. Nguồn hiện hành là Markdown/topic/SVG. Archive UI v0.3 là lịch sử, không đặc tả cạnh tranh.

ERD logic nằm trong [mô hình dữ liệu](../requirements/conceptual-data-model.md), flow automation trong [flows](../05-user-flows.md). Tree XMind không thay ERD/schema hoặc [ma trận quyền](../requirements/permissions-matrix.md).

Đã kiểm cấu trúc và nội dung đối chiếu: 51 UC/67 story/36 screen ở các sheet tương ứng, story/AC notes khớp định nghĩa nguồn; kiểm ZIP/JSON/topic/relations/resources và XML/link. Đã xuất/review một số diagram bằng Chrome, chưa mở bằng XMind Desktop và chưa kiểm toàn bộ hình ở mọi kích thước. [Review](../review-report.md) ghi kết quả thực tế.

## Nguồn chuẩn và loại sơ đồ

Root notes của từng sheet chỉ rõ nguồn Markdown theo chủ đề, ma trận quyền và quy ước hồ sơ. XMind là cây phân rã/tổng hợp dẫn xuất; các nhánh không định nghĩa sequence, foreign key hoặc quyền. Dùng [ERD logic](../requirements/conceptual-data-model.md) cho cardinality, [các góc nhìn kiến trúc](../diagrams/architecture.md) cho component/transaction/deployment và [danh mục FIG](../diagrams/README.md) cho loại/nguồn/giới hạn của mỗi sơ đồ.

Actor người dùng là R/T/M/A; bộ lập lịch và AI_COORDINATOR là thành phần nội bộ. Trưởng phòng IT là IT Manager; Team không tạo thêm cấp trưởng nhóm. Các sheet master/subset giữ cùng ID và nội dung nguồn. Archive UI cũ là lịch sử, không dùng để quyết định hành vi hiện hành.
