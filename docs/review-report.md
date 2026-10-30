# Biên bản rà soát hồ sơ thiết kế

**Ngày:** 30/10/2026 · **Phiên bản:** 0.4  
**Phạm vi:** tài liệu phân tích và thiết kế. Không phải biên bản nghiệm thu phần mềm.

## Thành phần bàn giao

| Thành phần | Số lượng / nội dung |
|---|---|
| Markdown | 31 file, gồm phân tích, nghiệp vụ, IA, UI/UX, thiết kế AI, thị giác/motion, cấp tài khoản nội bộ, hướng dẫn xem sơ đồ và kế hoạch kiểm chứng |
| Use cases | 33 mục lõi giữ nguyên + 8 mục AI có namespace riêng; 4 SVG theo vai trò, gồm tổng quan và 3 nhóm chi tiết |
| Backlog | 47 stories lõi + 8 stories AI; có INVEST và phụ thuộc, chưa ước lượng triển khai |
| Nghiệm thu dự kiến | 47 AC lõi, 10 AC xuyên suốt, 12 ví dụ SLA; thêm 8 AC và 12 ca AI, tất cả chưa chạy |
| Kiến trúc thông tin | 26 mẫu lõi giữ nguyên + 3 mẫu AI tùy chọn |
| Thiết kế trực quan | 16 SVG UI (13 lõi + 3 AI), 2 board SVG, 44 icon SVG, 27 SVG sơ đồ, 1 SVG/PNG use case tổng quan, 3 SVG use case chi tiết và 1 PNG minh họa login; tổng 93 SVG/2 PNG. Đã bỏ 15 PNG xuất giao diện riêng; ảnh nhúng XMind được giữ |
| XMind | 9 file: bộ tổng 27 sheet và 8 file chuyên đề; 18 ảnh UI/board trong bộ tổng và file UI/UX, 3 ảnh trong file AI |
| Liên kết nghiệp vụ | 13 nhóm quy tắc lõi, ma trận quyền, 15 chỉ số giữ nguyên; 29 quyết định gồm phần AI, thị giác và cấp tài khoản nội bộ |

## Kiểm tra đã thực hiện trên tài liệu

- Đối chiếu đủ US01–US47 với AC01–AC47 và 47 dòng truy vết; không thiếu ID trong dải.
- Đối chiếu đủ UC01–UC33 giữa catalog, sơ đồ SVG và truy vết.
- Kiểm tra tham chiếu screen trong truy vết nằm trong inventory; không coi dialog là route đã có.
- Kiểm tra đường dẫn nội bộ, số cột các bảng Markdown, fence của code block, UTF-8 và cấu trúc XML của 93 SVG.
- Kiểm tra SVG không nhúng script, foreignObject hay tài nguyên ảnh từ mạng; có title/description.
- Bộ tài liệu hiện có 2 PNG riêng: tổng quan use case trong wireframes và minh họa login nguồn. Đã bỏ 27 PNG trùng SVG trong thư mục xem nhanh XMind và 15 PNG giao diện riêng theo yêu cầu; giữ SVG và ảnh nhúng trong XMind. Đợt v0.4 đã xuất và review ảnh UI/board cùng bản đồ UI/UX trước khi bỏ các bản PNG riêng. Đo text theo Segoe UI không phát hiện tràn ra ngoài canvas; kiểm tra này không tự chứng minh không có mọi lỗi bố cục trong từng panel.
- Sửa menu tài sản phục vụ xử lý của Technician, filter mobile và đường nối use case sau review.
- Đối chiếu 12 tiêu chí nghiệm thu MVP gốc với stories/quy tắc/AC trong [truy vết](traceability/master-traceability.md).
- Kiểm tra workspace không có file source ứng dụng, migration hoặc dependency được khởi tạo trong đợt này.
- Kiểm tra README trình bày trực tiếp sản phẩm và tài liệu không có thông tin nhận diện dự án khác.
- Kiểm tra XMind chứa đủ 33 UC/47 US/26 screen lõi và 8 UC-AI/US-AI/AC-AI cùng 3 SCR-AI; quan hệ trỏ tới topic hợp lệ, ảnh nhúng trong archive.
- Trong đợt bổ sung AI v0.3, 9 tài liệu lõi và 10 SVG lõi giữ nguyên hoàn toàn. Đợt làm mới thị giác v0.4 chủ động thay 13 bản UI theo yêu cầu mới; 9 tài liệu nghiệp vụ lõi tiếp tục khớp SHA-256. Không đồng nhất các kiểm tra tài liệu với regression test ứng dụng.
- Bổ sung 44 icon vector cùng hệ nét, board trạng thái component và storyboard motion/responsive; không coi storyboard tĩnh là animation chạy thật. Lưu bộ UI trước thay đổi trong [archive v0.3](design/archive/ui-v0.3.zip).

