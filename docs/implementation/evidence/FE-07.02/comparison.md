# FE-07.02 — Upload progress, outcome and retry

| Comparison | Desktop 1440 | Mobile 390 |
| --- | --- | --- |
| Create | [HTML](reference-create-1440.png) / [App](actual-create-1440.png) | [HTML](reference-create-390.png) / [App](actual-create-390.png) |
| Recovery feedback | [HTML](reference-states-1440.png) / [App](actual-states-1440.png) | [HTML](reference-states-390.png) / [App](actual-states-390.png) |

No dedicated partial or unknown upload specimen exists. The app uses the create flow and approved recovery feedback pattern with a saved-ticket heading, per-file state and explicit next action. The screenshots show partial upload in the app for both reference comparisons. PO joint review pending.

As Requester use /tickets/new?demo=upload-partial with two DEMO files. Confirm, retry the remaining file and verify that only one ticket exists. Use ?demo=upload-unknown to check before retrying. [Chromium results](chromium.log).
