---
id: itoh-docs-design-design-system
title: "Design system — v0.8"
type: reference
domain: design
module: components
tags: [design, components, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Define visual foundations, components, and accessibility targets."
---

# Design system — v0.8

**Next.js/React web design, not an installed component library.** Adapt Apple Design Skill accessibility/layout/type/forms/AI principles to semantic HTML/CSS tokens/shadcn-Radix. No simulated macOS chrome/native menu/SF font or out-of-scope dark-mode switch.

## Intent and hierarchy

An easily scanned IT workspace: action cards, labeled icons, ownership, next steps. **Action-needed cards** are the visual signature; contextual banners distinguish reply/work/decision needs without turning every page into KPI dashboards. Shared role-scoped shell, task-specific views.

Regular 1440 px: 244 rail/220 floating sidebar at 12/12; 60 topbar at 260/16 in 80 header; 32 margins/24 gaps/1132 content. Pale blue canvas/opaque white surfaces/subtle borders/shadows; blue primary/purple AI/semantic statuses. Multicolor thick diagram borders are not applied indiscriminately to forms/tables.

## Semantic color tokens

| Token | Light MVP | Dark reference | Responsibility |
| --- | --- | --- | --- |
| canvas | #EDF5FC | #141D2B | Workspace background |
| surface | #FFFFFF | #1D293A | Content/tables/dialogs |
| content | #182538 | #E6EDF7 | Main text |
| secondary | #566579 | #B0BCD0 | Readable supporting text |
| accent | #2155CD | #9CB7FF | Primary actions/focus/selection |
| ai | #6841C5 | #CBB5FF | AI identity/sources/drafts, not success |

Success #18734B/#EDF8F1; warning #875500/#FFF6E5; danger #B42335/#FFF0F1. Decorative border #D7E4F1 is not sole input identification; control border #718096. Dark tokens are references for possible extensions, **not MVP expansion or an implemented dark UI**. No glass/blur beneath important data; opaque surfaces are primary under reduced transparency.

| Measured hex pair | Foreground / background | WCAG ratio |
| --- | --- | --- |
| Body on canvas | `#182538` / `#EDF5FC` | 14.01:1 |
| Secondary on canvas | `#566579` / `#EDF5FC` | 5.4:1 |
| Body | `#182538` / `#FFFFFF` | 15.43:1 |
| Secondary | `#566579` / `#FFFFFF` | 5.94:1 |
| Primary text | `#FFFFFF` / `#2155CD` | 6.47:1 |
| AI label | `#6841C5` / `#F3EFFF` | 5.9:1 |
| Success | `#18734B` / `#EDF8F1` | 5.37:1 |
| Warning | `#875500` / `#FFF6E5` | 5.88:1 |
| Danger | `#B42335` / `#FFF0F1` | 5.87:1 |
| Input boundary | `#718096` / `#FFFFFF` | 4.02:1 |
| Focus | `#2155CD` / `#FFFFFF` | 6.47:1 |
| Dark body reference | `#E6EDF7` / `#141D2B` | 14.37:1 |
| Dark secondary reference | `#B0BCD0` / `#141D2B` | 8.83:1 |
| Dark accent reference | `#9CB7FF` / `#1D293A` | 7.43:1 |


Values use sRGB relative luminance, not JPEG sampling. Token-pair checks do not certify application WCAG/HIG. Body≥4.5:1; applicable controls/focus≥3:1. Disabled colors alone do not explain ineligibility.

## Typography and spacing

System stack `Segoe UI, system-ui, Arial, sans-serif`, Vietnamese support, no downloaded SVG fonts. One UI family, tabular numbers. Page 30/38 weight 700; section 21/29 weight 650; body 16/24; table 14.5/21 weight 400–600; essential badge 13.5/20 weight 600.12–13 only secondary metadata, not deadlines/rejections/actions. Icon specimen filenames 10.5 are asset annotations, not product text sizing.

Spacing 4/8/12/16/24/32. Radii input 10/button 12/panel 16–20/sidebar 24; 1 px borders/light 0-5-10 shadow at 5% ink. Quick-card icon 24 on44 background/title 18-650/subline 14, chevron means opens, not executed. Inputs 48/CTA44, persistent labels. Focus 2+2 offset. Allow long Vietnamese/errors/200% zoom with auto-growing height, not screenshot-fixed CSS.

## Component contracts

| Component | v0.6 decision |
| --- | --- |
| Shell | One H1, authorized nav≤2 levels, pale selection/dark text-icon, named menus |
| Primary/secondary | One task-primary; same-size choices/different emphasis; cancel/reject not false primary |
| Next-step banner | Action/actor/conditions/textual status; no precommit success |
| Table/list | Clear headings, code/title priority, 72–100 px content-dependent rows, named sort/paging/keyboard links |
| Filters | Labels/applied state/clear, scope before count, no out-of-scope bulk |
| Forms | Labels/help/field errors/more than color; preserve input, no prefilled passwords |
| Badges | Separate Ticket/Task/priority/SLA/approval/execution; not button-shaped status |
| Dialog | Short task, one modal, title/Cancel/focus/trap/return, no nested modals |
| AI panel | User-opened, desktop modeless/compact dedicated region, preserve drafts/focus return |
| Approval diff | Current/proposed/reason/impact/data timestamp; approval≠assigned; conflicts re-evaluate |
| Citation | Name/version/audience/current-access link, no invented certainty percentages |
| Empty/error/loading | Per-region states/manual fallback; no blind timeout mutation retry |
| Notification | Recipient/current access; generic on revocation, no sensitive retained preview |

## Tasks, SLA, permissions

Ticket intake differs from Task execution. Task To Do/Ready/In Progress/Blocked/Done/Cancelled; Vietnamese glossary labels retain API enums. Done requires result/remaining 0, no automatic ticket Resolved/Closed. Pending needs a requester-facing public question, not waiting on internal Admin. Only eligible public IT comments satisfy first response, not AI/drafts/notes/acceptance.

No IT Team Lead. M policy/exceptions, not user admin. T no colleague assignments/user provisioning. R no workforce plans/approvals/notes, including hidden payloads. Backend enforces.

## Accessibility and validation

WCAG2.2 AA target. 44 px is a comfortable design choice, not mandatory AA threshold. Named controls/decorative aria-hidden icons; actual HTML heading/table/dialog/error/live-region checks later. No gesture/drag-only task transitions. Sticky composer/keyboard must not obscure focus. Complete keyboard/list/diff access.

[Motion/responsive](motion-and-responsive.md) specifies 200% zoom/320 px/increased contrast/reduced motion-transparency; screenshots prove no reflow/keyboard/screen-reader behavior. [Review/HIG sources](uiux-review.md) separate findings/measurements/tradeoffs. [37 SVG set](wireframes/README.md) is static.

## Interactive cards and information density v0.6

Borrow P-047 service-action/procedure-picker structure, reuse 44 project icons/colors; no imported code/mascot/assets. Pale blue/purple groups shortcuts; success/warning retain labels/semantics.

- One card: icon/short task/one supporting line/clear destination. Navigation is one named anchor; multi-action cards use headings/separate links, never nested buttons.
- Target 2–6 word task titles, one regular subline wrapping on compact; no limits on user-entered ticket/task titles or tiny text to fit prose.
- Consistent 24 px icons/strokes. Status text; icon-only controls named with optional tooltip/44 px target; no additional 44 icon set.
- Disclosure button 44 px+, aria-expanded/controls, logical reading order; no essential decision data hidden in tooltips. Expansion changes no domain state.
- Regular 3 columns for task/admin/KB; Requester assistant+2 column shortcuts. Medium 2/compact 1, task-ordered DOM. SLA/audit/tickets keep comparison tables/reflow.
- Task card/table views share scope/filter/sort/count; toggles are not state changes/success.
- Sources/versions/permissions/formulas/history/technical details may expand. Locks/dependencies/recipient/deadlines/exception reasons/missing data/public audience/unsent-unexecuted state stay visible when acting.

Canvas/white tokens reflect P-047's light feel while content remains opaque. No animated mesh/data blur/large operational heroes. Shadows alone do not identify interaction.

## Shared AI Workspace — v0.8

One nav item replaces separate assistant/coordinator entries without merging rights. Regular chat/cards+activity side by side; compact same-page tabs. User-requested cards show form/preview/confirm/result; policy cards show timelines/exceptions, no success flash on model response. Trusted native forms/composers, never model HTML/code. Security forms keep secret inputs outside AI composer. v0.6 color/type/radii retained.

## Button alignment — v0.8

107 text/icon-text buttons in 37 SVGs center the full content group by actual bounds horizontally/vertically, 8 px icon gap. Menus/disclosures/cards/tables stay meaningfully left aligned. Future flex centering uses real text sizes, not padding-left/fixed coordinates. Loading preserves dimensions/spinner-label grouping; disabled states explain reasons. Standard 44/login 52/icon 44 targets. Project web convention, not a claim Apple mandates universal centered buttons.

## Workspace identity

Assistant block:24 icon/purple 48 background/25 px700 heading/four 48 px icon-label buttons centered as groups. Assistant messages retain name/sources; user bubbles identify self. Composer names its recipient/examples rather than anonymous dashboard input. Background region uses clock/blue/distinct title. Color/text/position together distinguish capabilities. Existing unavailable/error contracts remain.

## Assistant/chat framing

Capability and chat frames share 744 px regular artifact width, 12 px gap. One continuous chat surface 24 padding, subtle transcript/composer divider, named speakers. Activity separate; no background exception card between assistant header/chat. Compact capability→chat→activity via tabs, not screenshot scaling.

## Coordination stepper

Continuous visual axis:32 px numbered markers/centered connectors/next arrows; titles/states nearby. Current state explicitly labeled; future markers keep contrast. Solid traversed/dashed future, no animation-as-action evidence. Header x/y reflects applicable branch. Ordered content, not arbitrary-state buttons.

## Conditional exception region

Exceptions are not mandatory workspace layout. Normal UI37 starts capability/chat; insert only authorized actionable exceptions, reserving no empty height. Normal activity may have 4 automatic steps; UI23's5 approval steps are a different branch.
