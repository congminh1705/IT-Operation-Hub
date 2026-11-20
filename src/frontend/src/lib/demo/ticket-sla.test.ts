import { describe, expect, test } from "vitest";
import { baseline } from "./sla-policy";
import { projectTicketSla, type TicketSlaSeed } from "./ticket-sla";
import type { TicketEvent } from "./ticket-detail";

const min = 60_000;
const createdAt = Date.UTC(2026, 10, 19, 2);
const time = (minutes: number) =>
  new Date(createdAt + min * minutes).toISOString();
const seed: TicketSlaSeed = {
  createdAt,
  state: "Đang chờ tiếp nhận",
  stateAt: createdAt,
};
const event = (
  minutes: number,
  state: TicketEvent["state"],
  priorPriority?: TicketEvent["priorPriority"],
): TicketEvent => ({
  id: String(minutes),
  at: time(minutes),
  audience: "public",
  kind: "history",
  actor: "DEMO",
  text: "",
  state,
  priorPriority,
});

describe("ticket SLA clocks", () => {
  test("thresholds distinguish running, risk and breach", () => {
    const check = (minutes: number) =>
      projectTicketSla({
        seed,
        events: [],
        firstResponseAt: null,
        now: createdAt + minutes * min,
        priority: "P1",
        budgets: baseline,
      }).response.status;
    expect([check(11), check(12), check(15)]).toEqual([
      "running",
      "risk",
      "breached",
    ]);
  });

  test("Pending pauses resolution only, resumption keeps prior active time", () => {
    const options = {
      seed,
      firstResponseAt: null,
      priority: "P3",
      budgets: baseline,
    } as const;
    const paused = projectTicketSla({
      ...options,
      events: [event(30, "Chờ bổ sung")],
      now: createdAt + 80 * min,
    });
    expect(paused.resolution).toMatchObject({
      status: "paused",
      used: 30 * min,
    });
    expect(paused.response).toMatchObject({
      status: "breached",
      used: 80 * min,
    });
    const resumed = projectTicketSla({
      ...options,
      events: [event(30, "Chờ bổ sung"), event(90, "Đang xử lý")],
      now: createdAt + 100 * min,
    });
    expect(resumed.resolution.used).toBe(40 * min);
  });

  test("stopping without first response and reopening preserve time and past breaches after priority change", () => {
    const options = {
      seed,
      firstResponseAt: null,
      priority: "P4",
      budgets: baseline,
    } as const;
    const events = [
      event(140, "Đã giải quyết"),
      event(150, "Hoàn tất"),
      event(160, undefined, "P1"),
    ];
    const stopped = projectTicketSla({
      ...options,
      events,
      now: createdAt + 220 * min,
    });
    expect(stopped.resolution).toMatchObject({
      status: "stopped",
      used: 140 * min,
      wasBreached: true,
    });
    expect(stopped.response).toMatchObject({
      status: "stopped",
      used: 140 * min,
      completed: false,
      wasBreached: true,
    });
    const reopened = projectTicketSla({
      ...options,
      events: [...events, event(200, "Đang xử lý")],
      now: createdAt + 220 * min,
    });
    expect(reopened.resolution).toMatchObject({
      status: "running",
      used: 160 * min,
      wasBreached: true,
    });
    expect(reopened.response).toMatchObject({
      status: "risk",
      used: 220 * min,
      wasBreached: true,
    });
  });

  test("a committed first response remains stopped across a budget change", () => {
    const result = projectTicketSla({
      seed,
      events: [event(80, undefined, "P2")],
      firstResponseAt: time(45),
      now: createdAt + 100 * min,
      priority: "P4",
      budgets: baseline,
    });
    expect(result.response).toMatchObject({
      status: "stopped",
      completed: true,
      used: 45 * min,
      wasBreached: true,
    });
  });
});
