---
id: itoh-docs-review-report
title: "Documentation consistency and diagram review"
type: report
domain: quality
module: documentation
tags: [quality, documentation, report]
priority: 2
status: self-reviewed
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: derived
purpose: "Record self-review scope, corrected gaps, and documentation-evidence limits."
---

# Documentation consistency and language review

## 1. Scope and outcome

The documentation set now uses clear technical English. This includes the project README, requirements, reports, technical specifications, OpenAPI descriptions, Mermaid sources, SVG diagrams, and native XMind labels and notes. UI and dashboard artwork remains Vietnamese, including the UI images embedded in XMind. Quoted Vietnamese control labels are retained where needed to identify designed interactions.

The project remains in the **analysis and design phase**. No application code, migration, dependency, operational configuration, or executable application test was created or changed. No model/provider request was made. M0?M5 remain a proposed roadmap, not authorization to begin implementation.

This is an agent self-review of documentation. It does not constitute independent approval, user-research validation, or software acceptance. The project README retains the order and numbering of its existing H2/H3 sections; only their wording changes to English.

## 2. Comparison with confirmed requirements

| Area | Previous gap or current design | Confirmed target | Status | Related sources | Documentation action |
| --- | --- | --- | --- | --- | --- |
| Scope and delivery status | Some earlier requests included implementation | Documentation only until separately requested | Aligned | [Decisions](decisions/design-decisions.md), [roadmap](09-design-readiness.md) | Keep implementation and application tests marked planned/not run |
| Roles and stack | Four roles and the existing stack | IT Manager means Head of IT; no Team Lead; FastAPI, SQLAlchemy, Alembic retained | Aligned | [Scope](01-scope.md), [permissions](requirements/permissions-matrix.md), [stack](technical/tech-stack.md) | Use consistent role names and technical boundaries |
| AI Workspace | Older native notes still described a separate coordination page | One workspace with assistant interaction and background activity | Corrected | [IA](04-information-architecture.md), [AI design](10-ai-assistant.md), XMind | Synchronize route, region, and visibility descriptions |
| Assistant actions | Some native UC/US/AC-AI03 notes still covered ticket creation only | Supported existing actions use scoped forms, previews, and explicit confirmation | Corrected | [AI catalog](ai/use-cases-stories-and-acceptance.md), [API](api/README.md) | Replace stale notes from authoritative catalog rows |
| Independent AI modes | A shared screen could imply a shared trigger | Assistant works without a coordination run; workers run without a chat session | Aligned | AI design, [UI specification](07-uiux-specification.md) | Explain triggers and actor boundaries explicitly |
| Shared model | Shared adapter with a global budget and separate mode limits | Separate prompts, contexts, identities, tools, and grants | Aligned | [AI integration](ai/integration-and-non-regression.md), D-39/40/42 | Keep production model selection open |
| Automation start | Trigger details were spread across documents | An eligible event, valid policy, and sufficient data start coordination | Clarified | AI design, [events/API](technical/api-design.md) | Centralize trigger behavior; polling does not itself create work |
| Manual work | Automatic assignment might obscure manual operations | Authorized users can assign/intervene; IT staff perform specialist work | Clarified | [Business rules](requirements/business-rules.md), permissions | Apply the same authorization, feasibility, version, and audit rules |
| Assistant placement | Earlier layouts obscured the assistant's purpose | Identity and action suggestions sit immediately above chat | Aligned | UI specification, UI11/12/23/37 | Keep the replacement proposal independent from general assistant work |
| Normal and exception states | The exception example could appear to be the default | UI37 shows normal coordination; UI23 shows an exception proposal | Aligned | UI specification, [gallery](design/wireframes/README.md) | Include both in README section 2.4; keep independent DEMO fixtures |
| Approval and execution | A decision could be mistaken for a completed reassignment | Approval precedes revalidation and execution; Approved is not Succeeded | Aligned | BR-18, [sequences](diagrams/architecture.md), UI23/24 | Preserve separate decision/execution states and directed steps |
| Buttons and login | Earlier counts and notes were stale | 107 centered button groups; login and state board match the current design | Corrected before translation | [Design system](design/design-system.md), [UI review](design/uiux-review.md) | Translate supporting specifications while preserving artwork |
| Inventory and contracts | Stale asset counts and native notes | 37 UI/board SVGs, 36 interaction patterns, 77 embedded UI resources | Corrected | Gallery, [traceability](traceability/master-traceability.md), XMind | Synchronize counts and source references |
| Documentation language | Vietnamese or mixed-language sources and diagrams | English documentation and diagrams; Vietnamese UI artwork | Completed | [Conventions](documentation-standard.md), entire documentation set | Translate sources and derived views; regenerate diagram thumbnails |

## 3. File groups updated

