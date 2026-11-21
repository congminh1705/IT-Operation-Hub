import { createDemoFixtures, type DemoPersona } from "./fixtures";
import { scopedTicketRows, type TicketRow } from "./ticket-list";

export const assetStates = {
  assigned: "Đang sử dụng",
  stock: "Trong kho",
  repair: "Đang sửa chữa",
  retired: "Ngừng sử dụng",
} as const;
export type AssetState = keyof typeof assetStates;
export const assetTypes = [
  "Laptop",
  "Màn hình",
  "Máy in",
  "Thiết bị mạng",
] as const;
export type AssetMetadata = {
  code: string;
  serial: string;
  type: string;
  model: string;
  purchased: string;
  warranty: string;
  notes: string;
};
const people = createDemoFixtures().personas;
const requester = people.REQUESTER.user.id;
const technician = people.TECHNICIAN.user.id;
type Asset = AssetMetadata & {
  id: string;
  version: number;
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
    version: 1,
    code: id,
    serial: "DEMO-" + id,
    type,
    model,
    holder,
    state,
    ticketIds,
    purchased: "2025-11-30",
    warranty: "2026-11-30",
    notes: "",
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
  let sequence = 1;

  function validateMetadata(
    actor: DemoPersona,
    id: string | null,
    version: number,
    input: AssetMetadata,
  ) {
    if (!managesAssets(actor))
      return { error: "Bạn không có quyền sửa tài sản." } as const;
    const existing = records.find((row) => row.id === id);
    if (id && existing?.version !== version)
      return {
        error: "Tài sản đã thay đổi. Mở lại form để kiểm tra.",
      } as const;
    const fields = {
      code: input.code.trim().toUpperCase(),
      serial: input.serial.trim(),
      type: input.type,
      model: input.model.trim(),
      purchased: input.purchased,
      warranty: input.warranty,
      notes: input.notes.trim(),
    };
    if (!/^[A-Z0-9-]{1,32}$/.test(fields.code))
      return { error: "Nhập mã tài sản hợp lệ." } as const;
    if (!assetTypes.some((type) => type === fields.type))
      return { error: "Chọn loại tài sản hợp lệ." } as const;
    if (
      fields.serial.length > 80 ||
      fields.model.length > 120 ||
      fields.notes.length > 500
    )
      return { error: "Thông tin vượt giới hạn độ dài." } as const;
    const validDate = (value: string) =>
      !value ||
      (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
        Number.isFinite(Date.parse(value)) &&
        new Date(value).toISOString().slice(0, 10) === value);
    if (
      !validDate(fields.purchased) ||
      !validDate(fields.warranty) ||
      (fields.purchased &&
        fields.warranty &&
        fields.purchased > fields.warranty)
    )
      return {
        error: "Ngày mua hoặc ngày hết bảo hành không hợp lệ.",
      } as const;
    if (records.some((row) => row.id !== id && row.code === fields.code))
      return { error: "Mã tài sản đã tồn tại." } as const;
    if (
      fields.serial &&
      records.some(
        (row) =>
          row.id !== id &&
          row.serial.toLowerCase() === fields.serial.toLowerCase(),
      )
    )
      return { error: "Serial đã tồn tại." } as const;
    return { fields, existing } as const;
  }

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
  return {
    list,
    validateMetadata: (
      actor: DemoPersona,
      id: string | null,
      version: number,
      input: AssetMetadata,
    ) => validateMetadata(actor, id, version, input).error,
    saveMetadata(
      actor: DemoPersona,
      id: string | null,
      version: number,
      input: AssetMetadata,
    ) {
      const result = validateMetadata(actor, id, version, input);
      if ("error" in result) return result;
      if (result.existing) {
        Object.assign(result.existing, result.fields, { version: version + 1 });
        return { id: result.existing.id } as const;
      }
      const newId = "ASSET-" + sequence++;
      records.push({
        ...seed(
          newId,
          result.fields.type,
          result.fields.model,
          null,
          "stock",
          [],
        ),
        ...result.fields,
      });
      return { id: newId } as const;
    },
  };
}
