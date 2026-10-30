# Sổ quyết định và giả định thiết kế

**Trạng thái:** D-01–D-28 là giả định/đề xuất thiết kế, trừ phần được cập nhật rõ bên dưới; D-29 đã thống nhất nghiệp vụ; D-30–D-33 chốt kiến trúc mục tiêu theo bản định hướng mới ngày 30/10/2026. Bản chốt mới thay định hướng công nghệ và giai đoạn AI cũ; chưa có triển khai thực tế. Các mục dưới đây làm rõ chỗ đề bài chưa chỉ định; không yêu cầu người dùng trả lời trước khi nhận bộ thiết kế.

Riêng **D-29 — cấp tài khoản nội bộ** đã được người dùng chấp thuận về nghiệp vụ; chi tiết triển khai kỹ thuật vẫn thuộc bước M1.

| ID | Quyết định đề xuất | Lý do, tác động và phương án cần xác nhận |
|---|---|---|
| D-01 | Một role/user; người có vai trò IT vẫn gửi được yêu cầu cá nhân, có hai scope “Của tôi”/“Công việc IT” | Không nhân bản tài khoản; scope riêng tránh vô tình mở nội bộ ticket cá nhân ngoài nhóm |
| D-02 | Ticket mới vào một nhóm tiếp nhận do Admin chọn | Không thêm phân loại tự động; cần cấu hình nhóm hoạt động trước vận hành |
| D-03 | M/A đổi ưu tiên; T xác minh bằng trao đổi và đề nghị | Theo quyền chính của Manager trong đề bài, hạn chế quyền chưa được nêu |
| D-04 | Trang tạo và chi tiết ticket là page; phân công/đổi trạng thái dùng dialog ngắn | Hội thoại, tệp và timeline cần URL riêng và đủ không gian để đọc, theo dõi và xử lý |
| D-05 | Công khai/nội bộ có composer và nháp riêng trong bộ nhớ; chưa lưu nháp lâu dài | Giảm rủi ro gửi nhầm và không thêm tính năng nháp được lưu server |
| D-06 | PNG/JPEG/WebP/PDF; 10 MB theo 10.000.000 byte; ≤5/lần | Cụ thể hóa “ảnh/PDF”; loại SVG tránh nội dung chủ động. Có thể mở rộng allowlist sau đánh giá |
| D-07 | Một lần gửi nội dung+tệp có kết quả nghiệp vụ nhất quán; retry phải có cơ chế chống tạo trùng | Tránh ticket có/không có nội dung không rõ. Cách transaction với file storage do bước kiến trúc kỹ thuật quyết định |
| D-08 | Câu hỏi Pending/giải pháp tạo public comment; IT không tự tính phản hồi đầu ticket mình tạo | Giữ quy tắc “comment công khai có nội dung”, tránh coi event trạng thái là phản hồi |
| D-09 | Snapshot toàn bảng P1–P4 khi tạo; override ưu tiên lấy ngân sách từ snapshot này | Vừa đổi ngân sách theo mức ưu tiên vừa không đổi ticket cũ khi Admin sửa mặc định |
| D-10 | Cảnh báo cho assignee và các Manager hoạt động; fallback Admin nếu không có Manager | Đề bài chưa quy định trưởng nhóm đích. Doanh nghiệp có thể chọn lead theo Team sau nghiên cứu; chưa thêm role mới |
| D-11 | Serial không bắt buộc; serial có nhập không trùng; sửa chữa có thể giữ assignment | Phù hợp trách nhiệm sử dụng khi thiết bị sửa; UX phải chỉ rõ trạng thái và người giữ trách nhiệm |
| D-12 | Mở lại phải có assignee hợp lệ; nếu assignee lịch sử bị khóa/mất nhóm, M/A phân công lại trước | Không phá quy tắc In Progress cần assignee. Đây là tình huống cần xác nhận ưu tiên với chủ nghiệp vụ; không tự tạo trạng thái “yêu cầu mở lại” |
| D-13 | KPI hàng đợi hiện tại không bị filter ngày che ticket cũ; chart/báo cáo theo kỳ được gắn nhãn riêng | Tránh giấu tồn đọng. Công thức giải quyết gần nhất được công bố trong metrics catalog |
| D-14 | Requester được xem tài sản đang được cấp và ticket của mình liên quan; Technician xem tài sản phục vụ ticket nhóm | Hạn chế lộ hồ sơ thiết bị/nhân sự ngoài nhiệm vụ; Manager/Admin toàn bộ |
| D-15 | Từ chối bản ghi ngoài scope giống không tìm thấy; 403 cho chức năng theo role | Tránh dò tồn tại bản ghi; thông điệp UX chung và đường về an toàn |
| D-16 | Password ban đầu do Admin nhập, bàn giao qua kênh nội bộ theo D-29; không có email tự động/reset qua email | Cách cấp và bàn giao tài khoản đã chốt về nghiệp vụ. Chính sách password và hỗ trợ quên mật khẩu vẫn cần refinement trước M1 |
| D-17 | Khóa user, đổi role mất quyền IT hoặc bỏ membership cần xử lý assignment trên ticket đang mở; lịch sử giữ nguyên | Thu hồi quyền lập tức, không để ticket đang xử lý nằm ở assignee không còn quyền; không được khóa Admin hoạt động cuối cùng |
| D-18 | Giao diện sáng, Inter/Segoe UI, xanh dương và nhận diện riêng | Nhận diện nhất quán, phù hợp công cụ vận hành IT |
| D-19 | Không xuất báo cáo, đăng ký, nút quên mật khẩu gửi mail hoặc dark mode; AI theo phạm vi bổ sung D-22 | Không đưa hành động chưa có nghiệp vụ vào nghiệm thu; chatbot tùy chọn không tự thực thi thay đổi |
| D-20 | Lịch sử: để mở stack khi chỉ làm thiết kế; nay được thay bằng D-30–D-32 | Công nghệ mục tiêu đã chốt. Cài dependency, tạo lockfile và kiểm chứng runtime vẫn thuộc M1, chưa code |
| D-21 | Ticket IT tự xử lý chưa có phản hồi hợp lệ từ người IT khác không được coi là đã đáp ứng phản hồi; dừng giám sát khi kết thúc, resume từ thời điểm tạo nếu mở lại | Làm rõ ngoại lệ của D-08, tránh timestamp giả hoặc cảnh báo tiếp trên ticket kết thúc. Cần xác nhận quy trình tự phục vụ của đội IT trước M3 |

