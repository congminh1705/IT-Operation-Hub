---
id: itoh-docs-00-research
title: "Top-down research"
type: reference
domain: business
module: discovery
tags: [business, discovery, reference]
priority: 1
status: hypothesis
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Separate problem assumptions, proto-personas, and facts needing research."
---

# Top-down research

Research date: **30 October 2026**. Completed methods: specification analysis, project-state review, primary-source desk research, and design-assumption synthesis. **No interviews, employee surveys, current-system measurements, or usability tests have been conducted.**

## 1. Context → problems → desired outcomes

| Analysis level | Content |
| --- | --- |
| Organization | One enterprise, multiple departments/devices, internal IT with multiple teams |
| Specified problems | Scattered/easily missed requests, unclear ownership, poor deadline/device-history visibility |
| Consequences to validate | Users repeatedly ask for updates; technicians switch contexts; IT Manager discovers backlog late |
| Product capabilities | One place for intake, coordination, communication, execution, acceptance; asset links and SLA control |
| Employee value | Know the request was recorded, who handles it, what is pending, how to accept the result |
| IT value | Scoped queues, assignment history, clear public/internal separation |
| Management value | Identify unassigned tickets, SLA pressure, and workload from source data |

Reasoning: **centralize requests → clarify ownership → control execution → confirm outcomes → measure and improve**. Attractive dashboards alone do not solve this chain.

## 2. Analysis basis and project state

| Basis | Design conclusion |
| --- | --- |
| Product specification | One organization, four roles; request → plans/tasks → assignment → monitoring/reassignment → acceptance |
| Workspace state | Analysis/design only; no application, database, or workers |
| UI requirements | Vietnamese, desktop-first, light surfaces, blue accent, readable data tables |
| Business constraints | Record-level rights, guarded states, two SLA clocks, preserved history |
| Analysis method | Goals → capabilities → actors/use cases → stories/AC → information/screens |
| Visual documentation | Editable XMind with previews linked to business documentation |

Enterprise field data, ticket volumes, and user habits still need validation. Design documents are not evidence of working features.

## 3. Product decomposition

The capability map follows confirmed scope and preserves the central/two-sided mind map, with stronger group borders and bright outlines. Connectors indicate decomposition, not execution order. AI assistant/coordination and KB/RAG are MVP; intake tickets differ from execution tasks. Four roles exclude IT Team Lead; IT Manager sets policy, supervises, and approves exceptions. D-40 operational details are not validated enterprise research.

![XMind diagram — 01-product-map](xmind/previews/01-product-map.svg)

[Open XMind](xmind/01-product-map.xmind)

## 4. Desk research and application

These sources support methods/design principles. They **do not replace** project-specific rules, prove certification, or constitute quantitative market research.

| Primary source, accessed 30 October 2026 | Reference finding | Project design inference |
| --- | --- | --- |
| [Bill Wake — INVEST](https://xp123.com/invest-in-good-stories-and-smart-tasks/) | Stories should be independent, negotiable, valuable, estimable, small, testable | Split by user outcomes, record real dependencies; DB/UI layers alone are not independent stories |
| [Atlassian — Service request management](https://www.atlassian.com/itsm/service-request-management) | Service requests and interruptions have different goals and need clear intake | Two ticket types in MVP; aggregating tickets into incidents is deferred by scope |
| [Nielsen Norman Group — 10 heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) | Status visibility, error prevention/recovery are evaluation principles | Keep state, assignee, and next action visible; confirm consequential actions |
| [W3C — WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Testable keyboard, contrast, label, error criteria | Target AA with a checklist; no conformance claim |
| [W3C — Target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | SC 2.5.8 requires at least 24 × 24 CSS px with exceptions | Choose 44 px for primary mobile targets; do not call 44 px a mandatory AA requirement |
| [W3C — Focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) | Author content must not fully obscure focus | Add sticky-header/footer clearance and keyboard tests |
| [OWASP — Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) | Check each request/resource; deny by default | UI filtering plus backend ticket/comment/file/asset-link authorization |
| [OWASP — File upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) | Validate type/content/size/storage | Show format/size/access limits; no public upload-directory URLs |

## 5. Proto-personas and jobs to be done

These are **role-based assumptions**, not profiles derived from interviews.

| Role | When… I want… so that… | First information needed | UX risk |
| --- | --- | --- | --- |
| Employee | When work is interrupted, submit/track a description to know how to resume | Create request, status, pending IT question, result to accept | SLA/P1 jargon; confusing Resolved with Closed |
| Technician | At shift start, see assigned/unclaimed team work to prioritize | Assigned work, team, ticket age, both SLA deadlines | Posting internal notes publicly; duplicate claims |
| IT Manager | When AI coordinates, set policies and see bottlenecks to supervise/intervene/approve with evidence | Policies/grants, runs/actions, exceptions, due/overdue work, per-person load | Confusing approval with execution; aggregate KPIs hiding old tickets/breach history |
| Admin | When staff/policies change, update permissions/configuration for safe operations | Active accounts, teams, current policies, change history | Locked users keeping sessions; default SLA edits changing old tickets |

## 6. Priority hypotheses

| ID | Hypothesis | Validation | If false |
| --- | --- | --- | --- |
| H01 | Employees choose impact/urgency from short examples | Request-form task and explanation interview | Rewrite labels/help, retain business matrix |
| H02 | Employees distinguish Resolved/Closed | Acceptance and further-work tasks | Improve banners/notifications |
| H03 | Separate public/internal tabs reduce wrong-audience posts | Technician drafts both consecutively | Refine composer/audience confirmation |
| H04 | Unassigned/SLA queues are more useful than many charts | Manager coordination task | Reorder content, retain formulas |
| H05 | Assignment/prior-ticket history sufficiently supports device troubleshooting | Technician/asset interviews | Add truly necessary MVP description fields, not an unsolicited CMDB |
| H06 | IT Manager needs historical breaches even when current budget remains | Priority-change/reopen tasks | Clarify history without deleting breaches |

## 7. Research risks and questions

High priority: state comprehension, post-transfer access, public/internal confusion, locked users with assigned tickets, period metrics. Medium: mobile tables, filter density, asset lookup. Temporary decisions are in the [decision log](decisions/design-decisions.md); interview/testing plans are in [validation](research/validation-plan.md).

Do not promise percentage reductions in handling time without baseline measurements. After implementation, measure assignment coverage, first response, active resolution time, reopen count, and user task success.

## 8. Additional assistant research

MVP includes on-demand assistance and automatic coordination: cited Q&A, lookup/summaries, confirmed ticket creation, and policy planning/assignment/monitoring/replanning. AI does not bypass state/first-response/SLA rules or autonomously issue assets. Automation services may write within D-35 policies. H-AI01–04 and desk-research sources are referenced in [AI design](10-ai-assistant.md); no user results or AI quality benchmarks exist.

## 9. Coordination research hypotheses

Target pain points: managers manually break down/assign work; skills/schedule/load data are missing; dependencies/blockers are found late; absence invalidates assignments; reporting is manual and AI actions are hard to explain. These remain problem hypotheses, not field-survey findings.

H-OPS01: managers understand/control default-deny policies. H-OPS02: technicians understand tickets versus tasks/dependencies. H-OPS03: skill/schedule/load evidence supports candidate decisions. H-OPS04: approval diffs and execution status prevent approval/assignment confusion. H-OPS05: manual locks/automation disable provide clear intervention.

Validate later with onboarding/absence/exception tasks, source/action checks, and user observation. No manager-replacement or percentage-productivity claims before measurement. D-39 confirms only DEMO test settings, not model effectiveness or production provider choice.
