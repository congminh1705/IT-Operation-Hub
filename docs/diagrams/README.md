# Sơ đồ Use Case — xem trực tiếp

Các file SVG bên dưới là bản hình của ba nguồn PlantUML, được xuất cục bộ bằng PlantUML 1.2026.9. Giữ nguyên actor, use case, quan hệ và ghi chú trong nguồn `.puml`. SVG tổng quan là bản tóm lược có sẵn.

## Cách xem

- **VS Code:** mở README này rồi nhấn **Ctrl + Shift + V** để xem toàn bộ hình; hoặc nhấp phải file `.svg` → **Open With… → Image Preview**. Bản VS Code có hỗ trợ SVG trong Image Preview sẽ hiển thị hình, không cần extension PlantUML. [Tài liệu VS Code](https://code.visualstudio.com/updates/v1_97#_svg-image-preview-support).
- **GitHub:** mở thư mục `docs/diagrams` để xem README này, hoặc mở trực tiếp từng file SVG. [Các định dạng ảnh GitHub hỗ trợ](https://docs.github.com/en/repositories/working-with-files/using-files/working-with-non-code-files).
- **Chỉnh sửa sơ đồ:** sửa nguồn `.puml`, sau đó xuất lại SVG tương ứng bằng PlantUML. Hai định dạng có cùng tên để dễ đối chiếu.

## Tài khoản và quản trị — UC01–UC09

![Use Case tài khoản và quản trị — UC01 đến UC09](use-cases-access.svg)

[Mở SVG](use-cases-access.svg) · [Nguồn PlantUML](use-cases-access.puml)

## Ticket, SLA và thông báo — UC10–UC26

![Use Case ticket, SLA và thông báo — UC10 đến UC26](use-cases-ticket.svg)

[Mở SVG](use-cases-ticket.svg) · [Nguồn PlantUML](use-cases-ticket.puml)

## Tài sản, dashboard và nhật ký — UC27–UC33

![Use Case tài sản, dashboard và nhật ký — UC27 đến UC33](use-cases-operations.svg)

[Mở SVG](use-cases-operations.svg) · [Nguồn PlantUML](use-cases-operations.puml)

## Tổng quan theo vai trò

![Tổng quan Use Case theo vai trò](use-cases-overview.svg)

Đối chiếu với [catalog 33 use case](../03-use-cases.md) và [ma trận quyền](../requirements/permissions-matrix.md). Association actor–use case không tự cấp quyền trên mọi bản ghi. Bộ [XMind Use Cases](../xmind/02-use-cases.xmind) vẫn phục vụ chỉnh sửa bản đồ actor–goal.
