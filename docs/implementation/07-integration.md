---
id: itoh-implementation-integration
title: "Phase C — Integrate the frontend with real services"
type: planning
domain: development
module: delivery
tags: [frontend, implementation, backlog]
priority: 1
status: planned
owner: PO
approval: needs-review
updated: 2026-11-09
authority: derived
purpose: "Summarize group scope, completion criteria, child tasks and handoff."
---

# Phase C — Integrate the frontend with real services

Phase C groups connect the delivered frontend to real scoped services as their outputs become available. Reuse screens/native forms; keep actual and DEMO adapters explicitly separate.

These are group/epic summaries. Each heading names the group goal. Implementation context, file boundaries, detailed checks and handoff evidence live in the linked task files. The [task workflow](workflow/task-workflow.md) defines the shared completion rule: every child and group criterion must pass, including any external integration closure. [Execution board](workflow/execution-board.md) owns task status/owner; [package registry](README.md#4-task-tracker) owns epic state. Application evidence remains **NOT RUN**.

<a id="int-01"></a>

## INT-01 — Connect identity, administration and shared transport

**Scope:** Real identity/admin adapters and verified session/cache lifecycle.

**Trace:** FE-01–04; US01–12.

**Completion criteria**

1. Replace mock auth/admin calls with real cookie/CSRF APIs and reviewed generated DTOs; remove DEMO login helpers from real mode.
2. Verify real session expiry/revocation/user switch, allowed projections, handover conflicts and preserved forms; server rights are authoritative.
3. Real mode has no mock fallback or synthetic data insertion; retain explicit isolated DEMO mode for frontend checks.

**Child tasks:** [INT-01.01](tasks/INT-01.01.md), [INT-01.02](tasks/INT-01.02.md), [INT-01.03](tasks/INT-01.03.md).

**Handoff:** Verified outputs feed [INT-02](07-integration.md#int-02), [INT-03](07-integration.md#int-03), [QA-01](05-acceptance.md#qa-01) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#int-01).

<a id="int-02"></a>

## INT-02 — Connect ticket lifecycle, attachments, SLA and notifications

**Scope:** Real ticket/actions, private attachments, SLA and notification wiring.

**Trace:** FE-05–07/17; US13–34.

**Completion criteria**

1. Wire native ticket/assignment/comment/transition/priority/upload flows to real services with expected versions and idempotency.
2. Handle upload partial/unknown outcomes, current parent ACL and actual SLA clocks/alerts; remove fake optimistic success on timeouts.
3. Reconcile real ticket timeline and recipient notification effects with backend responses while preserving drafts and error focus.

**Child tasks:** [INT-02.01](tasks/INT-02.01.md), [INT-02.02](tasks/INT-02.02.md), [INT-02.03](tasks/INT-02.03.md).

**Handoff:** Verified outputs feed [INT-04](07-integration.md#int-04), [INT-05](07-integration.md#int-05), [INT-06](07-integration.md#int-06), [QA-01](05-acceptance.md#qa-01) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#int-02).

<a id="int-03"></a>

## INT-03 — Connect workforce, plans, policy, approvals and runs

**Scope:** Real workforce/work/automation/approval adapters and independent background effects.

**Trace:** FE-08–11; US-OPS01–10.

**Completion criteria**

1. Replace fixture schedules/tasks/DAG/candidates/policies/runs with real scoped endpoints and actual model-run outcomes.
2. Revalidate current versions/rights/capacity at commands; render real stale/locked/failed responses and separate decision from effect.
3. Background execution works while the workspace is closed; polling never creates actions and recovery never repeats successful intents.

**Child tasks:** [INT-03.01](tasks/INT-03.01.md), [INT-03.02](tasks/INT-03.02.md), [INT-03.03](tasks/INT-03.03.md).

**Handoff:** Verified outputs feed [INT-05](07-integration.md#int-05), [INT-06](07-integration.md#int-06), [QA-01](05-acceptance.md#qa-01) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#int-03).

<a id="int-04"></a>

## INT-04 — Connect asset inventory and ticket references

**Scope:** Real asset records/pickers and atomic lifecycle outcomes.

**Trace:** FE-12; US35–40; US13 asset link.

**Completion criteria**

1. Connect metadata/read/history/issue/return/state endpoints and actor-specific ticket asset lookup.
2. Display atomic conflict results and updated assignment history; support-scope access does not expand ticket visibility.
3. Prevent real mode from reading fixture inventory or using model-proposed devices as actual stock.

**Child tasks:** [INT-04.01](tasks/INT-04.01.md), [INT-04.02](tasks/INT-04.02.md).

**Handoff:** Verified outputs feed [INT-05](07-integration.md#int-05), [INT-06](07-integration.md#int-06), [QA-01](05-acceptance.md#qa-01) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#int-04).

<a id="int-05"></a>

## INT-05 — Connect knowledge, assistant and confirmed action forms

**Scope:** Real KB/chat/action-card/provider integration with live source access checks.

**Trace:** FE-13–15; US-AI01–08; US-OPS11.

**Completion criteria**

1. Wire chat/source/KB/index/provider availability to real scoped services, with source revocation before render/history.
2. Bind trusted forms to current user-actor commands with reviewed digest/version/TTL/idempotency; no borrowed background grant.
3. Run independent chat/automation and real failure/unknown-outcome paths. Reuse D-39 evidence and shared cost limits; no paid calls merely to test static rendering.

**Child tasks:** [INT-05.01](tasks/INT-05.01.md), [INT-05.02](tasks/INT-05.02.md), [INT-05.03](tasks/INT-05.03.md).

**Handoff:** Verified outputs feed [INT-06](07-integration.md#int-06), [QA-01](05-acceptance.md#qa-01) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#int-05).

<a id="int-06"></a>

## INT-06 — Connect dashboards, report facts, notifications and audit

**Scope:** Real report/dashboard, notification/audit and complete adapter inventory.

**Trace:** FE-16–17; US34/41–47; US-OPS12; US-AI06.

**Completion criteria**

1. Replace fixture metrics/usage/activity with authorized backend facts and matching filters/timezone/source timestamps.
2. Keep reports and assistant fact cards consistent, including unknown usage, draft-versus-executed counts and inaccessible drill-downs.
3. Verify all frontend routes use the intended real adapter in real mode, with mock data restricted to explicit DEMO mode.

**Child tasks:** [INT-06.01](tasks/INT-06.01.md), [INT-06.02](tasks/INT-06.02.md).

**Handoff:** Verified outputs feed [QA-01](05-acceptance.md#qa-01) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#int-06).
