# Đặc tả UI/UX theo màn hình

Trạng thái: **thiết kế đích, chưa có UI thực thi**. Đọc cùng [IA](04-information-architecture.md), [ma trận quyền](requirements/permissions-matrix.md), [design system](design/design-system.md) và [content/state contract](design/content-and-states.md). ID screen dùng trong AC và bảng truy vết.

Bản vẽ được làm mới thị giác ở **v0.4**: khoảng trắng thoáng hơn, card bo mềm, bộ icon24 px thống nhất và hành vi chuyển động có kiểm soát. Xem [định hướng giao diện](design/visual-refresh.md), [icon/component](design/wireframes/14-icons-and-components.svg) và [motion/responsive](design/motion-and-responsive.md). Không đổi screen ID hoặc logic nghiệp vụ.

## 1. App shell và nguyên tắc tương tác

Desktop1440 px: sidebar244 px, topbar76 px, content cách sidebar32 px, khoảng cách panel20 px. Sidebar sáng, mục hiện tại nền xanh đậm và chữ/icon trắng; tên sản phẩm ngắn “IT Operations Hub”. Topbar có tìm mã/tiêu đề ticket, nút thông báo có tên truy cập và account menu. Breadcrumb khi vào chi tiết, một heading cấp1/page.

Mỗi màn hình có một primary action phù hợp nhiệm vụ. Không đặt nút xử lý cạnh nút hủy với cùng mức nhấn. Các đường chuyển trạng thái là action có tên rõ, không là dropdown tùy chọn mọi trạng thái. Hành động không có quyền bị ẩn; hành động có quyền nhưng thiếu điều kiện có thể hiện disabled cùng lý do có thể đọc bằng bàn phím.

Văn bản và biểu tượng cùng thể hiện trạng thái. Không đưa dữ liệu kỹ thuật như snapshot JSON, version number hoặc tên endpoint vào luồng người dùng thông thường; manager xem ngân sách SLA dạng thời lượng và lịch sử điều chỉnh.

## 2. Tài khoản — SCR01/02/03

**Đăng nhập:** một vùng giới thiệu ngắn bên trái, form bên phải; mobile chỉ giữ tiêu đề và form. Trường email, password có nhãn và nút hiện/ẩn có tên truy cập. Primary “Đăng nhập”; Enter gửi form; submit đang chạy có trạng thái “Đang đăng nhập…”. Không có đăng ký, role picker, email reset hoặc CTA giả. Hướng dẫn tĩnh “Tài khoản do quản trị viên cấp. Cần hỗ trợ? Liên hệ IT nội bộ.” Không hiển thị password demo hay tài khoản mặc định trong giao diện vận hành.

**Hồ sơ:** tên, email chỉ đọc, vai trò/phòng ban chỉ đọc, thông tin liên hệ được phép sửa. “Lưu thay đổi” chỉ có khi có thay đổi. Không trộn quyền tự đổi role vào form. **Đổi mật khẩu:** mật khẩu hiện tại, mới và xác nhận, hướng dẫn policy trước nhập; giữ giá trị không nhạy cảm khi lỗi, không đưa password vào log. Password fields không được giữ sau thành công/rời phiên; nút hiện/ẩn từng trường độc lập.

## 3. Dashboard theo vai trò — SCR10/11/12

### Nhân viên

Mở đầu “Xin chào, [Tên]” và “Tạo yêu cầu”. Khối “Cần bạn phản hồi” lên trước gồm Pending và Resolved, nhãn CTA lần lượt “Trả lời”/“Kiểm tra kết quả”. Bên dưới là yêu cầu gần đây và tài sản đang được cấp. Ticket không cần hành động vẫn xem qua “Yêu cầu của tôi”. Không có tổng ticket công ty, tên nhân sự khác hoặc KPI SLA nhóm.

### Technician

Khối việc được giao, nhóm chưa phân công, sắp hạn và quá hạn. Chọn nhóm trong các membership hiện tại; “Tất cả nhóm của tôi” là hợp không trùng. Bảng “Ưu tiên xử lý” hiện mã/tiêu đề, status, priority, SLA cần chú ý và assignee. “Nhận xử lý” chỉ ticket chưa giao thuộc nhóm; không có dropdown giao cho đồng nghiệp. Có lối sang dashboard cá nhân.

### Manager/Admin

KPI hàng đợi hiện tại gồm chưa xong, chưa phân công, sắp vi phạm, đã vi phạm; ghi “Hiện tại · mọi ngày tạo”. Các KPI chồng lấn nên không cộng thành tổng. Khu vực phân tích riêng có filter kỳ, phân bố status/priority/team, trend tạo/resolve, thời gian hoạt động trung bình với n và tải kỹ thuật viên. Module bảo hành liên kết asset.

