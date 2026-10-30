# Actors và use cases

## Ranh giới hệ thống

Hệ thống là **IT Operations Hub cho một tổ chức**. Actor chính: Requester, Technician, IT Manager và Admin. “Người yêu cầu của ticket” là quan hệ với bản ghi, có thể là user thuộc bất kỳ role nào. Tác nhân phụ **Bộ lập lịch** kích hoạt kiểm tra SLA; worker thuộc hệ thống, không có quyền tương tác như người dùng. Database và file storage là chi tiết nội bộ, không phải actor nghiệp vụ.

Đăng nhập là use case riêng và là tiền điều kiện cho tác vụ cần bảo vệ; không vẽ mọi use case `include` đăng nhập. Association actor–use case thể hiện tham gia, không tự xác lập quyền trên mọi bản ghi; đọc cùng [ma trận quyền](requirements/permissions-matrix.md).

## Sơ đồ use case XMind

![Use case theo vai trò](xmind/previews/00-use-cases-overview.svg)

[Mở file XMind](xmind/02-use-cases.xmind). File gồm bốn sheet: tổng quan và ba nhóm tài khoản/quản trị, ticket/SLA, tài sản/quan sát. Các chủ đề ghi mã UC để đối chiếu catalog; ghi chú có actor, story và điều kiện phạm vi.

Bản đồ XMind tổ chức actor–goal để đọc và chỉnh sửa. Đây không phải cách thay thế ký pháp UML chính thức. Phụ lục UML vẫn được giữ để kiểm tra association và system boundary:

- [Tài khoản và quản trị — SVG](diagrams/use-cases-access.svg): UC01–UC09.
- [Ticket, SLA, thông báo — SVG](diagrams/use-cases-ticket.svg): UC10–UC26.
- [Tài sản và quan sát — SVG](diagrams/use-cases-operations.svg): UC27–UC33.
- [UML tổng quan dạng SVG](diagrams/use-cases-overview.svg).

[Xem tất cả sơ đồ và hướng dẫn mở trong VS Code/GitHub](diagrams/README.md).

Các SVG được bố trí lại theo góc nhìn actor của cùng một hệ thống. Mã UC lặp ở nhiều góc nhìn vẫn biểu diễn cùng nghiệp vụ; Admin kế thừa IT Manager và mọi vai trò đều có các tác vụ dùng chung. Phạm vi đọc/ghi cụ thể theo ma trận quyền.

## Danh mục đầy đủ

