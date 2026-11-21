# FE-15.04 visual comparison

Chromium at 1440 × 1000 and 390 × 1000, reduced motion.

| Specimen | Desktop | Mobile |
| --- | --- | --- |
| ai-normal | [Reference](reference-ai-normal-1440.png) · [Application](actual-ai-normal-1440.png) | [Reference](reference-ai-normal-390.png) · [Application](actual-ai-normal-390.png) |
| ai-exception | [Reference](reference-ai-exception-1440.png) · [Application](actual-ai-exception-1440.png) | [Reference](reference-ai-exception-390.png) · [Application](actual-ai-exception-390.png) |

On desktop, assistant identity and suggestions are immediately above the chat, with independently scoped activity to the right and a full proposal above the workspace only for the selected authorized exception. A compact switch separates Chat and Activity on mobile; the normal 390px capture shows Chat, while the exception capture shows Activity and the proposal. The static references show a wider example canvas instead of interactive mobile tabs. No-run, normal/no-approval, approved, policy-off and closing chat were exercised in Chromium.

[Chromium results](chromium.log). PO visual review pending.
