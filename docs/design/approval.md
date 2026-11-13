---
title: "Approved frontend baseline"
status: design-approved
owner: PO
approval: approved
approved_on: 2026-11-13
updated: 2026-11-13
version: "1.3"
decision: D-51
authority: primary
---
> **Current visual authority: v1.3 / D-51 (PO, 13 November 2026).** Read [approved format](approved-format.md). Use the Mac/Teal dashboard format on every post-login screen and Night City only inside coordination; preserve the D-47 login. Older Graphite text/figures below are historical presentation references, not the current color/type target. Business layouts and acceptance remain binding.


# Approved frontend baseline

PO approved **v1.3 / D-51** on 13 November 2026 for all screens: Mac/Teal globally, Night City coordination only, original D-47 login preserved. See [current format](approved-format.md) and [adoption register](format-coverage.md). All 47 grouped specimens and four dashboards now have design renders; individual PO review and application acceptance remain separate.

## Approved scope

The [final catalog](final/index.html) covers eight groups / 47 specimens, four role dashboards, six established AI compositions and the final login. Apply the v1.3 Mac/Teal shell and typography throughout, preserving semantic luminous KPI edges and using Night City only inside coordination. Charts retain blue created / striped teal resolved series, explicit labels and accessible details.

The [login](final/login.html) has a solid navy architectural IT-office background, layered floor/shadows, a balanced slate-glass card and a centered yellow action. No broad cyan/violet gradient or generated glossy 3D background. The eye control never gains a filled background on hover/press. Ten brighter staggered circuits, region exploration, bounded parallax, localized zoom/light and click ripples are included in frontend scope; pause and reduced-motion controls stop all ongoing effects. The form stays stationary and usable.

AI Workspace preserves its established arrangement and uses the shared v1.3 Mac/Teal style. Static SVGs are composition references: implement actual responsive components and task-owned behavior, not an image standing in for the app. The optional [spatial specimen](final/dashboard.html?role=manager) is supplementary design material, not authorization for a new 3D business module.

## Source precedence

1. Requirements, permissions, API/data contracts and task business acceptance govern behavior and security.
2. This approval, the [design system](design-system.md) and [implementation scope](implementation-scope.md) govern presentation and the explicitly approved login decoration.
3. The affected final HTML/CSS/JS/SVG is the visual/interaction reference; [coverage](final/coverage.md) maps the screen patterns. README/XMind figures are derived.

Read only the selected task row and named source sections. A visual specimen does not authorize adjacent features. If a genuine contract conflict remains, record it before changing behavior or redesigning the screen.

## Implementation boundary

[FE-03.01](../implementation/tasks/FE-03.01.md) owns the complete approved login UI and decorative scene; FE-02 owns shared primitives/shell; FE-18 verifies frontend acceptance. The [task alignment map](implementation-scope.md#task-map) identifies all 63 FE owners. Integration preserves this frontend while replacing the mock adapter; it does not commission a redesign.

The design's login dialog demonstrates states only. Implement the typed mock gateway and separate DEMO helper under the existing FE tasks; real authentication remains in the service/integration tasks. No model/RAG calls, live room or employee data, new enterprise policies, or WebGL/3D dependency is implied by the background.

## Evidence and regeneration

[Browser verification](../reports/design/final/mac-review-verification.json) concerns the design documents, not implemented application acceptance. [Gallery manifest](gallery-manifest.json) defines the 37 canonical figures. `final/refresh_font_captures.py --skip-login` refreshes current screenshots; `final/sync_xmind.py` synchronizes the current figures and D-51 metadata. Validate the current sources using `python -B tools/design/verify_format.py`.

[Baseline lock](../reports/design/final/baseline-lock.json) records the exact approved design source hashes; [alignment verification](final/implementation-alignment.json) records the documentation audit. Refresh the lock and document owner authorization for a subsequent approved visual change.

## Historical decision

D-45 approved the earlier design on 9 November 2026. D-46 adopted v1.0 on 10 November 2026 and removed obsolete alternatives. D-47 approves v1.1 including the latest login and binds it to implementation. Superseded source/preview sets remain removed; Git history is unchanged.

This approval does not start or complete implementation tasks, assign an executor, pass Phase A, or settle open D-40 decisions.
