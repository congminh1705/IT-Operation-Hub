---
id: itoh-project-ui-ux-skills
title: "Project-local UI/UX skills"
type: reference
domain: design
module: tooling
tags: [skills, ui, ux, project-setup]
priority: 1
status: self-reviewed
owner: PO
approval: needs-review
updated: 2026-11-12
authority: primary
purpose: "Record the project-scoped UI/UX skill installation, usage and integration boundaries."
---

# Project-local UI/UX skills

## Taste and Emil installation - 13 November 2026

At PO's request, installed **19 additional skills** in this project only: Taste
from `D:/taste-skill/skills/taste-skill` and all 18 skill packages from
`D:/EMIL-animation-design-skill/skills/skills`. Existing seven skills were retained;
there are now 26 skill entry points. No global installation, source-repository
modification, runtime dependency installation or application redesign was performed.

| Use | Skill entry point |
| --- | --- |
| UI art direction and redesign | [design-taste-frontend](../../.agents/skills/design-taste-frontend/SKILL.md) |
| Component craft and interaction polish | [emil-design-eng](../../.agents/skills/emil-design-eng/SKILL.md) |
| Build task-owned web motion | [animate](../../.agents/skills/animate/SKILL.md) |
| Coordinate multiple animated elements | [choreograph](../../.agents/skills/choreograph/SKILL.md) |
| Identify useful motion before implementation | [find-animation-opportunities](../../.agents/skills/find-animation-opportunities/SKILL.md) |
| Review and optimize motion | [review-animations](../../.agents/skills/review-animations/SKILL.md), [animation-performance](../../.agents/skills/animation-performance/SKILL.md) |
| Touch interactions and mobile web behavior | [gestures](../../.agents/skills/gestures/SKILL.md), [mobile-native](../../.agents/skills/mobile-native/SKILL.md) |

The bundle also includes animate-expo, animation-vocabulary, apple-design,
ask-sonner, break-ui, improve-animations, pick-ui-library, prototype,
remove-animations and write-swift. Select only relevant skills; Expo/Swift packages
do not change this project's Next.js stack. Explicit-invocation-only skills remain
explicit-invocation-only. Read each selected SKILL.md before applying it.

### Project application rules

- Use Taste for requested visual exploration and Emil for purposeful, responsive
  interactions and motion. Retain ui-ux-pro-max for product UX and accessibility.
- This is an operational application. Taste's marketing-page heroes, full-screen
  sections, mandatory photos and decorative scenes must not replace usable tables,
  forms, navigation, dense workspaces or required business content. Apply the
  project's actual brief and task boundaries first.
- Motion must support feedback, state and spatial relationships. Include keyboard,
  touch and reduced-motion handling; preserve readable data and responsive inputs.
  Use existing tokens and the smallest suitable tool, without installing a motion
  library just to implement a simple fade. PO-approved login decoration is retained
  until explicitly changed; skill defaults do not silently remove it.
- Installing these skills prepares the requested UI/animation redesign; it does
  not itself approve a replacement visual baseline or change FE task acceptance.
  During design exploration keep existing approved sources intact. Once a new
  direction is selected, update design contracts, affected task references and
  visual evidence consistently before claiming implementation conformance.
- Keep review pickers, skill diagnostics and decorative demos outside product UI.
  Do not run bundled hooks/installers automatically or claim Codex executes Claude
  hooks. No paid provider calls or external publishing are authorized by installation.

### Provenance and verification

[Installation manifest](../../.agents/skill-sources/design-animation-installation.json)
records source paths, revisions, entry points, counts and manifest hashes.
Taste source HEAD: `f6b76575f949707b4e3c37cd86cb44b0b98643e8`;
Emil source HEAD: `4061b67b8d976a186aca118594f54b638c5f718a`.
These identify HEAD only, not a guarantee that source checkouts were clean.
All **1,658 copied skill files** were verified byte-for-byte by SHA-256 against
the local sources. Both selected Taste JavaScript tools (`gate.mjs`,
`consistency.mjs`) pass `node --check`; no design/browser finish gate is claimed.
MIT notices are retained as [Taste license](../../.agents/skills/LICENSE.taste-skill)
and [Emil license](../../.agents/skills/LICENSE.emil-animation). Source-level Emil
cheat sheets are retained in `.agents/skill-sources/emil-animation/`.