Click KPI mở danh sách đúng tập; filter kỳ không âm thầm áp lên hàng đợi hiện tại. Không có tăng/giảm% giả, donut không rõ mẫu số, “AI insights” hoặc nút xuất chưa đặc tả. Load/error/empty cho từng panel, không chặn toàn bộ trang nếu một biểu đồ lỗi.

## 4. Danh sách ticket — SCR20

Header: tên theo scope, mô tả phạm vi, CTA Tạo yêu cầu. Toolbar: search, các filter status/priority/team, mở filter bổ sung category/assignee/SLA; chip filter có nhãn và nút xóa; “Xóa bộ lọc”. Bộ lọc chỉ liệt kê lựa chọn được phép. Topbar search và toolbar đều tìm ticket, không trở thành hai hệ tìm khác nhau.

Cột desktop: Mã & tiêu đề, Người yêu cầu (ẩn ở góc nhìn cá nhân nếu dư), Trạng thái, Ưu tiên, Nhóm & assignee, SLA cần chú ý, Cập nhật. Nội dung dài rút gọn có đường đọc đầy đủ; mã là link focus được. Ưu tiên sort theo P1→P4, không theo alphabet; SLA có chữ “Phản hồi” hoặc “Giải quyết”, không một countdown không rõ nghĩa.

Pagination có tổng kết quả theo quyền, trang hiện tại, chọn20/50/100 và nút trước/sau có nhãn. Không bulk action trong MVP. Trên mobile chuyển mỗi ticket thành card với thứ tự mã/tiêu đề→status/priority→người xử lý→SLA; không giấu thời hạn hoặc thao tác cốt lõi sau cuộn ngang.

## 5. Tạo ticket — SCR21

Một page có form chính và panel “Điều gì xảy ra tiếp theo?”. Form chia “Nội dung yêu cầu”, “Mức ảnh hưởng”, “Thiết bị và tệp”. Không bắt người dùng chọn nhóm/assignee/priority trực tiếp.

| Trường | Loại input / mặc định | Validation và nội dung hỗ trợ |
|---|---|---|
| Tiêu đề* | Text | 5–180 ký tự; “Ví dụ: Không truy cập được thư mục dùng chung” |
| Loại* | Radio2 lựa chọn | Sự cố cá nhân / Yêu cầu dịch vụ, giải thích ngắn |
| Danh mục* | Select | Chỉ danh mục hoạt động; mặc định chưa chọn |
| Mô tả* | Textarea | 10–10.000 ký tự; mong muốn, hiện tượng, thời điểm; “Không gửi mật khẩu hoặc mã truy cập” |
| Ảnh hưởng* | Radio/select | Một người / Một nhóm/phòng ban / Toàn tổ chức; chưa chọn sẵn |
| Khẩn cấp* | Radio/select | Thấp / Trung bình / Cao; ví dụ theo khả năng tiếp tục làm việc |
| Ưu tiên đề xuất | Read-only summary | Tính ngay khi đủ2 trường; giải thích IT sẽ xác minh |
| Tài sản | Searchable select | Tùy chọn, chỉ asset của mình; “Không liên quan thiết bị” |
| Đính kèm | File picker có nút | PNG/JPEG/WebP/PDF, ≤10MB/tệp, ≤5; list tên/kích thước/xóa trước gửi |

Primary “Gửi yêu cầu”, secondary “Hủy” quay danh sách; có xác nhận rời trang nếu form thay đổi. Panel side diễn giải New, phản hồi trong ứng dụng và xác nhận đóng; không hứa SLA trước khi có priority/snapshot chính xác. Validation client hỗ trợ, server là quyết định cuối. Trạng thái chưa rõ kết quả gửi do mạng không được mời bấm gửi nhiều lần không kiểm tra.

## 6. Chi tiết ticket — SCR22

Hai cột desktop: nội dung khoảng2/3, ngữ cảnh1/3. Header mã/tiêu đề/status/priority; hành động bên phải tùy role/trạng thái. Công khai và nội bộ có vùng audience rõ ràng; nhãn nội bộ “Chỉ nhóm IT có quyền xem ticket” kèm biểu tượng khóa. Requester không có tab trống “nội bộ” hoặc badge số note.

Conversation mới nhất phía dưới, mỗi nội dung có người, vai trò, ngày giờ, visibility nếu nội bộ và file list. Không tự cuộn ra khỏi vị trí đang đọc khi dữ liệu mới đến; nếu có dữ liệu mới, hiện nút tải lại phần hội thoại. Không hứa real-time khi chưa có cơ chế cập nhật.

