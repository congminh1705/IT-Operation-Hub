# Kịch bản thuyết trình IT Operations Hub

Bản lời dẫn chính thức cho bộ 22 slide `it-operations-hub-editable.pptx` có nền ảnh phòng ban đã chọn.

- Người trình bày: thực tập sinh; người nghe: giám đốc sản phẩm và người phụ trách kỹ thuật.
- Thời lượng dự kiến: 16–18 phút, chưa gồm hỏi đáp; điều chỉnh sau khi tập nói.
- Mục tiêu: giúp người nghe hiểu vấn đề, sản phẩm, cách vận hành và bước cần duyệt.
- Các dòng thời lượng, thao tác và chuyển ý là hướng dẫn tập nói. Phần lời trình bày là nội dung dùng khi nói.
- Trạng thái dự án: đề xuất và thiết kế; chưa có ứng dụng triển khai hoặc kết quả kiểm thử phần mềm. Dữ liệu trên giao diện là dữ liệu minh họa.

## Slide 1: IT Operations Hub

Em xin chào anh chị. Hôm nay em trình bày IT Operations Hub, một ứng dụng hỗ trợ quản lý và vận hành phòng IT nội bộ.

Mục tiêu của dự án là kết nối yêu cầu từ các phòng ban với kế hoạch thực hiện, người phụ trách và kết quả bàn giao. Qua phần trình bày, em mong anh chị đánh giá bài toán ưu tiên, hướng giải pháp và phạm vi cần kiểm chứng trước khi đầu tư triển khai.

Hiện dự án ở giai đoạn đặc tả và thiết kế; các màn hình minh họa luồng vận hành mục tiêu.

**Chuyển ý:** Trước hết, em xin làm rõ sản phẩm này quản lý những gì và phục vụ nhu cầu nào.

**Nguồn ảnh — ghi chú, không đọc:** Ảnh chụp của Ketut Subiyanto trên Pexels, ảnh số 4623494: https://www.pexels.com/photo/group-of-colleagues-drawing-project-plan-on-glass-pane-4623494/ . Giấy phép: https://www.pexels.com/license/ . Ảnh minh họa sự phối hợp trong phòng ban; không phải ảnh đội dự án. Ảnh được đặt nền, cắt khung và phủ màu tối bằng các đối tượng của PowerPoint.

## Slide 2: IT operations, from request to result

*Khoảng 45 giây. Nhấn vào ba ý: vấn đề, giải pháp và vai trò AI.*

IT Operations Hub quản lý công việc của phòng IT trong một tổ chức: từ ticket tiếp nhận yêu cầu, task thực thi, nhân lực và tài sản đến cam kết thời gian phục vụ, hay SLA, cùng kho tri thức hỗ trợ.

Bài toán được nêu trong định hướng dự án là yêu cầu phân tán, trách nhiệm chưa rõ và khó theo dõi thời hạn. Hướng giải quyết là tổ chức một luồng chung: tiếp nhận, phân công, thực hiện rồi xác nhận kết quả.

AI tham gia theo hai cách: trợ lý giúp người dùng thực hiện các thao tác được phép; điều phối nền giúp lập kế hoạch và phân bổ công việc theo chính sách. Nhân viên IT vẫn trực tiếp thực hiện chuyên môn, còn trưởng phòng giám sát và xử lý ngoại lệ.

**Chuyển ý:** Để chọn phạm vi sản phẩm, em đi từ mục tiêu doanh nghiệp xuống các nhu cầu và vấn đề cụ thể.

**Nguồn ảnh — ghi chú, không đọc:** Ảnh chụp của fauxels / Pexels: https://www.pexels.com/photo/people-working-in-front-of-the-computer-3184357/ . Giấy phép: https://www.pexels.com/license/ . Ảnh minh họa hoạt động phối hợp, không phải người dùng được phỏng vấn, đội dự án hoặc số liệu hiệu quả của sản phẩm.

