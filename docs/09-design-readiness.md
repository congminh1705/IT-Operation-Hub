# Checklist thiết kế và lộ trình M1–M6

Quy ước: `[x]` là **đã có tài liệu/bản vẽ trong lần bàn giao này**, `[ ]` là **chưa triển khai hoặc chưa kiểm chứng**. Không chuyển nghĩa `[x]` thành tính năng đã hoạt động.

## Hoàn thành phạm vi tài liệu hiện tại

- [x] Đánh giá hiện trạng dự án, phạm vi và cơ sở thiết kế.
- [x] Research top down, problem framing, proto-personas, JTBD và giả thuyết.
- [x] Phạm vi MVP, phần sau MVP, danh mục năng lực và quyết định đề xuất.
- [x] 33 use case, sơ đồ XMind theo actor và phụ lục UML.
- [x] 47 user stories, AC tương ứng và review INVEST chỉ rõ story cần refinement.
- [x] IA, inventory 26 mẫu màn hình/tương tác và navigation theo quyền.
- [x] Journeys/task flows và quy tắc trạng thái, quyền, SLA, asset.
- [x] Design system, nội dung, trạng thái, responsive và mục tiêu accessibility.
- [x] Bộ 16 bản UI v0.4 (13 lõi + 3 AI), gồm dashboard cá nhân/Admin và chi tiết D-29, 2 board bổ trợ và 44 icon SVG; danh mục phần chưa vẽ riêng.
- [x] Đặc tả chuyển động, reduced motion, focus và bố cục desktop/tablet/mobile.
- [ ] Prototype tương tác, animation thực thi và kiểm chứng responsive trên ứng dụng.
- [x] File XMind tổng 27 sheet, 8 file chuyên đề và ảnh xem nhanh, gồm phần AI tùy chọn.
- [x] Công thức chỉ số, mô hình thông tin khái niệm và ma trận truy vết.
- [x] Kế hoạch kiểm chứng người dùng và checklist nghiệm thu tương lai.
- [ ] Chủ nghiệp vụ xác nhận các giả định, nhất là D-09/D-12/D-13.
- [ ] Phỏng vấn, tree test, usability test và kiểm tra accessibility trên UI thực thi.

## M1 — Nền tảng

- [x] Đặc tả đăng nhập/đăng xuất, scope, quản trị, layout, quyền và khóa phiên.
- [x] Thống nhất D-29: trưởng phòng dùng Requester gửi ticket cấp tài khoản trong hệ thống; Admin xác minh và tạo user, bàn giao qua kênh doanh nghiệp; trưởng phòng xác nhận kết quả trên ticket.
- [ ] Refinement password policy, hỗ trợ quên/reset password không email và bootstrap Admin đầu tiên; thư viện auth server session.
- [ ] Kiểm tra tương thích stack và phiên bản tại lúc khởi tạo; khóa dependency.
- [ ] Khởi tạo source, database/migration, `.env.example`, Docker Compose và README chạy sạch.
- [ ] Seed hư cấu có cờ demo, chạy lại được:4 role/3 team/5 department/~20 user.
- [ ] Test đăng nhập bốn vai trò, negative authorization, thu hồi phiên.

**Gate triển khai:** đăng nhập thực, backend từ chối sai quyền/ID; dữ liệu tồn tại sau restart. Chưa đạt gate vì chưa có code.

## M2 — Ticket xuyên suốt

- [x] Tạo/list/detail, phân công, hội thoại, nội bộ, tệp, trạng thái, lịch sử, version conflict và wireframes.
- [ ] Refine/tách US14,US16,US22 trước sprint; chốt cách lưu tệp nhất quán với dữ liệu.
- [ ] Xây luồng New→Open→In Progress→Resolved→Closed và các nhánh Pending/reopen/cancel.
- [ ] Tệp thực và kiểm tra quyền tải, validation, pagination và lỗi thống nhất.
- [ ] Unit/integration cho trạng thái/quyền; E2E luồng requester–manager–technician.

