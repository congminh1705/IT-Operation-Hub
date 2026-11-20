import type { DemoPersona } from "./fixtures";
import { managesAutomation, workflowTeam } from "./automation-workflow";
export const runLabels = {
  none: "Chưa có lượt chạy",
  disabled: "Chính sách đã tắt",
  normal: "Luồng thường đã thực thi",
  queued: "Đang chờ thực thi",
  proposed: "Đã đề xuất",
  approved: "Đã phê duyệt",
  failed: "Thực thi thất bại",
  outside: "Nhóm ngoài phạm vi",
} as const;
export type RunCase = keyof typeof runLabels;
export function createAutomationActivity(isEnabled: (team: string) => boolean) {
  let retried = false;
  function cases(actor: DemoPersona, teams: readonly string[]) {
    if (
      !actor.user.active ||
      (!managesAutomation(actor) &&
        (actor.user.role !== "TECHNICIAN" || !teams.includes(workflowTeam)))
    )
      return [];
    return (Object.keys(runLabels) as RunCase[]).filter(
      (id) => id !== "outside" || managesAutomation(actor),
    );
  }
  function read(actor: DemoPersona, teams: readonly string[], id: RunCase) {
    if (!cases(actor, teams).includes(id)) return null;
    const team = id === "outside" ? "field" : workflowTeam;
    const policyCheck = id === "disabled" || !isEnabled(team);
    const state =
      id === "failed" && retried
        ? "queued"
        : id === "outside"
          ? "proposed"
          : id;
    const occurred = id !== "none" && id !== "disabled";
    const proposal = [
      "normal",
      "proposed",
      "approved",
      "failed",
      "outside",
    ].includes(id);
    const approved = id === "approved" || id === "failed";
    return {
      id,
      state,
      team: team === workflowTeam ? "IT Support" : "Field DEMO",
      runId: occurred ? "RUN-DEMO-" + id.toUpperCase() : null,
      source: occurred
        ? "Ticket đã tiếp nhận · " +
          (id === "outside" ? "TKT-000150" : "TKT-000127") +
          " · Workflow v3"
        : null,
      event: occurred ? "Sự kiện tiếp nhận được ghi nhận trong fixture" : null,
      proposal,
      proposalId: proposal ? "PROP-DEMO-" + id.toUpperCase() : null,
      priorFailure:
        id === "failed" && retried
          ? "Phiên bản công việc thay đổi trong lần thực thi mẫu."
          : null,
      approved,
      committed: state === "normal",
      policyCheck,
      manualLock: id === "approved" || id === "failed",
      error:
        state === "failed"
          ? "Phiên bản công việc thay đổi trong lần thực thi mẫu."
          : null,
      retried: id === "failed" && retried,
      canRetry: state === "failed" && !policyCheck,
    };
  }
  return {
    cases,
    read,
    retry(actor: DemoPersona, teams: readonly string[], id: RunCase) {
      const result = read(actor, teams, id);
      if (!result?.canRetry)
        return "Không thể yêu cầu thử lại trong phạm vi hiện tại.";
      retried = true;
      return null;
    },
  };
}
