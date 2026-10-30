# Tiêu chí nghiệm thu thiết kế và kịch bản nghiệp vụ

**Tất cả AC/TC ở trạng thái PLANNED, chưa chạy trên ứng dụng.** Mỗi AC cùng số với story tương ứng. Các mệnh đề Given–When–Then định nghĩa kết quả quan sát được; chúng chưa phải test code. Một story chỉ được nghiệm thu sau khi thỏa AC riêng và AC xuyên suốt có liên quan.

## Story acceptance criteria

| AC | Given — Bối cảnh | When — Hành động | Then — Kết quả cần thấy |
|---|---|---|---|
| AC01 | User hoạt động có thông tin đúng | Gửi đăng nhập | Có phiên server, vào đúng dashboard. Sai mật khẩu/user bị khóa có thông báo chung, không tiết lộ tài khoản tồn tại |
| AC02 | Có phiên hợp lệ | Đăng xuất rồi dùng lại phiên đó | Phiên bị từ chối; dữ liệu riêng tư trên client được xóa; không chỉ chuyển trang |
| AC03 | Đăng nhập | Sửa hồ sơ và thử truyền role/userId khác | Chỉ trường cá nhân được phép đổi; role/ID không được mass assign; lỗi giữ form |
| AC04 | Mật khẩu hiện tại đúng | Đổi password hợp lệ | Đăng nhập lại bằng password mới; password cũ không dùng được, phiên khác thu hồi. Sai password hiện tại không đổi dữ liệu |
| AC05 | Admin và phòng ban hoạt động; ticket đề nghị cấp của trưởng phòng đã được xác minh theo D-29, hoặc bước thiết lập có ủy quyền | Tạo một user | Mặc định Requester; email duy nhất, role hợp lệ. Vai trò IT có phê duyệt đúng thẩm quyền. Password không trả lại/audit/ticket; không tự gửi email khi chưa cấu hình. R/T/M gọi API tạo user trực tiếp bị từ chối; gửi ticket không tự tạo user |
| AC06 | User đã có lịch sử | Admin đổi role/phòng ban | Giữ lịch sử, quyền mới có hiệu lực, audit cũ/mới; xử lý assignment bị mất điều kiện IT. Không làm mất Admin hoạt động cuối cùng |
| AC07 | User có nhiều phiên | Admin khóa rồi user gọi API bằng phiên cũ | Tất cả phiên bị từ chối; unlock không hồi sinh phiên; history không mất. Xử lý assignment mở trước khi hoàn tất khóa |
| AC08 | Phòng ban được user tham chiếu | Admin ngừng sử dụng | Không xuất hiện cho lựa chọn mới, lịch sử vẫn đọc; không xóa bản ghi có tham chiếu |
| AC09 | Nhóm tiếp nhận đang hoạt động | Admin đổi nhóm tiếp nhận/ngừng nhóm | Có đúng một nhóm tiếp nhận hợp lệ; không làm ticket mất nhóm; không dừng nhóm còn ticket mở khi chưa chuyển giao |
| AC10 | T là thành viên nhóm có ticket | Admin bỏ membership | Scope thu hồi ngay ở request sau; xử lý ticket đang giao; user còn trong nhóm khác chỉ giữ quyền nhóm đó |
| AC11 | Category đang có ticket | Admin ngừng category | Ticket cũ giữ nhãn; form mới không chọn được; tên/mã không trùng theo quy định |
| AC12 | Có ticket dùng snapshot cũ | Admin lưu bảng SLA mới | Version mới có audit; ticket cũ không đổi ngân sách; ticket mới lấy version mới; ngân sách≤0 bị từ chối |
| AC13 | User có asset của mình và cấu hình đủ | Gửi ticket hợp lệ | New, mã duy nhất, requester từ phiên, priority từ ma trận, snapshot, event. Asset người khác/priority tùy ý bị từ chối. Đề nghị cấp tài khoản D-29 chỉ tạo ticket; chưa tạo user, requester vẫn là trưởng phòng gửi đề nghị |
| AC14 | Có ticket nhiều scope | Search, kết hợp filter, sort và đổi trang | Chỉ trả tập được phép; count khớp; sort ổn định; đổi filter về trang1; back giữ query; không rò rỉ qua tổng số |
| AC15 | Requester A và ticket của B có note | A đổi ID URL/API | Không đọc được ticket B. A đọc ticket mình không nhận note, tệp note hay metadata nội bộ |
| AC16 | M/A mở dialog phân công | Đổi nhóm/người xử lý kèm lý do | Assignee thuộc nhóm mới, event cũ/mới, thông báo; SLA không reset; In Progress/Pending không được bỏ người phụ trách |
| AC17 | Hai T cùng nhóm, ticket chưa giao | Cùng tự nhận cùng version | Một người thành công; người kia nhận conflict và biết dữ liệu đã thay đổi; không nhận thay người khác |
| AC18 | Ticket New trong nhóm T | T tiếp nhận | Open + event, firstResponseAt còn trống nếu chưa có public comment |
| AC19 | Ticket Open | Bắt đầu khi có/không có assignee | Chỉ thành công khi assignee hợp lệ và actor được phép; New→In Progress bị chặn |
| AC20 | Ticket Pending của requester | Requester gửi public comment có nội dung | Lưu comment + In Progress + resume cùng kết quả; IT comment đầu hợp lệ ghi firstResponseAt, note/tệp rỗng không tính |
| AC21 | T có quyền ticket và requester cùng xem | T gửi note, requester gọi API comment/attachment | T thấy note; requester không thấy nội dung/metadata; không ghi first response; không gửi note notification cho requester |
| AC22 | Form có tệp | Gửi≤5 tệp mỗi tệp≤10.000.000 byte đúng loại | Chấp nhận sau server validation. Tệp thứ6, quá1 byte, giả MIME/extension hoặc SVG bị từ chối; giữ nội dung để sửa |
| AC23 | Có tệp public và internal của ticket | Tải bằng requester, T nhóm khác, hoặc URL cũ sau chuyển nhóm | Chỉ tệp có nội dung cha được đọc mới tải; không truy cập qua thư mục public; tên tệp không cho path traversal |
| AC24 | In Progress có assignee | Chọn chờ với câu hỏi; rồi IT tiếp tục có lý do | Pending + public comment, resolution pause; resume tiếp thời gian đã dùng. Trống câu hỏi bị chặn; Pending→Resolved bị chặn |
| AC25 | In Progress | Gửi giải pháp hoặc thử gửi rỗng | Có nội dung: public comment + giải pháp + Resolved, resolution dừng; rỗng: giữ form/trạng thái; không đóng tự động |
| AC26 | Ticket Resolved của R | R xác nhận đóng, IT khác thử đóng | R thành công Closed; IT không phải requester bị từ chối; không xóa event/giải pháp |
| AC27 | Resolved còn assignee hợp lệ | Requester mở lại với lý do | In Progress, tiếp tục ngân sách còn lại; lý do và lịch sử giữ. Resolved public comment đơn thuần không tự reopen |
| AC28 | Closed | M/A mở lại có lý do, R/T thử gọi trực tiếp | Chỉ M/A thành công; tiếp tục thời gian, không reset breach. Assignee không hợp lệ cần phân công lại trước |
| AC29 | New/Open/Resolved và các actor | Chọn hủy | Requester chỉ New của mình; M/A chỉ New/Open/In Progress/Pending có lý do; Cancelled kết thúc, không xóa hoặc reopen |
| AC30 | Ticket P3 có thời gian đã dùng và breach history | M/A đổi ưu tiên kèm lý do | Ngân sách mới từ snapshot, không đổi tổng đã dùng; giữ vi phạm cũ. T/R hoặc thiếu lý do bị từ chối |
| AC31 | Timeline có public/internal events | Đọc và phân trang timeline | Đúng thứ tự thời gian có tie-breaker, actor/cũ/mới/lý do theo visibility; không lộ note dưới dạng event text |
| AC32 | Ticket chạy/pause/resolved/reopened | Xem hai đồng hồ tại mốc cố định | Theo BR-08–10; 80% = sắp hạn,100% = quá hạn; Pending chỉ pause resolution; không chạy countdown đã hoàn thành |
| AC33 | Ticket vượt ngưỡng, không ai mở UI | Worker chạy lại và hai instance cùng kiểm tra | Đúng người nhận, mỗi khóa cảnh báo chỉ một notification; lưu breach history, priority/reopen không xóa; first run sau100% không gửi warning lỗi thời |
| AC34 | Có notification hai user | Xem/đánh dấu và đổi ID người nhận | Chỉ sửa của mình; readAt không tạo trùng; link kiểm tra quyền hiện tại; preview nội bộ không lộ sau thu hồi quyền |
| AC35 | M/A nhập asset | Tạo/sửa metadata và thử sửa assignee trực tiếp | Mã/serial duy nhất theo BR-11, ngày hợp lệ; người dùng hiện tại đổi qua cấp phát/thu hồi, không mass assign |
| AC36 | Có nhiều tài sản | R/T tìm/lọc danh sách | R chỉ asset đang được cấp; T chỉ asset của mình/phục vụ ticket nhóm; lookup/count không tiết lộ asset khác |
| AC37 | Asset có nhiều assignment và ticket nhiều requester | Mở chi tiết | M/A thấy history; R xem bản rút gọn và ticket mình; T theo scope; không dùng asset để đi vòng đọc ticket cấm |
| AC38 | Asset Trong kho và user hoạt động | Hai M/A cấp đồng thời | Chỉ một assignment hiệu lực; Đang sử dụng cùng kết quả; sửa chữa/ngừng sử dụng không cấp được |
| AC39 | Có assignment hiệu lực | Thu hồi vào kho hoặc sửa chữa | Kết thúc assignment, lưu actor/ngày, trạng thái đúng; không xóa lịch sử; thu hồi lần2 không tạo thêm |
| AC40 | Asset có/không có assignment | Đổi trạng thái có lý do | BR-11 được giữ; không ngừng sử dụng khi chưa thu hồi; sửa chữa không cấp phát mới; event/audit có cũ/mới |
| AC41 | Requester có ticket Pending/Resolved và asset | Mở tổng quan cá nhân | MET11/12 và yêu cầu của tôi đúng phạm vi; CTA trả lời/xác nhận đúng trạng thái; không thấy KPI toàn công ty |
| AC42 | T thuộc hai nhóm | Mở dashboard công việc | MET13/14 và SLA nhóm là hợp không trùng; ticket nhóm khác không nằm trong số liệu |
| AC43 | M/A có ticket cũ và kỳ ngày mới | Xem dashboard/lọc kỳ | KPI hàng đợi vẫn gồm ticket cũ, nhãn rõ; chart cohort theo C; MET01–05 drill-down đúng tập, không cộng các KPI chồng lấn |
| AC44 | Ticket nhiều lần resolve/reopen, có Pending | Xem trend/average theo kỳ | MET06–08, mỗi ticket tại resolve gần nhất, dùng active duration; n=0 hiển thị“—”; số có thể đối chiếu nguồn |
| AC45 | Ticket In Progress/Pending/chưa giao | Xem tải hiện tại | MET09 theo assignee; chưa giao riêng; không coi số ticket là điểm hiệu suất; tổng khớp nguồn |
| AC46 | Asset có ngày bảo hành trong/ngoài30 ngày, trống | Mở module bảo hành | MET10 đúng biên ngày địa phương; trống không tính như sắp hết; asset ngừng sử dụng bị loại |
| AC47 | Audit user/SLA/ticket/asset | M hoặc A đọc nhật ký | M chỉ ticket/asset; A toàn bộ; đủ actor/thời điểm/cũ/mới; không password/token/file content |

