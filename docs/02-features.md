---
id: itoh-docs-02-features
title: "Capability catalog and priorities"
type: reference
domain: business
module: requirements
tags: [business, requirements, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Identify capabilities, scope priorities, related stories, and planned milestones."
---

# Capability catalog and priorities

**Target design — not implemented or tested.** This phase covers documentation only. MVP AI includes an assistant and policy-based coordination; Tickets and execution Tasks are separate. KB/RAG is in scope. See decisions D-34–42 and the authoritative documents for each topic.

All features below are **specified / not implemented**. “MVP Must” is a scope priority, not an instruction to fit everything into one sprint. `P1–P4` is reserved for ticket priority; the backlog uses Must/Should to avoid confusion.

| ID | Capability and value | Future milestone | Stories | Scope |
| --- | --- | --- | --- | --- |
| F01 | Identity, server sessions, profile, password | M1 | US01–US04 | Must |
| F02 | Users, roles, account locking, departments | M1 | US05–US08 | Must |
| F03 | IT teams, members, categories | M1 | US09–US11 | Must |
| F04 | Audited default SLA policy | M1 preparation; M4 completion | US12 | Must |
| F05 | Ticket creation with matrix-based priority | M1 foundation; M2 completion | US13 | Must |
| F06 | Permission-scoped lists and details | M1 foundation; M2 completion | US14–US15 | Must |
| F07 | Assignment, self-assignment, acceptance, starting work | M1 foundation; M2 completion | US16–US19 | Must |
| F08 | Public conversations and internal notes | M1 foundation; M2 completion | US20–US21 | Must |
| F09 | Authorized image/PDF attachments | M4 | US22–US23 | Must |
| F10 | Pending, resolution, closure, reopening, cancellation | M1 foundation; M2 completion | US24–US29 | Must |
| F11 | Reasoned priority changes and timeline | M1 foundation; M2 completion | US30–US31 | Must |
| F12 | Clocks, breach history, deduplicated workers | M4 | US32–US33 | Must |
| F13 | Recipient-scoped notifications and read state | M4; event preparation in M1–M2 | US34 | Must |
| F14 | Asset records and lookup | M4 | US35–US37 | Must |
| F15 | Asset issue, return, and status | M4 | US38–US40 | Must |
| F16 | Personal, team, and organization dashboards | M4 | US41–US43 | Must |
| F17 | Trends, resolution time, workload, warranty | M4 | US44–US46 | Must |
| F18 | Authorized business audit trail | Throughout M1–M5 | US47 | Must |
| F19 | Responsive UI, accessibility, error recovery, documentation | M5 and throughout | AC-X01–AC-X10 | Must |

Should applies only to layout polish, column widths, and content suggestions after usability testing. Authorization, persistence, SLA rules, and testing must not be downgraded to Should.

## First implementation slice

Admin creates accounts/teams → Requester creates a ticket → Manager assigns a Technician → Technician accepts and posts a public reply → performs work and records a solution → Requester closes. This slice needs authorization, history, and basic error handling from the outset. M1 prepares manual tickets/tasks and minimum data; M2 completes plan/policy/outbox guarantees; M3 adds AI automation; M4 completes files, SLA, and supporting operations. A fake countdown is not evidence of an SLA worker.

## Supporting boundaries

Topbar search is a shortcut for **authorized ticket search**, not a system-wide search engine. “My assets” differs from the administrative asset catalog. Audit differs from a ticket's public timeline. Reports have no export action unless that scope is formally added.

## MVP AI capabilities, operationally switchable

F01–F19 and the first business slice are retained. Core workflows do not depend on AI availability; AI remains an extended MVP acceptance requirement under D-33.

| ID | Capability | Stories | Status |
| --- | --- | --- | --- |
| F-AI01 | Cited guidance Q&A | US-AI01 | Specified, not implemented |
| F-AI02 | Authorized ticket/asset lookup | US-AI02 | Specified, not implemented |
| F-AI03 | Conversational ticket creation after confirmation, or form editing | US-AI03 | Specified, not implemented |
| F-AI04 | Visibility-aware ticket summaries | US-AI04 | Specified, not implemented |
| F-AI05 | Reply drafts reviewed/sent by IT staff | US-AI05 | Specified, not implemented |
| F-AI06 | Report explanations using existing metrics | US-AI06 | Specified, not implemented |
| F-AI07 | Personal conversation management | US-AI07 | Specified, not implemented |
| F-AI08 | Assistant availability controls | US-AI08 | Specified, not implemented |

See [assistant design](10-ai-assistant.md), [stories/AC](ai/use-cases-stories-and-acceptance.md), and [integration boundaries](ai/integration-and-non-regression.md).

## Work management and coordination capabilities

The milestones below are documentation plans, not running features.

| ID | Capability | Story / AC | Planned milestone |
| --- | --- | --- | --- |
| F-OPS01 | Verified skills, availability, work capacity budgets | US-OPS01 / AC-OPS01 | M1 |
| F-OPS02 | Versioned workflow/templates, policy/default deny/grantor | US-OPS02 / AC-OPS02 | M2 |
| F-OPS03 | Understand goals/deadlines and request missing data | US-OPS03 / AC-OPS03 | M3 |
| F-OPS04 | Plans/versions, tasks/DAG, feasibility | US-OPS04 / AC-OPS04 | M2–M3 |
| F-OPS05 | Candidates/ranking, assignment, atomic allocation | US-OPS05 / AC-OPS05 | M2–M3 |
| F-OPS06 | Task progress/remaining effort/results and state/dependencies | US-OPS06 / AC-OPS06 | M1–M2 |
| F-OPS07 | Monitoring events, risks, reassignment | US-OPS07 / AC-OPS07 | M2–M3 |
| F-OPS08 | Approval before/after/impact, revalidation, execution | US-OPS08 / AC-OPS08 | M2–M3 |
| F-OPS09 | Manual override/lock/automation disable | US-OPS09 / AC-OPS09 | M2 |
| F-OPS10 | Runs/actions/outbox/retry/audit/idempotency | US-OPS10 / AC-OPS10 | M2–M3 |
| F-OPS11 | KB Draft/Published/version/ACL and RAG/citations | US-OPS11 / AC-OPS11 | Minimum sources M3; complete M4 |
| F-OPS12 | Source-based task/capacity/risk/action/usage reporting | US-OPS12 / AC-OPS12 | M4 |

Assistant and automation are both MVP Musts. M2 may use structured inputs to prove business guarantees; future M3 must validate a real model and real actions. See [scope](01-scope.md), [AI](10-ai-assistant.md), and [M0–M5 roadmap](09-design-readiness.md).

## Shared AI Workspace — D-42

F-AI03/UC-AI03 supports existing use-case actions through forms/previews/confirmation within the AI Workspace, beyond creating tickets or opening links. Assistant and coordinator share a screen but have independent actors, permissions, and triggers; core features retain their original API/AC. Native forms/composers, committed results, and scoped activity are future delivery criteria. The [AI catalog](ai/use-cases-stories-and-acceptance.md) retains 8 UC/US/AC and expands to 18 total TCs; not implemented.
