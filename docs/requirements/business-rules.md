# Quy tắc nghiệp vụ chuẩn

Tài liệu này là nguồn thống nhất cho use case, AC, thông tin màn hình và công thức chỉ số. Các chi tiết bổ sung so với đề bài có tham chiếu [quyết định đề xuất](../decisions/design-decisions.md).

## BR-01 — Danh tính và lịch sử

Một tổ chức, bốn vai trò. Admin tạo tài khoản; không đăng ký công khai. Email chuẩn hóa và duy nhất; tài khoản không xóa khi đã có lịch sử. Khóa tài khoản vô hiệu mọi phiên server; mở khóa không khôi phục phiên cũ. Đổi role/membership có hiệu lực ở request tiếp theo. Không lưu mật khẩu, token hoặc nội dung tệp trong audit. Quyền theo [ma trận](permissions-matrix.md).

## BR-02 — Định danh và dữ liệu ticket

Mã ticket tự sinh duy nhất, dạng `TKT-000123`; khoảng trống dãy mã chấp nhận được, không tái sử dụng. Người tạo là người yêu cầu trong MVP; không gửi thay người khác. Loại: sự cố cá nhân, yêu cầu dịch vụ. Nhóm mặc định là nhóm tiếp nhận hoạt động do Admin chọn; không để việc định tuyến tự động chưa có thực gây mất ticket [D-02].

Tiêu đề, mô tả, loại, danh mục, ảnh hưởng và khẩn cấp bắt buộc. Tài sản và tệp không bắt buộc. Giới hạn đề xuất: tiêu đề 5–180 ký tự, mô tả 10–10.000, bình luận/giải pháp/lý do tối đa 10.000; lý do cần ít nhất 10 ký tự có nghĩa sau trim. Chuỗi toàn khoảng trắng không hợp lệ. Form giữ nguyên dữ liệu khi lỗi.

## BR-03 — Ưu tiên

| Ảnh hưởng \ Khẩn cấp | Cao | Trung bình | Thấp |
|---|---|---|---|
| Cao — toàn tổ chức | P1 | P2 | P3 |
| Trung bình — nhóm/phòng ban | P2 | P3 | P3 |
| Thấp — một người | P3 | P3 | P4 |

Hệ thống tính ưu tiên từ hai đầu vào, không cho Requester truyền trực tiếp P1. IT xác minh; M/A điều chỉnh với lý do, lưu giá trị cũ/mới và đồng hồ đã dùng. Technician đề nghị điều chỉnh qua ghi chú nội bộ, không có quyền override. Không tự thay đổi ảnh hưởng/khẩn cấp ban đầu khi override ưu tiên.

## BR-04 — Máy trạng thái

| Từ | Đến | Ai và điều kiện bổ sung |
|---|---|---|
| New | Open | T trong nhóm hoặc M/A; tiếp nhận không tính phản hồi đầu |
| New | Cancelled | Người yêu cầu tự hủy; hoặc M/A có lý do |
| Open | In Progress | Assignee hợp lệ trong nhóm; T phải là assignee, M/A được thực hiện |
| Open | Cancelled | M/A có lý do |
| In Progress | Pending | Assignee hoặc M/A, bắt buộc câu hỏi/lý do công khai |
| In Progress | Resolved | Assignee hoặc M/A, bắt buộc giải pháp công khai |
| In Progress | Cancelled | M/A có lý do |
| Pending | In Progress | Người yêu cầu bình luận công khai có nội dung; hoặc assignee/M/A chủ động tiếp tục có lý do |
| Pending | Cancelled | M/A có lý do |
| Resolved | Closed | Chính người yêu cầu xác nhận |
| Resolved | In Progress | Người yêu cầu hoặc M/A, lý do mở lại, assignee hợp lệ |
| Closed | In Progress | Chỉ M/A, lý do mở lại, assignee hợp lệ |
| Cancelled | — | Kết thúc, không mở lại |

Không có đường chuyển khác. Phân công, bình luận, đính kèm và đổi ưu tiên không tự đổi trạng thái, trừ phản hồi của người yêu cầu lúc Pending. Không bắt đầu từ New đi thẳng In Progress. MVP không tự đóng và không xóa ticket. Requester hủy New có xác nhận; lý do hủy tự nguyện; M/A hủy luôn bắt buộc lý do.

![Sơ đồ XMind — 14-ticket-states](../xmind/previews/14-ticket-states.svg)

[Mở file XMind](../xmind/05-business-rules.xmind)

## BR-05 — Phân công và đồng thời

Assignee là user hoạt động có vai trò T/M/A và thành viên nhóm phụ trách. M/A được chuyển nhóm, phải ghi lý do khi chuyển; chọn assignee hợp lệ trong nhóm mới hoặc bỏ assignee. Nếu ticket In Progress/Pending thì phải chọn người thay hợp lệ, không được để trạng thái đang xử lý mà không có người chịu trách nhiệm. Chuyển nhóm không reset SLA.

