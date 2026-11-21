# FE-12.04 visual comparison

Chromium at 1440 × 1000 and 390 × 1000, reduced motion.

| Specimen | Desktop | Mobile |
| --- | --- | --- |
| asset-action | [Reference](reference-asset-action-1440.png) · [Application](actual-asset-action-1440.png) | [Reference](reference-asset-action-390.png) · [Application](actual-asset-action-390.png) |
| create | [Reference](reference-create-1440.png) · [Application](actual-create-1440.png) | [Reference](reference-create-390.png) · [Application](actual-create-390.png) |

The mandatory asset-action reference shows the asset context and a return-to-ticket action; it has no dedicated ticket-picker or stale fixture. Actual captures show the eligible asset selected in the existing ticket form. The additional create reference is the layout match for that field. Requester/Technician can use their issued assets; Manager/Admin can use eligible organization assets. Browser coverage verifies a stale fixture and both link directions. A timed unit check covers an actual return between preview and commit.

[Chromium results](chromium.log). PO visual review pending.