| Group | Files and main changes |
| --- | --- |
| Product presentation | Root README: English prose and captions, original section order, seven core capability groups and eight UI images in section 2.4 |
| Scope and requirements | docs/00?10, requirements, AI catalogs, research and acceptance plans: English behavior, roles, exceptions, and planned verification |
| Architecture and contracts | Technical documents, C4 documentation, API guide/catalog and OpenAPI prose: English descriptions with stable routes, identifiers, schema fields, enum values, and relationships |
| Data design | Database guide and conceptual ERD descriptions: consistent English terminology; DBML was already English and is unchanged |
| Experience documentation | UI specification, design system, content/states, motion, visual direction, UI review, and gallery: English guidance with Vietnamese product copy retained |
| Planning and reports | Decisions, readiness, traceability, conventions, indexes, and this report: English text with confirmed/open/planned status preserved |
| Diagrams | 59 non-UI SVGs and 20 Mermaid blocks: English labels, captions, legends, and readable text fitting; overview PNG regenerated from its SVG |
| Native XMind | Nine archives: translated sheet/topic labels and notes, synchronized subsets, current English diagram thumbnails; topic IDs, relationships, styles, and UI image resources preserved |

The translation also corrects a malformed US-AI03 INVEST row that repeated the user story in the negotiable-detail column. Its replacement describes form-layout flexibility and possible domain-slice refinement without changing scope or IDs. Product/IA retain the approved two-sided, multicolor layout, prominent hierarchy, thick borders, and bright outlines.

<details>
<summary>Files updated in this language pass (118)</summary>

```text
README.md
docs/00-research.md
docs/01-scope.md
docs/02-features.md
docs/03-use-cases.md
docs/04-information-architecture.md
docs/05-user-flows.md
docs/06-acceptance-criteria.md
docs/07-uiux-specification.md
docs/08-invest-requirements.md
docs/09-design-readiness.md
docs/10-ai-assistant.md
docs/documentation-standard.md
docs/README.md
docs/review-report.md
docs/ai/integration-and-non-regression.md
docs/ai/use-cases-stories-and-acceptance.md
docs/api/openapi.json
docs/api/operations.md
docs/api/README.md
docs/database/README.md
docs/decisions/design-decisions.md
docs/design/content-and-states.md
docs/design/design-system.md
docs/design/motion-and-responsive.md
docs/design/uiux-review.md
docs/design/visual-refresh.md
docs/diagrams/approval-sequence.svg
docs/diagrams/approval-states.svg
docs/diagrams/architecture.md
docs/diagrams/asset-states.svg
docs/diagrams/automation-flow.svg
docs/diagrams/automation-sequence.svg
docs/diagrams/c4-code-assignment.svg
docs/diagrams/c4-components-api.svg
docs/diagrams/c4-components-worker.svg
docs/diagrams/deployment-topology.svg
docs/diagrams/erd-assets.svg
docs/diagrams/erd-assistant.svg
docs/diagrams/erd-confirmation-usage.svg
docs/diagrams/erd-execution.svg
docs/diagrams/erd-identity.svg
docs/diagrams/erd-knowledge.svg
docs/diagrams/erd-policy.svg
docs/diagrams/erd-sla-clocks.svg
docs/diagrams/erd-ticket-sla.svg
docs/diagrams/erd-work-plans.svg
docs/diagrams/erd-workforce.svg
docs/diagrams/onboarding-task-dag.svg
docs/diagrams/README.md
docs/diagrams/replanning-flow.svg
docs/diagrams/system-containers.svg
docs/diagrams/system-context.svg
docs/diagrams/task-states.svg
docs/diagrams/ticket-states.svg
docs/diagrams/use-cases-access.svg
docs/diagrams/use-cases-ai.svg
docs/diagrams/use-cases-operations.svg
docs/diagrams/use-cases-overview.svg
docs/diagrams/use-cases-ticket.svg
docs/diagrams/use-cases-work-management.svg
docs/requirements/account-provisioning.md
docs/requirements/business-rules.md
docs/requirements/conceptual-data-model.md
docs/requirements/metrics-catalog.md
docs/requirements/non-functional-requirements.md
docs/requirements/permissions-matrix.md
docs/research/validation-plan.md
docs/technical/api-design.md
docs/technical/architecture.md
docs/technical/code-structure.md
docs/technical/tech-stack.md
docs/technical/version-baseline.md
docs/traceability/master-traceability.md
docs/xmind/01-product-map.xmind
docs/xmind/02-use-cases.xmind
docs/xmind/03-information-architecture.xmind
docs/xmind/04-user-flows.xmind
docs/xmind/05-business-rules.xmind
docs/xmind/06-invest-backlog.xmind
docs/xmind/07-uiux.xmind
docs/xmind/08-ai-assistant.xmind
docs/xmind/it-operations-hub.xmind
docs/xmind/README.md
docs/xmind/previews/00-use-cases-overview.svg
docs/xmind/previews/01-product-map.svg
docs/xmind/previews/02-research.svg
docs/xmind/previews/03-use-cases-access.svg
docs/xmind/previews/04-use-cases-ticket.svg
docs/xmind/previews/05-use-cases-operations.svg
docs/xmind/previews/06-information-architecture.svg
docs/xmind/previews/07-flow-requester.svg
docs/xmind/previews/08-flow-technician.svg
docs/xmind/previews/09-flow-manager.svg
docs/xmind/previews/10-flow-asset.svg
docs/xmind/previews/11-flow-admin.svg
docs/xmind/previews/12-flow-conflict.svg
docs/xmind/previews/13-flow-notification.svg
docs/xmind/previews/14-ticket-states.svg
docs/xmind/previews/15-sla.svg
docs/xmind/previews/16-asset-states.svg
docs/xmind/previews/17-priority.svg
docs/xmind/previews/18-conceptual-model.svg
docs/xmind/previews/19-invest.svg
docs/xmind/previews/20-uiux.svg
docs/xmind/previews/21-ux-quality.svg
docs/xmind/previews/22-roadmap.svg
docs/xmind/previews/23-ai-overview.svg
docs/xmind/previews/24-ai-use-cases.svg
docs/xmind/previews/25-ai-handoff.svg
docs/xmind/previews/26-ai-boundaries.svg
docs/design/wireframes/README.md
docs/design/wireframes/use-cases-overview.png
docs/architecture/c4/01-context.md
docs/architecture/c4/02-containers.md
docs/architecture/c4/03-components.md
docs/architecture/c4/04-code.md
docs/architecture/c4/README.md
```

