import { expect, test } from "vitest";
import { createDemoFixtures } from "./fixtures";
import { personalTicketMetric } from "./dashboard-metrics";
import { scopedTicketRows } from "./ticket-list";
test("technician counts use an active-team union without duplicate IDs", () => {
  const { TECHNICIAN, IT_MANAGER } = createDemoFixtures().personas;
  const result = scopedTicketRows(IT_MANAGER, "work", [], false);
  if (result.kind !== "success") throw Error("Fixture unavailable");
  const teams = ["support", "infrastructure"];
  const union = personalTicketMetric(
    TECHNICIAN,
    teams,
    [...result.rows, ...result.rows],
    "MET14",
  );
  const separate = teams.flatMap((team) =>
    personalTicketMetric(TECHNICIAN, [team], result.rows, "MET14"),
  );
  expect(union.map((row) => row.id).sort()).toEqual(
    separate.map((row) => row.id).sort(),
  );
  expect(union.length).toBeGreaterThan(0);
  expect(
    union.every((row) => !row.assigneeId && teams.includes(row.teamId)),
  ).toBe(true);
});
