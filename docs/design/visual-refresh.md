---
id: itoh-docs-design-visual-refresh
title: "Định hướng giao diện v0.4"
type: reference
domain: design
module: visual
tags: [design, visual, reference]
priority: 1
status: design-draft
owner: "Chủ đề tài"
approval: needs-review
updated: 2026-10-31
authority: primary
purpose: "Giải thích định hướng thị giác, bộ bàn giao và giới hạn độ phủ."
---

# Định hướng giao diện v0.4

Thiết kế được làm mới theo yêu cầu giao diện đẹp, thân thiện, uyển chuyển và icon rõ ràng. Phạm vi là bản vẽ và đặc tả; chưa có frontend, animation chạy thật hoặc chatbot đang hoạt động.

## Ngôn ngữ thị giác

Không gian làm việc dùng nền xanh xám rất nhạt, bề mặt trắng, màu xanh dương cho hành động chính. Card bo mềm và bóng nhẹ giúp phân vùng; bảng vẫn ưu tiên việc đọc nhiều dòng. Màu tím chỉ nhận diện trợ lý AI có thể bật/tắt khi vận hành. Giữ chữ tiếng Việt, lời dẫn ngắn và tên hành động cụ thể.

| Thành phần | Thiết kế mới | Mục đích |
|---|---|---|
| Điều hướng | Sidebar 244 px, icon cùng hệ nét, mục đang chọn xanh đậm và chữ trắng | Dễ nhận biết vị trí và chức năng |
| Header | Tiêu đề rõ, mô tả ngắn, một hành động chính theo nhiệm vụ | Định hướng ngay khi vào trang |
| Dashboard | Tách hàng đợi hiện tại khỏi phân tích theo kỳ, KPI có mô tả | Đọc đúng ý nghĩa số liệu |
| Ticket | Bộ lọc thành hàng riêng, dòng thoáng, mã và tiêu đề rõ cấp bậc | Quét danh sách nhanh |
| Chi tiết | Hội thoại là vùng chính; thông tin người yêu cầu, SLA và thiết bị ở bên | Giữ tập trung khi xử lý |
| Form | Nhãn trên input, chia nhóm nội dung, hướng dẫn cạnh trường | Giảm cảm giác quá tải |
| Mobile | Card một cột, CTA có chữ, câu hỏi chờ phản hồi được đưa lên trước | Dễ thao tác bằng tay |
| AI | Nhãn AI, nguồn, bản nháp chưa gửi và đường về form | Người dùng hiểu bước nào đã hoàn tất |

## Minh họa trang đăng nhập

Thay thẻ ticket minh họa bằng hình đội IT phối hợp quanh thiết bị và các kết nối hỗ trợ. Hình dùng tông xanh dương, điểm tím/mint nhẹ và nền trong suốt để hòa vào nền login. Đây là minh họa trang trí, không biểu diễn trạng thái ticket hoặc dữ liệu vận hành.

Nguồn ảnh: [login-it-support.png](illustrations/login-it-support.png). Tạo bằng công cụ imagegen tích hợp; giữ nguyên ảnh và kênh alpha. Bản [SVG login](wireframes/01-login.svg) nhúng ảnh PNG để mở độc lập; [bản vẽ toàn màn hình](wireframes/01-login.svg) và ảnh trong XMind được đồng bộ. Các trường đăng nhập, nội dung và vị trí form giữ nguyên.

<details>
<summary>Prompt tạo minh họa</summary>

