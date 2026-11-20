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
  lockReason?: string;
  manualReason?: string;
  result?: string;
  history?: string[];
};
export type WorkProgressDraft = {
  action: "start" | "block" | "unblock" | "update" | "done";
  remaining: number;
  result: string;
  reason: string;
  version: number;
};
export function progressActions(row: WorkItem): WorkProgressDraft["action"][] {
  if (row.state === "ready") return ["start", "block"];
  if (row.state === "active") return ["update", "block", "done"];
  if (row.state === "blocked") return ["unblock"];
  return [];
}
export type WorkControlDraft = {
  action: "assign" | "lock" | "unlock";
  assignee: string;
  reason: string;
  exception: boolean;
  version: number;
};
export const workControlLabels = {
  assign: "Đổi người thực hiện",
  lock: "Khóa phân công",
  unlock: "Bỏ khóa phân công",
};
type AssignmentOptions = {
  teams: { id: string; members: string[]; active: boolean }[];
  people: { id: string; display_name: string }[];
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
      lockReason: "Giữ người phụ trách đã xác nhận trong kế hoạch DEMO.",
      manualReason: "Phân công thủ công cho người theo dõi bàn giao.",
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
  const historicalRows = structuredClone(rows);
  const visible = (
    row: WorkItem,
    persona: DemoPersona,
    memberships: readonly string[],
  ) =>
    persona.user.active &&
    persona.user.role !== "REQUESTER" &&
    (persona.user.role !== "TECHNICIAN" || memberships.includes(row.team));
  function validateProgress(
    persona: DemoPersona,
    memberships: readonly string[],
    id: string,
    draft: WorkProgressDraft,
  ) {
    const row = rows.find((item) => item.id === id);
    if (
      !row ||
      !visible(row, persona, memberships) ||
      (persona.user.role === "TECHNICIAN" && row.assigneeId !== persona.user.id)
    )
      return "Bạn không có quyền cập nhật công việc.";
    if (row.version !== draft.version)
      return "Phiên bản công việc đã thay đổi.";
    if (!progressActions(row).includes(draft.action))
      return "Thao tác không hợp lệ cho trạng thái hiện tại.";
    if (
      (draft.action === "start" ||
        draft.action === "unblock" ||
        draft.action === "done") &&
      row.dependencies.some(
        (id) => rows.find((item) => item.id === id)?.state !== "done",
      )
    )
      return "Công việc phụ thuộc chưa hoàn tất.";
    if (
      (draft.action === "block" ||
        draft.action === "unblock" ||
        persona.user.role !== "TECHNICIAN") &&
      draft.reason.trim().length < 10
    )
      return "Nhập lý do ít nhất 10 ký tự.";
    if (!Number.isSafeInteger(draft.remaining) || draft.remaining < 0)
      return "Thời gian còn lại phải là số phút nguyên không âm.";
    const availableIncrease = 120;
    if (draft.remaining > row.remaining + availableIncrease)
      return "Không đủ năng lực còn lại trong khung DEMO.";
    if (
      draft.action === "done" &&
      (draft.remaining !== 0 || !draft.result.trim())
    )
      return "Hoàn tất yêu cầu kết quả và thời gian còn lại bằng 0.";
    return null;
  }
  function assignmentChoices(row: WorkItem, options: AssignmentOptions) {
    const team = options.teams.find(
      (item) => item.active && item.id === row.team,
    );
    const eligibility = new Map([
      [tech.id, { verifiedSkill: true, availableMinutes: 180 }],
      [manager.id, { verifiedSkill: true, availableMinutes: 120 }],
    ]);
    return options.people.filter(
      (person) =>
        person.id !== row.assigneeId &&
        team?.members.includes(person.id) &&
        eligibility.get(person.id)?.verifiedSkill &&
        (eligibility.get(person.id)?.availableMinutes ?? 0) >= row.remaining,
    );
  }
  function validateControl(
    persona: DemoPersona,
    id: string,
    draft: WorkControlDraft,
    options: AssignmentOptions,
  ) {
    const row = rows.find((item) => item.id === id);
    if (
      !row ||
      !persona.user.active ||
      (persona.user.role !== "IT_MANAGER" && persona.user.role !== "ADMIN")
    )
      return "Bạn không có quyền điều phối công việc.";
    if (row.version !== draft.version)
      return "Phiên bản công việc đã thay đổi.";
    if (row.state === "done" || row.state === "cancelled")
      return "Công việc đã kết thúc.";
    if (draft.reason.trim().length < 10)
      return "Nhập lý do thủ công ít nhất 10 ký tự.";
    if (draft.action === "assign") {
      if (row.locked) return "Cần bỏ khóa phân công trước.";
      if (
        !assignmentChoices(row, options).some(
          (person) => person.id === draft.assignee,
        )
      )
        return "Người thực hiện không đủ điều kiện trong khung DEMO.";
      if (row.state === "active" && !draft.exception)
        return "Cần xác nhận ngoại lệ khi công việc đang thực hiện.";
    } else if ((draft.action === "lock") === row.locked)
      return "Trạng thái khóa đã thay đổi.";
    return null;
  }
  return {
    history(persona: DemoPersona, memberships: readonly string[]) {
      return historicalRows
        .filter((row) => visible(row, persona, memberships))
        .map((row) => structuredClone(row));
    },
    assignmentChoices,
    validateControl,
    applyControl(
      persona: DemoPersona,
      id: string,
      draft: WorkControlDraft,
      options: AssignmentOptions,
    ) {
      const error = validateControl(persona, id, draft, options);
      if (error) return error;
      const row = rows.find((item) => item.id === id)!;
      if (draft.action === "assign") {
        const person = assignmentChoices(row, options).find(
          (item) => item.id === draft.assignee,
        )!;
        row.assigneeId = person.id;
        row.assignee = person.display_name;
      } else {
        row.locked = draft.action === "lock";
        row.lockReason = row.locked ? draft.reason.trim() : undefined;
      }
      row.manualReason = draft.reason.trim();
      row.version++;
      row.history = [
        ...(row.history ?? []),
        persona.user.display_name +
          " · " +
          workControlLabels[draft.action] +
          " · " +
          row.manualReason,
      ];
      return null;
    },
    validateProgress,
    changeProgress(
      persona: DemoPersona,
      memberships: readonly string[],
      id: string,
      draft: WorkProgressDraft,
      simulateStale = false,
    ) {
      const error = validateProgress(persona, memberships, id, draft);
      if (error) return error;
      if (simulateStale)
        return "Phiên bản công việc đã thay đổi. Bản nháp được giữ lại.";
      const row = rows.find((item) => item.id === id)!;
      const previous = row.state;
      const next = {
        start: "active",
        block: "blocked",
        unblock: "ready",
        update: row.state,
        done: "done",
      } as const;
      row.state = next[draft.action];
      row.remaining = draft.remaining;
      if (draft.result.trim()) row.result = draft.result.trim();
      row.version++;
      row.history = [
        ...(row.history ?? []),
        persona.user.display_name +
          " · " +
          workStates[previous] +
          " → " +
          workStates[row.state] +
          (draft.reason ? " · " + draft.reason : ""),
      ];
      return null;
    },
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
