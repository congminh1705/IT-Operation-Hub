# Ma trận quyền và phạm vi bản ghi

Quyền dưới đây là yêu cầu đối với **backend tương lai**. Việc ẩn menu hoặc nút chỉ hỗ trợ UX. Requester = R, Technician = T, IT Manager = M, Admin = A. Mỗi user có một vai trò; tất cả có thể gửi yêu cầu cá nhân qua góc nhìn Requester [D-01](../decisions/design-decisions.md).

## Phạm vi đọc

- **Của tôi:** `requester = người đăng nhập`. Không mở rộng theo cùng phòng ban.
- **Nhóm:** ticket có nhóm phụ trách hiện tại nằm trong các nhóm IT mà Technician đang là thành viên hoạt động. Không dựa trên ID người xử lý đơn lẻ.
- **Toàn bộ:** M/A trong một tổ chức.
- Technician xem ticket của chính mình ngoài nhóm chỉ có quyền Requester trên ticket đó, không được xem nội bộ bằng vai trò kỹ thuật viên chung.
- Quyền ghi nội dung nội bộ yêu cầu quyền IT trên chính ticket; nhân viên không nhận cả số lượng, metadata tệp, trích đoạn hay event nội bộ.

## Ticket

| Thao tác | R | T | M | A |
|---|---|---|---|---|
| Tạo ticket cho bản thân | Có | Có | Có | Có |
| Xem, tìm, lọc, đếm | Của tôi | Nhóm + của tôi theo góc nhìn | Toàn bộ | Toàn bộ |
| Xem timeline công khai | Của tôi | Nhóm/của tôi | Toàn bộ | Toàn bộ |
| Bình luận công khai | Của tôi, chưa kết thúc | Nhóm, chưa kết thúc; hoặc quyền R | Có | Có |
| Xem/ghi ghi chú nội bộ | Không | Nhóm | Có | Có |
| Xem tệp | Theo ticket và visibility của nội dung cha | Theo ticket và visibility | Có | Có |
| Tự nhận ticket chưa giao | Không | Trong nhóm; user hoạt động | Có nếu là thành viên hợp lệ của nhóm | Như M |
| Giao cho người khác/chuyển nhóm | Không | Không | Có | Có |
| New → Open | Không | Trong nhóm | Có | Có |
| Open → In Progress | Không | Là người phụ trách hợp lệ | Có, cần assignee hợp lệ | Có, cần assignee hợp lệ |
| In Progress → Pending/Resolved; Pending → In Progress | Không | Là người phụ trách hợp lệ | Có | Có |
| Resolved → Closed | Người yêu cầu của ticket | Chỉ khi là người yêu cầu | Chỉ khi là người yêu cầu | Chỉ khi là người yêu cầu |
| Resolved → In Progress | Người yêu cầu, có lý do | Chỉ khi là người yêu cầu | Có lý do | Có lý do |
| Closed → In Progress | Không | Không | Có lý do | Có lý do |
| Hủy New | Người yêu cầu | Người yêu cầu hoặc M/A | Có lý do | Có lý do |
| Hủy Open/In Progress/Pending | Không | Không | Có lý do | Có lý do |
| Hủy Resolved/Closed/Cancelled | Không | Không | Không | Không |
| Đổi ưu tiên | Không | Không; có thể đề nghị trong ghi chú | Có lý do | Có lý do |
| Sửa/xóa nội dung đã gửi, xóa ticket | Không | Không | Không | Không |

“Có” với bình luận của M/A vẫn bị chặn trên Closed/Cancelled. Resolved cho phép trao đổi công khai; trao đổi không tự mở lại. Pending chỉ tự trở về In Progress khi **người yêu cầu** gửi nội dung công khai, không phải bất kỳ người nào bình luận.

## Tài sản, dữ liệu quản trị và thông báo

| Thao tác | R | T | M | A |
|---|---|---|---|---|
| Danh sách tài sản được cấp | Của mình | Của mình | Có | Có |
| Xem hồ sơ phục vụ xử lý | Bản rút gọn tài sản của mình | Tài sản liên quan ticket nhóm và tài sản của mình | Toàn bộ | Toàn bộ |
| Xem ticket liên quan tài sản | Chỉ ticket của mình | Chỉ ticket được phép đọc | Toàn bộ | Toàn bộ |
| Tạo/sửa, cấp phát, thu hồi, đổi trạng thái | Không | Không | Có | Có |
| Gắn tài sản lúc tạo ticket | Tài sản đang được cấp cho mình | Như R khi tạo yêu cầu cá nhân | Bất kỳ tài sản hợp lệ | Bất kỳ tài sản hợp lệ |
| Dashboard | Cá nhân | Cá nhân/nhóm | Tổ chức | Tổ chức |
| Báo cáo toàn tổ chức | Không | Không | Có | Có |
| User/role/phòng ban/nhóm/thành viên/danh mục/SLA | Không | Chỉ đọc lookup cần thiết | Chỉ đọc lookup cần thiết | Quản lý |
| Nhật ký kiểm tra toàn cục | Không | Không | Nghiệp vụ ticket/tài sản | Toàn bộ gồm quyền user và SLA |
| Thông báo và đánh dấu đã đọc | Chỉ của mình | Chỉ của mình | Chỉ của mình | Chỉ của mình |
| Hồ sơ/mật khẩu | Của mình | Của mình | Của mình | Của mình |

Không có endpoint hoặc menu liệt kê tất cả nhân viên cho Requester; form chỉ đọc dữ liệu tham chiếu tối thiểu. Technician không được duyệt lịch sử cấp phát của tài sản không liên quan chỉ bằng cách thay ID.

## Thay đổi quyền giữa phiên

Chuyển nhóm ticket làm Technician nhóm cũ mất quyền ngay ở request tiếp theo; nhóm mới được đọc lịch sử nội bộ phục vụ xử lý. Nội dung nhạy cảm trong thông báo cũ không được giữ ở preview; mở link luôn kiểm tra lại quyền. Nếu quyền bị thu hồi khi đang soạn, giữ bản nhập trong bộ nhớ ở màn hình lỗi nhưng không hiển thị thêm dữ liệu server; cho sao chép nội dung do chính người dùng soạn.

Loại thành viên, khóa user hoặc đổi role làm mất quyền thu hồi quyền ngay; không xóa lịch sử. Không cho giữ assignee đang hoạt động ngoài nhóm hoặc không còn vai trò IT: Admin cần chuyển giao hoặc bỏ assignee các ticket đang mở bằng một thao tác nhất quán; In Progress/Pending phải có người thay hợp lệ. Ticket Resolved/Closed giữ lịch sử assignee; nếu người đó không còn hợp lệ thì M/A phân công lại trước khi mở lại [D-12](../decisions/design-decisions.md).

## Quy ước phản hồi để thiết kế UX

Chưa đăng nhập/hết phiên → đăng nhập lại. Trang chức năng cấm theo vai trò → trang 403. ID bản ghi/tệp không tồn tại hoặc ngoài phạm vi đọc → cùng một trang 404 “Không tìm thấy hoặc bạn không có quyền truy cập”. Không tiết lộ tên ticket/người tạo qua thông báo lỗi. Đây là hợp đồng hành vi, chưa phải API được triển khai.
