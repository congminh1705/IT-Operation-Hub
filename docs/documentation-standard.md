---
id: itoh-docs-documentation-standard
title: "Quy ước tài liệu và sơ đồ"
type: reference
domain: project
module: documentation
tags: [project, documentation, reference]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Quy định metadata, cấu trúc, truy vết, ký pháp sơ đồ và mức bằng chứng."
---

# Quy ước tài liệu và sơ đồ

## 1. Mục đích và phạm vi áp dụng

Quy ước áp dụng cho hồ sơ thiết kế IT Operations Hub. Tham khảo chuẩn metadata, phân tách tài liệu nguồn/biểu diễn, trạng thái và truy vết của Agentic SDLC Kit. Không cài framework, không sao chép dữ liệu quản trị của dự án khác, không thêm quy trình phê duyệt làm thay đổi chỉ dẫn của chủ đề tài.

Giữ đường dẫn tài liệu nguồn đang được dùng và **giữ nguyên thứ tự các đầu mục README dự án**. Sắp xếp theo miền qua [mục lục hồ sơ](README.md), không di chuyển hàng loạt chỉ để đổi tên thư mục. Các quy tắc đồ họa dưới đây là quy ước của hồ sơ này; không tuyên bố kit cung cấp hoặc chứng nhận UML/C4.

## 2. Metadata và cấu trúc

Markdown trong docs/ bắt đầu bằng YAML: `id`, `title`, `type`, `domain`, `module`, `tags`, `priority`. Bổ sung `status`, `owner`, `approval`, `updated`, `purpose`, `authority` để biết phạm vi và mức tin cậy. README dự án giữ format trình bày hiện có và là ngoại lệ frontmatter; bản ghi nhận diện được quản lý tại docs/README.md. README vẫn được kiểm heading, links và nội dung. ID tài liệu ổn định, không trùng; `priority` từ 1 đến 5 là độ quan trọng tra cứu tài liệu, khác độ ưu tiên ticket P1–P4.

| Trường | Quy ước |
|---|---|
| type | reference: đặc tả/tham chiếu; planning: kế hoạch; report: kết quả rà soát tài liệu |
| status | design-draft, planned, hypothesis hoặc self-reviewed; không dùng completed cho chức năng mới được mô tả |
| owner | Chủ đề tài; đây là vai trò chịu trách nhiệm hồ sơ, không phải tên người được tự gán |
| approval | needs-review; quyết định cụ thể được xác nhận riêng tại sổ quyết định |
| authority | primary: nguồn chuẩn của chủ đề; derived: mục lục, hình minh họa hoặc bản tổng hợp |
| purpose | Một câu xác định câu hỏi mà tài liệu trả lời |

Cấu trúc nội dung phù hợp loại tài liệu: mục đích/phạm vi → khái niệm hoặc danh mục → hành vi/quan hệ/ràng buộc → ngoại lệ → kiểm chứng → nguồn liên quan. Các catalog bảng giữ ID và cột phù hợp, không thêm cùng một mẫu văn bản dài vào mọi file. H1 duy nhất; cấp heading không nhảy; bảng có tiêu đề rõ; code fence đóng đủ. Tài liệu dùng ngôn ngữ quy định nhất quán, không chia thiết kế hiện hành thành các đoạn “bổ sung” theo lịch sử hội thoại.

## 3. Hợp đồng đặc tả và truy vết

| Loại | Nội dung bắt buộc |
|---|---|
| Use case | ID, mục tiêu, actor và scope, trigger, tiền điều kiện, luồng chính, nhánh lỗi, hậu điều kiện; điều kiện chung được tham chiếu thay vì chép lại |
| Story | Vai trò, kết quả, giá trị, phụ thuộc, AC; INVEST là đánh giá refinement, không phải kết quả test |
| BR/NFR/AC | ID ổn định; quy tắc/đại lượng rõ; tình huống kiểm chứng và nguồn; ngưỡng chưa chốt phải ghi đề xuất/Cần quyết định |
| API/event | ID, method/path hoặc event type, actor/producer/consumer, input/output, quyền, transaction, idempotency, lỗi, truy vết UC/BR |
| Dữ liệu | Entity/ownership/cardinality, version/lifecycle, unique/check/invariant, nguồn quyền, phân biệt logic với schema vật lý |
| Kiến trúc | Context, container, module, sequence, triển khai dự kiến, trust boundary, failure/recovery và tradeoff |
| Quyết định | ID, trạng thái, người quyết định có thẩm quyền, bối cảnh/lý do, phương án, hệ quả, tài liệu ảnh hưởng; không tự nhận quyết định đã được duyệt |
| Kế hoạch kiểm chứng | Mục tiêu, dữ liệu/môi trường, phương pháp, expected result, evidence cần lưu, entry/exit; tách planned khỏi actual |

