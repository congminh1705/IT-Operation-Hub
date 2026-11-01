---
id: itoh-c4-context
title: "C1 — System Context"
type: reference
domain: architecture
module: c4
tags: [architecture, c4, design]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: derived
purpose: "Define users, the system boundary, and the external provider."
---

# C1 — System Context

**Target design, not implemented.** Source view FIG-CTX01 is maintained in [Mermaid/architecture](../../diagrams/architecture.md).

![C1 — System context](../../diagrams/system-context.svg)

## Actors and boundaries

| Actor/system | Goal / interaction | Boundary |
| --- | --- | --- |
| Requester | Submit/update requests, consult assistant/KB under ACL, accept results | Outside Hub; own data |
| Technician | Specialist tasks, scoped public replies/notes, results | Outside Hub; current team/assignee |
| IT Manager | Policies, supervision, intervention, exception approval | Outside Hub; no added IT Team Lead |
| Admin | Create/revoke users, organization, availability/SLA | Outside Hub; no default access to all chats |
| Hub | Tickets/tasks/workforce/SLA/assets/KB, AI assistant and coordination | Software system being designed |
| AI provider | Models/embeddings through an adapter; untrusted output | Outside trust boundary; production choice undecided |

AI_COORDINATOR lives inside the Hub and uses current grants/policies; it is not shown as a logged-in person. Other department heads submit tickets as Requesters; Admin provisions users after D-29 verification. Real HR/calendar/email integrations are not added to the MVP.

## Data and failure boundaries

Only minimal, authorized sources may be sent to a provider. M3 may use only synthetic DEMO data under D-39 when a separate execution request is made. Provider failure does not block core tickets/SLA/manual operations. Model output cannot grant permissions, close tickets, mark work Done, or create accounts.

## Related documents

[Scope](../../01-scope.md) · [Permissions](../../requirements/permissions-matrix.md) · [C2](02-containers.md).
