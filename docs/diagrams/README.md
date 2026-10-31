---
id: itoh-docs-diagrams-readme
title: "Sơ đồ Use Case và luồng nghiệp vụ — xem trực tiếp"
type: reference
domain: architecture
module: diagrams
tags: [architecture, diagrams, reference]
priority: 2
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: derived
purpose: "Đăng ký FIG, ký pháp, nguồn, mục đích và giới hạn của các sơ đồ."
---

# Sơ đồ Use Case và luồng nghiệp vụ — xem trực tiếp

**Thiết kế mục tiêu, chưa triển khai/kiểm thử ứng dụng.** Các diagram dùng cùng catalog UC, state machine và ma trận quyền. Chữ, khoảng cách, đường nối và điều kiện rẽ nhánh được thể hiện theo cùng một quy ước. Sơ đồ tổng quan và năm nhóm chi tiết bao phủ **51 UC = 33 lõi + 8 AI + 10 OPS**.

## Cách xem và đọc sơ đồ

- VS Code: mở Markdown Preview hoặc SVG Image Preview; GitHub: xem trực tiếp các SVG.
- Actor người dùng bên ngoài đường bao hệ thống; ellipse là use case; đường liền là association.
- AI_COORDINATOR và bộ lập lịch là thành phần nội bộ, thể hiện ở sơ đồ kiến trúc/sequence và chú giải thực hiện, không vẽ thành actor của use-case view.
- Các khung theo vai trò là các góc nhìn của cùng IT Operations Hub; mã UC lặp vẫn là cùng nghiệp vụ.
- Association không tự cấp quyền trên mọi bản ghi. Điều kiện assignee/nhóm/visibility/version/policy/capacity theo catalog và permissions.

## Danh mục, nguồn và loại sơ đồ

Áp dụng [quy ước tài liệu/sơ đồ](../documentation-standard.md). Mọi FIG dưới đây ở trạng thái thiết kế; chủ đề tài là owner hồ sơ, chưa có phê duyệt độc lập hoặc bằng chứng hệ thống chạy. Kiến trúc/ERD có source Mermaid trong Markdown và SVG đã render; bố cục đường nối được rà thêm. Use-case, flow và state có source vector SVG. PNG và XMind preview là bản dẫn xuất.