## Slide 3: Top-down research: why this product?

*Khoảng 60 giây. Đi theo bốn tầng từ trên xuống, rồi chỉ sang phần cơ sở nghiên cứu.*

Mục tiêu ở cấp doanh nghiệp là giúp nhân viên làm việc liên tục nhờ dịch vụ IT đáng tin cậy. Từ đó, em xác định nhu cầu của người yêu cầu, kỹ thuật viên, trưởng phòng và Admin.

Điểm chung giữa các vai trò là cần biết công việc đã được ghi nhận chưa, ai chịu trách nhiệm, có thể thực hiện đúng hạn không và kết quả được xác nhận thế nào. Vì vậy, vấn đề ưu tiên là nối yêu cầu với công việc có người phụ trách, có khả năng thực hiện và có kết quả theo dõi được.

Cơ sở hiện có là phân tích tài liệu dự án và tham khảo nguồn gốc về quản lý yêu cầu, khả năng nhìn thấy trạng thái và quyền kiểm soát của người dùng. Chưa có phỏng vấn hoặc số liệu vận hành tại doanh nghiệp. Do đó, các nguyên nhân và lợi ích ở những slide sau là giả thuyết thiết kế cần kiểm chứng.

**Chuyển ý:** Tiếp theo là trách nhiệm và thông tin cần thiết của từng vai trò.

## Slide 4: Four roles, clear responsibilities

*Khoảng 40 giây. Chỉ vào bốn vai trò; ảnh minh họa bối cảnh phối hợp trong phòng ban.*

Người yêu cầu cần gửi nhu cầu, theo dõi tiến độ và xác nhận kết quả. Kỹ thuật viên cần biết việc nào được giao, khi nào có thể bắt đầu và đang vướng ở đâu.

Trưởng phòng IT cần nhìn được tải công việc và rủi ro để thiết lập chính sách, can thiệp hoặc duyệt ngoại lệ. Admin phụ trách tài khoản, quyền truy cập và cấu hình trong phạm vi được cấp.

Thiết kế giữ bốn vai trò này, không bổ sung cấp trưởng nhóm IT. Mỗi màn hình cần giúp đúng người nhận ra quyết định hoặc thao tác tiếp theo của mình.

**Chuyển ý:** Với các vai trò đó, khoảng trống cần giải quyết nằm ở phần công việc phía sau yêu cầu.

**Nguồn ảnh — ghi chú, không đọc:** Ảnh chụp của fauxels / Pexels: https://www.pexels.com/photo/photo-of-people-near-computers-3183159/ . Giấy phép: https://www.pexels.com/license/ . Ảnh minh họa hoạt động phối hợp, không phải người dùng được phỏng vấn, đội dự án hoặc số liệu hiệu quả của sản phẩm.

## Slide 5: Connect the work behind the request

*Khoảng 45 giây. So sánh từng cặp ở hai bên.*

Khi một yêu cầu được tiếp nhận, vẫn còn nhiều việc phải tổ chức: chia đầu việc, xác định thứ tự, tìm người phù hợp và xử lý thay đổi. Nếu thông tin nằm rời rạc ở từng người, mỗi lần có biến động lại cần kiểm tra và trao đổi lại.

Ở thiết kế mục tiêu, ticket giữ nhu cầu và thời hạn; kế hoạch thể hiện các task phụ thuộc; việc phân công dựa trên kỹ năng, lịch và năng lực còn lại. Khi có sự kiện như nhân viên vắng mặt, hệ thống có thể đánh giá lại theo chính sách.

Phía trái là giả thuyết quy trình cần xác minh với doanh nghiệp. Phía phải là cách sản phẩm dự kiến đáp ứng cùng bài toán.

**Chuyển ý:** Em phân tích tiếp những nguyên nhân có thể tạo ra khoảng trống này.

## Slide 6: Why coordination breaks down

