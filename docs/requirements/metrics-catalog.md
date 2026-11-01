---
id: itoh-docs-requirements-metrics-catalog
title: "Metrics catalog and reconciliation conventions"
type: reference
domain: domain
module: reporting
tags: [domain, reporting, reference]
priority: 1
status: design-draft
owner: "Project owner"
approval: needs-review
updated: 2026-11-01
authority: primary
purpose: "Define metric formulas, source populations, timestamps, and drill-down scope."
---

# Metrics catalog and reconciliation conventions

Screens share these formulas instead of redefining them. Apply [authorization scope](permissions-matrix.md) **before counting**. SVG numbers are not executed formula results.

## Time and population conventions

- `S`: readable tickets; Manager/Admin have organization-wide S.
- `C = [from, to)`: Asia/Ho_Chi_Minh start-of-first-day to start-of-day-after-last, converted to UTC.
- `t`: query timestamp. Display data freshness, without pretending real-time updates.
- `A(t)`: current New/Open/In Progress/Pending tickets.
- Current queue KPIs use A(t) across **all creation dates**, labeled accordingly, so old backlog remains visible. Date filters affect explicitly labeled period charts/reports [D-13].
- Queue team/assignee filters use current attributes; cohort team/state charts also use current attributes, not claimed historical snapshots.

## Definitions

| ID | Metric | Formula / population | Display / drill-down |
| --- | --- | --- | --- |
| MET01 | Unfinished tickets | `count(S ∩ A(t))` | Includes Pending; excludes Resolved/Closed/Cancelled; exact list |
| MET02 | Unassigned | MET01 with `assignee = null` | May overlap MET03/MET04 |
| MET03 | Current SLA at risk | MET01 with an unfinished monitored clock at 80%≤usage/budget<100%, and no current overdue clock | Distinct tickets, not sum of clocks |
| MET04 | Current SLA breached | MET01 with an unfinished clock usage≥budget, including resolution Pending already overdue before pause | Overdue label takes precedence; historical breaches separate |
| MET05 | By state/priority/team | Group S with `createdAt ∈ C` by current values | Totals equal cohort; Unassigned team for missing legacy data |
| MET06 | Created by day | `count(S with createdAt in each day ∩ C)` | Zero on days without creation |
| MET07 | Resolved by day | Count each ticket once if its **latest Resolved transition as of t** is in C, even if reopened later | Label latest-resolution tickets, not resolution-event count |
| MET08 | Mean active resolution time | In MET07: sum active time through latest Resolved / ticket count | Exclude post-reopen time after that event; show n; no samples → “—” |
| MET09 | Technician workload | Group MET01 by current assignee; total/In Progress/Pending/current overdue | Separate unassigned; ticket count is not productivity |
| MET10 | Expiring asset warranty | Readable non-Retired assets expiring today through end of day 30 | Missing dates separate; already expired separate |
| MET11 | Requests awaiting me | Requester's Pending/Resolved tickets | Reply to Pending; accept/reopen Resolved |
| MET12 | Assets assigned to me | Current user's unended assignments | Repair devices with retained assignment included |
| MET13 | Tickets assigned to me | MET01 assigned to current user with team access | Not tickets merely created by that user |
| MET14 | Unassigned team tickets | MET02 in Technician's active teams | Union without duplicates |
| MET15 | Historical breach | S with `createdAt ∈ C` and at least one persisted breach | Separate from MET04; budget increases do not erase history |

No new SLA-compliance ratio, percentage changes, or CSAT without approved formulas/data. MET08 is not an average of daily averages.

## Fictitious reconciliation examples

On 30 October, A is Open/unassigned, resolution 90%, response complete: MET01+1/MET02+1/MET03+1. B is Pending at resolution 105%: MET01+1/MET04+1; pause does not erase overdue. Resolved C with historical breach is excluded from MET01–04 but may enter MET15.

D active 2 h, Pending 3 h, active 1 h, Resolved: 3 h, not 6 h. Reopen/active another 30 m/Resolved again: latest 3.5 h. MET07 counts D on its latest resolution date only; later resolutions may change prior period populations. Tooltips explain this; closed historical books are outside MVP.

## Filters and drill-down

KPIs pass their exact scope/state/team/assignee/SLA filters to lists. Cohort metrics pass creation dates. MET07/08 drill-down filters latest resolution time, never substitutes creation time. Links/tables/reports reconcile at the same reference timestamp; mutations may change data and require refresh.

## Task, capacity, automation metrics

Retain MET01–15 for tickets/assets; MET09 ticket counts do not replace minute-based task capacity. These populations require IT authorization; Requesters receive no load/workforce/approval data. Matching filters/periods/timestamps/drill-downs share source populations.

| ID | Metric / definition | Source and limits |
| --- | --- | --- |
| MET16 | Unfinished tasks in effective plans: To Do/Ready/In Progress/Blocked, broken down by state | Current Task/PlanVersion; exclude Draft/Superseded; not inferred from tickets |
| MET17 | Staff/period load/capacity/free minutes = allocated remaining / absence-adjusted capacity / difference | WorkAllocation/calendar/capacity/absence under BR-16; unallocated tasks are not zero, show count/minutes separately |
| MET18 | Distinct risky tasks: Blocked, overdue `dueAt < t` and not Done/Cancelled, or predecessor making schedule infeasible | Tasks/dependencies/schedules; explicit risk reason/timestamp; no category double-count |
| MET19 | Valid Pending approvals count; execution failures/conflicts separate | ApprovalRequest/Decision/Action; Approved is not succeeded; expired/superseded excluded |
| MET20 | Automation outcomes: distinct committed action intents by executedAt in period; success/failure/conflict separate | Action/results; proposals/drafts/model calls are not business execution; retries do not multiply |
| MET21 | Intake-to-plan-assignment = firstSuccessfulAssignmentAt − confirmedTicketCreatedAt for plans with all required tasks assigned; n and median/p95 when sufficient | Ticket/event/action timestamps; unassigned pending/censored, not zero; no samples → “—” |
| MET22 | Usage/cost/latency by run/period from sourced provider usage/actual prices/versions; reserved/unknown separate; run wall time differs from model latency | AIUsage/BudgetLedger/Run; no usage → Unknown, not USD 0; cached/reasoning tokens only if provided |

### Post-implementation measurement and reconciliation

Compare manual/automated versions of the same scenarios: manual coordination actions; unchanged-plan ratio (applied unchanged/applied cohort plans); intervention ratio (runs needing decisions/edits/cohort coordination runs); intake-to-assignment; cost/run. Record cohort, observation window, and manual-action definition. No thresholds/results yet; no percentage improvement claims.

Task Done does not reduce MET01 before ticket Resolved/Closed/Cancelled. Reminders/AI chat are not first responses. DEMO data stays outside operational reports.