**Gate:** hoàn thành một ticket từ gửi tới xác nhận hoặc mở lại, gồm trường hợp API cố ý sai quyền. Không dùng mock để nghiệm thu.

## M3 — SLA và thông báo

- [x] Hai đồng hồ, snapshot P1–P4, pause/reopen/priority,80%/100%, dedup và recipients.
- [ ] Refine US32/33 thành lát cắt phù hợp; chọn scheduler và quan sát worker.
- [ ] Worker nền dùng chung quy tắc với API, lịch sử breach và notification thực.
- [ ] Tự động hóa TC-SLA01–12, concurrency/dedup và không phụ thuộc dashboard.

**Gate:** đối chiếu mốc thời gian và chạy lại worker không trùng; chính sách mặc định mới không sửa ticket cũ.

## M4 — Tài sản

- [x] Hồ sơ, scope đọc, assignment, thu hồi, state matrix và liên kết ticket.
- [ ] Xây transaction và ràng buộc một assignment hiệu lực; seed~30 asset.
- [ ] Hoàn thiện asset picker thật trong ticket và test IDOR qua liên kết tài sản.
- [ ] Test cấp đồng thời, thu hồi, sửa chữa, ngừng sử dụng và bảo toàn lịch sử.

**Gate:** không cấp hai người đồng thời; R/T không đi vòng từ asset để đọc ticket ngoài quyền.

## M5 — Dashboard và báo cáo

- [x] Metrics catalog, scope/kỳ hiện tại, drill-down và wireframe Manager.
- [ ] Refine US43/44; xây dashboard từng role và báo cáo từ dữ liệu nguồn.
- [ ] Seed~60 ticket đủ trạng thái/SLA, đánh dấu demo; không trộn vào vận hành thật.
- [ ] Đối chiếu từng MET với query nguồn, gồm sample0và ticket reopen nhiều lần.

**Gate:** số card/biểu đồ/drill-down khớp cùng thời điểm và cùng phạm vi.

## M6 — Hoàn thiện và bàn giao triển khai

- [x] AC, negative scenarios, trạng thái UX và kế hoạch test.
- [ ] Test responsive/keyboard/screen reader/contrast trên ứng dụng.
- [ ] Sửa lỗi nghiệp vụ nghiêm trọng, test luồng chính và khởi động sạch.
- [ ] Bàn giao source/migration/seed/env example/README/API thực thi, hướng dẫn worker và storage.
- [ ] Ghi kết quả test thực tế; tách rõ dữ liệu demo và hạn chế còn lại.

**Gate:** đủ12 tiêu chí nghiệm thu gốc; không dùng chatbot tùy chọn hoặc giai đoạn 2 để thay thế các điều kiện nghiệm thu lõi chưa đạt.

## Điều kiện đưa story vào triển khai

Role/scope, đầu vào/đầu ra, lỗi, AC, quy tắc và màn hình đã rõ; các story rộng được chia; phụ thuộc có dữ liệu fixture; business owner xác nhận giả định ảnh hưởng vận hành. Không dùng “tài liệu đầy đủ” để bỏ qua refinement E/S với đội phát triển.

## Nhánh AI tùy chọn

- [x] Đặc tả lớp AI đọc/soạn nháp, phạm vi quyền, nguồn và handoff về form.
- [x] 8 use case, 8 user stories INVEST, AC riêng và 12 ca kiểm chứng AI.
- [x] 3 mẫu màn hình, 3 wireframe AI và 4 sheet XMind AI.
- [x] Xác định bất biến ticket/SLA/asset/report, không tool ghi và không first response từ chat.
- [ ] Có API lõi thực, provider được duyệt, nguồn hợp lệ và chính sách dữ liệu đã chốt.
- [ ] Xây/tích hợp chatbot; hiện chưa có model call hoặc backend.
- [ ] Chạy AC-AI/TC-AI cùng bộ regression lõi với AI bật, tắt và lỗi.

Nhánh này không đổi thứ tự M1–M6 hoặc gate nghiệm thu lõi. Xem [tích hợp và kiểm tra không thay đổi nghiệp vụ](ai/integration-and-non-regression.md).
