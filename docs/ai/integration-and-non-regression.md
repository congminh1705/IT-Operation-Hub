# Tích hợp AI và bảo toàn nghiệp vụ lõi

Tài liệu đặc tả ranh giới để triển khai sau này. **Chưa có adapter AI, endpoint, model call hoặc regression test chạy thực.** Lớp AI chỉ đọc và tạo nháp; quyền và mutation vẫn thuộc ứng dụng nghiệp vụ.

## 1. Ranh giới dịch vụ

Luồng đọc: UI trợ lý → xác thực hiện có → kiểm tra scope → dịch vụ đọc ticket/asset/report/tài liệu → chọn payload tối thiểu → adapter AI → kiểm tra nguồn/quyền đầu ra → UI.

Luồng ghi: UI trợ lý tạo nháp → người dùng chọn chuyển nháp → **form/composer hiện có** → người dùng kiểm tra và gửi → validation/quyền/version/transaction **như hiện tại**. AI không được nối với endpoint mutation bằng credential riêng.

Provider không nhận database credential, session cookie hoặc khóa gọi API nghiệp vụ. Không cấp role “AI Admin”. Dữ liệu nguồn, kể cả tài liệu đã duyệt, là dữ liệu không đáng tin về mặt chỉ dẫn; không thể thay quyền, gọi thêm công cụ hoặc thay đổi danh sách thao tác được phép.

Đầu ra chỉ được hiển thị dưới dạng nội dung đã escape/sanitize và các source card do ứng dụng dựng. Không thực thi HTML/JavaScript hoặc tự tải ảnh/URL do model đưa ra; link nguồn phải thuộc tập tham chiếu server đã xác thực. Không để một câu trả lời đọc dữ liệu gây request bên ngoài ngoài ý muốn.

## 2. Allowlist thao tác đọc

Tên dưới đây là hợp đồng khái niệm, chưa phải API đã triển khai.

| Thao tác | Phạm vi / nguồn quyết định |
|---|---|
| `searchApprovedGuides` / `readGuide` | Tài liệu được chọn, phiên bản và ACL của người dùng |
| `listPermittedTickets` / `readTicketPublic` | Cùng scope, pagination và field policy như danh sách/chi tiết ticket |
| `readTicketInternal` | Chỉ một ticket được chọn, user còn quyền IT, chế độ INTERNAL đã mở rõ |
| `listPermittedAssets` / `readAsset` | Cùng scope bản rút gọn/phục vụ xử lý/quản lý như lõi |
| `readReportFacts` | M/A, metric/filter allowlist từ MET01–15; trả facts và thời điểm |
| `prepareTicketDraft` / `prepareReplyDraft` | Chỉ cấu trúc nháp trong lớp AI; không gọi mutation nghiệp vụ |

Không có tool tạo comment, đổi trạng thái, phân công, chuyển nhóm, override priority, cấp/thu hồi asset, đổi user/role hoặc sửa SLA. Không shell, SQL, HTTP tùy ý, crawler hoặc truy xuất toàn database qua ngôn ngữ tự nhiên.

## 3. Scope và ranh giới công khai/nội bộ

| Ngữ cảnh | Nguồn được dùng | Handoff |
|---|---|---|
| Chat chung | Tài liệu có quyền, trường public của các đối tượng được phép | Nháp yêu cầu hoặc link nguồn |
| Ticket PUBLIC | Public fields/comment/tệp metadata được phép; không đọc nội bộ | Nháp public vào composer công khai |
| Ticket INTERNAL | Public và internal của **một ticket**, chỉ IT có scope | Nháp nội bộ vào composer note; không chuyển thành public |
| Báo cáo | Facts đã lọc của M/A | Link tới SCR40 với filter tương ứng, không tạo báo cáo/metric mới |

Phiên PUBLIC và INTERNAL tách ngữ cảnh, không mang lịch sử nội bộ sang phiên public. Nếu user muốn soạn public sau khi đọc nội bộ, mở một phiên PUBLIC mới chỉ dùng dữ liệu public; không nhờ mô hình “tự bỏ thông tin nhạy cảm” từ lịch sử trộn.

Quyền được kiểm tra trước retrieval, trước gửi tới provider và trước render/đọc lại lịch sử. Nếu nguồn mất quyền trong lúc sinh câu trả lời, bỏ kết quả phụ thuộc nguồn đó, không lộ một phần. Cache không dùng chung giữa user hoặc visibility; mọi hit vẫn kiểm tra quyền hiện tại. Turn cũ chứa dữ liệu nguồn không còn quyền phải bị che toàn bộ khi cần, không chỉ bỏ link dẫn nguồn.

AI không truy cập mặc định nội dung binary của tệp. Link attachment tiếp tục tải qua kiểm tra quyền hiện có; không đổi thành URL public để provider đọc. Lịch sử chat không là đường vòng giữ bản sao dữ liệu đã bị thu hồi quyền.

