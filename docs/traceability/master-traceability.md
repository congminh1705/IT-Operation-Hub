---
id: itoh-docs-traceability-master-traceability
title: "Master traceability matrix"
type: reference
domain: quality
module: traceability
tags: [quality, traceability, reference]
priority: 2
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: derived
purpose: "Link features, UCs, stories, AC, screens, BR, contracts, figures, and planned milestones."
---

# Master traceability matrix

Every row is **DESIGNED / NOT IMPLEMENTED / NOT TESTED**. AC is not a passed test. F=capability, UC=use case, US=story, SCR=screen, MET=metric formula.

## Story-level traceability

| US | F | UC | AC | Main SCR | Milestone | Rule source |
| --- | --- | --- | --- | --- | --- | --- |
| US01 | F01 | UC01 | AC01 | SCR01 | M1 | BR-01 |
| US02 | F01 | UC02 | AC02 | Shell→SCR01 | M1 | BR-01 |
| US03 | F01 | UC03 | AC03 | SCR02 | M1 | BR-01 |
| US04 | F01 | UC04 | AC04 | SCR03 | M1 | BR-01 |
| US05 | F02 | UC05 | AC05 | SCR60 | M1 | BR-01 |
| US06 | F02 | UC05 | AC06 | SCR60 | M1 | BR-01 |
| US07 | F02 | UC05 | AC07 | SCR60 | M1 | BR-01, 05 |
| US08 | F02 | UC06 | AC08 | SCR61 | M1 | BR-01 |
| US09 | F03 | UC07 | AC09 | SCR62 | M1 | BR-02, 05 |
| US10 | F03 | UC07 | AC10 | SCR62 | M1 | BR-01, 05 |
| US11 | F03 | UC08 | AC11 | SCR63 | M1 | BR-02 |
| US12 | F04 | UC09 | AC12 | SCR64 | M1/M4 | BR-09, 12 |
| US13 | F05 | UC10 | AC13 | SCR21 | M1 foundation; M2 completion | BR-02, 03, 07, 09 |
| US14 | F06 | UC11 | AC14 | SCR20 | M1 foundation; M2 completion | Permissions; NFR10 |
| US15 | F06 | UC12 | AC15 | SCR22 | M1 foundation; M2 completion | Permissions; BR-06 |
| US16 | F07 | UC13 | AC16 | SCR23 | M1 foundation; M2 completion | BR-05 |
| US17 | F07 | UC13 | AC17 | SCR20/23 | M1 foundation; M2 completion | BR-05 |
| US18 | F07 | UC14 | AC18 | SCR24 | M1 foundation; M2 completion | BR-04, 08 |
| US19 | F07 | UC14 | AC19 | SCR24 | M1 foundation; M2 completion | BR-04, 05 |
| US20 | F08 | UC15 | AC20 | SCR22 | M1 foundation; M2 completion | BR-04, 06, 08 |
| US21 | F08 | UC16 | AC21 | SCR22 | M1 foundation; M2 completion | BR-06, 08 |
| US22 | F09 | UC17 | AC22 | SCR21/22 | M4 | BR-07 |
| US23 | F09 | UC17 | AC23 | SCR22 | M4 | BR-07; Permissions |
| US24 | F10 | UC18 | AC24 | SCR24 | M1 foundation; M2 completion | BR-04, 06, 09 |
| US25 | F10 | UC19 | AC25 | SCR24 | M1 foundation; M2 completion | BR-04, 06, 09 |
| US26 | F10 | UC20 | AC26 | SCR24 | M1 foundation; M2 completion | BR-04 |
| US27 | F10 | UC21 | AC27 | SCR24 | M1 foundation; M2 completion | BR-04, 09; D-12 |
| US28 | F10 | UC21 | AC28 | SCR24 | M1 foundation; M2 completion | BR-04, 09; D-12 |
| US29 | F10 | UC22 | AC29 | SCR24 | M1 foundation; M2 completion | BR-04, 08, 09 |
| US30 | F11 | UC23 | AC30 | SCR25 | M1 foundation; M2 completion | BR-03, 09 |
| US31 | F11 | UC12 | AC31 | SCR22 | M1 foundation; M2 completion | BR-12 |
| US32 | F12 | UC24 | AC32 | SCR22 | M4 | BR-08–10; TC-SLA01–12 |
| US33 | F12 | UC25 | AC33 | Worker→SCR50/22 | M4 | BR-10; TC-SLA06–09 |
| US34 | F13 | UC26 | AC34 | SCR50 | M4 | BR-12 |
| US35 | F14 | UC27 | AC35 | SCR31 | M4 | BR-11 |
| US36 | F14 | UC27 | AC36 | SCR30 | M4 | BR-11; Permissions |
| US37 | F14 | UC28 | AC37 | SCR32 | M4 | BR-11; Permissions |
| US38 | F15 | UC29 | AC38 | SCR33 | M4 | BR-11 |
| US39 | F15 | UC30 | AC39 | SCR33 | M4 | BR-11 |
| US40 | F15 | UC31 | AC40 | SCR33 | M4 | BR-11, 12 |
| US41 | F16 | UC32 | AC41 | SCR10 | M4 | MET11–12 |
| US42 | F16 | UC32 | AC42 | SCR11 | M4 | MET13–14; BR-10 |
| US43 | F16 | UC32 | AC43 | SCR12/40 | M4 | MET01–05 |
| US44 | F17 | UC32 | AC44 | SCR40 | M4 | MET06–08 |
| US45 | F17 | UC32 | AC45 | SCR12/40 | M4 | MET09 |
| US46 | F17 | UC32 | AC46 | SCR12/30 | M4 | MET10 |
| US47 | F18 | UC33 | AC47 | SCR65 | Throughout | BR-12 |

