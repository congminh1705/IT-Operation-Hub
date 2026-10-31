---
id: itoh-docs-09-design-readiness
title: "Trạng thái thiết kế và lộ trình M0–M5"
type: planning
domain: project
module: delivery
tags: [project, delivery, planning]
priority: 1
status: planned
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Mô tả lộ trình, epic/phụ thuộc và kế hoạch kiểm chứng; không cấp lệnh code."
---

# Trạng thái thiết kế và lộ trình M0–M5

**Đợt hiện tại CHỈ tài liệu.** M1–M5 là kế hoạch, không lệnh khởi tạo code, dependency, migration, test hoặc cấu hình vận hành. Thứ tự này thay lịch M1–M6 cũ để đưa AI automation vào M3. Đã đặc tả không đồng nghĩa đã đạt gate phần mềm.

## M0 — Hoàn thiện thiết kế

Hoàn thiện scope/features/roles, UC/US/AC, state/quyền, kiến trúc/ERD/API, AI/policy/approval, worker/events/retry/security/audit, UI, kế hoạch kiểm thử/vận hành và sơ đồ. Nội dung được quản lý trực tiếp trong tài liệu nguồn theo từng chủ đề.

Artifacts M0 hiện có: [DBML/ER Mermaid](database/README.md), [OpenAPI document](api/README.md), [C4 C1–C4](architecture/c4/README.md) và [cấu trúc folder/file mục tiêu](technical/code-structure.md). Đây là design draft; contract/schema vật lý phải review theo D-40, chưa tạo code/migration/manifest/test thực thi.

Kiểm tra cấu trúc tài liệu, liên kết và tính nhất quán giữa mã yêu cầu/sơ đồ; không chạy test ứng dụng hoặc gọi model. Các điểm chưa chốt nằm trong D-40. [Trạng thái hồ sơ](review-report.md) tổng hợp độ phủ và giới hạn kiểm chứng.

## Lộ trình triển khai tương lai

| Mốc | Kết quả mục tiêu | Gate nghiệm thu tương lai |
|---|---|---|
| M1 — Nền tảng | DB/auth/CSRF/scope; users/teams/skills/calendar; ticket/task thủ công; audit | Session revoke/scope/state/estimate chuẩn, migration và persistence được kiểm chứng |
| M2 — Quy trình xác định | Plan version/DAG, template Published, policy/default deny, candidate/capacity, outbox/worker, approval/idempotency | Input cấu trúc chạy xuyên suốt; 2 workers/retry không trùng/vượt tải, stale/manual lock đúng |
| M3 — AI automation | Adapter schema, hiểu yêu cầu, lập plan/rank/tool actions, theo dõi/replan, onboarding và ngoại lệ | Model thật + action/dữ liệu lưu thật trong DB test, đủ success/exception paths; bounded cost, injection/provider lỗi an toàn |
| M4 — Vận hành đầy đủ | SLA/notification, assets/files, KB/RAG và trợ lý, dashboard/report | 47 AC lõi/8 AC-AI và MET source/scope/KB permissions được chứng minh; không UI giả |
| M5 — Nghiệm thu | Quyền/concurrency/model, E2E/responsive/accessibility, backup/restore, CI/deploy/runbook/demo | A1–A13 + toàn bộ AC liên quan; README clean setup/upgrade/recovery và kết quả thực tế |

M1 có thể chuẩn bị snapshot SLA/inventory/KB tối thiểu để M3 đủ dữ liệu; M4 hoàn thiện các nghiệp vụ này. Không dồn toàn bộ AI cuối dự án; không bỏ core scope để đạt riêng demo.

## Kế hoạch kiểm chứng — chưa chạy

### Entry, môi trường và bằng chứng

Entry của giai đoạn kiểm thử ứng dụng: có yêu cầu triển khai riêng, slice/code và môi trường test đã sẵn sàng; quyết định ảnh hưởng slice được chốt; dữ liệu tổng hợp có nhãn DEMO, không credential hoặc dữ liệu thật. PostgreSQL thật kiểm chứng các bảo đảm PostgreSQL; fake clock dùng cho SLA. Provider mock kiểm nhánh tự động nhưng không thay kiểm chứng model thật tại A11.

Mỗi kết quả sau này cần commit/build/môi trường, fixture, bước chạy, expected/actual, log đã redaction, test report và lỗi còn mở. Hiện tất cả nhóm dưới đây là **PLANNED / NOT RUN**; không có số liệu pass rate, chi phí hoặc benchmark thực tế.

