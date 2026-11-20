import { createDemoFixtures, type DemoPersona } from "./fixtures";
type Interval = readonly [number, number];
type WorkforceRecord = {
  version?: number;
  id: string;
  name: string;
  skills: { name: string; verifier: string | null }[];
  schedule: Interval | null;
  budget: number | null;
  absences: Interval[];
  allocations: {
    remaining: number;
    state: "active" | "ready" | "blocked" | "done" | "cancelled";
  }[];
};
const tech = createDemoFixtures().personas.TECHNICIAN.user;
const records: WorkforceRecord[] = [
  {
    id: tech.id,
    name: tech.display_name,
    skills: [
      { name: "Windows", verifier: "DEMO IT_MANAGER" },
      { name: "Thiết bị", verifier: "DEMO IT_MANAGER" },
    ],
    schedule: [540, 1020],
    budget: 360,
    absences: [],
    allocations: [
      { remaining: 120, state: "active" },
      { remaining: 60, state: "blocked" },
      { remaining: 0, state: "done" },
    ],
  },
  {
    id: "demo-02",
    name: "DEMO Kỹ thuật viên B",
    skills: [
      { name: "Mạng", verifier: "DEMO IT_MANAGER" },
      { name: "Ảo hóa", verifier: null },
    ],
    schedule: [540, 1020],
    budget: 360,
    absences: [
      [600, 780],
      [720, 840],
    ],
    allocations: [{ remaining: 120, state: "ready" }],
  },
  {
    id: "demo-03",
    name: "DEMO Kỹ thuật viên C",
    skills: [],
    schedule: null,
    budget: null,
    absences: [],
    allocations: [{ remaining: 60, state: "ready" }],
  },
];
const unallocated = [
  { id: "T18", title: "Kiểm tra ảnh triển khai DEMO", remaining: 60 },
];

export function absentMinutes(
  schedule: Interval,
  absences: readonly Interval[],
) {
  const [from, to] = schedule;
  const ranges = absences
    .map(([start, end]) => [Math.max(from, start), Math.min(to, end)] as const)
    .filter(([start, end]) => start < end)
    .sort(([a], [b]) => a - b);
  let cursor = from;
  let total = 0;
  for (const [start, end] of ranges) {
    total += Math.max(0, end - Math.max(start, cursor));
    cursor = Math.max(cursor, end);
  }
  return total;
}
function workforceRow(record: WorkforceRecord) {
  const { id, name, skills, schedule, budget, absences, allocations } = record;
  const scheduled = schedule ? schedule[1] - schedule[0] : null;
  const absent = schedule ? absentMinutes(schedule, absences) : null;
  const capacity =
    scheduled === null || budget === null || absent === null
      ? null
      : Math.min(budget, scheduled - absent);
  const load = allocations
    .filter((item) => item.state !== "done" && item.state !== "cancelled")
    .reduce((minutes, item) => minutes + item.remaining, 0);
  return {
    id,
    name,
    skills,
    schedule,
    budget,
    absences,
    scheduled,
    absent,
    capacity,
    load,
    free: capacity === null ? null : capacity - load,
  };
}
export function workforceProjection(persona: DemoPersona, source = records) {
  if (!persona.user.active || persona.scope.workforce === "none") return null;
  const management = persona.scope.workforce === "organization";
  const selected = management
    ? source
    : source.filter((record) => record.id === persona.user.id);
  return {
    management,
    rows: selected.map(workforceRow),
    unallocated: management ? unallocated : [],
  };
}

export type WorkforceChange = {
  person: string;
  kind: "absence" | "schedule" | "skill";
  start: string;
  end: string;
  budget: string;
  skill: string;
  note: string;
};
const affectedWork = [
  {
    person: tech.id,
    id: "T07",
    title: "Kiểm tra kết nối VPN",
    remaining: 60,
    window: [660, 720] as Interval,
  },
  {
    person: "demo-02",
    id: "T21",
    title: "Kiểm tra thiết bị DEMO",
    remaining: 120,
    window: [840, 960] as Interval,
  },
];
export type WorkforcePreview = {
  kind: "preview";
  name: string;
  before: string;
  after: string;
  affected: typeof affectedWork;
  change: WorkforceChange;
  version: number;
};
const error = (message: string) => ({ kind: "error" as const, message });
const parseTime = (value: string) =>
  /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
    ? Number(value.slice(0, 2)) * 60 + Number(value.slice(3))
    : NaN;
const clock = (minutes: number) =>
  String(Math.floor(minutes / 60)).padStart(2, "0") +
  ":" +
  String(minutes % 60).padStart(2, "0");
const windowLabel = (range: Interval) => range.map(clock).join("–");

export function createWorkforce() {
  const source = structuredClone(records);
  function preview(
    actor: DemoPersona,
    change: WorkforceChange,
  ): WorkforcePreview | ReturnType<typeof error> {
    if (
      !actor.user.active ||
      !["IT_MANAGER", "ADMIN"].includes(actor.user.role) ||
      actor.scope.workforce !== "organization"
    )
      return error("Bạn không có quyền xác minh hoặc cập nhật nhân sự.");
    const target = source.find((row) => row.id === change.person);
    if (!target) return error("Không tìm thấy nhân sự.");
    if (change.note.length > 2000) return error("Ghi chú quá dài.");
    let before: string;
    let after: string;
    const start = parseTime(change.start),
      end = parseTime(change.end);
    if (change.kind === "skill") {
      const skill = change.skill.trim();
      if (!skill || skill.length > 80) return error("Nhập kỹ năng hợp lệ.");
      const existing = target.skills.find(
        (item) =>
          item.name.toLocaleLowerCase("vi") === skill.toLocaleLowerCase("vi"),
      );
      before = existing?.verifier
        ? "Đã xác minh bởi " + existing.verifier
        : existing
          ? "Chưa xác minh"
          : "Chưa có kỹ năng";
      after = skill + " · Xác minh bởi " + actor.user.display_name;
    } else {
      if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end)
        return error("Giờ kết thúc phải sau giờ bắt đầu trong cùng ngày DEMO.");
      if (change.kind === "absence") {
        before = target.absences.length
          ? target.absences.map(windowLabel).join(", ")
          : "Chưa có lịch vắng";
        after = "Thêm lịch vắng " + windowLabel([start, end]) + " · GMT+7";
      } else {
        const budget = Number(change.budget);
        if (
          !change.budget.trim() ||
          !Number.isInteger(budget) ||
          budget < 0 ||
          budget > 1440
        )
          return error("Ngân sách phải là số phút nguyên từ 0 đến 1440.");
        before = target.schedule
          ? windowLabel(target.schedule) +
            " · " +
            (target.budget ?? "chưa có ngân sách") +
            " phút/ngày"
          : "Chưa có lịch";
        after = windowLabel([start, end]) + " · " + budget + " phút/ngày";
      }
    }
    const affected = affectedWork.filter(
      (task) =>
        task.person === target.id &&
        (change.kind === "skill" ||
          (change.kind === "absence"
            ? start < task.window[1] && end > task.window[0]
            : start > task.window[0] ||
              end < task.window[1] ||
              Number(change.budget) < task.remaining)),
    );
    return {
      kind: "preview",
      name: target.name,
      before,
      after,
      affected,
      change: { ...change },
      version: target.version ?? 1,
    };
  }
  return {
    preview,
    projection: (actor: DemoPersona) => workforceProjection(actor, source),
  };
}
