# Chatbot AI hỗ trợ vận hành

> **Phạm vi cập nhật 30/10/2026 — D-33:** Trợ lý AI thuộc phạm vi và nghiệm thu MVP theo xác nhận mới nhất của chủ dự án. Có thể bật/tắt khi vận hành, nhưng không được bỏ qua triển khai hoặc nghiệm thu AI. Giữ nguyên quyền và luồng nghiệp vụ lõi; hiện mới có thiết kế, chưa có provider hoặc chức năng hoạt động. [Tech stack và đối chiếu](technical/tech-stack.md).

**Phiên bản:** 0.3 · **Trạng thái:** bổ sung thiết kế, chưa triển khai chatbot hoặc kết nối nhà cung cấp AI.

Chatbot được bổ sung vào phạm vi sản phẩm theo yêu cầu mới như một năng lực **thuộc MVP**, có thể bật/tắt khi vận hành. “Tùy chọn” chỉ nói về việc sử dụng và khả dụng, không cho phép bỏ qua triển khai/nghiệm thu AI. Phần ticket, SLA, tài sản, phân quyền và báo cáo tiếp tục vận hành bằng các quy tắc đã đặc tả. Không có bước bắt buộc phải qua AI.

## 1. Mục tiêu và nguyên tắc

Giúp người dùng tìm hướng dẫn, hiểu tiến độ và chuẩn bị nội dung hỗ trợ nhanh hơn. AI đọc thông tin qua cùng lớp nghiệp vụ và quyền của người đang đăng nhập; kết quả có nguồn và thời điểm dữ liệu. Khi thiếu nguồn, không có quyền hoặc dịch vụ lỗi, người dùng tiếp tục bằng các màn hình thông thường.

AI không là một vai trò mới, không thay nhân sự IT và không quyết định trạng thái nghiệp vụ. Phạm vi đầu tiên là **đọc → giải thích → soạn nháp → chuyển tới giao diện hiện có**. Chatbot không có công cụ ghi trực tiếp vào ticket, bình luận, tài sản, quyền user hoặc SLA.

## 2. Năng lực bổ sung

| ID | Năng lực | Giá trị và giới hạn |
|---|---|---|
| F-AI01 | Hỏi đáp hướng dẫn có nguồn | Chỉ tài liệu nội bộ đã được duyệt và phù hợp quyền; không tìm trên web tự do |
| F-AI02 | Tra cứu ticket/tài sản | Lấy dữ liệu mới qua dịch vụ đọc hiện có; không mở rộng phạm vi vì người dùng biết ID |
| F-AI03 | Soạn nháp yêu cầu | Thu thập các trường của SCR21; mở form để người dùng kiểm tra và bấm gửi |
| F-AI04 | Tóm tắt ticket | Tóm tắt theo visibility; bản công khai không nhận ghi chú hoặc tệp nội bộ |
| F-AI05 | Soạn nháp phản hồi | Đưa nội dung đã kiểm tra vào composer đúng audience; chưa tạo comment |
| F-AI06 | Hỏi báo cáo bằng ngôn ngữ tự nhiên | Chỉ M/A; ánh xạ truy vấn được phép và MET01–MET15, không tự viết SQL hoặc tự tính số liệu |
| F-AI07 | Phiên chat cá nhân | Chỉ chủ phiên truy cập; đọc lịch sử vẫn kiểm tra quyền với nguồn đang còn hiệu lực |
| F-AI08 | Bật/tắt trợ lý | Chỉ Admin; bật khi nhà cung cấp, nguồn và chính sách dữ liệu đã cấu hình hợp lệ |

Tài liệu hướng dẫn đầu tiên là tập nguồn được chỉ định cho trợ lý, có phiên bản và quyền đọc. Việc này không mở thêm toàn bộ phân hệ kho kiến thức, editor, phê duyệt bài hoặc crawler. Chưa nhận upload tệp vào chat, chưa OCR ảnh/PDF và chưa nhúng toàn bộ tệp ticket vào mô hình.

## 3. Trải nghiệm theo vai trò

| Vai trò | Có thể nhờ AI | Điều kiện |
|---|---|---|
| Requester | Hướng dẫn, ticket của mình, tài sản được cấp, tóm tắt công khai, nháp yêu cầu | Không thấy ticket người khác hoặc nội bộ; không suy ra tồn tại bản ghi từ lỗi |
| Technician | Như góc nhìn cá nhân; thêm ticket/tài sản trong phạm vi xử lý, tóm tắt và nháp phản hồi | Scope nhóm được kiểm tra lại; nội bộ chỉ trong phiên gắn một ticket và được chọn rõ |
| IT Manager | Thông tin được phép toàn tổ chức, tóm tắt, nháp, báo cáo nghiệp vụ | Không có công cụ AI đổi priority/assignee/status; vẫn dùng dialog hiện có |
| Admin | Các thao tác đọc theo quyền và cấu hình trợ lý | Không dùng chat làm đường tắt đổi user/role/SLA hoặc xem chat cá nhân của người khác |

