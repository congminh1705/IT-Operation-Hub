---
id: itoh-docs-decisions-design-decisions
title: "Sổ quyết định và giả định thiết kế"
type: reference
domain: project
module: decisions
tags: [project, decisions, reference]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Ghi quyết định, giả định, trạng thái và các điểm còn cần chủ đề tài quyết định."
---

# Sổ quyết định và giả định thiết kế

**Trạng thái:** D-29–D-39 và D-41 ghi các quyết định nghiệp vụ, kiến trúc, phạm vi thiết kế và cấu hình thử nghiệm đã được xác nhận trong giới hạn từng mục. Các giả định/đề xuất chưa được xác nhận và chi tiết vận hành còn mở được ghi rõ ở D-40. Chốt thiết kế không có nghĩa đã triển khai hoặc nghiệm thu phần mềm.

Riêng **D-29 — cấp tài khoản nội bộ** đã được người dùng chấp thuận về nghiệp vụ; chi tiết triển khai kỹ thuật vẫn thuộc bước M1.

## Trạng thái, thẩm quyền và cách đọc

Chủ đề tài/người dùng quyết định phạm vi; agent biên soạn và ghi tác động. D-01–21 là các giả định/quyết định thiết kế đề xuất cần được đọc cùng D-29–41; không tự coi tất cả đã được người dùng phê duyệt. D-22–28 giữ lịch sử và phạm vi còn hiệu lực được chỉ rõ tại từng dòng. D-29–39 đã được xác nhận trong giới hạn ghi ở mỗi mục; D-40 là danh sách cần quyết định; D-41 xác nhận mô hình vai trò. Không mục nào là bằng chứng triển khai.

Mỗi dòng ghi ID, lựa chọn, lý do/hệ quả và tài liệu chịu ảnh hưởng. Các phương án bị loại rõ theo ràng buộc: Django ORM không thay SQLAlchemy/Alembic; AI chỉ chatbot hoặc chỉ đề xuất không đáp ứng MVP; AI có toàn quyền Admin không đáp ứng nguyên tắc policy. Chi tiết chưa được chọn không được bổ sung lịch sử “đã cân nhắc/phê duyệt” giả. Thay đổi quyết định đã chốt phải ghi mục thay thế/liên kết tác động, không lặng lẽ xóa trạng thái cũ.

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
| D-10 | Cảnh báo cho assignee và các Manager hoạt động; fallback Admin nếu không có Manager | IT Manager là Trưởng phòng IT, không có cấp trưởng nhóm riêng. AI điều phối theo policy; cảnh báo vẫn có người chịu trách nhiệm giám sát |
| D-11 | Serial không bắt buộc; serial có nhập không trùng; sửa chữa có thể giữ assignment | Phù hợp trách nhiệm sử dụng khi thiết bị sửa; UX phải chỉ rõ trạng thái và người giữ trách nhiệm |
| D-12 | Mở lại phải có assignee hợp lệ; nếu assignee lịch sử bị khóa/mất nhóm, M/A phân công lại trước | Không phá quy tắc In Progress cần assignee. Đây là tình huống cần xác nhận ưu tiên với chủ nghiệp vụ; không tự tạo trạng thái “yêu cầu mở lại” |
| D-13 | KPI hàng đợi hiện tại không bị filter ngày che ticket cũ; chart/báo cáo theo kỳ được gắn nhãn riêng | Tránh giấu tồn đọng. Công thức giải quyết gần nhất được công bố trong metrics catalog |
| D-14 | Requester được xem tài sản đang được cấp và ticket của mình liên quan; Technician xem tài sản phục vụ ticket nhóm | Hạn chế lộ hồ sơ thiết bị/nhân sự ngoài nhiệm vụ; Manager/Admin toàn bộ |
| D-15 | Từ chối bản ghi ngoài scope giống không tìm thấy; 403 cho chức năng theo role | Tránh dò tồn tại bản ghi; thông điệp UX chung và đường về an toàn |
| D-16 | Password ban đầu do Admin nhập, bàn giao qua kênh nội bộ theo D-29; không có email tự động/reset qua email | Cách cấp và bàn giao tài khoản đã chốt về nghiệp vụ. Chính sách password và hỗ trợ quên mật khẩu vẫn cần refinement trước M1 |
| D-17 | Khóa user, đổi role mất quyền IT hoặc bỏ membership cần xử lý assignment trên ticket/task đang mở; lịch sử giữ nguyên | Thu hồi quyền lập tức, không để ticket đang xử lý nằm ở assignee không còn quyền; không được khóa Admin hoạt động cuối cùng |
| D-18 | Giao diện sáng, Inter/Segoe UI, xanh dương và nhận diện riêng | Nhận diện nhất quán, phù hợp công cụ vận hành IT |
| D-19 | Không xuất báo cáo, đăng ký, nút quên mật khẩu gửi mail hoặc dark mode; phạm vi AI nay theo D-35 | Các giới hạn AI cũ được thay bởi trợ lý và automation có policy trong MVP |
| D-20 | Lịch sử: để mở stack khi chỉ làm thiết kế; nay được thay bằng D-30–D-32 | Công nghệ mục tiêu đã chốt. Cài dependency, tạo lockfile và kiểm chứng runtime vẫn thuộc M1, chưa code |
| D-21 | Ticket IT tự xử lý chưa có phản hồi hợp lệ từ người IT khác không được coi là đã đáp ứng phản hồi; dừng giám sát khi kết thúc, resume từ thời điểm tạo nếu mở lại | Làm rõ ngoại lệ của D-08, tránh timestamp giả hoặc cảnh báo tiếp trên ticket kết thúc. Cần xác nhận quy trình tự phục vụ của đội IT trước M3 |

