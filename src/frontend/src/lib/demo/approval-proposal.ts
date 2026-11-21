import type { DemoPersona } from "./fixtures";
import { managesAutomation, workflowTeam } from "./automation-workflow";

const current = {
  assignee: "Minh Nguyễn",
  skills: "Mạng nội bộ · VPN",
  window: "10:00–11:30 · GMT+7",
  effort: "90 phút còn lại",
};

export function readApprovalProposal(actor: DemoPersona, missing: boolean) {
  if (!managesAutomation(actor)) return null;
  return {
    id: "PROP-DEMO-PROPOSED",
    team: workflowTeam,
    task: "Kiểm tra kết nối VPN · TKT-000127",
    source: missing ? null : "RUN-DEMO-PROPOSED · Workflow v3 · 09:45 GMT+7",
    reason: "Người đang phụ trách có lịch vắng trong khung xử lý.",
    current,
    proposed: {
      assignee: "Lan Trần",
      skills: missing
        ? null
        : "Mạng nội bộ · VPN · Xử lý sự cố truy cập từ xa và xác thực thiết bị",
      window: "10:15–11:45 · GMT+7",
      effort: "90 phút còn lại · đủ thời gian trước hạn",
    },
    lock: "Đang khóa phân công vì công việc đã bắt đầu.",
    deadline: "12:00 · GMT+7",
    handover: "Bàn giao kết quả kiểm tra thiết bị và bước xác thực còn lại.",
    sla: "Không đổi · hạn xử lý ticket 16:00 GMT+7.",
  };
}
