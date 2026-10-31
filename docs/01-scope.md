---
id: itoh-docs-01-scope
title: "Phạm vi và định hướng sản phẩm"
type: reference
domain: business
module: product
tags: [business, product, reference]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Xác định mục tiêu, phạm vi MVP, vai trò và phần loại trừ."
---

# Phạm vi và định hướng sản phẩm

**Thiết kế mục tiêu · Chưa triển khai/kiểm thử.** Giai đoạn hiện tại chỉ gồm tài liệu thiết kế. M0–M5 là kế hoạch phát triển dự kiến.

## Mục tiêu

IT Operations Hub quản lý và vận hành một phòng IT nhiều nhóm trong một tổ chức. Giữ ticket, SLA, tài sản, người dùng/nhóm, thông báo, báo cáo, audit và kho kiến thức. Luồng trung tâm: **hiểu yêu cầu → lập kế hoạch/task → chọn người và giao việc → theo dõi → điều phối lại theo chính sách → tổng hợp kết quả**.

Ticket tiếp nhận yêu cầu và giữ cam kết SLA; Task là công việc thực thi, có người phụ trách, công sức, thời hạn và phụ thuộc. Trưởng phòng IT thiết lập chính sách, giám sát, can thiệp/khóa phân công và duyệt ngoại lệ. Nhân viên IT thực hiện chuyên môn và ghi nhận hoàn thành. AI không thay toàn bộ trưởng phòng hoặc kỹ thuật viên.

## Phạm vi MVP mục tiêu

| Nhóm | Kết quả phải có khi triển khai và nghiệm thu sau này |
|---|---|
| Nền tảng | Tài khoản do Admin tạo, phòng ban, nhóm/thành viên, session server, CSRF, quyền theo bản ghi, audit |
| Ticket | Tạo/phân loại/ưu tiên, hội thoại công khai/nội bộ, tệp riêng tư, lịch sử và trạng thái hiện hành |
| Công việc | Kế hoạch có phiên bản, một phiên bản hiệu lực/ticket; task riêng, DAG, công sức dự kiến/còn lại, deadline |
| Nhân lực | Kỹ năng được quản lý xác nhận; lịch làm việc, khoảng vắng mặt và ngân sách công việc theo kỳ |
| Điều phối AI | Hiểu dữ liệu thiếu, sinh kế hoạch có schema, xếp hạng ứng viên hợp lệ, gọi service giao việc, theo dõi sự kiện và điều phối lại trong policy |
| Kiểm soát | Default deny; policy theo workflow/nhóm/priority/giới hạn; phê duyệt ngoại lệ; version, chống trùng, kiểm tra tải trong transaction |
| Trợ lý AI | Hỏi đáp có nguồn, tra cứu, tóm tắt, tạo ticket qua hội thoại sau xác nhận; soạn phản hồi để kỹ thuật viên duyệt trước khi gửi |
| Kiến thức | Nháp/xuất bản, phiên bản, quyền đọc, truy xuất có nguồn; RAG qua PostgreSQL/pgvector, adapter embedding, cập nhật chỉ mục nền |
| Vận hành | Hai đồng hồ SLA 24/7, cảnh báo/notification, tài sản/cấp phát/thu hồi, dashboard và báo cáo từ dữ liệu nguồn |

AI thuộc nghiệm thu MVP. Cờ bật/tắt là kiểm soát vận hành, không loại AI khỏi phạm vi. Q&A/summary/nháp không tự ghi nghiệp vụ; tạo ticket đã xác nhận và automation có policy được gọi service ghi. Văn bản “nên giao cho A” chưa phải kết quả phân công.

## Vai trò và dữ liệu

Bốn vai trò người dùng: REQUESTER, TECHNICIAN, IT_MANAGER, ADMIN. AI_COORDINATOR là danh tính dịch vụ nền gắn policy/người cấp quyền, không phải role người dùng hoặc Admin chung. Trợ lý hội thoại dùng quyền của người yêu cầu. Chi tiết ở [ma trận quyền](requirements/permissions-matrix.md).

**IT Manager (IT_MANAGER) là Trưởng phòng IT; không có vai trò Trưởng nhóm IT riêng.** AI điều phối công việc theo chính sách; Trưởng phòng IT thiết lập chính sách, giám sát, can thiệp và duyệt ngoại lệ. Team là nhóm chuyên môn để tổ chức nhân sự và phạm vi công việc, không tạo thêm cấp quản lý. Trưởng các phòng ban khác gửi yêu cầu bằng quyền Requester.

D-29 giữ nguyên: trưởng phòng ban gửi ticket bằng quyền Requester; chỉ Admin xác minh và tạo tài khoản. Bước cấp tài khoản trong onboarding là task cho người có quyền, không cho AI tự cấp user/role.

## Kịch bản mục tiêu

Chuẩn bị máy và tài khoản cho 10 nhân viên mới trước hạn: xác nhận ticket → hỏi bổ sung danh sách/cấu hình/hạn nếu thiếu → tham chiếu quy trình Published → kiểm kê, chuẩn bị máy, cài đặt, đề nghị cấp tài khoản, kiểm tra, bàn giao với nhánh song song hợp lệ → kiểm tra inventory/nhân lực → giao task theo policy đã bật → cập nhật tiến độ → cập nhật nghỉ phép → giao lại task chưa bắt đầu hoặc trình ngoại lệ → người có quyền ghi hoàn thành/nghiệm thu → AI báo cáo.

Thiếu thiết bị/nhân lực hoặc không đáp ứng SLA phải báo ngoại lệ, không bịa dữ liệu hoặc tự nới ràng buộc. Seed tương lai có nhãn DEMO; hiện chưa có seed/database/luồng chạy.

## Ngoài MVP

SaaS đa khách hàng; lương/chấm công/đánh giá nhân sự; AI chạy shell, cài phần mềm trên máy thật, tự cấp tài khoản/quyền, mua sắm/duyệt chi phí, tự xác nhận hoàn thành hoặc đóng ticket. Email/calendar/HR thật, OCR scan, CMDB nâng cao, change và ca trực đầy đủ. Chưa thêm đăng ký công khai, SSO/MFA, xuất Excel/PDF hoặc dark mode.

## Trạng thái và nguồn chuẩn

Đã đặc tả không đồng nghĩa đã triển khai hoặc kiểm thử. Các năng lực MVP dưới đây là thiết kế mục tiêu.

[Quyết định](decisions/design-decisions.md) quản lý Đã chốt/Cần quyết định; [nghiệp vụ](requirements/business-rules.md), [kiến trúc](technical/architecture.md), [mô hình/ERD](requirements/conceptual-data-model.md), [API thiết kế](technical/api-design.md), [AI](10-ai-assistant.md), [lộ trình](09-design-readiness.md) là nguồn theo từng chủ đề.
