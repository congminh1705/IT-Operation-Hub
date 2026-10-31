---
id: itoh-docs-technical-architecture
title: "Kiến trúc mục tiêu và vận hành dự kiến"
type: reference
domain: architecture
module: system
tags: [architecture, system, reference]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Định nghĩa component/service boundary, giao dịch, bảo mật và vận hành mục tiêu."
---

# Kiến trúc mục tiêu và vận hành dự kiến

**Thiết kế mục tiêu · Chỉ thiết kế; chưa có ứng dụng hoạt động.** Không tạo/sửa code, migration hoặc cấu hình trong đợt này. [Stack](tech-stack.md) giữ Next.js/React/TypeScript và FastAPI/SQLAlchemy/Alembic/PostgreSQL; Celery/Redis. Các tên bảng/tool/route là thiết kế.

## 1. Modular monolith và trách nhiệm

Một repo, frontend/backend riêng ở các thư mục hiện có. Next.js chỉ giao diện, FastAPI sở hữu REST `/api/v1` và nghiệp vụ; API và worker dùng chung service/Session đồng bộ riêng theo request/task. Không chuyển Django ORM hoặc đưa domain vào Next.js.

| Thành phần | Trách nhiệm |
|---|---|
| Frontend | Form, bảng, trạng thái, URL filters, polling mặc định 30 giây khi tab hoạt động; không nguồn quyền/DB |
| Nginx | Cùng domain: /api/ → FastAPI, phần còn lại → frontend; TLS, hạn mức body |
| API/router/schema | HTTP, xác thực, input/output schema, lỗi; không gom toàn bộ domain vào router |
| Service/repository/model | Quyền, state machine, transaction/version/capacity, truy vấn scoped; repository không tự commit tách |
| Celery worker / một Beat | Outbox, AI, đánh giá lại, SLA mỗi 60 giây, notification, indexing; tách queue AI khỏi SLA |
| PostgreSQL + pgvector | Domain, session, outbox/dedup, audit, run/action/approval, KB/version/ACL/chunks/vector |
| Redis | Broker, không nguồn dữ liệu chuẩn hoặc nơi duy nhất giữ event/session |
| Provider adapter | Sinh plan/ranking/output schema, embedding; không quyền ghi database |
| Local private / S3 private | Tệp ngoài public; API kiểm tra quyền cha mỗi lần tải |

Giữ auth/users/teams/tickets/sla/assets/notifications/reports/audit; bổ sung work_management, workforce, automation, ai_assistant, knowledge. Không tách thành microservice.

[C4 Documentation C1–C4](../architecture/c4/README.md), [code structure](code-structure.md), [OpenAPI](../api/README.md) và [DBML/ER](../database/README.md) làm rõ artifacts thiết kế; không tạo runtime/module thật.

### Các góc nhìn và ranh giới module

[FIG-CTX01, FIG-CNT01, FIG-SEQ01/02 và FIG-DEP01](../diagrams/architecture.md) lần lượt mô tả context, container, sequence transaction/model/phê duyệt và triển khai dự kiến. Đây là các mức nhìn khác nhau của cùng kiến trúc, không dùng mind map làm sơ đồ deployment hoặc ERD làm sơ đồ component.

| Module sở hữu dữ liệu | Hợp đồng và trách nhiệm | Phụ thuộc được phép |
|---|---|---|
| auth / users / teams | Phiên, người dùng, tổ chức, membership và cấp/thu hồi quyền | Cung cấp principal/scope; phát sự kiện thay đổi quyền |
| tickets / sla | Ticket, hội thoại, tệp cha, snapshot/clock/violation | Auth; service tệp riêng tư; không giao quyền ghi trực tiếp cho model |
| work_management | Plan/version, Task/DAG, transition và assignment | Workforce/capacity, policy, ticket reference; không tự đóng ticket |
| workforce | Kỹ năng xác nhận, lịch/absence, capacity và allocation | Users/teams; transaction phối hợp assignment theo thứ tự khóa thống nhất |
| automation | Policy/grant, run/action, approval, outbox delivery và dedup | Domain services; chỉ thực thi intent đã kiểm quyền/versions |
| ai_assistant / knowledge | Hội thoại/nháp/xác nhận, KB version/ACL/chunk và adapter | Scoped read services; mutation qua domain service; không SQL/shell từ model |
| assets / notifications / reports / audit | Tài sản, người nhận, chỉ số và dấu vết | Truy vấn đúng scope; effect phát từ domain transaction, không dựng số liệu từ output model |