Panel context: requester/phòng ban tối thiểu, loại/category, impact/urgency, nhóm/assignee, hai thẻ SLA và asset liên quan. SLA phản hồi hoàn thành hiển thị thời gian thực tế và kết quả; resolution Pending hiển thị Tạm dừng cùng đã dùng/còn lại; có lịch sử vi phạm riêng. Chỉ M/A có nút đổi priority; T có thể đề nghị qua note.

Timeline là vùng riêng/tab, hiện trước/sau và lý do với quyền phù hợp. Nội dung note không bị sao lại vào timeline public. Mã/tên tài sản là link khi được phép, không lộ lịch sử cấp phát khác qua tooltip.

### Banner và action theo trạng thái

| Trạng thái | Requester | IT |
|---|---|---|
| New | Theo dõi, comment, hủy | T tiếp nhận; tự nhận nếu chưa giao; M/A phân công |
| Open | Theo dõi, comment | Assignee bắt đầu; M/A phân công |
| In Progress | Comment | Assignee/M/A chờ phản hồi hoặc đề xuất giải quyết |
| Pending | Banner câu hỏi + Trả lời | Assignee/M/A tiếp tục có lý do; không resolve trực tiếp |
| Resolved | Banner giải pháp + Xác nhận đóng / Yêu cầu xử lý lại | Chờ requester; M/A có thể reopen có lý do |
| Closed | Chỉ đọc, hướng dẫn liên hệ IT nếu cần | M/A mở lại có lý do |
| Cancelled | Chỉ đọc và lý do | Chỉ đọc |

## 7. Dialog nghiệp vụ — SCR23/24/25

| Dialog/action | Nội dung | Chặn/lưu ý |
|---|---|---|
| Tự nhận | Người nhận là mình, tên nhóm | Ticket đã giao/mất membership/version cũ |
| Phân công/chuyển nhóm | Nhóm, assignee, lý do khi chuyển, tóm tắt hiện tại→mới | In Progress/Pending cần người thay; người ngoài nhóm bị chặn |
| Tiếp nhận/Bắt đầu | Tác động trạng thái rõ, không hỏi nội dung thừa | Bắt đầu cần assignee; New không đi thẳng xử lý |
| Chờ phản hồi | Câu hỏi public, audience, tệp tùy chọn | Bắt buộc nội dung; nhắc resolution tạm dừng |
| Tiếp tục xử lý | Lý do tiếp tục | Không giả requester đã trả lời |
| Đề xuất giải quyết | Giải pháp, kết quả, hướng kiểm tra; public preview | Không thiếu nội dung; giải quyết chưa đóng |
| Xác nhận đóng | Tóm tắt giải pháp | Chỉ requester của ticket |
| Mở lại | Lý do bắt buộc, assignee hiện tại, SLA đã dùng | Closed chỉ M/A; D-12 nếu assignee không còn hợp lệ |
| Hủy | Trạng thái đích, lý do theo actor | Đỏ ở primary hủy; không mô tả như xóa |
| Đổi ưu tiên | Hiện tại, đề xuất, mức mới, ngân sách và thời gian đã dùng, lý do | Lịch sử breach còn; không “reset SLA” |

Dialog có title, mô tả, label, Cancel và primary cụ thể, không nút “OK” chung. Escape đóng nếu chưa gửi; click ngoài không làm mất nội dung đã thay đổi mà không xác nhận. Đang gửi ngăn bấm lặp; lỗi không đóng dialog.

## 8. Tài sản — SCR30/31/32/33

**Danh sách:** mã/tên thiết bị, serial, loại, hãng/model, status, người dùng/department, bảo hành. CTA “Thêm tài sản” chỉ M/A. Góc nhìn của tôi không có filter duyệt tất cả user.

**Form:** mã bắt buộc, serial tùy chọn, loại, hãng/model, ngày mua/bảo hành và ghi chú. User hiện tại/status không tùy ý mass edit; asset mới bắt đầu Trong kho. **Chi tiết:** hồ sơ + người dùng hiện tại, các tab Lịch sử bàn giao và Ticket liên quan theo quyền. Requester thấy bản rút gọn; không thấy người giữ trước hoặc ticket người khác.

**Cấp phát:** user hoạt động, department hiển thị, ngày giao, ghi chú, tóm tắt asset. **Thu hồi:** ngày, ghi chú và trạng thái sau thu hồi. **Trạng thái:** lý do và cảnh báo assignment đang hiệu lực. Lịch sử không sửa/xóa; không có nút cấp phát thiết bị đang sửa/ngừng sử dụng.

