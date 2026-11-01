---
id: itoh-docs-readme
title: "Analysis and design documentation"
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
purpose: "Define document structure, authoritative sources, decision authority, and handover limits."
---

# Analysis and design documentation

This documentation describes the **target design**, not an implemented system. Each topic has an authoritative source; summaries, diagrams, UI designs, and XMind link back to it. The [project README](../README.md) retains its product-presentation heading order.

## 1. Structure and authoritative sources

| Domain | Authoritative source | Details / representations |
| --- | --- | --- |
| Documentation management | [Conventions](documentation-standard.md) | [Review report](review-report.md) |
| Problem and scope | [Scope](01-scope.md) | [Research](00-research.md), [capabilities](02-features.md) |
| Functional requirements | [Use cases](03-use-cases.md), [stories](08-invest-requirements.md) | [AI assistant catalog](ai/use-cases-stories-and-acceptance.md) |
| Quality and acceptance | [NFR](requirements/non-functional-requirements.md), [AC/TC](06-acceptance-criteria.md) | [Validation plan](research/validation-plan.md), [traceability](traceability/master-traceability.md) |
| Domain and authorization | [BR-01–22](requirements/business-rules.md), [permissions](requirements/permissions-matrix.md) | [Account provisioning](requirements/account-provisioning.md), [metrics](requirements/metrics-catalog.md) |
| Architecture and integration | [Architecture](technical/architecture.md) | [C4 C1–C4](architecture/c4/README.md), [code structure](technical/code-structure.md), [architecture views](diagrams/architecture.md), [stack](technical/tech-stack.md), [candidate versions](technical/version-baseline.md) |
| API and events | [API contract](technical/api-design.md) | [OpenAPI](api/README.md), [operation catalog](api/operations.md), [AI integration](ai/integration-and-non-regression.md) |
| Data | [Logical model and ERD](requirements/conceptual-data-model.md) | [DBML](database/README.md); constraints/transactions in architecture; no physical schema/migration |
| AI | [AI design](10-ai-assistant.md) | AI catalog, policy/approval/KB rules, tool contracts; D-39 test configuration |
| IA and experience | [IA/screen inventory](04-information-architecture.md), [UI/UX](07-uiux-specification.md) | [Flows](05-user-flows.md), [design system](design/design-system.md), [content/states](design/content-and-states.md), [responsive/motion](design/motion-and-responsive.md), [visual direction](design/visual-refresh.md), [Apple Design Skill review](design/uiux-review.md) |
| Graphics | [Diagram inventory](diagrams/README.md) | [UI designs](design/wireframes/README.md), [XMind](xmind/README.md); derived representations |
| Decisions and planning | [Decision log](decisions/design-decisions.md), [M0–M5 roadmap](09-design-readiness.md) | D-40 collects open decisions; the roadmap does not authorize implementation |

Security, DevOps, and observability are specified in architecture, NFR, and permissions. No second specification is created just to match framework folder names. Application and operational testing is planned, with no execution report.

The project README keeps its existing presentation format without mandatory YAML frontmatter. Reference record: ID itoh-readme, type reference, domain project, module repository, authority derived, status design-draft, owner Project owner. Each docs/ source contains its own metadata; OpenAPI JSON/DBML artifacts are described in their domain README.

## 2. Project SRS

The SRS is distributed across the authoritative sources above, without another duplicated master specification. Scope/user classes are in `01-scope.md`; capabilities use F/UC/US IDs; BR/NFR define constraints; AC/TC define acceptance; research and D-40 record assumptions. The [traceability matrix](traceability/master-traceability.md) connects them.

One organization; four user roles: Requester, Technician, IT Manager (Head of IT), Admin. No separate IT Team Lead tier. AI_COORDINATOR is an internal service identity. Ticket intake/SLA differs from Task execution; AI assistant and coordination are both in the MVP.

## 3. Authority and status

The user/project owner confirms scope and product decisions. The agent writes and checks consistency; it does not claim independent approval, passing application tests, or acceptance. The decision log distinguishes confirmed decisions from open ones. Document metadata `approval: needs-review` does not invalidate individually confirmed decisions.

When a rule changes, update its authoritative source first, then affected traceability, APIs/data, diagrams, UI/XMind, and validation plans. Resolve conflicts using confirmed decisions within their scope. If a decision is missing, record it in D-40 rather than choosing the most recently edited file.

## 4. Handover limits

Metadata, links, IDs, diagram relationships, and derived content can be checked during documentation work. Performance, live security, models, accessibility, concurrency, and restore need evidence from an application after a separate implementation request. No independent approval or application-test evidence is claimed.
