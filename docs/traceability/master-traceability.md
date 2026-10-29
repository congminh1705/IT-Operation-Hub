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
| US12 | F04 | UC09 | AC12 | SCR64 | M1/M3 | BR-09,12 |
| US13 | F05 | UC10 | AC13 | SCR21 | M2 | BR-02,03,07,09 |
| US14 | F06 | UC11 | AC14 | SCR20 | M2 | Permissions; NFR10 |
| US15 | F06 | UC12 | AC15 | SCR22 | M2 | Permissions; BR-06 |
| US16 | F07 | UC13 | AC16 | SCR23 | M2 | BR-05 |
| US17 | F07 | UC13 | AC17 | SCR20/23 | M2 | BR-05 |
| US18 | F07 | UC14 | AC18 | SCR24 | M2 | BR-04,08 |
| US19 | F07 | UC14 | AC19 | SCR24 | M2 | BR-04,05 |
| US20 | F08 | UC15 | AC20 | SCR22 | M2 | BR-04,06,08 |
| US21 | F08 | UC16 | AC21 | SCR22 | M2 | BR-06,08 |
| US22 | F09 | UC17 | AC22 | SCR21/22 | M2 | BR-07 |
| US23 | F09 | UC17 | AC23 | SCR22 | M2 | BR-07; Permissions |
| US24 | F10 | UC18 | AC24 | SCR24 | M2 | BR-04,06,09 |
| US25 | F10 | UC19 | AC25 | SCR24 | M2 | BR-04,06,09 |
| US26 | F10 | UC20 | AC26 | SCR24 | M2 | BR-04 |
| US27 | F10 | UC21 | AC27 | SCR24 | M2 | BR-04,09; D-12 |
| US28 | F10 | UC21 | AC28 | SCR24 | M2 | BR-04,09; D-12 |
| US29 | F10 | UC22 | AC29 | SCR24 | M2 | BR-04,08,09 |
| US30 | F11 | UC23 | AC30 | SCR25 | M2/M3 | BR-03,09 |
| US31 | F11 | UC12 | AC31 | SCR22 | M2 | BR-12 |
| US32 | F12 | UC24 | AC32 | SCR22 | M3 | BR-08–10; TC-SLA01–12 |
| US33 | F12 | UC25 | AC33 | Worker→SCR50/22 | M3 | BR-10; TC-SLA06–09 |
| US34 | F13 | UC26 | AC34 | SCR50 | M3 | BR-12 |
| US35 | F14 | UC27 | AC35 | SCR31 | M4 | BR-11 |
| US36 | F14 | UC27 | AC36 | SCR30 | M4 | BR-11; Permissions |
| US37 | F14 | UC28 | AC37 | SCR32 | M4 | BR-11; Permissions |
| US38 | F15 | UC29 | AC38 | SCR33 | M4 | BR-11 |
| US39 | F15 | UC30 | AC39 | SCR33 | M4 | BR-11 |
| US40 | F15 | UC31 | AC40 | SCR33 | M4 | BR-11,12 |
| US41 | F16 | UC32 | AC41 | SCR10 | M5 | MET11–12 |
| US42 | F16 | UC32 | AC42 | SCR11 | M5 | MET13–14; BR-10 |
| US43 | F16 | UC32 | AC43 | SCR12/40 | M5 | MET01–05 |
| US44 | F17 | UC32 | AC44 | SCR40 | M5 | MET06–08 |
| US45 | F17 | UC32 | AC45 | SCR12/40 | M5 | MET09 |
| US46 | F17 | UC32 | AC46 | SCR12/30 | M5 | MET10 |
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
| 12 | Test tự động luồng chính, sửa lỗi quan trọng | AC toàn bộ; M6 gate | Test report thực, không dùng bảng PLANNED này thay thế |

## Điều hướng tài liệu nguồn

[Features](../02-features.md) · [Use cases](../03-use-cases.md) · [Stories](../08-invest-requirements.md) · [AC](../06-acceptance-criteria.md) · [Screens](../04-information-architecture.md) · [Business rules](../requirements/business-rules.md) · [Permissions](../requirements/permissions-matrix.md) · [Metrics](../requirements/metrics-catalog.md).
