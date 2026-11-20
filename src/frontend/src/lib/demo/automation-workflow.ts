import type { DemoPersona } from "./fixtures";
export type WorkflowStep = {
  id: string;
  title: string;
  effort: number;
  dependencies: string[];
  source: string;
};
export const workflowTeam = "support";
export function managesAutomation(persona: DemoPersona) {
  return (
    persona.user.active &&
    (persona.user.role === "IT_MANAGER" || persona.user.role === "ADMIN")
  );
}
const template: WorkflowStep[] = [
  {
    id: "T01",
    title: "Xác minh nhu cầu",
    effort: 30,
    dependencies: [],
    source: "Mẫu onboarding DEMO",
  },
  {
    id: "T02",
    title: "Kiểm tra và chuẩn bị thiết bị",
    effort: 60,
    dependencies: ["T01"],
    source: "Danh mục thiết bị DEMO",
  },
  {
    id: "T03",
    title: "Bàn giao và xác nhận",
    effort: 30,
    dependencies: ["T02"],
    source: "Checklist bàn giao DEMO",
  },
];
export function validateWorkflow(steps: WorkflowStep[]) {
  const ids = new Set(steps.map((step) => step.id));
  if (
    !steps.length ||
    ids.size !== steps.length ||
    steps.some((step) => !step.title.trim() || !step.source.trim())
  )
    return "Bổ sung tên, nguồn và mã bước duy nhất.";
  if (
    steps.some((step) => !Number.isSafeInteger(step.effort) || step.effort <= 0)
  )
    return "Công sức phải là số phút nguyên dương.";
  if (steps.some((step) => step.dependencies.some((id) => !ids.has(id))))
    return "Phụ thuộc tham chiếu bước không tồn tại.";
  const visited = new Set<string>();
  while (visited.size < steps.length) {
    const ready = steps.filter(
      (step) =>
        !visited.has(step.id) &&
        step.dependencies.every((id) => visited.has(id)),
    );
    if (!ready.length) return "Quy trình có chu trình phụ thuộc.";
    for (const step of ready) visited.add(step.id);
  }
  return null;
}
export function createWorkflowStore() {
  const versions = [{ number: 3, steps: structuredClone(template) }];
  return {
    read(persona: DemoPersona, teams: readonly string[]) {
      if (
        !persona.user.active ||
        (!managesAutomation(persona) &&
          !(persona.user.role === "TECHNICIAN" && teams.includes(workflowTeam)))
      )
        return [];
      return (managesAutomation(persona) ? versions : versions.slice(0, 1)).map(
        (version) => ({
          number: version.number,
          steps: version.steps.map((step) => ({
            ...step,
            dependencies: [...step.dependencies],
            source: managesAutomation(persona) ? step.source : "",
          })),
        }),
      );
    },
    publish(persona: DemoPersona, base: number, steps: WorkflowStep[]) {
      if (!managesAutomation(persona))
        return "Bạn không có quyền công bố quy trình.";
      if (base !== versions[0].number) return "Phiên bản gốc đã thay đổi.";
      const error = validateWorkflow(steps);
      if (error) return error;
      versions.unshift({ number: base + 1, steps: structuredClone(steps) });
      return null;
    },
  };
}