Các namespace F/UC/US/AC/TC/SCR/BR/NFR/MET và D giữ nguyên. Thêm namespace API/EVT/FIG cho hợp đồng và hình, không đổi các ID nghiệp vụ đã có. Truy vết là khả năng quay về yêu cầu nguồn, không chỉ đếm số dòng.

## 4. Quy ước sơ đồ

| Loại | Biểu diễn | Không trộn vào cùng ký pháp |
|---|---|---|
| Use-case view | Actor người dùng bên ngoài boundary; ellipse chứa ID/mục tiêu; association không có nghĩa thứ tự | Component nội bộ, bảng DB, sequence hoặc cấp quản lý không tồn tại |
| Kiến trúc context/container | Một mức trừu tượng mỗi hình; phân biệt người, hệ thống ngoài, ứng dụng, data store; cạnh có tên giao tiếp | Entity ERD hoặc các bước UI |
| Sequence | Lifeline, thứ tự message, nhánh alt; transaction/commit và model call rõ | Gộp phê duyệt với hiệu ứng ghi thành công |
| Activity/task flow | Bắt đầu, hành động, điều kiện rẽ nhánh và kết thúc; ngoại lệ có đường ra | Dùng mũi tên như quan hệ ERD hoặc quyền |
| State transition | State, cạnh có trigger/guard/effect hoặc chú giải; một vòng đời mỗi vùng | Ticket, Task, quyết định approval và execution chung một bộ status |
| ERD logic | Entity, hai đầu quan hệ, cardinality/optional; ràng buộc không diễn đạt được ghi bên cạnh | Dùng ERD để cam kết index/DDL đã triển khai |
| Mind map | Cây phân rã, node/notes/source, tham chiếu chéo khi cần | Coi nhánh mind map là luồng thời gian hoặc foreign key |
| Wireframe | Screen ID, role/scope, trạng thái và dữ liệu minh họa | Coi ảnh tĩnh là UI chạy thật hoặc bằng chứng accessibility |

Mỗi hình có FIG ID, mục đích, loại, nguồn và giới hạn tại [danh mục sơ đồ](diagrams/README.md). SVG có title/desc và metadata truy về tài liệu; Mermaid là nguồn văn bản ngay trong tài liệu chứa hình. Preview/PNG/XMind là biểu diễn dẫn xuất, không được đổi quy tắc độc lập. Archive UI cũ chỉ là lịch sử, không phải bản thiết kế hiện hành.

Các góc nhìn theo vai trò có thể lặp cùng mã UC, nhưng mỗi vùng chỉ biểu diễn một góc nhìn của cùng hệ thống. AI_COORDINATOR thuộc kiến trúc/sequence, không là actor người dùng thứ năm trong use-case view. Luồng automation có thể chạy theo sự kiện dù người giám sát không bấm nút từng bước.

## 5. Kiểm tra và giới hạn kết luận

Kiểm tra UTF-8, frontmatter/ID, liên kết nội bộ, heading/bảng/fence, mã catalog và traceability; parse SVG/JSON/ZIP, đối chiếu sheet master/subset, cạnh trạng thái và nguồn hình. Review nội dung actor, scope, cardinality, event retry và nhánh lỗi riêng với kiểm tra cú pháp.

Chỉ ghi `passed` cho phép kiểm đã thực hiện và ghi rõ phạm vi. Kiểm tra XML không chứng minh sơ đồ dễ đọc; đọc SVG không chứng minh XMind Desktop; kiểm tra AC trong tài liệu không chứng minh AC phần mềm đạt. Kết quả tự rà soát không thay phê duyệt độc lập. Không tạo mã nguồn/test thực thi để kiểm chứng tài liệu.


## 6. Bố cục và kiểm tra render

Hình kỹ thuật có FIG ID, tiêu đề, mục đích và nguồn. Nội dung chia theo câu hỏi: use-case chỉ actor/mục tiêu; flow có nhánh lỗi; sequence chỉ một nhóm tương tác; ERD tách miền và giữ cardinality. Không dồn mọi entity/ngoại lệ vào một hình rồi thu chữ nhỏ.