| Nhóm kiểm chứng | Điều kiện và expected result | Nguồn / evidence tương lai |
|---|---|---|
| Quyền/session/CSRF | Đổi user/team/quyền, dùng phiên cũ và gọi API trực tiếp: từ chối đúng scope, không leak count/tệp/chat | NFR01/02/15/22, ma trận quyền; API negative report |
| State và SLA | Các cạnh hợp lệ/sai, Pending/reopen/priority, clock cố định: không reset thời gian/vi phạm | BR-04/08–10/15, TC-SLA01–12; state/clock report |
| Transaction/concurrency | Hai worker phân cùng task/nguồn lực, hai người cấp asset: chỉ effect hợp lệ, không vượt capacity | NFR03/19, AC-OPS04–07, BR-11/14/16; PostgreSQL integration report |
| Outbox/retry | Crash sau commit trước ack, event lặp/lệch thứ tự, broker down: không mất event hoặc nhân effect, scan bù | NFR21, TC-OPS, BR-19; DB facts + worker trace |
| Model và tool | Thiếu dữ liệu/nhân lực, schema lỗi/cycle/injection/provider timeout: không bịa nguồn hoặc ghi trái quyền | TC-AI01–12, TC-OPS01–12, A1–A11; model/output/action traces |
| Approval/manual control | Duyệt stale, revoke policy khi model chờ, task đang làm/khóa: chặn hoặc lập đề nghị mới | BR-17/18, NFR18/25; trước/sau và decision/execution riêng |
| KB/RAG | ACL đổi khi index/model pending, citation phiên bản cũ: không provider/render nguồn mất quyền | BR-21, NFR22, AC-OPS11; retrieval/ACL evidence |
| Usage/budget | Concurrent request/retry/timeout unknown: reserve bảo thủ và dừng trước trần | NFR23, D-39; ledger và usage/billing có nguồn, không ước lượng thành actual |
| UI/UX/a11y | 320/390/768/1440, bàn phím/zoom/reflow/reduced motion, form lỗi và cache đổi user | NFR07–09/16/26; Playwright và review thủ công, kế hoạch UX riêng |
| Persistence/restore | Restart, restore cách ly DB/tệp, chặn outbound và replay cũ: dữ liệu nhất quán, không effect ngoài ý muốn | NFR04/21/24; recovery evidence và RPO/RTO thực đo |

### Phương pháp theo lớp

- Backend: pytest/HTTPX; PostgreSQL thật cho transaction/locks/partial unique/concurrency, không dùng SQLite chứng minh bảo đảm PG.
- Frontend: Vitest/RTL cho giữ form, field errors, polling/cache/user switch; Playwright cho requester → IT/task → nghiệm thu và nghỉ phép/approval.
- AI: bộ cố định gồm rõ ràng/thiếu dữ liệu/thiếu người/cycle/nghỉ đột xuất/vượt quyền/lặp/stale/provider lỗi/prompt injection. Tách lỗi model và domain execution; mock chỉ cho test tự động phù hợp, không thay A11.
- Core: giữ 47 AC, 10 AC-X, 12 TC-SLA; hỗ trợ 8 AC-AI/12 TC-AI; điều phối AC-OPS01–12 và A1–A13.
- Ops: clean setup, migration một lần/release, persistence restart, outbox replay, restore cách ly và đối chiếu dữ liệu; không cam kết RPO/RTO khi chưa chốt/đo.
- UX/research: phỏng vấn/tree test/usability/keyboard/responsive chưa thực hiện. 16 UI SVG + 2 board hiện có chưa phủ mọi SCR-OPS bằng hi-fi riêng.

## Điều kiện bước sang lập trình

### Cấu trúc kế hoạch và phụ thuộc

Kế hoạch ở trạng thái **ROADMAP_DRAFT / chưa kích hoạt triển khai**. Các mục tiêu M1–M5 đã được mô tả nhưng chưa phải lệnh thực thi. Mỗi epic dưới đây là **EPIC_PROPOSED**; chưa có task triển khai được sinh hoặc bắt đầu. Owner sản phẩm là chủ đề tài; người phụ trách thực hiện/kiểm chứng cần được phân khi có yêu cầu triển khai riêng.

| Epic | Mốc | Phạm vi / kết quả nghiệm thu | Phụ thuộc |
|---|---|---|---|
| E01 | M1 | Identity/session/CSRF/quyền/quản trị và thu hồi phiên đúng NFR01/02/15 | M0 và quyết định auth ảnh hưởng slice |
| E02 | M1 | Workforce/kỹ năng/lịch/absence và dữ liệu demo có provenance | E01, quyết định capacity/skill D-40 |
| E03 | M1 | Ticket/task thủ công, state, persistence và audit | E01; E02 cho assignment có capacity |
| E04 | M2 | Plan version/DAG, Published templates, policy/default deny | E02/E03 |
| E05 | M2 | Outbox/idempotency/approval/concurrency, manual lock và recovery | E04; BR-18/19 được refinement |
| E06 | M3 | Provider adapter, plan/rank/tool/replan với model thật trong giới hạn D-39 | E05; model/billing/quota/pricing được xác minh khi được phép chạy |
| E07 | M3–M4 | Nguồn KB tối thiểu cho E06; đầy đủ trợ lý/KB/RAG/ACL/citation ở M4 | E01/E04; schema/ACL nguồn tối thiểu không chờ toàn bộ M4 |
| E08 | M4 | SLA worker, notifications, files và assets đầy đủ | E03/E05; dữ liệu tối thiểu đã có cho E06 |
| E09 | M4 | Dashboard/report/usage từ dữ liệu thật đúng MET/quyền | E06/E07/E08 |
| E10 | M5 | Hồi quy/E2E/security/UX/restore và bộ bằng chứng A1–A13 | E01–E09; không thay toàn bộ AC bằng demo thành công |

M3 phụ thuộc **phần nguồn tối thiểu** của E07, không phụ thuộc E07 hoàn tất toàn bộ; đây là phụ thuộc sản phẩm theo phần bàn giao, tránh vòng M3 chờ M4. Không tạo Task của hệ thống IT từ các epic của kế hoạch phát triển: hai khái niệm khác nhau.

### Exit và điều kiện chuyển giai đoạn

Người dùng phải yêu cầu triển khai riêng. Sau đó refinement những chi tiết Cần quyết định ảnh hưởng lát cắt, resolve/pin dependency và tạo lock thật, review security và schema/API. Không coi metadata package hoặc tài liệu hiện tại là dependency/runtime đã kiểm chứng.

D-39 ghi cấu hình demo M3 đã được xác nhận riêng; chỉ gọi khi được chuyển sang triển khai, có key cấu hình an toàn và kiểm billing/quota/model/pricing. Chưa có kết quả model hoặc chi phí API thực tế.
