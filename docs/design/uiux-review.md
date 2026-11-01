---
id: itoh-uiux-apple-design-review
title: "Design review — current IT Operations Hub UI/UX"
type: report
domain: design
module: uiux
tags: [design, uiux, apple-design, review]
priority: 1
status: self-reviewed
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: derived
purpose: "Review current UI against workflows and skill principles with evidence and limits."
---

# Design review — current UI/UX

## Summary

Next.js/React web design, no application. Users should recognize the assistant, choose supported work, and confirm actions, alongside independent background coordination/explicit exceptions. Current 37 SVG=34 UI+3 boards, 107 action buttons; 36 IA patterns include pages/dialogs/context, not 36 separate pages.

Self-assessment: Good at static-artifact level, not independent approval/Apple-WCAG certification. Superseded layouts are not current guidance. See [spec](../07-uiux-specification.md), [gallery](wireframes/README.md), [review report](../review-report.md).

## Improvements

Issues below have design fixes; runtime gates remain unrun.

- **High — What:** assistant identity unclear, examples focused only on replacement. **Why:** layout.md › Visual hierarchy: “Order content by relative importance.” **Fix:** named avatar/4 role shortcuts/explicit composer/examples; UI23 report independent from pending T03.
- **High — What:** shared chat/automation may confuse triggers/authority/results. **Why:** generative-ai.md › Best practices: “Keep people in control.” **Fix:** user actor separate from AI_COORDINATOR, form-preview-confirm-result, full proposal outside chat, decision≠execution, no run prerequisite.
- **Medium — What:** disconnected status items hide sequence. **Why:** task-specific design judgment. **Fix:** UI23 five numbered steps/four arrows/current 3/5 future dashed/not-run, only locked branch; no fake approval for automatic policy branch.
- **Medium — What:** button text/icons left-biased. **Why:** buttons.md › Content: “Ensure that each button clearly communicates its purpose.” **Fix:** entire group centered both axes/8 px gap, menus/cards/disclosures left. Project web convention, not universal Apple control requirement.
- **High — What:** login lacked standard states. **Why:** entering-data.md › Best practices: “Never prepopulate a password field.” **Fix:** clear 52 px fields/CTA/empty password/44 px show/hide control/focus-CapsLock-validation-loading-auth-network, board 36. D-16/19, no unapproved signup/email reset/SSO/remember.
- **Medium — What:** icons may require guessing. **Why:** icons.md › Best practices: “Create a recognizable, highly simplified design.” accessibility.md › Vision: “Convey information with more than color alone.” **Fix:**44 consistent labeled icons/textual states; purple assistant/clock coordination not sole cues.

## Craft notes

Canvas #EDF5FC/opaque white/text #182538/action #2155CD/AI #6841C5. Identity follows IT work/responsibility, not macOS imitation/effects-as-success. Capabilities immediately above chat; full proposal separate, not sole conversational purpose. P-047 informs choose→form→review→confirm without code/mascot/resident-business copying.

## What works

Four roles/no Team Lead; Ticket≠Task/manual-lock respect/manual+policy paths. R lacks runs/candidates/notes; T cannot assign colleagues; M cannot administer users; Admin cannot read all chats. Secure D-29 user/role/secret forms, no passwords to model.

Hex ratios: body/white 15.43, secondary/white 5.94, body/canvas 14.01, secondary/canvas 5.40, primary 6.47, input boundary 4.02. [Token source](design-system.md); not application-wide accessibility certification.

## Platform notes

Web semantic HTML/CSS/trusted forms, no px-as-pt/native chrome/menu assumptions. Light MVP, dark references only. Regular capability→chat-form-composer/activity beside; compact scoped tabs/draft-focus/reflow 320 px/200% zoom are future gates.

SVG/render checks cover layout/text/alignment only. Keyboard/ARIA/NVDA/VoiceOver/live auth/animation/usability/providers/HTTP/DB untested. Future stepper ordered content/aria-current; colors/motion replace neither text nor domain states.

## References and evidence

Apple Design Skill read at `D:\apple-design-skill\apple-design-skill\SKILL.md` and companion AGENTS.md. 12 references: accessibility/layout/typography/color/designing-for-macos/cross-platform/lists-and-tables/entering-data/generative-ai/buttons/modality/icons. Local snapshot, not a latest-guidelines claim or skill-repository edit.

[Layout](https://developer.apple.com/design/human-interface-guidelines/layout), [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility), [Typography](https://developer.apple.com/design/human-interface-guidelines/typography), [Color](https://developer.apple.com/design/human-interface-guidelines/color), [Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons), [Entering data](https://developer.apple.com/design/human-interface-guidelines/entering-data), [Generative AI](https://developer.apple.com/design/human-interface-guidelines/generative-ai), [Icons](https://developer.apple.com/design/human-interface-guidelines/icons). Quotes identify the local files/headings read.

P-047 layout source: `D:\BuildPhase-T047\P-047\web` index/theme/portal/liquid-glass, static script-free/network-blocked renders. [Current report](../review-report.md) records checks; self-review, not user research.
