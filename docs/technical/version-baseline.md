# Baseline phiên bản và mức kiểm chứng

**Ngày tra cứu: 30/10/2026.** Chốt stack không đồng nghĩa bộ package đã cài hoặc đã chạy cùng nhau. Repo chỉ có tài liệu và SVG/XMind; không có package.json, pyproject.toml hoặc lockfile ứng dụng. Bảng dưới là **baseline ứng viên cho M1**, không phải kết quả dependency resolution/build/test.

## 1. Runtime và hạ tầng

| Thành phần | Nhánh chọn | Căn cứ và điều kiện |
|---|---|---|
| Node.js | 24 LTS | Baseline ổn định; đáp ứng engine của Next 16, ESLint 10 và Vitest 5 đã tra. Chưa cần chuyển Node 26 LTS mới ra; không chọn Node 20 chỉ vì đạt minimum Next |
| Python | 3.13 | Dùng thống nhất API/worker/CI, chọn patch được hỗ trợ khi khởi tạo; kiểm tra wheel Psycopg/Argon2 và test container |
| PostgreSQL | 18 stable | Psycopg 3 có hỗ trợ; không dùng PostgreSQL 19 RC cho MVP; chốt patch/image digest tại M1 |
| Redis server | 7.x | Broker với chính sách triển khai/giấy phép được review tại M1; không nhầm số version server với package Python redis-py |
| Nginx/Linux/Docker | Bản stable còn hỗ trợ tại M1 | Chọn image patch/digest cụ thể lúc khởi tạo; chưa khẳng định tương thích từ tên image `latest` |