```text
Use case: stylized-concept. Asset type: decorative hero illustration inside the left column of the IT Operations Hub login design. Generate a brand-new illustration, NOT a login screen, NOT a screenshot, NOT a ticket card. Subject: a welcoming internal IT support team connecting people and workplace devices: two or three elegant editorial illustrated adult coworkers collaborating around a laptop and a large desktop monitor, with a compact secure cloud/network hub and small linked device motifs. Tasteful contemporary enterprise SaaS editorial illustration with refined vector-like silhouettes, subtle soft dimensional shading, beautifully composed large simple forms and restrained details. Wide horizontal compact composition, approximately 1.9:1 aspect ratio, all subjects grouped together with balanced negative space and safe margin around edges; should remain clear at 620 by 330 CSS pixels. View at a slight isometric angle. Palette: cobalt blue #1D4ED8, powder blue, pale periwinkle, white, dark navy for accents, small lavender and mint accents; harmonizes with a light blue #EAF2FF login page. Friendly human proportions and natural professional poses, no photorealism. Soft ambient studio light and a very subtle grounding shadow under the group. Background genuinely transparent, no colored rectangular background, no frame. No text, no lettering, no numbers, no logos, no watermark. Avoid busy diagrams, fake UI text, floating dashboard or ticket cards, robots, chat bubbles, neon, excessive tiny icons. Deliver only the isolated illustration, ready to place in an existing login page.
```

</details>

## Bộ icon

Bộ [44 SVG độc lập](icons/) được vẽ riêng trên lưới 24×24, nét khoảng 1,85 px, đầu và góc tròn. Có thể sửa vector, đổi màu khi triển khai và dùng ở 20–24 px. Đây là tài sản thiết kế, chưa phải thư viện React.

| Ý nghĩa | Tệp | Cách dùng |
|---|---|---|
| Tổng quan | [dashboard.svg](icons/dashboard.svg) | Menu kèm chữ “Tổng quan” |
| Ticket cá nhân / hàng đợi | [ticket.svg](icons/ticket.svg), [inbox.svg](icons/inbox.svg) | Phân biệt yêu cầu của tôi với công việc IT |
| Tài sản cá nhân / phục vụ xử lý | [laptop.svg](icons/laptop.svg), [toolbox.svg](icons/toolbox.svg) | Menu theo quyền |
| Thông báo / SLA | [bell.svg](icons/bell.svg), [clock.svg](icons/clock.svg) | Thông báo mới khác với thời hạn |
| AI / ghi chú nội bộ | [ai.svg](icons/ai.svg), [lock.svg](icons/lock.svg) | Nhận diện tính năng và phạm vi nội dung |
| Đính kèm / gửi | [paperclip.svg](icons/paperclip.svg), [send.svg](icons/send.svg) | Luôn có chữ ở thao tác quan trọng |
| Bộ lọc / sắp xếp | [filter.svg](icons/filter.svg), [sort.svg](icons/sort.svg) | Hai tác vụ có nhãn riêng |
| Đã giải quyết / cảnh báo | [check-circle.svg](icons/check-circle.svg), [alert.svg](icons/alert.svg) | Đi cùng nhãn trạng thái, không chỉ dựa màu |

Không dùng cùng một icon cho nhiều hành động khác nghĩa trong cùng ngữ cảnh. Icon cạnh chữ là trang trí, tránh đọc lặp khi triển khai. Nút chỉ có icon phải có tên truy cập cụ thể, ví dụ “Mở thông báo”, “Đóng trợ lý AI”; tooltip là hỗ trợ thêm. Nút cần thao tác bằng Enter/Space và giữ hoặc trả focus phù hợp theo [hướng dẫn Button của WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/).

Xem [board icon và component](wireframes/14-icons-and-components.svg) hoặc [nguồn vector](wireframes/14-icons-and-components.svg). Mỗi icon có title/description trong SVG nguồn; tên truy cập của control vẫn cần thiết lập theo ngữ cảnh sử dụng.

## Uyển chuyển trong trải nghiệm

Giữ vị trí bảng, nội dung đang nhập, bộ lọc và vị trí đọc khi mở panel hoặc cập nhật dữ liệu. Trạng thái loading nằm ở vùng đang tải. Chuyển động ngắn hỗ trợ nhận biết mở/đóng và phản hồi thao tác; không trì hoãn thông báo lỗi hoặc kết quả nghiệp vụ. [Motion và responsive](motion-and-responsive.md) quy định thời lượng, focus, reduced motion và cách bố trí theo kích thước màn hình.

