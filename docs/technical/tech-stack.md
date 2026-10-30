# Tech stack mục tiêu — IT Operations Hub

**Chốt thiết kế ngày 30/10/2026**, dựa trên bản định hướng mới của chủ dự án và đối chiếu repository. Đây là quyết định công nghệ để triển khai sau này; chưa có ứng dụng, dependency được cài, migration hoặc kết quả build/test. Xem [phiên bản và mức kiểm chứng](version-baseline.md), [kiến trúc và ranh giới](architecture.md), quyết định D-30–D-33 trong [sổ quyết định](../decisions/design-decisions.md).

## 1. Kết quả đối chiếu trước điều chỉnh

| Nội dung | Hiện trạng tài liệu/repo | Kết luận và cách chốt |
|---|---|---|
| Mục tiêu, một tổ chức, bốn vai trò | Scope, use cases, INVEST và ma trận quyền đã bao phủ | Khớp; không thêm role HR/trưởng phòng, giữ D-29 |
| Ticket và tài sản | Máy trạng thái, quyền từng bản ghi, version conflict, lịch sử đã được đặc tả | Khớp; lựa chọn framework không đổi quy tắc nghiệp vụ |
| SLA | Snapshot, hai đồng hồ, Pending/reopen, ưu tiên, 80%/100%, worker 60 giây đã có | Khớp; bổ sung Celery/Beat/Redis và ràng buộc idempotency ở PostgreSQL |
| Giao diện | SVG tĩnh, design tokens, form, bảng, chart và responsive; chưa có React | Phù hợp Next.js/React; có thể triển khai mà không phải thay thiết kế sản phẩm |
| Backend/ORM | `src/frontend` và `src/backend` chỉ có `.gitkeep`; D-20 để mở công nghệ | Chốt FastAPI + SQLAlchemy đồng bộ + Alembic; không có backend cũ để chuyển đổi |
| Next.js API/Prisma | Đặc tả ban đầu từng đề xuất backend Next.js và Prisma | Bản chốt mới thay thế: Next.js chỉ frontend, FastAPI sở hữu REST và nghiệp vụ; PostgreSQL giữ nguyên |
| Xác thực | Có yêu cầu server session/thu hồi phiên nhưng chưa chọn giải pháp | Bổ sung dịch vụ phiên PostgreSQL, cookie opaque, Argon2id và CSRF; FastAPI không cung cấp sẵn toàn bộ giải pháp này |
| Thư viện giao diện | Chưa chọn package/phiên bản | Chốt theo bảng dưới; thư viện không tự chứng minh accessibility hay đúng nghiệp vụ |
| Hợp đồng frontend/backend | Chưa có API thực thi | Pydantic/OpenAPI là hợp đồng server; sinh TypeScript bằng openapi-typescript, client Zod phục vụ UX |
| Lưu tệp và vận hành | Có yêu cầu riêng tư/backup, chưa có công cụ cụ thể | Local filesystem khi dev, S3 private khi production; Docker Compose/Nginx/Linux VPS |
| AI | Bản stack đính kèm từng để AI giai đoạn 3; chủ dự án đã xác nhận lại AI thuộc MVP | **Chốt theo xác nhận mới nhất:** giữ 8 UC/US và 3 bản vẽ trong MVP; bắt buộc triển khai/nghiệm thu AI, có thể bật/tắt khi vận hành. Chưa chọn provider/model |
| Phiên bản | Không có manifest/lockfile | Đã tra metadata và peer dependency; chưa chạy dependency solver/build. Không coi toàn bộ latest là một bộ tương thích |

Các tài liệu nền được đối chiếu: [scope](../01-scope.md), [features](../02-features.md), [UI/UX](../07-uiux-specification.md), [mô hình dữ liệu](../requirements/conceptual-data-model.md), [nghiệp vụ](../requirements/business-rules.md), [quyền](../requirements/permissions-matrix.md), [chỉ số](../requirements/metrics-catalog.md), [NFR](../requirements/non-functional-requirements.md), [M1–M6](../09-design-readiness.md).

## 2. Frontend đã chọn