*Khoảng 45 giây. Chọn hai ví dụ để giải thích quan hệ nguyên nhân và phản ứng thiết kế.*

Ví dụ, người dùng thường xuyên hỏi tiến độ có thể vì thiếu một lịch sử tiếp nhận và người chịu trách nhiệm rõ ràng. Trở ngại xuất hiện muộn có thể vì chưa mô tả các phần việc phụ thuộc. Phân công thiếu chắc chắn có thể do kỹ năng hoặc lịch khả dụng chưa được xác nhận.

Mỗi nguyên nhân được nối với một phản ứng thiết kế: bản ghi ticket chung, kế hoạch và task rõ ràng, dữ liệu nhân lực được xác minh, cùng lịch sử thay đổi có thể truy vết.

Các mối liên hệ này giúp em giải thích vì sao chọn một chức năng. Khi khảo sát thực tế, nếu nguyên nhân không đúng, phạm vi hoặc cách thiết kế cũng cần được điều chỉnh.

**Chuyển ý:** Từ đó, em sắp xếp ba ưu tiên cho sản phẩm.

## Slide 7: Focus on owned, feasible work

*Khoảng 35 giây. Lần lượt chỉ vào ba thẻ.*

Ưu tiên thứ nhất là làm rõ trách nhiệm: nhu cầu gì, hạn nào, ai phụ trách và bước tiếp theo là gì.

Ưu tiên thứ hai là bảo đảm công việc khả thi: đúng kỹ năng, đủ thời gian và thỏa mãn các phụ thuộc. Ưu tiên thứ ba là thích ứng có kiểm soát khi con người hoặc mức độ ưu tiên thay đổi.

Ba ưu tiên này định hướng thứ tự xây dựng. AI điều phối cần dựa trên dữ liệu và các quy tắc đáng tin cậy để tạo ra hành động hợp lệ.

**Chuyển ý:** Đây là cách các thành phần sản phẩm kết nối để đáp ứng ba ưu tiên đó.

## Slide 8: One operating workspace for IT

*Khoảng 40 giây. Đi qua ba khối chính, rồi đến lớp hỗ trợ bên dưới.*

Khối ticket giữ nhu cầu và cam kết phục vụ. Khối kế hoạch và task mô tả phần việc, người phụ trách và trình tự thực hiện. Khối nhân lực và chính sách cung cấp điều kiện để phân công và điều chỉnh hợp lệ.

Các nghiệp vụ tài sản, kho tri thức, trao đổi, thông báo, báo cáo và audit cùng hỗ trợ luồng này. Ví dụ, một task có thể liên quan đến thiết bị cần bàn giao; kỹ thuật viên có thể tra hướng dẫn; trưởng phòng có thể xem lịch sử phân công và lý do thay đổi.

Giá trị của sản phẩm nằm ở việc giữ các thông tin đó trong cùng ngữ cảnh công việc.

**Chuyển ý:** Em minh họa bằng một yêu cầu chuẩn bị thiết bị và tài khoản cho nhân viên mới.

## Slide 9: From onboarding request to accepted delivery

*Khoảng 60 giây. Theo luồng từ trái sang phải. Đây là tình huống tổng hợp, không phải ca khách hàng đã quan sát.*

Giả sử một phòng ban cần chuẩn bị máy và tài khoản cho mười nhân viên mới. Đầu tiên, yêu cầu cần đủ danh sách, cấu hình, quyền truy cập và thời hạn bàn giao.

Sau đó, hệ thống hỗ trợ lập kế hoạch, xác định các task phụ thuộc và phân công cho người đủ điều kiện. Nhân viên IT chuẩn bị, cài đặt và bàn giao thiết bị; phần cấp tài khoản do Admin có quyền thực hiện.

Nếu người đang được phân công báo nghỉ, hệ thống đánh giá phần việc bị ảnh hưởng. Thay đổi trong chính sách có thể được thực hiện tự động; việc bị khóa hoặc vượt quyền cần người có thẩm quyền quyết định.

