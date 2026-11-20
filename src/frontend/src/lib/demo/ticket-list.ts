import type { DemoPersona } from "./fixtures";
import { createDemoFixtures } from "./fixtures";

const people = createDemoFixtures().personas;
const teams = {
  support: "IT Support",
  infrastructure: "Infrastructure",
  field: "Field DEMO",
};
export const ticketStates = [
  "Đang chờ tiếp nhận",
  "Đang xử lý",
  "Chờ bổ sung",
  "Hoàn tất",
] as const;
export const ticketPriorities = ["P1", "P2", "P3", "P4"] as const;
const categories = ["Thiết bị", "Mạng & kết nối", "Tài khoản"];
const titles = [
  "Cài đặt VPN cho laptop làm việc",
  "Không mở được phần mềm kế toán",
  "Kiểm tra màn hình làm việc",
  "Cài lại driver máy in",
  "Cập nhật quyền truy cập",
  "Kiểm tra kết nối mạng",
];
const rows = Array.from({ length: 26 }, (_, i) => {
  const author =
    i < 4
      ? people.REQUESTER
      : i < 6
        ? people.TECHNICIAN
        : i % 2
          ? people.IT_MANAGER
          : people.ADMIN;
  const teamId = i < 16 ? "support" : i < 22 ? "infrastructure" : "field";
  return {
    id: `TKT-${String(126 + i).padStart(6, "0")}`,
    title:
      titles[i % titles.length] +
      (i >= titles.length ? ` · DEMO ${i + 1}` : ""),
    requesterId: author.user.id,
    requester: author.user.display_name,
    teamId,
    team: teams[teamId],
    assignee: i % 4 === 0 ? "Chưa phân công" : "DEMO TECHNICIAN",
    state: ticketStates[i % 4],
    priority: ticketPriorities[i % 4],
    category: categories[i % 3],
    updated: `2026-11-${String(19 - Math.floor(i / 3)).padStart(2, "0")}`,
    sla: i % 4 === 0 ? "Phản hồi · Đang chạy" : "Giải quyết · Đang theo dõi",
  };
});
export type TicketRow = (typeof rows)[number];
export const normalizeTicketText = (value: string) =>
  value
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d");
export function scopedTicketRows(
  persona: DemoPersona,
  scope: "mine" | "work",
  memberships: string[],
  unavailable = false,
) {
  if (
    !persona.user.active ||
    (scope === "work" && persona.scope.tickets === "mine")
  )
    return { kind: "forbidden" } as const;
  if (unavailable) return { kind: "error" } as const;
  return {
    kind: "success",
    rows: rows
      .filter((row) => {
        if (scope === "mine") return row.requesterId === persona.user.id;
        return (
          persona.scope.tickets === "organization" ||
          memberships.includes(row.teamId)
        );
      })
      .map((row) => ({ ...row })),
  } as const;
}
