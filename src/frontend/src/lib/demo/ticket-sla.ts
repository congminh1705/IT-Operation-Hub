import type { Budgets, Priority } from "./sla-policy";
import type { TicketEvent } from "./ticket-detail";
import type { TicketRow } from "./ticket-list";

type State = TicketRow["state"];
export type TicketSlaSeed = {
  createdAt: number;
  state: State;
  stateAt: number;
};
export type DemoClock = {
  status: "running" | "risk" | "breached" | "paused" | "stopped";
  used: number;
  budget: number;
  wasBreached: boolean;
  completed: boolean;
};

const minute = 60_000;
const active = (state: State) =>
  state === "Đang chờ tiếp nhận" ||
  state === "Đã tiếp nhận" ||
  state === "Đang xử lý";
const terminal = (state: State) =>
  state === "Đã giải quyết" || state === "Hoàn tất" || state === "Đã hủy";

export function projectTicketSla({
  seed,
  events,
  firstResponseAt,
  now,
  priority,
  budgets,
}: {
  seed: TicketSlaSeed;
  events: readonly TicketEvent[];
  firstResponseAt: string | null;
  now: number;
  priority: Priority;
  budgets: Budgets;
}) {
  const normalized = events
    .map((event) => ({ ...event, timestamp: Date.parse(event.at) }))
    .filter((event) => event.timestamp <= now)
    .sort((a, b) => a.timestamp - b.timestamp || a.id.localeCompare(b.id));
  const transitions = [
    { at: seed.stateAt, state: seed.state },
    ...normalized.flatMap((event) =>
      event.state ? [{ at: event.timestamp, state: event.state }] : [],
    ),
  ];
  const responded = firstResponseAt ? Date.parse(firstResponseAt) : null;

  function elapsed(at: number) {
    let state: State = "Đang chờ tiếp nhận";
    let stateAt = seed.createdAt;
    let responseStop: number | null = null;
    let resolution = 0;
    for (const transition of transitions) {
      if (transition.at > at) break;
      if (active(state)) resolution += Math.max(0, transition.at - stateAt);
      if (terminal(transition.state)) {
        responseStop ??= transition.at;
      } else {
        responseStop = null;
      }
      state = transition.state;
      stateAt = transition.at;
    }
    if (active(state)) resolution += Math.max(0, at - stateAt);
    const responseEnd = Math.min(
      at,
      responded ?? Infinity,
      responseStop ?? Infinity,
    );
    return {
      state,
      response: Math.max(0, responseEnd - seed.createdAt),
      resolution,
      responseComplete: responded !== null && responded <= at,
    };
  }

  const previousBreaches = { response: false, resolution: false };
  for (const event of normalized) {
    if (!event.priorPriority) continue;
    const used = elapsed(event.timestamp);
    const previous = budgets[event.priorPriority];
    previousBreaches.response ||= used.response >= previous.response * minute;
    previousBreaches.resolution ||=
      used.resolution >= previous.resolution * minute;
  }

  const used = elapsed(now);
  const targets = budgets[priority];
  function clock(
    kind: "response" | "resolution",
    status: DemoClock["status"],
    completed: boolean,
  ): DemoClock {
    const budget = targets[kind] * minute;
    const consumed = used[kind];
    const breached = consumed >= budget;
    return {
      status:
        status === "running"
          ? breached
            ? "breached"
            : consumed >= budget * 0.8
              ? "risk"
              : "running"
          : status,
      used: consumed,
      budget,
      completed,
      wasBreached: previousBreaches[kind] || breached,
    };
  }

  return {
    response: clock(
      "response",
      used.responseComplete || terminal(used.state) ? "stopped" : "running",
      used.responseComplete,
    ),
    resolution: clock(
      "resolution",
      used.state === "Chờ bổ sung"
        ? "paused"
        : terminal(used.state)
          ? "stopped"
          : "running",
      used.state === "Đã giải quyết" || used.state === "Hoàn tất",
    ),
  };
}
