---
id: itoh-docs-documentation-standard
title: "Documentation and diagram conventions"
type: reference
domain: project
module: documentation
tags: [project, documentation, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Define metadata, structure, traceability, diagram notation, and evidence levels."
---

# Documentation and diagram conventions

## 1. Purpose and scope

These conventions apply to IT Operations Hub design documentation. They draw on Agentic SDLC Kit metadata, source/representation separation, status, and traceability practices. Do not install the framework, copy another project's governance data, or add approval procedures that override the project owner's instructions.

Retain existing authoritative document paths and **the project README heading order**. Organize domains through the [index](README.md), without mass moves solely to rename folders. Graphic rules below belong to this documentation set; they do not claim UML/C4 provision or certification by the kit.

## 2. Metadata and structure

Markdown under docs/ starts with YAML: `id`, `title`, `type`, `domain`, `module`, `tags`, `priority`. Add `status`, `owner`, `approval`, `updated`, `purpose`, `authority` to identify scope and confidence. The project README retains its presentation format and is exempt from frontmatter; docs/README.md records its identity. Headings, links, and content still require checking. Document IDs are stable and unique. Document `priority` ranges from 1 to 5 for retrieval importance, distinct from ticket P1–P4.

| Field | Convention |
| --- | --- |
| type | reference: specification/reference; planning: plan; report: documentation-review results |
| status | design-draft, planned, hypothesis, or self-reviewed; no completed status for merely specified features |
| owner | Project owner; the accountable documentation role, not an invented person's name |
| approval | needs-review; individual decisions are confirmed separately in the decision log |
| authority | primary: topic source of truth; derived: index, illustration, or summary |
| purpose | One sentence defining the question answered |

Structure content by document type: purpose/scope → concepts/catalog → behavior/relationships/constraints → exceptions → verification → sources. Tables retain suitable IDs/columns; avoid repeating a long generic template in every file. Use one H1, sequential heading levels, clear table headers, and closed code fences. Describe the current design consistently instead of accumulating conversation-history supplements.

**Documentation language:** English, using clear, standard software and IT operations terminology. README, reports, specifications, contracts, diagram labels, and XMind text use English. UI/dashboard artwork, its screen copy, and embedded UI images remain Vietnamese. Quoted UI labels may remain Vietnamese when needed to identify the designed control. Preserve identifiers, paths, state enums, data contracts, and confirmed decisions. Language finalization does not approve open decisions or mark functionality implemented.

## 3. Specification contracts and traceability

| Type | Required content |
| --- | --- |
| Use case | ID, goal, actor/scope, trigger, preconditions, main flow, error paths, postconditions; reference shared conditions rather than duplicating |
| Story | Role, outcome, value, dependencies, AC; INVEST is a refinement assessment, not a test result |
| BR/NFR/AC | Stable ID; explicit rules/measurements; verification cases and sources; unconfirmed thresholds marked proposed/Decision required |
| API/event | ID, method/path or event type, actor/producer/consumer, input/output, permissions, transaction, idempotency, errors, UC/BR trace |
| Data | Entity/ownership/cardinality, version/lifecycle, unique/check/invariant, authorization source, logical versus physical schema |
| Architecture | Context, containers, modules, sequences, proposed deployment, trust boundaries, failure/recovery, tradeoffs |
| Decision | ID, status, authorized decision-maker, context/reason, options, consequences, affected documents; no invented approval |
| Validation plan | Goals, data/environment, method, expected result, evidence to retain, entry/exit; separate planned from actual |

Retain F/UC/US/AC/TC/SCR/BR/NFR/MET and D namespaces. Add API/EVT/FIG for contracts/figures without changing existing business IDs. Traceability means following requirements to their sources, not merely counting rows.

## 4. Diagram conventions

| Type | Representation | Do not mix into the same notation |
| --- | --- | --- |
| Use-case view | User actors outside boundary; ellipses with IDs/goals; associations do not indicate order | Internal components, DB tables, sequences, nonexistent management tiers |
| Context/container architecture | One abstraction level per view; distinguish people, external systems, applications, data stores; label communication edges | ER entities or UI steps |
| Sequence | Lifelines, ordered messages, alt branches; explicit transactions/commit and model calls | Approval and successful write effects treated as the same |
| Activity/task flow | Start, actions, branch conditions, end; exceptions have exits | Arrows interpreted as ER relationships or permissions |
| State transition | States and trigger/guard/effect edges or legend; one lifecycle per region | One shared status set for Ticket, Task, approval decision, execution |
| Logical ERD | Entities, relationship endpoints, cardinality/optionality; notes for other constraints | Claims of implemented indexes/DDL |
| Mind map | Decomposition tree, nodes/notes/sources, cross-references where needed | Branches interpreted as timelines or foreign keys |
| Wireframe | Screen ID, role/scope, state, illustrative data | Static images treated as live UI or accessibility evidence |

Each figure has a FIG ID, purpose, type, source, and limits in the [diagram inventory](diagrams/README.md). SVGs include title/desc and source metadata. Mermaid text is maintained in the containing document. Previews/PNG/XMind are derived and cannot independently change rules. Old UI archives are historical, not current designs.

Role views may repeat UC IDs but represent views of the same system. AI_COORDINATOR belongs to architecture/sequences, not a fifth human use-case actor. Automation can run on events without the supervisor clicking each step.

## 5. Checks and conclusion limits

Check UTF-8, frontmatter/IDs, internal links, headings/tables/fences, catalog IDs, traceability; parse SVG/JSON/ZIP; compare master/subset sheets, state edges, and figure sources. Review actors, scope, cardinalities, event retries, and failures separately from syntax.

Use `passed` only for performed checks with explicit scope. XML validation does not prove diagram readability; SVG review does not prove XMind Desktop behavior; documented AC do not prove software acceptance. Self-review does not replace independent approval. Do not create application source/executable application tests to validate documentation.

## 6. Layout and render review

Technical figures have FIG IDs, titles, purposes, and sources. Split views by question: use cases show actors/goals, flows include failures, sequences cover one interaction group, ERDs separate domains while retaining cardinality. Do not crowd every entity/exception into one diagram and shrink the text.

Use-case ellipses have undirected associations, grouped by actor to reduce crossings. Flows/states use direction/guards; cancellation edges keep endpoints when routed separately. Color accompanies labels. Mind maps use two-sided branches with spacing based on content height; they do not replace sequences/ERDs.

Product maps, IA, and primary/supporting flows use light backgrounds, dark blue borders, and bright blue outer outlines. Frames must fit all text with padding. Edge-label backgrounds fit their content without hiding frames/conditions. Product maps decompose capabilities; IA retains a central/two-sided mind map with IDs/routes and catalog/notes for detailed type/scope; primary flows show arrows/conditions/responsibility. Preserve original Product/IA format, thick borders, and bright outlines rather than converting to card tables/nested frames. Primary flows use activity notation. Unresolved rights/states are explicit or link to D-40, not assumed to be approved enterprise workflows.

Render before handover. Measure text width, canvas bounds, text containment, and ERD edges crossing unrelated entities. Review changed figures overall and key figures at full scale. PNGs must come from current SVGs. A single browser/font measurement does not prove all renderers/devices or XMind Desktop.

Product/IA outer nodes also have closed frames, thick borders, and bright outlines, retaining curved branches on both sides. Previews use outer nodes 480 px wide, 22 px text, 22 px horizontal padding, 22 px vertical spacing, and content-driven heights without clipping. Markdown code/escape syntax does not appear as SVG display text. These are documentation graphics dimensions, not app component sizes.

Product/IA hierarchy: navy center, 480 px wide, minimum 230 px high, bold 34 px text; second-level groups 360 px wide, minimum 132 px high, 26 px light text on each branch's existing distinct color (blue, teal, purple, ochre, slate blue, magenta). Outer nodes retain light backgrounds/22 px text. Keep the multicolor palette rather than one uniform fill. Center prominence comes from area/type size/weight; width alone does not define hierarchy for long content.

Center-to-second-level edges use separate anchors ordered top to bottom to avoid overlap. Each group's child edges converge at the middle of its outer side, then fan out as ordered curves. Keep horizontal routing corridors; no backward curves or lines through nodes. Previews are 2800 px wide, retaining node/type sizes and the two-sided mind map.

## 7. DBML/OpenAPI/C4 artifacts and code trees

Use finance-manager as a presentation reference for C4, database/OpenAPI, and folder structures. Preserve README heading order, placing additional technical sections before Documentation. Do not copy its ASP.NET/JWT stack, completion claims, or governance.

DBML/OpenAPI JSON are machine-readable design documents, with metadata/status/ownership in their domain README. Do not insert YAML frontmatter into formats with their own grammar. Logical models/BR and API rationale remain decision sources; static schemas/views/code trees stay synchronized without independent rule changes. C4 Level 4 and folder/file trees distinguish planned/current and do not create modules/tests/config outside documentation scope.