Các quy tắc nhỏ như độ dài trường, phân trang mặc định 20/tối đa100, cửa sổ bảo hành30 ngày và nhịp worker60 giây là **giá trị đề xuất**, không phải số đã nghiên cứu từ doanh nghiệp. Điều chỉnh chúng không được thay đổi quyền, mô hình trạng thái hay mục tiêu MVP.

## Quyết định bổ sung cho chatbot AI

| ID | Quyết định | Lý do và tác động |
|---|---|---|
| D-22 | Bổ sung thiết kế chatbot tùy chọn; phạm vi nghiệm thu nay theo D-33 (MVP); 8 UC/US và 3 mẫu screen có namespace AI riêng | Thay phần loại trừ AI trước đây; giữ nguyên nội dung use case/story/quy tắc lõi |
| D-23 | AI chỉ đọc, giải thích và soạn nháp; người dùng gửi qua form/composer hiện có | Không tool mutation hoặc quyền AI riêng; giữ trạng thái, validation, version và SLA |
| D-24 | Feature flag và provider adapter độc lập; thiếu cấu hình thì không bật | Không làm startup/core/worker phụ thuộc dịch vụ AI; chưa chọn vendor/model hoặc thêm dependency |
| D-25 | Conversation, message, nguồn và draft là dữ liệu riêng | Không thêm trường bắt buộc vào Ticket/SLA/Asset; xóa chat không xóa nghiệp vụ; retention cần chốt trước vận hành |
| D-26 | Tách phiên PUBLIC/INTERNAL; không handoff nội bộ ra public | Tránh mô hình tự lọc lịch sử trộn; nguồn public được lọc trước model, người IT vẫn review nội dung trước gửi |
| D-27 | Citation, số liệu và scope do server xác định từ nguồn/dịch vụ hiện có | Không SQL hoặc metric do model tự viết; thu hồi quyền áp dụng cả cache/lịch sử/đầu ra đang sinh |

