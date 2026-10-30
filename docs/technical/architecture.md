# Kiến trúc mục tiêu và ranh giới triển khai

Trạng thái: quyết định thiết kế, chưa có source ứng dụng. Công nghệ trong [tech stack](tech-stack.md); nghiệp vụ, quyền và chỉ số trong các catalog hiện hành vẫn là chuẩn.

## 1. Cấu trúc và trách nhiệm

Một repository, một backend modular monolith. Giữ `src/frontend/` và `src/backend/` hiện có; `deployment/` là thư mục dự kiến ở M1, `docs/` chứa tài liệu. Chưa tạo skeleton hoặc file cấu hình triển khai.

| Lớp / tiến trình | Trách nhiệm | Ranh giới |
|---|---|---|
| Browser / Next.js | Layout, form, bảng, chart, URL filters và trạng thái UX | Chỉ gọi REST; không đọc DB, không quyết định quyền hoặc SLA |
| Nginx | TLS, reverse proxy cùng domain | `/api/` → FastAPI giữ nguyên prefix; đường còn lại → Next.js. API dùng `/api/v1`; không route nhầm thành trang Next |
| FastAPI router/schema | Session dependency, parse/validate, HTTP errors, response schema | Không chứa toàn bộ quy tắc xử lý ticket trong route |
| Service | Permission theo hành động/bản ghi, state machine, SLA, audit, transaction | API và worker dùng chung; worker có actor hệ thống rõ, không giả user Admin |
| Repository/model | Query có scope, lưu trữ, khóa và ràng buộc | Không tự commit tách khỏi transaction nghiệp vụ |
| Celery worker | Chạy tác vụ qua service với Session riêng | Không lấy frontend/dashboard làm bộ kích hoạt SLA |
| Celery Beat | Phát lịch quét SLA mỗi 60 giây | Một instance cho một lịch |
| PostgreSQL | Dữ liệu nghiệp vụ, session, SLA, violation, notification, audit | Nguồn dữ liệu chuẩn; Redis hỏng không làm mất lịch sử SLA |
| Redis | Broker Celery | Không public Internet; không dùng làm dữ liệu chuẩn |
| Storage adapter | Ghi/đọc/xóa tệp private bằng local hoặc S3 | Không có static upload route công khai |

Backend chia module `auth`, `users` (gồm phòng ban), `teams`, `tickets` (gồm danh mục), `sla`, `assets`, `notifications`, `reports`, `audit`; mỗi module giữ router/schema/service/repository/model phù hợp. Không tạo service mạng độc lập cho mỗi module.

## 2. Xác thực và quyền

FastAPI sở hữu email/password và vòng đời phiên. Dùng pwdlib[argon2] để hash Argon2id, cùng thư viện chuẩn/maintained dependency cho random/crypto/cookie. PostgreSQL lưu Session gồm user, hash của opaque token ngẫu nhiên, created/expires/revoked và thông tin quản lý phiên cần thiết. Cookie chứa token thô, không chứa role hoặc dữ liệu user làm nguồn quyền; không lưu token trong localStorage.

Cookie HttpOnly, Secure ở production, SameSite=Lax, host-only, Path=/; cân nhắc tên `__Host-` cho HTTPS. Token được xoay khi đăng nhập và thay đổi bảo mật cần thiết. Logout thu hồi phiên hiện tại; khóa user thu hồi tất cả phiên trong cùng transaction; mỗi request kiểm tra user hoạt động và quyền/membership hiện tại. Không cache quyền lâu tới mức tiếp tục truy cập sau thu hồi.

CSRF synchronizer token gắn với phiên, gửi qua header ở mutation; có bảo vệ login CSRF và kiểm tra Origin/Referer theo allowlist. SameSite không thay thế CSRF. Cùng domain qua Nginx để tránh CORS phức tạp; nếu dev khác origin phải allowlist rõ và dùng credentials, không wildcard.

