
# IT Operations Hub

IT Operations Hub là hệ thống quản lý và vận hành phòng ban IT nội bộ, tập trung yêu cầu hỗ trợ, công việc thực thi, nhân lực, tài sản và thông tin vận hành trong một không gian làm việc. Nhân viên theo dõi yêu cầu; kỹ thuật viên thực hiện công việc chuyên môn; trưởng phòng thiết lập chính sách, giám sát, can thiệp và duyệt ngoại lệ.


Sản phẩm phục vụ **một tổ chức**, với bốn vai trò người dùng **Requester, Technician, IT Manager và Admin**. **AI_COORDINATOR** là danh tính dịch vụ nội bộ giới hạn theo chính sách, không phải người dùng thứ năm hoặc Admin chung. Luồng trọng tâm: **tiếp nhận yêu cầu → lập kế hoạch/task → phân công → theo dõi/điều chỉnh → hoàn thành và báo cáo**. Ticket tiếp nhận yêu cầu và giữ SLA; Task thực thi có công sức, thời hạn và phụ thuộc.

**IT Manager (IT_MANAGER) là Trưởng phòng IT**. AI điều phối công việc theo chính sách; Trưởng phòng IT thiết lập chính sách, giám sát, can thiệp và duyệt ngoại lệ. Team là nhóm chuyên môn để tổ chức nhân sự và phạm vi công việc, không tạo thêm cấp quản lý. Trưởng các phòng ban khác gửi yêu cầu bằng quyền Requester.

**Trưởng phòng ban gửi ticket đề nghị cấp tài khoản bằng quyền Requester; Admin xác minh và tạo user.** AI có thể điều phối task này cho người đủ quyền nhưng không tự cấp tài khoản/role. Trưởng phòng IT quản lý policy khác với chức danh trưởng phòng ban gửi đề nghị. Xem [quy trình cấp tài khoản](docs/requirements/account-provisioning.md).

**Giai đoạn hiện tại:** phân tích và thiết kế; chưa triển khai hoặc nghiệm thu ứng dụng. M0–M5 là lộ trình dự kiến. Các sơ đồ và bản vẽ dùng dữ liệu minh họa. [Quyết định thiết kế và các điểm còn mở](docs/decisions/design-decisions.md) ghi rõ trạng thái.

## 1. Requirements — INVEST, Use Cases và Acceptance Criteria

Yêu cầu được phân tích từ mục tiêu sản phẩm xuống năng lực nghiệp vụ, vai trò, use case, user story và tiêu chí nghiệm thu. Mỗi story liên kết tới màn hình và quy tắc tương ứng để giữ nhất quán giữa nghiệp vụ và trải nghiệm.

### 1.1 Phân tích bài toán (Top-down Research)

| Cấp phân tích | Nội dung |
|---|---|
| Bối cảnh | Doanh nghiệp có đội IT nội bộ, nhiều phòng ban và nhiều thiết bị |
| Vấn đề | Yêu cầu phân tán; chia/giao việc thủ công; thiếu dữ liệu kỹ năng/lịch/tải; khó theo dõi phụ thuộc và thời hạn |
| Mục tiêu | Tập trung yêu cầu, rõ trách nhiệm, kiểm soát SLA, liên kết tài sản và lịch sử |
| Năng lực cốt lõi | Ticket, plan/task, nhân lực, điều phối AI, SLA, tài sản, KB/RAG, dashboard và thông báo |
| Phạm vi MVP | Một tổ chức, bốn vai trò người dùng; trợ lý và điều phối AI, KB/RAG thuộc nghiệm thu MVP |
| Cách kiểm chứng | AC nghiệp vụ, truy vết yêu cầu, phỏng vấn và usability test theo kế hoạch |

Nghiên cứu hiện gồm phân tích đặc tả và desk research. Các proto-personas, journeys và giả thuyết chưa được xác nhận bằng nghiên cứu người dùng thực tế. Chi tiết trong [Research top down](docs/00-research.md) và [phạm vi sản phẩm](docs/01-scope.md).

### 1.2 Product mind map

![IT Operations Hub — Product mind map](docs/xmind/previews/01-product-map.svg)

[Mở file XMind: tổng quan và research](docs/xmind/01-product-map.xmind) · [Xem sơ đồ nghiên cứu](docs/xmind/previews/02-research.svg)

### 1.3 INVEST requirements

Backlog mục tiêu có **67 user stories: 47 lõi + 8 trợ lý AI + 12 quản lý công việc/điều phối (OPS)**. Mỗi story có vai trò, giá trị, phụ thuộc và acceptance criteria; mã lõi được giữ để truy vết.

