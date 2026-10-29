# Danh mục chỉ số và quy ước đối chiếu

Mục tiêu là các màn hình dùng chung công thức, không tự diễn giải lại. Tất cả áp dụng [phạm vi quyền](permissions-matrix.md) **trước khi đếm**. Số liệu trong SVG không phải kết quả chạy các công thức này.

## Quy ước thời gian và tập dữ liệu

- `S`: ticket người xem được phép đọc. Manager/Admin có S toàn tổ chức.
- `C = [from, to)`: khoảng ngày theo Asia/Ho_Chi_Minh, đầu ngày bắt đầu đến đầu ngày sau ngày kết thúc, đổi sang UTC.
- `t`: thời điểm truy vấn. Hiển thị “Cập nhật lúc …”; không giả vờ cập nhật thời gian thực.
- `A(t)`: ticket hiện tại trong New/Open/In Progress/Pending.
- KPI “hàng đợi hiện tại” dùng A(t) trên **mọi ngày tạo** để không che ticket cũ; ghi nhãn “Hiện tại · mọi ngày tạo”. Bộ lọc ngày chỉ tác động biểu đồ/báo cáo kỳ, được ghi rõ trên màn hình [D-13].
- Bộ lọc nhóm/assignee áp dụng thuộc tính hiện tại cho KPI hàng đợi; biểu đồ nhóm/trạng thái theo cohort cũng dùng thuộc tính hiện tại, không tuyên bố là ảnh chụp lịch sử.

## Định nghĩa

| ID | Chỉ số | Công thức và tập | Hiển thị/đi sâu |
|---|---|---|---|
| MET01 | Ticket chưa xử lý xong | `count(S ∩ A(t))` | Kể cả Pending, không gồm Resolved/Closed/Cancelled; mở danh sách đúng tập |
| MET02 | Chưa phân công | MET01 có `assignee = null` | Có thể đồng thời nằm trong MET03/MET04 |
| MET03 | Sắp vi phạm SLA hiện tại | Ticket trong MET01 có ít nhất một đồng hồ đang theo dõi, chưa hoàn thành, 80%≤đã dùng/ngân sách<100% và không có đồng hồ hiện tại quá hạn | Đếm ticket phân biệt, không cộng hai đồng hồ |
| MET04 | Đã vi phạm SLA hiện tại | Ticket trong MET01 có ít nhất một đồng hồ chưa hoàn thành đã dùng≥ngân sách, kể cả giải quyết đang Pending nhưng đã quá hạn trước lúc pause | Ưu tiên nhãn Đã quá hạn; lịch sử vi phạm riêng |
| MET05 | Theo trạng thái/ưu tiên/nhóm | Nhóm các ticket S có `createdAt ∈ C` theo giá trị hiện tại | Tổng nhóm bằng số ticket trong cohort; “Chưa có nhóm” nếu dữ liệu cũ thiếu |
| MET06 | Tạo mới theo ngày | `count(S có createdAt trong từng ngày ∩ C)` | Ngày không có ticket =0 |
| MET07 | Giải quyết theo ngày | Mỗi ticket có lần chuyển sang Resolved **gần nhất tính đến t** trong C được đếm một lần, kể cả sau đó mở lại | Nhãn “Ticket có lần giải quyết gần nhất trong kỳ”; không phải số sự kiện giải quyết |
| MET08 | Thời gian giải quyết hoạt động trung bình | Trong tập MET07: tổng thời gian hoạt động đến lần Resolved gần nhất / số ticket trong tập | Không cộng thời gian sau khi mở lại; hiển thị cỡ mẫu n; không có mẫu dùng “—” |
| MET09 | Tải theo kỹ thuật viên | Nhóm MET01 theo assignee hiện tại; hiển thị tổng, In Progress, Pending, quá hạn hiện tại | Chưa giao tách riêng; không suy ra năng suất chỉ từ số ticket |
| MET10 | Tài sản sắp hết bảo hành | Tài sản được phép đọc chưa Ngừng sử dụng có ngày hết bảo hành từ hôm nay đến hết ngày thứ 30 | Tài sản không có ngày tách “Chưa có dữ liệu”; đã hết hạn tách riêng |
| MET11 | Yêu cầu cần tôi phản hồi | Ticket của requester hiện Pending hoặc Resolved | Pending: trả lời; Resolved: xác nhận hoặc mở lại |
| MET12 | Tài sản đang được cấp cho tôi | Assignment chưa có ngày kết thúc, user hiện tại | Thiết bị sửa chữa nhưng còn assignment vẫn thuộc tập |
| MET13 | Việc được giao cho tôi | MET01 có assignee là user hiện tại, còn quyền nhóm | Không tính ticket chỉ do người đó tạo |
| MET14 | Ticket nhóm chưa phân công | MET02 thuộc nhóm Technician hoạt động | Hợp của các nhóm, không đếm trùng |
| MET15 | Có lịch sử vi phạm | S có `createdAt ∈ C` và ít nhất một sự kiện vi phạm đã lưu | Tách khỏi MET04; tăng ngân sách không xóa lịch sử |

MVP không bổ sung tỷ lệ “SLA compliance”, phần trăm tăng/giảm hoặc CSAT khi chưa có công thức và dữ liệu được duyệt. Không lấy trung bình của trung bình theo ngày để tính MET08.

## Ví dụ đối chiếu hư cấu

Ngày 30/10, ticket A đang Open, chưa giao người, giải quyết dùng 90%, phản hồi đã hoàn thành: MET01+1, MET02+1, MET03+1. Ticket B Pending với giải quyết dùng 105%: MET01+1, MET04+1; pause không làm vi phạm biến mất. Ticket C Resolved từng vi phạm: không vào MET01–04, có thể vào MET15.

Ticket D hoạt động 2 giờ, Pending 3 giờ, hoạt động 1 giờ rồi Resolved: thời gian lần đó =3 giờ, không phải 6. Mở lại thêm 30 phút và Resolved lần nữa: lần gần nhất =3,5 giờ. MET07 chỉ đếm D tại ngày của lần gần nhất; dữ liệu các kỳ có thể thay đổi sau lần giải quyết mới. Tooltip nêu quy ước này; báo cáo đóng sổ lịch sử nằm ngoài MVP.

## Hành vi filter và drill-down

KPI mang filter suy ra của chính nó khi mở danh sách; URL giữ scope, trạng thái, nhóm, assignee, loại SLA. Với chỉ số theo cohort, truyền cùng khoảng ngày tạo. Với MET07/08, danh sách drill-down phải lọc theo thời điểm giải quyết gần nhất, không đổi thành ngày tạo. Count trong link, bảng và báo cáo phải khớp tại cùng thời điểm tham chiếu; sau mutation có thể đổi và phải tải lại.
