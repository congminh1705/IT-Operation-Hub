---
id: itoh-docs-readme
title: "Hồ sơ phân tích và thiết kế"
type: reference
domain: project
module: documentation
tags: [project, documentation, reference]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Xác định cấu trúc hồ sơ, nguồn chuẩn, thẩm quyền và giới hạn bàn giao."
---

# Hồ sơ phân tích và thiết kế

Hồ sơ mô tả **thiết kế mục tiêu**, chưa phải hệ thống đã triển khai. Mỗi chủ đề có một tài liệu nguồn; bảng tổng hợp, sơ đồ, bản vẽ và XMind dẫn về nguồn đó. Các mục trên [README dự án](../README.md) giữ nguyên thứ tự trình bày sản phẩm.

## 1. Cấu trúc và nguồn chuẩn

| Miền tài liệu | Nguồn chuẩn | Tài liệu chi tiết / biểu diễn |
|---|---|---|
| Quản lý hồ sơ | [Quy ước tài liệu](documentation-standard.md) | [Kết quả rà soát](review-report.md) |
| Bài toán và phạm vi | [Phạm vi](01-scope.md) | [Nghiên cứu](00-research.md), [năng lực](02-features.md) |
| Yêu cầu chức năng | [Use cases](03-use-cases.md), [stories](08-invest-requirements.md) | [Catalog trợ lý AI](ai/use-cases-stories-and-acceptance.md) |
| Chất lượng và nghiệm thu | [NFR](requirements/non-functional-requirements.md), [AC/TC](06-acceptance-criteria.md) | [Kế hoạch kiểm chứng](research/validation-plan.md), [truy vết](traceability/master-traceability.md) |
| Domain và phân quyền | [BR-01–22](requirements/business-rules.md), [ma trận quyền](requirements/permissions-matrix.md) | [Cấp tài khoản](requirements/account-provisioning.md), [chỉ số](requirements/metrics-catalog.md) |
| Kiến trúc và tích hợp | [Kiến trúc](technical/architecture.md) | [C4 C1–C4](architecture/c4/README.md), [cấu trúc code](technical/code-structure.md), [các góc nhìn kiến trúc](diagrams/architecture.md), [stack](technical/tech-stack.md), [phiên bản ứng viên](technical/version-baseline.md) |
| API và sự kiện | [Hợp đồng API](technical/api-design.md) | [OpenAPI](api/README.md), [operation catalog](api/operations.md), [tích hợp AI](ai/integration-and-non-regression.md) |
| Dữ liệu | [Mô hình logic và ERD](requirements/conceptual-data-model.md) | [DBML](database/README.md); ràng buộc/giao dịch tại kiến trúc; chưa có schema vật lý/migration |
| AI | [Thiết kế AI](10-ai-assistant.md) | Catalog AI, quy tắc policy/approval/KB và hợp đồng tool; cấu hình thử nghiệm D-39 |
| IA và trải nghiệm | [IA/screen inventory](04-information-architecture.md), [UI/UX](07-uiux-specification.md) | [Flows](05-user-flows.md), [design system](design/design-system.md), [nội dung/trạng thái](design/content-and-states.md), [responsive/motion](design/motion-and-responsive.md), [định hướng thị giác](design/visual-refresh.md) |
| Đồ họa | [Danh mục sơ đồ](diagrams/README.md) | [Bản vẽ](design/wireframes/README.md), [XMind](xmind/README.md); đây là biểu diễn dẫn xuất |
| Quyết định và kế hoạch | [Sổ quyết định](decisions/design-decisions.md), [lộ trình M0–M5](09-design-readiness.md) | D-40 tập hợp điểm chưa chốt; lộ trình không cấp quyền bắt đầu code |

Các miền bảo mật, DevOps và observability được đặc tả tại kiến trúc, NFR và ma trận quyền; không tạo bản đặc tả thứ hai chỉ để khớp tên thư mục của một framework. Kiểm thử ứng dụng và vận hành có kế hoạch, chưa có báo cáo thực thi.

README dự án giữ format hiển thị hiện có, không bắt buộc YAML frontmatter. Bản ghi tham chiếu: ID itoh-readme, type reference, domain project, module repository, authority derived, status design-draft, owner chủ đề tài. Metadata từng tài liệu trong docs/ lưu tại file nguồn; OpenAPI JSON/DBML là artifact được mô tả tại README cùng miền.

## 2. SRS của dự án

SRS được tổ chức theo các tài liệu nguồn trong bảng trên, không sao chép thành một tài liệu tổng hợp khác. Phạm vi và loại người dùng ở `01-scope.md`; chức năng có ID F/UC/US; ràng buộc ở BR/NFR; điều kiện nghiệm thu ở AC/TC; giả định ở nghiên cứu và D-40. [Ma trận truy vết](traceability/master-traceability.md) nối các phần này.

Một tổ chức; bốn vai trò người dùng Requester, Technician, IT Manager (Trưởng phòng IT), Admin. Không có cấp Trưởng nhóm IT riêng. AI_COORDINATOR là danh tính dịch vụ nội bộ. Ticket tiếp nhận/SLA khác Task thực thi; AI trợ lý và điều phối cùng thuộc MVP.

## 3. Thẩm quyền và trạng thái

Người dùng/chủ đề tài xác nhận phạm vi và quyết định sản phẩm. Agent biên soạn, rà soát tính nhất quán; không tự ghi nhận phê duyệt thiết kế chi tiết, kiểm thử đạt hay nghiệm thu. Sổ quyết định ghi rõ phần đã chốt và phần cần quyết định; metadata `approval: needs-review` của hồ sơ không phủ nhận các quyết định đã được chốt riêng.

Khi thay đổi một quy tắc, sửa nguồn chuẩn trước rồi cập nhật truy vết, API/dữ liệu, sơ đồ, UI/XMind và kế hoạch kiểm chứng chịu ảnh hưởng. Nếu hai tài liệu mâu thuẫn, dùng quyết định đã chốt đúng phạm vi để xử lý; thiếu quyết định thì ghi tại D-40, không chọn theo thời gian sửa file.

## 4. Giới hạn bàn giao

Metadata, liên kết, ID, quan hệ sơ đồ và nội dung dẫn xuất có thể kiểm tra tại giai đoạn tài liệu. Hiệu năng, bảo mật chạy thật, model, accessibility, concurrency và restore phải được chứng minh khi có ứng dụng và được yêu cầu triển khai riêng. Hồ sơ hiện không có bằng chứng phê duyệt độc lập hoặc chạy kiểm thử ứng dụng.