F19/AC-X01–10 apply throughout; do not postpone mandatory per-feature controls into one later security story.

## Coverage of the original 12 acceptance criteria

| Brief # | Requirement | Trace | Future evidence |
| --- | --- | --- | --- |
| 1 | Employee creates/tracks/replies | US13–15, 20, 41; AC13–15, 20 | Requester E2 E |
| 2 | No others' tickets/internal API access | AC15, 21, 23; AC-X01; Permissions | Negative ticket/comment/file/count APIs |
| 3 | Team-scoped T; Manager assignment/transfer | US16–19; AC10, 16–19 | Membership/scope/assignment integration |
| 4 | Backend rejects invalid states | BR-04; AC18–29 | State matrix/direct API bypass |
| 5 | History/solutions | US25, 31; AC25, 31 | Read persisted events/solutions after restart |
| 6 | SLA Pending/priority/reopen | US30, 32; TC-SLA01–12 | Fixed-clock tests |
| 7 | Deduplicated worker alerts | US33; AC33; TC-SLA07 | Repeated/concurrent workers |
| 8 | Correct asset issue/return history | US37–40; AC37–40 | Transactional/concurrent assignments |
| 9 | Real/scoped dashboards | US41–46; MET01–15 | Source reconciliation/negative access |
| 10 | Durable data | NFR04; AC-X08 | App/DB/storage restart |
| 11 | File type/size/rights | US22–23; AC22–23 | Boundary/type/access tests |
| 12 | Automated core tests/critical fixes | All AC/M5 | Actual reports, not this PLANNED table |

## Authoritative sources

[Features](../02-features.md) · [Use cases](../03-use-cases.md) · [Stories](../08-invest-requirements.md) · [AC](../06-acceptance-criteria.md) · [Screens](../04-information-architecture.md) · [Rules](../requirements/business-rules.md) · [Permissions](../requirements/permissions-matrix.md) · [Metrics](../requirements/metrics-catalog.md).

## Assistant traceability

n=01–08 maps F-AI n/UC-AI n/US-AI n/AC-AI n in the [assistant catalog](../ai/use-cases-stories-and-acceptance.md). AI01/02/04/06/07→SCR-AI01; AI03→SCR-AI02 confirmation or SCR21; AI05→SCR-AI02→SCR22; AI08→SCR-AI03. M4/M5 gates/TC-AI01–18. AI03 performs existing UCs through confirmed cards/forms; tickets retain draft/confirm, replies reuse workspace/original composer. D-42 preserves core IDs/rights.

## Coordination traceability — design only