“Chat cá nhân” không có màn hình Admin xem mọi nội dung chat trong phạm vi này. Nhật ký vận hành AI chỉ lưu metadata tối thiểu; quy trình xử lý sự cố/retention cần được chốt trước vận hành.

## 4. Các luồng chính

### Hỏi đáp và tra cứu

Mở trợ lý → nhập câu hỏi → xác định loại thông tin → xác thực phiên và quyền → lấy nguồn hợp lệ → trả lời có nguồn → mở màn hình nguồn nếu cần. Đọc nguồn trước khi đưa vào mô hình; không lấy mọi dữ liệu rồi nhờ mô hình tự lọc.

Mỗi câu trả lời về quy định cần tài liệu và phiên bản. Câu trả lời về ticket/asset cần link đối tượng được phép cùng thời điểm đọc. Báo cáo cần khoảng thời gian, scope, công thức và số liệu từ lớp báo cáo. Không có nguồn đủ tin cậy → nói rõ chưa có căn cứ và cung cấp lối vào chức năng phù hợp.

### Soạn yêu cầu qua hội thoại

AI hỏi bổ sung tiêu đề, mô tả, loại, danh mục, ảnh hưởng và khẩn cấp → tạo **bản nháp** → người dùng chọn “Kiểm tra yêu cầu” → mở SCR21 với dữ liệu nhập sẵn → kiểm tra và chỉnh → người dùng bấm **Gửi yêu cầu** như luồng hiện tại.

Trước lần gửi cuối: chưa có mã ticket, chưa New, chưa SLA và chưa thông báo phân công. Form tính lại priority bằng ma trận; requester không được AI gán P1 hoặc assignee tùy ý. Asset phải vẫn được cấp cho người dùng khi submit. Không đặt mô tả hoặc dữ liệu nhạy cảm vào query URL khi chuyển nháp.

### Tóm tắt và soạn phản hồi

Trong SCR22, chọn “Nhờ AI hỗ trợ” → mở panel theo ngữ cảnh → chọn tóm tắt hoặc soạn nháp. Tóm tắt công khai và nháp công khai chỉ dùng nguồn public đã lọc. Phiên nội bộ được đánh nhãn rõ và không có thao tác đưa nội dung sang công khai.

Chọn “Đưa vào khung soạn” chỉ điền bản nháp sau khi người dùng chủ động chọn; không ghi đè nội dung đang soạn nếu chưa xác nhận thay thế. Người IT đọc/chỉnh và bấm **Gửi công khai** hoặc **Lưu ghi chú nội bộ** ở composer hiện có. Backend kiểm tra lại quyền, trạng thái và version tại lần gửi đó.

## 5. Những bất biến phải giữ

- Giữ nguyên New/Open/In Progress/Pending/Resolved/Closed/Cancelled và các cạnh chuyển tiếp.
- AI trả lời hoặc tóm tắt không tạo `TicketComment`, không tiếp nhận, không resume Pending và không làm ticket Resolved.
- AI không ghi `firstResponseAt`. Chỉ public comment do IT chủ động gửi qua nghiệp vụ hiện có mới xét phản hồi đầu tiên.
- Không sửa snapshot, ngân sách hoặc thời gian SLA; worker cảnh báo và khóa chống trùng giữ nguyên.
- Không cấp phát/thu hồi, đổi trạng thái tài sản, role, nhóm hoặc chính sách SLA qua chatbot.
- Chat và nháp chưa gửi không vào số liệu dashboard hoặc timeline ticket.
- Khi AI tắt hoặc lỗi, các luồng thủ công và tác vụ nền tiếp tục sử dụng được.

Điều kiện kiểm tra chi tiết nằm trong [tích hợp và bảo toàn nghiệp vụ](ai/integration-and-non-regression.md).

## 6. Information architecture và UI/UX

| Screen bổ sung | Vị trí và nội dung | Điều hướng về luồng hiện có |
|---|---|---|
| SCR-AI01 | `/assistant` hoặc panel ngữ cảnh; chat, nguồn, scope và trạng thái dịch vụ | Link ticket/asset/report đã kiểm tra quyền; mobile mở trang riêng |
| SCR-AI02 | Thẻ xem trước nháp trong chat/panel | Chuyển nháp đến SCR21 hoặc composer SCR22, không commit dữ liệu |
| SCR-AI03 | `/admin/assistant`; trạng thái bật/tắt, nguồn, chính sách dữ liệu, kết nối đã cấu hình | Chỉ Admin; không hiển thị hoặc nhập khóa bí mật vào chat |

