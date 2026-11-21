import type { DemoPersona } from "./fixtures";
import { readApprovalProposal } from "./approval-proposal";

export const decisionScenarios = {
  pending: "Chờ kết quả",
  succeeded: "Kết quả mẫu thành công",
  failed: "Kết quả mẫu thất bại",
  stale: "Phiên bản đã đổi",
  revoked: "Chính sách bị thu hồi",
  infeasible: "Ứng viên không còn khả thi",
} as const;

export type DecisionScenario = keyof typeof decisionScenarios;
export type Decision = "approved" | "rejected";

export const decisionErrors = {
  forbidden: "Bạn không còn quyền quyết định đề xuất.",
  reason: "Nhập lý do quyết định.",
  stale: "Phiên bản đề xuất đã thay đổi. Tải lại ảnh chụp để đánh giá lại.",
  revoked:
    "Chính sách điều phối đã bị thu hồi. Cần đánh giá lại quyền trước khi quyết định.",
  infeasible:
    "Thiếu bằng chứng hoặc khung lịch không còn phù hợp. Cần đánh giá lại nguồn lực.",
  decided: "Đề xuất đã có quyết định.",
} as const;

export function createApprovalDecisions(allowsTeam: (team: string) => boolean) {
  let record: { decision: Decision; reason: string } | null = null;
  let execution: "pending" | "succeeded" | "failed" = "pending";

  function read(actor: DemoPersona, scenario: DecisionScenario) {
    if (!readApprovalProposal(actor, false)) return null;
    return {
      version: scenario === "stale" ? 2 : 1,
      record,
      execution: record?.decision === "approved" ? execution : null,
    };
  }

  return {
    read,
    submit(
      actor: DemoPersona,
      input: {
        decision: Decision;
        reason: string;
        version: number;
        scenario: DecisionScenario;
        missing: boolean;
      },
    ): keyof typeof decisionErrors | null {
      const proposal = readApprovalProposal(actor, input.missing);
      const view = read(actor, input.scenario);
      if (!proposal || !view) return "forbidden";
      if (record) return "decided";
      const reason = input.reason.trim();
      if (!reason || reason.length > 500) return "reason";
      if (input.version !== view.version) return "stale";
      if (input.scenario === "revoked" || !allowsTeam(proposal.team))
        return "revoked";
      if (input.missing || input.scenario === "infeasible") return "infeasible";
      record = { decision: input.decision, reason };
      return null;
    },
    receiveExecutionFixture(actor: DemoPersona, scenario: DecisionScenario) {
      if (read(actor, scenario)?.execution !== "pending") return;
      if (scenario === "succeeded" || scenario === "failed")
        execution = scenario;
    },
  };
}