T chỉ tự nhận ticket **chưa có assignee**, thuộc nhóm mình. Mọi mutation có kiểm tra phiên bản; hai người nhận cùng lúc chỉ một người thành công. Người còn lại thấy tên người đã nhận sau khi kiểm tra lại quyền và giữ nội dung đang nhập. Không ghi đè âm thầm; không tự retry thao tác thay đổi trạng thái.

## BR-06 — Hội thoại và visibility

Public comment cần nội dung sau trim, có thể kèm tệp. Ghi chú nội bộ là nội dung khác visibility; không đổi một note đã gửi thành public. Composer trở về public khi mở ticket; chuyển qua lại giữ hai bản nháp riêng trong bộ nhớ, không mang nội dung nội bộ sang public [D-05]. Không lưu nội dung nhạy cảm vào localStorage.

Câu hỏi lúc Pending và giải pháp lúc Resolved được ghi thành **public TicketComment thực sự** cùng giao dịch đổi trạng thái. Người dùng thấy trước nội dung sẽ gửi. Vì vậy chúng có thể là phản hồi đầu nếu thỏa BR-08; sự kiện đổi trạng thái đứng một mình không được tính. Resolved cho phép bình luận nhưng cần thao tác mở lại có lý do; Closed/Cancelled chỉ đọc.

## BR-07 — Tệp

MVP chấp nhận PNG, JPEG, WebP và PDF [D-06]; mỗi tệp ≤ **10.000.000 byte**, mỗi lần gửi ≤5 tệp. Giới hạn này áp dụng cả gửi ticket mới và bình luận/ghi chú. Không nhận SVG, GIF, tài liệu Office hoặc tệp thực thi. Kiểm tra extension, MIME và nội dung ở server; client chỉ hướng dẫn sớm.

Tệp kế thừa visibility từ ticket/public comment/internal note, không có lựa chọn quyền độc lập. Requester không nhận metadata hoặc tải được tệp note. Tải qua quyền hiện tại, không đường upload public. Chọn sai một tệp làm cả lần gửi chưa được commit; giữ văn bản và tệp hợp lệ để người dùng sửa. Khi ticket đã tạo mà upload bị gián đoạn, hệ thống tương lai phải tránh nhân đôi ticket; UX báo rõ ticket có được tạo hay chưa [D-07]. Không cam kết quét antivirus đã có.

## BR-08 — Phản hồi đầu tiên

Bắt đầu từ `createdAt`. Kết thúc khi nhân sự IT có quyền trên ticket gửi public comment có nội dung. Không tính phân công, New→Open, nội bộ, tệp không có nội dung hay bình luận của người yêu cầu. Nếu người yêu cầu cũng là IT, họ không được tự tạo phản hồi đầu cho chính ticket của mình [D-08]. Pending không tạm dừng đồng hồ này.

`firstResponseElapsed = firstResponseAt - createdAt`; khi chưa phản hồi dùng `now - createdAt`. Cancelled chấm dứt theo dõi đang chạy nhưng không tạo phản hồi giả; lịch sử vi phạm đã có được giữ lại. Giải pháp công khai là một comment nên có thể ghi phản hồi đầu trong cùng giao dịch giải quyết.

Trường hợp IT tự xử lý ticket mình tạo và chưa có phản hồi hợp lệ từ IT khác: tại Resolved/Closed/Cancelled, dừng **giám sát cảnh báo đang hoạt động**, hiển thị “Chưa có phản hồi IT hợp lệ”, không ghi timestamp giả hoặc kết quả “đúng hạn”. Nếu mở lại mà vẫn chưa phản hồi hợp lệ, thời gian phản hồi vẫn tính từ lúc tạo, không trừ khoảng đã kết thúc. Đây là quy ước đề xuất [D-21], cần kiểm chứng với chủ nghiệp vụ.

## BR-09 — Giải quyết và snapshot

Đếm tổng thời gian trong **New, Open, In Progress**. Pending, Resolved, Closed không tiêu thụ. Cancelled chấm dứt theo dõi. Mở lại tiếp tục phần ngân sách còn lại, không đặt về 0; ticket đã hết ngân sách vẫn quá hạn ngay khi mở lại. Phải lưu các khoảng chạy/dừng hoặc thông tin tương đương để đối chiếu, không tính đơn giản `resolvedAt-createdAt`.

| Ưu tiên | Phản hồi | Giải quyết |
|---|---|---|
| P1 | 15 phút | 4 giờ |
| P2 | 1 giờ | 8 giờ |
| P3 | 4 giờ | 24 giờ |
| P4 | 8 giờ | 72 giờ |

Snapshot trên ticket bao gồm bảng ngân sách P1–P4 và phiên bản chính sách tại lúc tạo. Đổi ưu tiên lấy ngân sách của mức mới **từ snapshot của ticket**, áp dụng trên thời gian đã dùng; lưu một lần điều chỉnh snapshot đang áp dụng [D-09]. Sửa chính sách mặc định chỉ tác động ticket tạo sau đó. Không xóa vi phạm cũ khi tăng ngân sách hoặc đổi mặc định.