## 4. Bất biến đối chiếu với lõi

| Bất biến | Hành vi AI được phép | Hành vi bị chặn / kiểm tra |
|---|---|---|
| Trạng thái BR-04 | Đọc/giải thích trạng thái hiện tại | Không thêm trạng thái hoặc chuyển cạnh qua chat |
| Tạo ticket BR-02 | Chuẩn bị các trường cho form | Không tạo mã/event/SLA từ nháp; submit cuối vẫn SCR21 |
| Priority BR-03 | Hiển thị đề xuất từ ma trận | Không nhận P1/assignee tùy ý từ output AI; form tính lại |
| First response BR-08 | Soạn nháp cho người IT | AI message không là TicketComment; không ghi firstResponseAt |
| Pending BR-04/09 | Tóm tắt câu hỏi và đề xuất nội dung | Không resume khi chat; chỉ comment requester gửi thật/IT tiếp tục theo quyền |
| SLA BR-09/10 | Đọc ngân sách/đã dùng từ service | Không reset/pause/resume hoặc sửa breach history/worker dedup |
| Phân công BR-05 | Đọc người/nhóm đang phụ trách | Không tự nhận, giao người hoặc chuyển nhóm |
| Tài sản BR-11 | Đọc hồ sơ đúng scope | Không sửa assignment hoặc trạng thái; một assignment hiệu lực giữ nguyên |
| MET01–15 | Đọc facts từ báo cáo | Không đếm chat/nháp thành ticket; không tự tính lại công thức |
| Version và transaction | Handoff kèm ngữ cảnh cần revalidate | Không bỏ qua conflict vì câu trả lời được sinh từ version cũ |
| Hoạt động khi AI lỗi | Timeout/circuit breaker ở lớp AI | Không giữ khóa DB, chặn submit form hoặc dừng worker SLA |
| Lịch sử | Chat lưu riêng, audit AI metadata tối thiểu | Không trộn chat vào timeline công khai; xóa chat không xóa lịch sử nghiệp vụ |

Các bản đặc tả lõi được giữ nguyên nội dung. [Biên bản rà soát](../review-report.md) ghi phép so sánh checksum trước/sau trên tài liệu lõi và wireframe hiện có. Điều này chứng minh sự giữ nguyên tài liệu, không thay thế regression test của phần mềm sau khi triển khai.

## 5. Dữ liệu riêng của lớp AI

| Khái niệm bổ sung | Dữ liệu cần có / ranh giới |
|---|---|
| AIConversation | Chủ phiên, visibility, ticket context tùy chọn, thời điểm và trạng thái; không là ticket |
| AIMessage | Vai trò user/assistant, nội dung chat và trạng thái hoàn thành/lỗi; không là comment |
| AISourceReference | Nguồn, version, visibility và ACL reference; dùng để revalidate khi đọc lại |
| AIDraft | Chủ nháp, target form/audience, dữ liệu cấu trúc, thời hạn; không có trạng thái nghiệp vụ |
| AIUsageEvent | Metadata request, loại tác vụ, lỗi/usage nếu có; không log prompt/body/secrets mặc định |
| ApprovedAISource | Nguồn đã duyệt, phiên bản, phạm vi đọc và trạng thái; chưa mở phân hệ KB đầy đủ |

Không thêm trường bắt buộc vào Ticket, TicketSLA hoặc Asset để bật chatbot. Xóa/vô hiệu dữ liệu AI không kéo theo xóa hồ sơ lõi. Thời hạn lưu/xóa chat, nhà cung cấp và chính sách truyền dữ liệu phải được doanh nghiệp chốt trước vận hành; chưa tuyên bố không lưu dữ liệu hoặc không dùng để huấn luyện khi chưa có căn cứ.

Việc tắt trợ lý không làm user mất quyền lõi. Đọc hoặc xóa lịch sử cá nhân có thể còn được cung cấp khi cờ AI tắt để người dùng quản lý dữ liệu đã tạo; trạng thái này không gọi provider.

## 6. Handoff và concurrency

Nháp chuyển trong bộ nhớ phiên hoặc token tham chiếu riêng tư có owner/TTL; không nhét mô tả/note vào URL. SCR21/SCR22 coi đó là input chưa tin cậy, kiểm tra lại enum, độ dài, scope asset và trạng thái. Không auto-submit sau đăng nhập lại, refresh, retry hoặc mở lại panel.

Chỉ nhận các trường nháp được cho phép như tiêu đề, mô tả, loại, danh mục, impact/urgency và asset được phép. Bỏ/từ chối userId, role, trạng thái, priority override, nhóm hoặc assignee do model tự đề xuất trong payload. Đích handoff chỉ là form/composer được ứng dụng định sẵn, không phải URL hoặc tên thao tác do model tự tạo.

