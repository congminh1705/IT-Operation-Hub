# Phạm vi và product brief

## Mục tiêu

IT Operations Hub tập trung yêu cầu IT, trách nhiệm xử lý, tài sản và lịch sử trong một không gian nội bộ. Ưu tiên luồng **tạo → tiếp nhận → xử lý → giải quyết → xác nhận đóng hoặc mở lại**, sau đó hoàn thiện SLA, tài sản và khả năng điều phối.

MVP tương lai phải có backend và lưu trữ bền vững. Bộ tài liệu hiện tại xác định hành vi cần xây dựng; không đại diện cho ứng dụng đã hoạt động.

## Ranh giới bàn giao hiện tại

| Có trong đợt thiết kế | Không thực hiện trong đợt này |
|---|---|
| Research top down, rà soát repo và nguồn tham khảo | Khởi tạo framework, cài dependency, chạy server |
| Actor, use case UML, 47 stories lõi + 8 stories AI và AC | Viết frontend/backend hoặc API thực thi |
| Quyền trên bản ghi, trạng thái ticket, SLA, tài sản | Schema vật lý, SQL, Prisma, migration, seed |
| IA, navigation, screen inventory, user journeys/flows, thiết kế chatbot tùy chọn | Kết nối dịch vụ/email/chat hoặc provider AI thực thi |
| Wireframe SVG, design tokens, tương tác, nội dung và accessibility | Prototype chạy bằng HTML/JS hoặc bản UI có chức năng |
| Checklist M1–M6, kế hoạch kiểm chứng và truy vết | Tuyên bố đã pass unit/integration/E2E hoặc nghiệm thu MVP |

## Phạm vi sản phẩm MVP để phân tích

1. Tài khoản do Admin tạo; đăng nhập/đăng xuất, hồ sơ và đổi mật khẩu; phiên server bị vô hiệu khi khóa tài khoản.
2. Phòng ban, nhóm IT, thành viên, danh mục và cấu hình SLA.
3. Ticket đầy đủ tạo, tìm/lọc, phân công, trao đổi, ghi chú, tệp, trạng thái, giải quyết và lịch sử.
4. Hai đồng hồ SLA 24/7; snapshot, tạm dừng, mở lại, đổi ưu tiên, cảnh báo nền không trùng.
5. Tài sản, một cấp phát hiệu lực, thu hồi, trạng thái, ticket liên quan.
6. Dashboard theo vai trò, báo cáo nguồn dữ liệu thật, thông báo trong ứng dụng và audit.
7. Trợ lý AI tùy chọn: hỏi đáp có nguồn, đọc dữ liệu có quyền, tóm tắt và soạn nháp; chuyển về màn hình nghiệp vụ để user kiểm tra/gửi.

## Không thuộc MVP

SaaS đa khách hàng; đăng ký công khai; tự đóng ticket; xóa ticket; AI tự thực thi mutation nghiệp vụ; email/chat chưa cấu hình nhà cung cấp; lịch SLA theo giờ làm việc/ngày nghỉ; incident tổng hợp; service catalog; change; ca trực; kho kiến thức; dark mode. Xuất Excel/PDF, SSO, MFA, import hàng loạt và custom workflow chưa được đề bài chốt nên không đưa thêm nút hoặc luồng.

## Thành công và điều kiện nghiệm thu

Thành công ở giai đoạn tài liệu: truy vết được mục tiêu → use case → story → AC → màn hình; không có mâu thuẫn quyền/trạng thái/SLA; bản vẽ thể hiện được luồng chính và trường hợp lỗi quan trọng. Chưa thay thế xác nhận nghiệp vụ và nghiên cứu người dùng.

Thành công ở giai đoạn MVP: đối chiếu 12 yêu cầu nghiệm thu gốc trong [bảng truy vết](traceability/master-traceability.md), từ chối truy cập trái quyền cả qua API, lưu dữ liệu sau khởi động lại và chạy kiểm thử các luồng chính. Không dùng số liệu giả thay dữ liệu vận hành.

## Chiến lược giai đoạn

Thiết kế bao phủ toàn bộ MVP để tránh ngõ cụt. Khi được yêu cầu triển khai, xây theo M1→M6, với M1 và M2 tạo lát cắt nghiệp vụ đầu tiên. Chưa ước lượng ngày công hay thời gian hoàn thành khi chưa có refinement kỹ thuật. [Checklist](09-design-readiness.md) tách rõ phần đã đặc tả và phần chưa xây dựng.

## Phần AI được bổ sung

[Chatbot AI](10-ai-assistant.md) là lớp hỗ trợ tùy chọn trong phạm vi thiết kế mới. Giữ nguyên 33 use case, 47 stories và các quy tắc lõi; bổ sung namespace riêng gồm 8 use case/stories, 3 mẫu màn hình và bộ AC AI. Không thay thứ tự M1–M6 hoặc bắt người dùng đi qua AI. Chưa có chatbot/provider hoạt động vì dự án vẫn ở giai đoạn tài liệu.
