import type { SessionStore } from "@/features/auth/session-store";
import type { DemoPersona } from "./fixtures";
import { unfinishedTicket } from "./dashboard-metrics";
import { scopedTicketRows } from "./ticket-list";
import type { AssetState } from "./assets";

export const canReadOrganizationMetrics = (actor: DemoPersona) =>
  actor.user.active &&
  (actor.user.role === "ADMIN" || actor.user.role === "IT_MANAGER");
export const DAY_MS = 86_400_000;
const zone = "+07:00";
export function reportDay(at: number) {
  return new Date(at + 7 * 3_600_000).toISOString().slice(0, 10);
}
function dayStart(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return NaN;
  const at = Date.parse(day + "T00:00:00" + zone);
  return Number.isFinite(at) && reportDay(at) === day ? at : NaN;
}

export type ReportFilters = {
  from: string;
  to: string;
  team: string;
  at: number;
};
export function reportWindow({ from, to }: ReportFilters) {
  const start = dayStart(from),
    end = dayStart(to) + DAY_MS;
  return Number.isFinite(start) &&
    Number.isFinite(end) &&
    end > start &&
    end - start <= 31 * DAY_MS
    ? { start, end }
    : null;
}
export function reportFilters(
  search: { from?: unknown; to?: unknown; team?: unknown; at?: unknown },
  now: number,
): ReportFilters {
  const at =
    typeof search.at === "string" &&
    /^\d{13}$/.test(search.at) &&
    Number(search.at) <= now
      ? Number(search.at)
      : now;
  return {
    at,
    from:
      typeof search.from === "string"
        ? search.from
        : reportDay(at - 6 * DAY_MS),
    to: typeof search.to === "string" ? search.to : reportDay(at),
    team: typeof search.team === "string" ? search.team : "",
  };
}
export function warrantyPopulation<
  T extends { state: AssetState; warranty: string },
>(assets: readonly T[], at: number) {
  const start = dayStart(reportDay(at));
  const current = assets.filter((asset) => asset.state !== "retired");
  const bounds = current.map((asset) => ({
    asset,
    date: dayStart(asset.warranty),
  }));
  return {
    expiring: bounds
      .filter(({ date }) => date >= start && date < start + 31 * DAY_MS)
      .map(({ asset }) => asset),
    expired: bounds
      .filter(({ date }) => date < start)
      .map(({ asset }) => asset),
    unknown: bounds
      .filter(({ date }) => !Number.isFinite(date))
      .map(({ asset }) => asset),
  };
}

type Detail = NonNullable<ReturnType<SessionStore["tickets"]["detail"]>>;
type ReportTicket = Pick<Detail, "row" | "createdAt" | "sla">;
export function deriveTicketMetrics(
  details: readonly ReportTicket[],
  filters: ReportFilters,
) {
  const range = reportWindow(filters);
  const within = (at: number) => !!range && at >= range.start && at < range.end;
  const visible = details.filter(
    ({ row }) => !filters.team || row.teamId === filters.team,
  );
  const backlog = visible.filter(({ row }) => unfinishedTicket(row));
  const clocks = (ticket: ReportTicket) =>
    [ticket.sla.response, ticket.sla.resolution].filter(
      (clock) => !clock.completed && clock.status !== "stopped",
    );
  const isOverdue = (ticket: ReportTicket) =>
    clocks(ticket).some((clock) => clock.used >= clock.budget);
  const overdue = backlog.filter(isOverdue);
  const risk = backlog.filter(
    (ticket) =>
      !isOverdue(ticket) &&
      clocks(ticket).some((clock) => clock.used >= 0.8 * clock.budget),
  );
  const cohort = visible.filter((ticket) => within(ticket.createdAt));
  const resolved = visible.filter(
    (ticket) =>
      ticket.sla.latestResolution && within(ticket.sla.latestResolution.at),
  );
  const population = {
    MET01: backlog,
    MET02: backlog.filter(({ row }) => !row.assigneeId),
    MET03: risk,
    MET04: overdue,
    MET05: cohort,
    MET06: cohort,
    MET07: resolved,
    MET08: resolved,
    MET09: backlog,
    MET15: cohort.filter((ticket) => ticket.sla.historicalBreach),
  };
  const meanMinutes = resolved.length
    ? resolved.reduce(
        (sum, item) => sum + item.sla.latestResolution!.activeMs,
        0,
      ) /
      resolved.length /
      60_000
    : null;
  const days = range
    ? Array.from({ length: (range.end - range.start) / DAY_MS }, (_, i) => {
        const day = reportDay(range.start + i * DAY_MS);
        return {
          day,
          created: cohort.filter((item) => reportDay(item.createdAt) === day)
            .length,
          resolved: resolved.filter(
            (item) => reportDay(item.sla.latestResolution!.at) === day,
          ).length,
        };
      })
    : [];
  const group = (field: "state" | "priority" | "team") => {
    const counts = new Map<string, number>();
    for (const { row } of cohort) {
      const value = row[field] || "Chưa phân nhóm";
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return [...counts];
  };
  const workload = [...new Set(backlog.map(({ row }) => row.assignee))].map(
    (assignee) => {
      const rows = backlog.filter(({ row }) => row.assignee === assignee);
      return {
        assignee,
        total: rows.length,
        active: rows.filter(({ row }) => row.state === "Đang xử lý").length,
        pending: rows.filter(({ row }) => row.state === "Chờ bổ sung").length,
        overdue: rows.filter(isOverdue).length,
      };
    },
  );
  return {
    range,
    population,
    days,
    meanMinutes,
    workload,
    groups: {
      state: group("state"),
      priority: group("priority"),
      team: group("team"),
    },
  };
}
export type OrganizationTicketMetric = keyof ReturnType<
  typeof deriveTicketMetrics
>["population"];
export const orgTicketMetrics = [
  "MET01",
  "MET02",
  "MET03",
  "MET04",
  "MET05",
  "MET06",
  "MET07",
  "MET08",
  "MET09",
  "MET15",
] as const;
export function readOrganizationReport(
  store: SessionStore,
  actor: DemoPersona,
  filters: ReportFilters,
) {
  if (!canReadOrganizationMetrics(actor)) return null;
  const source = scopedTicketRows(
    actor,
    "work",
    [],
    false,
    store.tickets.rows(),
  );
  if (source.kind !== "success") return null;
  const details = source.rows.flatMap(({ id }) => {
    const detail = store.tickets.detail(actor, id, [], filters.at);
    return detail && detail.createdAt <= filters.at ? [detail] : [];
  });
  return {
    ...deriveTicketMetrics(details, filters),
    teams: [
      ...new Map(details.map(({ row }) => [row.teamId, row.team])).entries(),
    ],
    warranty: warrantyPopulation(
      store.assets.list(actor, [], "work"),
      filters.at,
    ),
  };
}
export function reportQuery(filters: ReportFilters) {
  const query = new URLSearchParams({
    from: filters.from,
    to: filters.to,
    at: String(filters.at),
  });
  if (filters.team) query.set("team", filters.team);
  return query;
}
export function metricTicketHref(
  id: OrganizationTicketMetric,
  filters: ReportFilters,
) {
  const params = reportQuery(filters);
  const team = params.get("team");
  params.delete("team");
  if (team) params.set("metricTeam", team);
  params.set("metric", id);
  params.set("scope", "work");
  return "/tickets?" + params;
}
