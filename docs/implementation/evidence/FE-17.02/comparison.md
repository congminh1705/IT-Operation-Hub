# FE-17.02 — Application and approved reference

Reference: [07-monitoring.html#audit](../../../design/final/07-monitoring.html#audit). Captures use Chrome at 1440 × 1000 and 390 × 1000.

| Role and state | Desktop | Mobile |
| --- | --- | --- |
| Manager · business | [Actual](actual-audit-manager-1440.png) · [Reference](reference-audit-manager-1440.png) | [Actual](actual-audit-manager-390.png) · [Reference](reference-audit-manager-390.png) |
| Admin · identity/SLA | [Actual](actual-audit-admin-1440.png) · [Reference](reference-audit-admin-1440.png) | [Actual](actual-audit-admin-390.png) · [Reference](reference-audit-admin-390.png) |

The application uses the reference table structure and an internally scrollable table on mobile. It adds event count, pagination and active filters, and shows outcome directly. The static HTML uses one mixed specimen and has no dedicated Admin, detail or denied state. The app uses scoped fixtures and retains the shared workspace shell.

Agent checked the running application and the reference. Both widths passed the document overflow assertion. Owner visual verdict by Hoang Cong Minh is pending. [Browser log](playwright.log).
