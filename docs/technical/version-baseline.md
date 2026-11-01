---
id: itoh-docs-technical-version-baseline
title: "Candidate versions and verification status"
type: reference
domain: architecture
module: dependencies
tags: [architecture, dependencies, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "List candidate versions and compatibility checks required before implementation."
---

# Candidate versions and verification status

**Research snapshot:30 October 2026.** An agreed stack is not an installed/tested package set. Repository content is documentation/SVG/XMind, without accepted application manifests/lockfiles. Versions below are **M1 candidates**, not dependency-resolution/build/test results.

## 1. Runtimes and infrastructure

| Component | Selected branch | Basis and conditions |
| --- | --- | --- |
| Node.js | 24 LTS | Target satisfies researched Next 16/ESLint10/Vitest 5 engines. No need to switch to newly released Node 26 LTS; do not select Node 20 merely for Next minimum |
| Python | 3.13 | Consistent API/worker/CI; supported patch at setup; verify Psycopg/Argon 2 wheels/containers |
| PostgreSQL | 18 stable | Psycopg 3 support; no PostgreSQL19 RC for MVP; pin patch/image digest at M1 |
| Redis server | 7.x | Review deployment/license at M1; server versions differ from Python redis-py |
| Nginx/Linux/Docker | Supported stable at M1 | Select patches/digests at setup; latest image names prove no compatibility |

Sources: [Node releases](https://nodejs.org/en/about/previous-releases), [Python versions](https://devguide.python.org/versions/), [PostgreSQL support](https://www.postgresql.org/support/versioning/), [Psycopg installation](https://www.psycopg.org/psycopg3/docs/basic/install.html). Recheck patches during implementation; no automatic major CI upgrades.

## 2. Frontend direct candidates

| Package | Candidate version | Check / note |
| --- | --- | --- |
| next / eslint-config-next | 16.4.3 / 16.4.3 | Matching versions; React 19 peer, Node≥20.9; ESLint config≥9 |
| react / react-dom / react-is | 19.3.1 / 19.3.1 / matching React 19 branch | React DOM peer matches; Recharts needs react-is; resolve exact compatible set |
| typescript | **5.9.3** | Not latest 7.0.2: openapi-typescript 7.13.0 peer `^5.x` is a metadata conflict |
| tailwindcss | 4.3.3 | shadcn supports Tailwind 4/React 19; verify PostCSS plugin |
| shadcn CLI | 4.23.0 | Component code generator, not a runtime replacement for all primitives |
| lucide-react | 1.64.0 | React 19 included in peers |
| react-hook-form / @hookform/resolvers / zod | 7.91.0 / 6.0.2 / 4.6.7 | Resolver RHF≥7.55/Zod 4 peers match |
| @tanstack/react-query | 5.105.0 | React 18/19 peer; explicit polling/cache configuration |
| @tanstack/react-table | 9.3.1 | React≥18/Node≥20; **use v9 documentation**, not copied v8 APIs |
| recharts | 3.10.1 | React/DOM/React-is peers include 19 |
| date-fns / @date-fns/tz | 4.4.0 / 1.5.0 | Test UTC/Asia/Ho_Chi_Minh formatting/parsing |
| pnpm | 12.16.1 | Record packageManager/create actual lock at M1 |
| openapi-typescript | 7.13.0 | Type-generation dev tool; reason for TypeScript5 here |
| vitest / @testing-library/react | 5.0.5 / 16.3.3 | Node 24 engine; resolve Vite/DOM environment/@testing-library/dom peers |
| @playwright/test | 1.64.1 | Match browser binaries/container to package |
| eslint / prettier | 10.13.0 / 3.9.10 | Node 24 engines; verify actual config/plugins before lock |

Metadata came from official npm registry latest/version endpoints. **Satisfying peer ranges does not prove API/plugin/build compatibility.** Supporting @types/react/react-dom/node, PostCSS, shadcn primitives, DOM test packages remain setup/solver choices, not implicitly locked.

Direct sources: [Next 16.4.3](https://registry.npmjs.org/next/16.4.3), [TypeScript5.9.3](https://registry.npmjs.org/typescript/5.9.3), [OpenAPI TypeScript](https://registry.npmjs.org/openapi-typescript/7.13.0), [resolvers](https://registry.npmjs.org/@hookform/resolvers/6.0.2), [TanStack Table](https://registry.npmjs.org/@tanstack/react-table/9.3.1), [Recharts](https://registry.npmjs.org/recharts/3.10.1), [Vitest](https://registry.npmjs.org/vitest/5.0.5), [shadcn compatibility](https://ui.shadcn.com/docs/tailwind-v4). The [metadata snapshot](package-metadata.json) records surveyed latest values, not all selected values.

## 3. Backend direct candidates

| Package | Candidate version/branch | Check / note |
| --- | --- | --- |
| fastapi | 0.162.0 | Python≥3.10/Pydantic≥2.9; base package, not every optional extra |
| pydantic / pydantic-settings | 2.14.2 / 2.16.2 | Python 3.13 satisfies metadata; email extra for EmailStr if used |
| SQLAlchemy / alembic | 2.1.6 / 1.20.1 | 2.1 docs/synchronous Session; no legacy mypy plugin if standard typed models suffice |
| psycopg [binary] | 3.3.6 | Psycopg 3, not psycopg 2 or package named psycopg 3 |
| uvicorn / uv | 0.54.0 / 0.13.6 | Environment-appropriate extras/solver lock |
| celery [redis] | 5.6.3 | Requires Kombu≥5.6; Linux workers |
| Kombu / redis-py | 5.6.2 / **≥4.5.2, <6.5, excluding 4.5.5 and 5.0.2** | Kombu 5.6.2 Redis extra range. **Do not pin redis-py latest 8.1.0** in this set; uv resolves a patch within range, then test broker |
| boto 3 | 1.43.122 | Sync adapter; no blocking S3 on event loop |
| pwdlib [argon 2] / argon 2-cffi | 0.3.1 / 25.1.0 | Hash/verify only; sessions/CSRF still need implementation/tests |
| python-multipart / email-validator | 0.0.32 / 2.3.0 | Upload/email validation packages |
| pytest / httpx | 9.2.0 / 0.28.1 | Real FastAPI/Starlette integration still untested |
| ruff / mypy | 0.17.3 / 2.4.1 | Lint/types do not prove runtime correctness |

Sources: [FastAPI](https://pypi.org/pypi/fastapi/0.162.0/json), [SQLAlchemy](https://pypi.org/pypi/SQLAlchemy/2.1.6/json), [Celery](https://pypi.org/pypi/celery/5.6.3/json), [Kombu Redis extra](https://pypi.org/pypi/kombu/5.6.2/json), [Psycopg](https://www.psycopg.org/psycopg3/docs/basic/install.html). Historical latest-combination conflicts found: **TypeScript/OpenAPI generator**, **redis-py/Kombu**. Do not hide them with --force or disabled peer checks.

## 4. M1 gates before claiming validated versions

1. Recheck releases/security advisories/licenses on setup date; supported patches within approved branches. Major upgrades need ADR/API migration review.
2. Use Node 24/Python 3.13 and production-like Linux; resolve actual transitive/optional dependencies, not unconditional latest.
3. Create pnpm-lock.yaml/uv.lock; clean frozen reinstall; pin runtime/container digests and tool versions.
4. Run Next build, strict TS, ESLint/Prettier; generate OpenAPI types; smoke forms/tables/charts/dates/API errors.
5. Alembic on clean PostgreSQL; session/CSRF/revoke/version/asset concurrency/upload/access tests. Real Celery/Redis/one Beat, retry/dedup/outage recovery.
6. Four-role Playwright; record versions/commands/results/failures. Confirm enterprise browsers support Tailwind 4; static SVGs do not prove browser support.

None performed during this documentation phase. No placeholder .env.example/Compose/migrations/seeds/pipelines merely to claim completion.

## 5. MVP AI dependencies

Assistant/coordination are MVP under D-35; PostgreSQL/pgvector RAG under D-37. D-39 confirms OpenAI API/gpt-5-mini/USD5/DEMO only for future M3; text-embedding-3-small remains proposed/verification-required. Production provider/model/embedding/SDK/budget/data policy D-40. After a separate coding request, resolve/lock packages and validate timeouts/retries/tools/schemas/quotas/all AC/A1–A13 before M5. No dependency installs/provider calls now.

## Verification status

Versions/metadata above are a historical 30 October 2026 snapshot, not accepted dependency/runtime results. At development start, recheck releases/security, resolve/lock, clean install/build/test. No accepted manifests/locks/environment; M1–M5 remain plans.
