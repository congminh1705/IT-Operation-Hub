# FE-02.03 — role-aware workspace shell comparison

State: **review**. PO visual verdict: **pending**. UI: v1.3 / D-51.

## Open the running implementation

- Requester: http://127.0.0.1:3000/preview/workspace/requester/dashboard
- Technician: http://127.0.0.1:3000/preview/workspace/technician/dashboard
- Manager: http://127.0.0.1:3000/preview/workspace/manager/dashboard
- Admin: http://127.0.0.1:3000/preview/workspace/admin/dashboard

These are isolated developer persona fixtures. Product navigation has no role switch. Ordinary `/dashboard` and declared route stubs use the explicit Requester fixture until session routing is implemented in FE-03. No role query grants access.

## Reference / actual pairs

| Role | Approved desktop | Actual desktop | Approved mobile | Actual mobile / drawer |
| --- | --- | --- | --- | --- |
| Requester | [1440](reference-requester-1440.png) | [1440](actual-requester-1440.png) | [390](reference-requester-390.png) | [390](actual-requester-390.png) / [drawer](actual-requester-drawer-390.png) |
| Technician | [1440](reference-technician-1440.png) | [1440](actual-technician-1440.png) | [390](reference-technician-390.png) | [390](actual-technician-390.png) / [drawer](actual-technician-drawer-390.png) |
| Manager | [1440](reference-manager-1440.png) | [1440](actual-manager-1440.png) | [390](reference-manager-390.png) | [390](actual-manager-390.png) / [drawer](actual-manager-drawer-390.png) |
| Admin | [1440](reference-admin-1440.png) | [1440](actual-admin-1440.png) | [390](reference-admin-390.png) | [390](actual-admin-390.png) / [drawer](actual-admin-drawer-390.png) |

Additional captures exist for every role at 320 and 768px and for each mobile drawer at 320px. [Long employee name + 200% CSS layout zoom](actual-long-name-200-percent.png). All final implementation screenshots are from the production build. [Browser results](browser-results.json).

## Owned appearance and explicit differences

The shell implements the approved 224px light rail, 72px white topbar, Inter, teal selection, 40px icon controls, default avatar, name/role and full-width Profile action. It reuses the existing SVG sprite/default-avatar assets. Desktop navigation scrolls independently when long; the account block remains accessible. Mobile uses the existing native Dialog with drawer styling and tested keyboard containment/return. Branding and item vocabulary are shared across roles; entries differ only by the declared role/capability projection.

The sidebar follows the **information-architecture matrix**, which is more complete than individual dashboard screenshots: Technician has personal/team work and self schedule lookup; Manager/Admin have approval/policy shortcuts; Admin has the declared administration entries. AI Workspace appears once. These are routes to pending screens, not implemented business functionality. The fixed organization badge is informational and does not pretend to switch organizations.

The topbar uses the scoped search form consistently. Some dashboard references show breadcrumbs there instead; the approved shared toolbar geometry and scoped-search requirement govern the implementation. Breadcrumbs remain above page titles. Synthetic fixture display names are shown unchanged rather than inventing employee identities.

Reference business cards/KPIs/tables/AI canvas were deliberately not implemented in this shell task. Every unavailable destination clearly says “Chức năng chưa triển khai”; logout explicitly says the session has not been changed, and search says no data search has run. This is a comparison of navigation/chrome, not a claim of whole-dashboard pixel parity.

## Verified behavior and limits

- Four-role matrix, one AI entry, active location/query scopes and all visible Admin destination links.
- Requester omits internal work/workforce/reports/audit/admin; Technician has self/team scope only. Query edits cannot widen the declared fixture projection. This is UI projection, not real backend authorization.
- Drawer open, Tab/Shift+Tab wrapping, Escape, link-driven close, return focus and active state after navigation; account links, Escape/return and honest logout placeholder.
- Skip link focus, long Vietnamese labels/names, default avatar and 320/390/768/1440 reflow for all roles; representative 200% CSS layout zoom.
- Ticket-search input is encoded and bounded to 180 characters; query text does not become role parameters. No domain fetch/write or auth redirect was added.
- 58 unit tests / five files passed; 37 production Chromium tests passed (27 shell/reference + 10 feedback regression). Typecheck/lint/format/build passed. Final browser tests assert no page/console errors.
- Native browser-menu zoom and screen-reader speech were not manually certified; PO visual approval is pending. The default Requester fixture and all route stubs must be replaced only in their owned session/feature tasks.

## Scope / delivery

No new package was installed. The shared Dialog gained optional id/className for the drawer; its existing feedback regression suite passed. The older feedback preview link was converted to Next Link because the new route inventory enabled the corresponding lint rule. No login design/source, backend, database, model, feature screen, theme switcher or second icon system was changed.

FE-02.02 was explicitly accepted by PO and closed in commit 97a3ac8 before FE-02.03. Implementation is committed separately on phase/a-frontend. PR #2 already exists; it receives this same-Parent delivery. FE-02.04 remains pending and FE-02 Parent is not complete. Do not merge the Parent PR before its closure criteria pass; PO should merge before the next Parent begins.