| Tiêu chí | Áp dụng trong IT Operations Hub |
|---|---|
| **Independent** | Mỗi story hướng đến một kết quả có thể demo; phụ thuộc dữ liệu và quyền được ghi rõ |
| **Negotiable** | Bố cục và chi tiết tương tác có thể điều chỉnh; quyền và quy tắc nghiệp vụ bắt buộc được giữ |
| **Valuable** | Giá trị gắn với gửi yêu cầu, xử lý, điều phối hoặc quản trị vận hành |
| **Estimable** | Xác định đầu vào, kết quả, actor, nhánh lỗi và phụ thuộc để đội phát triển refinement |
| **Small** | Chia theo kết quả người dùng; story rộng được đánh dấu cần xem xét chia nhỏ |
| **Testable** | Có AC quan sát được, gồm kiểm tra quyền, trạng thái, SLA và lỗi quan trọng |

| Nhóm story | Phạm vi |
|---|---|
| US01–US04 | Đăng nhập, phiên và hồ sơ cá nhân |
| US05–US12 | Người dùng, phòng ban, nhóm, danh mục và SLA mặc định |
| US13–US19 | Tạo, tra cứu, phân công và tiếp nhận ticket |
| US20–US31 | Hội thoại, tệp, trạng thái, ưu tiên và timeline |
| US32–US34 | Hai đồng hồ SLA, cảnh báo nền và thông báo |
| US35–US40 | Hồ sơ và vòng đời cấp phát tài sản |
| US41–US46 | Dashboard, báo cáo, tải công việc và bảo hành |
| US47 | Nhật ký kiểm tra |
| US-AI01–08 | Hỏi đáp/tra cứu/tóm tắt, ticket hội thoại sau xác nhận, nháp phản hồi và quản lý khả dụng |
| US-OPS01–12 | Nhân lực, workflow/policy, plan/DAG, giao việc, task progress, replan, approval, manual lock, trace, KB và báo cáo |

Các story rộng vẫn cần đội triển khai đánh giá và chia nhỏ; chưa có ước lượng hoặc cam kết sprint. Xem [67 user stories mục tiêu và review INVEST](docs/08-invest-requirements.md), [AC catalog](docs/06-acceptance-criteria.md) và [bản đồ backlog XMind](docs/xmind/06-invest-backlog.xmind).

### 1.4 Use cases

Catalog mục tiêu có **51 use case: 33 lõi + 8 trợ lý AI + 10 OPS**. Sơ đồ tổng quan và năm nhóm chi tiết bên dưới cùng đối chiếu catalog và ma trận quyền. Một mã UC xuất hiện ở nhiều góc nhìn vẫn là cùng một use case.

#### Tổng quan theo vai trò

![IT Operations Hub — Use case tổng quan theo vai trò và danh tính dịch vụ](docs/diagrams/use-cases-overview.svg)

#### Tài khoản và quản trị — UC01–UC09

![Use case tài khoản và quản trị](docs/diagrams/use-cases-access.svg)

#### Ticket, SLA và thông báo — UC10–UC26

![Use case ticket, SLA và thông báo](docs/diagrams/use-cases-ticket.svg)

#### Tài sản, dashboard và nhật ký — UC27–UC33

![Use case tài sản, dashboard và nhật ký](docs/diagrams/use-cases-operations.svg)

#### Trợ lý AI — UC-AI01–08

![Use case trợ lý AI theo quyền và xác nhận](docs/diagrams/use-cases-ai.svg)

#### Công việc, điều phối và kiến thức — UC-OPS01–10

![Use case công việc, điều phối và kiến thức](docs/diagrams/use-cases-work-management.svg)

[Mở bộ use case XMind](docs/xmind/02-use-cases.xmind) · [Catalog use case và luồng chi tiết](docs/03-use-cases.md) · [Xem sơ đồ UML dạng SVG](docs/diagrams/README.md)

Các bản đồ actor–goal hỗ trợ đọc và thảo luận phạm vi. Điều kiện theo bản ghi và trạng thái vẫn phải đối chiếu ma trận quyền; một actor xuất hiện trên sơ đồ không có nghĩa được thao tác trên mọi ticket.

### 1.5 Roles and permissions

| Năng lực | Requester | Technician | IT Manager | Admin |
|---|---|---|---|---|
| Gửi yêu cầu cá nhân | Có | Có | Có | Có |
| Xem ticket | Của mình | Trong nhóm; ticket cá nhân theo quyền requester | Toàn bộ | Toàn bộ |
| Bình luận công khai | Ticket của mình | Ticket trong phạm vi | Có | Có |
| Ghi chú nội bộ | Không | Trong nhóm | Có | Có |
| Tự nhận ticket chưa giao | Không | Trong nhóm | Theo điều kiện nhóm | Theo điều kiện nhóm |
| Phân công và chuyển nhóm | Không | Không | Có | Có |
| Đổi ưu tiên | Không | Đề nghị qua ghi chú | Có lý do | Có lý do |
| Xác nhận đóng Resolved | Chính người yêu cầu | Khi là người yêu cầu | Khi là người yêu cầu | Khi là người yêu cầu |
| Mở lại Closed | Không | Không | Có lý do | Có lý do |
| Tài sản | Được cấp cho mình | Phục vụ xử lý và tài sản cá nhân | Quản lý toàn bộ | Quản lý toàn bộ |
| Báo cáo tổ chức | Không | Không | Có | Có |
| User, nhóm, phòng ban và SLA | Không | Lookup tối thiểu | Lookup cần thiết | Quản lý |
| Task/plan | Tiến độ công khai đã lọc | Nhóm, cập nhật task được giao | Điều phối trong phạm vi | Theo quyền nghiệp vụ |
| Kỹ năng/lịch/capacity | Không | Bản thân/lookup tối thiểu | Cấu hình/xác nhận | Theo quyền quản lý |
| Policy/template/ngoại lệ | Không | Đọc phần cần thực hiện | Cấp/tắt, can thiệp, duyệt | Theo quyền quản lý |
| Kho kiến thức | Published theo ACL | Published theo ACL | Theo ACL/quyền publisher được cấp | Theo ACL, không tự mở mọi nội dung |

