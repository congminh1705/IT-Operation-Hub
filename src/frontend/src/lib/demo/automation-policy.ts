import type { DemoPersona } from "./fixtures";
import { managesAutomation, workflowTeam } from "./automation-workflow";
export const policyScenarios = {
  active: "Có ủy quyền",
  missing: "Chưa có ủy quyền",
  expired: "Ủy quyền hết hạn",
  disabled: "Chính sách đã tắt",
  assistantOff: "Trợ lý tạm tắt",
} as const;
export type PolicyScenario = keyof typeof policyScenarios;
export type PolicyDraft = {
  enabled: boolean;
  team: string;
  workflow: number;
  priority: string;
  action: string;
  limit: number;
};
export const policyActions = {
  plan: "Lập kế hoạch",
  suggest: "Đề xuất phân công",
} as const;
const grant = {
  grantor: "DEMO IT_MANAGER",
  team: workflowTeam,
  priorities: ["P2", "P3", "P4"],
  actions: Object.keys(policyActions),
  limit: 5,
  expires: "30/11/2026 · GMT+7",
};
export function createAutomationPolicy() {
  const settings = new Map<
    PolicyScenario,
    { version: number; draft: PolicyDraft }
  >();
  function read(persona: DemoPersona, scenario: PolicyScenario) {
    if (!managesAutomation(persona)) return null;
    const grantStatus =
      scenario === "missing"
        ? "missing"
        : scenario === "expired"
          ? "expired"
          : "valid";
    const policy = settings.get(scenario) ?? {
      version: 1,
      draft: {
        enabled: scenario !== "disabled" && grantStatus === "valid",
        team: workflowTeam,
        workflow: 3,
        priority: "P3",
        action: "plan",
        limit: 3,
      },
    };
    return {
      draft: { ...policy.draft },
      version: policy.version,
      grant:
        grantStatus === "missing"
          ? null
          : {
              ...grant,
              expires:
                grantStatus === "expired"
                  ? "19/11/2026 · GMT+7"
                  : grant.expires,
            },
      grantStatus,
      assistant: scenario !== "assistantOff",
      allows:
        grantStatus === "valid" &&
        scenario !== "assistantOff" &&
        policy.draft.enabled,
    };
  }
  function validate(
    persona: DemoPersona,
    scenario: PolicyScenario,
    draft: PolicyDraft,
    version: number,
    published: number[],
  ) {
    const current = read(persona, scenario);
    if (!current) return "Bạn không có quyền chỉnh chính sách.";
    if (current.version !== version) return "Chính sách đã thay đổi.";
    if (draft.enabled && current.grantStatus !== "valid")
      return "Chỉ có thể bật khi có ủy quyền còn hiệu lực.";
    if (
      draft.team !== grant.team ||
      !published.includes(draft.workflow) ||
      !grant.priorities.includes(draft.priority) ||
      !grant.actions.includes(draft.action) ||
      !Number.isInteger(draft.limit) ||
      draft.limit < 1 ||
      draft.limit > grant.limit
    )
      return "Phạm vi hoặc giới hạn vượt ủy quyền DEMO.";
    return null;
  }
  return {
    read,
    validate,
    save(
      persona: DemoPersona,
      scenario: PolicyScenario,
      draft: PolicyDraft,
      version: number,
      published: number[],
    ) {
      const problem = validate(persona, scenario, draft, version, published);
      if (problem) return problem;
      settings.set(scenario, { version: version + 1, draft: { ...draft } });
      return null;
    },
  };
}
