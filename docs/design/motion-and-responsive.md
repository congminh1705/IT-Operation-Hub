---
id: itoh-docs-design-motion-and-responsive
title: "Motion and responsive design v1.3"
type: reference
domain: design
module: responsive
tags: [design, responsive, reference]
priority: 1
status: design-approved
owner: PO
approval: approved
approved_by: PO
approved_on: 2026-11-12
decision: D-51
updated: 2026-11-12
authority: primary
purpose: "Define responsive layouts, motion, focus, and accessible alternatives."
---
> **Current presentation: v1.3 / D-51, approved by PO.** See [approved format](approved-format.md). All post-login screens use the selected Mac/Teal style; only coordination uses Night City; login stays unchanged. Current sources and renders cover all 47 grouped screens and four dashboards. Earlier measurements below remain historical evidence; application implementation and individual PO visual acceptance remain task-owned.


# Motion and responsive design v1.3

**Current presentation: PO-approved v1.3 (D-51); original D-47 login retained.** [Design index](README.md) · [Approval scope](approval.md). Target business and accessibility behavior remains required; prototype checks do not prove production implementation.


Guidance for future implementation. [Storyboard/source SVG](final/02-tickets.html#ticket-active) is an interactive local specimen; it does not prove production motion or API behavior. Timings are design choices, not WCAG duration requirements.

## Purposeful motion

| Situation | Proposal | Conditions |
| --- | --- | --- |
| Hover/pressed | Color/border 120–160 ms | No resizing/text movement |
| AI panel open/close | 180 ms, ≤8 px slide/light fade | User-opened; no covered send/state controls |
| Confirmation dialog | Fade 120–180 ms | User-triggered, separate focus handling |
| Filter/tab | Regional update, optional≤120 ms fade | Stable shell height/immediate selection |
| Loading | Stable placeholder/text | No fake progress/prolonged shimmer |
| Success/error | Text immediately after result | No animation delay; errors persist nearby |

No parallax/bounce/celebration on operational data screens or forced chat scrolling while reading. The approved decorative login scene is the scoped exception below. State follows business outcomes, not animation completion.

`prefers-reduced-motion: reduce` removes translation/zoom/shimmer, uses static direct updates. Additional design commitment aligned with [SC2.3.3 Animation from Interactions (AAA)](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html); overall target remains WCAG2.2 AA, unverified.

## AI panels, focus, keyboard

Desktop side panels are modeless: opening keeps focus on trigger/announces availability; predictable Tab order. Named close returns focus if it was inside; no focus trap. Missing trigger after navigation→appropriate heading.

Narrow layouts use dedicated AI page/region with back; never shrink tickets until send disappears. Returning retains current-session/authorized drafts, rechecks data before send. No sensitive drafts in URLs/durable browser storage without policy.

Business dialogs retain modal semantics/initial focus/trap/return; modeless rules do not apply. Icon-only controls named/keyboard accessible: [APG button](https://www.w3.org/WAI/ARIA/apg/patterns/button/).

## Layout ranges

Proposed breakpoints need long Vietnamese/browser checks.

| Viewport | Layout | Data/actions |
| --- | --- | --- |
| ≥1100 px | 228 px rail/72 px topbar, two columns where useful | Full tables, details 2/3 content+1/3 context |
| 720–1099 px | Labeled nav drawer, flexible content | Single-column forms/details as needed; filters region; local table scrolling |
| 320–719 px | Single column/short header/drawer/easy CTA | Ticket cards/vertical forms-context/dedicated AI region |

Never hide SLA/state/assignee/Pending question to save space. Cards have named code/title links. Applied filters/scoped totals persist through resize; back preserves filter/page/reading position where feasible.

Wrap long text/device codes safely. Sticky actions only with error/focus/virtual-keyboard clearance, safe areas/end padding. 320 px/zoom avoid page-wide scrolling; genuinely two-dimensional tables may have named local scroll regions with accessible main actions.

## Icons, targets, validation

Visible 20–24 px icons; **44×44 px primary/mobile targets** are project usability choices. [SC2.5.8(AA)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) specifies 24×24 CSS px with exceptions, not mandatory 44. Actual small-control hit areas need implementation checks.

Unrun live-UI reviews:

-320/390/768/1024/1440 px, zoom, long Vietnamese, virtual keyboards.
-Tab/Shift+Tab/Enter/Space/Escape; panel/dialog focus.
-Reduced motion preserves states/results.
-Panel during typing/network errors/access changes/conflicts preserves drafts/privacy.
-Labels/screen-reader messages/contrast/hit targets.

Experience checks do not replace backend authorization/state/SLA tests.

## Task boards, DAGs, approval

Provide keyboard list/table/actions instead of drag-only. No preconfirmation state animation. DAG dependency list avoids mandatory mouse pan/zoom. Mobile tasks/cards/approval diff order current→proposed→impact.

30 s active-tab polling preserves position/focus/forms; concise updates do not jump timelines. No fabricated AI-assigned animation/percentage progress. Reduced motion includes OPS; live keyboard/focus/reading-order checks remain pending.

## Card grids and disclosure v0.6

Regular 3 task/admin/KB columns, Requester assistant+2 shortcut columns; medium 2/compact 1. No screenshot scaling/essential-label ellipsis. Desktop 228 px rail and 72 px topbar; compact scoped drawer.

Hover lightly adjusts borders/shadows without lifting/reflow. Disclosure expands in place; reduced motion updates directly. No reference-project aurora/refraction/loops; opaque data surfaces. 44 targets/2 focus+2 offset. Keyboard card/table toggle preserves position. Targets, not app test results.

## Shared workspace — v1.1

Regular chat/forms+activity; compact Conversation/Activity tabs with scoped counts, no horizontal drag. Tabs retain drafts/context/focus, create no runs/cancel no workers. Contextual action/approval details have back/close/focus return; compact full-width without nested modals. Run updates never steal focus/move active input.

## Login — v1.1

Compact 320 px+ single-column, ≥16 px margins/auto-height; retain a decorative background without making it required for comprehension, with region buttons flowing below the form. 16 px input text/48 px CTA; keyboard does not cover focus/send. No mobile autofocus opening keyboard. Clear focus/Tab/Shift+Tab/Enter/separate show-password behavior.

Loading stable button dimensions; reduced-motion static icon/text retains aria-busy/status. No animation-delayed errors; long errors wrap/reflow. Application reflow/keyboard/zoom not tested.

## Approved login scene motion

Follow the [v1.1 login contract](implementation-scope.md#login-contract): ten staggered circuit tracks, region light/zoom, bounded background-only parallax, pointer light and short click ripples. The form never moves. Pause stops all tracks/packets, frame updates and active ripples; reduced motion renders direct static states. Disable ongoing work on unmount. No scene effect determines authentication or business success.