| ID | Mục tiêu | Actor chính | Stories | Kết quả |
|---|---|---|---|---|
| UC01 | Đăng nhập | Tất cả | US01 | Phiên hợp lệ, workspace đúng quyền |
| UC02 | Đăng xuất | Tất cả | US02 | Phiên hiện tại vô hiệu |
| UC03 | Xem/cập nhật hồ sơ | Tất cả | US03 | Thông tin cá nhân được cập nhật trong giới hạn |
| UC04 | Đổi mật khẩu | Tất cả | US04 | Mật khẩu mới có hiệu lực, phiên khác bị thu hồi |
| UC05 | Quản lý tài khoản | Admin | US05–US07 | Tạo, đổi quyền/phòng ban, khóa/mở khóa có lịch sử |
| UC06 | Quản lý phòng ban | Admin | US08 | Danh mục có trạng thái, không phá lịch sử |
| UC07 | Quản lý nhóm/thành viên | Admin | US09–US10 | Phạm vi nhóm được cấu hình |
| UC08 | Quản lý danh mục ticket | Admin | US11 | Danh mục mới/hiện hành/ngừng dùng |
| UC09 | Cấu hình SLA mặc định | Admin | US12 | Phiên bản mặc định mới, không đổi ticket cũ |
| UC10 | Tạo ticket | Tất cả, cho chính mình | US13 | Mã, trạng thái New, ưu tiên và snapshot |
| UC11 | Tìm/lọc danh sách ticket | Tất cả | US14 | Kết quả đúng phạm vi, sort, phân trang |
| UC12 | Đọc chi tiết và timeline | Tất cả theo scope | US15, US31 | Nội dung và lịch sử đúng visibility |
| UC13 | Phân công/chuyển nhóm/tự nhận | T, M, A | US16–US17 | Assignee hợp lệ, không reset SLA |
| UC14 | Tiếp nhận/bắt đầu xử lý | T, M, A | US18–US19 | Trạng thái theo đường hợp lệ |
| UC15 | Trao đổi công khai | Requester của ticket, IT có scope | US20 | Nội dung lưu, thông báo, có thể resume Pending |
| UC16 | Ghi chú nội bộ | IT có scope | US21 | Chỉ người có quyền IT đọc được |
| UC17 | Gửi/tải tệp | Người có quyền nội dung cha | US22–US23 | Tệp hợp lệ, tải qua quyền |
| UC18 | Chờ phản hồi/tiếp tục | Assignee, M, A | US24 | Câu hỏi công khai, đồng hồ pause/resume |
| UC19 | Đề xuất giải quyết | Assignee, M, A | US25 | Giải pháp công khai, Resolved |
| UC20 | Xác nhận đóng | Requester của ticket | US26 | Closed, lịch sử giữ nguyên |
| UC21 | Mở lại | Requester khi Resolved; M/A | US27–US28 | In Progress có lý do, tiếp tục SLA |
| UC22 | Hủy | Requester khi New; M/A trước Resolved | US29 | Cancelled, giữ lịch sử |
| UC23 | Điều chỉnh ưu tiên | M, A | US30 | Lý do, ngân sách mới theo snapshot |
| UC24 | Theo dõi hai đồng hồ SLA | Tất cả theo scope | US32 | Nhãn, thời gian và lịch sử nhất quán |
| UC25 | Phát hiện và cảnh báo SLA | Bộ lập lịch; M/assignee nhận kết quả | US33 | Cảnh báo nền không trùng |
| UC26 | Xem/đọc thông báo | Tất cả | US34 | Chỉ thông báo của mình, readAt |
| UC27 | Tra cứu/quản lý hồ sơ tài sản | R/T đọc có scope, M/A quản lý | US35–US36 | Danh mục đúng quyền, thông tin hợp lệ |
| UC28 | Xem lịch sử tài sản/ticket | Tất cả theo scope | US37 | Lịch sử và ticket không vượt quyền |
| UC29 | Cấp phát | M, A | US38 | Một assignment hiệu lực |
| UC30 | Thu hồi | M, A | US39 | Assignment kết thúc, giữ lịch sử |
| UC31 | Đổi trạng thái tài sản | M, A | US40 | Hợp lệ với assignment, có lý do |
| UC32 | Xem dashboard/báo cáo | Tất cả theo scope; báo cáo M/A | US41–US46 | Chỉ số đúng công thức, dữ liệu nguồn |
| UC33 | Tra cứu nhật ký kiểm tra | M, A | US47 | Sự kiện đúng phạm vi, không bí mật |

## Hợp đồng dùng chung

**Tiền điều kiện:** phiên server hợp lệ, tài khoản hoạt động, role và quan hệ bản ghi thỏa ma trận. **Bảo đảm tối thiểu:** từ chối không thay đổi dữ liệu; không lộ nội dung ngoài quyền; dữ liệu nhập giữ khi lỗi có thể sửa. **Mutation:** kiểm tra version, lưu thay đổi và lịch sử nhất quán; thông báo tham chiếu một sự kiện để chống trùng. **Ngoại lệ chung:** validation, hết phiên, mất quyền, xung đột, lỗi lưu/tệp. Không retry âm thầm thao tác ghi.

## Các use case trọng yếu

### UC10 — Tạo ticket