| US / F / AC | Use case | Screen | Planned milestone | Rules / gate |
| --- | --- | --- | --- | --- |
| US-OPS01 / F-OPS01 / AC-OPS01 | UC-OPS01 | SCR-OPS03 | M1 | BR-16, A3 |
| US-OPS02 / F-OPS02 / AC-OPS02 | UC-OPS02 | SCR-OPS06 | M2 | BR-17/21, A1/A7 |
| US-OPS03 / F-OPS03 / AC-OPS03 | UC-OPS03 | SCR-AI01/21/22 | M3 | BR-20, A1/A10 |
| US-OPS04 / F-OPS04 / AC-OPS04 | UC-OPS04 | SCR-OPS02 | M2–M3 | BR-14/15, A1/A2 |
| US-OPS05 / F-OPS05 / AC-OPS05 | UC-OPS05 | SCR-OPS01/04 | M2–M3 | BR-16/17, A1/A3/A5 |
| US-OPS06 / F-OPS06 / AC-OPS06 | UC-OPS06 | SCR-OPS01/02 | M1–M2 | BR-14/15, A2/A8 |
| US-OPS07 / F-OPS07 / AC-OPS07 | UC-OPS07 | SCR-OPS03/04 | M2–M3 | BR-16–19, A4 |
| US-OPS08 / F-OPS08 / AC-OPS08 | UC-OPS08 | SCR-OPS05 | M2–M3 | BR-18, A4/A6 |
| US-OPS09 / F-OPS09 / AC-OPS09 | UC-OPS02/07 | SCR-OPS02/06 | M2 | BR-17/18, A6/A10 |
| US-OPS10 / F-OPS10 / AC-OPS10 | UC-OPS09 | SCR-OPS04 | M2–M3 | BR-19/22, A5/A7/A10 |
| US-OPS11 / F-OPS11 / AC-OPS11 | UC-OPS10 | SCR-OPS07/AI01 | M3 minimum, M4 complete | BR-21, A9/A10 |
| US-OPS12 / F-OPS12 / AC-OPS12 | UC-OPS09 | SCR12/40/OPS04 | M4 | BR-22/MET16–22, A7/A12 |

A1–A13/TC-OPS01–12 are defined in the [AC catalog](../06-acceptance-criteria.md), not duplicated as competing criteria. APIs/ERDs support UCs but are not implemented. All rows DESIGNED/NOT IMPLEMENTED/NOT TESTED.

## Contracts and architecture figures

[API01–19](../technical/api-design.md) link groups to UC/BR; [EVT01–17](../technical/api-design.md) define producers/consumers/retry handling. Logical contracts, not implemented endpoints.

| Need / rule | Contract / data | Figure | Future evidence |
| --- | --- | --- | --- |
| Four roles/scope/no Team Lead | API01/02/17; User/TeamMembership/Session | FIG-CTX01, FIG-UC00–05 | Role/IDOR/CSRF/revoke negatives; no AI/Admin impersonation |
| Ticket intake/Task execution | API03/05/06/13; Ticket/PlanVersion/Task | FIG-FLOW01/02/03/04, FIG-DAG01, FIG-ST01/03, FIG-ERD05 | Domain states/versions; Done does not close tickets |
| Policy/feasible assignment | API05–11; EVT03/04/08–15; PolicyGrant/WorkAllocation | FIG-CNT01, FIG-SEQ01/02, FIG-ST02 | Two workers/capacity/stale/revoke/manual locks |
| Model outside transaction | API10/12/13; Run/Action/AIUsage | FIG-SEQ01 | No held transactions/model timeout partial effects |
| KB/citations/ACL | API12/14; EVT16/17; KnowledgeVersion/ACL/Chunk | FIG-ERD09/10, FIG-CNT01 | Openable sources/revocation before index-cache-provider-render |
| Outbox/recovery/audit | API10/16/18; EVT01–17; DomainEvent/OutboxDelivery/AuditLog | FIG-CNT01, FIG-DEP01 | Crash pre-ack/no duplicate effects/isolated restore evidence |
| SLA/assets | API15/19; EVT11; TicketSLA/SLAViolation/AssetAssignment | FIG-UC02/03, FIG-ST03/04 | SLA tests/atomic issue/scan-delay recovery |

[Figure catalog](../diagrams/README.md) identifies sources. Markdown owns rules; XMind/previews/PNG preserve meaning, not application proof. [Roadmap](../09-design-readiness.md) defines test entry/exit.

## Machine-readable contracts and code structure