AI hội thoại dùng quyền người yêu cầu; điều phối nền dùng AI_COORDINATOR gắn policy/người cấp quyền. Model không tự Done/Resolved/Closed, cấp role hoặc sửa SLA/cam kết. Backend tương lai phải kiểm tra quyền ở từng thao tác và từng bản ghi. Ẩn nút/menu không thay thế kiểm tra quyền. Xem [ma trận quyền chi tiết](docs/requirements/permissions-matrix.md).

### 1.6 Acceptance criteria

Các AC xác định kết quả quan sát được, gồm luồng thành công, dữ liệu không hợp lệ, từ chối quyền và xung đột khi hai người cùng sửa.

- Ticket chỉ chuyển qua các trạng thái hợp lệ; bắt đầu xử lý cần người phụ trách.
- Pending có câu hỏi công khai; requester trả lời thì tiếp tục In Progress.
- Resolved bắt buộc giải pháp; requester xác nhận đóng hoặc mở lại có lý do.
- First response chỉ tính public comment có nội dung của IT; phân công và note không được tính.
- SLA giữ tổng thời gian đã dùng qua chuyển nhóm, đổi ưu tiên và mở lại; worker không báo trùng.
- Tệp, dữ liệu tài sản và dashboard đều tuân thủ phạm vi quyền.

Giữ **47 AC lõi, 10 AC xuyên suốt, 12 ví dụ SLA**; trợ lý có **8 AC/12 TC**; OPS có **12 AC/12 TC**, cùng bộ tiêu chí nghiệm thu **A1–A13**. Các gate kiểm cả plan/DAG, kỹ năng/lịch/tải, tự phân công, nghỉ phép/ngoại lệ, concurrency/retry, stale approval/manual lock, nguồn/quyền, provider lỗi và persistence/restore. Tất cả **PLANNED / NOT RUN**; [master traceability](docs/traceability/master-traceability.md) nối story/UC/AC/screen/BR/mốc.

## 2. Information Architecture, Screen Hierarchy và UI/UX

Workspace được tổ chức theo nhiệm vụ: tổng quan, yêu cầu/ticket, tài sản, theo dõi và quản trị. Điều hướng, màn hình và hành động thay đổi theo vai trò và phạm vi bản ghi.

### 2.1 Information architecture

![IT Operations Hub — Kiến trúc thông tin](docs/xmind/previews/06-information-architecture.svg)

[Mở kiến trúc thông tin XMind](docs/xmind/03-information-architecture.xmind) · [Sitemap, navigation, routes và screen inventory](docs/04-information-architecture.md)

### 2.2 Screen hierarchy

Đăng nhập dẫn vào workspace có sidebar và topbar. Tạo yêu cầu và chi tiết ticket dùng trang riêng; phân công, chờ phản hồi, giải quyết và mở lại dùng các dialog theo ngữ cảnh. Trang tài sản liên kết hồ sơ, lịch sử bàn giao và ticket trong cùng phạm vi quyền.

| Khu vực | Màn hình và tương tác |
|---|---|
| Tài khoản | Đăng nhập, hồ sơ, đổi mật khẩu |
| Tổng quan | Dashboard cá nhân, Technician và Manager/Admin |
| Ticket | Danh sách, tạo mới, chi tiết, hội thoại, nội bộ, SLA và timeline |
| Công việc/nhân lực | Task board/công việc của tôi, plan/DAG, kỹ năng/lịch/capacity |
| Điều phối | Events/runs/actions, ngoại lệ/approval, policy và workflow/template |
| Kho kiến thức | Draft/Published/version/ACL, truy xuất có nguồn |
| Xử lý ticket | Phân công, trạng thái, ưu tiên và các xác nhận |
| Tài sản | Danh sách, hồ sơ, chi tiết, cấp phát, thu hồi và trạng thái |
| Kỹ thuật mục tiêu | [Tech stack](docs/technical/tech-stack.md) · [Kiến trúc](docs/technical/architecture.md) · [Phiên bản](docs/technical/version-baseline.md) |
| Theo dõi | Báo cáo, thông báo và nhật ký |
| Quản trị | Người dùng, phòng ban, nhóm/thành viên, danh mục và SLA |
| Truy cập/lỗi | Không có quyền và không tìm thấy bản ghi |

