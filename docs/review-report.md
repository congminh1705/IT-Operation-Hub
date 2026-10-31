---
id: itoh-docs-review-report
title: "Rà soát hồ sơ và bố cục sơ đồ"
type: report
domain: quality
module: documentation
tags: [quality, documentation, report]
priority: 2
status: self-reviewed
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: derived
purpose: "Ghi phạm vi tự rà soát, thiếu sót đã chỉnh và giới hạn bằng chứng tài liệu."
---

# Rà soát hồ sơ và bố cục sơ đồ

## 1. Phạm vi và trạng thái

Đợt hiện tại chỉnh tài liệu/sơ đồ để tăng mức cụ thể, rõ trách nhiệm/guard/ngoại lệ và cải thiện bố cục. Agent tự rà soát; chủ đề tài phê duyệt nội dung. Đây không là review độc lập, XMind Desktop, triển khai hoặc kiểm thử ứng dụng.

[Quy ước](documentation-standard.md) phân biệt nguồn và biểu diễn dẫn xuất. README giữ format hiện có và nguyên thứ tự đầu mục; metadata tham chiếu tại [mục lục hồ sơ](README.md). Không cài dependency dự án, sửa source/migration/cấu hình vận hành hoặc gọi AI API.

## 2. Điểm đã rà và chỉnh

