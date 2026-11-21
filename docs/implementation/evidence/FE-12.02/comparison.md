# FE-12.02 visual comparison

Chromium at 1440 × 1000 and 390 × 1000, reduced motion.

| Specimen | Desktop | Mobile |
| --- | --- | --- |
| asset-form | [Reference](reference-asset-form-1440.png) · [Application](actual-asset-form-1440.png) | [Reference](reference-asset-form-390.png) · [Application](actual-asset-form-390.png) |

Both forms use the approved metadata fields, a stock notice on create, and separate preview and confirmation. The authenticated shell keeps the current asset navigation. At 390px fields stack. The reference has no duplicate/invalid-date state. Browser checks verified inline errors and retained input; the typed mock test confirmed submitted holder/state fields are ignored.

[Chromium results](chromium.log). PO visual review pending.