Inventory mục tiêu có **36 mẫu: 26 lõi + 3 trợ lý AI + 7 OPS**, bao gồm page/dialog/trang lỗi. Các đường dẫn là thiết kế điều hướng, chưa triển khai. Bản vẽ tĩnh hiện có chưa phải hi-fi riêng cho mọi mẫu OPS.

### 2.3 Primary user flows

![IT Operations Hub — Luồng gửi và xác nhận yêu cầu](docs/xmind/previews/07-flow-requester.svg)

Bộ luồng gồm nhận/xử lý ticket, policy/plan/giao task, nghỉ phép/điều phối lại/approval, cấp phát/thu hồi, quản trị quyền, phục hồi lỗi và thông báo.

Các hình dùng khung có viền xanh đậm và lớp xanh sáng bên ngoài; luồng có mũi tên, điều kiện và bên chịu trách nhiệm. Xem thêm [kỹ thuật viên](docs/xmind/previews/08-flow-technician.svg) và [Trưởng phòng IT giám sát/duyệt ngoại lệ](docs/xmind/previews/09-flow-manager.svg). Đây là thiết kế mục tiêu; các chi tiết vận hành chưa chốt được ghi tại D-40.

![Luồng automation onboarding và ngoại lệ](docs/diagrams/automation-flow.svg)
 Xem [user journeys và task flows](docs/05-user-flows.md) hoặc [bộ luồng XMind](docs/xmind/04-user-flows.xmind).

### 2.4 UI/UX design

Giao diện dùng nền sáng, xanh dương dịu, card bo mềm và khoảng trắng thoáng để đọc bảng và xử lý công việc lâu dài. Bộ icon cùng hệ nét đi với nhãn rõ ràng; tiêu đề, bộ lọc và thao tác chính có cấp bậc dễ nhận biết. Thiết kế thân thiện bằng tiếng Việt, có bố cục desktop/tablet/mobile và quy định chuyển động ngắn, tôn trọng reduced motion. Trạng thái luôn có nhãn chữ.

Các hình dưới đây là bản thiết kế UI/UX tĩnh. Số liệu trên dashboard và ticket là dữ liệu hư cấu để minh họa bố cục. Các entry/nút AI thuộc thiết kế MVP; khi triển khai chỉ hiển thị thao tác sinh nội dung khi đã có cấu hình và chức năng thật, không dùng nút hoặc phản hồi giả để nghiệm thu.

#### Đăng nhập

![Đăng nhập — bản thiết kế với minh họa đội IT](docs/design/wireframes/01-login.svg)

#### Dashboard — Tổng quan vận hành

![Tổng quan Manager — dữ liệu minh họa](docs/design/wireframes/02-dashboard-manager.svg)

#### Dashboard Requester / trưởng phòng

![Dashboard cá nhân — yêu cầu cần phản hồi và tài sản được cấp](docs/design/wireframes/16-dashboard-requester.svg)

#### Dashboard Admin

![Dashboard Admin — hàng đợi dịch vụ Tài khoản và thao tác quản trị](docs/design/wireframes/17-dashboard-admin.svg)

#### Danh sách ticket

![Danh sách ticket — dữ liệu minh họa](docs/design/wireframes/03-tickets.svg)

#### Chi tiết và xử lý ticket

![Chi tiết Technician — dữ liệu minh họa](docs/design/wireframes/05-ticket-technician.svg)

#### Xử lý yêu cầu cấp tài khoản — Admin

![Ticket cấp tài khoản — trưởng phòng là requester, chỉ Admin mở form tạo user](docs/design/wireframes/18-ticket-account-provisioning.svg)

#### Xác nhận kết quả của người yêu cầu

![Chi tiết Requester — dữ liệu minh họa](docs/design/wireframes/06-ticket-requester.svg)


Bộ thiết kế có **16 bản UI SVG** (13 bản lõi và 3 bản AI), **2 board bổ trợ** và **44 icon SVG riêng**, bao gồm đăng nhập, tạo ticket, tài sản, SLA và trạng thái lỗi. Xem [gallery UI/UX](docs/design/wireframes/README.md), [đặc tả màn hình](docs/07-uiux-specification.md) và [bản đồ UI/UX XMind](docs/xmind/07-uiux.xmind).

[Xem board icon và component](docs/design/wireframes/14-icons-and-components.svg) · [Storyboard responsive/motion](docs/design/wireframes/15-responsive-motion.svg) · [Định hướng giao diện v0.4](docs/design/visual-refresh.md).

Các hình trên là thiết kế tĩnh, không phải ứng dụng đang hoạt động. Một số màn hình phụ trợ đã có đặc tả nhưng chưa có bản vẽ riêng.

