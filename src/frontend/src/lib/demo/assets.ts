import { createDemoFixtures, type DemoPersona } from "./fixtures";
import { scopedTicketRows, type TicketRow } from "./ticket-list";

export const assetStates = {
  assigned: "Đang sử dụng",
  stock: "Trong kho",
  repair: "Đang sửa chữa",
  retired: "Ngừng sử dụng",
} as const;
export type AssetState = keyof typeof assetStates;
const people = createDemoFixtures().personas;
const requester = people.REQUESTER.user.id;
const technician = people.TECHNICIAN.user.id;
type Asset = {
  id: string;
  code: string;
  serial: string;
  type: string;
  model: string;
  purchased: string;
  warranty: string;
  holder: string | null;
  state: AssetState;
  history: {
    summary: string;
    date: string;
    holder: string | null;
    publicFor: string | null;
  }[];
  ticketIds: string[];
};

function seed(
  id: string,
  type: string,
  model: string,
  holder: string | null,
  state: AssetState,
  ticketIds: string[],
): Asset {
  return {
    id,
    code: id,
    serial: "DEMO-" + id,
    type,
    model,
    holder,
    state,
    ticketIds,
    purchased: "2025-11-30",
    warranty: "2026-11-30",
    history: [
      ...(holder
        ? [
            {
              summary: "Cấp phát thiết bị",
              date: "2026-08-12",
              holder,
              publicFor: holder,
            },
          ]
        : []),
      {
        summary: "Nhập kho",
        date: "2025-11-30",
        holder: null,
        publicFor: null,
      },
    ],
  };
}

export const managesAssets = (actor: DemoPersona) =>
  actor.user.active &&
  (actor.user.role === "IT_MANAGER" || actor.user.role === "ADMIN");

export function createAssets(ticketRows: () => TicketRow[]) {
  const records = [
    seed("LT-001", "Laptop", "Dell Latitude 5440", requester, "assigned", [
      "TKT-000126",
      "TKT-000130",
    ]),
    seed("MN-003", "Màn hình", "Dell P2425H", requester, "assigned", []),
    seed("LT-018", "Laptop", "Laptop dự phòng", null, "stock", ["TKT-000127"]),
    seed(
      "NW-004",
      "Thiết bị mạng",
      "Bộ chuyển mạch DEMO",
      technician,
      "assigned",
      [],
    ),
    seed("PR-008", "Máy in", "Máy in DEMO", null, "repair", []),
    seed("LT-009", "Laptop", "Laptop lưu hồ sơ", null, "retired", []),
  ];

  function list(actor: DemoPersona, teams: string[], scope: string) {
    if (!actor.user.active) return [];
    const own = scope === "mine" || actor.user.role === "REQUESTER";
    const mine = scopedTicketRows(actor, "mine", teams, false, ticketRows());
    const work = scopedTicketRows(actor, "work", teams, false, ticketRows());
    const tickets = new Map(
      [mine, work]
        .flatMap((result) => (result.kind === "success" ? result.rows : []))
        .map((row) => [row.id, row]),
    );
    const supportIds = new Set(
      work.kind === "success" ? work.rows.map((row) => row.id) : [],
    );
    return records
      .filter(
        (row) =>
          row.holder === actor.user.id ||
          (!own &&
            (managesAssets(actor) ||
              row.ticketIds.some((id) => supportIds.has(id)))),
      )
      .map(({ history, ticketIds, ...row }) => ({
        ...row,
        holderLabel:
          row.holder === actor.user.id
            ? actor.user.display_name
            : Object.values(people).find(
                (entry) => entry.user.id === row.holder,
              )?.user.display_name,
        history:
          actor.user.role === "REQUESTER"
            ? history
                .filter((entry) => entry.publicFor === actor.user.id)
                .map(({ summary, date }) => ({ summary, date }))
            : history.map(({ summary, date }) => ({ summary, date })),
        tickets: ticketIds.flatMap((id) => {
          const ticket = tickets.get(id);
          return ticket ? [{ id, title: ticket.title }] : [];
        }),
      }));
  }
  return { list };
}
