# Frontend foundation

FE-01.01 creates a minimal Vietnamese Next.js App Router application. It has no
backend dependency, domain fixtures, login, dashboard or AI calls. Shared design
tokens and feature screens belong to later tasks; this route is only a scaffold.

## Runtime and installation

Run commands in `src/frontend`. The package manager is pinned to pnpm 12.16.1;
`devEngines.runtime` selects Node 24.22.2 for this project without replacing system Node.
An initial install needs network access to npm and the Node distribution host.
Use `pnpm.cmd` on Windows when PowerShell execution policy blocks `pnpm.ps1`;
on other shells use `pnpm`. A pnpm installation supporting automatic
`packageManager` selection can bootstrap the pinned version.

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd exec node --version
pnpm.cmd typecheck
pnpm.cmd lint
pnpm.cmd format:check
pnpm.cmd test
pnpm.cmd build
pnpm.cmd dev --hostname 127.0.0.1
```

Visit `http://127.0.0.1:3000/`. Expected: HTTP 200, Vietnamese document language,
the IT Operations Hub heading and a Vietnamese foundation message. No API,
database, credentials or remote fonts are needed. Stop with Ctrl+C. For a built
production smoke check, run `pnpm.cmd start --hostname 127.0.0.1` after `build`.

Vitest runs the task-owned unit tests. Playwright exercises the generic UI in
Chromium: keyboard containment/return, Escape, field errors, pending states,
draft preservation, small-screen reflow and 200% CSS zoom.
`typecheck` generates Next route types before strict TypeScript checking, so it
also works before the first build. Lint is separate from the production build.

Resolved direct versions are in `package.json` and the real `pnpm-lock.yaml`.
Historical candidates in the version catalog are not an instruction to upgrade
unrelated packages. Run frozen install in a fresh checkout to reproduce this set;
do not hand-edit the lockfile. Build artifacts, dependency folders, local secrets
and TypeScript cache files are ignored by the frontend-local `.gitignore`.

The current workspace visual baseline is v1.3 / D-51 (Mac/Teal); D-47 login
remains unchanged. `/preview/primitives` and `/preview/feedback` are isolated
component previews, not completed business routes.

Run `pnpm.cmd exec playwright install chromium` once, then `pnpm.cmd test:e2e`.
An existing Chromium executable can be selected with the
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` environment variable. The tests reuse the
local dev server at port 3000 or start it if absent. By default screenshots go to
ignored `test-results/feedback-captures`; set `FEEDBACK_EVIDENCE_DIR` explicitly
to save a task handoff. Optional reference captures require the approved local
design server and `DESIGN_REFERENCE_URL=http://127.0.0.1:8790`; they are skipped
when that variable is absent. No design server is required for application tests.
For production-render verification after `build`, set `PLAYWRIGHT_USE_BUILD=1`
and `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3102` before running the suite.

Compatibility adjustment: ESLint 9.39.5 replaces the historical ESLint 10
candidate because the resolved Next plugin peer ranges exclude ESLint 10.
No peer-range overrides or disabled strict checks are used.