### 2.5 Trạng thái và chất lượng trải nghiệm

| Trạng thái / yêu cầu | Hành vi thiết kế |
|---|---|
| Đang tải / cập nhật | Giữ shell, hiển thị trạng thái ở vùng dữ liệu liên quan |
| Chưa có dữ liệu / filter rỗng | Phân biệt hai trường hợp, có hành động phù hợp quyền |
| Lỗi tại trường | Giữ dữ liệu, lỗi cạnh input, focus rõ |
| Xung đột | Giữ bản nhập, yêu cầu kiểm tra dữ liệu mới; không ghi đè âm thầm |
| Không có quyền / hết phiên | Không lộ dữ liệu riêng tư, có đường về an toàn |
| Thành công | Cập nhật dữ liệu nguồn và thông báo kết quả cụ thể |
| Accessibility | Nhãn input, bàn phím, focus, tương phản, không chỉ dựa màu |
| Responsive | Bảng desktop, card mobile, form một cột và thao tác chính dễ bấm |

Chi tiết trong [Design system](docs/design/design-system.md), [Content and states](docs/design/content-and-states.md) và [kế hoạch kiểm chứng thiết kế](docs/research/validation-plan.md).

### 2.6 Trợ lý AI tích hợp trong MVP

AI gồm hai chế độ: **trợ lý theo yêu cầu** và **điều phối tự động theo chính sách**. Bật/tắt là lựa chọn vận hành, không loại AI khỏi nghiệm thu MVP. Trợ lý có 8 stories riêng; điều phối/work management/KB có 12 stories OPS.

![Trợ lý AI — thiết kế tĩnh, dữ liệu minh họa](docs/design/wireframes/11-ai-assistant.svg)

- **Tạo yêu cầu:** hội thoại → preview → user xác nhận nội dung/version → Ticket service tạo idempotent, bắt đầu SLA; có thể chỉnh tại form. Chưa xác nhận thì chưa tạo ticket.
- **Phản hồi:** AI soạn nháp → kỹ thuật viên đọc/chỉnh → gửi composer; chat/nháp không first response.
- **Điều phối:** hiểu yêu cầu → plan/task/DAG → candidates hợp lệ theo kỹ năng/lịch/tải → rank → service giao → theo dõi sự kiện → reassign trong policy hoặc approval. Default deny; không ghi đè manual lock/đang làm.
- **Quyền và nguồn:** user scope cho hội thoại, service grant cho nền; KB Published/version/ACL và citation mở được; public/internal tách ngữ cảnh.
- **Khả dụng:** AI lỗi không chặn luồng thủ công/SLA; outbox/retry chống trùng; model call ngoài transaction và recheck trước ghi.

AI không tự xác nhận Done/Resolved/Closed, cấp user/role, mua sắm hoặc chạy shell. Phương án được duyệt vẫn recheck policy/version/capacity; Approved khác execution succeeded. Xem [thiết kế AI](docs/10-ai-assistant.md), [catalog trợ lý](docs/ai/use-cases-stories-and-acceptance.md), [tích hợp](docs/ai/integration-and-non-regression.md) và [XMind AI](docs/xmind/08-ai-assistant.xmind).

<details>
<summary>Điều phối cụ thể: task DAG onboarding và xử lý nghỉ phép (DEMO)</summary>

![Sáu task onboarding, nhánh song song và người thực hiện](docs/diagrams/onboarding-task-dag.svg)

![Nghỉ phép: kiểm lịch/tải, giữ manual lock và duyệt ngoại lệ](docs/diagrams/replanning-flow.svg)

[Luồng đầy đủ](docs/05-user-flows.md) · [Sequence và kiến trúc](docs/diagrams/architecture.md) · [ERD theo miền](docs/requirements/conceptual-data-model.md).

</details>

## 3. Bộ sơ đồ XMind

Sơ đồ được tổ chức theo chủ đề để dễ chỉnh sửa và review. File tổng có **27 sheet**; các file nhỏ chỉ chứa phần tương ứng. SVG xem nhanh giữ cấu trúc nút/nhánh từ cùng topic nguồn; các luồng/trạng thái có cạnh/điều kiện rõ. Bố cục khi mở XMind có thể khác.

