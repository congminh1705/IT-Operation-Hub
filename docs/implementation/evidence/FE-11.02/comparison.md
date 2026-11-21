# FE-11.02 decision comparison

Manager DEMO at 1440 × 1000 and 390 × 1000 with reduced motion.

| State | Desktop | Mobile |
| --- | --- | --- |
| Decision with reason | [Reference](reference-ai-approval-1440.png) · [Application](actual-ai-approval-1440.png) | [Reference](reference-ai-approval-390.png) · [Application](actual-ai-approval-390.png) |
| Stale decision | [Reference](reference-ai-states-1440.png) · [Application](actual-ai-states-1440.png) | [Reference](reference-ai-states-390.png) · [Application](actual-ai-states-390.png) |

The application follows the approval specimen with the reason and both actions below the before/after impact. It uses the authenticated shell and stacks the comparison on narrow screens. The generic AI state specimen has no dedicated stale-decision, revoked-policy or execution result, so the application uses a visible inline alert with the reason kept in place and an explicit reload action for stale snapshots. The scenario selector is a DEMO fixture control. Approval stays pending until a separate fixture is received, and even the success fixture leaves the assignment snapshot intact.

Chromium checks exercise real clicks, keyboard focus, reason validation, rejection, stale recovery, revoked/infeasible fixtures, and policy being turned off before returning to the approval screen. [Chromium results](chromium.log). PO visual review pending.