## Tiêu chí xuyên suốt

| ID | Given–When–Then rút gọn |
|---|---|
| AC-X01 | Với mọi endpoint dự kiến, khi giả role/userId/teamId/ticketId/assetId thì quyền được suy từ phiên và quan hệ server, không từ request body |
| AC-X02 | Khi API trả field error hoặc conflict, form giữ giá trị; focus tới lỗi hoặc thông báo xung đột, không tự ghi đè |
| AC-X03 | Khi mạng lỗi/5xx, không thay bảng bằng0 hay thông báo thành công; cho thử lại có kiểm soát, không nhân đôi mutation |
| AC-X04 | Khi dùng bàn phím, truy cập được nav, filter, table link, tab, dialog; focus rõ, trap đúng trong modal và trở lại trigger |
| AC-X05 | Khi xem ở320/390/768/1440 px và zoom200%, không mất tác vụ chính; nhãn status/priority/SLA có chữ; không chỉ màu |
| AC-X06 | Khi hết phiên, che dữ liệu bảo vệ và chuyển đăng nhập; chỉ giữ bản nhập chưa gửi trong bộ nhớ phiên trang nếu phù hợp, không localStorage/token URL |
| AC-X07 | Khi đổi ngày/kỳ, biên ngày theo Asia/Ho_Chi_Minh được đổi sang UTC; lịch sử và SLA cùng một mốc thời gian nguồn |
| AC-X08 | Khi restart ứng dụng/DB ở môi trường test, dữ liệu ticket/comment/tệp/assignment vẫn tồn tại; demo đánh dấu riêng |
| AC-X09 | Khi cùng sửa version cũ, từ chối conflict; không có một phần trạng thái đổi nhưng event/assignment không được ghi |
| AC-X10 | Khi không có dữ liệu, filter không khớp hoặc tải lỗi, có ba trạng thái phân biệt; không bổ sung số liệu demo vào báo cáo thật |