Nguồn: [Node release status](https://nodejs.org/en/about/previous-releases), [Python versions](https://devguide.python.org/versions/), [PostgreSQL support](https://www.postgresql.org/support/versioning/), [Psycopg installation](https://www.psycopg.org/psycopg3/docs/basic/install.html). Các patch phải được kiểm tra lại lúc triển khai, không tự nâng major trong CI.

## 2. Frontend: ứng viên trực tiếp

| Package | Phiên bản ứng viên | Kiểm tra/ghi chú |
|---|---|---|
| next / eslint-config-next | 16.4.3 / 16.4.3 | Cùng phiên bản; Next peer React 19, Node ≥20.9; config ESLint khai báo ESLint ≥9 |
| react / react-dom / react-is | 19.3.1 / 19.3.1 / cùng nhánh React 19 | React DOM peer khớp React; Recharts yêu cầu react-is, cần resolve chính xác cùng bộ |
| typescript | **5.9.3** | Không dùng latest 7.0.2: openapi-typescript 7.13.0 đang peer `^5.x`; đây là xung đột thật ở metadata |
| tailwindcss | 4.3.3 | shadcn hỗ trợ Tailwind 4/React 19; kiểm tra plugin PostCSS tương ứng |
| shadcn CLI | 4.23.0 | Tool tạo mã component, không coi là runtime dependency thay mọi primitive |
| lucide-react | 1.64.0 | Peer React gồm 19 |
| react-hook-form / @hookform/resolvers / zod | 7.91.0 / 6.0.2 / 4.6.7 | Resolver peer RHF ≥7.55 và Zod 4 phù hợp |
| @tanstack/react-query | 5.105.0 | Peer React 18/19; cấu hình polling và cache rõ |
| @tanstack/react-table | 9.3.1 | Peer React ≥18, Node ≥20; **dùng tài liệu v9**, không sao chép API v8 vào triển khai v9 |
| recharts | 3.10.1 | Peer React/DOM/React-is có nhánh 19 |
| date-fns / @date-fns/tz | 4.4.0 / 1.5.0 | Kiểm tra format/parse UTC và Asia/Ho_Chi_Minh bằng test |
| pnpm | 12.16.1 | Ghi packageManager khi M1; tạo lockfile thật |
| openapi-typescript | 7.13.0 | Dev tool sinh type; là lý do giữ TypeScript 5 ở baseline |
| vitest / @testing-library/react | 5.0.5 / 16.3.3 | Vitest engine chấp nhận Node 24; bổ sung Vite/DOM environment và @testing-library/dom theo peer khi resolve |
| @playwright/test | 1.64.1 | Browser binary/container phải khớp package |
| eslint / prettier | 10.13.0 / 3.9.10 | Node 24 đáp ứng engine; kiểm tra plugin/config thực trước khóa |

Metadata package lấy từ npm registry chính thức theo `/package/latest` và endpoint version cụ thể. **Peer range thỏa không chứng minh API, plugin hoặc build đã tương thích.** Các package bổ trợ như @types/react, @types/react-dom, @types/node, PostCSS plugin, shadcn primitives và môi trường DOM test sẽ do bộ khởi tạo/solver xác định, không được ngầm coi đã khóa.

Nguồn kiểm tra trực tiếp: [Next 16.4.3 metadata](https://registry.npmjs.org/next/16.4.3), [TypeScript 5.9.3 metadata](https://registry.npmjs.org/typescript/5.9.3), [OpenAPI TypeScript metadata](https://registry.npmjs.org/openapi-typescript/7.13.0), [resolver metadata](https://registry.npmjs.org/@hookform/resolvers/6.0.2), [TanStack Table metadata](https://registry.npmjs.org/@tanstack/react-table/9.3.1), [Recharts metadata](https://registry.npmjs.org/recharts/3.10.1), [Vitest metadata](https://registry.npmjs.org/vitest/5.0.5), [shadcn compatibility](https://ui.shadcn.com/docs/tailwind-v4). Bản tra metadata đầy đủ được ghi tại [snapshot](package-metadata.json); các giá trị latest trong đó là bằng chứng khảo sát, không phải mọi giá trị được chọn.

## 3. Backend: ứng viên trực tiếp

| Package | Phiên bản/nhánh ứng viên | Kiểm tra/ghi chú |
|---|---|---|
| fastapi | 0.162.0 | Yêu cầu Python ≥3.10/Pydantic ≥2.9; dùng package nền, không thêm mọi optional extra |
| pydantic / pydantic-settings | 2.14.2 / 2.16.2 | Runtime Python 3.13 đáp ứng metadata; thêm email extra nếu dùng EmailStr |
| SQLAlchemy / alembic | 2.1.6 / 1.20.1 | Dùng tài liệu 2.1, synchronous Session; không thêm mypy plugin legacy nếu typed model chuẩn đủ |
| psycopg[binary] | 3.3.6 | Psycopg 3, không phải psycopg2 hoặc tên package psycopg3 |
| uvicorn / uv | 0.54.0 / 0.13.6 | Chốt extras phù hợp môi trường và lock solver |
| celery[redis] | 5.6.3 | Celery yêu cầu Kombu ≥5.6; worker Linux |
| Kombu / redis-py | 5.6.2 / **≥4.5.2,<6.5, loại 4.5.5 và 5.0.2** | Kombu 5.6.2 Redis extra khai báo range này. **Không pin redis-py latest 8.1.0** cùng bộ này; để uv resolve patch trong range rồi test broker |
| boto3 | 1.43.122 | Đồng bộ qua adapter; không gọi blocking S3 trên event loop |
| pwdlib[argon2] / argon2-cffi | 0.3.1 / 25.1.0 | Chỉ hash/verify; dịch vụ phiên và CSRF còn phải xây/test |
| python-multipart / email-validator | 0.0.32 / 2.3.0 | Package upload/email validation cần thiết |
| pytest / httpx | 9.2.0 / 0.28.1 | Integration với FastAPI/Starlette trong môi trường thực còn phải chạy |
| ruff / mypy | 0.17.3 / 2.4.1 | Lint/typecheck riêng, không chứng minh đúng runtime |

Nguồn: [FastAPI metadata](https://pypi.org/pypi/fastapi/0.162.0/json), [SQLAlchemy metadata](https://pypi.org/pypi/SQLAlchemy/2.1.6/json), [Celery metadata](https://pypi.org/pypi/celery/5.6.3/json), [Kombu Redis extra](https://pypi.org/pypi/kombu/5.6.2/json), [Psycopg](https://www.psycopg.org/psycopg3/docs/basic/install.html). Đây là hai xung đột đã phát hiện khi ghép latest: **TypeScript/OpenAPI generator** và **redis-py/Kombu**; không dùng `--force` hoặc bỏ peer checks để che lỗi.

## 4. Gate M1 trước khi gọi bộ phiên bản là đã kiểm chứng

1. Kiểm tra release/security advisory và giấy phép lại ở ngày khởi tạo; cập nhật patch trong nhánh được chấp thuận. Nâng major phải ghi ADR và kiểm tra migration API.
2. Khởi tạo Node 24/Python 3.13 cùng môi trường Linux production; resolve dependency/transitive/optional extras thật, không dùng latest vô điều kiện.
3. Tạo pnpm-lock.yaml/uv.lock; cài lại từ môi trường sạch bằng frozen lock, pin runtime/container digest và lưu phiên bản công cụ.
4. Chạy Next build, TS strict, ESLint/Prettier; sinh OpenAPI types; smoke form/table/chart/date và test API error mapping.
5. Chạy Alembic trên PostgreSQL sạch; session/CSRF/revoke, version conflict, asset double allocation; test upload/permission. Chạy Celery + Redis thật, Beat một instance, retry/dedup và phục hồi sau gián đoạn.
6. Chạy Playwright cho bốn vai trò; ghi rõ phiên bản đã thử, lệnh, kết quả và phần chưa đạt. Xác nhận trình duyệt doanh nghiệp đáp ứng Tailwind 4; không dùng SVG tĩnh làm bằng chứng browser support.

Chưa thực hiện các gate trên trong đợt tài liệu này. Chưa tạo `.env.example`, Compose, migration, seed hoặc pipeline giả chỉ để đánh dấu hoàn thành.

## 5. Dependency AI trong MVP

Theo D-33 cập nhật, trợ lý AI thuộc MVP. Chưa chọn provider/model/SDK; đây là hạng mục cần chốt ở M1 trước tích hợp, không phải lý do chuyển AI sang giai đoạn sau. Sau khi chọn, bổ sung phiên bản SDK và dependency cần thiết vào uv.lock/pnpm-lock.yaml, kiểm tra tương thích, retry/timeout, phạm vi dữ liệu và 8 AC AI/12 ca kiểm chứng cùng regression lõi trước nghiệm thu M6. Không thêm framework AI/vector DB khi chưa có căn cứ kỹ thuật.