Cuối luồng, IT ghi nhận kết quả và người yêu cầu xác nhận bàn giao. Hoàn thành một lượt điều phối không đồng nghĩa công việc chuyên môn đã hoàn tất.

**Chuyển ý:** Để hỗ trợ trọn luồng này, phạm vi MVP được chia thành bốn nhóm.

## Slide 10: MVP scope: the complete operating loop

*Khoảng 45 giây. Nêu mục đích của từng nhóm thay vì đọc danh sách tính năng.*

Nhóm thứ nhất giúp tiếp nhận và phản hồi bằng ticket, SLA, trao đổi và thông báo. Nhóm thứ hai tổ chức thực hiện bằng kế hoạch, task, lịch và nhân lực.

Nhóm thứ ba hỗ trợ tra cứu và thao tác bằng trợ lý AI, kho tri thức có nguồn và điều phối tự động. Nhóm cuối giúp quản lý tài sản, báo cáo, audit và quản trị hệ thống.

Cả trợ lý và điều phối AI đều thuộc MVP, được đưa vào theo các mốc phụ thuộc. Phạm vi tập trung vào vận hành phòng IT trong một tổ chức; các nghiệp vụ tính lương, mua sắm và cho AI chạy lệnh trực tiếp lên hạ tầng nằm ngoài phạm vi này.

**Chuyển ý:** Một điểm quan trọng trong mô hình là tách ticket khỏi công việc thực thi.

## Slide 11: Ticket, plan, task: distinct responsibilities

*Khoảng 45 giây. Dùng lại tình huống onboarding để phân biệt ba bản ghi.*

Trong ví dụ vừa rồi, ticket là yêu cầu chuẩn bị cho mười nhân viên mới, cùng trao đổi và cam kết phục vụ. Kế hoạch chia yêu cầu thành các phần việc và thứ tự thực hiện. Task là một đầu việc cụ thể, có người làm, thời hạn, khối lượng và kết quả.

Khi có thay đổi, hệ thống giữ lịch sử phiên bản kế hoạch, với tối đa một phiên bản có hiệu lực trên mỗi ticket. Cách tách này giúp nhìn được tiến độ thực thi mà vẫn giữ rõ quan hệ dịch vụ với người yêu cầu.

Ngay cả khi tất cả task đã xong, ticket vẫn cần được giải quyết đúng quy trình và xác nhận kết quả.

**Chuyển ý:** Những thông tin đó được đưa lên dashboard để trưởng phòng biết cần hành động ở đâu.

## Slide 12: See risk and act from one dashboard

*Khoảng 45 giây. Chỉ lần lượt vùng cảnh báo, chỉ số và quyết định tiếp theo. Các số hiển thị là dữ liệu demo.*

Dashboard này trả lời câu hỏi của trưởng phòng IT: hiện có rủi ro nào và quyết định tiếp theo là gì?

Vùng cảnh báo nêu trường hợp cần chú ý. Các chỉ số giúp nhận ra công việc bị chặn, áp lực SLA và ngoại lệ chờ xử lý. Ở vùng quyết định tiếp theo, trưởng phòng có thể mở phương án đổi người để xem lý do và tác động.

Từ đây, người quản lý có thể đi vào kế hoạch, nhân lực hoặc chính sách. Mục tiêu thiết kế là giúp đi từ nhận biết rủi ro đến một hành động cụ thể, thay vì phải tự tổng hợp từ nhiều màn hình.

**Chuyển ý:** Trước khi đổi người, hệ thống cần hiểu task và khả năng thực hiện của ứng viên.

## Slide 13: Assign work that people can actually deliver

*Khoảng 50 giây. Chỉ task T03, thời lượng còn lại và các thông tin phụ thuộc.*

