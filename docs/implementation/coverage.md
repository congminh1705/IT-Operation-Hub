---
id: itoh-implementation-coverage
title: "Story-to-task coverage"
type: planning
domain: development
module: delivery
tags: [implementation, backlog, traceability]
priority: 1
status: planned
owner: PO
approval: needs-review
updated: 2026-11-09
authority: derived
purpose: "Map all existing user stories and cross-cutting acceptance to delivery tasks without claiming implementation."
---

# Story-to-task coverage

**Approved frontend scope:** [v1.1 / D-47](../design/approval.md), including the final interactive login. Use the [63-task design map](../design/implementation-scope.md#task-map). Existing IDs, dependencies, business acceptance and lifecycle remain authoritative; visual approval does not start implementation.

All 67 existing stories remain in scope. The frontend column identifies Phase A DEMO delivery; original tasks retain real service and business acceptance, with INT-01–06 connecting the UI in Phase C. Frontend completion alone never completes a story. Rows identify implementation owners, including minimum/foundation subsets and later completion. **Every listed owner must satisfy its relevant outcomes before the story is accepted**; task completion alone does not replace the original AC or integrated QA-04 evidence. All original IDs below are work packages. All 230 leaf task statuses are maintained on the execution board; all application evidence is NOT RUN.

[Package registry](README.md#4-task-tracker) and [executable tasks](workflow/execution-board.md) · [Core/OPS stories](../08-invest-requirements.md) · [Assistant stories/AC](../ai/use-cases-stories-and-acceptance.md) · [Master traceability](../traceability/master-traceability.md).

## 1. Core stories

| Story | Acceptance source | Original delivery tasks | Frontend DEMO tasks |
| --- | --- | --- | --- |
| US01 | [AC01](../06-acceptance-criteria.md) | [FND-04](01-foundation.md#fnd-04) | [FE-03](06-frontend-first.md#fe-03) |
| US02 | [AC02](../06-acceptance-criteria.md) | [FND-04](01-foundation.md#fnd-04) | [FE-03](06-frontend-first.md#fe-03) |
| US03 | [AC03](../06-acceptance-criteria.md) | [FND-07](01-foundation.md#fnd-07) | [FE-03](06-frontend-first.md#fe-03) |
| US04 | [AC04](../06-acceptance-criteria.md) | [FND-07](01-foundation.md#fnd-07) | [FE-03](06-frontend-first.md#fe-03) |
| US05 | [AC05](../06-acceptance-criteria.md) | [FND-06](01-foundation.md#fnd-06) | [FE-04](06-frontend-first.md#fe-04) |
| US06 | [AC06](../06-acceptance-criteria.md) | [FND-17](01-foundation.md#fnd-17) | [FE-04](06-frontend-first.md#fe-04) |
| US07 | [AC07](../06-acceptance-criteria.md) | [FND-17](01-foundation.md#fnd-17) | [FE-04](06-frontend-first.md#fe-04) |
| US08 | [AC08](../06-acceptance-criteria.md) | [FND-05](01-foundation.md#fnd-05) | [FE-04](06-frontend-first.md#fe-04) |
| US09 | [AC09](../06-acceptance-criteria.md) | [FND-05](01-foundation.md#fnd-05), [FND-17](01-foundation.md#fnd-17) | [FE-04](06-frontend-first.md#fe-04) |
| US10 | [AC10](../06-acceptance-criteria.md) | [FND-05](01-foundation.md#fnd-05), [FND-17](01-foundation.md#fnd-17) | [FE-04](06-frontend-first.md#fe-04) |
| US11 | [AC11](../06-acceptance-criteria.md) | [FND-08](01-foundation.md#fnd-08) | [FE-04](06-frontend-first.md#fe-04) |
| US12 | [AC12](../06-acceptance-criteria.md) | [FND-08](01-foundation.md#fnd-08) | [FE-04](06-frontend-first.md#fe-04) |
| US13 | [AC13](../06-acceptance-criteria.md) | [FND-09](01-foundation.md#fnd-09), [OPS-02](04-operations-assistant.md#ops-02) | [FE-05](06-frontend-first.md#fe-05) |
| US14 | [AC14](../06-acceptance-criteria.md) | [FND-10](01-foundation.md#fnd-10) | [FE-05](06-frontend-first.md#fe-05) |
| US15 | [AC15](../06-acceptance-criteria.md) | [FND-10](01-foundation.md#fnd-10) | [FE-05](06-frontend-first.md#fe-05) |
| US16 | [AC16](../06-acceptance-criteria.md) | [FND-11](01-foundation.md#fnd-11), [OPS-04](04-operations-assistant.md#ops-04) | [FE-06](06-frontend-first.md#fe-06) |
| US17 | [AC17](../06-acceptance-criteria.md) | [FND-11](01-foundation.md#fnd-11) | [FE-06](06-frontend-first.md#fe-06) |
| US18 | [AC18](../06-acceptance-criteria.md) | [FND-11](01-foundation.md#fnd-11) | [FE-06](06-frontend-first.md#fe-06) |
| US19 | [AC19](../06-acceptance-criteria.md) | [FND-11](01-foundation.md#fnd-11) | [FE-06](06-frontend-first.md#fe-06) |
| US20 | [AC20](../06-acceptance-criteria.md) | [FND-12](01-foundation.md#fnd-12) | [FE-06](06-frontend-first.md#fe-06) |
| US21 | [AC21](../06-acceptance-criteria.md) | [FND-12](01-foundation.md#fnd-12) | [FE-06](06-frontend-first.md#fe-06) |
| US22 | [AC22](../06-acceptance-criteria.md) | [OPS-05](04-operations-assistant.md#ops-05) | [FE-07](06-frontend-first.md#fe-07) |
| US23 | [AC23](../06-acceptance-criteria.md) | [OPS-05](04-operations-assistant.md#ops-05) | [FE-07](06-frontend-first.md#fe-07) |
| US24 | [AC24](../06-acceptance-criteria.md) | [FND-12](01-foundation.md#fnd-12) | [FE-06](06-frontend-first.md#fe-06) |
| US25 | [AC25](../06-acceptance-criteria.md) | [FND-12](01-foundation.md#fnd-12) | [FE-06](06-frontend-first.md#fe-06) |
| US26 | [AC26](../06-acceptance-criteria.md) | [FND-12](01-foundation.md#fnd-12) | [FE-06](06-frontend-first.md#fe-06) |
| US27 | [AC27](../06-acceptance-criteria.md) | [FND-12](01-foundation.md#fnd-12) | [FE-06](06-frontend-first.md#fe-06) |
| US28 | [AC28](../06-acceptance-criteria.md) | [FND-12](01-foundation.md#fnd-12) | [FE-06](06-frontend-first.md#fe-06) |
| US29 | [AC29](../06-acceptance-criteria.md) | [FND-12](01-foundation.md#fnd-12) | [FE-06](06-frontend-first.md#fe-06) |
| US30 | [AC30](../06-acceptance-criteria.md) | [FND-13](01-foundation.md#fnd-13) | [FE-06](06-frontend-first.md#fe-06) |
| US31 | [AC31](../06-acceptance-criteria.md) | [FND-13](01-foundation.md#fnd-13) | [FE-06](06-frontend-first.md#fe-06) |
| US32 | [AC32](../06-acceptance-criteria.md) | [OPS-03](04-operations-assistant.md#ops-03) | [FE-06](06-frontend-first.md#fe-06) |
| US33 | [AC33](../06-acceptance-criteria.md) | [OPS-03](04-operations-assistant.md#ops-03), [OPS-04](04-operations-assistant.md#ops-04) | [FE-06](06-frontend-first.md#fe-06), [FE-17](06-frontend-first.md#fe-17) |
| US34 | [AC34](../06-acceptance-criteria.md) | [OPS-04](04-operations-assistant.md#ops-04) | [FE-17](06-frontend-first.md#fe-17) |
| US35 | [AC35](../06-acceptance-criteria.md) | [AI-02](03-ai-automation.md#ai-02), [OPS-01](04-operations-assistant.md#ops-01) | [FE-12](06-frontend-first.md#fe-12) |
| US36 | [AC36](../06-acceptance-criteria.md) | [OPS-01](04-operations-assistant.md#ops-01) | [FE-12](06-frontend-first.md#fe-12) |
| US37 | [AC37](../06-acceptance-criteria.md) | [OPS-01](04-operations-assistant.md#ops-01) | [FE-12](06-frontend-first.md#fe-12) |
| US38 | [AC38](../06-acceptance-criteria.md) | [OPS-02](04-operations-assistant.md#ops-02) | [FE-12](06-frontend-first.md#fe-12) |
| US39 | [AC39](../06-acceptance-criteria.md) | [OPS-02](04-operations-assistant.md#ops-02) | [FE-12](06-frontend-first.md#fe-12) |
| US40 | [AC40](../06-acceptance-criteria.md) | [OPS-02](04-operations-assistant.md#ops-02) | [FE-12](06-frontend-first.md#fe-12) |
| US41 | [AC41](../06-acceptance-criteria.md) | [OPS-16](04-operations-assistant.md#ops-16) | [FE-16](06-frontend-first.md#fe-16) |
| US42 | [AC42](../06-acceptance-criteria.md) | [OPS-16](04-operations-assistant.md#ops-16) | [FE-16](06-frontend-first.md#fe-16) |
| US43 | [AC43](../06-acceptance-criteria.md) | [OPS-17](04-operations-assistant.md#ops-17) | [FE-16](06-frontend-first.md#fe-16) |
| US44 | [AC44](../06-acceptance-criteria.md) | [OPS-17](04-operations-assistant.md#ops-17) | [FE-16](06-frontend-first.md#fe-16) |
| US45 | [AC45](../06-acceptance-criteria.md) | [OPS-17](04-operations-assistant.md#ops-17) | [FE-16](06-frontend-first.md#fe-16) |
| US46 | [AC46](../06-acceptance-criteria.md) | [OPS-17](04-operations-assistant.md#ops-17) | [FE-16](06-frontend-first.md#fe-16) |
| US47 | [AC47](../06-acceptance-criteria.md) | [FND-18](01-foundation.md#fnd-18) | [FE-17](06-frontend-first.md#fe-17) |

Ticket acceptance is phased: M1 supplies core persistence/states and SLA facts; OPS-02 adds asset linking, OPS-05 files, OPS-03 full clock/alert presentation and OPS-04 notifications. Full AC13–40 acceptance waits for all applicable integrations at QA-04. FND-17 completes user/team mutation and handover started by FND-05/06. AI-02 supplies minimum persisted inventory, not full asset operations.

## 2. Coordination stories

| Story | Acceptance source | Original delivery tasks | Frontend DEMO tasks |
| --- | --- | --- | --- |
| US-OPS01 | [AC-OPS01](../06-acceptance-criteria.md) | [FND-14](01-foundation.md#fnd-14), [FND-15](01-foundation.md#fnd-15) | [FE-09](06-frontend-first.md#fe-09) |
| US-OPS02 | [AC-OPS02](../06-acceptance-criteria.md) | [WF-02](02-workflows.md#wf-02), [WF-03](02-workflows.md#wf-03) | [FE-10](06-frontend-first.md#fe-10) |
| US-OPS03 | [AC-OPS03](../06-acceptance-criteria.md) | [AI-04](03-ai-automation.md#ai-04) | [FE-05](06-frontend-first.md#fe-05), [FE-15](06-frontend-first.md#fe-15) |
| US-OPS04 | [AC-OPS04](../06-acceptance-criteria.md) | [WF-01](02-workflows.md#wf-01), [AI-05](03-ai-automation.md#ai-05) | [FE-08](06-frontend-first.md#fe-08) |
| US-OPS05 | [AC-OPS05](../06-acceptance-criteria.md) | [WF-04](02-workflows.md#wf-04), [WF-08](02-workflows.md#wf-08), [AI-06](03-ai-automation.md#ai-06) | [FE-08](06-frontend-first.md#fe-08) |
| US-OPS06 | [AC-OPS06](../06-acceptance-criteria.md) | [FND-16](01-foundation.md#fnd-16) | [FE-08](06-frontend-first.md#fe-08) |
| US-OPS07 | [AC-OPS07](../06-acceptance-criteria.md) | [WF-09](02-workflows.md#wf-09), [AI-07](03-ai-automation.md#ai-07) | [FE-09](06-frontend-first.md#fe-09), [FE-10](06-frontend-first.md#fe-10) |
| US-OPS08 | [AC-OPS08](../06-acceptance-criteria.md) | [WF-06](02-workflows.md#wf-06), [WF-08](02-workflows.md#wf-08), [AI-07](03-ai-automation.md#ai-07) | [FE-11](06-frontend-first.md#fe-11) |
| US-OPS09 | [AC-OPS09](../06-acceptance-criteria.md) | [WF-07](02-workflows.md#wf-07), [AI-07](03-ai-automation.md#ai-07) | [FE-10](06-frontend-first.md#fe-10), [FE-08](06-frontend-first.md#fe-08) |
| US-OPS10 | [AC-OPS10](../06-acceptance-criteria.md) | [WF-05](02-workflows.md#wf-05), [WF-08](02-workflows.md#wf-08), [WF-10](02-workflows.md#wf-10) | [FE-10](06-frontend-first.md#fe-10) |
| US-OPS11 | [AC-OPS11](../06-acceptance-criteria.md) | [AI-01](03-ai-automation.md#ai-01), [OPS-06](04-operations-assistant.md#ops-06), [OPS-07](04-operations-assistant.md#ops-07) | [FE-13](06-frontend-first.md#fe-13) |
| US-OPS12 | [AC-OPS12](../06-acceptance-criteria.md) | [OPS-18](04-operations-assistant.md#ops-18) | [FE-16](06-frontend-first.md#fe-16) |

## 3. Assistant stories

| Story | Acceptance source | Original delivery tasks | Frontend DEMO tasks |
| --- | --- | --- | --- |
| US-AI01 | [AC-AI01](../ai/use-cases-stories-and-acceptance.md) | [OPS-09](04-operations-assistant.md#ops-09) | [FE-14](06-frontend-first.md#fe-14) |
| US-AI02 | [AC-AI02](../ai/use-cases-stories-and-acceptance.md) | [OPS-09](04-operations-assistant.md#ops-09) | [FE-14](06-frontend-first.md#fe-14) |
| US-AI03 | [AC-AI03](../ai/use-cases-stories-and-acceptance.md) | [OPS-11](04-operations-assistant.md#ops-11), [OPS-12](04-operations-assistant.md#ops-12), [OPS-13](04-operations-assistant.md#ops-13), [OPS-14](04-operations-assistant.md#ops-14), [OPS-15](04-operations-assistant.md#ops-15) | [FE-15](06-frontend-first.md#fe-15) |
| US-AI04 | [AC-AI04](../ai/use-cases-stories-and-acceptance.md) | [OPS-10](04-operations-assistant.md#ops-10) | [FE-14](06-frontend-first.md#fe-14) |
| US-AI05 | [AC-AI05](../ai/use-cases-stories-and-acceptance.md) | [OPS-10](04-operations-assistant.md#ops-10) | [FE-14](06-frontend-first.md#fe-14) |
| US-AI06 | [AC-AI06](../ai/use-cases-stories-and-acceptance.md) | [OPS-19](04-operations-assistant.md#ops-19) | [FE-14](06-frontend-first.md#fe-14), [FE-16](06-frontend-first.md#fe-16) |
| US-AI07 | [AC-AI07](../ai/use-cases-stories-and-acceptance.md) | [OPS-08](04-operations-assistant.md#ops-08) | [FE-14](06-frontend-first.md#fe-14) |
| US-AI08 | [AC-AI08](../ai/use-cases-stories-and-acceptance.md) | [OPS-08](04-operations-assistant.md#ops-08) | [FE-14](06-frontend-first.md#fe-14) |

US-AI03 spans ticket creation, replies/lifecycle, specialist progress, authorized management forms and workspace composition. The explicit intent registry must enumerate supported existing use cases and documented handoffs; a generic model-driven endpoint dispatcher does not meet D-42.

## 4. Cross-cutting and milestone verification

| Source | Delivery / verification owners |
| --- | --- |
| AC-X01–10; NFR01–17 | Applicable slice from FND-02 onward; QA-01/02/03/05 integration checks |
| NFR18–26 | WF/AI/OPS affected slices; QA-02/03/04/05 |
| TC-SLA01–12 | FND-12/13 foundation; OPS-03 all clocks, OPS-04 delivery; QA-02/04 regression |
| TC-AI01–18 | OPS-08–15/19 relevant cases; QA-02/03/04 integrated checks |
| TC-OPS01–12 | WF-01–10 deterministic cases; AI-04–08 model cases; QA-02/04/05 full integration |
| A1–A4 | WF-01/04/09, AI-04–08; QA-04 evidence |
| A5–A7 | WF-05–10, AI-06–08, FND-18, OPS-18; QA-02/04 |
| A8 | FND-09–13/17, OPS-01–05; QA-02/04 |
| A9 | AI-01, OPS-06–10/15; QA-02/04 |
| A10 | WF-05/07/08, AI-03/08, OPS-07/08; QA-02/04 |
| A11 | AI-08 real-model minimum; QA-04 complete scenarios with shared D-39 budget |
| A12 | OPS-16–19; QA-04 reconciliation |
| A13 | FND-01/02; QA-01/05 clean setup, release and isolated restore |

No acceptance gate is satisfied by this mapping. Keep failed/not-run results visible. Actual checks must retain expected/actual result, environment/build, fixture/source provenance, redacted logs and outstanding defects per the roadmap.

## 5. Frontend-first completion boundaries

FE-01/02 provide shared foundations and FE-18 verifies the full screen/state inventory. All 67 rows above have a frontend owner; UI criteria are tested with synthetic responses. INT-01 covers identity/admin, INT-02 tickets/files/SLA, INT-03 work/automation, INT-04 assets, INT-05 knowledge/assistant, and INT-06 facts/notifications/audit. QA-01–05 still require real integrated evidence for A1?A13. No backend security, concurrency, live AI or durable persistence gate is satisfied by a mock frontend.

## 6. Complete executable task mapping

All 88 packages are decomposed into 230 tasks on the [execution board](workflow/execution-board.md). The [package-to-task criterion matrix](package-task-coverage.md) maps every one of the 264 numbered package acceptance criteria to leaf evidence and names external integration closure owners. Follow story -> existing package -> selected criterion -> leaf task; all 67 stories remain covered.

Frontend has 63 tasks across A1-A4. US01 maps to FE-03.01/02, US02 to FE-03.05, US03 to FE-03.03 and US04 to FE-03.04; all other rows retain their FE package IDs and now have linked children in their package cards. FE-18.03 is the Phase A exit. No real-service, concurrency, provider or production gate is passed by this planning matrix.
