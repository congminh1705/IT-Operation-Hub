# Kế hoạch kiểm chứng nghiên cứu và thiết kế

**Chưa thực hiện.** Không có số người đã tham gia, tỷ lệ thành công thực tế hay lời trích dẫn phỏng vấn. Kế hoạch dưới đây chuẩn bị để kiểm chứng các giả thuyết H01–H06 sau khi review tài liệu.

## Câu hỏi và người tham gia đề xuất

Vòng discovery:2–3Requester ở các phòng ban khác nhau,2Technician thuộc nhóm khác nhau,1–2Manager và1Admin. Đây là mẫu định tính có chủ đích, không đại diện thống kê. Xin đồng ý trước ghi âm; dùng tình huống hư cấu, không yêu cầu gửi mật khẩu hoặc ticket có dữ liệu nhạy cảm.

| Vai trò | Câu hỏi mở, không dẫn dắt | Bằng chứng cần tìm |
|---|---|---|
| Requester | Kể lần gần nhất bạn cần IT hỗ trợ. Bạn gửi ở đâu, làm gì sau khi gửi? Khi nào bạn xem là đã xong? | Kênh thực tế, vòng hỏi lại, cách hiểu chờ/giải quyết/đóng |
| Technician | Bạn quyết định xử lý việc nào trước như thế nào? Khi cần hỏi đồng nghiệp bạn ghi ở đâu? Chuyển nhóm lần gần nhất ra sao? | Hàng đợi, thông tin tối thiểu, rủi ro công khai/nội bộ |
| Manager | Bạn phát hiện việc bỏ sót và quá hạn bằng cách nào? Dữ liệu nào đủ để chuyển người/nhóm? | Chỉ số ưu tiên, ý nghĩa “tồn” và cách nhìn tải |
| Admin | Khi nhân viên nghỉ hoặc đổi nhóm bạn xử lý phiên, ticket và tài sản ra sao? Ai sửa SLA? | Quy trình cấp/thu hồi quyền, assignee không còn hợp lệ, bàn giao password |

Quan sát tác vụ thật nếu được phép; không coi câu trả lời mong muốn là hành vi đã xảy ra. Sau mỗi buổi ghi: dữ kiện quan sát, câu nói được đồng ý trích, suy luận của nhóm, giả thuyết và mức tự tin riêng.

## Tree test và kiểm tra thuật ngữ

Trước usability test, cho người tham gia tìm nơi: gửi lỗi mạng; trả lời câu hỏi IT; xác nhận giải quyết; xem thiết bị được cấp; tìm việc nhóm chưa giao; đổi thành viên nhóm; xem SLA mặc định. Đo first choice, đường đi, thời gian và cách họ gọi các mục. Không gợi ý “hãy bấm menu Ticket”. So sánh “Yêu cầu của tôi” và “Công việc IT” khi người IT cũng là requester.

## Usability test có điều phối

SVG tĩnh chỉ dùng walkthrough; không đo thời gian click/task success như prototype tương tác. Có thể tạo paper prototype bằng cách chuyển giữa bản vẽ; ghi rõ người điều phối mô phỏng. Khi có prototype/ứng dụng, chạy các tác vụ sau với dữ liệu giả.

| Task | Người tham gia và đề bài | Quan sát / tiêu chí thiết kế |
|---|---|---|
| UT01 | R: báo không truy cập được thư mục, ảnh hưởng một phòng ban | Tự chọn loại/category/impact/urgency; giải thích được priority đề xuất; không chọn assignee |
| UT02 | R: IT đã hỏi thêm ảnh lỗi, hãy phản hồi | Tìm Pending, hiểu câu hỏi, biết ticket tiếp tục sau gửi |
| UT03 | R: giải pháp chưa khắc phục, rồi trong lần khác đã ổn | Phân biệt mở lại có lý do với đóng; không vô tình đóng khi muốn trả lời |
| UT04 | T: nhận một ticket chưa giao, tìm bối cảnh asset | Hiểu phạm vi nhóm, không nhận thay user khác, tìm được lịch sử được phép |
| UT05 | T: gửi một câu cho requester, sau đó ghi nội dung chỉ IT đọc | Không gửi nhầm audience; hiểu note không tính first response |
| UT06 | M: tìm việc cần điều phối và chuyển nhóm | Hiểu KPI hiện tại khác filter kỳ; chọn assignee mới và lý do |
| UT07 | M: đổi P3→P1 trên ticket đã dùng3 giờ | Hiểu chỉ còn1 giờ resolution, không được thêm4 giờ; thấy lịch sử vi phạm |
| UT08 | M: cấp một laptop, thu hồi vào sửa chữa | Hiểu một assignment, không cấp tiếp khi sửa; tìm lịch sử |
| UT09 | A: sửa SLA, khóa user đang có ticket | Hiểu tác động ticket mới, revocation và chuyển giao |
| UT10 | Bàn phím/mobile: lọc ticket, mở dialog, gặp lỗi trường | Không kẹt focus, thấy lỗi/nhãn, giữ form, truy cập tác vụ chính |

Mục tiêu vòng đầu **đề xuất**, không là kết quả: ≥80% hoàn thành tác vụ cốt lõi không gợi ý trên mẫu thử; **0 trường hợp gửi nhầm nội bộ ra public hoặc hiểu sai quyền** trước chốt thiết kế. Ghi task success, lỗi nghiêm trọng, số lần cần trợ giúp, first click và mức dễ dùng tự đánh giá1–7. Thời gian chỉ dùng so sánh sau khi có môi trường tương tác phù hợp; không đặt số giây tùy ý với SVG.

## Review chuyên gia và chất lượng

Review heuristics theo [NN/g](https://www.nngroup.com/articles/ten-usability-heuristics/): thấy trạng thái, ngăn lỗi, nhất quán và phục hồi. Review accessibility theo checklist design system; conformance chỉ đánh giá trên UI thực thi. Review nghiệp vụ cùng chủ sở hữu quy trình cho máy trạng thái, first response, D-09 snapshot, D-12 reopen khi assignee mất quyền và công thức MET07/08.

Mức độ lỗi: **nghiêm trọng** = rò rỉ quyền, mất dữ liệu, gửi nhầm audience, trạng thái/SLA sai; **cao** = không hoàn thành tác vụ hoặc hiểu sai đóng/mở lại; **vừa** = cần trợ giúp; **thấp** = chậm hoặc khó đọc nhưng vẫn hoàn thành. Sửa lỗi nghiêm trọng/cao và test lại trước chốt thiết kế cho triển khai.

## Mẫu ghi kết quả

Mỗi finding có ID, ngày, task/role, dữ kiện quan sát, tác động, mức độ, screen/story liên quan, thay đổi đề xuất và kết quả test lại. Không điền kết quả giả. Cập nhật sổ quyết định và truy vết sau khi một giả định được xác nhận hoặc bác bỏ.