Bảng công việc cho thấy trạng thái từng task, người phụ trách, khối lượng còn lại và điều kiện bắt đầu. Trong dữ liệu minh họa, T03 còn cần 180 phút. Một người chỉ có 120 phút khả dụng sẽ không đáp ứng được yêu cầu, dù AI có xếp hạng người đó cao.

Vì vậy, hệ thống cần kiểm tra kỹ năng đã xác nhận, phạm vi được phép làm việc, lịch, thời hạn và tải đã phân bổ. Thiếu lịch không được hiểu là đang rảnh.

AI có thể hỗ trợ chọn trong các ứng viên đủ điều kiện. Ngay trước khi lưu thay đổi, dịch vụ nghiệp vụ vẫn phải kiểm tra lại dữ liệu hiện tại. Người quản lý cũng có thể phân công thủ công theo cùng các quy tắc.

**Chuyển ý:** Để kiểm tra khả năng nhận việc, trưởng phòng có thể xem trực tiếp màn Nhân lực.

## Slide 14: Workforce: match skills, time, and capacity

*Khoảng 50 giây. Chỉ vào ba người và lịch khả dụng của họ.*

Màn Nhân lực giúp trưởng phòng xem ai có thể nhận công việc dựa trên kỹ năng đã xác nhận, lịch làm việc, vắng mặt và phần thời gian còn khả dụng.

Trong ví dụ, task T03 cần 180 phút trước hạn. Minh đang vắng; Bình có cửa sổ 180 phút; Chi chỉ có 120 phút nên chưa đáp ứng thời lượng. Đây là dữ liệu để kiểm tra tính khả thi, không phải chỉ xếp người theo mức độ bận hoặc theo gợi ý của model.

Khi ghi nhận một trường hợp vắng mặt, hệ thống cần nhận ra các task bị ảnh hưởng để điều phối lại theo chính sách. Trước khi giao việc, vẫn phải kiểm tra dữ liệu hiện tại và tải đã phân bổ. Màn này phục vụ năng lực thực hiện công việc, không phải nghiệp vụ chấm công hoặc tính lương.

**Chuyển ý:** Bên cạnh người thực hiện, phòng IT cần theo dõi cả thiết bị được sử dụng và bàn giao.

## Slide 15: Assets: track devices, holders, and history

*Khoảng 50 giây. Chỉ thông tin thiết bị, người giữ hiện tại và bảng lịch sử cấp phát.*

Màn Tài sản trả lời ba câu hỏi: đây là thiết bị nào, hiện ai đang giữ và trước đây đã được bàn giao ra sao?

Hồ sơ giữ mã, model, serial, trạng thái và bảo hành. Thông tin cấp phát cho biết người nhận cùng bối cảnh phòng ban; lịch sử giữ thời điểm và người thực hiện từng lần cấp hoặc thu hồi. Tài sản cũng có thể được liên kết với ticket để hỗ trợ tra cứu và xử lý sự cố.

Trong ví dụ, máy đang được sử dụng nên không được cấp mới cho người khác. Việc thu hồi phải kết thúc lượt cấp hiện tại trước khi có một lần cấp mới hợp lệ. Sửa hồ sơ thiết bị và thay đổi người giữ là hai thao tác riêng, có kiểm tra quyền và lưu lịch sử.

**Chuyển ý:** Dữ liệu công việc, nhân lực và tài sản tạo bối cảnh cho hai chế độ AI trên màn tiếp theo.

## Slide 16: One AI workspace, two ways to work

*Khoảng 60 giây. Chỉ vùng trợ lý trước, sau đó chỉ vùng điều phối tự động và chuỗi bước bên phải.*

Ở vùng trợ lý, người dùng chủ động yêu cầu hỗ trợ, chẳng hạn xem công việc, tra hướng dẫn hoặc tạo yêu cầu. Với thao tác làm thay đổi dữ liệu, người dùng xem trước và xác nhận trước khi thực hiện. Trợ lý chỉ dùng quyền của người đang thao tác.

