import { expect, test } from "vitest";
import { createDemoFixtures } from "./fixtures";
import { scopedTicketRows } from "./ticket-list";
import {
  deriveTicketMetrics,
  reportWindow,
  warrantyPopulation,
} from "./organization-metrics";
import { projectTicketSla } from "./ticket-sla";
import { baseline } from "./sla-policy";
import type { TicketEvent } from "./ticket-detail";

test("GMT+7 range and latest resolution use the final transition and active time", () => {
  const filters = {
    from: "2026-11-18",
    to: "2026-11-18",
    team: "",
    at: Date.parse("2026-11-19T09:00:00+07:00"),
  };
  const start = Date.parse("2026-11-17T17:00:00Z");
  expect(reportWindow(filters)).toEqual({ start, end: start + 86_400_000 });
  expect(reportWindow({ ...filters, to: "2026-11-31" })).toBeNull();
  const scoped = scopedTicketRows(
    createDemoFixtures().personas.IT_MANAGER,
    "work",
    [],
  );
  if (scoped.kind !== "success") throw Error("Fixture unavailable");
  const row = { ...scoped.rows[0], state: "Đang xử lý" as const };
  const at = (minute: number) =>
    new Date(start + minute * 60_000).toISOString();
  const events: TicketEvent[] = [
    [20, "Chờ bổ sung"],
    [60, "Đang xử lý"],
    [80, "Đã giải quyết"],
    [100, "Đang xử lý"],
    [130, "Đã giải quyết"],
    [150, "Đang xử lý"],
  ].map(([minute, state], index) => ({
    id: String(index),
    at: at(Number(minute)),
    state: state as TicketEvent["state"],
    kind: "history",
    audience: "public",
    text: "DEMO",
    actor: "DEMO",
  }));
  const sla = projectTicketSla({
    seed: { createdAt: start, stateAt: start, state: row.state },
    events,
    firstResponseAt: null,
    now: filters.at,
    priority: row.priority,
    budgets: baseline,
  });
  const report = deriveTicketMetrics([{ row, createdAt: start, sla }], filters);
  expect(report.days).toEqual([{ day: "2026-11-18", created: 1, resolved: 1 }]);
  expect(report.meanMinutes).toBe(70);
  const empty = deriveTicketMetrics([{ row, createdAt: start, sla }], {
    ...filters,
    from: "2026-11-19",
    to: "2026-11-19",
  });
  expect(empty.meanMinutes).toBeNull();
  expect(empty.population.MET01).toHaveLength(1);
});

test("warranty includes day 30 but excludes day 31 and retired", () => {
  const result = warrantyPopulation(
    [
      { state: "stock", warranty: "2026-12-01" },
      { state: "stock", warranty: "2026-12-31" },
      { state: "stock", warranty: "2027-01-01" },
      { state: "retired", warranty: "2026-12-01" },
      { state: "stock", warranty: "2026-11-30" },
      { state: "stock", warranty: "" },
    ],
    Date.parse("2026-12-01T23:00:00+07:00"),
  );
  expect(result.expiring.map((asset) => asset.warranty)).toEqual([
    "2026-12-01",
    "2026-12-31",
  ]);
  expect(result.expired).toHaveLength(1);
  expect(result.unknown).toHaveLength(1);
});
