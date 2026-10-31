---
id: itoh-docs-08-invest-requirements
title: "User stories và đánh giá INVEST"
type: reference
domain: business
module: requirements
tags: [business, requirements, reference]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Định nghĩa story lõi/OPS, phụ thuộc, AC và đánh giá INVEST để refinement."
---

# User stories và đánh giá INVEST

**47 stories lõi giữ mã; bổ sung 8 stories trợ lý và 12 stories quản lý công việc/điều phối cho MVP mục tiêu. Chưa triển khai, chưa ước lượng bởi đội phát triển.** Mã US là cố định để truy vết; thứ tự US không phải cam kết thứ tự sprint.

## Cách đọc INVEST

Tham khảo [Bill Wake](https://xp123.com/invest-in-good-stories-and-smart-tasks/): I–độc lập, N–thương lượng, V–giá trị, E–ước lượng được, S–nhỏ, T–kiểm chứng được. Ở đây I nghĩa là một kết quả có thể demo với fixture phù hợp; không phủ nhận phụ thuộc dữ liệu/quyền. AC và ràng buộc bắt buộc không phải phần có thể thương lượng. Không mặc định đánh dấu tất cả PASS.

Mỗi story dưới đây có vai trò, kết quả, giá trị, phụ thuộc và AC. Độ sẵn sàng E/S là **đánh giá bàn giấy**: `R` đủ thông tin cho refinement; `C` cần chia nhỏ/cân nhắc ước lượng. Chưa có story point hoặc lịch cố định.

## Backlog

| ID | User story | Phụ thuộc tối thiểu | AC |
|---|---|---|---|
| US01 | Là người có tài khoản hoạt động, tôi muốn đăng nhập để vào workspace đúng quyền. | Tài khoản Admin cấp | AC01 |
| US02 | Là người đã đăng nhập, tôi muốn đăng xuất để kết thúc quyền truy cập của phiên hiện tại. | Phiên hợp lệ | AC02 |
| US03 | Là người dùng, tôi muốn xem và sửa tên/thông tin liên hệ của mình để hồ sơ hỗ trợ luôn đúng. | Phiên hợp lệ | AC03 |
| US04 | Là người dùng, tôi muốn đổi mật khẩu với xác minh mật khẩu hiện tại để bảo vệ tài khoản. | Phiên hợp lệ | AC04 |
| US05 | Là Admin, tôi muốn tạo một tài khoản với vai trò và phòng ban để cấp quyền cho nhân sự mới. | Department, quyền Admin | AC05 |
| US06 | Là Admin, tôi muốn đổi vai trò/phòng ban có lịch sử để quyền phản ánh trách nhiệm hiện tại. | User tồn tại | AC06 |
| US07 | Là Admin, tôi muốn khóa hoặc mở khóa tài khoản để kiểm soát truy cập mà giữ lịch sử. | User tồn tại | AC07 |
| US08 | Là Admin, tôi muốn quản lý phòng ban và trạng thái sử dụng để tổ chức dữ liệu nhân sự. | Quyền Admin | AC08 |
| US09 | Là Admin, tôi muốn tạo/cập nhật nhóm IT và nhóm tiếp nhận để yêu cầu có nơi chịu trách nhiệm. | Quyền Admin | AC09 |
| US10 | Là Admin, tôi muốn thêm/loại thành viên nhóm để phạm vi xử lý phản ánh phân công thực tế. | Team và user | AC10 |
| US11 | Là Admin, tôi muốn duy trì danh mục ticket để nhân viên phân loại nhất quán. | Quyền Admin | AC11 |
| US12 | Là Admin, tôi muốn công bố phiên bản SLA mặc định mới để áp dụng chính sách cho ticket tạo sau đó. | Quyền Admin | AC12 |
| US13 | Là người yêu cầu, tôi muốn gửi một ticket với mô tả và mức ảnh hưởng/khẩn cấp để IT tiếp nhận có đủ bối cảnh. | Danh mục, nhóm tiếp nhận, SLA | AC13 |
| US14 | Là người dùng, tôi muốn tìm/lọc/sắp xếp ticket trong phạm vi quyền để tìm đúng việc cần theo dõi. | Fixture ticket | AC14 |
| US15 | Là người dùng, tôi muốn đọc chi tiết ticket được phép để biết tình trạng và người phụ trách. | Ticket trong scope | AC15 |
| US16 | Là Manager/Admin, tôi muốn giao hoặc chuyển nhóm có lý do để đưa việc tới đúng người chịu trách nhiệm. | Team/member, ticket | AC16 |
| US17 | Là Technician, tôi muốn tự nhận ticket nhóm chưa giao để bắt đầu chịu trách nhiệm mà không nhận trùng. | Membership, ticket chưa giao | AC17 |
| US18 | Là Technician trong nhóm, tôi muốn tiếp nhận ticket New để xác nhận đã vào hàng đợi xử lý. | Ticket New | AC18 |
| US19 | Là assignee, tôi muốn bắt đầu ticket Open để thể hiện công việc đang được thực hiện. | Ticket Open, assignment hợp lệ | AC19 |
| US20 | Là người tham gia được phép, tôi muốn gửi bình luận công khai để trao đổi tiến độ hoặc trả lời câu hỏi. | Ticket chưa kết thúc | AC20 |
| US21 | Là IT có quyền trên ticket, tôi muốn ghi chú nội bộ để phối hợp mà không lộ nội dung cho requester. | Scope IT trên ticket | AC21 |
| US22 | Là người gửi nội dung, tôi muốn đính kèm ảnh/PDF hợp lệ để cung cấp bằng chứng xử lý. | Ticket/form nội dung cha | AC22 |
| US23 | Là người có quyền đọc nội dung cha, tôi muốn tải tệp để kiểm tra bằng chứng mà vẫn giữ quyền riêng tư. | Attachment tồn tại | AC23 |
| US24 | Là assignee, tôi muốn hỏi bổ sung và chuyển Pending để thể hiện rõ đang chờ ai và tạm dừng giải quyết. | In Progress | AC24 |
| US25 | Là assignee, tôi muốn ghi giải pháp và đề xuất Resolved để requester kiểm tra kết quả. | In Progress | AC25 |
| US26 | Là requester của ticket Resolved, tôi muốn xác nhận đóng để ghi nhận yêu cầu đã hoàn tất. | Resolved | AC26 |
| US27 | Là requester của ticket Resolved, tôi muốn mở lại có lý do để IT tiếp tục khi giải pháp chưa đạt. | Resolved, assignee hợp lệ | AC27 |
| US28 | Là Manager/Admin, tôi muốn mở lại ticket Closed có lý do để xử lý vấn đề phát hiện sau xác nhận. | Closed, assignee hợp lệ | AC28 |
| US29 | Là requester khi New hoặc Manager/Admin theo quyền, tôi muốn hủy ticket không còn cần thiết để kết thúc mà giữ lịch sử. | Trạng thái cho phép | AC29 |
| US30 | Là Manager/Admin, tôi muốn đổi ưu tiên có lý do để thời hạn phản ánh đánh giá tác động đã xác minh. | Snapshot và ticket | AC30 |
| US31 | Là người xem ticket, tôi muốn đọc timeline đúng quyền để hiểu ai đã thay đổi điều gì và khi nào. | TicketEvent | AC31 |
| US32 | Là người theo dõi ticket, tôi muốn thấy hai đồng hồ SLA để biết hạn phản hồi và giải quyết riêng biệt. | Snapshot và diễn biến trạng thái | AC32 |
| US33 | Là Manager/assignee, tôi muốn nhận cảnh báo SLA dù không mở dashboard để can thiệp kịp thời và không bị báo trùng. | SLA, bộ lập lịch, user nhận | AC33 |
| US34 | Là người dùng, tôi muốn xem thông báo của mình và đánh dấu đã đọc để biết các việc cần chú ý. | Notification | AC34 |
| US35 | Là Manager/Admin, tôi muốn tạo/cập nhật hồ sơ tài sản để thông tin thiết bị có nguồn thống nhất. | Quyền quản lý tài sản | AC35 |
| US36 | Là người dùng, tôi muốn tra cứu tài sản trong phạm vi được phép để tìm thiết bị cần xem. | Asset/assignment hoặc ticket liên quan | AC36 |
| US37 | Là người có quyền, tôi muốn xem lịch sử cấp phát và ticket liên quan thiết bị để hiểu bối cảnh vận hành. | Asset, assignment, ticket trong scope | AC37 |
| US38 | Là Manager/Admin, tôi muốn cấp một tài sản trong kho cho nhân viên để ghi nhận trách nhiệm sử dụng duy nhất. | Asset trong kho, user hoạt động | AC38 |
| US39 | Là Manager/Admin, tôi muốn thu hồi tài sản để kết thúc lượt giao và giữ dấu vết bàn giao. | Assignment hiệu lực | AC39 |
| US40 | Là Manager/Admin, tôi muốn đổi trạng thái tài sản có lý do để ngăn cấp phát thiết bị chưa sẵn sàng. | Asset, trạng thái/assignment hợp lệ | AC40 |
| US41 | Là nhân viên, tôi muốn thấy yêu cầu cần phản hồi và tài sản của mình để biết việc cần làm tiếp theo. | Ticket/assignment của mình | AC41 |
| US42 | Là Technician, tôi muốn thấy việc được giao, việc nhóm chưa nhận và áp lực SLA để chọn tác vụ tiếp theo. | Scope nhóm và SLA | AC42 |
| US43 | Là Manager/Admin, tôi muốn thấy số ticket tồn, chưa giao và theo nhóm/trạng thái/ưu tiên để điều phối. | Ticket trong scope | AC43 |
| US44 | Là Manager/Admin, tôi muốn xem xu hướng tạo/giải quyết và thời gian giải quyết hoạt động theo kỳ để đánh giá diễn biến. | Lịch sử trạng thái/SLA | AC44 |
| US45 | Là Manager/Admin, tôi muốn so sánh tải ticket hiện tại theo người xử lý để phân công có căn cứ. | Assignee và scope | AC45 |
| US46 | Là Manager/Admin, tôi muốn thấy tài sản sắp hết bảo hành để chuẩn bị xử lý trước hạn. | Ngày bảo hành | AC46 |
| US47 | Là Manager/Admin, tôi muốn tra cứu nhật ký trong phạm vi quản lý để kiểm tra thay đổi có trách nhiệm. | AuditLog theo quyền | AC47 |

## Review INVEST từng story

I và V đọc trực tiếp ở cột phụ thuộc và câu giá trị phía trên; T trỏ đến AC cùng số trong [AC catalog](06-acceptance-criteria.md). Bảng này bổ sung điểm thương lượng N, cơ sở ước lượng E và ranh giới S cho từng story. `R` không có nghĩa đội phát triển đã cam kết story đủ nhỏ cho một iteration.

| Story | N — Chi tiết được thương lượng | E/S — Căn cứ và giới hạn | Đánh giá |
|---|---|---|---|
| US01 | Bố cục form và cách diễn đạt lỗi | Một lần xác thực, không thêm SSO/MFA; chính sách password cần refinement | R |
| US02 | Vị trí nút và thông báo | Một phiên bị thu hồi, không là “logout mọi thiết bị” | R |
| US03 | Trường liên hệ và cách chia form | Không đổi role/email qua hồ sơ cá nhân | R |
| US04 | Gợi ý độ mạnh và nội dung xác nhận | Một lần đổi; password policy/thư viện được chọn ở M1 | R |
| US05 | Bố cục form user | Một user, mặc định Requester; Admin xử lý đề nghị cấp qua ticket của trưởng phòng theo D-29; không import/bulk invite | R |
| US06 | Dialog hay form riêng | Một user, kiểm tra membership/assignment bị ảnh hưởng | R |
| US07 | Cách trình bày tác động khóa | Revocation + chuyển giao có thể lớn; chia “khóa”/“mở khóa” khi refinement | C |
| US08 | Bảng hay form inline | Một phòng ban/lần; không xóa lịch sử | R |
| US09 | Cách chọn nhóm tiếp nhận | Một nhóm/lần, không định tuyến tự động | R |
| US10 | Cách chọn thành viên | Một thay đổi membership/lần; kiểm tra ticket đang giao | R |
| US11 | Thứ tự danh mục | Một danh mục/lần; không taxonomy nhiều tầng | R |
| US12 | Preview trước lưu | Một bảng chính sách có version, ticket cũ bất biến | R |
| US13 | Nhóm trường/gợi ý | Một ticket văn bản; tệp US22, tải US23; asset lookup M4 hoàn thiện | R |
| US14 | Preset filter, cột mặc định | Search và nhiều filter là lát cắt rộng; chia search/paging và filter nâng cao nếu cần | C |
| US15 | Sắp xếp panel | Một trang, nội bộ theo role; timeline riêng US31 | R |
| US16 | Dialog phân công | Giao trong nhóm/chuyển nhóm có thể tách hai story khi ước lượng | C |
| US17 | Vị trí nút nhận | Một ticket chưa giao; cạnh tranh đồng thời có AC | R |
| US18 | Nhãn tiếp nhận | Một cạnh New→Open, không tính first response | R |
| US19 | Nhãn bắt đầu | Một cạnh Open→In Progress và điều kiện assignee | R |
| US20 | Editor văn bản và gợi ý | Một public comment; auto-resume Pending là điều kiện cùng hành động | R |
| US21 | Tab hay vùng soạn riêng | Một note với kiểm thử không rò rỉ | R |
| US22 | Trình bày file picker | Gửi≤5 tệp; consistency/file storage cần spike; chia tạo ticket và comment nếu lớn | C |
| US23 | Tên nút tải | Một tệp/lần, kiểm tra quyền theo nội dung cha | R |
| US24 | Dialog hỏi bổ sung | Pending + câu hỏi cùng transaction; tiếp tục thủ công là nhánh nhỏ có AC | R |
| US25 | Template giải pháp | Một giải pháp công khai và Resolved, không auto-close | R |
| US26 | Nội dung xác nhận | Một cạnh Resolved→Closed cho requester | R |
| US27 | Gợi ý lý do | Một cạnh Resolved→In Progress; có ngoại lệ assignee D-12 | R |
| US28 | Cách mở dialog | Một cạnh Closed→In Progress chỉ M/A | R |
| US29 | Nội dung xác nhận | Nhánh requester New và M/A; có thể tách theo actor nếu cần | R |
| US30 | Cách so sánh ngân sách | Một thay đổi priority, snapshot và đã dùng được nêu | R |
| US31 | Nhóm/sắp thứ tự event | Một timeline có phân trang; visibility bắt buộc | R |
| US32 | Progress bar hay thời lượng | Hai đồng hồ có mô hình nhiều nhánh; tách hiển thị phản hồi/giải quyết nếu lớn | C |
| US33 | Copy thông báo, vị trí cảnh báo | Worker+dedup+recipients; cần spike và chia warning/breach/dedup trước sprint | C |
| US34 | Nhóm thông báo theo ngày | Danh sách và readAt, không real-time push/email | R |
| US35 | Nhóm trường asset | Tạo/sửa một hồ sơ; tách khi ước lượng, không sửa assignment ở đây | R |
| US36 | Cột và filter | Tra cứu asset có scope, không CMDB | R |
| US37 | Tab lịch sử/ticket | Hai tập thông tin của một asset; có thể chia, không mở rộng quyền | R |
| US38 | Nội dung biên bản ngắn | Một asset/user, constraint đồng thời; không ký điện tử | R |
| US39 | Bố cục thu hồi | Kết thúc một assignment và chọn trạng thái | R |
| US40 | Cách cảnh báo trạng thái | Một thay đổi trạng thái, không thêm bảo trì tự động | R |
| US41 | Thứ tự khối ưu tiên | Ba khối cá nhân, có thể chia ticket/asset theo lộ trình M0–M5 | R |
| US42 | Preset hàng đợi | Một dashboard theo nhóm, chung công thức SLA | R |
| US43 | Loại biểu đồ | KPI và ba phân bố khá rộng; chia KPI hàng đợi/phân bố khi ước lượng | C |
| US44 | Biểu đồ line/bar | Trend và average có cùng tập nguồn; chia hai story khi vượt iteration | C |
| US45 | Bảng/bar tải | Một phép nhóm, không xếp hạng hiệu suất | R |
| US46 | Vị trí module cảnh báo | Một cửa sổ30 ngày, không email nhắc tự động | R |
| US47 | Bố cục filter nhật ký | Một tập audit theo role, không công cụ SIEM | R |

Stories `C` chưa được tuyên bố “INVEST đạt hoàn toàn”; có kế hoạch chia và cần đội triển khai đánh giá. Không tách story thành “viết database”, “viết API” và “làm UI” rồi coi đó là giá trị độc lập. Quy tắc bảo mật, concurrency và accessibility đi cùng từng lát cắt.

## Stories quản lý công việc và điều phối — US-OPS01–12

Các story sau chỉ ở mức thiết kế, chưa triển khai, chưa ước lượng. Mã lõi US01–47 và trợ lý US-AI01–08 giữ nguyên. Chỉ số và quyền ở catalog gốc, không sao chép công thức vào frontend.

| ID / năng lực | User story và giá trị | Phụ thuộc / UC | AC / screen / mốc dự kiến |
|---|---|---|---|
| US-OPS01 / F-OPS01 | Là quản lý IT, tôi muốn xác nhận kỹ năng/lịch/ngân sách để việc giao dựa dữ liệu vận hành | Nhóm/user, UC-OPS01 | AC-OPS01 / SCR-OPS03 / M1 |
| US-OPS02 / F-OPS02 | Là quản lý, tôi muốn publish workflow và cấp/tắt policy để giới hạn hành động AI | Source/schema/permissions, UC-OPS02 | AC-OPS02 / SCR-OPS06 / M2 |
| US-OPS03 / F-OPS03 | Là requester, tôi muốn biết thông tin còn thiếu để IT có thể lập kế hoạch đúng | Ticket/context, UC-OPS03 | AC-OPS03 / SCR21/22/AI01 / M3 |
| US-OPS04 / F-OPS04 | Là quản lý, tôi muốn plan/task/DAG có nguồn và phiên bản để giám sát việc thực hiện | Template/KB, UC-OPS04 | AC-OPS04 / SCR-OPS02 / M2–M3 |
| US-OPS05 / F-OPS05 | Là quản lý, tôi muốn AI giao task cho người hợp lệ và có khả năng nhận để giảm chia việc thủ công | Capacity/policy/candidates, UC-OPS05 | AC-OPS05 / SCR-OPS01/04 / M2–M3 |
| US-OPS06 / F-OPS06 | Là kỹ thuật viên, tôi muốn cập nhật tiến độ/remaining/kết quả theo dependency để nhóm theo dõi chính xác | Task/assignment, UC-OPS06 | AC-OPS06 / SCR-OPS01/02 / M1–M2 |
| US-OPS07 / F-OPS07 | Là quản lý, tôi muốn thay lịch/tải kích hoạt re-evaluation để xử lý task ảnh hưởng kịp thời | Outbox/policy, UC-OPS07 | AC-OPS07 / SCR-OPS03/04 / M2–M3 |
| US-OPS08 / F-OPS08 | Là quản lý, tôi muốn duyệt/từ chối phương án có tác động rõ để quyết định ngoại lệ | Snapshot/policy, UC-OPS08 | AC-OPS08 / SCR-OPS05 / M2–M3 |
| US-OPS09 / F-OPS09 | Là quản lý, tôi muốn khóa phân công hoặc dừng automation để AI tôn trọng quyết định thủ công | Policy/task version, UC-OPS02/07 | AC-OPS09 / SCR-OPS02/06 / M2 |
| US-OPS10 / F-OPS10 | Là quản lý, tôi muốn truy vết run/action và xử lý retry để không thất lạc hoặc lặp hành động | Event/run/audit, UC-OPS09 | AC-OPS10 / SCR-OPS04 / M2–M3 |
| US-OPS11 / F-OPS11 | Là người có quyền, tôi muốn đọc nguồn Published có version/ACL; publisher muốn quản lý KB để trả lời và lập plan có căn cứ | KB/index/ACL, UC-OPS10 | AC-OPS11 / SCR-OPS07/AI01 / M4, nguồn tối thiểu M3 |
| US-OPS12 / F-OPS12 | Là quản lý, tôi muốn báo cáo tiến độ/tải/rủi ro và hành động từ dữ liệu nguồn để giám sát | MET16–22, UC-OPS09 | AC-OPS12 / SCR12/40/OPS04 / M4 |

### Đánh giá INVEST cho US-OPS01–12

I: mỗi story có kết quả nghiệp vụ riêng và phụ thuộc trên bảng, không tách story thành “DB/API/UI”. V: giá trị ở câu story. T: AC-OPS tương ứng và A1–A13. Không gắn trạng thái PASS khi chỉ đặc tả.

| Stories | N — có thể thương lượng | E/S — cần refinement |
|---|---|---|
| OPS01/02 | Cách nhập lịch/skill, bố cục scope/publish | Chia skills/calendar và workflow/policy nếu lớn; capacity kỳ/slot/threshold cần quyết định |
| OPS03/04 | Câu hỏi bổ sung, cách xem DAG | Chia intake/plan validation; template estimate phải được quản lý xác nhận |
| OPS05/06 | Cách giải thích candidates, board/table | Assignment atomic và progress/dependency là lát cắt riêng; không trì hoãn quyền/concurrency |
| OPS07/08/09 | Bố cục impact/diff/lock | Tách nghỉ phép→reassign khỏi approval stale/manual override nếu cần; giữ policy recheck |
| OPS10 | Timeline/filter run | Tách retry và observability; xác định exact business dedup keys |
| OPS11 | Editor/source card | Có thể chia publish/ACL/index/RAG; chưa chọn embedding production |
| OPS12 | Biểu đồ/bảng | Chốt query và mẫu số, không cam kết hiệu quả khi chưa đo |

Tổng backlog mục tiêu: 47 lõi + 8 trợ lý + 12 OPS = 67 stories. M1–M5 chỉ là lộ trình tài liệu, chưa lệnh coding.