Ở vùng điều phối, sự kiện như yêu cầu đủ thông tin hoặc thay đổi lịch sẽ kích hoạt xử lý nền khi có chính sách hợp lệ. Trong trường hợp thông thường, hệ thống có thể phân công trong phạm vi đã được cấp quyền và ghi lại kết quả, không cần chờ người dùng mở chat.

Hai chế độ có thể dùng chung model hoặc adapter, nhưng tách danh tính và quyền hành động. Trong màn này, lượt giao việc đã hoàn tất theo chính sách; nhân viên IT tiếp tục thực hiện task.

**Chuyển ý:** Khi một thay đổi không được phép tự động thực hiện, hệ thống chuyển sang trạng thái ngoại lệ.

## Slide 17: Handle exceptions without losing control

*Khoảng 55 giây. Chỉ trạng thái chờ duyệt, task đang khóa và bước ba trên năm.*

Ở màn ngoại lệ, T03 đang khóa phân công nên phương án đổi người phải chờ quyết định của trưởng phòng IT. Lúc này, hệ thống đã đề xuất người thay thế nhưng chưa giao lại task.

Sau khi được duyệt, hệ thống vẫn kiểm tra lại quyền, phiên bản, lịch và năng lực. Nếu điều kiện đã thay đổi, phương án cần được đánh giá lại. Như vậy, quyết định phê duyệt và kết quả thực thi là hai thông tin riêng, đều phải theo dõi được.

Ngoại lệ này chỉ dừng thay đổi liên quan. Các công việc khác vẫn có thể tiếp tục; người dùng vẫn có thể thao tác thủ công trong quyền và dùng trợ lý cho nhu cầu khác.

**Chuyển ý:** Để đánh giá sản phẩm có ích hay không, em quay lại ba kết quả vận hành cần đo.

## Slide 18: Measure clarity, speed, and control

*Khoảng 45 giây. Nhấn đây là cách đo đề xuất, chưa phải kết quả đạt được.*

Thứ nhất là sự rõ ràng: người dùng có tìm được người phụ trách, trạng thái và bước tiếp theo không?

Thứ hai là tốc độ: từ lúc yêu cầu đủ thông tin đến khi có một phân công hợp lệ mất bao lâu? Phân công nhanh cần đi cùng điều kiện đủ kỹ năng và thời gian.

Thứ ba là khả năng kiểm soát: người quản lý có nhận ra việc bị ảnh hưởng và giải thích được vì sao có thay đổi, ai quyết định, kết quả ra sao không?

Trước khi đặt mục tiêu định lượng, cần thống nhất cách tính và đo hiện trạng. Hiện dự án chưa có số liệu tiết kiệm thời gian hay ROI để cam kết.

**Chuyển ý:** Thiết kế kỹ thuật phải giúp các kiểm tra và lịch sử này nhất quán giữa thao tác thủ công và tự động.

## Slide 19: AI proposes; trusted services commit

*Khoảng 50 giây. Đi theo tuyến giao diện, dịch vụ nghiệp vụ và cơ sở dữ liệu; sau đó chỉ worker và adapter AI.*

Giao diện dùng Next.js và React. FastAPI cùng SQLAlchemy xử lý nghiệp vụ; PostgreSQL lưu dữ liệu chính, còn Alembic quản lý thay đổi schema khi triển khai.

Worker Celery xử lý công việc nền qua cùng các dịch vụ nghiệp vụ. Redis làm hàng đợi thông điệp, không phải nơi lưu dữ liệu nghiệp vụ chính.

Nguyên tắc quan trọng là model đưa ra đề xuất có cấu trúc; dịch vụ nghiệp vụ quyết định hành động có hợp lệ và được ghi vào hệ thống hay không. Model không ghi trực tiếp database. Các kiểm tra quyền, phiên bản, năng lực và chống trùng được đặt ở lớp dịch vụ để mọi kênh thao tác tuân theo cùng một bộ luật.

