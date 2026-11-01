---
id: itoh-docs-design-visual-refresh
title: "Visual direction v0.8"
type: reference
domain: design
module: visual
tags: [design, visual, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Explain visual direction, deliverables, and coverage limits."
---

# Visual direction v0.8

**Target design, no frontend/animation/AI implementation.** Apple Design Skill refresh on confirmed IT Operations Hub workflows, retaining Vietnamese UI/light MVP/stack/four roles.

## Design intent

Help people know **what needs their action, why, and where to continue**. Action-needed cards match responsibility: R replies/accepts, T executes/reports, IT Manager supervises/intervenes/approves, Admin verifies/provisions/configures. AI identity belongs to proposals/sources, not a chatbot covering every screen.

Light blue canvas/floating rounded shell/opaque white cards/soft shadows; pale icon backgrounds/short labels/chevrons. Combine P-047 quick choices with IT business rules/existing 44 icons. No decorative gradients/large KPIs/glass beneath tables or sparkles implying execution. Remove decoration that does not help decisions; reuse 24 px labeled icons.

## Specific changes

| Area | v0.6 design | Business basis |
| --- | --- | --- |
| M dashboard | Exceptions first; current queues/policy outcomes/period analytics separate | Manager supervises rather than assigns every task |
| R/T/A dashboards | Role-specific next steps | Different requester/assignee/Admin scope |
| Tickets | Public conversation primary, named SLA clocks | AI chat not first response; Pending asks requester |
| Tasks/plans | Six DEMO task cards/table/dependencies | Separate lifecycle, human results |
| Workforce | Verified skills/windows/remaining, missing≠free | Feasibility/atomic assignment |
| Coordination/approval | Event→source→proposal→decision→execution | Approved≠Succeeded; stale snapshots cannot execute |
| Policies | Business scopes/actions/limits/exceptions | M/A grants differ from Admin provider availability |
| KB | Published/version/ACL/citation, no default reader publish | Publisher D-40 |
| User admin | Verify ticket→empty-password form→separate result | Admin-only D-29/no ticket secrets |
| Errors/compact | Draft retention/reflow/44 px/focus return | No blind retry/merge/covered fields |

## Deliverables

**37 SVG=34 UI views+3 boards.** Existing designs were refreshed and supporting coverage added for Technician/7 OPS/Admin user/account/asset list-form/reports/notifications/organization-categories/audit/AI availability/task progress/login states/normal workspace. Four roles/36 screen-interaction IDs have samples or boards; some share views, not every state/breakpoint separate.

[Gallery](wireframes/README.md) · [Screens](../07-uiux-specification.md) · [Tokens](design-system.md) · [Content](content-and-states.md) · [Responsive/motion](motion-and-responsive.md) · [Skill review](uiux-review.md).

## Retained illustration and assets

Login reuses [login-it-support.png](illustrations/login-it-support.png), a decorative imagegen asset from earlier work. Image/alpha unchanged, no external sending/raster edits; embedded SVG opens standalone. Reuse 44 SVG icons, not Apple SF Symbols/fonts/macOS windows.

[XMind](../xmind/README.md) embeds current SVG renders, not competing old UI. v0.3 archive is historical; v0.4 lives in Git history, not another active spec.

## Dataset and conclusion limits

All names/numbers synthetic DEMO. Snapshot 31 October 2026, 10:00–10:01 GMT+7. TKT-000124 onboarding:10 devices/10 fictitious employees, T03 remaining 180/deadline 14:00; Minh absent 10–14; Bình11–14=180; Chi 12–14=120. UI adds manual lock→approval; unlocked diagram example is another valid branch. Handover 16:00 differs from task 14:00 and ticket SLA.

TKT-000121 printer Resolved, 122 Wi-Fi In Progress, 123 user request, 125 Pending are separate fixtures, not one timeline. Dashboard/report counts are illustrations, not seed-query/runtime/model evidence.

No interactive prototype/actual keyboard/screen-reader/usability results. Dark tokens reference only. No added roles/ticket states/AI privileges/integrations/native libraries/application code.

## Combining P-047 with existing IT UI

Read `D:\BuildPhase-T047\P-047\web`: index.html/theme.css/portal.css/liquid-glass.css/background styles. Two references rendered from temporary inert HTML, scripts removed/HTTP-HTTPS-WebSocket blocked; no login/app execution/reference repository changes. Layout source, not IT rules.

| Source | Retained pattern | IT adaptation |
| --- | --- | --- |
| Prior UI | Scoped sidebar/public-internal/tasks-plans/approval diff/AI sources | Shorter screen explanations; details in disclosures/spec |
| P-047 quick choices | Icon/label/subline/open direction | Device/network/account opens ticket forms, not automatic creation/provisioning |
| P-047 layout | Light canvas/rounded shell/task grouping | Desktop sidebar for larger IT scope, no resident tabs copied |
| Apple Design Skill | Hierarchy/meaningful icons/comfortable controls/agency | Semantic web/light MVP, no native Apple imitation |

18 main views rearranged; all 37 assets use v0.6 visual language. R assistant+6 shortcuts+2 action requests; M exception/diff/shortcuts; T execution/start guards; A account requests/settings. SLA/audit/ticket tables/DAG retain suitable notation rather than universal cards.

Approval retains lock/current-proposed users/skills/180 minute window/14:00 task-16:00 handover/SLA unchanged/10:01 snapshot/rechecks. Excluded candidates/history/policy expand. Fewer words never justify removing essential data or icon/color-only decisions.

A generic KPI-only dashboard could fit any product. Deadlines/dependencies/public audience/decision≠execution make this IT-specific. Remove repetitive copy when states/CTAs explain it; retain invariants in specs.

Coverage remains 36 IA patterns. v0.6 did not change architecture/API/data/Product-IA for aesthetics; D-42 v0.8 updates labels/contracts for new requirements while preserving mind-map format. No frontend-completion claim.

## Shared AI Workspace — v0.8

D-42 replaces two AI entries with one workspace: chat/forms left/scoped automatic activity right. P-047 inspires task→form→review→confirmation, beyond links/recommendations. Reuse v0.6 cards/icons, no model call to draw stored feeds.

UI11 R Pending draft/public progress; UI12 T contextual composer; UI23 M exception/chat/run/review; UI24 same-context decision. UI37 normal state below. Shared shell; 37 SVG/36 patterns, designs only.

## Login and buttons — v0.8

Keep palette/existing IT illustration, no new image. Clear introduction/form, 52 px fields and a 52 px primary button with 16 px text/separate help. Board 36 focus/validation/visibility/Caps Lock/loading/auth/network; main login does not show all states at once.

Center full icon-label action groups across designs, retain content/card/menu/disclosure left alignment. 37 SVG=34 UI+3 boards; 36 IA unchanged. No additional auth features.

## Recognizing assistant capabilities

Prominent avatar/name/action tagline/4 role suggestions within AI Workspace. UI11/12/23/37 capability header above chat/preview with explicit composer examples; activity right. No new features/screens; retain login/alignment.

## Immediately above chat

Identity/four suggestions directly above one continuous chat. UI23 full proposal restored outside chat; October report conversation independent of T03 run. UI11/12 other work retained. No-proposal region takes no space; assistant does not wait for automation/approval.

## Normal-screen representative

UI37 represents normal workspace with assistant/chat first. UI23 explicitly conditional exception, not permanent replacement fixture. Proposal/approval content remains confirmed design. Independent snapshots; normal is not post-approvalT03.
