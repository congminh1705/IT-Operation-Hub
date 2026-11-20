import { createDemoFixtures, type DemoPersona } from "./fixtures";
type Interval = readonly [number, number];
type WorkforceRecord = {
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
export function workforceProjection(persona: DemoPersona) {
  if (!persona.user.active || persona.scope.workforce === "none") return null;
  const management = persona.scope.workforce === "organization";
  const selected = management
    ? records
    : records.filter((record) => record.id === persona.user.id);
  return {
    management,
    rows: selected.map(workforceRow),
    unallocated: management ? unallocated : [],
  };
}
