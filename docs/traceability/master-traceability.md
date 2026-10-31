---
id: itoh-docs-traceability-master-traceability
title: "Ma trận truy vết"
type: reference
domain: quality
module: traceability
tags: [quality, traceability, reference]
priority: 2
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: derived
purpose: "Nối feature, UC, story, AC, screen, BR, contract, hình và mốc dự kiến."
---

# Ma trận truy vết

Mọi dòng ở trạng thái **DESIGNED / NOT IMPLEMENTED / NOT TESTED**. AC không đồng nghĩa test đã pass. F→năng lực, UC→use case, US→story, SCR→screen, MET→công thức chỉ số.

## Truy vết từng story

| US | F | UC | AC | SCR chính | Mốc | Nguồn quy tắc |
|---|---|---|---|---|---|---|
| US01 | F01 | UC01 | AC01 | SCR01 | M1 | BR-01 |
| US02 | F01 | UC02 | AC02 | Shell→SCR01 | M1 | BR-01 |
| US03 | F01 | UC03 | AC03 | SCR02 | M1 | BR-01 |
| US04 | F01 | UC04 | AC04 | SCR03 | M1 | BR-01 |
| US05 | F02 | UC05 | AC05 | SCR60 | M1 | BR-01 |
| US06 | F02 | UC05 | AC06 | SCR60 | M1 | BR-01 |
| US07 | F02 | UC05 | AC07 | SCR60 | M1 | BR-01,05 |
| US08 | F02 | UC06 | AC08 | SCR61 | M1 | BR-01 |
| US09 | F03 | UC07 | AC09 | SCR62 | M1 | BR-02,05 |
| US10 | F03 | UC07 | AC10 | SCR62 | M1 | BR-01,05 |
| US11 | F03 | UC08 | AC11 | SCR63 | M1 | BR-02 |
| US12 | F04 | UC09 | AC12 | SCR64 | M1/M4 | BR-09,12 |
| US13 | F05 | UC10 | AC13 | SCR21 | M1 cơ bản; M2 hoàn thiện | BR-02,03,07,09 |
| US14 | F06 | UC11 | AC14 | SCR20 | M1 cơ bản; M2 hoàn thiện | Permissions; NFR10 |
| US15 | F06 | UC12 | AC15 | SCR22 | M1 cơ bản; M2 hoàn thiện | Permissions; BR-06 |
| US16 | F07 | UC13 | AC16 | SCR23 | M1 cơ bản; M2 hoàn thiện | BR-05 |
| US17 | F07 | UC13 | AC17 | SCR20/23 | M1 cơ bản; M2 hoàn thiện | BR-05 |
| US18 | F07 | UC14 | AC18 | SCR24 | M1 cơ bản; M2 hoàn thiện | BR-04,08 |
| US19 | F07 | UC14 | AC19 | SCR24 | M1 cơ bản; M2 hoàn thiện | BR-04,05 |
| US20 | F08 | UC15 | AC20 | SCR22 | M1 cơ bản; M2 hoàn thiện | BR-04,06,08 |
| US21 | F08 | UC16 | AC21 | SCR22 | M1 cơ bản; M2 hoàn thiện | BR-06,08 |
| US22 | F09 | UC17 | AC22 | SCR21/22 | M4 | BR-07 |
| US23 | F09 | UC17 | AC23 | SCR22 | M4 | BR-07; Permissions |
| US24 | F10 | UC18 | AC24 | SCR24 | M1 cơ bản; M2 hoàn thiện | BR-04,06,09 |
| US25 | F10 | UC19 | AC25 | SCR24 | M1 cơ bản; M2 hoàn thiện | BR-04,06,09 |
| US26 | F10 | UC20 | AC26 | SCR24 | M1 cơ bản; M2 hoàn thiện | BR-04 |
| US27 | F10 | UC21 | AC27 | SCR24 | M1 cơ bản; M2 hoàn thiện | BR-04,09; D-12 |
| US28 | F10 | UC21 | AC28 | SCR24 | M1 cơ bản; M2 hoàn thiện | BR-04,09; D-12 |
| US29 | F10 | UC22 | AC29 | SCR24 | M1 cơ bản; M2 hoàn thiện | BR-04,08,09 |
| US30 | F11 | UC23 | AC30 | SCR25 | M1 cơ bản; M2 hoàn thiện | BR-03,09 |
| US31 | F11 | UC12 | AC31 | SCR22 | M1 cơ bản; M2 hoàn thiện | BR-12 |
| US32 | F12 | UC24 | AC32 | SCR22 | M4 | BR-08–10; TC-SLA01–12 |
| US33 | F12 | UC25 | AC33 | Worker→SCR50/22 | M4 | BR-10; TC-SLA06–09 |
| US34 | F13 | UC26 | AC34 | SCR50 | M4 | BR-12 |
| US35 | F14 | UC27 | AC35 | SCR31 | M4 | BR-11 |
| US36 | F14 | UC27 | AC36 | SCR30 | M4 | BR-11; Permissions |
| US37 | F14 | UC28 | AC37 | SCR32 | M4 | BR-11; Permissions |
| US38 | F15 | UC29 | AC38 | SCR33 | M4 | BR-11 |
| US39 | F15 | UC30 | AC39 | SCR33 | M4 | BR-11 |
| US40 | F15 | UC31 | AC40 | SCR33 | M4 | BR-11,12 |
| US41 | F16 | UC32 | AC41 | SCR10 | M4 | MET11–12 |
| US42 | F16 | UC32 | AC42 | SCR11 | M4 | MET13–14; BR-10 |
| US43 | F16 | UC32 | AC43 | SCR12/40 | M4 | MET01–05 |
| US44 | F17 | UC32 | AC44 | SCR40 | M4 | MET06–08 |
| US45 | F17 | UC32 | AC45 | SCR12/40 | M4 | MET09 |
| US46 | F17 | UC32 | AC46 | SCR12/30 | M4 | MET10 |
| US47 | F18 | UC33 | AC47 | SCR65 | Xuyên suốt | BR-12 |