- **Kích hoạt:** người dùng chọn “Tạo yêu cầu”. Tiền điều kiện bổ sung: có nhóm tiếp nhận, danh mục và SLA mặc định hoạt động.
- **Luồng chính:** nhập tiêu đề/mô tả/loại/danh mục → chọn ảnh hưởng/khẩn cấp → thấy ưu tiên đề xuất → chọn tài sản của mình và tệp nếu có → gửi → hệ thống xác thực lại quyền và dữ liệu → tạo mã, New, nhóm tiếp nhận, snapshot SLA và event → mở chi tiết, thông báo thành công.
- **Nhánh:** asset không còn được cấp hoặc tệp sai → giữ form, chỉ lỗi tại trường; cấu hình tiếp nhận thiếu → báo không thể gửi, giữ form, hướng dẫn liên hệ Admin; gửi lại do mạng → không nhân đôi ticket.
- **Hậu điều kiện:** requester là actor; không nhận priority/assignee tùy ý từ client.

### UC11/UC12 — Danh sách và chi tiết

- Chọn scope của tôi/công việc IT theo role → tìm mã/tiêu đề → kết hợp trạng thái, ưu tiên, danh mục, nhóm, assignee, SLA → sort → phân trang → mở chi tiết.
- Quay lại giữ filter/trang. ID ngoài scope trả cùng thông điệp với ID không tồn tại. Count, comment, tệp và timeline dùng cùng quyền.
- Requester không có tab nội bộ hay metadata của nội dung đó. Mất quyền sau chuyển nhóm → rời vùng dữ liệu bảo vệ, không tải thêm nội dung.

### UC13 — Phân công hoặc chuyển nhóm

- M/A mở “Phân công” → chọn nhóm → chọn thành viên hoạt động → nếu đổi nhóm nhập lý do → xem tóm tắt → xác nhận.
- Hệ thống kiểm tra version/membership, trạng thái và assignee bắt buộc khi đang xử lý → ghi cũ/mới + event + thông báo → hiển thị người mới. SLA giữ thời gian đã dùng.
- T chọn “Nhận xử lý” với ticket nhóm chưa giao; không chọn user khác. Nếu có người vừa nhận trước → báo xung đột, tải trạng thái mới; không ghi đè.

### UC14 — Tiếp nhận và bắt đầu

- T trong nhóm tiếp nhận New→Open. Chưa có assignee vẫn có thể tiếp nhận.
- Assignee hợp lệ chọn “Bắt đầu xử lý” Open→In Progress. Không có assignee → gợi ý tự nhận hoặc liên hệ M/A; backend từ chối thao tác trực tiếp.
- Hai thao tác không ghi nhận first response; không có chuyển New→In Progress ẩn trong một nút.

### UC15/UC16 — Công khai và nội bộ

- Người viết chọn đúng composer, nhập nội dung, tệp tùy chọn, đọc nhãn người xem rồi gửi.
- Public comment của IT hợp lệ lần đầu ghi firstResponseAt. Public của requester khi Pending đồng thời chuyển In Progress và tiếp tục SLA giải quyết.
- Note không ảnh hưởng first response và không thông báo nội dung cho requester. Chuyển composer không sao chép note sang public. Closed/Cancelled chỉ đọc.

### UC18 — Chờ phản hồi

- Assignee/M/A ở In Progress chọn “Chờ phản hồi” → nhập câu hỏi có nội dung → xác nhận công khai.
- Hệ thống lưu public comment và trạng thái Pending, chốt đoạn thời gian giải quyết, thông báo requester. Phản hồi đầu chỉ hoàn tất nhờ comment hợp lệ, không nhờ trạng thái.
- Requester trả lời qua UC15 → resume. IT chủ động tiếp tục phải ghi lý do; không được Pending→Resolved trực tiếp.

### UC19/UC20 — Giải quyết và đóng

- Assignee/M/A ở In Progress chọn “Đề xuất giải quyết”, nhập nội dung đã làm/kết quả/hướng kiểm tra → gửi công khai.
- Hệ thống lưu giải pháp, public comment, event Resolved và dừng đồng hồ giải quyết; requester thấy banner “Cần bạn xác nhận”.
- Requester thử lại rồi chọn “Xác nhận đóng” → dialog tóm tắt → Closed. Không có auto-close; IT không đóng thay chỉ vì có role cao.

