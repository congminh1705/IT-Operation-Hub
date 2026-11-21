# FE-14.01 visual comparison

Chromium at 1440 × 1000 and 390 × 1000, reduced motion.

| Specimen | Desktop | Mobile |
| --- | --- | --- |
| ai-requester | [Reference](reference-ai-requester-1440.png) · [Application](actual-ai-requester-1440.png) | [Reference](reference-ai-requester-390.png) · [Application](actual-ai-requester-390.png) |
| ai-tech | [Reference](reference-ai-tech-1440.png) · [Application](actual-ai-tech-1440.png) | [Reference](reference-ai-tech-390.png) · [Application](actual-ai-tech-390.png) |
| ai-normal | [Reference](reference-ai-normal-1440.png) · [Application](actual-ai-normal-1440.png) | [Reference](reference-ai-normal-390.png) · [Application](actual-ai-normal-390.png) |

The authenticated application renders the owned conversation history, composer, and context independently of the wider AI workspace scaffold. On narrow screens these regions stack. Activity drill-down belongs to FE-10 and workspace composition belongs to FE-15. The static specimens do not include send cancellation, forged ID or owner-deletion flows; the browser log and identity-fencing test cover these actions.

[Chromium results](chromium.log). PO visual review pending.