| FIG ID | Loại / câu hỏi trả lời | Nguồn và liên kết hình | Giới hạn |
|---|---|---|---|
| FIG-UC00 | Use-case overview: vai trò có mục tiêu gì? | [Tổng quan](use-cases-overview.svg); UC catalog/quyền | Chọn mục tiêu tiêu biểu, không phải đủ 51 ellipse |
| FIG-UC01 | Use-case view: tài khoản/quản trị | [UC01–09](use-cases-access.svg) | Tác vụ dùng chung và quyền Admin khác nhau |
| FIG-UC02 | Use-case view: ticket/SLA/thông báo | [UC10–26](use-cases-ticket.svg) | Bộ lập lịch là trigger nội bộ, không human actor |
| FIG-UC03 | Use-case view: assets/report/audit | [UC27–33](use-cases-operations.svg) | Scope chi tiết theo permissions |
| FIG-UC04 | Use-case view: trợ lý theo yêu cầu | [UC-AI01–08](use-cases-ai.svg) | Preview/nháp khác mutation đã xác nhận |
| FIG-UC05 | Use-case view: work/automation/KB | [UC-OPS01–10](use-cases-work-management.svg) | AI thực hiện nội bộ; publisher là capability, không role thứ năm |
| FIG-FLOW01 | Activity flow: onboarding và ngoại lệ | [Automation](automation-flow.svg); Flow 8–10, BR-14–22 | Luồng nghiệp vụ minh họa; transaction chi tiết ở sequence |
| FIG-FLOW02 | Nghỉ phép và giao lại | [Replanning](replanning-flow.svg); Flow 9, BR-16–19 | Cửa sổ lịch DEMO; giữ lock/việc đang làm |
| FIG-FLOW03 | Primary flow: gửi và nghiệm thu yêu cầu | [Requester](../xmind/previews/07-flow-requester.svg); Journey 1, BR-04/08–10/14–20 | Public projection; task Done không tự đóng ticket |
| FIG-FLOW04 | Primary flow: kỹ thuật viên | [Technician](../xmind/previews/08-flow-technician.svg); Journey 2, BR-04/05/06/08/15/16 | Nhánh Task và Ticket có vòng đời riêng |
| FIG-FLOW05 | Primary flow: Trưởng phòng IT giám sát | [Trưởng phòng](../xmind/previews/09-flow-manager.svg); Journey 3, BR-16–19 | Policy/giám sát/ngoại lệ; không cấp Trưởng nhóm IT |
| FIG-FLOW06 | Luồng hỗ trợ: cấp phát và thu hồi | [Tài sản](../xmind/previews/10-flow-asset.svg); Flow 4, BR-11 | M/A mutation; AI không tự cấp thiết bị |
| FIG-FLOW07 | Luồng hỗ trợ: thu hồi quyền và chuyển giao | [Admin](../xmind/previews/11-flow-admin.svg); Flow 5, BR-01/05/12 | Khóa khẩn khi thiếu người thay cần quyết định D-40 |
| FIG-FLOW08 | Luồng hỗ trợ: lỗi/xung đột/retry | [Phục hồi lỗi](../xmind/previews/12-flow-conflict.svg); Flow 6, NFR | Không retry mù hoặc báo thành công khi chưa commit |
| FIG-FLOW09 | Luồng hỗ trợ: thông báo | [Thông báo](../xmind/previews/13-flow-notification.svg); Flow 7, BR-06/10/12/19 | Recheck quyền hiện tại, không lộ payload cũ |
| FIG-MAP01 | Product map: phân rã năng lực | [Product](../xmind/previews/01-product-map.svg); phạm vi/F/BR/quyền | Thiết kế mục tiêu; không là bằng chứng khảo sát doanh nghiệp |
| FIG-MAP06 | IA: nhóm thông tin và phạm vi màn hình | [IA](../xmind/previews/06-information-architecture.svg); SCR catalog/quyền | 36 mẫu; khung nhóm không tự cấp quyền |
| FIG-DAG01 | Task DAG onboarding | [Task và phụ thuộc](onboarding-task-dag.svg); Flow 8 | 6 task, công sức DEMO, nhánh song song; không tự đóng ticket |
| FIG-ST01 | Task transition view | [Task states](task-states.svg); BR-15 | 6 trạng thái/10 cạnh; guards đọc cùng BR-15 |
| FIG-ST02 | Approval decision và execution | [Approval states](approval-states.svg); BR-18 | Hai vùng vòng đời, Approved không phải Succeeded |
| FIG-ST03 | Ticket transition view | [Ticket states](ticket-states.svg); BR-04 | Không dùng trạng thái Task/approval thay trạng thái ticket |
| FIG-ST04 | Asset transition view | [Asset states](asset-states.svg); BR-11 | 4 trạng thái/8 cạnh; assignment là lịch sử riêng |
| FIG-ERD01 | ERD logic, ownership và cardinality | [Mô hình dữ liệu](../requirements/conceptual-data-model.md) | Chưa phải schema vật lý hoặc migration |
| FIG-ERD02 | ERD: Danh tính và tổ chức | [Danh tính và tổ chức](erd-identity.svg) | Khóa/trường logic chọn lọc, giữ cardinality nguồn tổng |
| FIG-ERD03 | ERD: Ticket, hội thoại và tệp | [Ticket, hội thoại và tệp](erd-ticket-sla.svg) | Khóa/trường logic chọn lọc, giữ cardinality nguồn tổng |
| FIG-ERD04 | ERD: Tài sản và lịch sử cấp phát | [Tài sản và lịch sử cấp phát](erd-assets.svg) | Khóa/trường logic chọn lọc, giữ cardinality nguồn tổng |
| FIG-ERD05 | ERD: Kế hoạch, task và dependency | [Kế hoạch, task và dependency](erd-work-plans.svg) | Khóa/trường logic chọn lọc, giữ cardinality nguồn tổng |
| FIG-ERD06 | ERD: Kỹ năng, lịch và allocation | [Kỹ năng, lịch và allocation](erd-workforce.svg) | Khóa/trường logic chọn lọc, giữ cardinality nguồn tổng |
| FIG-ERD07 | ERD: Policy, phiên bản và grant | [Policy, phiên bản và grant](erd-policy.svg) | Khóa/trường logic chọn lọc, giữ cardinality nguồn tổng |
| FIG-ERD08 | ERD: Sự kiện, thực thi và audit | [Sự kiện, thực thi và audit](erd-execution.svg) | Khóa/trường logic chọn lọc, giữ cardinality nguồn tổng |
| FIG-ERD09 | ERD: Kiến thức, ACL và chỉ mục | [Kiến thức, ACL và chỉ mục](erd-knowledge.svg) | Khóa/trường logic chọn lọc, giữ cardinality nguồn tổng |
| FIG-ERD10 | ERD: Hội thoại và nguồn tham chiếu | [Hội thoại và nguồn tham chiếu](erd-assistant.svg) | Khóa/trường logic chọn lọc, giữ cardinality nguồn tổng |
| FIG-ERD11 | ERD: Xác nhận ticket và chi phí AI | [Xác nhận ticket và chi phí AI](erd-confirmation-usage.svg) | Khóa/trường logic chọn lọc, giữ cardinality nguồn tổng |
| FIG-ERD12 | ERD: Snapshot và đồng hồ SLA | [Snapshot và đồng hồ SLA](erd-sla-clocks.svg) | Khóa/trường logic chọn lọc, giữ cardinality nguồn tổng |
| FIG-CTX01 | System context | [Context](system-context.svg); kiến trúc mục 1/2 | Phân biệt người dùng/hệ thống ngoài |
| FIG-CNT01 | Container và đường dữ liệu | [Container](system-containers.svg); kiến trúc mục 1–5 | Module không tự thành microservice |
| FIG-SEQ01 | Sequence model/transaction/approval | [Sequence lập/giao việc](automation-sequence.svg); BR-17–19 | Một lượt event; action tiếp theo vẫn kiểm lại |
| FIG-SEQ02 | Sequence duyệt và thực thi | [Approval execution](approval-sequence.svg); BR-18 | Approved khác Succeeded; revalidate sau quyết định |
| FIG-DEP01 | Deployment logic và phục hồi | [Deployment](deployment-topology.svg); kiến trúc mục 9 | Chưa hosting/HA/RPO/RTO đã chốt |
| FIG-CMP01 | C4 C3: API components | [API](c4-components-api.svg); [source/catalog](../architecture/c4/03-components.md) | Transport/identity/domain/UoW, không microservice |
| FIG-CMP02 | C4 C3: worker components | [Worker](c4-components-worker.svg); [source/catalog](../architecture/c4/03-components.md) | Claim/snapshot/model/revalidation/commit; queue riêng |
| FIG-CODE01 | C4 L4: code collaboration | [Assignment](c4-code-assignment.svg); [source](../architecture/c4/04-code.md) | Lớp/file dự kiến, chưa source code |