Đây là **dịch vụ session ứng dụng ghép từ thành phần được duy trì**, chưa phải tích hợp một thư viện auth end-to-end. Không dùng JWT tutorial như thiết kế phiên, không dùng Starlette signed-cookie session làm thay thế PostgreSQL session. Gate M1 bắt buộc test rotate/expiry/revoke/CSRF/login abuse và review bảo mật. Password policy, reset không email và bootstrap Admin vẫn cần refinement; không thêm public signup hoặc email provider giả. [FastAPI password hashing](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/), [OWASP sessions](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [OWASP CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

Scope áp dụng trước khi trả danh sách, count, lookup, comment, attachment, notification và report. Requester không nhận internal fields từ API. Technician không tăng quyền bằng ID; ngoài scope trả 404 theo D-15, chức năng không được role cho phép trả 403. Thay role/team phải áp dụng trên request kế tiếp; client ẩn menu chỉ phục vụ UX.

## 3. Transaction, version và API

Service mở transaction bao trùm thay đổi ticket/SLA/event/notification/audit liên quan. Khi lỗi thì rollback; không commit từng repository. Session đồng bộ riêng mỗi request/task, đóng/rollback đúng vòng đời; worker không dùng chung connection/session được thừa kế từ process khác.

UUID là khóa nội bộ, ticket code/asset code có unique riêng; dùng sequence/cơ chế sinh mã an toàn, không `MAX + 1`. Mutation nhận expected version; cập nhật có điều kiện version và tăng version nguyên tử. Conflict trả 409, UI giữ bản nhập và yêu cầu đối chiếu. `version_id_col` hỗ trợ flush ORM nhưng bulk update cần điều kiện version tường minh. [SQLAlchemy version counter](https://docs.sqlalchemy.org/en/21/orm/versioning.html).

Asset assignment dùng transaction, khóa asset khi kiểm tra trạng thái và ràng buộc unique theo asset với điều kiện chưa thu hồi. Hai yêu cầu cấp đồng thời chỉ một thành công; trạng thái sửa chữa/ngừng sử dụng bị chặn. Không dựa vào nút disabled để bảo đảm tính duy nhất. [PostgreSQL partial indexes](https://www.postgresql.org/docs/current/indexes-partial.html).

REST JSON `/api/v1`, multipart cho tệp. Pagination mặc định 20, tối đa 100, sort allowlist và tie-breaker ID; các filter chuẩn hóa vào URL. Error envelope dự kiến gồm `code`, `message`, `field_errors`, `request_id`; chuẩn hóa cả lỗi validation mặc định 422. Status 401 hết phiên, 403 role, 404 ngoài scope/không tồn tại, 409 conflict, 422 đầu vào sai. OpenAPI thực tế sẽ chốt path/schema tại M1–M2; tài liệu này chưa tuyên bố có endpoint đang chạy.

Pydantic là hợp đồng server; CI xuất OpenAPI và sinh TypeScript bằng openapi-typescript, phát hiện type drift. Zod kiểm tra input UX, không thay validation server. Không chuyển Pydantic validator thành quy tắc quyền ở frontend.

## 4. SLA, idempotency và hàng đợi

Beat phát lệnh quét mỗi 60 giây; worker lấy ticket cần theo dõi từ PostgreSQL theo batch/index. DB lưu snapshot P1–P4, thời gian đã dùng, running interval và breach history. Pending chỉ dừng resolution; public IT comment có nội dung mới tính first response; Resolved/Closed không tiêu thụ resolution; reopen tiếp tục ngân sách, chuyển nhóm không reset. Không đổi công thức nghiệp vụ hiện hành.

Worker và API khóa/check lại bản ghi trước khi ghi kết quả; tránh hai lượt quét hoặc mutation chạy chồng. Violation/delivery có unique key thể hiện ticket, loại đồng hồ, ngưỡng và kỳ theo dõi đã được định nghĩa; ưu tiên đổi hoặc reopen không tự xóa breach trước. Thiết kế key vật lý phải được kiểm thử theo từng kịch bản, không chỉ dùng task ID hoặc Redis lock.

Ghi breach và Notification trong một transaction, unique theo event/recipient. Worker retry, Redis redelivery hoặc nhiều worker không tạo thêm cùng cảnh báo. Các mutation cũng kiểm tra SLA để không bỏ qua vi phạm xảy ra trước thời điểm resolve trong lúc worker gián đoạn. UI polling 30 giây chỉ cập nhật hiển thị, không thay worker.

Với công việc cần phát từ transaction sang broker, dùng OutboxEvent trong PostgreSQL và lượt phát lại sau commit; task xử lý idempotent. SLA periodic scan luôn có khả năng phục hồi từ DB dù mất message. Không giữ toàn bộ bộ đếm hoặc một task ETA dài cho mỗi ticket trong Redis; không coi broker bảo đảm exactly-once. [Celery periodic tasks](https://docs.celeryq.dev/en/stable/userguide/periodic-tasks.html).

## 5. Tệp và dữ liệu thời gian

Local dev lưu ngoài public/static với key ngẫu nhiên. Production S3 private qua boto3; API xác thực/quyền nội dung cha tại mỗi lần download rồi stream nội dung. Không phát URL public hoặc URL ký sống lâu khiến quyền cũ tồn tại sau chuyển nhóm/khóa user.

Allowlist PNG/JPEG/WebP/PDF, tối đa 10.000.000 byte/tệp và 5 tệp/lần. Kiểm tra số byte thật, extension, media type và chữ ký/khả năng parse nội dung; không tin filename/MIME client. M1–M2 chốt thư viện kiểm tra nội dung an toàn, có thể dùng libmagic qua python-magic trong Linux container; nó không thay toàn bộ validation. Sanitize tên tải về, Content-Disposition attachment/nosniff; không dùng tên người dùng làm đường dẫn. Proxy body limit dự kiến 64 MiB để chứa 5 tệp và multipart overhead; API vẫn áp hạn mức từng tệp.

PG và object storage không có transaction chung: stage private file, chỉ hiển thị metadata đã finalize trong nghiệp vụ thành công; cleanup/reconciliation cho object mồ côi và retry có idempotency key. Không khẳng định transaction DB có thể rollback tệp S3. Upload chưa hoàn tất không tạo comment/first response giả.

Timestamp lưu UTC, timezone-aware, API ISO 8601; ngày mua/bảo hành thuần ngày không ép thành timestamp. Frontend format Asia/Ho_Chi_Minh bằng date-fns/tz. SLA dùng clock server và ngân sách 24/7; không làm tròn theo giờ hiển thị.

## 6. Vận hành và khả năng mở rộng

Nginx, Next.js, API, worker, một Beat, PostgreSQL và Redis là các tiến trình/container trong cùng hệ thống; S3 là dịch vụ lưu trữ production. Worker Linux cho cả dev Windows. API/worker/Beat dùng cùng version image/backend và Alembic migration; chạy migration một lần có kiểm soát trước chuyển traffic, không để mọi replica cùng migrate.

Healthcheck, persistent volumes, giới hạn pool kết nối theo tổng API/worker, retry/backoff và log request/task ID cần được cấu hình và kiểm chứng. PG/Redis không mở cổng production ra Internet. Backup PostgreSQL kèm private files và diễn tập restore; RPO/RTO chưa được cam kết. Một VPS là baseline triển khai, không phải cam kết high availability.

Trợ lý AI trong MVP gọi API/service nghiệp vụ với scope người dùng, không trực tiếp DB và không tự cấp quyền. Backend có module/adapter AI tách khỏi service lõi; dùng Celery hiện có cho tác vụ AI dài nếu cần, không chặn worker SLA (tách queue và giới hạn tài nguyên). Chưa chọn provider/model/SDK hoặc có quyết định dùng vector DB; phải chốt giải pháp và kiểm chứng nguồn/quyền trước triển khai tích hợp. Không dùng chatbot placeholder để nghiệm thu. Các hạn chế đọc/soạn nháp và xác nhận hiện tại được giữ trong [thiết kế AI](../10-ai-assistant.md).