The new skills are available on the next turn; if a client has not refreshed its
catalog, reopen the project session. Example: request `$design-taste-frontend` for
UI exploration, or `$animate` for a specific interaction. This is tooling setup,
not implementation of FE-02 or a change to the pending Parent PR merge gate.

## Installation scope and provenance

The original seven skills were installed only in this repository under `.agents/skills/`, from the local checkout `D:\ui-ux-pro-max-skill`. No user/global skill directories or external source files were modified. The additional Taste/Emil installation is documented above.

- Source skill version: **2.15.0** from the source `skill.json`; bundled installer package: 2.5.0.
- Source revision: `4f2dbb67e64969a9a30ab00742f2d55d66ddec2b`. This identifies HEAD, not a claim that the source checkout had no local edits.
- Method: the source repository's `generatePlatformFiles` utility, Codex platform, project target, `isGlobal=false`, `force=false`. It renders the Codex manifest and copies bundled data/scripts and six sibling skills without package installation or downloads.
- License: MIT; retained in [LICENSE.ui-ux-pro-max](../../.agents/skills/LICENSE.ui-ux-pro-max), with original bundled notices preserved.

## Installed skills

| Skill | Entry point | Purpose |
| --- | --- | --- |
| ui-ux-pro-max | [SKILL.md](../../.agents/skills/ui-ux-pro-max/SKILL.md) | Searchable product/style/color/type/UX/stack guidance |
| design | [SKILL.md](../../.agents/skills/design/SKILL.md) | Routes broader visual-design work to the relevant sub-skill |
| design-system | [SKILL.md](../../.agents/skills/design-system/SKILL.md) | Tokens and component specifications |
| ui-styling | [SKILL.md](../../.agents/skills/ui-styling/SKILL.md) | UI styling and reusable component guidance |
| brand | [SKILL.md](../../.agents/skills/brand/SKILL.md) | Brand identity and consistency |
| banner-design | [SKILL.md](../../.agents/skills/banner-design/SKILL.md) | Banner composition when explicitly relevant |
| slides | [SKILL.md](../../.agents/skills/slides/SKILL.md) | Presentations when requested |

Codex discovers repository skills from `.agents/skills`; this layout is also selected by the source's Codex platform template. Invoke `$ui-ux-pro-max` for relevant UI/UX work. If discovery is not refreshed, start a new Codex session in this repository. Other skills should be selected only when their purpose matches the task, not loaded together by default.

## Project usage

The main catalog search uses Python 3 and its standard library; the current environment has Python 3.13.15. From the project root:

```powershell
python -B .agents/skills/ui-ux-pro-max/scripts/search.py "error summary validation" --domain ux
python -B .agents/skills/ui-ux-pro-max/scripts/search.py "client components interactive" --stack nextjs
```

For a coherent future visual-direction request, follow the installed skill's design-system workflow. Read existing project design decisions first; do not persist a competing MASTER or overwrite existing design sources merely to test installation. Explicit generation/persistence must be scoped to the requested design work.

The project has an agreed Next.js frontend and FastAPI backend. Generic catalog recommendations are advisory: for example, a result recommending Next.js Server Actions does not replace this project's FastAPI business APIs. Respect [stack](tech-stack.md), [design system](../design/design-system.md), role permissions, Vietnamese UI copy and the active task's acceptance. When Hoang Cong Minh requests design changes, update the affected authoritative UI/UX sources and task context before claiming the implementation matches them.

Installing a skill does not install a runtime dependency, connect an external model/provider, publish a website or activate a task. Use existing available tools for any future capability; unsupported tools/provider references in a sub-skill do not authorize new integrations or system-wide installs.

## Installation verification

The following checks establish local installation usability only:

- All seven skill folders contain their entry-point SKILL.md and bundled resources; the generated primary search path resolves within this project.
- `search.py --help` runs with the installed Python.
- A UX catalog smoke query returns a focus-visibility result; treat its AA/AAA level accurately.
- A Next.js catalog smoke query runs; assess result fit against the agreed architecture before applying it. No generated design recommendation was persisted.
- License and source metadata are retained. These original installation checks did not implement an application or redesign. FE-01 has since been implemented separately; see current-context for actual task state.

Sources: [official Codex local skills documentation](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills), local source `README.md`, `skill.json`, and `src/ui-ux-pro-max/templates/platforms/codex.json`.
