# Design system đề xuất — v0.4

Đây là specification, chưa phải thư viện component hay Tailwind/shadcn đã cài đặt. Nhận diện riêng cho công cụ doanh nghiệp, dùng nền sáng và xanh dương theo đề bài.

## Nền tảng thị giác

| Token | Giá trị | Cách dùng |
|---|---|---|
| Brand/primary | `#1D4ED8` | Primary action, link và lựa chọn hiện tại |
| Primary hover | `#1E40AF` | Hover/pressed có tương phản |
| Primary surface | `#EEF4FF` | Thông tin phụ và icon; nav đang chọn dùng primary với chữ trắng |
| Canvas | `#F4F7FC` | Nền workspace |
| Surface | `#FFFFFF` | Card, table, dialog |
| Text strong | `#15263D` | Heading/body quan trọng |
| Text secondary | `#52637A` | Metadata, mô tả |
| Border decorative | `#E4EBF4` | Phân cách panel; không dùng làm dấu hiệu duy nhất nhận input |
| Control boundary | `#64748B` | Viền input/control khi cần nhận biết |
| Focus | `#1D4ED8`, vòng2 px + khoảng cách2 px | Focus visible; kiểm tra trên từng nền |
| Success | Text `#166534`, nền `#ECFDF3` | Resolved, thành công |
| Warning | Text `#92400E`, nền `#FFF6DF` | Pending, sắp hạn |
| Danger | Text `#B91C1C`, nền `#FFF0F0` | Lỗi, quá hạn, thao tác hủy |
| Neutral | Text `#52637A`, nền `#EFF3F8` | Closed, metadata |

Màu token không đồng nghĩa mọi component tự động đạt chuẩn. Kiểm tra từng cặp foreground/background, focus và trạng thái disabled khi triển khai.

Font body Inter nếu có, fallback Segoe UI/Arial/sans-serif hỗ trợ tiếng Việt. Body14–16 px, line-height1,5; metadata12–13 px, không dùng chữ nhỏ cho nội dung thiết yếu. Heading page28–30/36, section17–19/26, số KPI36/44. Mã ticket dùng tabular numbers; không font trang trí.

Spacing theo4 px:4/8/12/16/20/24/28/32. Desktop1440 px: sidebar244 px, topbar76 px, nội dung cách sidebar32 px; khoảng cách panel20 px. Radius input/button10–11 px, card17 px, badge bo tròn; shadow nhẹ màu xanh xám. Nav đang chọn nền primary và chữ/icon trắng. Không dùng blur/gradient nặng làm giảm đọc bảng. Icon20–24 px, lưới24 px và nét khoảng1,85 px; vùng bấm mục tiêu44 px cho tác vụ chính/mobile.

Bộ [44 icon SVG](icons/) và [board component](wireframes/14-icons-and-components.svg) thống nhất nét, góc và ý nghĩa. Nút quan trọng có cả icon lẫn chữ; icon trang trí không được đọc lặp, nút chỉ icon có tên truy cập theo hành động. Xem [định hướng thị giác](visual-refresh.md) và [motion/responsive](motion-and-responsive.md). Viền input trong bản vẽ là đề xuất thị giác; khi triển khai cần kiểm tra và dùng token Control boundary nếu viền là dấu hiệu thiết yếu để nhận biết control.

## Trạng thái và ngữ nghĩa

| Đối tượng | Nhãn và style |
|---|---|
| New | Mới, xanh dương |
| Open | Đã tiếp nhận, xanh dương nhạt |
| In Progress | Đang xử lý, xanh dương đậm |
| Pending | Chờ phản hồi, vàng/nâu |
| Resolved | Đã giải quyết, xanh lá |
| Closed | Đã đóng, xám |
| Cancelled | Đã hủy, xám/đỏ nhẹ |
| P1/P2/P3/P4 | Luôn có P+số và nhãn Nghiêm trọng/Cao/Trung bình/Thấp; không dùng chỉ chấm màu |
| SLA | Còn hạn / Sắp quá hạn / Đã quá hạn / Tạm dừng / Đã phản hồi / Đã giải quyết; trạng thái lịch sử có chữ riêng |