Bộ 27 preview trong [XMind](../xmind/README.md) gồm 18 mind map phân rã chủ đề (gồm Product và IA), 7 activity flow có hướng và 2 state graph FIG-ST03/04. Product/IA giữ bố cục mind map trung tâm và các nhánh hai phía; chỉ làm khung viền đậm và sáng hơn. Các flow có hướng dùng ký pháp hoạt động riêng. Không coi mind map kiến trúc/dữ liệu là thay thế FIG-CNT01 hoặc ERD logic. [Wireframe gallery](../design/wireframes/README.md) ghi screen coverage và dữ liệu minh họa, không là sơ đồ UML hoặc ứng dụng đã chạy.

## Kiến trúc context, container, sequence và deployment

Đọc [context, container, hai sequence và deployment](architecture.md) để theo dõi trust boundary, quyền sở hữu dữ liệu, model ngoài transaction, nhánh stale/approval và topology phục hồi. Không suy thứ tự thực thi từ association use case.

## Tổng quan theo vai trò

![Tổng quan bốn vai trò người dùng và danh tính điều phối nội bộ](use-cases-overview.svg)

Hình tổng quan chọn mục tiêu tiêu biểu; năm nhóm dưới đây liệt kê đủ từng mã. [Catalog](../03-use-cases.md) và [ma trận quyền](../requirements/permissions-matrix.md) quản lý điều kiện chi tiết.

