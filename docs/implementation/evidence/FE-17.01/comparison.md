# FE-17.01 — Application and approved reference

Reference: [07-monitoring.html#notifications](../../../design/final/07-monitoring.html#notifications). Captures use Chrome at 1440 × 1000 and 390 × 1000.

| Role and state | Desktop | Mobile |
| --- | --- | --- |
| Requester · notifications | [Actual](actual-notifications-1440.png) · [Reference](reference-notifications-1440.png) | [Actual](actual-notifications-390.png) · [Reference](reference-notifications-390.png) |

The application adds the live unread counter, row-level read action and sanitized unavailable row. The HTML uses underlined tabs, decorative row icons and a reference-only read preview control. The runtime uses shared teal buttons and stacks row actions on narrow screens. The reference has no dedicated live revoked-link outcome.

Agent checked the running application and the reference. Both widths passed the document overflow assertion. Owner visual verdict by Hoang Cong Minh is pending. [Browser log](playwright.log).
