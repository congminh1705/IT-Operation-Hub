---
id: itoh-implementation-03-ai-automation
title: "M3 — Minimum sources and AI automation"
type: planning
domain: development
module: delivery
tags: [implementation, backlog, traceability]
priority: 1
status: planned
owner: PO
approval: needs-review
updated: 2026-11-11
authority: derived
purpose: "Summarize group scope, completion criteria, child tasks and handoff."
---

# M3 — Minimum sources and AI automation

M3 groups deliver minimum sources and bounded real AI coordination. Live tests retain D-39 conditions; complete RAG/assistant capabilities follow their operational groups.

These are group/epic summaries. Each heading names the group goal. Implementation context, file boundaries, detailed checks and handoff evidence live in the linked task files. The [task workflow](workflow/task-workflow.md) defines the shared completion rule: every child and group criterion must pass, including any external integration closure. [Execution board](workflow/execution-board.md) owns task status/owner; [package registry](README.md#4-task-tracker) owns epic state. Application evidence remains **NOT RUN**.

<a id="ai-01"></a>

## AI-01 — Persist minimum versioned knowledge and ACL sources

**Scope:** Minimum immutable knowledge sources and live ACL/citation queries for planning.

**Trace:** US-OPS11 (minimum); AC-OPS11.

**Completion criteria**

1. Persist source/version/status/ACL and allow publication only under PRE-03 rights; immutable Published sources have provenance.
2. Filter readable Published versions before provider payloads and citations; revocation immediately affects runtime queries.
3. Provide synthetic source fixtures for planning; mark this as minimum sources, not completed embedding/RAG.

**Child tasks:** [AI-01.01](tasks/AI-01.01.md), [AI-01.02](tasks/AI-01.02.md).

**Handoff:** Verified outputs feed [AI-04](03-ai-automation.md#ai-04), [OPS-06](04-operations-assistant.md#ops-06) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#ai-01).

<a id="ai-02"></a>

## AI-02 — Persist minimum inventory for planning evidence

**Scope:** Minimum real planning inventory and shortage/adopted-reservation behavior.

**Trace:** US35 (minimum); AC35 (subset); AC-OPS03, AC-OPS05.

**Completion criteria**

1. Store uniquely identified persisted DEMO assets, states and available quantities with source provenance; no fabricated stock.
2. Only eligible M/A setup writes inventory; model read contracts disclose only authorized planning facts.
3. Handle shortage explicitly; if PRE-03 adopts reservations, implement separate bounded reservation lifecycle before any planning action relies on it.

**Child tasks:** [AI-02.01](tasks/AI-02.01.md), [AI-02.02](tasks/AI-02.02.md).

**Handoff:** Verified outputs feed [AI-04](03-ai-automation.md#ai-04), [OPS-01](04-operations-assistant.md#ops-01) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#ai-02).

<a id="ai-03"></a>

## AI-03 — Build provider adapter and shared usage budget ledger

**Scope:** Structured provider adapter, conservative shared budget and sourced usage.

**Trace:** AC-OPS10, AC-OPS12; NFR20, NFR23; D-39.

**Completion criteria**

1. Provider accepts minimal scoped inputs and returns validated structured proposals without DB/session credentials or domain writes.
2. Reserve actual/in-flight/unknown costs conservatively across modes/retries/embeddings; unknown timeout cost is not zero and aggregate cap cannot race.
3. Bound tokens/calls/timeouts/retries; persist sourced usage/model/latency or explicit unknown; no transaction/lock held while waiting.

**Child tasks:** [AI-03.01](tasks/AI-03.01.md), [AI-03.02](tasks/AI-03.02.md), [AI-03.03](tasks/AI-03.03.md).

**Handoff:** Verified outputs feed [AI-04](03-ai-automation.md#ai-04), [OPS-07](04-operations-assistant.md#ops-07), [OPS-08](04-operations-assistant.md#ops-08) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#ai-03).

<a id="ai-04"></a>

## AI-04 — Clarify missing request information

**Scope:** Source-validated intake and deduplicated clarification without incomplete effective work.

**Trace:** US-OPS03; AC-OPS03.

**Completion criteria**

1. Validate employee list/configuration/quantity/deadline and verified source references before onboarding plans.
2. Missing data creates deduplicated structured clarification; do not fabricate people/devices/effort.
3. Distinguish persisted/public authorized clarification from private model text; no incomplete effective plan or unauthorized notification.

**Child tasks:** [AI-04.01](tasks/AI-04.01.md), [AI-04.02](tasks/AI-04.02.md).

**Handoff:** Verified outputs feed [AI-05](03-ai-automation.md#ai-05) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-03](07-integration.md#int-03). [Criterion owners and closure](package-task-coverage.md#ai-04).

<a id="ai-05"></a>

## AI-05 — Generate and commit valid sourced AI plans

**Scope:** Sourced model plan proposals and current-policy atomic activation.

**Trace:** US-OPS04; AC-OPS04; A1, A2.

**Completion criteria**

1. Model proposes schema-valid sourced tasks/DAG using published templates and verified effort.
2. Semantic validation rejects cycles/unknown dependencies; stale context re-evaluates before atomic plan activation.
3. Enabled policy creates actual persisted work; disabled/out-of-scope proposals stay drafts or use the allowed approval path.

**Child tasks:** [AI-05.01](tasks/AI-05.01.md), [AI-05.02](tasks/AI-05.02.md).

**Handoff:** Verified outputs feed [AI-06](03-ai-automation.md#ai-06) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-03](07-integration.md#int-03). [Criterion owners and closure](package-task-coverage.md#ai-05).

<a id="ai-06"></a>

## AI-06 — Rank eligible candidates and assign through services

**Scope:** Backend-constrained candidate ranking and feasible real assignment.

**Trace:** US-OPS05; AC-OPS05; A1, A3, A5.

**Completion criteria**

1. Model ranks only backend-filtered candidates using operational evidence, never invents personnel or skill verification.
2. Recheck current membership/skills/schedule/policy and every allocation window immediately before commit.
3. Insufficient resources yield evidence-backed exception; no forced allocation or autonomous account/asset issuance.

**Child tasks:** [AI-06.01](tasks/AI-06.01.md), [AI-06.02](tasks/AI-06.02.md).

**Handoff:** Verified outputs feed [AI-07](03-ai-automation.md#ai-07) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-03](07-integration.md#int-03). [Criterion owners and closure](package-task-coverage.md#ai-06).

<a id="ai-07"></a>

## AI-07 — Replan after absence, blocker and risk events

**Scope:** Event-scoped model replanning and guarded automatic/exception paths.

**Trace:** US-OPS07, US-OPS08, US-OPS09; AC-OPS07–09; A4, A6.

**Completion criteria**

1. Events invoke real proposal generation for affected work; policy may reassign eligible unstarted tasks.
2. Locked/in-progress/out-of-scope/commitment changes produce explicit impact/approval, not silent overwrite or SLA extension.
3. Revalidate even after approval/model wait; chat lifecycle does not start/stop these background runs.

**Child tasks:** [AI-07.01](tasks/AI-07.01.md), [AI-07.02](tasks/AI-07.02.md).

**Handoff:** Verified outputs feed [AI-08](03-ai-automation.md#ai-08), [OPS-18](04-operations-assistant.md#ops-18), [QA-01](05-acceptance.md#qa-01) through the exact leaf dependencies. Full group acceptance also requires real integration evidence from [INT-03](07-integration.md#int-03). [Criterion owners and closure](package-task-coverage.md#ai-07).

<a id="ai-08"></a>

## AI-08 — Validate fixed M3 scenarios with a real model

**Scope:** Verified D-39 live-test entry and bounded real-model evidence.

**Trace:** A1–A7, A10, A11 (M3 evidence); TC-OPS01–11 as available.

**Completion criteria**

1. At execution verify D-39 model access, billing/quota/current pricing and safely configured keys; fixed test DB/synthetic inputs only.
2. Run complete/missing-input/shortage/cycle/absence/locked/stale/injection/provider-failure scenarios against persisted actions; retain model-versus-domain outcomes.
3. Record actual/reserved/unknown cost and stay within verified Gemini free-tier quotas including retries/embeddings, with USD 0 paid spend; do not substitute mocks or silently switch model if live access is unavailable.

**Child tasks:** [AI-08.01](tasks/AI-08.01.md), [AI-08.02](tasks/AI-08.02.md).

**Handoff:** Verified outputs feed [INT-03](07-integration.md#int-03), [QA-04](05-acceptance.md#qa-04) through the exact leaf dependencies. [Criterion owners and closure](package-task-coverage.md#ai-08).
