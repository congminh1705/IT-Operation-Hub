# FE-18.02 — Đối chiếu đăng nhập và phản hồi

Chrome chụp ứng dụng và mẫu ở 1440 × 1000 và 390 × 1000 với chế độ giảm chuyển động.

| Trạng thái | Desktop | Mobile |
| --- | --- | --- |
| Đăng nhập D-47 | [Ứng dụng](actual-login-1440.png) · [Mẫu](reference-login-1440.png) | [Ứng dụng](actual-login-390.png) · [Mẫu](reference-login-390.png) |
| Loading, rỗng, lỗi, xung đột | [Ứng dụng](actual-states-1440.png) · [Mẫu](reference-states-1440.png) | [Ứng dụng](actual-states-390.png) · [Mẫu](reference-states-390.png) |

- Đăng nhập giữ nền kiến trúc, thẻ tối, nút vàng và trạng thái nút mắt. Bản ứng dụng có trình chọn tài khoản DEMO thay cho liên kết về catalog của mẫu. Thẻ mobile thấp hơn mẫu một chút. Bàn phím, nút tạm dừng và giảm chuyển động đều được kiểm tra trên ứng dụng. Ca 200% dùng CSS zoom trong Chrome.
- Trang kiểm tra thành phần của ứng dụng đặt các trạng thái trong lưới riêng, dùng skeleton trung tính, lỗi viền đỏ và xung đột nền vàng. Mẫu đặt các thẻ tương đương trong shell làm việc. Trong ứng dụng, danh sách ticket dùng cùng thành phần cho loading, rỗng và lỗi có thử lại.
- Các ca Chrome kiểm tra dữ liệu nhập được giữ khi gửi lỗi hoặc xung đột, thu hồi phiên xóa nội dung, và hai tab DEMO giữ dữ liệu độc lập. Kiểm thử QueryClient kiểm tra 30 giây, dừng khi tab ẩn hoặc mất focus và loại kết quả trả muộn sau khi mất phạm vi. Danh sách ticket thật đã đăng ký luồng đọc này. Các màn DEMO khác vẫn đọc theo các tương tác đã triển khai ở từng task.

Agent đã đối chiếu hai cặp trạng thái. Kết luận nghiệm thu của PO đang chờ.
