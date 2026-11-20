# FE-10.03 — Coordination activity and retry

| Reference | Desktop 1440 | Mobile 390 |
| --- | --- | --- |
| Normal | [HTML](reference-ai-normal-1440.png) / [App](actual-ai-normal-1440.png) | [HTML](reference-ai-normal-390.png) / [App](actual-ai-normal-390.png) |
| Exception | [HTML](reference-ai-exception-1440.png) / [App](actual-ai-exception-1440.png) | [HTML](reference-ai-exception-390.png) / [App](actual-ai-exception-390.png) |

The normal/exception references are full AI Workspace compositions. The app implements the owned activity surface with responsive Night City timeline cards, visible state labels and a scoped fixture selector. The approved exception sample is the nearest reference for approval without execution. Chat, proposal review and approval remain in their own tasks. No-run, disabled and failure have no dedicated approved activity specimen. PO joint review pending.

Open /automation/activity as IT Manager. Check that opening shows no run. Compare queued, approved, normal and failed. Confirm retry only puts the fixture into queue while retaining the lock and prior failure. Toggle the policy off in /automation/policies and check retry denial. [Chromium](chromium.log).
