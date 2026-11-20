import { createDemoFixtures, type DemoPersona } from "./fixtures";
export const workStates = {
  todo: "Cần làm",
  ready: "Sẵn sàng",
  active: "Đang thực hiện",
  blocked: "Bị chặn",
  done: "Hoàn tất",
  cancelled: "Đã hủy",
} as const;
export type WorkState = keyof typeof workStates;
export type WorkItem = {
  id: string;
  ticket: string;
  title: string;
  team: string;
  assigneeId: string;
  assignee: string;
  remaining: number;
  deadline: string;
  dependencies: string[];
  state: WorkState;
  locked: boolean;
  version: number;
};
const { personas } = createDemoFixtures();
export function createWorkBoard() {
  const tech = personas.TECHNICIAN.user;
  const manager = personas.IT_MANAGER.user;
  const base = {
    team: "support",
    assigneeId: tech.id,
    assignee: tech.display_name,
    remaining: 60,
    deadline: "2026-11-20T08:00:00Z",
    dependencies: [],
    locked: false,
    version: 1,
  };
  const rows: WorkItem[] = [
    {
      ...base,
      id: "T03",
      ticket: "TKT-000127",
      title: "Cài phần mềm cho nhân sự mới",
      state: "ready",
      remaining: 180,
      assigneeId: manager.id,
      assignee: manager.display_name,
      locked: true,
    },
    {
      ...base,
      id: "T09",
      ticket: "TKT-000128",
      title: "Kiểm tra màn hình Kế toán",
      state: "ready",
    },
    {
      ...base,
      id: "T02",
      ticket: "TKT-000128",
      title: "Kiểm tra laptop trong kho",
      state: "active",
    },
    {
      ...base,
      id: "T07",
      ticket: "TKT-000127",
      title: "Cài đặt và kiểm tra VPN",
      state: "active",
    },
    {
      ...base,
      id: "T11",
      ticket: "TKT-000127",
      title: "Kiểm tra truy cập phần mềm",
      state: "blocked",
      dependencies: ["T07"],
      remaining: 120,
    },
    {
      ...base,
      id: "T15",
      ticket: "TKT-000150",
      title: "Kiểm tra hạ tầng ngoài nhóm",
      state: "ready",
      team: "field",
      assigneeId: manager.id,
      assignee: manager.display_name,
    },
  ];
  return {
    list(persona: DemoPersona, memberships: readonly string[], scope: string) {
      if (!persona.user.active || persona.user.role === "REQUESTER") return [];
      return rows
        .filter(
          (row) =>
            persona.user.role !== "TECHNICIAN" ||
            (memberships.includes(row.team) &&
              (scope !== "mine" || row.assigneeId === persona.user.id)),
        )
        .map((row) => ({ ...row, dependencies: [...row.dependencies] }));
    },
  };
}