## Bộ ví dụ SLA cần tự động hóa sau này

Tất cả mốc sau là UTC, thời lượng tính liên tục; TC chỉ là kế hoạch.

| ID | Dữ liệu/hành động | Kết quả mong đợi |
|---|---|---|
| TC-SLA01 | P2 tạo08:00; assign08:05, note08:10, public IT08:20 | First response20 phút; assign/note không kết thúc đồng hồ |
| TC-SLA02 | Tạo08:00; Pending09:00; requester trả lời11:00; Resolved12:00 | Active resolution2 giờ; Pending2 giờ không tính |
| TC-SLA03 | Theo TC02, Closed13:00; M mở lại15:00; Resolved16:00 | Active tổng3 giờ; khoảng12:00–15:00 không tính |
| TC-SLA04 | P3 đã dùng3 giờ; đổi P1 | Ngân sách resolution4 giờ, còn1 giờ; không reset đã dùng |
| TC-SLA05 | P1 đã dùng5 giờ, đã breach; đổi P3 | Còn19 giờ theo snapshot; lịch sử breach P1 vẫn còn |
| TC-SLA06 | P2 resolution đã dùng đúng6 giờ24 phút rồi8 giờ | 80% = sắp quá hạn,100% = quá hạn; dedup từng ngưỡng |
| TC-SLA07 | Chạy worker2 lần và2 instance tại cùng ngưỡng | Một thông báo/người nhận/khóa, không bốn |
| TC-SLA08 | Admin sửa policy P3 từ24h xuống12h | Ticket cũ giữ24h, ticket mới12h; đổi priority ticket cũ vẫn theo bảng snapshot cũ |
| TC-SLA09 | Reopen ticket đã dùng9/8 giờ | Vẫn quá hạn ngay, không cộng lại8 giờ và không gửi lại cùng cảnh báo đã có |
| TC-SLA10 | First response chưa có; engine có trạng thái Pending | First response vẫn dùng now-createdAt; resolution pause. Fixture này kiểm tra engine, dù UI Pending chuẩn luôn tạo câu hỏi công khai |
| TC-SLA11 | IT tự tạo và tự xử lý, chưa có public comment hợp lệ từ IT khác | Không giả firstResponseAt; kết thúc dừng giám sát, không đánh dấu đáp ứng. Mở lại vẫn tính phản hồi từ lúc tạo theo D-21 |
| TC-SLA12 | Đã phản hồi sau 20 phút ở P2; đổi P1 | So sánh 20/15 phút, giữ firstResponseAt; vi phạm mới do điều chỉnh ghi tại lúc đổi ưu tiên, không sửa lịch sử ngân sách trước đó |

Kiểm thử kỹ thuật và accessibility thực tế chỉ bắt đầu khi có ứng dụng. Kế hoạch đánh giá thiết kế với người dùng ở [validation plan](research/validation-plan.md).