**Chuyển ý:** Để chuyển thiết kế này thành một sản phẩm có căn cứ, cần kiểm chứng cả nhu cầu lẫn hành vi phần mềm.

## Slide 20: Validate demand, usability, and reliability

*Khoảng 45 giây. Trình bày ba bước thu thập bằng chứng.*

Bước đầu tiên là trao đổi với bốn vai trò và xem các yêu cầu thực tế gần đây, từ tiếp nhận đến bàn giao. Việc này giúp xác nhận vấn đề nào xảy ra thường xuyên và thực sự cần ưu tiên.

Bước tiếp theo là cho người dùng đi qua tình huống onboarding và vắng mặt, để kiểm tra thuật ngữ, khả năng tìm hành động và cách hiểu các trạng thái.

Khi có ứng dụng, mới kiểm thử hành động với dữ liệu lưu thật: luồng bình thường, thiếu dữ liệu, thiếu người, vượt quyền, sự kiện lặp và provider lỗi. Giao diện minh họa hỗ trợ thảo luận; nghiệm thu phần mềm cần bằng chứng thực thi.

**Chuyển ý:** Các bước này được tổ chức thành lộ trình có điều kiện kiểm chứng ở từng mốc.

**Nguồn ảnh — ghi chú, không đọc:** Ảnh chụp của fauxels / Pexels: https://www.pexels.com/photo/people-discuss-about-graphs-and-rates-3184292/ . Giấy phép: https://www.pexels.com/license/ . Ảnh minh họa hoạt động phối hợp, không phải người dùng được phỏng vấn, đội dự án hoặc số liệu hiệu quả của sản phẩm.

## Slide 21: Deliver in stages, with evidence gates

*Khoảng 45 giây. Đi qua M1–M5; phân biệt lộ trình với cam kết thời gian.*

M1 xây nền tảng quyền, dữ liệu nhân lực và thao tác thủ công. M2 bổ sung quy trình ổn định: kế hoạch, chính sách, worker, phê duyệt và chống trùng.

M3 đưa AI vào lập kế hoạch, phân công và điều phối lại, cần kiểm chứng bằng model thật và hành động được lưu trong môi trường thử nghiệm. M4 hoàn thiện trợ lý, kho tri thức, SLA, tài sản và báo cáo. M5 tập trung nghiệm thu toàn luồng, bảo mật và khôi phục.

Mỗi mốc cần có bằng chứng trước khi đi tiếp. Đây là thứ tự phụ thuộc dự kiến; nhân lực, thời lượng và ngân sách phát triển cần được ước lượng sau khi thống nhất phạm vi kiểm chứng.

**Chuyển ý:** Vì vậy, đề nghị của em ở thời điểm này là một bước xác thực có phạm vi rõ ràng.

## Slide 22: Decision requested: validate the first journey

*Khoảng 40 giây. Kết thúc bằng quyết định mong muốn, rồi dừng để nhận câu hỏi.*

Em đề nghị anh chị thống nhất phạm vi kiểm chứng đầu tiên: một luồng chuẩn bị thiết bị và tài khoản cho nhân viên mới, cùng một ngoại lệ nhân viên vắng mặt.

Để thực hiện bước này, cần một người chịu trách nhiệm nghiệp vụ và một người hướng dẫn kỹ thuật. Đầu ra là luồng đã được rà soát với người dùng, cách đo thành công, yêu cầu dữ liệu và các rủi ro cần xử lý. Từ đó mới chốt ước lượng và quyết định đầu tư triển khai.

Điều em mong nhận được sau buổi trình bày là xác nhận đây có phải vấn đề ưu tiên phù hợp và ai sẽ cùng em chịu trách nhiệm kiểm chứng. Em cảm ơn anh chị và xin nhận góp ý.