Use-case có ellipse và association không mũi tên, gom đường theo actor để giảm chéo. Flow/state có hướng và guard; cạnh hủy tách vùng vẫn giữ nguồn/đích. Màu đi kèm nhãn. Mind map dàn hai phía, khoảng cách theo chiều cao nội dung; nhánh không thay sequence/ERD.

Product map, IA và primary/support flows dùng nền sáng, viền chính xanh đậm và lớp viền xanh sáng bên ngoài. Khung có khoảng đệm đủ cho toàn bộ chữ; nhãn cạnh chỉ có nền theo bề rộng nội dung, không che khung/điều kiện. Product map phân rã năng lực; IA giữ mind map trung tâm/nhánh hai phía và ID/route, loại/scope chi tiết trong catalog/notes; primary flow dùng mũi tên/điều kiện và bên chịu trách nhiệm. Product/IA giữ format ban đầu, chỉ tăng nét khung và lớp viền sáng; không chuyển thành bảng thẻ hoặc khung lồng nhau. Primary flow dùng ký pháp hoạt động riêng. Quyền và trạng thái chưa chốt phải hiện rõ hoặc dẫn D-40, không tự suy diễn thành quy trình doanh nghiệp đã được phê duyệt.

Render trước bàn giao; đo text width, canvas bounds, chữ trong node và đường ERD xuyên entity không liên quan. Xem tổng thể các hình đã đổi và phóng to hình trọng tâm. PNG phải xuất từ SVG hiện hành. Phép đo trên một browser/font không chứng minh mọi renderer/thiết bị hoặc XMind Desktop.

Với Product/IA, các ý ngoài cùng cũng có khung kín riêng, viền đậm và lớp viền sáng; giữ nhánh cong hai phía. Preview dùng ô ngoài rộng 480 px, chữ 22 px, khoảng đệm ngang 22 px và khoảng cách dọc 22 px; chiều cao tự tăng theo nội dung, không cắt chữ. Ký hiệu code/escape Markdown không đưa vào chữ hiển thị của SVG. Đây là quy ước hình tài liệu, không phải kích thước component giao diện ứng dụng.

Phân cấp Product/IA: trung tâm nền navy, rộng 480 px, cao tối thiểu 230 px, chữ 34 px đậm; nhóm bậc hai rộng 360 px, cao tối thiểu 132 px, chữ 26 px sáng trên nền màu riêng của nhánh (xanh dương, teal, tím, nâu vàng, xanh xám, tím hồng). Các ý ngoài cùng giữ nền sáng và chữ 22 px. Nền nhóm dùng palette đa màu hiện có, không đồng loạt đổi sang một màu. Cấp trung tâm nổi bật bằng diện tích/cỡ chữ/độ đậm; không suy thứ bậc chỉ từ chiều rộng ô chứa nội dung dài.

Đường từ trung tâm tới nhóm bậc hai dùng điểm gắn riêng, xếp theo thứ tự trên–dưới để tránh chồng chéo. Từ mỗi nhóm tới các ô con, dây chụm ở giữa cạnh ngoài của ô nhóm rồi tỏa cong theo thứ tự các ô con. Chừa hành lang ngang giữa các cấp; đường cong không quay ngược hoặc xuyên ô. Preview rộng 2800 px; giữ kích thước ô/chữ và cấu trúc mind map hai phía.

## 7. Artifact DBML/OpenAPI/C4 và cây code

Tham khảo cách trình bày C4, database/OpenAPI và folder structures của repo finance-manager; giữ thứ tự các đầu mục README cũ, thêm mục kỹ thuật tiếp theo trước Documentation. Không sao chép stack ASP.NET/JWT, số liệu hoàn thành hoặc quy trình governance của repo mẫu.

DBML/OpenAPI JSON là tài liệu thiết kế máy đọc được, metadata/trạng thái/quyền sở hữu tại README cùng miền. Không bắt YAML frontmatter vào file có grammar riêng. Mô hình logic/BR và API rationale vẫn là nguồn quyết định; schema tĩnh/các view/cây code phải đồng bộ, không đổi quy tắc độc lập. C4 L4 và cây folder/file phải phân biệt planned/current, không tạo module/test/config ngoài phạm vi tài liệu.
