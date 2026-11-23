# FE-18.01 — Đối chiếu điểm vào bốn vai trò

Mở [catalog đã duyệt](../../../design/final/index.html) trong Chrome và xác nhận 51 mục. Catalog dẫn tới màn tham chiếu. Bằng chứng dưới đây chụp riêng màn nghiệp vụ tương ứng với ứng dụng sau đăng nhập, ở 1440 × 1000 và 390 × 1000.

| Vai trò | Desktop | Mobile |
| --- | --- | --- |
| requester | [Ứng dụng](actual-requester-dashboard-1440.png) · [Mẫu](reference-requester-dashboard-1440.png) | [Ứng dụng](actual-requester-dashboard-390.png) · [Mẫu](reference-requester-dashboard-390.png) |
| technician | [Ứng dụng](actual-technician-dashboard-1440.png) · [Mẫu](reference-technician-dashboard-1440.png) | [Ứng dụng](actual-technician-dashboard-390.png) · [Mẫu](reference-technician-dashboard-390.png) |
| manager | [Ứng dụng](actual-manager-dashboard-1440.png) · [Mẫu](reference-manager-dashboard-1440.png) | [Ứng dụng](actual-manager-dashboard-390.png) · [Mẫu](reference-manager-dashboard-390.png) |
| admin | [Ứng dụng](actual-admin-dashboard-1440.png) · [Mẫu](reference-admin-dashboard-1440.png) | [Ứng dụng](actual-admin-dashboard-390.png) · [Mẫu](reference-admin-dashboard-390.png) |

- Requester có nút tạo yêu cầu, mục cần phản hồi, thiết bị và danh sách yêu cầu. Ứng dụng dùng hai KPI từ dữ liệu DEMO và bố cục danh sách gọn hơn. Mẫu có bốn KPI trạng thái, thẻ theo dõi nổi bật và bộ lọc ngay trên dashboard.
- Technician có liên kết công việc cá nhân, thứ tự xử lý, yêu cầu trong phạm vi và thiết bị. Mẫu có biểu đồ theo tuần và khối bắt đầu ca riêng. Ứng dụng dùng các liên kết tới màn sở hữu thao tác tương ứng.
- Manager và Admin có KPI hàng đợi, bảo hành và liên kết nghiệp vụ theo vai trò. Mẫu có Night City, bộ lọc nhóm và khối khả năng tiếp nhận ngay trên dashboard. Ứng dụng dùng lối vào các màn điều phối và nhân sự. Đây là sai khác đã ghi nhận ở FE-16.02, còn hiện diện trong ảnh xác nhận FE-18.
- Cả bốn vai trò giữ shell Mac/Teal. Bản ứng dụng dùng chip số thật trên chuông và dòng DEMO rõ. Mẫu dùng số liệu tạo sẵn, màu KPI theo trạng thái và khoảng cách khác. Kiểm tra tự động xác nhận thân trang không cuộn ngang ở cả hai kích thước.

Đối chiếu của agent xác nhận điểm vào và các thao tác gốc. PO còn cần xác nhận các sai khác khi nghiệm thu Parent. [Ma trận 51 mẫu](coverage.md) · [Log bốn vai trò](playwright.log).
