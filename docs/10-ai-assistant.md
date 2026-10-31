---
id: itoh-docs-10-ai-assistant
title: "Thiết kế AI trợ lý và điều phối tự động"
type: reference
domain: ai
module: orchestration
tags: [ai, orchestration, reference]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Định nghĩa trợ lý và điều phối AI, nguồn, policy và ranh giới hành động."
---

# Thiết kế AI trợ lý và điều phối tự động

**Thiết kế mục tiêu · Chưa triển khai/kiểm thử.** D-35 thay giới hạn toàn cục “AI chỉ đọc/soạn nháp” của D-23 cũ. Hiện chỉ cập nhật tài liệu.

## Hai chế độ và danh tính

| Chế độ | Danh tính/quyền | Hành động |
|---|---|---|
| Trợ lý theo yêu cầu | Người dùng hiện tại; role/scope/visibility trước mỗi tool và trước trả kết quả | Hỏi đáp KB đã xuất bản, tra cứu/tóm tắt; tạo ticket sau xác nhận; nháp phản hồi cho IT duyệt |
| Điều phối nền | AI_COORDINATOR, gắn event/run/policy version/người cấp quyền | Sinh plan/task, phân công/giao lại, nhắc/báo cáo trong policy; ngoại lệ chuyển quản lý |

Provider sinh output theo schema và đề xuất tool; backend quyết định quyền, hợp lệ và transaction. Model không có credential database/session. Requester không đọc nhân lực, kế hoạch nội bộ, trace hoặc approval.

## Trợ lý giữ trong MVP

- Hỏi đáp dùng KB Published và còn quyền, có tên/version/link mở được; thiếu căn cứ phải nói rõ. Thu hồi quyền áp dụng tại retrieval, không đợi embedding.
- Tra cứu/tóm tắt ticket/tài sản theo scope API; báo cáo lấy facts theo metric allowlist. Không SQL tự sinh.
- Tạo ticket: thu thập trường → xem trước → user xác nhận chính nội dung/phiên bản đó → service tạo bằng quyền user và idempotency key → trả mã/kết quả đã lưu. Không xác nhận hoặc nội dung đổi thì không ghi. Có lựa chọn sửa tại SCR21; không bắt buộc rời hội thoại.
- Nháp phản hồi: tách PUBLIC/INTERNAL, không chuyển nội bộ ra public; IT kiểm tra/chỉnh rồi gửi composer. Chat/nháp không là public comment, first response hoặc hoàn thành kỹ thuật.
- Phiên cá nhân và lịch sử kiểm tra lại quyền nguồn; Admin không tự được đọc chat người khác. Retention: Cần quyết định D-40.

## Điều phối theo sự kiện và chính sách

Hiểu mục tiêu/deadline/thông tin thiếu → lấy workflow/template/nguồn được phép → sinh task, kỹ năng/công sức/phụ thuộc → backend validate schema/DAG/feasibility → lọc ứng viên nhóm/kỹ năng/lịch/tải → AI xếp hạng trong tập hợp lệ, giải thích bằng dữ liệu vận hành → service tạo/giao task → notification/audit/outbox → sự kiện tiến độ/lịch/tải/blocked/deadline → đánh giá lại → giao lại trong quyền hoặc trình quản lý.

Thiếu dữ liệu thì hỏi có cấu trúc, chống lặp; không coi mọi người đều rảnh. Ước lượng model chưa được xác thực phải dùng template đã duyệt hoặc hỏi trước tự giao. Luồng template xác định M2 không thay bằng chứng model thật M3/A11.

## Policy và phê duyệt

