# FE-07.03 — Audience-safe file download

| View | Desktop 1440 | Mobile 390 |
| --- | --- | --- |
| Technician | [HTML](reference-ticket-it-1440.png) / [App](actual-ticket-it-1440.png) | [HTML](reference-ticket-it-390.png) / [App](actual-ticket-it-390.png) |
| Requester | [HTML](reference-ticket-requester-1440.png) / [App](actual-ticket-requester-1440.png) | [HTML](reference-ticket-requester-390.png) / [App](actual-ticket-requester-390.png) |

The prototype shows the detail and conversation hierarchy. The app adds file controls to the ticket or message containing the file. The technician image is on the internal view to show its note attachment. The reference has no dedicated missing or revoked download specimen. Download feedback uses the existing permission/error patterns. Existing local search toolbar edits may appear outside the committed scope. PO joint review pending.

Open /tickets/TKT-000128 as Requester to download the synthetic PDF and try the missing file in public conversation. Open /tickets/TKT-000127 as Technician, switch to internal notes, and verify its DEMO attachment. Repeat with ?demo=download-revoked to verify the click rechecks access. [Chromium results](chromium.log).