Điều chỉnh cũng so sánh thời gian phản hồi đã tiêu thụ với ngân sách phản hồi mới; không sửa `firstResponseAt`. Nếu việc đổi ưu tiên khiến lần đầu vượt ngân sách, ghi nhận vi phạm do điều chỉnh tại thời điểm đổi, không giả rằng cam kết mới đã tồn tại trong quá khứ. Lịch sử ngân sách/kết quả trước điều chỉnh phải còn để giải thích số liệu.

## BR-10 — Nhãn SLA và cảnh báo

Hai chỉ số có nhãn riêng. Khi đang theo dõi: sử dụng <80% = Còn hạn; từ 80% đến dưới 100% = Sắp quá hạn; từ 100% = Đã quá hạn. Nếu đã dừng: ghi Đã phản hồi/Đã giải quyết và kết quả đúng hạn hoặc vi phạm, không tiếp tục countdown. Pending hiển thị Tạm dừng cho giải quyết kèm thời gian đã dùng; cảnh báo lịch sử vẫn nhìn thấy.

Worker tương lai kiểm tra nền định kỳ đề xuất ≤60 giây, không phụ thuộc mở trang. Cảnh báo tới assignee hiện tại và các IT Manager hoạt động; chưa có assignee thì gửi Manager; không có Manager hoạt động thì Admin [D-10]. Các sự kiện nghiệp vụ tạo/cập nhật và worker phải dùng cùng quy tắc.

Khóa chống trùng theo ticket + loại đồng hồ + ngưỡng 80/100 + phiên điều chỉnh ngân sách + người nhận. Chạy lại không tạo trùng. Mở lại/chuyển nhóm không tạo phiên ngân sách mới. Nếu lần kiểm tra đầu đã vượt 100%, chỉ gửi thông báo quá hạn, không gửi thêm cảnh báo 80% đã lỗi thời. Điều chỉnh ưu tiên có thể phát sinh cảnh báo theo ngân sách mới, nhưng không ghi lại cùng một vi phạm trong cùng phiên. Lịch sử lưu thời điểm thực sự vượt ngưỡng nếu suy ra được từ đồng hồ, cùng thời điểm worker phát hiện.

## BR-11 — Tài sản

Mã tài sản duy nhất; serial có thể trống, nhưng serial đã khai báo không trùng trong MVP [D-11]. Loại: laptop, máy tính, màn hình, máy in, thiết bị mạng. Ngày mua không sau ngày hết bảo hành nếu cả hai cùng có.

| Trạng thái | Cấp phát mới | Quy tắc |
|---|---|---|
| Trong kho | Có | Không có assignment hiệu lực |
| Đang sử dụng | Không | Phải có đúng một assignment hiệu lực |
| Đang sửa chữa | Không | Có thể giữ assignment để thể hiện trách nhiệm sử dụng; cần ghi rõ |
| Ngừng sử dụng | Không | Phải thu hồi assignment trước |

Cấp phát chỉ từ Trong kho cho user hoạt động; ghi người dùng, phòng ban lúc giao, thời điểm, người giao và ghi chú. Hai lượt giao đồng thời chỉ một thành công. Thu hồi kết thúc assignment, không xóa; chọn trạng thái Trong kho hoặc Đang sửa chữa. Không sửa tay user đang sử dụng trong form tài sản. Chuyển Đang sửa chữa→Đang sử dụng chỉ khi còn assignment; nếu không còn thì về Trong kho. M/A thay đổi trạng thái có lý do và lịch sử.

## BR-12 — Sự kiện, thông báo, audit

TicketEvent lưu thay đổi trạng thái, ưu tiên, nhóm và assignee cùng actor, thời điểm, cũ/mới, lý do. Event có visibility: hoạt động công khai không mang nội dung note hoặc lý do nội bộ. AssetAssignment/AuditLog ghi cấp phát, thu hồi, trạng thái. Audit quyền user/SLA chỉ Admin xem.

Thông báo phân công tới người được giao; public comment/status tới requester và assignee còn quyền, trừ chính actor; note chỉ tới assignee còn quyền, trừ actor. Không gửi nội dung nội bộ tới requester. Notification lưu người nhận, tham chiếu sự kiện và trạng thái đọc; hiển thị preview tối thiểu, kiểm tra quyền lại khi đọc. Không có email trong MVP.

## BR-13 — Thời gian và dữ liệu demo

Thời gian nghiệp vụ lưu UTC; mặc định hiển thị **Asia/Ho_Chi_Minh**, định dạng `dd/MM/yyyy HH:mm`. Khoảng lọc ngày được đổi thành biên UTC theo múi giờ hiển thị. SLA chạy 24/7, không bỏ tối/cuối tuần. Bản vẽ ghi “Dữ liệu minh họa”; seed demo và cờ demo chỉ là yêu cầu cho giai đoạn triển khai, hiện chưa tạo seed.
