import type { DemoPersona } from "./fixtures";
import type { TicketRow } from "./ticket-list";

export type TicketEvent = {
  id: string;
  audience: "public" | "internal";
  kind: "message" | "history";
  actor: string;
  at: string;
  text: string;
  state?: TicketRow["state"];
  purpose?: "question" | "solution";
  priorPriority?: TicketRow["priority"];
};

export function canReadInternalTicket(
  persona: DemoPersona,
  row: TicketRow,
  memberships: readonly string[],
) {
  return (
    persona.user.active &&
    (persona.scope.tickets === "organization" ||
      (persona.scope.tickets === "team-and-mine" &&
        memberships.includes(row.teamId)))
  );
}

export function ticketFixtureEvents(row: TicketRow): TicketEvent[] {
  const event = (
    id: string,
    audience: TicketEvent["audience"],
    kind: TicketEvent["kind"],
    time: string,
    actor: string,
    text: string,
  ): TicketEvent => ({
    id,
    audience,
    kind,
    actor,
    at: `${row.updated}T${time}+07:00`,
    text,
  });
  const events = [
    event(
      "created",
      "public",
      "history",
      "09:00:00",
      row.requester,
      "Đã tạo yêu cầu.",
    ),
    event(
      "requester-message",
      "public",
      "message",
      "09:15:00",
      row.requester,
      "Sự cố vẫn xảy ra sau khi thử lại.",
    ),
    event(
      "team-message",
      "public",
      "message",
      "09:35:00",
      row.team,
      "Vui lòng gửi ảnh thông báo lỗi để IT kiểm tra.",
    ),
    event(
      "internal-note",
      "internal",
      "message",
      "09:40:00",
      row.team,
      "Ghi chú DEMO: đối chiếu cấu hình thiết bị trong nhóm.",
    ),
    event(
      "internal-history",
      "internal",
      "history",
      "09:40:00",
      row.team,
      "Đã ghi nhận kiểm tra cấu hình nội bộ.",
    ),
  ];
  if (row.state === "Đã giải quyết")
    events.push({
      ...event(
        "fixture-solution",
        "public",
        "message",
        "10:00:00",
        row.team,
        "IT đã kiểm tra và khôi phục thiết bị DEMO. Vui lòng thử lại.",
      ),
      purpose: "solution",
    });
  return row.state === "Đang chờ tiếp nhận" ? events.slice(0, 1) : events;
}

export function projectTicketEvents(
  events: readonly TicketEvent[],
  canReadInternal: boolean,
) {
  return events
    .filter((event) => event.audience === "public" || canReadInternal)
    .toSorted(
      (a, b) => Date.parse(a.at) - Date.parse(b.at) || a.id.localeCompare(b.id),
    );
}
