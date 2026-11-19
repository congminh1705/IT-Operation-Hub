# FE-03.02 — Đối chiếu và cách kiểm tra

- Agent đối chiếu 2026-11-17, Chromium desktop 1440×1000 và mobile 390×1000, reduced motion. Đã mở cả hai HTML trước khi sửa UI/session.
- Login: [desktop mẫu](reference-login-1440.png) / [ứng dụng](actual-login-1440.png); [mobile mẫu](reference-login-390.png) / [ứng dụng](actual-login-390.png).
- Workspace requester: [desktop mẫu](reference-workspace-1440.png) / [ứng dụng](actual-workspace-1440.png); [mobile mẫu](reference-workspace-390.png) / [ứng dụng](actual-workspace-390.png).
- Login giữ CSS/markup đã được PO duyệt; eye icon đổi trạng thái, hover trong suốt, giữ focus/selection được browser test xác minh. Trên mobile card ứng dụng thấp hơn mẫu khoảng 18px; app có helper DEMO thay footer catalog. Không tự chỉnh lại thiết kế đã duyệt.
- Workspace tái sử dụng shell FE-02.03: rail 224px, toolbar 72px, Mac/Teal, menu mobile; tên/người dùng lấy từ mock session. Header tìm kiếm và logo shell khác nội dung dashboard specimen; đã có từ foundation. KPI/ticket/dashboard nghiệp vụ nằm ngoài FE-03.02, nên vùng chính cố ý hiển thị chức năng chưa triển khai. Không coi screenshot này là dashboard hoàn chỉnh.
- Missing/out-of-scope dùng Feedback chung với cùng thông báo không tiết lộ bản ghi; không có specimen riêng cho session-checking, dùng status text. Không có private shell trong HTML ban đầu.
- PO đã duyệt login và nút mắt theo chỉ dẫn bàn giao; PO chưa nghiệm thu chức năng/session và các ảnh FE-03.02 này. Agent self-review không thay PO approval.

## Kiểm tra PO

Ứng dụng local: http://127.0.0.1:3102/login . Nếu server dừng: tại src/frontend chạy `pnpm.cmd exec next start --hostname 127.0.0.1 --port 3102` (đã build).

Tài khoản tổng hợp: requester@demo.invalid, technician@demo.invalid, it_manager@demo.invalid, admin@demo.invalid. Mật khẩu DEMO bất kỳ không rỗng, ví dụ `demo`; không dùng mật khẩu thật.

1. Đăng nhập lần lượt từng vai trò, kiểm tra tên/sidebar và đường dẫn /tickets?scope=work. Requester chỉ có scope mine; quản trị chỉ hiện cho Admin.
2. Đăng xuất từ menu tài khoản, dùng Back: không xuất hiện nội dung cũ. Reload làm mất phiên vì mock chỉ giữ trong bộ nhớ.
3. Mở /admin/users khi chưa đăng nhập: về login. Với Requester đã đăng nhập, dùng /login?returnTo=%2Fadmin%2Fusers: generic forbidden.
4. Thử /login?returnTo=https%3A%2F%2Fevil.invalid: đăng nhập xong chỉ về /dashboard.
5. Harness độc lập http://127.0.0.1:3102/preview/session (không nằm trong product navigation): chọn vai trò, Load private query, Start late query, Expire/Revoke/Logout/Query 401. Private DOM biến mất/cache idle. Resolve late query không khôi phục dữ liệu. Thử đổi REQUESTER → ADMIN hoặc REQUESTER → REQUESTER khi query đang pending.
6. Trong harness, chọn ADMIN, chọn Expire/Revoke after navigation rồi Open workspace: shell biến mất và về login. Đăng nhập lại bằng Requester.
7. Mobile/keyboard: nút mắt, giữ vùng chọn, menu, không cuộn ngang. Đối chiếu các ảnh nêu trên.

## Kết quả và giới hạn

[Browser log](browser.log): 58 pass, 2 skipped (hai capture tùy chọn của FE-02; ảnh bắt buộc FE-03.02 đã chạy). 23 test FE-03.02 đều pass. [Unit](unit.log): 91 pass. [Typecheck](typecheck.log), [lint](lint.log), [format](format.log), [build](build.log).

Lần chạy đầu có lỗi type inference ở harness và import alias Vitest; đã sửa. Một test sửa trực tiếp href DOM không đổi prop Next Link nên đi sai route; đã thay bằng Link fixture thật và kiểm tra lại pass. Lần thử bật capture tùy chọn cũ gặp 404 resource của design server; không sửa thiết kế ngoài scope. Lần cuối để hai capture này skipped; không ghi chúng pass. CodeGraph dùng trước khi đọc code; một truy vấn sau đó lỗi Transport closed, nên đọc trực tiếp đúng các file còn thiếu.

Frontend DEMO thuần bộ nhớ, không cookie/CSRF/backend/production authorization. Đồng hồ expiry là đồng hồ fixture điều khiển rõ ràng, không định nghĩa TTL doanh nghiệp. Harness và preview chỉ dữ liệu tổng hợp; không triển khai profile/password/dashboard hay task tiếp theo. Browser coverage Chromium, không xác nhận Safari/Firefox hoặc thiết bị vật lý.