## Quyết định về giao diện v0.4

| ID | Quyết định | Lý do và tác động |
|---|---|---|
| D-28 | Làm mới 13 bản UI, thêm 2 board, 44 icon vector riêng và đặc tả motion/responsive; lưu bản v0.3 | Theo yêu cầu giao diện đẹp, thân thiện và uyển chuyển hơn. Chỉ đổi cách trình bày, không thêm screen ID hoặc đổi nghiệp vụ. Chuyển động là đề xuất thiết kế, chưa có animation/prototype thực thi; xem [định hướng](../design/visual-refresh.md) |

## Quyết định đã thống nhất về cấp tài khoản

| ID | Quyết định | Trạng thái và phạm vi |
|---|---|---|
| D-29 | Trưởng phòng dùng quyền Requester tạo ticket Yêu cầu dịch vụ / Tài khoản ngay trong hệ thống. Admin xác minh người đề nghị, nhu cầu và phê duyệt vai trò IT rồi tạo user tại Quản trị → Người dùng, mặc định Requester. Bàn giao mật khẩu qua kênh doanh nghiệp; trưởng phòng theo dõi và xác nhận kết quả trên ticket | Cập nhật theo chỉ dẫn người dùng ngày 30/10/2026: người yêu cầu là trưởng phòng, yêu cầu nằm trong ứng dụng. Không thêm role HR/trưởng phòng, không tự cấp tài khoản từ ticket; dùng trạng thái và SLA hiện có. Admin đầu tiên và tài khoản trưởng phòng ban đầu thiết lập có ủy quyền; bootstrap kỹ thuật và password policy vẫn cần refinement M1. [Luồng chi tiết](../requirements/account-provisioning.md) |

## Chốt kiến trúc mục tiêu ngày 30/10/2026

| ID | Quyết định | Căn cứ và tác động |
|---|---|---|
| D-30 | Next.js App Router/React/TypeScript frontend; FastAPI/Python REST backend; modular monolith trong một repo | Theo bản chốt mới, thay backend Next/Prisma trước đây; không có mã ứng dụng cũ phải migrate. Giữ nghiệp vụ và thiết kế UI; [đối chiếu stack](../technical/tech-stack.md) |
| D-31 | PostgreSQL + SQLAlchemy synchronous Session + Alembic/Psycopg 3; PostgreSQL server sessions, pwdlib Argon2id, CSRF | FastAPI sở hữu xác thực/quyền; maintained hashing library không thay dịch vụ session end-to-end. Bắt buộc test phiên, CSRF, scope, transaction/version; [kiến trúc](../technical/architecture.md) |
| D-32 | Celery, một Beat 60 giây, Redis broker; private local/S3; pnpm/uv, Compose/Linux và bộ test đã chọn | PG giữ SLA/violation/dedup, không phụ thuộc UI/Redis làm nguồn chuẩn; worker Linux cả khi dev Windows. Version ứng viên được tra metadata nhưng phải resolve/build/test/lock tại M1; [baseline](../technical/version-baseline.md) |
| D-33 | Trợ lý AI tích hợp thuộc phạm vi triển khai và nghiệm thu MVP; bật/tắt là lựa chọn vận hành, không phải loại trừ khỏi phạm vi | Cập nhật theo xác nhận mới nhất của chủ dự án, thay kết luận giai đoạn 3 trong lần đối chiếu trước. Giữ 8 UC/US, 3 bản vẽ, 4 sheet AI và D-23–D-27 về quyền, nguồn, nháp. Phải đạt 8 AC AI, 12 ca kiểm chứng và regression lõi trước bàn giao MVP; provider/model/SDK và chính sách dữ liệu cần chốt khi triển khai, hiện chưa có chatbot chạy thật |