| Thành phần | Lựa chọn | Phù hợp với thiết kế và giới hạn |
|---|---|---|
| Ngôn ngữ/framework | TypeScript strict, Next.js App Router, React | Layout dùng chung, route theo màn hình, tương tác theo vai trò; không viết business API trong Next.js |
| Styling/component | Tailwind CSS, shadcn/ui | Ánh xạ màu, spacing, typography và trạng thái v0.4 vào component; shadcn là mã component đưa vào repo để tùy biến, không phải giao diện hoàn chỉnh có sẵn |
| Icon | Lucide React | Hệ nét rõ và nhất quán, kèm nhãn; icon trang trí ẩn với screen reader, nút chỉ icon có accessible name. 44 SVG hiện tại là tài liệu thiết kế để đối chiếu |
| Form | React Hook Form, Zod, @hookform/resolvers | Form ticket, tài sản, user và dialog; giữ bản nhập khi lỗi, ánh xạ lỗi Pydantic về trường. Quyền và validation cuối cùng vẫn ở server |
| Server state | TanStack Query | Cache theo user/scope, invalidate sau mutation, polling 30 giây khi tab hoạt động; ngừng polling khi tab ẩn, xóa cache khi logout/đổi danh tính |
| Bảng | TanStack Table | Headless để giữ thiết kế riêng; lọc/sort/phân trang thực hiện ở backend, phản ánh trong URL; không tải cả tổ chức rồi lọc trong trình duyệt |
| Biểu đồ | Recharts | Chart trạng thái/ưu tiên/nhóm/xu hướng/tải công việc; API tính theo metrics catalog, có bảng/nhãn thay thế để đọc bằng bàn phím |
| Ngày giờ | date-fns, @date-fns/tz | Hiển thị Asia/Ho_Chi_Minh, nhận ISO 8601 có timezone từ API; UTC là chuẩn lưu trữ, không dùng giờ máy client để quyết định SLA |
| Hợp đồng API | openapi-typescript + fetch chuẩn | Sinh kiểu từ OpenAPI của FastAPI trong CI; không thêm Axios hoặc SDK khác khi chưa có nhu cầu |
| Package manager | pnpm | Khóa dependency bằng pnpm-lock.yaml khi M1; không tạo lockfile giả ở giai đoạn tài liệu |

Các form/bảng/chart tương tác là Client Components. Server Components phục vụ shell/render ban đầu theo thiết kế triển khai; không import repository/ORM. Dữ liệu theo phiên không đưa vào cache dùng chung giữa người dùng; chọn một chủ thể fetch cho mỗi vùng để tránh SSR và Query cùng gọi lặp. Không cần Redux, WebSocket, Framer Motion hoặc framework UI thứ hai cho MVP. CSS transition và reduced motion đủ cho hướng chuyển động hiện tại.