Router không truy cập repository của module khác để bỏ qua domain service. API và worker cùng dùng hợp đồng service, không gọi qua HTTP nội bộ để giả một phiên Admin. Ranh giới này là thiết kế, chưa phải cấu trúc package đã có.

## 2. Xác thực và phạm vi

Session opaque server-side lưu hash trong PG, cookie HttpOnly/host-only/Path=/, SameSite=Lax và Secure production; không token localStorage. Argon2id qua pwdlib. CSRF cho mutation/login, kiểm tra Origin/Referer allowlist; SameSite không thay CSRF. Thu hồi mọi phiên khi khóa user, xoay phiên khi đăng nhập/thay đổi bảo mật; role/membership/active kiểm tra theo request. Bootstrap/password/reset không email cần quyết định chi tiết D-40.

R/T/M/A theo [ma trận quyền](../requirements/permissions-matrix.md). Trợ lý dùng actor user; nền dùng AI_COORDINATOR gắn grantor/policy/scope. Không giả Admin/Manager. Requester không nhận nội bộ/nhân lực/plan/audit AI. Scope áp dụng trước list/count/lookup/report, download và history/cache; ngoài scope trả 404 chung, cấm chức năng trả 403.

### Trust boundary và tình huống đe dọa

| Boundary / rủi ro | Kiểm soát thiết kế | Bằng chứng cần có khi triển khai |
|---|---|---|
| Browser → API: giả role, IDOR, CSRF | Principal từ phiên; role/scope server; CSRF/Origin; field projection trước response | Negative API test với ID người khác, count/lookup/download và phiên cũ |
| Nội dung ticket/KB → model: prompt injection | Nguồn là dữ liệu chưa tin cậy; tool allowlist/schema; không secret/shell/SQL; quyền không do prompt quyết định | Bộ injection và tool args giả quyền; không có domain effect trái phép |
| Model/worker → domain: TOCTOU, trùng effect | Revalidate grant/policy/ACL/version/capacity trong transaction; unique business keys | Đổi policy/lịch/quyền trong lúc model chờ; hai worker và crash trước ack |
| Public ↔ internal: lộ hội thoại/tệp/citation | Phiên AI tách visibility; scoped source trước provider và kiểm lại trước hiển thị | Thu hồi quyền khi stream/index pending; kiểm history/cache và link nguồn |
| Tệp → storage/browser: giả MIME, public access | Allowlist/signature/size; private object; download kiểm quyền cha, attachment/nosniff | MIME giả, boundary size/count, quyền tệp note và object không qua API |
| Secrets/log/provider: rò dữ liệu và chi phí | Secrets ngoài repo/log; redaction; egress data policy; ledger reservation và bounded retry | Quét response/log; concurrent budget/timeout unknown; không tự tăng model/budget |
| Backup/restore: replay và lộ bản sao | Quyền/mã hóa; restore cách ly, dừng outbound/worker; đối chiếu ledger/dedup | Diễn tập không gọi provider hoặc tạo assignment/notification cũ lần hai |

Rate limit cụ thể, session TTL, retention, scanner tệp bổ sung nếu áp dụng, incident owner và SLO production cần quyết định trước vận hành tại D-40; không tự tuyên bố tuân thủ tiêu chuẩn bảo mật hoặc kết quả pentest.

## 3. Transaction và đồng thời

Mỗi mutation ghi domain + audit + outbox nguyên tử, rollback toàn bộ nếu lỗi. UUID nội bộ/mã hiển thị unique theo cơ chế an toàn; không MAX+1. Expected version cập nhật có điều kiện, conflict 409, không ghi đè âm thầm. Dùng SQLAlchemy version/khóa phù hợp, không coi ORM version tự bảo vệ bulk update.

Plan nhiều phiên bản/ticket, unique có điều kiện bảo đảm chỉ một phiên bản effective. Dependency cùng plan, DAG, không tự bắt đầu khi predecessor chưa Done. AssetAssignment chỉ một lượt chưa thu hồi/asset bằng partial unique + transaction. Mọi kiểm tra và giữ chỗ nguồn lực phải atomic, không chỉ kiểm tra UI.