## 9. Báo cáo và thông báo — SCR40/50

Báo cáo có ba tab Ticket, SLA, Tải công việc. Filter kỳ có ngày bắt đầu/kết thúc, nhóm và priority phù hợp; chỉ số theo [metrics catalog](requirements/metrics-catalog.md). Phần tải hiện tại gắn nhãn riêng, không giả như snapshot ngày quá khứ. Biểu đồ có bảng dữ liệu hoặc list tương đương để đọc bằng screen reader. Không có nút xuất.

Thông báo có Tất cả/Chưa đọc, thời gian và loại; chọn mở kiểm tra lại quyền và đánh dấu readAt. Có “Đánh dấu tất cả đã đọc” trong phạm vi user hiện tại. Trống nói “Bạn chưa có thông báo”; lỗi không nói “Không có thông báo”. Badge không tiết lộ nội dung; nội bộ sau thu hồi quyền dùng thông điệp chung.

## 10. Quản trị — SCR60–65

| Màn hình | Thành phần và hành động | Phòng ngừa lỗi |
|---|---|---|
| Người dùng | Search, filter role/department/active; thêm, sửa, khóa/mở khóa | Không delete; hiển thị tác động phiên và ticket trước khóa; không khóa Admin cuối |
| Phòng ban | Mã/tên/status, tạo/sửa/ngừng dùng | Có tham chiếu thì giữ lịch sử; không xóa |
| Nhóm IT | Danh sách, form nhóm, cờ tiếp nhận; panel thành viên | Không bỏ người mà bỏ quên ticket đang xử lý; membership đổi quyền ngay |
| Danh mục | Tạo/sửa/ngừng sử dụng | Danh mục cũ vẫn đọc trên ticket |
| SLA | Bảng P1–P4, input thời lượng + đơn vị, version, người sửa, lịch sử | Banner “Chỉ áp dụng ticket tạo mới”; preview trước lưu; giá trị dương |
| Nhật ký | Filter actor/action/entity/date; detail cũ/mới có lọc | M chỉ ticket/asset; A thêm user/SLA; không trưng password/token |

## 11. Responsive và kiểm chứng

Desktop ưu tiên bảng. Tablet sidebar thu gọn có nhãn khi mở, panel chi tiết xếp dưới hội thoại; mobile navigation thành drawer, form1 cột, CTA chính vùng44 px, chi tiết có tabs/nút cuộn tới SLA. Sticky composer/footer phải chừa khoảng không che focus hoặc input khi bàn phím ảo bật. Bản vẽ mobile thể hiện ưu tiên nội dung, không cam kết mọi page đã được vẽ ở mọi breakpoint.

Các tiêu chí bàn phím, tương phản, trạng thái, lỗi và thông báo nằm ở design system/content contract; các test cần chạy với người thật nằm ở [validation plan](research/validation-plan.md).

## 12. Trợ lý AI tùy chọn — SCR-AI01/02/03

Trợ lý là page hoặc panel do người dùng chủ động mở. Giữ nguyên CTA xử lý, form, filter và composer hiện có. Khi AI lỗi, loading/lỗi chỉ nằm trong vùng AI; người dùng vẫn dùng các hành động nghiệp vụ theo quyền. Đóng panel trả focus về trigger; mobile có nút quay về ngữ cảnh trước.

Chat có nhãn AI, scope hiện tại, nguồn, thời điểm dữ liệu và đường dẫn nguồn đã kiểm tra. Nháp có dòng “Chưa tạo yêu cầu” hoặc “Chưa gửi bình luận”. Action chuyển nháp chỉ mở/điền form; người dùng đọc và gửi tại màn hình cũ. Không tự ghi đè nội dung đang soạn.

Public và internal là hai ngữ cảnh riêng. Nháp nội bộ không có nút đưa sang composer công khai. Không trình bày câu trả lời AI như phản hồi của kỹ thuật viên hoặc sự kiện SLA. SCR-AI03 chỉ hiện trạng thái cấu hình và bật/tắt với Admin; không đưa khóa provider vào ô chat.

Chi tiết, trạng thái lỗi, nguồn và dữ liệu: [Chatbot AI](10-ai-assistant.md). Bản vẽ: [chat](design/wireframes/11-ai-assistant.svg), [panel ticket](design/wireframes/12-ai-ticket-assistant.svg), [trạng thái](design/wireframes/13-ai-states.svg). Đây là phần bổ sung; 10 wireframe lõi giữ nguyên.
