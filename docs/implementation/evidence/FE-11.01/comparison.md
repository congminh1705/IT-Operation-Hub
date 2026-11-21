# FE-11.01 proposal comparison

Manager DEMO, reduced motion, 1440 × 1000 and 390 × 1000.

| Specimen | Desktop | Mobile |
| --- | --- | --- |
| Exception context | [Reference](reference-ai-exception-1440.png) · [Application](actual-ai-exception-1440.png) | [Reference](reference-ai-exception-390.png) · [Application](actual-ai-exception-390.png) |
| Approval detail | [Reference](reference-ai-approval-1440.png) · [Application](actual-ai-approval-1440.png) | [Reference](reference-ai-approval-390.png) · [Application](actual-ai-approval-390.png) |

The approval detail preserves the warning, current/proposed comparison and separate deadline, handover and ticket SLA values. The exception reference includes the wider AI workspace and context. The application uses the existing authenticated workspace and displays the detail at /approvals. At 390px the application stacks current before proposed, while the reference scrolls a fixed canvas. The named references have no missing-evidence specimen. The application uses the existing alert pattern and labels unknown values individually. Decision controls are verified under FE-11.02.

[Chromium results](chromium.log). PO visual review pending.
