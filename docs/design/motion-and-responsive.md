---
id: itoh-docs-design-motion-and-responsive
title: "Chuyển động và responsive v0.4"
type: reference
domain: design
module: responsive
tags: [design, responsive, reference]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Định nghĩa responsive, motion, focus và phương án thay thế dễ tiếp cận."
---

# Chuyển động và responsive v0.4

Đặc tả này hướng dẫn bước triển khai UI sau này. [Storyboard](wireframes/15-responsive-motion.svg) và [SVG nguồn](wireframes/15-responsive-motion.svg) là các khung hình tĩnh, chưa phải prototype tương tác hoặc animation thực thi. Các mốc thời gian dưới đây là lựa chọn thiết kế, không phải yêu cầu thời lượng của WCAG.

## Chuyển động có mục đích

| Tình huống | Đề xuất | Điều kiện |
|---|---|---|
| Hover / pressed | Đổi màu hoặc viền 120–160 ms | Không đổi kích thước, không đẩy chữ |
| Mở / đóng panel AI | 180–240 ms, trượt tối đa 16 px và fade nhẹ | Không tự mở; không che nút gửi hoặc đổi trạng thái |
| Dialog xác nhận | Fade 120–180 ms | Chỉ xuất hiện từ thao tác của người dùng; xử lý focus riêng |
| Filter / chuyển tab | Cập nhật vùng dữ liệu, fade tối đa 120 ms nếu cần | Giữ chiều cao shell, thể hiện selected ngay |
| Tải dữ liệu | Placeholder ổn định, chữ “Đang tải…” | Không biểu diễn tiến độ giả; không shimmer kéo dài |
| Thành công / lỗi | Phản hồi bằng chữ ngay sau kết quả | Không chờ animation; lỗi giữ lại gần trường/vùng liên quan |

Không parallax, bounce, tự cuộn hội thoại khi người dùng đang đọc, hoặc animation ăn mừng trong tác vụ vận hành. Thay đổi trạng thái luôn dựa trên kết quả nghiệp vụ; việc hiệu ứng kết thúc không xác nhận ticket đã được lưu.

Với `prefers-reduced-motion: reduce`, bỏ dịch chuyển, zoom và shimmer; dùng trạng thái tĩnh và cập nhật trực tiếp. Đây là cam kết thiết kế bổ sung, phù hợp định hướng cho phép tắt chuyển động không thiết yếu của [SC 2.3.3 — Animation from Interactions (AAA)](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html). Mục tiêu accessibility chung của sản phẩm vẫn là WCAG 2.2 AA; chưa kiểm chứng trên ứng dụng.

## Panel AI, focus và bàn phím

Desktop dùng panel cạnh nội dung, không phải modal: giữ focus ở nút mở, thông báo ngắn panel đã mở; Tab tới nội dung panel theo thứ tự có thể dự đoán. Có nút đóng có tên truy cập; nếu đóng khi focus đang trong panel, trả focus về nút mở. Không khóa Tab trong panel cạnh trang. Nếu nút mở không còn tồn tại sau điều hướng, đưa focus về heading thích hợp.

Ở chiều rộng hẹp, chuyển AI sang trang/khung riêng có nút quay lại. Không thu nhỏ trang ticket đến mức mất nút gửi. Khi quay lại, giữ bản nhập trong phạm vi phiên và quyền hiện tại; kiểm tra dữ liệu mới trước khi gửi. Không đưa bản nháp nhạy cảm vào URL hoặc lưu trình duyệt lâu dài khi chưa có chính sách dữ liệu.

Dialog nghiệp vụ vẫn có modal semantics, focus ban đầu hợp lý, giới hạn focus bên trong và trả focus về trigger khi đóng; không dùng quy tắc modeless của panel AI cho dialog. Nút chỉ icon cần tên truy cập và hỗ trợ bàn phím theo [WAI-ARIA APG — Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/).

## Các mức bố cục

Các breakpoint là đề xuất, cần kiểm tra lại bằng nội dung tiếng Việt dài và trình duyệt thực tế.

| Chiều rộng viewport | Bố cục | Dữ liệu và thao tác |
|---|---|---|
| ≥1280 px | Sidebar 244 px, topbar 76 px; nội dung 2 cột khi phù hợp | Bảng đầy đủ; chi tiết khoảng 2/3 nội dung và 1/3 ngữ cảnh |
| 768–1279 px | Sidebar chuyển drawer có nhãn; nội dung nới theo chiều rộng | Form/chi tiết một cột khi cần; bộ lọc mở vùng riêng; bảng cho cuộn cục bộ nếu cần |
| 320–767 px | Một cột; header ngắn; điều hướng drawer, CTA dễ bấm | Ticket thành card; form và ngữ cảnh xếp dọc; AI ở khung riêng |

Không ẩn SLA, trạng thái, người phụ trách hoặc nội dung câu hỏi chờ phản hồi chỉ để làm giao diện gọn. Card có link mã/tiêu đề; không bắt người dùng bấm một vùng không có nhãn. Bộ lọc đang áp dụng và tổng kết quả được giữ khi đổi kích thước. Quay về danh sách giữ filter, trang và vị trí đọc khi khả thi.

Nội dung dài xuống dòng; mã thiết bị dài cho phép ngắt an toàn. Thanh hành động chỉ sticky khi không che trường lỗi, focus hoặc bàn phím ảo; có safe-area và khoảng trống cuối nội dung. Ở 320 px hoặc zoom lớn, tránh cuộn ngang toàn trang; bảng dữ liệu thật sự hai chiều có vùng cuộn được đặt tên, thao tác cốt lõi vẫn có lối truy cập.

## Icon, vùng bấm và kiểm chứng

Icon nhìn thấy 20–24 px; chọn vùng bấm **44×44 px cho thao tác chính/mobile**. Đây là mục tiêu riêng để dễ sử dụng. [SC 2.5.8 — Target Size Minimum (AA)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) quy định 24×24 CSS px cùng các ngoại lệ; không diễn giải 44 px là bắt buộc của tiêu chí này. Các control nhỏ trong bản vẽ vẫn phải được kiểm tra vùng tương tác thực lúc triển khai.

Các bước review chưa thực hiện trên UI chạy thật:

- Kiểm tra 320/390/768/1024/1440 px, zoom, tiếng Việt dài và bàn phím ảo.
- Tab/Shift+Tab/Enter/Space/Escape, focus sau mở/đóng panel và dialog.
- Bật reduced motion; không mất trạng thái hoặc kết quả khi tắt hiệu ứng.
- Mở panel khi đang nhập, lỗi mạng, đổi quyền và xung đột dữ liệu; không mất bản nhập hoặc lộ dữ liệu.
- Đối chiếu label, thông báo cho screen reader, tương phản và kích thước vùng bấm.

Các bước này kiểm chứng trải nghiệm; không thay thế test phân quyền backend, máy trạng thái hoặc SLA.

## Task board, DAG và phê duyệt

Board phải có list/table và action bàn phím thay kéo thả; không animate chuyển task trước server xác nhận trạng thái. DAG có dependency list, không yêu cầu pan/zoom bằng chuột để đọc nội dung thiết yếu. Mobile hiển thị task/card và approval diff tuần tự “Hiện tại → Dự kiến → Tác động”.

Polling 30 giây chỉ tab hoạt động giữ vị trí/focus/form; run/action mới có thông báo ngắn, không tự nhảy tới cuối timeline. Không animation “AI đã giao” hoặc thanh tiến độ phần trăm khi chưa có dữ liệu thực. Reduced motion áp cho cả OPS; keyboard/focus/reading order vẫn phải kiểm khi có UI.