Các quy tắc nhỏ như độ dài trường, phân trang mặc định 20/tối đa100, cửa sổ bảo hành30 ngày và nhịp worker60 giây là **giá trị đề xuất**, không phải số đã nghiên cứu từ doanh nghiệp. Điều chỉnh chúng không được thay đổi quyền, mô hình trạng thái hay mục tiêu MVP.

## Quyết định bổ sung cho chatbot AI

| ID | Quyết định | Lý do và tác động |
|---|---|---|
| D-22 | Lịch sử bổ sung trợ lý; phạm vi hiện hành theo D-33/D-35 (MVP); 8 UC/US và 3 mẫu screen có namespace AI riêng | Thay phần loại trừ AI trước đây; giữ mã use case/story và các bất biến lõi, bổ sung OPS theo thiết kế hiện hành |
| D-23 | **Đã được thay một phần bởi D-35:** Q&A/summary/nháp phản hồi vẫn chỉ đọc/nháp; cấm mutation tuyệt đối không còn áp dụng cho tạo ticket đã xác nhận và automation có policy | Giữ state/validation/version/SLA; service, không model, kiểm tra quyền và ghi |
| D-24 | Feature flag và provider adapter độc lập; thiếu cấu hình thì không bật | Không làm startup/core/worker phụ thuộc dịch vụ AI; production vendor/model Cần quyết định; không thêm dependency trong đợt tài liệu |
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
| D-30 | Next.js App Router/React/TypeScript frontend; FastAPI/Python REST backend; modular monolith trong một repo | FastAPI sở hữu API và nghiệp vụ; Next.js sở hữu frontend. Giữ ranh giới modular monolith; [tech stack](../technical/tech-stack.md) |
| D-31 | PostgreSQL + SQLAlchemy synchronous Session + Alembic/Psycopg 3; PostgreSQL server sessions, pwdlib Argon2id, CSRF | FastAPI sở hữu xác thực/quyền; maintained hashing library không thay dịch vụ session end-to-end. Bắt buộc test phiên, CSRF, scope, transaction/version; [kiến trúc](../technical/architecture.md) |
| D-32 | Celery, một Beat 60 giây, Redis broker; private local/S3; pnpm/uv, Compose/Linux và bộ test đã chọn | PG giữ SLA/violation/dedup, không phụ thuộc UI/Redis làm nguồn chuẩn; worker Linux cả khi dev Windows. Version ứng viên được tra metadata nhưng phải resolve/build/test/lock tại M1; [phiên bản](../technical/version-baseline.md) |
| D-33 | Trợ lý AI tích hợp thuộc phạm vi triển khai và nghiệm thu MVP; bật/tắt là lựa chọn vận hành, không phải loại trừ khỏi phạm vi | AI thuộc phạm vi nghiệm thu MVP; bật/tắt là lựa chọn vận hành. Giữ 8 UC/US trợ lý và quyền/nguồn/visibility; D-35–D-38 mở rộng automation và KB. D-23 cũ chỉ còn áp dụng phần đọc/nháp. Phải đạt 8 AC AI, 12 ca kiểm chứng và regression lõi trước bàn giao MVP; provider/model/SDK và chính sách dữ liệu production cần chốt; thử M3 chỉ trong phạm vi D-39, hiện chưa có chatbot chạy thật |