| File XMind | Nội dung |
|---|---|
| [IT Operations Hub — toàn bộ](docs/xmind/it-operations-hub.xmind) | 27 sheet, gồm 23 sheet nghiệp vụ/thiết kế và 4 sheet AI bổ sung |
| [01 — Product map](docs/xmind/01-product-map.xmind) | Tổng quan sản phẩm và nghiên cứu top down |
| [02 — Use cases](docs/xmind/02-use-cases.xmind) | Actor–goal cho core, trợ lý và OPS; catalog đủ 51 UC |
| [03 — Information architecture](docs/xmind/03-information-architecture.xmind) | Sitemap và phân cấp màn hình |
| [04 — User flows](docs/xmind/04-user-flows.xmind) | Bảy góc nhìn nghiệp vụ, gồm onboarding/replan/approval cập nhật |
| [05 — Business rules](docs/xmind/05-business-rules.xmind) | Trạng thái ticket/task/approval, SLA, tài sản, ưu tiên và mô hình dữ liệu |
| [06 — INVEST backlog](docs/xmind/06-invest-backlog.xmind) | 67 story có ID/phụ thuộc/AC: 47 core + 8 AI + 12 OPS |
| [07 — UI/UX](docs/xmind/07-uiux.xmind) | Trải nghiệm, chất lượng giao diện và 18 ảnh đính kèm: 16 bản UI + 2 board |
| [08 — Chatbot AI](docs/xmind/08-ai-assistant.xmind) | Trợ lý/điều phối, 8 UC-AI + 10 UC-OPS, xác nhận/tool/policy/ngoại lệ; 3 ảnh trợ lý minh họa |

Xem [hướng dẫn mở và danh mục sơ đồ](docs/xmind/README.md). Wireframe màn hình là tài liệu riêng; chúng cũng được đính kèm dạng ảnh trong file UI/UX để thuận tiện review.

## 4. Tech stack mục tiêu

| Phần | Công nghệ đã chọn |
|---|---|
| Frontend | Next.js App Router, React, TypeScript strict; Tailwind CSS, shadcn/ui, Lucide React |
| Form và dữ liệu | React Hook Form + Zod; TanStack Query/Table; Recharts; date-fns + @date-fns/tz |
| Backend | Python, FastAPI, Pydantic; SQLAlchemy đồng bộ, Alembic, Psycopg 3, PostgreSQL |
| Xác thực | Session phía server lưu PostgreSQL, cookie HttpOnly; Argon2id qua pwdlib, bảo vệ CSRF |
| Tác vụ và tệp | Celery + một Beat + Redis; local private khi dev, S3 private qua boto3 khi production |
| AI và tri thức | Provider/model/embedding adapter; PostgreSQL + pgvector; version/ACL/index nền |
| Kiểm thử/vận hành | pytest/HTTPX, Vitest/RTL, Playwright; uv/pnpm; Docker Compose, Nginx, Linux VPS, GitHub Actions |

Next.js sở hữu giao diện; FastAPI sở hữu API `/api/v1`, phân quyền và nghiệp vụ. Hai phần giao tiếp qua OpenAPI; UI không đọc database. Đây là lựa chọn thiết kế, chưa có ứng dụng chạy hoặc lockfile. Bộ phiên bản ứng viên đã được rà metadata, có điều chỉnh TypeScript/OpenAPI generator và redis-py/Kombu; chưa có bộ dependency/runtime được nghiệm thu.

Xem [tech stack](docs/technical/tech-stack.md), [kiến trúc](docs/technical/architecture.md), [phiên bản và điều kiện kiểm chứng M1](docs/technical/version-baseline.md).

## 5. C4 Architecture

Cách trình bày theo repo mẫu: README hiển thị C1–C3 và dẫn tới hồ sơ chi tiết; C4 Level 4 cùng các sequence nằm trong tài liệu kiến trúc. Đây là **thiết kế mục tiêu**, chưa có code/container đang chạy.

### C1 — System Context

![C1 — Bốn vai trò, Hub và provider ngoài trust boundary](docs/diagrams/system-context.svg)

Bốn vai trò R/T/M/A; Trưởng phòng IT thiết lập policy/giám sát/duyệt ngoại lệ, không có Trưởng nhóm IT. AI_COORDINATOR là dịch vụ bên trong Hub; provider ở ngoài chỉ nhận nguồn được phép.

[Context và boundary](docs/architecture/c4/01-context.md).

### C2 — Container

![C2 — Next.js, FastAPI, Celery, PostgreSQL và storage](docs/diagrams/system-containers.svg)

Next.js sở hữu giao diện; FastAPI sở hữu `/api/v1`, session/CSRF, quyền và domain. Worker Celery dùng chung domain service với Session riêng; một Beat, Redis broker và PostgreSQL/pgvector bền vững. Adapter model là component; không một microservice tự có quyền ghi.

[Container catalog và failure boundary](docs/architecture/c4/02-containers.md).

### C3 — Component

![C3 — API components và transaction boundary](docs/diagrams/c4-components-api.svg)

Router/schema → identity/scope → application/domain service → Unit of Work → repository/database. Domain effect, audit và outbox cùng transaction; model không giữ DB lock khi chờ.

<details>
<summary>C3 worker — snapshot, model, revalidation và commit</summary>

![C3 — Worker components](docs/diagrams/c4-components-worker.svg)

</details>

[Component catalog](docs/architecture/c4/03-components.md) · [C4 Level 4 — code collaboration dự kiến](docs/architecture/c4/04-code.md) · [Sequences và deployment](docs/diagrams/architecture.md) · [C4 Documentation](docs/architecture/c4/README.md).