F19 vàAC-X01–10 áp dụng xuyên suốt, không tạo một story “làm bảo mật” để trì hoãn các điều kiện bắt buộc của từng tính năng.

## Độ phủ 12 tiêu chí nghiệm thu gốc

| # đề bài | Nội dung | Truy vết | Bằng chứng cần có sau triển khai |
|---|---|---|---|
| 1 | Nhân viên tạo/theo dõi/phản hồi | US13–15,20,41; AC13–15,20 | E2E requester |
| 2 | Không đọc ticket người khác/nội bộ qua API | AC15,21,23; AC-X01; Permissions | Negative auth API cho ticket/comment/tệp/count |
| 3 | Technician trong nhóm; Manager phân công/chuyển | US16–19; AC10,16–19 | Integration membership/scope/assignment |
| 4 | Backend chặn trạng thái sai | BR-04; AC18–29 | Unit state matrix + API bypass |
| 5 | Có lịch sử và giải pháp | US25,31; AC25,31 | Đọc event và giải pháp sau restart |
| 6 | SLA Pending/priority/reopen | US30,32; TC-SLA01–12 | Clock tests có mốc cố định |
| 7 | Worker không tạo cảnh báo trùng | US33; AC33; TC-SLA07 | Hai lần/hai instance worker |
| 8 | Lịch sử cấp phát/thu hồi đúng | US37–40; AC37–40 | Transaction/concurrency assignment |
| 9 | Dashboard dữ liệu thật/đúng quyền | US41–46; MET01–15 | Đối chiếu source + negative scope |
| 10 | Dữ liệu bền vững | NFR04; AC-X08 | Restart app/DB/storage |
| 11 | Tệp đúng loại/size/quyền | US22–23; AC22–23 | Boundary/file-type/authorization tests |
| 12 | Test tự động luồng chính, sửa lỗi quan trọng | AC toàn bộ; M5 gate | Test report thực, không dùng bảng PLANNED này thay thế |

## Điều hướng tài liệu nguồn

[Features](../02-features.md) · [Use cases](../03-use-cases.md) · [Stories](../08-invest-requirements.md) · [AC](../06-acceptance-criteria.md) · [Screens](../04-information-architecture.md) · [Business rules](../requirements/business-rules.md) · [Permissions](../requirements/permissions-matrix.md) · [Metrics](../requirements/metrics-catalog.md).

## Truy vết trợ lý AI

Mỗi dòng n=01–08 tương ứng F-AIn / UC-AIn / US-AIn / AC-AIn trong [catalog trợ lý](../ai/use-cases-stories-and-acceptance.md). AI01/02/04/06/07 dùng SCR-AI01; AI03 dùng SCR-AI02 với confirm hoặc SCR21; AI05 SCR-AI02→SCR22; AI08 SCR-AI03. Gate M4/M5, kiểm thử TC-AI01–12. AI03 đã đổi từ chỉ chuyển form thành tạo ticket hội thoại sau xác nhận; giữ mã và quyền lõi.

## Truy vết điều phối — chỉ thiết kế