## Bộ bàn giao và ranh giới

### Dashboard và xử lý cấp tài khoản — D-29

[Dashboard cá nhân/trưởng phòng](wireframes/16-dashboard-requester.svg) dùng phạm vi Requester; [biến thể Admin](wireframes/17-dashboard-admin.svg) có hàng đợi dịch vụ/Tài khoản và lối quản trị; [ticket cấp tài khoản](wireframes/18-ticket-account-provisioning.svg) chỉ hiện thao tác tạo user cho Admin. Bộ phận/chức danh trưởng phòng không cấp thêm quyền dữ liệu. Các hình chỉ dùng SCR10, SCR12, SCR22 và liên kết SCR60 hiện có.

Hàng đợi Tài khoản gồm cả yêu cầu cấp mới và hỗ trợ khác, không dùng số này làm KPI cấp tài khoản. Tạo user và giải quyết ticket là hai thao tác riêng; không có trạng thái ticket “Chờ duyệt”; approval automation có vòng đời riêng. Các mốc 11:00/12:00 là hai thời điểm minh họa của cùng ví dụ TKT-000128. Xem [dữ liệu đối chiếu và hành vi](../requirements/account-provisioning.md).

### Thành phần hiện tại

- 16 bản UI: 13 bản lõi và 3 bản AI. Ba bản 16–18 bổ sung dashboard Requester/trưởng phòng, biến thể Admin và ticket cấp tài khoản trên các screen hiện có.
- 2 board bổ trợ: icon/component và storyboard responsive/motion; không tính là 2 màn hình sản phẩm mới.
- 44 icon SVG riêng; 18 ảnh UI/board được giữ bên trong bộ XMind tổng và UI/UX. Các bản PNG giao diện riêng đã được bỏ, tài liệu tham chiếu trực tiếp SVG.
- [Bản lưu v0.3](archive/ui-v0.3.zip) để đối chiếu với giao diện trước khi làm mới.

Giữ mã 33 UC/47 stories lõi, trạng thái ticket, SLA và lịch sử tài sản; thiết kế hiện hành thêm UC/US/AC-OPS, quyền theo policy và MET16–22. Đợt thị giác v0.4 trước đây không tạo nghiệp vụ mới; thiết kế hiện hành hiện bổ sung OPS theo tài liệu gốc. Menu AI trong bản vẽ minh họa cấu hình đang bật; khi AI bị tắt, ẩn mục AI và các điểm mở panel, các tác vụ thường vẫn dùng bình thường.

Hình có dữ liệu hư cấu và trạng thái minh họa. Chưa xác nhận usability với người dùng thực, chưa chứng minh khả năng truy cập hoặc responsive bằng một ứng dụng chạy thật. Xem [biên bản rà soát](../review-report.md) và [gallery](wireframes/README.md) để biết độ phủ.

## Giao diện công việc, điều phối và kiến thức

Bổ sung task/plan/workforce/coordination/approval/policy/KB theo SCR-OPS01–07, giữ nền sáng/xanh và hệ nét hiện có. Hình trợ lý 11–13 chỉ minh họa luồng trợ lý, không đại diện toàn bộ AI MVP. Nội dung xác nhận ticket/ranking/action/approval bám [UI/UX gốc](../07-uiux-specification.md); chưa có hi-fi riêng cho mọi màn OPS.

Ảnh trợ lý 11 nhúng XMind và PNG use-case tổng quan đã được tái xuất từ SVG hiện hành; các ảnh UI không đổi và archive v0.3 giữ phạm vi minh họa/lịch sử. Text specification/SVG quyết định nghiệp vụ, không dùng hình tĩnh làm nghiệm thu tính năng.