| Source | Detailed artifact | Trace / status |
| --- | --- | --- |
| Entities/BR-01–22 | [DBML/ER](../database/README.md) | 52 selected entities, no physical schema/migration |
| API01–19/UC | [OpenAPI](../api/openapi.json), [operations](../api/operations.md) | operationId/role/scope; 96 draft operations |
| Architecture/NFR | [C4](../architecture/c4/README.md) | Reuse C1/C2; C3 API/worker; C4 command collaboration |
| API/modules/ERD | [Folder/file design](../technical/code-structure.md) | Current .gitkeep separate from planned trees, no new source |

## Current UI/UX — screens to flows

37 SVG(34 UI+3 boards) illustrate 36 IA patterns via [crosswalk](../design/wireframes/README.md). No added UC/story/API/role. [Spec§18](../07-uiux-specification.md) maps flows/artifacts/guards; [skill review](../design/uiux-review.md) records token measures/limits.

| Flow | Artifacts | UC / BR |
| --- | --- | --- |
| Requester/acceptance | 04/06/09/16 | UC10/18/20/21; BR-02–04/08 |
| Task execution | 19/20/21/35 | UC-OPS04/05/06; BR-14–16 |
| Absence/coordination/approval | 22/23/24/25 | UC-OPS01/02/07/08/09; BR-16–19 |
| Account request/Admin creation | 17/18/27 | UC05/10/15/19/20; D-29 |
| KB/assistant/settings | 11/12/13/26/34 | UC-AI01–08, UC-OPS10; BR-20/21 |
| Assets/admin/facts | 07/08/28–33 | UC03/04/06–09/26–33; BR-01/11/12 |

Numbers identify gallery assets, not new screen IDs. All application gates PLANNED/NOT RUN.

## Current card interfaces

Same 37 assets/36 IDs. Shortcuts enter existing UCs: R device/network/account→SCR21/tracking→SCR20/KB→OPS07; M work/workforce/policy→OPS01/03/06; A users/organization/SLA/AI→SCR60–64/AI03. Task cards open OPS02, not transitions. AI intent alone does not mutate. [Content/states](../design/content-and-states.md) maps effects; UC/BR/permissions, not icons, grant authority.

## D-42 — One workspace, two triggers

UC-AI03/US-AI03/AC-AI03 extends the interaction channel for existing UCs; still 8 AI UC/US/AC, 51 total UC/67 stories. AI01/02+OPS04 same shell/OPS05 detail; 36 patterns not 36 pages. TC-AI13–18 adds screen/actor/state/concurrency/ACL/quota cases, 18 total AI cases. [AI flow](../10-ai-assistant.md) authoritative; [IA](../04-information-architecture.md)/UI11/12/23/24 represent it. No merged actor/state lifecycles.

## Confirmed UI refinements

| Requirement | Source | Artifact / gate |
| --- | --- | --- |
| One workspace/shared model allowed/separate identity-rights | D-42/AI/IA | UI11/12/23/24/37; UC-AI03/06, OPS09 |
| Assistant supports varied work without runs/approval | AI independence/UC-US-AC-AI03 | UI11 reply/UI12 composer/UI23 report/UI37 normal; TC-AI13/14/17/18, UT-AI07 |
| Assistant/suggestions immediately above chat | Spec§22–23/design system | UI11/12/23/37; recognition/start |
| Full replacement proposal separate from chat purpose | Spec§23/BR-18 | UI23/24; decision≠execution |
| Sequential 3/5 run/no-approval branch | Spec§24/EVT01–17/BR-17–19 | UI23 five steps/four arrows; TC-OPS05/06/08 |
| Manual path/lock respect | AI/policy/permissions/BR-15–18 | UI20/21/24/25/35; AC-OPS05–09 |
| Centered icon-label groups/complete login states | Spec§21/design system | 107 buttons/UI01/board 36; runtime NOT RUN |
| README order/source-XMind consistency | Conventions/gallery | 37 artifacts/36 patterns/77 resources; source-image-heading checks |

Stepper ordinals are not backend enums or replacements for parallel DAGs. Application/UX gates remain PLANNED/NOT RUN.

## Normal / exception variants

UI37→SCR-AI01/02/OPS04, authorized UC-AI01–07/OPS09. UI23 same exceptional workspace/OPS07/08/09; UI24 decision details. Default assistant needs no approval. 37 artifacts/36 IA patterns; TC-AI13/UT-AI07/TC-OPS05/06/08 inherit normal/exception/no-approval cases.