Đang có nội dung trong form/composer thì hỏi thay thế hay giữ; mặc định giữ. Handoff bị chặn khi thiếu quyền hoặc không đúng audience. Khi version ticket đổi, bản nháp vẫn có thể đọc như nội dung do user chuẩn bị nhưng không có quyền ghi cho đến khi dịch vụ nghiệp vụ chấp nhận version/ngữ cảnh hiện tại.

## 7. Khả dụng, rollout và rollback

- Flag AI độc lập, mặc định tắt nếu thiếu provider, nguồn hoặc data policy. Không cần model client để chạy luồng nghiệp vụ thường.
- Provider adapter độc lập khỏi domain; timeout/hủy/giới hạn concurrency chỉ ảnh hưởng AI. Không mở transaction nghiệp vụ trong lúc chờ model.
- Chưa chọn vendor/model hoặc phiên bản dependency trong giai đoạn tài liệu. Không có secret/API key trong source, chat, ảnh hoặc log.
- Khi triển khai, bật nội bộ theo vai trò/tác vụ sau khi quyền API lõi và nguồn đã qua kiểm tra; public trước, nội bộ sau khi test visibility.
- Tắt flag là rollback chức năng AI; form, ticket, SLA worker và tài sản không cần rollback dữ liệu vì AI không trực tiếp ghi chúng.

M1–M6 vẫn là chuỗi nghiệm thu lõi. Nhánh AI triển khai khi API tương ứng sẵn sàng; không trì hoãn luồng thủ công để chờ kết quả AI. Không đánh dấu chatbot hoạt động chỉ vì có ô chat hoặc nội dung mẫu.

## 8. Truy vết phần bổ sung

| Năng lực | UC / US / AC | Màn hình | Nghiệp vụ tái dùng | Rủi ro kiểm chứng |
|---|---|---|---|---|
| F-AI01 | UC-AI01 / US-AI01 / AC-AI01 | SCR-AI01 | Nguồn hướng dẫn được duyệt | Link bịa, thiếu nguồn, prompt injection |
| F-AI02 | UC-AI02 / US-AI02 / AC-AI02 | SCR-AI01 | UC11/12/27/28, quyền hiện có | IDOR, scope thay đổi, cache/history |
| F-AI03 | UC-AI03 / US-AI03 / AC-AI03 | SCR-AI02→SCR21 | UC10 / BR-02/03 | Tạo ngầm, sai priority, trùng submit |
| F-AI04 | UC-AI04 / US-AI04 / AC-AI04 | SCR-AI01 trên SCR22 | UC12/24, visibility | Lộ nội bộ, ghi first response giả |
| F-AI05 | UC-AI05 / US-AI05 / AC-AI05 | SCR-AI02→SCR22 | UC15/16, BR-04/06/08 | Gửi nhầm audience, auto-resume |
| F-AI06 | UC-AI06 / US-AI06 / AC-AI06 | SCR-AI01→SCR40 | UC32 / MET01–15 | Đổi công thức, đọc báo cáo cấm |
| F-AI07 | UC-AI07 / US-AI07 / AC-AI07 | SCR-AI01 | Phiên và danh tính hiện có | Đọc chat khác, xóa nhầm dữ liệu lõi |
| F-AI08 | UC-AI08 / US-AI08 / AC-AI08 | SCR-AI03 | Quyền Admin; cấu hình riêng | Ảnh hưởng core khi AI tắt/lỗi |

## 9. Gate nghiệm thu AI trong tương lai

Chạy TC-AI01–12 và bộ AC lõi hiện có với AI bật, tắt và provider lỗi. Đối chiếu DB trước/sau câu hỏi, tóm tắt và nháp: Ticket, TicketComment, TicketEvent, TicketSLA, AssetAssignment không đổi. Chỉ những thao tác cuối do user gửi ở form gốc mới được có mutation tương ứng. Kiểm tra no-leak cả payload tới model và UI, không chỉ kiểm tra câu trả lời.

Chạy cùng TC-SLA01–12, test hai assignee nhận ticket và cấp phát đồng thời như kế hoạch lõi; không được miễn các test đó vì thêm AI. Kết quả hiện tại: **chưa chạy — chưa có ứng dụng để kiểm thử**.

## Giới hạn nhận diện nội dung do người dùng tự nhập

Visibility được thực thi chắc chắn với các nguồn hệ thống đã gắn quyền và nhãn. Không tuyên bố có thể nhận diện hoàn hảo mọi bí mật hoặc ghi chú nội bộ mà người dùng tự gõ/dán vào chat. UI phải nêu audience, nhắc không gửi bí mật và yêu cầu người dùng kiểm tra trước khi gửi qua composer hiện có; đây không phải lý do nới quyền retrieval hoặc bỏ kiểm tra ở backend.