Assignment khóa các hàng nhân lực/allocation liên quan theo thứ tự xác định, re-read load/calendar/skills rồi ghi; thay lịch/kỹ năng/assignment cũng tuân thủ thứ tự khóa đó. Chỉ khóa nguồn lực cần thiết, không mặc định khóa toàn bộ user. Lock granularity, isolation và thứ tự khóa vật lý phải được review ở refinement trước M1/M2; chưa có DDL/migration.

## 4. Tách model call khỏi giao dịch

Domain transaction → OutboxEvent → worker claim/lease + Run → snapshot nguồn/candidates/versions → kết thúc transaction đọc → adapter model → schema/semantic validation → transaction mới khóa/re-read → policy/grantor/ACL/version/capacity/feasibility → service tool → domain + Action + audit + notification + outbox → commit → ack.

Không giữ connection transaction hoặc DB lock qua thời gian chờ model. Proposal lỗi/refusal/timeout không ghi task/assignment nửa vời. Snapshot cũ phải đánh giá lại. Model ranking chỉ trong candidates backend đã lọc, mỗi tool vẫn recheck; không dùng đề xuất model làm quyền.

## 5. Event, outbox, retry và chống trùng

| Sự kiện dự kiến | Nguồn transaction | Tác vụ tiếp theo |
|---|---|---|
| ticket.created / information.updated | Ticket/confirmed command | Kiểm tra đầu vào, lập plan hoặc hỏi thiếu |
| plan.activated / task.assigned | Work service | Notification và quan sát; allocation/audit đã commit cùng assignment |
| task.progressed / blocked / completed | Người cập nhật qua service | Unlock dependency, rà nguy cơ, báo cáo; không tự đóng ticket |
| availability.changed / skills.changed / membership.changed | Workforce/quản trị | Xác định task ảnh hưởng, replan trong policy hoặc approval |
| sla.risk / deadline.risk / load.changed | SLA/work service | Nhắc/ngoại lệ đúng scope |
| policy.changed / approval.decided | Manager service | Chặn/revalidate pending action; thực thi quyết định hợp lệ |
| knowledge.published / access.revoked | Knowledge service | Index/reindex; ACL truy vấn hiệu lực ngay |

Event lưu ID, loại, aggregate/version, actor/correlation, payload tối thiểu, createdAt. Outbox lưu trạng thái, attempt, lease/token, nextAttemptAt, deliveredAt/error; bảng vật lý có thể tách event và delivery. Publisher quét pending/lease hết hạn rồi gửi broker; có thể gửi lặp. Consumer claim theo event + handler/purpose và dedup action nghiệp vụ trong DB. Kết quả commit được đọc lại khi retry sau ack lỗi.

Khóa idempotency đề xuất: confirmed-ticket = actor + key + content digest; run = event + purpose; action = run + intent + target + version; allocation = task + plan revision; notification = business event + recipient + type; SLA giữ BR-10. Cùng key khác nội dung trả conflict. Khóa business key cụ thể phải chốt theo schema, không chỉ dùng Celery task ID hoặc Redis lock.

Lỗi tạm thời backoff có jitter, số lần/timeout cấu hình hữu hạn; lỗi quyền/schema/stale/không khả thi không retry mù mà đánh giá lại hoặc chuyển quản lý. Hết retry vào failed/dead-letter có lý do, người có quyền retry bằng thao tác audit; không tạo action mới nếu intent đã thành công. Queue outage phục hồi từ PG, không mất event. Outbox không bảo đảm exactly-once delivery; cần hiệu ứng nghiệp vụ chống trùng.

