# FE-06.06 — Independent SLA clocks

| Reference | Desktop 1440 | Mobile 390 |
| --- | --- | --- |
| Technician detail | [HTML](reference-ticket-it-1440.png) / [App](actual-ticket-it-1440.png) | [HTML](reference-ticket-it-390.png) / [App](actual-ticket-it-390.png) |
| Requester active | [HTML](reference-ticket-active-1440.png) / [App](actual-ticket-active-1440.png) | [HTML](reference-ticket-active-390.png) / [App](actual-ticket-active-390.png) |

The technician prototype groups two clock rows in Cam kết hỗ trợ. The app uses two bordered clock blocks with explicit state and usage in that section. The requester active specimen has no dedicated two-clock card. The app reuses the technician commitment pattern for public SLA data. Screenshots use fixed simulated time, DEMO fixtures and existing policy table, so durations and outcomes differ from the HTML. Captures use reduced motion. PO joint visual review pending.

- Open /tickets/TKT-000128 as Requester. Verify paused resolution and independent response, then confirm a substantive reply and check that resolution resumes without resetting used time.
- Open /tickets/TKT-000133 as IT Manager. Check stopped resolution, reopen with reason, then adjust priority. Verify usage, first response and history remain. The app uses the running local clock; exact fixed-time assertions are in the [Chromium log](chromium.log).
- SLA is a frontend DEMO projection with a 24/7 fixture clock. Real business calendars, worker alerts and service-side correctness are outside delivery.
