import type { SessionStore } from "@/features/auth/session-store";
import type { DemoPersona } from "./fixtures";
import type { WorkItem } from "./work-board";
import type { ReportFilters } from "./organization-metrics";

const timestamp = (local: string) => Date.parse(local + "+07:00");
const actionFacts = [
  {
    id: "ACT-DEMO-01",
    run: "RUN-DEMO-01",
    team: "support",
    at: timestamp("2026-11-18T10:20:00"),
    outcome: "success",
  },
  {
    id: "ACT-DEMO-01",
    run: "RUN-DEMO-01",
    team: "support",
    at: timestamp("2026-11-18T10:21:00"),
    outcome: "success",
  },
  {
    id: "ACT-DEMO-02",
    run: "RUN-DEMO-02",
    team: "support",
    at: timestamp("2026-11-19T11:05:00"),
    outcome: "failure",
  },
  {
    id: "ACT-DEMO-03",
    run: "RUN-DEMO-03",
    team: "field",
    at: timestamp("2026-11-19T13:20:00"),
    outcome: "conflict",
  },
] as const;
const planFacts = [
  {
    id: "PLAN-DEMO-01",
    team: "support",
    createdAt: timestamp("2026-11-18T10:00:00"),
    firstCompleteAssignment: timestamp("2026-11-18T10:20:00"),
  },
  {
    id: "PLAN-DEMO-02",
    team: "support",
    createdAt: timestamp("2026-11-19T11:00:00"),
    firstCompleteAssignment: null,
  },
] as const;
const usageFacts = [
  {
    run: "RUN-DEMO-01",
    team: "support",
    at: timestamp("2026-11-18T10:20:00"),
    usage: null,
  },
  {
    run: "RUN-DEMO-02",
    team: "support",
    at: timestamp("2026-11-19T11:05:00"),
    usage: null,
  },
  {
    run: "RUN-DEMO-03",
    team: "field",
    at: timestamp("2026-11-19T13:20:00"),
    usage: null,
  },
] as const;
const openDrafts = [
  {
    id: "DRAFT-DEMO-01",
    team: "support",
    at: timestamp("2026-11-18T09:00:00"),
  },
];

export function taskRisk(
  rows: readonly WorkItem[],
  filters: Pick<ReportFilters, "team" | "at">,
) {
  const unfinished = rows.filter(
    (row) =>
      (!filters.team || row.team === filters.team) &&
      row.state !== "done" &&
      row.state !== "cancelled",
  );
  const risks = unfinished.flatMap((row) => {
    const reasons = [];
    if (row.state === "blocked") reasons.push("Bị chặn");
    const due = Date.parse(row.deadline);
    if (due < filters.at) reasons.push("Quá hạn");
    if (
      due - filters.at < row.remaining * 60_000 &&
      row.dependencies.some(
        (id) => rows.find((item) => item.id === id)?.state !== "done",
      )
    )
      reasons.push("Phụ thuộc chưa hoàn tất trong khung còn lại");
    return reasons.length ? [{ id: row.id, title: row.title, reasons }] : [];
  });
  return { unfinished, risks };
}

export function operationalMetrics(
  store: SessionStore,
  actor: DemoPersona,
  filters: ReportFilters,
  range: { start: number; end: number } | null,
) {
  const tasks = taskRisk(store.work.list(actor, [], "work"), filters);
  const staff = store.workforce.projection(actor);
  const within = (at: number) =>
    !!range && at >= range.start && at < range.end && at <= filters.at;
  const sameTeam = (team: string) => !filters.team || filters.team === team;
  const outcomes = [
    ...new Map(
      actionFacts
        .filter((item) => within(item.at) && sameTeam(item.team))
        .map((item) => [item.id, item]),
    ).values(),
  ];
  const assignments = planFacts.filter(
    (item) => within(item.createdAt) && sameTeam(item.team),
  );
  const minutes = assignments.flatMap((item) =>
    item.firstCompleteAssignment !== null &&
    item.firstCompleteAssignment <= filters.at
      ? [(item.firstCompleteAssignment - item.createdAt) / 60_000]
      : [],
  );
  const knownRuns = usageFacts.filter(
    (item) => within(item.at) && sameTeam(item.team),
  );
  const currentDecision = sameTeam("support")
    ? store.approvalDecisions.read(actor, "pending")
    : null;
  const proposalValid =
    filters.at >= timestamp("2026-11-18T09:00:00") &&
    filters.at < timestamp("2026-12-01T00:00:00") &&
    store.automationPolicy.allowsTeam("support");
  return {
    ...tasks,
    staff,
    approvals: {
      pending:
        currentDecision && proposalValid && !currentDecision.record ? 1 : 0,
      drafts: openDrafts.filter(
        (item) => item.at <= filters.at && sameTeam(item.team),
      ).length,
      approved: currentDecision?.record?.decision === "approved" ? 1 : 0,
      failed: currentDecision?.execution === "failed" ? 1 : 0,
    },
    outcomes: {
      success: outcomes.filter((item) => item.outcome === "success").length,
      failure: outcomes.filter((item) => item.outcome === "failure").length,
      conflict: outcomes.filter((item) => item.outcome === "conflict").length,
    },
    assignment: {
      n: minutes.length,
      pending: assignments.length - minutes.length,
      minutes,
    },
    usage: { runs: knownRuns.length, tokens: null, cost: null, latency: null },
  };
}
