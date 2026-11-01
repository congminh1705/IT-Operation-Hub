---
id: itoh-docs-01-scope
title: "Product scope and direction"
type: reference
domain: business
module: product
tags: [business, product, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Define product goals, MVP scope, roles, and exclusions."
---

# Product scope and direction

**Target design · Not implemented or tested.** The current phase covers design documentation only. M0–M5 describe the proposed development roadmap.

## Goals

IT Operations Hub manages an IT department with multiple specialist teams in one organization. It retains tickets, SLAs, assets, users/teams, notifications, reports, audit, and a knowledge base. The main workflow is **understand the request → create a plan/tasks → select people and assign work → monitor → reassign under policy → report results**.

A Ticket records an incoming request and its SLA commitments. A Task represents execution work with an assignee, effort, deadline, and dependencies. The IT Manager sets policies, supervises, intervenes/locks assignments, and approves exceptions. IT staff perform specialist work and record completion. AI does not replace the entire management or technician role.

## Target MVP scope

| Area | Required outcome for future implementation and acceptance |
| --- | --- |
| Foundation | Admin-created accounts, departments, teams/membership, server sessions, CSRF, record-level authorization, audit |
| Tickets | Creation/classification/prioritization, public/internal conversations, private files, history, and current states |
| Work management | Versioned plans, one effective version per ticket; separate tasks, DAG, estimated/remaining effort, deadlines |
| Workforce | Manager-verified skills, work schedules, absence intervals, and work capacity budgets by period |
| AI coordination | Detect missing information, generate schema-constrained plans, rank eligible candidates, call assignment services, monitor events, and reassign within policy |
| Controls | Default deny; workflow/team/priority/action limits; exception approval; version checks, deduplication, and transactional capacity validation |
| AI assistant | One AI Workspace with background activity; Q&A/search/summaries and authorized actions for existing use cases through cards/forms/confirmation, including ticket creation and authorized reply submission |
| Knowledge | Draft/published content, versions, read access, cited retrieval; PostgreSQL/pgvector RAG, embedding adapter, background indexing |
| Operations | Two 24/7 SLA clocks, alerts/notifications, assets/issue/return, dashboards, and reports from source records |

AI is part of MVP acceptance. Operational enable/disable flags do not remove it from scope. Q&A, summaries, and drafts do not automatically write business records; confirmed ticket creation and policy-authorized automation call domain services to perform writes. “Assign this to A” as text is not a completed assignment.

## Roles and data

The four user roles are REQUESTER, TECHNICIAN, IT_MANAGER, and ADMIN. AI_COORDINATOR is a background service identity tied to a policy and its grantor, not a user role or a general-purpose Admin. The conversational assistant acts with the requesting user's permissions. See the [permissions matrix](requirements/permissions-matrix.md).

**IT Manager (IT_MANAGER) means the Head of IT; there is no separate IT Team Lead role.** AI coordinates work under policy; the IT Manager sets policy, supervises, intervenes, and approves exceptions. A Team groups specialists and defines work scope, without adding a management tier. Heads of other departments submit requests with Requester permissions.

D-29 remains unchanged: a department head submits a ticket as Requester; only Admin verifies the request and creates the account. An onboarding account-provisioning step is a task for an authorized person, not permission for AI to create users or roles.

## Target scenario

Prepare devices and accounts for 10 new employees before a deadline: confirm the ticket → request missing employee/configuration/deadline details → reference a Published workflow → check stock, prepare devices, install software, request account provisioning, test, and hand over with valid parallel branches → check inventory/workforce → assign tasks under an enabled policy → update progress → record absence → reassign unstarted tasks or request exception approval → an authorized person records completion/acceptance → AI reports results.

Insufficient devices/staff or an infeasible SLA must produce an exception, not fabricated data or relaxed constraints. Future seed data must be labeled DEMO; no seed, database, or running workflow exists yet.

## Outside the MVP

Multi-tenant SaaS; payroll/timekeeping/staff performance appraisal; AI shell access, software installation on real devices, autonomous account/permission provisioning, purchasing/cost approval, autonomous work completion or ticket closure. Real email/calendar/HR integrations, scanned OCR, advanced CMDB, full change management and shift scheduling are excluded. Public signup, SSO/MFA, Excel/PDF export, and dark mode are not added.

## Status and authoritative sources

Specified does not mean implemented or tested. The MVP capabilities above are target designs.

[Decisions](decisions/design-decisions.md) distinguishes Confirmed from Decision required. [Business rules](requirements/business-rules.md), [architecture](technical/architecture.md), [data model/ERD](requirements/conceptual-data-model.md), [API design](technical/api-design.md), [AI](10-ai-assistant.md), and [roadmap](09-design-readiness.md) are authoritative for their topics.

## Shared AI Workspace — D-42

Assistant and automation share a screen but have different triggers, identities, and permissions. The assistant is an app interaction channel through forms/previews/confirmation; automation continues through events/policies when chat is closed. Conversation adds no new permissions or business capabilities. See [AI design](10-ai-assistant.md) and [IA](04-information-architecture.md). Design only; no application code.
