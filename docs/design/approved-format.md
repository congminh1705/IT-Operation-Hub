---
title: "UI final Mac / Teal"
status: design-approved
owner: PO
approval: approved
approved_on: 2026-11-13
version: "1.3"
decision: D-51
---

# UI final — Mac / Teal

PO chốt ngày 13/11/2026. Đây là bản thiết kế duy nhất dùng để triển khai: **50 màn nội bộ Mac/Apple với xanh teal và một màn đăng nhập D-47 giữ nguyên**. Thay thế toàn bộ hướng tím D-50. Không đổi chức năng, quyền, dữ liệu, trạng thái hay thứ tự task.

- [Catalog toàn bộ 51 màn](final/index.html), [Manager](final/dashboard.html?role=manager), [đăng nhập](final/01-account.html#login).
- Nguồn chuẩn: HTML theo task, [mac.css](final/mac.css), [taste.css](final/taste.css), [taste.js](final/taste.js), [motion](final/assets/motion/motion.css). `mac.css` tải cuối, là lớp định nghĩa diện mạo hiện hành. Các stylesheet nền còn được dùng cho cấu trúc/login, không phải các phương án UI khác.
- [Scope từng task](implementation-scope.md): chỉ code màn, trạng thái và hành vi của task được giao. FE/INT/QA phải dùng cùng bản này.

| Thành phần | Chuẩn đã duyệt |
| --- | --- |
| Màu | Primary `#087F78`, hover `#076c65`; canvas `#f5f7f6`, surface trắng, sidebar `#eff3f1`; chữ `#25332f`, phụ `#5b6b65` |
| Điều hướng | Sidebar sáng, mục chọn teal/chữ trắng; icon và nhãn rõ, focus bàn phím |
| Font | Inter variable cục bộ đủ dấu tiếng Việt cho toàn bộ màn nội bộ; H1 28px/650 (mobile 26px), H2 18px/650, nội dung/bảng 14px, metadata 12–13px, input mobile 16px |
| Vật liệu | Panel 12px, nút/input 8px, dialog 18px; bóng nhẹ, toolbar trong mờ vừa phải, nền nội dung đặc và dễ đọc |
| KPI/SLA | Giữ viền sáng và chữ/số có màu amber/orange/blue/rose theo ý nghĩa; luôn kèm nhãn, không chỉ dùng màu |
| Bảng/tri thức | Bảng rõ hàng/cột, hover nhẹ; tri thức dạng danh sách biên tập, không biến mọi nội dung thành card |
| Điều phối | Night City nằm trong shell sáng, giữ tương tác nhóm/lớp và hàng đợi; khả năng tiếp nhận ở trên bên phải. Không thay bằng video hoặc thêm module 3D ngoài scope |
| AI Workspace | Giữ bố cục activity/chat/context/action/approval; đổi đồng bộ Inter/teal. Sáu SVG chỉ là tham chiếu, phải triển khai component có ngữ nghĩa và responsive thực tế |
| Motion | Hover/press ngắn, panel/dialog xuất hiện nhẹ; hỗ trợ reduced motion và reduced transparency. Không làm dữ liệu đang đọc tự di chuyển |
| Login | Giữ nguyên D-47: nền kiến trúc IT, điện mạch, form và hover nút mắt; không áp Mac/Teal vào login |

## Nghiệm thu theo task

### Màu trạng thái bắt buộc

Áp dụng cho badge, bảng, luồng xử lý, task, capacity, phương án đổi người và AI action: đang thực hiện/xử lý dùng xanh dương; sẵn sàng/hoàn tất dùng xanh lá; chờ duyệt/chờ phản hồi dùng vàng; bị chặn/thất bại/quá hạn dùng đỏ hồng; khóa/vô hiệu dùng xám. Trạng thái trung tính dùng xám nhạt. Teal là màu hành động chính, không thay thế toàn bộ màu trạng thái. Luôn giữ nhãn chữ; phân biệt chờ duyệt với đã duyệt, khóa phân công với đang thực hiện. Nguồn hiển thị hiện hành là `final/mac.css` và `final/taste.js`. Khi triển khai, ánh xạ từ enum nghiệp vụ, không suy đoán trạng thái từ nội dung nhãn như prototype.

Kiểm tra tất cả trạng thái thuộc scope task ở desktop/mobile; không kế thừa badge nền tối hoặc tô mọi số liệu thành teal. Bản chỉnh màu/bố cục mới nhất chưa có đối chiếu render đầy đủ; agent phải ghi evidence thực tế, không tái sử dụng kết quả kiểm tra của bản trước cho thay đổi mới.

Mở HTML đúng vai trò/trạng thái trước khi code. So sánh reference và ứng dụng cùng viewport; kiểm tra desktop, tablet, mobile, bàn phím, focus, contrast và reduced motion trong phạm vi task. Lưu evidence, cập nhật task nhỏ, history và current-context theo workflow. Commit từng task; nhánh theo phase; PR theo Parent và nhắc PO merge. Không coi thiết kế hoàn tất là task code hoàn tất.

## Bằng chứng và giới hạn

Bản được duyệt đã có 60 ảnh desktop/mobile/tablet, kiểm tra 443/443 desktop và 493/493 mobile reduced-motion. [Báo cáo review](../reports/design/final/mac-review-verification.md) giữ nguyên provenance: Taste gate còn 16 findings trên khung catalog, không được ghi thành pass. Các kết quả này kiểm tra thiết kế, không thay test ứng dụng. AI mobile hiện là canvas tham chiếu có cuộn; task FE phải xây responsive thực tế.

Kiểm tra hợp đồng: `python -B tools/design/verify_format.py` và `python -B tools/design/final/verify_baseline.py`. Chỉ đổi lock khi PO duyệt thay đổi UI.


### KPI brightness refinement

PO requested matching capacity/report summaries to overview KPI cards: white surfaces with a subtle color tint, a clear 1px colored frame and brighter 3px top edge. Labels and 30px values use readable amber/orange/blue/rose ink with restrained same-hue light; supporting text stays dark enough to read. Apply consistently to .stat and .metric in final/mac.css. These colors distinguish metrics, not task-state enums; preserve semantic badge colors. Login excluded.


### Shared header geometry

All post-login HTML screens share a 72px white toolbar, 32px desktop/16px mobile gutters, 40px icon controls, 32px avatar and 224px desktop navigation rail. Review banners are hidden outside the catalog. Screen-specific search/breadcrumb content and role permissions remain intact. Mobile retains its menu trigger. The original login is excluded; static AI compositions remain geometry references.


### Shared account block

Every sidebar uses the same bottom account block: default person avatar 36px, employee name 13px/650, role 12px, separator and full-width Profile action. Use final/assets/avatar-default.svg (decorative empty alt when the employee name is adjacent); preserve role-specific identity and permissions. Topbar avatar uses the same default asset. Six static AI references mirror this block; their profile drawing is reference-only, not an interactive application control. Login unchanged.


AI readability: completed step numbers are white on dark green circles; primary review actions use #087f78 with white labels; assignment-lock badges use pale gray and dark gray text. Secondary copy uses #52645d. Preserve geometry and all confirmation/approval boundaries.


Waiting approval exception: assignment-lock labels inside a pending reassignment/approval proposal use amber background #fff5df, border #ead39e and ink #82540b, as requested by PO. This indicates waiting for approval; general disabled/locked controls remain gray. Skill-confirmation labels are not pending states.


Coordination stepper: derive colors from execution state, never step position alone. Completed steps green, current pending approval amber, unexecuted steps gray. Connector colors must not imply future execution completed.