[EVT01–EVT17 và event envelope](api-design.md#hợp-đồng-sự-kiện-nội-bộ) là catalog tên/producer/consumer; bảng trên là tóm tắt kiến trúc. Allocation và audit của assignment phải được ghi ngay trong transaction thực hiện assignment; consumer sau commit chỉ gửi thông báo/đánh giá tiếp, không bổ sung allocation bắt buộc một cách không nguyên tử.

## 6. Workforce và lập kế hoạch

Nguồn và công thức ở BR-16; dùng phút, lịch và khoảng cụ thể. Allocation nhiều kỳ được tách theo giao của kỳ/lịch; tổng công sức phân bổ bằng remaining, không đếm lại toàn bộ effort cho từng kỳ. Absence chồng nhau trừ theo hợp khoảng; dữ liệu thiếu không coi là rảnh. Task chưa phân bổ là rủi ro hiển thị, không bị bỏ khỏi báo cáo.

Kiểm tra cả tải, lịch kỹ năng/nhóm, predecessor, deadline và cam kết/SLA; capacity tổng đủ không tự chứng minh lịch khả thi. Độ dài kỳ, daily budget, timezone lịch và mức độ chi tiết slot là Cần quyết định D-40; thiết kế không tự coi ví dụ demo là policy doanh nghiệp.

## 7. Approval và can thiệp

Proposal có before/after, lý do/tác động, record/policy/workforce/plan versions và nguồn. Pending → Approved/Rejected/Expired/Superseded; execution tách Pending/Running/Succeeded/Failed/Conflict. Duyệt là quyết định, không tự đồng nghĩa thay đổi thành công. Approval + execution đều kiểm tra quyền/policy hiệu lực/capacity/version; stale tạo Conflict hoặc proposal mới, không tự áp dụng.

Manager tắt policy hoặc khóa assignment phải có hiệu lực trước action ghi. Tôn trọng quyết định thủ công; mọi override lưu actor/lý do. Hoàn tác dùng compensating action hợp lệ, không xóa history hoặc lùi task Done.

## 8. SLA, tài sản, KB và tệp

SLA ticket giữ 24/7, snapshot P1–P4, pause resolution khi Pending, resume phần còn lại, không reset do chuyển nhóm/đổi người. First response là public IT comment hợp lệ; chat/automation reminder không tính. Worker/API dùng chung service, breach/dedup DB, quét mỗi 60 giây. Task calendar không thay SLA.

Inventory/assignment là nguồn thực; thiếu thiết bị mở ngoại lệ. Reservation nếu áp dụng phải có vòng đời riêng khỏi cấp phát, TTL/thu hồi/audit và chống hai plan giữ cùng tài sản; chi tiết reservation Cần quyết định trước schema, không mặc định AI tự cấp phát.

KB Article → immutable Version → Chunk/Embedding và ACL. Published/quyền/version lọc tại SQL trước retrieval, recheck trước provider/render. Worker index/reindex chỉ cập nhật vector, không nguồn quyết định ACL. pgvector là stack mục tiêu; embedding provider/dimension/chunking/reranking và SLA index cần chốt, không gọi keyword lookup là RAG hoàn chỉnh.

Tệp PNG/JPEG/WebP/PDF, ≤10.000.000 byte/tệp, ≤5/lần; kiểm nội dung/signature, không tin MIME/filename. Private local dev/S3 production, download qua auth/scope, attachment/nosniff; không public URL. Stage/finalize/reconcile object mồ côi; PG không rollback S3. Timestamp UTC aware; ngày thuần date không ép timestamp; hiển thị Asia/Ho_Chi_Minh.

## 9. Vận hành và khôi phục — kế hoạch

Production mục tiêu: Nginx, frontend, API, Celery worker, một Beat, PG và Redis trên Linux; S3 private. Worker Linux kể cả dev Windows. Health/liveness tách readiness DB/broker/provider; provider lỗi không làm core mất khả dụng. JSON log/request ID/event/run/action correlation; không password/session/key/prompt nhạy cảm. Giám sát outbox lag, failed runs, approval tồn, queue depth, SLA scan delay và usage.

Migration một lần mỗi release trước traffic, backup trước thay đổi; review forward/backward compatibility, không để replica tự migrate. CI tương lai: frozen lock, lint/typecheck, test, migration DB sạch/nâng cấp, OpenAPI/type drift, build/E2E; không có pipeline/config thực thi ở đợt này.

Backup PG hằng ngày cùng private files/object versions, kiểm quyền/mã hóa/retention theo D-40; giữ KB/history/event/audit/usage. Restore vào môi trường cách ly, chặn outbound model/email và pause worker trước phục hồi; restore DB + files, kiểm migration/references/count/SLA/outbox, xác minh action cũ không replay, rồi cho worker tiếp tục có kiểm soát. Chỉ đổi traffic sau kiểm tra; diễn tập định kỳ. RPO/RTO, retention, owner lịch diễn tập: Cần quyết định, chưa cam kết.

Dữ liệu/tài khoản demo và database test tách production. Cấu hình kiểm thử AI giới hạn demo/5 USD ở D-39 không cấp quyền gửi dữ liệu thật. Chưa có triển khai, backup hoặc restore đã chạy.

### Trình tự phát hành và khôi phục dự kiến

| Bước | Điều kiện / hành động dự kiến | Điểm kiểm soát |
|---|---|---|
| Trước phát hành | Xác nhận được phép triển khai, cấu hình/secret đúng môi trường, kiểm tương thích và backup đọc được | Chưa thực hiện; không dùng hồ sơ thiết kế thay phê duyệt chạy production |
| Migration | Một tiến trình nâng cấp schema; kiểm trước/sau và tương thích API/worker | Nếu lỗi, dừng mở traffic; rollback/forward-fix phải dựa phương án migration đã review |
| Mở ứng dụng | Kiểm DB/storage/session, khởi động API/frontend rồi worker và một Beat | Readiness lõi khác tình trạng broker/provider; feature flag AI không chặn core |
| Theo dõi | Request errors/latency; queue depth, outbox lag, lease hết hạn, scan delay, failed actions, approval age, usage/reserved cost | Ngưỡng cảnh báo và người trực chưa chốt; không mặc định mọi event xử lý trong 60 giây |
| Tạm ngưng automation | Disable policy/feature flag, chặn effect mới tại service; giữ run/error/audit | Không xóa pending event hoặc ghi giả thành công; lịch sử không bị mất |
| Phục hồi | Chọn backup, cách ly môi trường, pause worker và outbound, restore DB/tệp nhất quán | Kiểm reference/count/checksum khi có, clock/snapshot/usage/dedup; không replay action đã thành công |
| Cho chạy lại | Kiểm quyền/policy hiện hành, lease và pending backlog; mở worker có kiểm soát rồi traffic | Ghi evidence, người quyết định và giới hạn RPO/RTO thực đo; chưa có kết quả diễn tập |

### Tradeoff và điều kiện còn mở

Modular monolith giảm số ranh giới triển khai nhưng đòi hỏi giữ kỷ luật service và transaction. Session PG và outbox đặt tính bền vững tại một nơi nhưng làm DB thành phụ thuộc lõi. Celery/Redis chấp nhận redelivery nên cần idempotency ở DB. Model ngoài transaction tránh giữ lock dài nhưng bắt buộc kiểm lại snapshot; dùng model không thay thuật toán kiểm khả thi. pgvector gom quyền và nguồn vào PG nhưng embedding/index freshness vẫn cần quyết định riêng.

Các hệ quả này truy về D-30–38 và NFR14–25; topology HA, isolation/lock vật lý, retention/SLO và provider production còn ở D-40. Không đổi stack để lấp chi tiết chưa chốt.

## 10. Thiết kế giới hạn chi phí kiểm thử AI — chưa chạy

Trước request có phí phải xác minh quyền model/billing/quota/giá, nội dung demo-only và DB test. D-39 cho trần tổng 5 USD cả generation/embedding/retry; không tự đổi model đắt hơn. Cấu hình max calls/input/output/retries/concurrency và phần dự phòng phải được xác định trước chạy, không lấy provider timeout làm lý do chạy tiếp không giới hạn.

Ledger giữ actualSpent + reservedInFlight + unknownCost theo transaction/lock ngân sách. Reserve upper bound bảo thủ từ giới hạn token/giá hiện hành trước gửi, kể cả reasoning/cached/embedding theo cách provider tính. Chỉ phát request nếu tổng cộng reservation mới còn dưới trần sau trừ safety margin; retry là request mới phải reserve riêng. Khi timeout không có usage xác định thì giữ khoản bảo thủ, không tự giải phóng như 0 USD. Usage có nguồn mới settle và đối chiếu billing; báo riêng phí đo được/ước lượng/unknown. Chưa có lượt gọi, ledger hoặc billing evidence thực tế.

## Tài liệu liên quan

[SQLAlchemy versioning](https://docs.sqlalchemy.org/en/21/orm/versioning.html), [Celery tasks](https://docs.celeryq.dev/en/stable/userguide/tasks.html) là tài liệu kỹ thuật tham khảo; không thay bằng chứng kiểm thử sau triển khai. [API thiết kế](api-design.md) · [ERD](../requirements/conceptual-data-model.md) · [quyền](../requirements/permissions-matrix.md).