## Tài khoản và quản trị — UC01–UC09

![Tài khoản và quản trị](use-cases-access.svg)

Chỉ Admin tạo user/role và cấu hình SLA mặc định. Policy nghiệp vụ của Manager thuộc UC-OPS02, khác cấu hình khả dụng AI UC-AI08.

## Ticket, SLA và thông báo — UC10–UC26

![Ticket, SLA và thông báo](use-cases-ticket.svg)

UC10 dùng chung Ticket service với UC-AI03 sau user xác nhận. Giữ state ticket/SLA 24/7; task/plan có mô hình riêng, AI chat/nhắc không first response.

## Tài sản, dashboard và audit — UC27–UC33

![Tài sản, dashboard và audit](use-cases-operations.svg)

Giữ một asset assignment hiệu lực; audit/report bổ sung workforce/automation qua UC-OPS09, KB qua UC-OPS10. Không có AI tự cấp phát hoặc tạo user từ nội dung ticket.

## Trợ lý theo yêu cầu — UC-AI01–08

![Hỏi đáp, tra cứu, xác nhận ticket, nháp phản hồi và cấu hình AI](use-cases-ai.svg)

Hội thoại dùng quyền user. Preview chưa xác nhận không tạo ticket; reply vẫn do IT duyệt/gửi. [UC/US/AC trợ lý](../ai/use-cases-stories-and-acceptance.md).

## Công việc, điều phối và kiến thức — UC-OPS01–10

![Task, workforce, policy, điều phối, ngoại lệ, audit và KB](use-cases-work-management.svg)

AI nền chỉ thực hiện trong policy; task đang làm/khóa/vượt quyền cần quyết định quản lý. Publisher KB là quyền được cấp, không tự thêm role người dùng.

## Automation, task DAG và điều phối lại

![Onboarding theo policy và nhánh ngoại lệ](automation-flow.svg)

![DAG sáu task onboarding DEMO](onboarding-task-dag.svg)

![Nghỉ phép và điều phối lại theo policy](replanning-flow.svg)

Nguồn: [Flow 8–10](../05-user-flows.md), [BR-14–22](../requirements/business-rules.md). Không giữ transaction/lock khi chờ model. Thiếu inventory/capacity hoặc stale không được ép thực thi.

## Task và phê duyệt có trạng thái riêng

![Trạng thái task](task-states.svg)

[BR-15](../requirements/business-rules.md): Blocked chỉ trở lại Ready sau kiểm lại; Done/Cancelled không tự mở lại; task Done không tự đóng ticket.

![Quyết định phê duyệt và trạng thái thực thi](approval-states.svg)

[BR-18](../requirements/business-rules.md): Approved khác Succeeded; quyết định và execution tách nhau. Duyệt vẫn kiểm policy/version/capacity; stale phải đánh giá lại.

## ERD, kiến trúc thông tin và XMind

[ERD logic theo miền](../requirements/conceptual-data-model.md) tách 11 góc nhìn có trường khóa và cardinality; nguồn tổng FIG-ERD01 giữ đầy đủ quan hệ. [IA](../04-information-architecture.md) định nghĩa đủ 36 mẫu screen. [XMind](../xmind/README.md) giữ các node UC/story/screen và notes truy về cùng nguồn Markdown; preview dùng hình nút/nhánh nối nhau, không bảng thẻ rút gọn.

Ảnh PNG tổng quan trong [wireframes](../design/wireframes/README.md) được đối chiếu với SVG hiện hành. Bản vẽ UI là minh họa, không chứng minh hành vi đã chạy. Archive UI cũ chỉ dùng cho lịch sử.