## Quyết định cập nhật 31/10/2026 — chuẩn hiện hành

Các quyết định hiện hành xác định AI trợ lý và điều phối, KB/RAG trong MVP cùng lộ trình M0–M5. “Đã chốt mục tiêu” không có nghĩa đã code hoặc đã nghiệm thu.

| ID | Trạng thái | Quyết định và tác động |
|---|---|---|
| D-34 | Đã chốt phạm vi công việc hiện tại | Giai đoạn hiện tại chỉ hoàn thiện tài liệu thiết kế; chưa triển khai code/migration/dependency/test ứng dụng hoặc cấu hình vận hành. M0–M5 mô tả kế hoạch phát triển, không tự kích hoạt lập trình |
| D-35 | Đã chốt mục tiêu MVP | AI gồm trợ lý và điều phối tự động. Giữ hỏi đáp/tra cứu/tóm tắt/nháp phản hồi; tạo ticket qua hội thoại sau user xác nhận. Plan/giao/theo dõi/giao lại qua service trong policy; thay cấm ghi toàn cục D-23 |
| D-36 | Đã chốt mục tiêu | Ticket tiếp nhận/SLA khác task thực thi; plan có phiên bản/DAG, một version hiệu lực; kỹ năng xác nhận/lịch/capacity/remaining work, manual override/lock |
| D-37 | Đã chốt phạm vi | KB/RAG trong MVP: Draft/Published/version/ACL/citation; PostgreSQL + pgvector; index nền không thay kiểm quyền hiện tại |
| D-38 | Đã chốt nguyên tắc | Default deny, AI_COORDINATOR gắn policy/grantor, recheck quyền/policy/version/capacity mỗi action; outbox/retry/idempotency/audit, approval stale bị chặn, không giữ lock qua model call |
| D-39 | Đã xác nhận riêng cho thử nghiệm; chưa cho chạy trong đợt tài liệu | M3 ban đầu dùng OpenAI API/gpt-5-mini, tối đa 5 USD tổng cả retry/embedding, chỉ dữ liệu DEMO và DB test. text-embedding-3-small chỉ là đề xuất nếu thử RAG, cần xác minh. Không tự tăng trần/chuyển model đắt hơn. Phải kiểm model access/billing/quota/pricing trước chạy; không key chat/log/repo. Không áp cấu hình này cho production |
| D-40 | Cần quyết định trước triển khai phần liên quan | Bảng bên dưới là danh sách mở; các giá trị đề xuất không thành chính sách doanh nghiệp chỉ vì xuất hiện trong tài liệu |
| D-41 | Đã được người dùng xác nhận về vai trò | IT_MANAGER là Trưởng phòng IT; không có vai trò/cấp Trưởng nhóm IT riêng. AI điều phối theo policy; Trưởng phòng IT thiết lập chính sách, giám sát, can thiệp và duyệt ngoại lệ. Nhân viên IT thực hiện chuyên môn; Team là nhóm chuyên môn. Trưởng phòng ban khác dùng Requester khi gửi yêu cầu. Ảnh hưởng scope, permissions, research, nội dung UI và sơ đồ |

