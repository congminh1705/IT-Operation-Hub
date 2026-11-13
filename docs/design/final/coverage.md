---
title: "Final screen coverage"
status: design-approved
owner: PO
approval: approved
updated: 2026-11-10
version: "1.1"
decision: D-47
---
> **Current presentation: v1.3 / D-51, approved by PO.** See [approved format](../approved-format.md). All post-login screens use the selected Mac/Teal style; only coordination uses Night City; login stays unchanged. Current sources and renders cover all 47 grouped screens and four dashboards. Earlier measurements below remain historical evidence; application implementation and individual PO visual acceptance remain task-owned.


# Final screen coverage

Eight groups / 47 specimens and four role dashboards cover the existing 36 IA patterns. Specimens can represent states of the same pattern.

## 01-account

| Specimen | IA pattern | Role |
|---|---|---|
| [Đăng nhập](01-account.html#login) | SCR01 | public |
| [Hồ sơ cá nhân](01-account.html#profile) | SCR02 | requester |
| [Đổi mật khẩu](01-account.html#security) | SCR03 | requester |

## 02-tickets

| Specimen | IA pattern | Role |
|---|---|---|
| [Danh sách ticket](02-tickets.html#tickets) | SCR20 | manager |
| [Yêu cầu của tôi](02-tickets.html#my-tickets) | SCR20 | requester |
| [Tạo yêu cầu](02-tickets.html#create) | SCR21 | requester |
| [Chi tiết · Kỹ thuật viên](02-tickets.html#ticket-it) | SCR22 | technician |
| [Chi tiết · Chờ phản hồi](02-tickets.html#ticket-requester) | SCR22 | requester |
| [Chi tiết · Theo dõi](02-tickets.html#ticket-active) | SCR22 | requester |
| [Chi tiết · Chờ xác nhận](02-tickets.html#ticket-result) | SCR22 / SCR24 | requester |
| [Yêu cầu cấp tài khoản](02-tickets.html#provision) | SCR22 / SCR60 | admin |
| [Phân công / tiếp nhận](02-tickets.html#assign) | SCR23 | manager |
| [Xử lý trạng thái](02-tickets.html#transition) | SCR24 | technician |
| [Đổi ưu tiên](02-tickets.html#priority) | SCR25 | manager |

## 03-work

| Specimen | IA pattern | Role |
|---|---|---|
| [Bảng công việc](03-work.html#work) | SCR-OPS01 | manager |
| [Công việc của tôi](03-work.html#my-work) | SCR-OPS01 | technician |
| [Kế hoạch & phụ thuộc](03-work.html#plan) | SCR-OPS02 | manager |
| [Tiến độ & kết quả](03-work.html#progress) | SCR-OPS01 / SCR-OPS02 | technician |

## 04-workforce

| Specimen | IA pattern | Role |
|---|---|---|
| [Nhân sự & capacity](04-workforce.html#workforce) | SCR-OPS03 | manager |

## 05-ai

| Specimen | IA pattern | Role |
|---|---|---|
| [Workspace · Bình thường](05-ai.html#ai-normal) | SCR-AI01 / SCR-AI02 / SCR-OPS04 | manager |
| [Workspace · Nhân viên](05-ai.html#ai-requester) | SCR-AI01 / SCR-AI02 | requester |
| [Workspace · Kỹ thuật viên](05-ai.html#ai-tech) | SCR-AI01 / SCR-AI02 | technician |
| [Workspace · Ngoại lệ](05-ai.html#ai-exception) | SCR-OPS04 | manager |
| [Workspace · Phê duyệt](05-ai.html#ai-approval) | SCR-OPS05 | manager |
| [Workspace · Trạng thái](05-ai.html#ai-states) | SCR-AI01 / SCR-AI02 | requester |
| [Chính sách & workflow](05-ai.html#policies) | SCR-OPS06 | manager |

## 06-knowledge-assets

| Specimen | IA pattern | Role |
|---|---|---|
| [Kho kiến thức](06-knowledge-assets.html#knowledge) | SCR-OPS07 | requester |
| [Bài viết & nguồn](06-knowledge-assets.html#article) | SCR-OPS07 | requester |
| [Phiên bản & quyền bài viết](06-knowledge-assets.html#knowledge-edit) | SCR-OPS07 | manager |
| [Danh sách tài sản](06-knowledge-assets.html#assets) | SCR30 | manager |
| [Thiết bị của tôi](06-knowledge-assets.html#my-assets) | SCR30 / SCR32 | requester |
| [Thêm / sửa tài sản](06-knowledge-assets.html#asset-form) | SCR31 | manager |
| [Hồ sơ tài sản](06-knowledge-assets.html#asset) | SCR32 | manager |
| [Cấp phát / thu hồi](06-knowledge-assets.html#asset-action) | SCR33 | manager |

## 07-monitoring

| Specimen | IA pattern | Role |
|---|---|---|
| [Báo cáo](07-monitoring.html#reports) | SCR40 | manager |
| [Thông báo](07-monitoring.html#notifications) | SCR50 | requester |
| [Nhật ký hoạt động](07-monitoring.html#audit) | SCR65 | manager |

## 08-admin-states

| Specimen | IA pattern | Role |
|---|---|---|
| [Người dùng](08-admin-states.html#users) | SCR60 | admin |
| [Tạo người dùng](08-admin-states.html#user-create) | SCR60 | admin |
| [Phòng ban](08-admin-states.html#departments) | SCR61 | admin |
| [Nhóm & thành viên](08-admin-states.html#teams) | SCR62 | admin |
| [Danh mục](08-admin-states.html#categories) | SCR63 | admin |
| [Chính sách SLA](08-admin-states.html#sla) | SCR64 | admin |
| [Cấu hình trợ lý AI](08-admin-states.html#ai-settings) | SCR-AI03 | admin |
| [Không có quyền](08-admin-states.html#forbidden) | SCR90 | requester |
| [Không tìm thấy](08-admin-states.html#not-found) | SCR91 | requester |
| [Loading / rỗng / lỗi](08-admin-states.html#states) | SHARED | requester |

## Dashboards

- [requester](dashboard.html?role=requester)
- [technician](dashboard.html?role=technician)
- [manager](dashboard.html?role=manager)
- [admin](dashboard.html?role=admin)