Các kiểm tra cấu trúc và ID được chạy bằng script tạm trong phiên làm việc; không thêm framework test hoặc mã ứng dụng vào repository.

Đợt làm mới sơ đồ: vẽ lại cả 4 SVG theo góc nhìn vai trò, giữ 33 UC và toàn bộ 54 association actor–use case của ba sơ đồ chi tiết. Mã UC có thể lặp giữa các góc nhìn; sơ đồ không bổ sung nghiệp vụ. Kiểm tra dữ liệu quan hệ trước/sau, mã UC, nội dung và bố cục; cập nhật PNG tổng quan hiện có cho khớp SVG. Ba file nguồn cũ đã được bỏ theo yêu cầu, SVG là tài liệu chỉnh sửa trực tiếp.

Quy trình D-29 được cập nhật theo chỉ dẫn mới: trưởng phòng gửi ticket Yêu cầu dịch vụ / Tài khoản ngay trong hệ thống bằng quyền Requester; Admin xác minh và tạo user mặc định Requester, có phê duyệt đúng thẩm quyền khi cấp vai trò IT. Trưởng phòng là requester và xác nhận kết quả trên ticket; mật khẩu bàn giao qua kênh doanh nghiệp. Đã làm rõ UC10/US13 và UC05/US05/AC05, form ticket/quản trị và checklist M1. Không thêm role HR hoặc trưởng phòng, không thêm trạng thái ticket hoặc module phê duyệt riêng; chưa triển khai chức năng thực tế. [Quy trình chi tiết](requirements/account-provisioning.md).

Đã bổ sung 3 SVG UI D-29: dashboard Requester/trưởng phòng, biến thể dashboard Admin và chi tiết ticket cấp tài khoản. Giữ các ID SCR10/SCR12/SCR22, chỉ liên kết SCR60 hiện có; tổng 26 mẫu màn hình lõi và 3 mẫu AI không đổi. Đối chiếu phạm vi quyền, bộ lọc hàng đợi Tài khoản và mốc SLA minh họa; không thêm chỉ số cấp mới dựa trên tiêu đề. Ảnh PNG review được xuất vào thư mục tạm và nhúng trong XMind, không tạo lại folder preview PNG trong repo. Form tạo user và dashboard Technician vẫn chưa có bản vẽ riêng.

## Kiểm tra token tương phản

Tính tỷ lệ tương phản từ mã màu sRGB cho các cặp token. Đây là phép tính token, không phải chứng nhận accessibility cho UI chưa tồn tại.

| Cặp màu | Tỷ lệ |
|---|---|
| Trắng / primary `#1D4ED8` | 6,70:1 |
| Text `#15263D` / trắng | 15,26:1 |
| Secondary `#52637A` / trắng | 6,13:1 |
| Success `#166534` / `#ECFDF3` | 6,76:1 |
| Warning `#92400E` / `#FFF6DF` | 6,58:1 |
| Danger `#B91C1C` / `#FFF0F0` | 5,85:1 |
| Control boundary `#64748B` / trắng | 4,76:1 |

## Giới hạn và phần chưa kiểm chứng

Chưa có frontend/backend/database/worker chạy thực, API contract triển khai, migration, seed hoặc kiểm thử tự động ứng dụng. Chưa có dữ liệu thật; các tên, thiết bị, ticket và số liệu trên bản vẽ đều hư cấu. Không nghiệm thu tính bền vững, phân quyền backend, SLA nền hay cấp phát đồng thời từ bản vẽ.

Chưa phỏng vấn, tree test hoặc usability test; personas/journeys là giả thuyết. Chưa đánh giá bàn phím, screen reader, DOM, reflow hoặc hiệu năng ứng dụng. Các sơ đồ chính được chuyển sang XMind; đã rà archive, JSON, ID và tham chiếu quan hệ. Chưa mở trực tiếp bằng XMind Desktop. Bốn sơ đồ use case SVG được vẽ trực tiếp theo góc nhìn vai trò, đối chiếu đủ 33 UC trong ba sơ đồ chi tiết. Ảnh xem nhanh XMind được dựng từ cùng nội dung, không phải ảnh chụp ứng dụng XMind.

Chrome headless không xuất được ảnh trong môi trường phiên làm việc; PNG được xuất bằng System.Drawing từ các thành phần SVG. Có thể có khác biệt font/raster hóa giữa PNG và trình duyệt, nên SVG và đặc tả là nguồn chỉnh sửa. Không dùng PNG để chứng minh browser compatibility.

Các màn hình phụ trợ chưa có bản vẽ riêng được liệt kê trong [wireframe index](design/wireframes/README.md); đã có đặc tả hành vi nhưng chưa phải bộ hi-fi đầy đủ hoặc prototype tương tác.