Khi tính năng khả dụng, sidebar có “Trợ lý AI”; SCR22 có action phụ “Nhờ AI hỗ trợ”. Không tự mở chat, không che CTA xử lý, không di chuyển nút đang có. Panel là vùng tùy chọn, giữ form/filter đang thao tác; mobile có nút quay lại ngữ cảnh trước. Việc chọn role hay scope của trợ lý không cấp thêm quyền.

### Màn hình tham khảo

![Trợ lý AI và bản nháp yêu cầu](design/wireframes/11-ai-assistant.svg)

![Hỗ trợ theo ngữ cảnh ticket](design/wireframes/12-ai-ticket-assistant.svg)

![Trạng thái nguồn, lỗi và khả dụng](design/wireframes/13-ai-states.svg)

Nhãn luôn có “Trợ lý AI”; không trình bày như một kỹ thuật viên đã tiếp nhận việc. Câu nhắc ngắn: “AI hỗ trợ tham khảo. Kiểm tra nội dung trước khi gửi.” Từng nguồn mở được, không bịa link. Nội dung đang sinh chưa hoàn tất không có action chuyển nháp.

## 7. Trạng thái đặc biệt

| Trạng thái | Hành vi |
|---|---|
| Chưa cấu hình/tắt | Ẩn hành động sinh nội dung; Admin thấy hướng dẫn cấu hình. Nếu có lịch sử cá nhân thì cho quản lý chỉ đọc/xóa, không gọi provider hoặc hiển thị chatbot giả |
| Đang lấy dữ liệu/sinh câu trả lời | Chỉ panel AI có loading; có Dừng; phần nghiệp vụ không bị khóa |
| Không có nguồn | Nêu chưa đủ căn cứ, mời xem hướng dẫn/chức năng hiện có hoặc tạo ticket thủ công |
| Không có quyền | Thông điệp chung, không lộ tiêu đề, đoạn trích hoặc số lượng tài nguyên bị cấm |
| Dịch vụ timeout/hết hạn mức | Báo chưa thể trả lời, cho thử lại; luôn có lối vào tạo/xem ticket thủ công |
| Nguồn/quyền đã thay đổi | Không hiển thị lại câu trả lời dựa trên dữ liệu vừa mất quyền; tải lại theo scope mới |
| Đã có nháp đang nhập | Đề nghị giữ nháp hiện có hoặc thay bằng bản mới; không tự ghi đè |
| Nội dung có chỉ dẫn đánh lừa | Coi đó là dữ liệu; không gọi thêm công cụ, đổi quyền hoặc gửi dữ liệu ra URL tùy ý |

Trước lần gửi tới dịch vụ AI, hiển thị thông tin ngắn về loại dữ liệu được xử lý và nhà cung cấp đã được doanh nghiệp phê duyệt. Không hứa nhà cung cấp không lưu/không huấn luyện nếu chưa có chính sách hoặc thỏa thuận xác nhận điều đó.

## 8. Nghiên cứu bổ sung

Đây là quyết định thiết kế, không phải kết quả thử nghiệm chatbot. H-AI01: người dùng phân biệt được trả lời AI với phản hồi IT; H-AI02: hiểu rằng nháp chưa tạo ticket; H-AI03: kỹ thuật viên nhận ra nguồn public/internal; H-AI04: fallback đủ rõ khi dịch vụ lỗi. Kế hoạch test và AC được ghi ở [backlog AI](ai/use-cases-stories-and-acceptance.md).

Tham khảo: [OWASP Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) về chỉ dẫn có thể nằm trong dữ liệu được đọc; [OWASP Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/) về giới hạn công cụ/quyền/tự chủ. Vì vậy thiết kế dùng allowlist chỉ đọc và giữ quyền quyết định nghiệp vụ ở giao diện hiện có. [NN/g về hallucinations](https://www.nngroup.com/articles/ai-hallucinations/) hỗ trợ việc làm rõ nguồn và giới hạn câu trả lời; các nguyên tắc này chưa chứng minh hệ thống đã an toàn hoặc chính xác.

## 9. Điều kiện triển khai sau thiết kế

Lõi nghiệp vụ và quyền phải có API thực trước khi bật các tác vụ đọc dữ liệu thật. Chọn nhà cung cấp/mô hình, ngân sách, chính sách dữ liệu và tập tài liệu được duyệt tại bước kỹ thuật; chưa thêm dependency hoặc secret vào dự án hiện tại. AI có flag bật/tắt riêng và không là điều kiện khởi động hay nghiệm thu luồng lõi M1–M6.

Xem [8 use case, 8 stories và AC](ai/use-cases-stories-and-acceptance.md), [ma trận tích hợp/truy vết](ai/integration-and-non-regression.md) và [file XMind AI](xmind/08-ai-assistant.xmind).
