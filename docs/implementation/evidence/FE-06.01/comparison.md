# FE-06.01 — Ticket detail and authorized history

Agent comparison on the FE DEMO production build, Chromium, reduced motion enabled. PO visual review pending.

| Role/state | 1440 × 1000 | 390 × 1000 |
| --- | --- | --- |
| Technician, In Progress | [HTML](reference-ticket-it-1440.png) / [App](actual-ticket-it-1440.png) | [HTML](reference-ticket-it-390.png) / [App](actual-ticket-it-390.png) |
| Requester, Pending | [HTML](reference-ticket-requester-1440.png) / [App](actual-ticket-requester-1440.png) | [HTML](reference-ticket-requester-390.png) / [App](actual-ticket-requester-390.png) |
| Requester, In Progress | [HTML](reference-ticket-active-1440.png) / [App](actual-ticket-active-1440.png) | [HTML](reference-ticket-active-390.png) / [App](actual-ticket-active-390.png) |

The app uses the existing DEMO records, title and status badges, a separate conversation panel, a 2:1 desktop content/context grid, and a single mobile column. The Pending requester sees the next-action banner. Public conversation and history exclude internal text and metadata. A technician can switch to internal notes and see authorized internal history for a team ticket. The app uses segmented buttons for audience selection. The active requester uses the same detail layout, while the HTML illustration emphasizes public progress. The app uses the shared generic detail heading and existing synthetic actors and dates. Context fields reflect the fields available on the existing fixtures. Composer, lifecycle actions and separate SLA clocks are assigned to subsequent FE-06 tasks. Existing local search toolbar edits may appear in captures and are outside this task commit.

The production build was exercised with direct own, team and out-of-scope routes, history ordering and an explicit detail read failure with retry. Desktop and mobile captures checked horizontal overflow. Playwright did not run an automated contrast audit or tablet visual capture in this attempt.

## PO steps

1. Open the application at /tickets/TKT-000128 as the DEMO Requester. Verify the Pending banner, public messages and public history. Open /tickets/TKT-000150 after signing in and verify the access feedback.
2. Open /tickets/TKT-000128 as the DEMO Technician. Verify the internal controls, note content and internal history.
3. Open /tickets/TKT-000128?demo=detail-error as Requester and use **Thử lại** to return to the authorized detail.