## Các điểm cần xác nhận ở vòng nghiệp vụ tiếp theo

1. D-09: snapshot cả bảng SLA và cách đổi priority áp ngân sách mới trên thời gian đã dùng.
2. D-12/D-17: mở lại khi assignee không còn hợp lệ; xử lý ticket khi khóa user/đổi role/bỏ membership.
3. D-13: tách KPI hiện tại khỏi báo cáo kỳ; công thức lần giải quyết gần nhất có thể làm số liệu kỳ cũ thay đổi.
4. D-08/D-21: IT tự tạo/tự xử lý không được giả phản hồi đầu tiên từ IT khác.
5. D-16: bàn giao password ban đầu và quy trình hỗ trợ quên mật khẩu khi không có email provider.

AI hỗ trợ đã được bổ sung vào thiết kế theo yêu cầu mới, dùng phạm vi đọc/nháp và handoff về form cũ; chưa tích hợp provider hoặc có chatbot chạy thật. Các điểm cần kiểm chứng thêm là nguồn được duyệt, chính sách dữ liệu và chất lượng retrieval. Không thêm giai đoạn 2 hoặc AI tự thực thi thay đổi nghiệp vụ. Công việc hiện tại vẫn là tài liệu và UI/UX, chưa viết code ứng dụng.


## Bảo toàn tài liệu lõi qua các phiên bản

Ở đợt bổ sung AI **v0.3**, so sánh SHA-256 ghi nhận **19/19 file không đổi**, gồm 9 tài liệu dưới đây và 10 SVG lõi tại thời điểm đó. Đây là kết quả lịch sử, không áp dụng cho hình v0.4 đã được làm mới theo yêu cầu giao diện.

Trong đợt **v0.4**, so sánh lại xác nhận **9/9 tài liệu nghiệp vụ lõi không đổi** theo các hash bên dưới. Các mã UC/US/AC, máy trạng thái, chính sách SLA, quyền, công thức MET và mô hình tài sản lõi được giữ nguyên. AI dùng mã riêng và đặc tả bổ sung trong [ranh giới tích hợp](ai/integration-and-non-regression.md). Các thay đổi thị giác được mô tả tại [giao diện v0.4](design/visual-refresh.md).

Các hash dưới đây là kết quả lịch sử của đợt bảo toàn v0.4, không đại diện cho hash hiện tại. Sau đó tài liệu được cập nhật liên kết SVG và làm rõ cấp tài khoản nội bộ theo D-29 đã được người dùng chấp thuận. Giữ nguyên số lượng/mã UC và US; trạng thái ticket, đồng hồ SLA và vòng đời tài sản không đổi.

| Tài liệu lõi | SHA-256 trước = sau tại đợt v0.4 |
|---|---|
| [03-use-cases.md](03-use-cases.md) | `545c1cd221c7a4fc2e90b3111a80f6f4b82d3498fbe5bc2a8b94779e3b344b1b` |
| [05-user-flows.md](05-user-flows.md) | `effec5a084554068b90dc94ed92a6da5688921e75108cc6f57d484aed5faeea2` |
| [06-acceptance-criteria.md](06-acceptance-criteria.md) | `6e7ae63f55833295af2d262a5f3f587103c43c3df4897a998489a7690f863fb5` |
| [08-invest-requirements.md](08-invest-requirements.md) | `10b4468729abfb96b22c88665a0a65d50e924ed5fe3c893aed7c8a8aa50a28aa` |
| [business-rules.md](requirements/business-rules.md) | `c0c37d0ae93c794e6c7001a1f7e8396e1342f8593a8d613d3d4f762a155b6b42` |
| [permissions-matrix.md](requirements/permissions-matrix.md) | `58fb8100e6aacf7c05af04deb02464c6d6cf45cb1562653ee40846630f5a33b6` |
| [metrics-catalog.md](requirements/metrics-catalog.md) | `6d6d74083db74ad60c9c15457ecc013e75467383d59e2ce5136c0979daefea89` |
| [conceptual-data-model.md](requirements/conceptual-data-model.md) | `d295b959151eba5500cc6ef3f64e86fa9e3b546f0b1b4dc19c7c1afc3eaa51d9` |
| [master-traceability.md](traceability/master-traceability.md) | `2a19fcb12333ad10f1b69eff218a0b888f7999cd06937ba492c10ab19eed04ab` |

Kết quả này xác nhận không sửa nội dung đặc tả lõi. Chưa chứng minh hành vi phần mềm không hồi quy vì hiện chưa có ứng dụng; khi triển khai phải chạy lại bộ kiểm thử lõi với AI bật, tắt và lỗi theo kế hoạch TC-AI.