### UC21 — Mở lại

- Requester chọn “Yêu cầu xử lý lại” từ Resolved, ghi lý do; hoặc M/A mở lại Resolved/Closed có lý do.
- Kiểm tra version/assignee hiện hợp lệ → In Progress → resume phần ngân sách còn lại, giữ mọi vi phạm trước đó → thông báo assignee/requester phù hợp.
- Người yêu cầu không mở lại Closed bằng API. Nếu assignee cũ bị khóa/mất nhóm, hiển thị cần M/A phân công lại, không tạo đường chuyển trạng thái mới [D-12].

### UC23/UC24/UC25 — Ưu tiên và SLA

- M/A xem đề xuất, ưu tiên hiện tại, ngân sách và thời gian đã dùng → chọn mức mới + lý do → hệ thống áp ngân sách snapshot tương ứng, lưu adjustment và event.
- UI tách phản hồi/giải quyết; Remaining có thể âm, lịch sử vi phạm luôn còn. Pending chỉ pause giải quyết.
- Bộ lập lịch gọi kiểm tra → xác định ngưỡng chưa gửi → tạo vi phạm/thông báo có khóa duy nhất → chạy lại không sinh thêm. Worker vẫn chạy khi không có phiên trình duyệt.

### UC29/UC30/UC31 — Vòng đời cấp phát

- M/A mở asset Trong kho → “Cấp phát” → chọn user hoạt động, ngày giao, ghi chú → kiểm tra version và không có assignment hiệu lực → ghi assignment, Đang sử dụng và audit.
- Khi thu hồi → chọn trạng thái đích Trong kho/Đang sửa chữa → kết thúc assignment và audit; không xóa dòng lịch sử.
- Cấp phát tài sản sửa chữa/ngừng sử dụng hoặc đang có người giữ → từ chối. Hai người cấp đồng thời chỉ một thành công.

### UC05/UC07/UC09 — Quản trị an toàn

- Theo [D-29 — cấp tài khoản nội bộ](requirements/account-provisioning.md), trưởng phòng dùng UC10 tạo ticket Yêu cầu dịch vụ / Tài khoản trong hệ thống bằng Requester. Admin xác minh đề nghị và dùng UC05 tạo user tại Quản trị → Người dùng, mặc định Requester; vai trò IT cần phê duyệt đúng thẩm quyền. Trưởng phòng theo dõi và xác nhận đóng ticket; không đổi requester sang nhân viên được cấp. Không thêm role trưởng phòng hoặc HR, không tự tạo user từ ticket.
- Admin tạo user với role/phòng ban và password ban đầu, hoặc sửa role/khóa user có xác nhận. Mật khẩu không xuất hiện lại trong danh sách/audit.
- Bỏ membership/khóa người đang xử lý cần xử lý các assignment mở; thu hồi quyền/phiên và giữ lịch sử. Không vô hiệu Admin cuối cùng.
- Sửa SLA tạo phiên bản mặc định mới, hiển thị preview P1–P4 và phạm vi “Chỉ ticket tạo mới”; ticket cũ giữ snapshot. Các thay đổi quan trọng có audit.

### UC32 — Dashboard và báo cáo

- Xác định role/scope → tải KPI hàng đợi hiện tại và báo cáo theo khoảng ngày có nhãn riêng → lọc → xem chi tiết chỉ số.
- Drill-down giữ đúng công thức và tập nguồn; không có dữ liệu hiển thị trạng thái rỗng, không thay bằng demo. Khi tải lỗi không hiển thị0 thay cho “không tải được”.

Các UC còn lại dùng hợp đồng chung và AC tương ứng; chi tiết trường/interaction nằm trong [đặc tả UI/UX](07-uiux-specification.md).