| ID | Vấn đề | Thay đổi hiện hành | Nguồn |
|---|---|---|---|
| VIS01 | Use-case lặp nhiều, đường chéo/điều kiện chung chung | Vẽ lại 6 hình; ellipse có ID/mục tiêu/guard, association vuông góc theo scope/actor; không actor AI thứ năm | diagrams/use-cases-*.svg, UC catalog, permissions |
| VIS02 | Automation thiếu bước/trách nhiệm | Yêu cầu → nguồn/candidates → model → revalidate → commit; thiếu dữ liệu và ngoại lệ có nhánh; lỗi model không partial effect | diagrams/automation-flow.svg, Flow 8 |
| VIS03 | Onboarding trừu tượng | DAG 6 task DEMO, effort/dependency/người thực hiện; nhánh Admin cấp user song song khi đủ dữ liệu; nghiệm thu ticket riêng | diagrams/onboarding-task-dag.svg, Flow 8 |
| VIS04 | Giao lại chưa có ví dụ khả thi | Absence DEMO 10–14h; remaining 180 phút; B rảnh 180 phút được xét, C chỉ 120 phút bị loại; khóa/đang làm/vượt scope chuyển ngoại lệ | diagrams/replanning-flow.svg, Flow 9 |
| VIS05 | State/approval khó đọc | Ticket 12 cạnh, Task 10 cạnh, Asset 8 cạnh có guard; decision khác execution; tách vùng nhánh hủy | diagrams/*-states.svg, BR-04/11/15/18 |
| VIS06 | Kiến trúc/sequence chưa render, ít chi tiết | Context/container/deployment và 2 sequence: TX1/TX2, budget reservation, claim/dedup, model ngoài transaction, stale/revoke sau duyệt | diagrams/architecture.md |
| VIS07 | ERD lớn, thiếu trường | 11 góc nhìn có PK/FK/trường chọn lọc, giữ cardinality và nguồn tổng; chỉnh tuyến User → WorkCalendar để không xuyên Task | requirements/conceptual-data-model.md, diagrams/erd-*.svg |
| VIS08 | Mind map chữ nhỏ/khoảng cách chưa đều | 18 mind map giữ bố cục hai phía; riêng Product/IA chỉ tăng độ đậm khung và viền sáng, giữ format ban đầu. 7 flow chuyển sang graph hành động/điều kiện có hướng; 2 state graph giữ nguyên | xmind/previews/, xmind/*.xmind |
| VIS09 | Nguồn/ảnh dẫn xuất chưa đồng bộ | Cập nhật FIG registry, Flow 8/9, BR-11, traceability, hướng dẫn xem và PNG tổng quan | diagrams/README.md, 05-user-flows.md, business-rules.md |

Giữ 51 UC (33 lõi, 8 AI, 10 OPS), 67 stories (47 lõi, 8 AI, 12 OPS), 36 mẫu screen. Số người/phút minh họa đều DEMO, không là dữ liệu vận hành hoặc policy được duyệt. Field/type/index/nullable/lock vật lý cần refinement D-40.

## 3. Kiểm chứng tài liệu và hình

| Phép kiểm | Kết quả / phạm vi |
|---|---|
| Markdown | Metadata cho 46 tài liệu docs/; README là ngoại lệ format có chủ đích. Kiểm links/file/anchor, H1/heading, bảng/fence và ID trên 47 Markdown |
| README | Giữ thứ tự H2/H3 cũ; thêm mục 5 C4, 6 Database/OpenAPI, 7 Folder structures trước Documentation theo cách trình bày repo mẫu |
| Mermaid | 20 block đã render thực: 19 SVG theo miền/kiến trúc/C4/sequence và một nguồn ERD tổng; dùng thư viện có sẵn, không cài dependency repo |
| SVG | 121 SVG parse XML; 77 hình không phải icon render/đo bằng Chrome; không phát hiện chữ tràn canvas/node/width hoặc relationship ERD xuyên entity khác sau chỉnh |
| Visual review | Đợt sơ đồ trước xem 56 hình qua contact sheet; đợt hợp đồng render lại 3 ER views và thêm 3 C4 SVG, xem C3/L4 để kiểm mũi tên/đệm/nhãn |
| XMind | 9 ZIP/JSON; master 27 sheet và subset cùng nội dung; topic IDs/endpoints/resource refs hợp lệ; graph ticket/asset có 12/8 relationships |
| PNG | Tái xuất tổng quan từ use-cases-overview.svg; UI vẫn là minh họa thiết kế |

Đây không là validator đầy đủ của framework đã cài, test ứng dụng, kiểm định UML/C4 hoặc chứng nhận accessibility. Đo hình học trên Chrome/font có sẵn không bảo đảm mọi renderer; contact sheet là rà tổng thể, không phải đọc mọi glyph ở mọi mức zoom. Chưa mở bằng XMind Desktop.

## 4. Nhóm file chịu ảnh hưởng

| Nhóm | File / thay đổi |
|---|---|
| Use-case/vòng đời | 6 use-case SVG, automation/task/approval; thêm ticket/asset SVG; state previews dùng cùng graph |
| Automation cụ thể | [Task DAG](diagrams/onboarding-task-dag.svg), [giao lại](diagrams/replanning-flow.svg), [Flow 8/9](05-user-flows.md) |
| Kiến trúc | [Nguồn/ảnh](diagrams/architecture.md), 5 SVG context/container/sequence/deployment; technical/architecture.md |
| Dữ liệu | [ERD nguồn](requirements/conceptual-data-model.md), 11 SVG theo miền; giữ nguồn quan hệ tổng |
| XMind | 18 mind-map previews, 7 activity-flow previews, 2 state previews; 9 archive đồng bộ. Product/IA giữ format ban đầu với khung đậm và sáng hơn |
| Đồng bộ hồ sơ | README, docs/README.md, documentation-standard.md, diagrams/README.md, BR-11, traceability, xmind/README.md và báo cáo này |
| Dẫn xuất | docs/design/wireframes/use-cases-overview.png tái xuất; không sửa code dự án |

## 5. Đối chiếu nội dung Product, IA và primary flows

| Hạng mục | Thiết kế thể hiện | Kết luận / hành động | Nguồn |
|---|---|---|---|
| Phạm vi và vai trò | Bốn vai trò R/T/M/A; không Trưởng nhóm IT; AI là dịch vụ nội bộ | Khớp định hướng đã chốt; làm rõ policy nghiệp vụ khác quản trị user/role | Scope, permissions, D-41 |
| AI trong MVP | Trợ lý theo yêu cầu và điều phối có policy/grant; nhân sự IT làm chuyên môn | Khớp; luồng Trưởng phòng tập trung thiết lập/giám sát/can thiệp/duyệt, không bắt buộc giao từng việc | BR-14–20, UC-OPS |
| Ticket và task | Ticket tiếp nhận/SLA/nghiệm thu; task có dependency và trạng thái riêng | Khớp; task Done không tự Resolved/Closed | BR-04/15, Flow 1/2 |
| SLA | Phản hồi đầu từ public IT comment; Pending chỉ pause resolution; không reset khi mở lại/đổi người | Làm rõ nhãn Product để tránh hiểu chat AI là phản hồi đầu | BR-08/09 |
| IA và phân quyền | Đủ 36 mẫu; dialog/error khác trang điều hướng; quyền theo bản ghi | Khớp catalog; giữ ID/route trong mind map, quyền/loại chi tiết ở notes/catalog | IA, permissions |
| Tài sản, lỗi và thông báo | Một assignment hiệu lực; không ghi đè version; retry chống trùng; recheck visibility | Khớp quy tắc thiết kế; các nhánh có trách nhiệm/điều kiện rõ hơn | BR-06/10–12, NFR, Flow 4/6/7 |
| Thiếu người, khóa/vượt quyền | Không ép giao hoặc coi duyệt là thành công | Có nhánh ngoại lệ; capacity/policy/khóa khẩn khi thiếu người bàn giao vẫn Cần quyết định | BR-16–19, D-40, Flow 3/5 |
| Yêu cầu doanh nghiệp thực tế | Chưa phỏng vấn/đo vận hành hay phê duyệt quy trình nội bộ | Chỉ xác nhận khớp yêu cầu dự án đã chốt; chưa kết luận phù hợp mọi quy trình doanh nghiệp | Research, validation-plan, D-40 |

Product/IA giữ bố cục mind map ban đầu theo yêu cầu: trung tâm và các nhóm/nhánh hai phía, palette và đường cong; chỉ tăng nét khung và lớp viền sáng. Không chuyển sang bảng thẻ/khung lồng. Bản SVG mới đã render và xem lại; 9 hình Product/IA/flow được đo không có lỗi tràn canvas/độ rộng chữ/node trong phạm vi phép đo. Bảy flow có topic và cạnh tương ứng trong XMind; mã UC/US/SCR giữ nguyên, topic nội bộ flow được tái tạo. Chưa mở XMind Desktop.

Các ý ở rìa Product/IA hiện có khung kín riêng: rộng 480 px, chữ 22 px thay cho 20 px, khoảng đệm và khoảng cách dọc tăng; đường cong vẫn giữ cấu trúc mind map. Native XMind đồng bộ viền/kiểu khung/cỡ chữ của các ý này trong master và hai file chuyên đề. Đã rà 44 ý Product và đủ 36 ID màn hình IA với phạm vi MVP, BR và ma trận quyền; hình là tổng quan, không thay danh mục yêu cầu hay hợp đồng phân quyền chi tiết. Nhãn SVG bỏ dấu code/escape Markdown để dễ đọc, không đổi route thiết kế. Nội dung phù hợp yêu cầu dự án đã chốt; không coi đó là bằng chứng đã khảo sát hoặc phê duyệt quy trình vận hành doanh nghiệp.

Phân cấp hiển thị tiếp tục được làm rõ: trung tâm rộng 480 px/cao tối thiểu 230 px/chữ 34 px trên nền navy; nhóm bậc hai rộng 360 px/cao tối thiểu 132 px/chữ 26 px trên nền đa màu theo palette từng nhánh. Ý ngoài cùng giữ nền sáng/chữ 22 px. Giữ cấu trúc, nhãn và ID; chỉ thay kích thước, nền và kiểu chữ. Native XMind đồng bộ hai cấp trung tâm/nhóm. Kiểm tra render không phát hiện tràn chữ trong phạm vi đo.

Đường nối SVG Product/IA từ trung tâm tới nhóm dùng các điểm gắn riêng theo thứ tự trên–dưới. Dây từ từng nhóm tới các ô con chụm tại giữa cạnh ngoài của ô nhóm rồi tỏa cong theo ảnh mẫu được chọn. Hành lang giữa các cấp và chiều rộng preview 2800 px giữ các tuyến rõ; đường cong không quay ngược. Giữ nguyên kích thước ô/chữ, màu, nội dung và quan hệ nguồn–đích. Bố cục đường SVG là bản xem riêng; XMind Desktop có cơ chế tự dàn trang và chưa được mở kiểm tra trong đợt này.

## 6. Phần còn mở và giới hạn

D-40 giữ các quyết định production, dữ liệu/ngân sách/retention, lịch/capacity/taxonomy, policy scope, KB publisher, reservation, bootstrap/password/reset, schema/lock/idempotency/retry, hosting/HA và backup/RPO/RTO/owner. Field trong ERD là đề xuất logic chọn lọc, chưa là hợp đồng schema vật lý.

Chưa có ứng dụng/OpenAPI runtime, migration, hi-fi riêng cho mọi screen OPS, usability/accessibility thực tế, model call hoặc restore. D-39 chỉ cho cấu hình DEMO/test giới hạn khi được yêu cầu triển khai riêng. M1–M5 vẫn là kế hoạch, chưa kích hoạt lập trình.

## 7. DBML, OpenAPI, C4 và code structure

Yêu cầu hiện tại bổ sung bốn nhóm tài liệu; tham khảo cách README trình bày của finance-manager và metadata/phân miền/traceability của Agentic SDLC Kit. Không sao chép stack, JWT, trạng thái hoàn thành hoặc governance runtime của dự án khác.

| Hạng mục | Trước | Artifact hiện tại / thay đổi | Trạng thái |
|---|---|---|---|
| DBML/ER Mermaid | ER Mermaid theo miền, chưa DBML | database/schema.dbml + README; 52 entity/59 reference chọn lọc; source JSON snapshot sửa ở model và 3 ER SVG | Design draft; chưa schema vật lý đầy đủ/DDL/migration |
| OpenAPI | Catalog HTTP/API01–19, chưa contract máy đọc | api/openapi.json, README.md, operations.md; 74 paths/96 operations/95 schemas; JSON/multipart, security/role/scope/UC/BR/error/version/idempotency | Static design, không runtime export/client đã sinh |
| C4 | Context/container/deployment/sequence | architecture/c4/README.md, 01-context.md, 02-containers.md, 03-components.md, 04-code.md; C1/C2 tái dùng; 3 C3/L4 SVG mới | Component/code design, chưa package/container thực thi |
| Code structure | Hai thư mục src chỉ .gitkeep | technical/code-structure.md; current/target trees, App Router/screens, module files, ownership/dependency/UoW | Chỉ cây planned trong Markdown, không tạo code |
| README | Mục 1–4 theo format hiện có | Thêm mục 5/6/7 có hình/bảng/cây thư mục và link chi tiết; cập nhật Documentation/Progress | Giữ thứ tự đầu mục cũ |
| Đồng bộ nguồn | Một số mô tả chưa có OpenAPI, kiểu snapshot int, hồ sơ UI diễn đạt mơ hồ | API rationale, docs index, architecture, model/ER, diagram registry, traceability, UI profile/US03, readiness, D-40, documentation-standard và báo cáo này | Không thay đổi phạm vi MVP/stack/vai trò |

Kiểm đã chạy: cấu trúc JSON và 999 local refs, operationId duy nhất, path parameters, required properties, CSRF ở mutation, public/security boundaries, đủ API01–19, enum task theo BR-15; DBML entity/reference endpoints khớp Mermaid; 47 Markdown/46 metadata docs và links/heading/table/fence; 20 Mermaid block có render evidence; 121 SVG parse, 77 non-icon SVG đo hình học không lỗi trong phạm vi phép đo. L4 reroute một dependency tránh xuyên CandidateEvaluator; source/target không đổi. src vẫn chỉ frontend/.gitkeep và backend/.gitkeep.

Chưa chạy official OpenAPI validator/DBML CLI, HTTP request, Pydantic runtime export, TypeScript client generation, Alembic/DB hoặc test ứng dụng. Schema/DTO/naming/projection và các trường chưa có trong view chọn lọc cần review D-40; invariant BR không được coi là đã được DBML tự thực thi. Không gọi AI provider hoặc cài dependency; M1–M5 chưa bắt đầu.
