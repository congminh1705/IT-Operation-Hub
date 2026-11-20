import type { DemoPersona } from "./fixtures";
import type { TicketRow } from "./ticket-list";

export type LifecycleAction =
  | "accept"
  | "start"
  | "cancel"
  | "wait"
  | "resume"
  | "resolve"
  | "close"
  | "reopen";

export const lifecycleActions = {
  accept: { label: "Tiếp nhận yêu cầu", state: "Đã tiếp nhận" },
  start: { label: "Bắt đầu xử lý", state: "Đang xử lý" },
  cancel: { label: "Hủy yêu cầu", state: "Đã hủy" },
  wait: { label: "Chờ phản hồi", state: "Chờ bổ sung" },
  resume: { label: "Tiếp tục xử lý", state: "Đang xử lý" },
  resolve: { label: "Đề xuất giải quyết", state: "Đã giải quyết" },
  close: { label: "Xác nhận đóng", state: "Hoàn tất" },
  reopen: { label: "Mở lại yêu cầu", state: "Đang xử lý" },
} as const satisfies Record<
  LifecycleAction,
  { label: string; state: TicketRow["state"] }
>;

export function allowedLifecycleActions(
  row: TicketRow,
  actor: DemoPersona,
  internal: boolean,
  assignedEligible: boolean,
): LifecycleAction[] {
  const manager =
    actor.user.role === "IT_MANAGER" || actor.user.role === "ADMIN";
  const own = row.requesterId === actor.user.id;
  const canWork =
    internal &&
    assignedEligible &&
    (manager || row.assigneeId === actor.user.id);
  switch (row.state) {
    case "Đang chờ tiếp nhận":
      return [
        ...(internal ? ["accept" as const] : []),
        ...(manager || own ? ["cancel" as const] : []),
      ];
    case "Đã tiếp nhận":
      return [
        ...(assignedEligible &&
        internal &&
        (manager || row.assigneeId === actor.user.id)
          ? ["start" as const]
          : []),
        ...(manager ? ["cancel" as const] : []),
      ];
    case "Đang xử lý":
      return [
        ...(canWork ? (["wait", "resolve"] as const) : []),
        ...(manager ? ["cancel" as const] : []),
      ];
    case "Chờ bổ sung":
      return [
        ...(canWork ? ["resume" as const] : []),
        ...(manager ? ["cancel" as const] : []),
      ];
    case "Đã giải quyết":
      return [
        ...(own ? ["close" as const] : []),
        ...((manager || own) && assignedEligible ? ["reopen" as const] : []),
      ];
    case "Hoàn tất":
      return manager && assignedEligible ? ["reopen"] : [];
    default:
      return [];
  }
}

export function requiresCancellationReason(actor: DemoPersona) {
  return actor.user.role === "IT_MANAGER" || actor.user.role === "ADMIN";
}

export function lifecycleTextMinimum(
  action: LifecycleAction,
  actor: DemoPersona,
) {
  if (action === "wait" || action === "resolve") return 1;
  if (
    action === "resume" ||
    action === "reopen" ||
    (action === "cancel" && requiresCancellationReason(actor))
  )
    return 10;
  return 0;
}
