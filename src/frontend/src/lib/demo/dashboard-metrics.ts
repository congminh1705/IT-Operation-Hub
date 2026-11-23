import type { DemoPersona } from "./fixtures";
import type { TicketRow } from "./ticket-list";

export const unfinishedTicket = (row: TicketRow) =>
  ["Đang chờ tiếp nhận", "Đã tiếp nhận", "Đang xử lý", "Chờ bổ sung"].includes(
    row.state,
  );

export function personalTicketMetric(
  actor: DemoPersona,
  teams: readonly string[],
  rows: readonly TicketRow[],
  metric: string,
) {
  if (!actor.user.active) return [];
  const unique = [...new Map(rows.map((row) => [row.id, row])).values()];
  if (metric === "MET11" && actor.user.role === "REQUESTER")
    return unique.filter(
      (row) =>
        row.requesterId === actor.user.id &&
        ["Chờ bổ sung", "Đã giải quyết"].includes(row.state),
    );
  if (actor.user.role !== "TECHNICIAN") return [];
  const queue = unique.filter(
    (row) => unfinishedTicket(row) && teams.includes(row.teamId),
  );
  if (metric === "MET13")
    return queue.filter((row) => row.assigneeId === actor.user.id);
  if (metric === "MET14") return queue.filter((row) => !row.assigneeId);
  return [];
}