Next.js hỗ trợ React/App Router; shadcn có hướng dẫn React 19/Tailwind 4. Tailwind 4 yêu cầu trình duyệt hiện đại, cần xác nhận trình duyệt doanh nghiệp ở M1. Kiểm chứng accessibility vẫn phải thực hiện trên UI thật. [Next.js](https://nextjs.org/docs/app/getting-started/installation), [shadcn](https://ui.shadcn.com/docs/tailwind-v4), [Tailwind compatibility](https://tailwindcss.com/docs/compatibility).

## 3. Backend đã chọn

| Thành phần | Lựa chọn | Vai trò |
|---|---|---|
| Ngôn ngữ/framework | Python, FastAPI | REST JSON `/api/v1`, xác thực, quyền, nghiệp vụ; modular monolith |
| Validation/config | Pydantic, pydantic-settings | Schema input/output, cấu hình qua biến môi trường; không lộ secret trong log/OpenAPI |
| Database | PostgreSQL | Nguồn dữ liệu chuẩn cho ticket, session, SLA, notification, audit và asset |
| ORM/migration/driver | SQLAlchemy synchronous Session, Alembic, Psycopg 3 | Transaction, khóa bản ghi, version, ràng buộc; URL driver `postgresql+psycopg`, package `psycopg[binary]` |
| API runtime/tooling | Uvicorn, uv | Chạy ASGI, quản lý Python dependency bằng uv.lock ở M1 |
| Mật khẩu | pwdlib[argon2] | Argon2id qua thư viện được duy trì; chỉ là phần hash/verify, không thay thế dịch vụ phiên/CSRF |
| Upload/email validation | python-multipart; pydantic[email] | Nhận multipart, kiểm tra email. Allowlist tệp còn phải kiểm tra nội dung thực; extension và MIME do client gửi không đủ |
| Worker | Celery + Celery Beat | Một Beat phát lịch 60 giây; worker dùng chung service; task retry không tạo notification trùng |
| Broker | Redis qua celery[redis] | Hàng đợi, không là nguồn dữ liệu SLA hoặc nơi lưu session chuẩn. Để resolver chọn redis-py/Kombu tương thích |
| Storage | Adapter local private / S3 private qua boto3 | API kiểm tra quyền trước mỗi lần tải; file không nằm trong public/static hoặc bucket public |

Python và TypeScript giao tiếp qua HTTP/OpenAPI nên không cần dùng cùng ngôn ngữ. Chi phí thật là hai toolchain và quản lý contract; sinh type và integration test xử lý rủi ro lệch schema. Với backend nghiệp vụ độc lập và trợ lý AI trong MVP, lựa chọn này phù hợp. Provider/model/SDK AI chưa được chọn ở giai đoạn tài liệu; phải chốt trước triển khai tích hợp, không thêm dependency giả để đánh dấu hoàn thành.

**Chọn đồng bộ có chủ đích:** route/dependency có truy vấn blocking dùng `def`; Session mới theo request/task, không dùng global Session hay chia sẻ qua thread. `async def` không tự biến SQLAlchemy đồng bộ thành non-blocking. Chưa thêm AsyncSession, asyncpg hoặc eventlet/gevent. [FastAPI concurrency](https://fastapi.tiangolo.com/async/), [SQLAlchemy Session](https://docs.sqlalchemy.org/en/21/orm/session_basics.html).

Không dùng Django/DRF, Prisma, Better Auth hay BullMQ trong bộ stack này. Không triển khai thêm microservice hoặc backend nghiệp vụ song song trong Next.js.

## 4. Kiểm thử và vận hành đã chọn

| Nhóm | Công cụ | Điều cần chứng minh |
|---|---|---|
| Backend | pytest, HTTPX; PostgreSQL thật trong integration | State machine, IDOR, session revoke, CSRF, SLA/retry, concurrency; không dùng SQLite để chứng minh khóa/partial unique index của PostgreSQL |
| Frontend | Vitest, React Testing Library, môi trường DOM test | Form giữ dữ liệu/lỗi, quyền hiển thị, cache/polling; không thay integration test server |
| E2E | Playwright | Requester tạo → IT xử lý → giải quyết → requester đóng/mở lại; tải tệp và API sai quyền |
| Chất lượng code | Ruff, mypy; ESLint, Prettier | Typecheck/lint/format trong CI |
| Logs | Python logging dạng JSON, request ID | Liên kết API/worker/error; không ghi password, cookie, token hoặc nội dung bí mật |
| Local | Docker, Docker Compose | PostgreSQL, Redis, API/worker Linux; frontend có thể dev trên host; không cần S3 thật để chạy local |
| Production | Linux VPS, Docker Compose, Nginx, HTTPS | Một domain, chỉ public proxy; healthcheck, backup PostgreSQL + tệp, thử restore; đây chưa phải kiến trúc HA |
| CI | GitHub Actions | Lockfile frozen, type/lint/test/build, migration từ DB sạch, contract và E2E; không tự deploy khi chỉ chạy kiểm tra |

Celery không hỗ trợ Windows native chính thức; developer Windows chạy worker/Beat trong Linux container hoặc WSL2 Linux. Cần một scheduler cho cùng lịch, và task có thể chồng nhau dù chỉ một Beat. [Celery FAQ](https://docs.celeryq.dev/en/stable/faq.html), [Periodic tasks](https://docs.celeryq.dev/en/stable/userguide/periodic-tasks.html).

## 5. Chốt phạm vi và việc tiếp theo

**Đã chốt:** công nghệ, ranh giới frontend/backend, synchronous Session, PostgreSQL sessions, worker, storage, polling và công cụ kiểm thử. Bốn vai trò, 33 UC, 47 stories, máy trạng thái, công thức dashboard và D-29 không thay đổi.

**Chưa hoàn thành:** cài đặt/resolve dependency, lockfile, schema vật lý, API OpenAPI thực, bảo mật thực thi, benchmark, test/build và triển khai. M1 phải kiểm tra lại bản vá bảo mật, tạo lockfile thật và chạy các gate trong [baseline](version-baseline.md). Chưa cam kết ngày hoàn thành.

**AI trong MVP:** triển khai 8 UC/US đã đặc tả, kết nối provider thật và đạt 8 AC AI/12 ca kiểm chứng cùng regression lõi. Giao diện AI dùng stack frontend hiện có; backend có adapter AI riêng gọi service nghiệp vụ theo quyền user. Có thể bật/tắt khi vận hành; người dùng xác nhận nháp qua form/API hiện có. Chốt provider/model/SDK và chính sách dữ liệu trước tích hợp; không coi giao diện hoặc nội dung mẫu là AI hoạt động.