### D-40 — Các điểm còn mở

| Nội dung | Trạng thái / hướng xử lý |
|---|---|
| Production provider/model/embedding và SDK | Cần quyết định theo chất lượng, dữ liệu và ngân sách; D-39 không phải phê duyệt production |
| Giá/quota/quyền model lúc chạy M3 | Cần xác minh thực tế; hiện chưa key/billing/model-call evidence; nếu không khả dụng báo phương án/chi phí, không tự đổi model |
| Ngân sách, retention và dữ liệu được gửi provider production | Cần quyết định; demo-only không cấp quyền dữ liệu thật; không hứa no-retention/no-training khi chưa có thỏa thuận |
| Capacity kỳ/slot, giờ làm/ngân sách ngày, lịch nghỉ và người xác nhận kỹ năng | Cần quyết định giá trị vận hành; BR-16 nêu công thức và yêu cầu bảo thủ khi thiếu dữ liệu; seed demo phải gắn nhãn |
| Scope workflow/nhóm/priority/action, hạn tự chỉnh và tần suất nhắc | Cần manager cấu hình/phê duyệt trước bật; mặc định chưa cấp quyền |
| Template, skills taxonomy, công sức mẫu | Cần quản lý xác nhận dữ liệu ban đầu; không dùng estimate model chưa xác thực để tự giao |
| KB author/publisher/ACL, chunking/embedding dimension/index freshness | Cần refinement; thu hồi ACL hiệu lực tức thì là nguyên tắc đã chốt |
| Retention/redaction chat/run/action/audit; quyền điều tra sự cố | Cần quyết định; không mặc định Admin được đọc mọi chat hoặc log prompt/body |
| Inventory reservation | Cần quyết định có giữ chỗ không, TTL/thu hồi/owner và tương tác cấp phát; không đồng nhất reservation với assignment |
| Password/bootstrap/reset không email và D-12/D-17 bàn giao assignee mất quyền | Cần refinement chi tiết; quyền thu hồi ngay/không khóa Admin cuối vẫn giữ |
| Thu hồi quyền khẩn khi chưa có người nhận bàn giao hợp lệ | Cần quyết định quy trình và cách giữ invariant cho ticket In Progress/Pending, task đang làm/lock; không giữ quyền đã thu hồi hoặc báo khóa thành công giả. Nhánh chưa giải quyết được đánh dấu tại Flow 5/FIG-FLOW07 |
| DB lock granularity/isolation, exact idempotency keys, grant ngoại lệ sau duyệt và retry/backoff | Cần review schema trước code; bắt buộc atomic, không trùng/vượt tải và không giữ lock lúc model chờ |
| OpenAPI DTO/vocabulary và DBML vật lý | Đã có hợp đồng tĩnh design-draft; cần review field/projection, tên cookie, exact schema/nullable/index/FK và phần trường chưa có trong view chọn lọc trước code. Artifact mới không tự phê duyệt schema/DTO hoặc tạo migration |
| Backup retention/RPO/RTO, môi trường deploy, owner vận hành | Cần quyết định/đo sau triển khai; daily backup/restore rehearsal là mục tiêu |

Các sơ đồ/SVG/XMind là tài liệu, không bằng chứng implementation. [Lộ trình M0–M5](../09-design-readiness.md) thay phân bổ mốc cũ; những bản archive cũ chỉ phục vụ lịch sử.