</details>

## 4. Final documentation checks

Final results are recorded after the translated artifacts have been checked. These are structural and local rendering checks, not application-test results.

| Check | Result in this language pass |
| --- | --- |
| Markdown structure | 48 files; 47 frontmatter documents plus the root README exception; no detected metadata, link, anchor, heading, table, or fence errors |
| README structure | Original numbered H2/H3 order and levels preserved; section 2.4 retains seven core groups/eight UI images |
| SVG and Mermaid | All 140 SVGs XML-parsed; all 20 Mermaid blocks matched to current sources and rendered successfully |
| Diagram layout | All 59 translated non-UI SVGs measured locally; no detected text-width, canvas, checked-frame containment, text-overlap, or unrelated ERD/class-edge crossing errors; selected key diagrams visually reviewed |
| Native XMind | Nine valid ZIP/JSON archives; 27 master sheets; subsets match the master; original topic IDs, relationships, styles, and structural properties preserved |
| Native image handling | All nine diagram thumbnails regenerated in English; all 77 embedded UI resource entries preserved byte-for-byte |
| Vietnamese UI preservation | All 37 UI/board SVGs and 44 icon SVGs preserved byte-for-byte against the start of this language pass; the historical UI archive and login illustration retained |
| OpenAPI | 3.1.1; 74 paths, 96 operations, 96 schemas, 1,000 resolved local references, and 19 API groups; structural checks passed |
| API translation boundaries | 144 prose values translated, including human-readable business-rule notes; routes, operation IDs, schema fields, state enums, and referenced rule IDs preserved |
| Data model | 52 DBML entities match Mermaid; 59 DBML reference endpoints checked; DBML and technical package metadata unchanged |
| Stable catalogs | Use-case, story, acceptance, screen-inventory, and business-rule ID sets preserved in their authoritative catalogs; task/ticket/asset graphs retain 10/12/8 transitions |
| Scope and whitespace | 118 documentation/artifact files updated in this pass; no application source changes; git diff --check reports no whitespace errors |

The measurement scope is explicit: frame containment checks apply to supported framed SVG nodes. A successful check does not prove every renderer, device, notation detail, or XMind Desktop layout. No current application acceptance criterion is marked passed on this evidence.

## 5. Earlier UI verification

Earlier design work recorded 107 centered button groups, the UI23 five-step/four-arrow exception sequence, and the normal UI37 four-step sequence. Its 37 UI SVGs and 44 icon files are preserved during this language conversion. The current pass verifies preservation rather than claiming fresh interactive UI tests.

The original account-provisioning design remains in the project. Only its illustration was removed from the root README's core-screen report, as requested. UI23 is an exception example of the same AI Workspace, not a separate AI product or a prerequisite for using the assistant.

## 6. Open decisions and evidence limits

[D-40](decisions/design-decisions.md) still requires decisions on production providers/models/embeddings, SDK and budget, data/retention, capacity periods and skill verification, policy limits and exception grants, KB publisher rights, credentials/bootstrap/emergency handover, physical lock granularity/TTLs, SLOs, and backups. Translating documents does not approve these values.

D-39 records the user's constraints for a **future** initial M3 DEMO test using OpenAI and a maximum total cost of USD 5, subject to a separate implementation request and secure key, billing/quota, access, capability, and current-price checks. Embedding use remains conditional. No live AI test was run during documentation work.

Official OpenAPI/DBML CLI validation, generated clients, HTTP behavior, persistence, workers, authorization, concurrency, keyboard/ARIA, zoom, usability, live models, and restore remain untested. Local SVG measurements do not establish behavior in every browser/font or in XMind Desktop. No application code changes arose before or during this documentation finalization; the repository still contains only the backend/frontend placeholders.
