# FE-09.03 — Saved change and pending evaluation

| Desktop 1440 | Mobile 390 |
| --- | --- |
| [HTML](reference-workforce-1440.png) / [App](actual-workforce-1440.png) | [HTML](reference-workforce-390.png) / [App](actual-workforce-390.png) |

The app keeps the workforce form and renders a saved-change banner with affected work and a separate evaluation-pending heading. The HTML shows the affected-work panel without a dedicated saved/conflict/no-capacity specimen. The app uses the existing Mac/Teal notice and error patterns. Joint PO review pending.

- IT Manager: enter absence 10:00–12:00 for DEMO TECHNICIAN for affected T07. Confirm save and open the linked ticket to see its existing SLA.
- Use 09:00–17:00 for the no-free-capacity case, or open /workforce?demo=workforce-conflict to verify that the note and time remain available for correction after rejection.
- [Chromium](chromium.log) includes a fixed-time before/after SLA comparison and scope regression.
