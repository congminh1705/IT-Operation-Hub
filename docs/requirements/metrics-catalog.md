---
id: itoh-docs-requirements-metrics-catalog
title: "Danh mục chỉ số và quy ước đối chiếu"
type: reference
domain: domain
module: reporting
tags: [domain, reporting, reference]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Định nghĩa công thức chỉ số, tập dữ liệu, thời gian và scope drill-down."
---

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

## Chỉ số task, capacity và automation

Giữ MET01–15 cho ticket/assets; MET09 đếm ticket không thay phép tính capacity task theo phút. Các tập dưới đây chỉ dữ liệu đúng quyền IT; Requester không nhận tải/nhân lực/approval. Cùng filter/kỳ/timestamp và drill-down phải dùng cùng tập nguồn.

| ID | Chỉ số / định nghĩa | Nguồn và giới hạn |
|---|---|---|
| MET16 | Task chưa xong = count task thuộc effective plan version với status To Do/Ready/In Progress/Blocked; breakdown theo trạng thái | Task/PlanVersion hiện tại; không đếm Draft hoặc version Superseded, không suy từ số ticket |
| MET17 | Phút tải/capacity/free theo nhân sự/kỳ = allocated remaining / capacity sau trừ absence / hiệu số | WorkAllocation + calendar/capacity/absence theo BR-16; không cộng task chưa phân bổ vào zero, hiển thị số task/phút chưa phân bổ riêng |
| MET18 | Task rủi ro = tập phân biệt đang Blocked hoặc dueAt < t chưa Done/Cancelled hoặc predecessor khiến lịch không khả thi | Task/dependency/schedule; risk loại nào phải có lý do/timestamp, không cộng trùng các nhóm |
| MET19 | Phê duyệt chờ = count ApprovalRequest Pending còn hiệu lực; execution failure/conflict là tập riêng | ApprovalRequest/Decision/Action; Approved chưa phải succeeded, expired/superseded không trong queue pending |
| MET20 | Hành động automation theo outcome = count distinct committed action intent theo executedAt trong kỳ; succeeded/failed/conflict tách | Action/result; proposed/draft/request model không tính là nghiệp vụ đã thực thi; retry cùng intent không nhân đôi |
| MET21 | Thời gian tiếp nhận→giao plan = firstSuccessfulAssignmentAt − confirmedTicketCreatedAt cho plan đủ task được giao; kèm n và median/p95 khi đủ mẫu | Ticket/event/action timestamps; chưa giao là pending/censored, không giả 0; không có mẫu hiển thị “—” |
| MET22 | Usage/chi phí/latency theo run và tổng kỳ = provider usage/actual cost có giá/version nguồn, reserved/unknown riêng; thời gian wall-clock run riêng model latency | AIUsage/BudgetLedger/Run; không usage thì “Chưa xác định”, không giả 0 USD; cached/reasoning token chỉ tách khi provider trả |

### Điều kiện đo và đối chiếu sau triển khai

So sánh cùng bộ tình huống/quy trình thủ công và automation: số thao tác điều phối thủ công, tỷ lệ phương án giữ nguyên (plan áp dụng không bị sửa / plan đã áp dụng trong cohort), tỷ lệ cần can thiệp (run cần quyết định/sửa / run điều phối trong cohort), thời gian tiếp nhận→giao và chi phí/run. Cohort, thời gian quan sát và cách nhận diện thao tác thủ công phải ghi trong báo cáo đo; hiện chưa chốt ngưỡng và chưa có kết quả, không tuyên bố phần trăm cải thiện.

Task Done không làm MET01 ticket giảm nếu chưa qua Resolved/Closed/Cancelled. Nhắc việc/AI chat không first response. Dữ liệu demo tách khỏi báo cáo vận hành.