## 6. Database Diagrams and OpenAPI Document

Hợp đồng dữ liệu và HTTP dưới đây là tài liệu thiết kế, chưa có database, migration, API server hoặc client đã sinh. Giữ FastAPI + SQLAlchemy đồng bộ + Alembic.

### 6.1 DBML / ER Mermaid format

![ER — Ticket, hội thoại và tệp](docs/diagrams/erd-ticket-sla.svg)

![ER — Plan, task và phụ thuộc](docs/diagrams/erd-work-plans.svg)

| Biểu diễn | Artifact | Phạm vi |
|---|---|---|
| DBML | [schema.dbml](docs/database/schema.dbml) | 52 entity logic, 59 tham chiếu, trường chọn lọc |
| ER Mermaid | [Mô hình logic và source Mermaid](docs/requirements/conceptual-data-model.md) | 11 góc nhìn PK/FK/cardinality và graph tổng |
| SVG | [Danh mục ERD](docs/diagrams/README.md) | Hình đã render theo miền |
| Ràng buộc và ánh xạ | [Database documentation](docs/database/README.md) | Invariant, nullable/index/FK còn refinement D-40 |

DBML giữ cùng entity logic với ER; không thay thế BR/ACL/atomic capacity hoặc schema vật lý. Partial unique (một Effective plan, một assignment tài sản), DAG, actor XOR và dedup phải được review trước migration.

### 6.2 OpenAPI API documentation

Hợp đồng dùng **OpenAPI 3.1.1 JSON**, có `74` paths, `96` operations và `95` reusable schemas, bao phủ API01–19.

```text
/api/v1 — target contract, not a running API
Opaque server session cookie + CSRF / Origin
Stable operationId + role / scope / BR metadata
JSON and multipart input; scoped public/internal response projections
expectedVersion + Idempotency-Key; bounded retry and conflict handling
200 / 201 / 202 / 204, safe 401 / 403 / 404 / 409 / 422 / 429 / 503 errors
Internal EVT01–17 and service grants documented separately from public HTTP
```

Không đổi sang JWT theo repo mẫu. Requester/role/grantor từ server; AI không tự Done/Resolved/Closed hoặc cấp user. Approval decision khác execution; provider lỗi không thành kết quả phân công.

- [OpenAPI document](docs/api/openapi.json)
- [API documentation và ví dụ DEMO](docs/api/README.md)
- [Operation catalog: method/path/operationId/role/scope](docs/api/operations.md)
- [Quy tắc API, transaction và event](docs/technical/api-design.md)

## 7. Frontend and Backend Folder Structures

Phân biệt hiện trạng và cấu trúc mục tiêu. Các cây planned mô tả vị trí file khi được yêu cầu triển khai riêng; không tạo source/config/test trong đợt tài liệu.

### 7.1 Current repository layout

```text
IT-Operation-Hub/
├── README.md
├── docs/
│   ├── api/                   # OpenAPI JSON, operation catalog, documentation
│   ├── database/              # DBML và ánh xạ ER Mermaid
│   ├── architecture/c4/       # C1–C4 documentation
│   ├── requirements/          # BR, scope, logical data model
│   ├── technical/             # Stack, architecture, code structure
│   ├── diagrams/              # SVG đã render
│   ├── design/                # UI/UX tĩnh
│   └── xmind/                 # Native diagrams và previews
└── src/
    ├── frontend/.gitkeep       # Chưa có code Next.js
    └── backend/.gitkeep        # Chưa có code FastAPI
```

### 7.2 Target Next.js feature structure

```text
src/frontend/                  # PLANNED
├── src/app/                   # App Router, layouts, page composition
├── src/features/              # Auth, tickets, work, workforce, automation, KB...
├── src/components/            # UI primitives, shell, feedback
├── src/lib/api/
│   ├── generated/schema.d.ts  # PLANNED từ OpenAPI
│   ├── client.ts              # Cookie/CSRF/idempotency/error adapter
│   └── query-keys.ts          # Partition theo user/scope
└── tests/                     # PLANNED component/e2e
```

### 7.3 Target FastAPI modular structure

```text
src/backend/                   # PLANNED
├── app/api/                   # Router / dependencies / HTTP errors
├── app/core/                  # Settings / security / principal / UTC clock
├── app/modules/               # Auth, tickets/SLA, assets, work/workforce,
│                              # automation, assistant/KB, reports/audit
├── app/infrastructure/        # Sync SQLAlchemy UoW, events, AI/storage adapters
├── app/workers/               # Celery jobs; SLA queues tách model
├── migrations/                # PLANNED Alembic, chưa tạo migration
└── tests/                     # PLANNED unit/integration/contract
```

Mỗi module phân tách transport/schema, service, policy/domain, model và repository theo nhu cầu. Repository không tự commit; worker dùng cùng command service, không HTTP giả Admin. [Cây đầy đủ từng route/module/file, ownership và dependency rules](docs/technical/code-structure.md).