| Hành động | Quy tắc |
|---|---|
| Tạo plan/task | Tự thực hiện trong workflow/nhóm/priority/giới hạn được cấp; ngoài phạm vi tạo draft/approval |
| Giao task chưa bắt đầu | Chỉ ứng viên hợp lệ, không vượt capacity; recheck trước ghi |
| Giao lại task chưa bắt đầu | Policy cho phép, không đổi cam kết, tôn trọng manual lock |
| Đổi người task In Progress hoặc bị khóa | Quản lý duyệt phương án cụ thể; không ghi đè thủ công |
| Đổi hạn nội bộ | Trong policy, không vượt cam kết/SLA hoặc phá phụ thuộc |
| Đổi SLA/cam kết/priority/chuyển ngoài nhóm | Cần IT_MANAGER/ADMIN có thẩm quyền duyệt; kiểm tra lại trước ghi |
| Nhắc/báo cáo | Giới hạn tần suất/người nhận, đúng nguồn/visibility |
| Done/Resolved/Closed/cấp tài khoản | Người có quyền thực hiện; AI không tự xác nhận |

Default deny. Manager có thể tắt/thu hẹp policy hoặc khóa phân công. Execution/retry/sau duyệt đều kiểm tra policy và grantor hiện tại. Approval hiển thị hiện trạng, thay đổi, tác động, lý do, snapshot version; stale/không khả thi phải từ chối hoặc đánh giá lại. Duyệt không cho bỏ kiểm tra tải/quyền.

## Kịch bản onboarding

10 nhân viên, danh sách/cấu hình/hạn đầy đủ, quy trình Published và policy bật: kiểm kê → chuẩn bị máy → cài đặt → kiểm tra → bàn giao; nhánh đề nghị cấp tài khoản song song khi đủ đầu vào và hoàn thành trước kiểm tra. AI không tự mua máy/tạo tài khoản.

Nghỉ phép tạo sự kiện: xác định task ảnh hưởng, giao lại việc chưa bắt đầu nếu đủ điều kiện; task đang làm/khóa hoặc không có nghiệm thì mở ngoại lệ. Kỹ thuật viên ghi hoàn thành, ticket vẫn qua giải quyết/nghiệm thu; AI tổng hợp kết quả đã lưu.

## Tích hợp và bảo mật

Adapter provider/model/embedding tách domain, schema output, allowlist tool, timeout và giới hạn lượt/token/retry. Snapshot → đóng transaction đọc → gọi model → transaction mới re-read/version/policy/ACL/capacity → ghi nguyên tử domain/action/audit/outbox. Không giữ lock lúc chờ model; không áp dụng plan lỗi một phần.

Run/action truy về event/policy/grantor/actor, nguồn/version, model/prompt version, args đã lọc bí mật, kết quả/lỗi/usage nếu có. KB/ticket là dữ liệu không đáng tin về chỉ dẫn; không shell/HTTP/SQL tùy ý. Render escape, link trong tập được server xác nhận. Provider lỗi không chặn core hoặc worker SLA. Xem [ranh giới tích hợp](ai/integration-and-non-regression.md).

## Cấu hình AI và quyết định

Xác nhận riêng trước đó chỉ dành cho **kiểm thử M3 ban đầu**: OpenAI API, `gpt-5-mini`, tổng tối đa 5 USD gồm retry/embedding, dữ liệu DEMO và database kiểm thử. `text-embedding-3-small` là đề xuất nếu thử RAG, cần xác minh trước dùng. Không tự đổi model đắt hơn/tăng trần. Chỉ dẫn hiện tại chỉ tài liệu, chưa được chạy API.

Quyền model tài khoản, billing/quota, giá tại ngày chạy, khả năng tool/schema và chất lượng chưa được kiểm chứng. Provider/model/embedding, ngân sách và chính sách dữ liệu **production: Cần quyết định**, theo D-39/40. Không đưa key vào chat/log/repo hoặc dùng phạm vi demo để gửi dữ liệu thật.

## Màn hình và nghiệm thu

Giữ SCR-AI01–03; bổ sung SCR-OPS01–07 ở [IA](04-information-architecture.md): task board, plan, nhân lực, điều phối, approval, policy/template, KB. Draft/proposal tách kết quả thực thi.

8 UC/US/AC trợ lý ở [catalog AI](ai/use-cases-stories-and-acceptance.md); 10 UC-OPS, 12 US/AC-OPS và A1–A13 ở catalog gốc. Tất cả PLANNED/NOT RUN. Cần cả đường automation thành công và ngoại lệ với model thật/dữ liệu lưu thật trong môi trường được phép; UI/chat tĩnh không đủ.