| US / F / AC | Use case | Screen | Mốc dự kiến | Quy tắc / gate |
|---|---|---|---|---|
| US-OPS01 / F-OPS01 / AC-OPS01 | UC-OPS01 | SCR-OPS03 | M1 | BR-16, A3 |
| US-OPS02 / F-OPS02 / AC-OPS02 | UC-OPS02 | SCR-OPS06 | M2 | BR-17/21, A1/A7 |
| US-OPS03 / F-OPS03 / AC-OPS03 | UC-OPS03 | SCR-AI01/21/22 | M3 | BR-20, A1/A10 |
| US-OPS04 / F-OPS04 / AC-OPS04 | UC-OPS04 | SCR-OPS02 | M2–M3 | BR-14/15, A1/A2 |
| US-OPS05 / F-OPS05 / AC-OPS05 | UC-OPS05 | SCR-OPS01/04 | M2–M3 | BR-16/17, A1/A3/A5 |
| US-OPS06 / F-OPS06 / AC-OPS06 | UC-OPS06 | SCR-OPS01/02 | M1–M2 | BR-14/15, A2/A8 |
| US-OPS07 / F-OPS07 / AC-OPS07 | UC-OPS07 | SCR-OPS03/04 | M2–M3 | BR-16–19, A4 |
| US-OPS08 / F-OPS08 / AC-OPS08 | UC-OPS08 | SCR-OPS05 | M2–M3 | BR-18, A4/A6 |
| US-OPS09 / F-OPS09 / AC-OPS09 | UC-OPS02/07 | SCR-OPS02/06 | M2 | BR-17/18, A6/A10 |
| US-OPS10 / F-OPS10 / AC-OPS10 | UC-OPS09 | SCR-OPS04 | M2–M3 | BR-19/22, A5/A7/A10 |
| US-OPS11 / F-OPS11 / AC-OPS11 | UC-OPS10 | SCR-OPS07/AI01 | M3 tối thiểu, M4 đầy đủ | BR-21, A9/A10 |
| US-OPS12 / F-OPS12 / AC-OPS12 | UC-OPS09 | SCR12/40/OPS04 | M4 | BR-22/MET16–22, A7/A12 |

A1–A13 và TC-OPS01–12 định nghĩa trực tiếp ở [AC catalog](../06-acceptance-criteria.md); không sao chép thành tiêu chí khác. API và ERD là thiết kế hỗ trợ UC, không được đánh dấu implemented. Tất cả dòng mới DESIGNED / NOT IMPLEMENTED / NOT TESTED.

## Truy vết hợp đồng và hình kiến trúc

[API01–19](../technical/api-design.md) gắn từng nhóm hợp đồng với UC/BR; [EVT01–17](../technical/api-design.md#hợp-đồng-sự-kiện-nội-bộ) ghi producer/consumer và xử lý retry. Đây là ID hợp đồng logic, không phải tên endpoint đã triển khai.

| Nhu cầu / quy tắc | Contract / dữ liệu | Hình | Bằng chứng phải có sau triển khai |
|---|---|---|---|
| Bốn role, scope, không cấp trưởng nhóm | API01/02/17; User/TeamMembership/Session | FIG-CTX01, FIG-UC00–05 | Negative role/IDOR/CSRF/session revoke; không AI/Admin impersonation |
| Ticket tiếp nhận, Task thực thi | API03/05/06/13; Ticket/PlanVersion/Task | FIG-FLOW01/02/03/04, FIG-DAG01, FIG-ST01/03, FIG-ERD05 | Domain facts/state/version; task Done không tự đóng ticket |
| Policy và giao việc khả thi | API05–11; EVT03/04/08–15; PolicyGrant/WorkAllocation | FIG-CNT01, FIG-SEQ01/02, FIG-ST02 | Two-worker/capacity/stale/revoke/manual lock |
| Model ngoài transaction | API10/12/13; Run/Action/AIUsage | FIG-SEQ01 | Không giữ DB transaction qua model call; timeout không partial effect |
| KB/nguồn/citation và ACL | API12/14; EVT16/17; KnowledgeVersion/ACL/Chunk | FIG-ERD09/10, FIG-CNT01 | Source mở được; revoke hiệu lực trước index/cache/provider/render |
| Outbox/recovery/audit | API10/16/18; EVT01–17; DomainEvent/OutboxDelivery/AuditLog | FIG-CNT01, FIG-DEP01 | Crash trước ack, replay không effect trùng; restore cách ly có evidence |
| SLA và tài sản | API15/19; EVT11; TicketSLA/SLAViolation/AssetAssignment | FIG-UC02/03, FIG-ST03/04 | TC-SLA, atomic asset assignment, scan delay và quét bù |

Danh mục FIG và nguồn cụ thể ở [sơ đồ](../diagrams/README.md). Bộ source Markdown là nơi sửa quy tắc; XMind/previews/PNG giữ cùng ý nghĩa nhưng không thay phép kiểm chứng ứng dụng. Kế hoạch kiểm chứng/entry/exit ở [lộ trình](../09-design-readiness.md).

## Hợp đồng thiết kế máy đọc và cấu trúc code

| Nguồn | Artifact chi tiết | Truy vết / trạng thái |
|---|---|---|
| Entity/BR-01–22 | [DBML/ER](../database/README.md) | 52 entity chọn lọc, không schema vật lý/migration |
| API01–19 / UC | [OpenAPI](../api/openapi.json), [operations](../api/operations.md) | operationId + role/scope; 96 operations design draft |
| Kiến trúc/NFR | [C4](../architecture/c4/README.md) | C1/C2 tái sử dụng; C3 API/worker; C4 command collaboration |
| API/modules/ERD | [Folder/file design](../technical/code-structure.md) | Hiện trạng .gitkeep tách khỏi cây planned; không source code mới |