## Documentation

[Mục lục hồ sơ và nguồn chuẩn](docs/README.md) · [Quy ước tài liệu/sơ đồ](docs/documentation-standard.md) · [Context, container, sequence và deployment](docs/diagrams/architecture.md).

| Nhóm | Tài liệu |
|---|---|
| Phân tích sản phẩm | [Research](docs/00-research.md) · [Scope](docs/01-scope.md) · [Features](docs/02-features.md) |
| Yêu cầu | [Use cases](docs/03-use-cases.md) · [INVEST](docs/08-invest-requirements.md) · [Acceptance criteria](docs/06-acceptance-criteria.md) |
| Cấu trúc và trải nghiệm | [IA](docs/04-information-architecture.md) · [Flows](docs/05-user-flows.md) · [UI/UX](docs/07-uiux-specification.md) |
| Quy tắc | [Nghiệp vụ](docs/requirements/business-rules.md) · [Phân quyền](docs/requirements/permissions-matrix.md) · [Chỉ số](docs/requirements/metrics-catalog.md) |
| Hợp đồng máy đọc và kiến trúc | [DBML/ER](docs/database/README.md) · [OpenAPI](docs/api/README.md) · [C4 C1–C4](docs/architecture/c4/README.md) · [Folders/files](docs/technical/code-structure.md) |
| Mô hình và chất lượng | [Mô hình/ERD](docs/requirements/conceptual-data-model.md) · [API thiết kế](docs/technical/api-design.md) · [NFR](docs/requirements/non-functional-requirements.md) |
| Thiết kế | [XMind](docs/xmind/README.md) · [Wireframes](docs/design/wireframes/README.md) · [Design system](docs/design/design-system.md) · [Nội dung và trạng thái](docs/design/content-and-states.md) |
| Thị giác và tương tác | [Giao diện v0.4](docs/design/visual-refresh.md) · [Motion và responsive](docs/design/motion-and-responsive.md) · [44 icon SVG](docs/design/icons/) |
| AI trợ lý và điều phối | [Thiết kế](docs/10-ai-assistant.md) · [Use cases/INVEST/AC](docs/ai/use-cases-stories-and-acceptance.md) · [Tích hợp và bảo toàn nghiệp vụ](docs/ai/integration-and-non-regression.md) |
| Kiểm chứng | [Validation plan](docs/research/validation-plan.md) · [Quyết định](docs/decisions/design-decisions.md) · [Truy vết](docs/traceability/master-traceability.md) |
| Kỹ thuật mục tiêu | [Tech stack](docs/technical/tech-stack.md) · [Kiến trúc](docs/technical/architecture.md) · [Phiên bản](docs/technical/version-baseline.md) |
| Theo dõi | [Lộ trình M0–M5](docs/09-design-readiness.md) · [Trạng thái hồ sơ](docs/review-report.md) |

## Project Progress

- [x] Phân tích top down, mục tiêu, phạm vi và giả thuyết nghiên cứu.
- [x] Catalog 51 use case, ma trận quyền và điều kiện nghiệp vụ ở mức thiết kế.
- [x] 67 user stories mục tiêu cùng review INVEST, AC và truy vết; chưa ước lượng triển khai.
- [x] Information architecture, screen hierarchy và user flows.
- [x] Bộ sơ đồ XMind có thể chỉnh sửa và ảnh xem nhanh.
- [x] UI/UX v0.4: 16 bản UI, 2 board thiết kế, 44 icon SVG; đặc tả responsive và chuyển động.
- [ ] Prototype tương tác và kiểm chứng animation, bàn phím, responsive trên UI thực thi.
- [x] Chốt stack frontend/backend và kiến trúc mục tiêu; rà metadata, ghi rõ gate kiểm chứng M1.
- [x] Đặc tả trợ lý và điều phối AI, task/policy/approval/KB, ERD và API thiết kế.
- [x] Biên soạn DBML/ER, OpenAPI document, C4 C1–C4 và cây code mục tiêu ở mức design draft.
- [ ] Review/duyệt DTO/schema vật lý và kiểm contract với runtime sau khi có yêu cầu phát triển riêng.
- [ ] Kết nối provider/model và kiểm A1–A13, AC/TC lõi, trợ lý và OPS khi được yêu cầu phát triển riêng.
- [ ] Phỏng vấn, tree test và usability test với người dùng thực tế.
- [ ] Hoàn thiện bản vẽ riêng cho các màn hình phụ trợ.
- [ ] Triển khai M1–M5 và kiểm thử ứng dụng khi được yêu cầu riêng; hiện chỉ hoàn thiện tài liệu M0.

Phạm vi hiện tại chỉ gồm tài liệu và thiết kế. Backend, dữ liệu bền vững, worker SLA, chatbot AI và các luồng tự động chưa được triển khai hoặc nghiệm thu.
