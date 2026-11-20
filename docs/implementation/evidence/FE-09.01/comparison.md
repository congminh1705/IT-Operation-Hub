# FE-09.01 — Workforce skills and daily capacity

| Desktop 1440 | Mobile 390 |
| --- | --- |
| [Approved HTML](reference-workforce-1440.png) / [Running app](actual-workforce-1440.png) | [Approved HTML](reference-workforce-390.png) / [Running app](actual-workforce-390.png) |

Agent used the approved workforce banner, tinted KPI cards and capacity table. The app uses a synthetic 20/11/2026 window and explicitly displays unknown vs computed capacity, overlapping absences and unallocated work. The approved HTML shows editing and affected-task panels belonging to later tasks. On mobile, KPI cards stack and the named table region scrolls horizontally. The preview may show pre-existing local search edits outside the diff. PO visual review pending.

- IT Manager / Admin: check verified and unverified skills, two original absence windows, merged 240-minute deduction and 120 free minutes for Technician B. Technician C has unknown capacity and free time.
- Technician: open the workforce page with scope=work and verify only self remains. Requester sees forbidden feedback.
- [Chromium](chromium.log) records responsive comparisons and role/absence checks.
