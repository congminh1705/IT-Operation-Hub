---
id: itoh-docs-xmind-readme
title: "IT Operations Hub diagrams — XMind"
type: reference
domain: design
module: mindmaps
tags: [design, mindmaps, reference]
priority: 2
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: derived
purpose: "Define viewing, sources, coverage, and master/subset relationships for XMind."
---

# IT Operations Hub diagrams — XMind

**Target design · Documentation only, not implemented/tested.** Master [it-operations-hub.xmind](it-operations-hub.xmind) has 27 sheets; 8 topic files, 9 archives total. Topics/notes follow assistant+automation/KB-ACL/tasks-policies-approvals/M0–M5 sources.

## Reading

Open .xmind in XMind, select sheets/expand branches/open notes. Topics/relationships are editable. 27 previews: **18 mind maps (including Product/IA), 7 directed activities, 2 state graphs**. Product/IA preserve central/two-sided format with thicker bright borders. IA: 36 patterns carry IDs/routes, types/scopes in notes/catalog. Flows show action/responsibility/conditions. Native frames use larger type/blue borders/directed relationships; ticket/asset graphs retain 12/8 edges.

Retain UC/US/SCR business IDs. Seven flows were previously restructured from topic trees into activities/relationships with regenerated internal IDs/source guards in notes. Product/IA retain existing IDs; Product added 2 control topics. Master/subsets share content. Long guards/AC/routes/sources live in notes/Markdown. SVG previews use separate layouts, not XMind Desktop screenshots/exports; Desktop not opened in this phase.

Product/IA outer nodes have closed/thick/bright frames/larger type. 44 Product leaves/36 IA screen patterns. Capability/info-route groups grant no rights; catalog/BR/permissions remain authoritative.

Center nodes enlarged; second-level groups use larger light text on distinct dark branch colors; outer nodes light. Native Product/IA/master share colors/type hierarchy. Styling preserves content/topic IDs/group order.

Core IDs remain; work/coordination/source links added. Four AI sheets cover assistant/coordinator/tool scope; roadmap M0–M5. Restructured sheets have no dangling relationships.

**Language:** topic labels/notes/diagram captions use English. Embedded UI/dashboard images remain Vietnamese; their resource bytes are preserved during language conversion.

## Topic files

| File | Sheets | Current content |
| --- | --- | --- |
| [Master](it-operations-hub.xmind) | 27 | Core/AI/OPS/UI/roadmap |
| [01 Product](01-product-map.xmind) | 2 | Product/research/coordination goals |
| [02 Use cases](02-use-cases.xmind) | 4 | 51 distinct UC (33 core+8 AI+10 OPS); 3 core actor/scope sheets |
| [03 IA](03-information-architecture.xmind) | 1 | 36 distinct screen nodes (26 core+3 AI+7 OPS), routes/rights/UC notes |
| [04 Flows](04-user-flows.xmind) | 7 | 7 core views with confirmation/replanning/approval |
| [05 Rules](05-business-rules.xmind) | 5 | States/SLA/assets/priority/model/BR-14–22 |
| [06 Backlog](06-invest-backlog.xmind) | 1 | 67 distinct stories:47 core+8 AI+12 OPS, AC/dependency notes |
| [07 UI/UX](07-uiux.xmind) | 2 | UI/quality/OPS coverage, 37 v0.8 UI/board images |
| [08 AI](08-ai-assistant.xmind) | 4 | Assistant/coordination, 8 UC-AI+10 UC-OPS/story-AC references, 3 assistant images |

## SVG previews from the same topic trees

| Group | Previews |
| --- | --- |
| Product/research | [01](previews/01-product-map.svg), [02](previews/02-research.svg) |
| Use cases | [Overview](previews/00-use-cases-overview.svg), [Access](previews/03-use-cases-access.svg), [Tickets](previews/04-use-cases-ticket.svg), [Operations](previews/05-use-cases-operations.svg) |
| IA | [Screens](previews/06-information-architecture.svg) |
| Flows | [Requester](previews/07-flow-requester.svg), [Technician](previews/08-flow-technician.svg), [Manager](previews/09-flow-manager.svg), [Assets](previews/10-flow-asset.svg), [Admin](previews/11-flow-admin.svg), [Conflicts](previews/12-flow-conflict.svg), [Notifications](previews/13-flow-notification.svg) |
| Rules/model | [Ticket states](previews/14-ticket-states.svg), [SLA](previews/15-sla.svg), [Asset states](previews/16-asset-states.svg), [Priority](previews/17-priority.svg), [Model](previews/18-conceptual-model.svg) |
| Backlog/UI | [INVEST](previews/19-invest.svg), [UI/UX](previews/20-uiux.svg), [Quality](previews/21-ux-quality.svg) |
| Roadmap | [M0–M5](previews/22-roadmap.svg) |
| AI | [Overview](previews/23-ai-overview.svg), [Catalog](previews/24-ai-use-cases.svg), [Flows](previews/25-ai-handoff.svg), [Boundaries](previews/26-ai-boundaries.svg) |

## Coverage and embedded images

37 SVGs (34 UI+3 boards) illustrate 36 IDs through views/boards/context, including 7 OPS. Master/UI archives embed all 37 current renders; AI archive retains 3 assistant resources. SVGs are image sources, not runtime screenshots/XMind controls. Some patterns share views; not every state/breakpoint. v0.3 archive historical only.

[Logical ERD](../requirements/conceptual-data-model.md)/[automation flows](../05-user-flows.md) are separate. Topic trees do not replace ERD/schema/[permissions](../requirements/permissions-matrix.md).

Prior structural/source checks covered 51 UC/67 stories/36 screens, notes, ZIP/JSON/topics/relations/resources/XML/links. Selected diagrams rendered/reviewed in Chrome, not XMind Desktop/every size. [Review](../review-report.md) distinguishes actual evidence and translation rechecks.

## Authoritative sources and diagram types

Each root note identifies topic Markdown/permissions/conventions. XMind decomposes/summarizes; branches do not independently define sequences/FKs/rights. Use [ERD](../requirements/conceptual-data-model.md), [architecture views](../diagrams/architecture.md), [FIG catalog](../diagrams/README.md) for proper notation/source/limits.

R/T/M/A human actors; AI_COORDINATOR/scheduler internal. IT Manager=Head of IT; Teams add no Team Lead tier. Master/subsets retain matching IDs/content. Old UI archives never determine current behavior.

## UI/UX v0.8 images

Current [gallery](../design/wireframes/README.md). UI topics follow gallery, preserve old IDs/master-subset equality. Preview 20 comes from the same tree; Product/IA format and technical diagrams retained. 37 PNGs in master/UI are SVG renders, not competing designs.

## D-42 — One AI Workspace

Product/IA/AI/native UI images reflect one workspace. Retain topic/sheet IDs, 36 interaction patterns, 27 master sheets, approved Product/IA layout. AI01/02/OPS04/05 labels describe shared regions/details, not new roles/pages. UI11/12/23/24/37 role/state variants; chat owner and run/policy feed remain separate. Label translation preserves borders/colors/connectors/structure, with text fitting reviewed.

## AI Workspace: normal and exception

UI37 normal default has no approval card; UI23 explicitly exception. Same route/screen IDs, independent fixtures; 37 master/UI images+3 AI resources=77 resource entries. Image notes reference current titles/variants, not old default UI23 names.