Priority, status và SLA là ba chiều khác nhau; không dùng một badge “Cao” để thay tất cả. Badge không hành động thì không trông giống button.

## Hợp đồng component

| Component | Biến thể và trạng thái cần có |
|---|---|
| Button | Primary, secondary, text, danger; default/hover/focus/disabled/loading; action có label |
| Input/select | Label luôn có; required có giải thích; hint; invalid với text; disabled nêu lý do nếu cần |
| Textarea | Nhãn audience, giới hạn, lỗi; cho xuống dòng; không gửi khi chỉ nhấn Enter |
| Combobox | Search trong tập có quyền; keyboard arrows/Enter/Escape; empty và loading; không tự tải danh sách cấm |
| Table | Caption/heading, header có tên, sort state, link mã focusable, pagination; không row click là cách duy nhất |
| Filter chip | Tên filter và giá trị; nút xóa có tên “Bỏ bộ lọc…”; clear all |
| Tabs | Selected/focus phân biệt, điều hướng bàn phím, panel có tên; không render tab nội bộ cho R |
| Dialog | Title/description, focus vào điểm phù hợp, trap, Escape có kiểm soát, trả focus về trigger |
| Alert/banner | Info/warning/error/success có text; lỗi quan trọng giữ lại, không chỉ toast tự biến mất |
| Toast | Thành công ngắn, không là nơi duy nhất chứa lỗi/giải pháp; live announcement phù hợp |
| SLA card | Tên đồng hồ, ngân sách, đã dùng/còn lại, trạng thái pause/dừng, breach history |
| Attachment item | Tên, định dạng, kích thước, trạng thái tải/gửi; remove chỉ trước khi gửi |
| Empty/error panel | Giải thích có dữ liệu hay không, filter reset/retry theo quyền |

## Accessibility target

Mục tiêu [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/): body text≥4,5:1; chữ lớn≥3:1; các dấu hiệu giao diện thiết yếu≥3:1 khi tiêu chí áp dụng. Màu phải có nhãn chữ/icon bổ trợ. Kiểm tra thứ tự heading/label, error association, table semantics và live announcements.

Theo [SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), mức AA có ngưỡng24×24CSSpx với ngoại lệ; thiết kế chọn vùng bấm44 px cho tác vụ chính/mobile để dễ dùng. Focus phải rõ và không bị che hoàn toàn; mục tiêu thiết kế cao hơn là không che focus bởi sticky header/footer. Bàn phím thao tác được mọi chức năng, không trap ngoài dialog có chủ đích.

Không ngăn paste vào password. Không dựa riêng tooltip hover cho điều kiện nghiệp vụ. Tôn trọng reduced motion. Không tuyên bố SVG wireframe đã chứng minh screen reader, semantic HTML hoặc conformance của ứng dụng.

## Component bổ sung cho trợ lý AI

Tái dùng token hiện có. Thêm message bubble có nhãn “Trợ lý AI”, source card với tên/version/time, badge phạm vi Công khai/Nội bộ, draft card có CTA chuyển về form, loading có Dừng và error panel có lối dùng chức năng thường. Không dùng badge “đã xử lý” cho một câu trả lời AI; không hiển thị phần trăm độ tin cậy nếu chưa có cơ sở đo.

Panel AI không tự mở hoặc che thao tác chính. Mở/đóng giữ focus và dữ liệu form; stream chỉ thông báo thay đổi có kiểm soát, không đọc lại toàn bộ từng token cho screen reader. Nháp chỉ được chuyển sau khi sinh xong và nguồn/quyền đã kiểm tra; khi lỗi hoặc dữ liệu stale thì không có CTA gửi ngầm.
