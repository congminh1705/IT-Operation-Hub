import type { Role } from "../api/types";

const intents = {
  create: { label: "Tạo yêu cầu", resource: "none", access: "all" },
  reply: { label: "Phản hồi ticket", resource: "ticket", access: "all" },
  note: { label: "Ghi chú nội bộ", resource: "ticket", access: "staff" },
  accept: {
    label: "Xác nhận kết quả yêu cầu",
    resource: "ticket",
    access: "all",
  },
  ticketState: {
    label: "Xử lý trạng thái ticket",
    resource: "ticket",
    access: "staff",
  },
  progress: {
    label: "Cập nhật tiến độ công việc",
    resource: "task",
    access: "staff",
  },
  assignment: {
    label: "Phân công ticket",
    resource: "ticket",
    access: "manager",
  },
  approval: {
    label: "Xem xét đề xuất điều phối",
    resource: "proposal",
    access: "manager",
  },
  asset: {
    label: "Quản lý vòng đời tài sản",
    resource: "asset",
    access: "manager",
  },
  admin: { label: "Quản trị người dùng", resource: "none", access: "admin" },
} as const;

export type AssistantIntent = keyof typeof intents;
export const assistantIntentOptions = Object.entries(intents);

export function assistantIntent(value: string, role: Role) {
  if (!Object.hasOwn(intents, value)) return { kind: "unsupported" } as const;
  const id = value as AssistantIntent;
  const entry = intents[id];
  if (
    (entry.access === "staff" && role === "REQUESTER") ||
    (entry.access === "manager" && role !== "ADMIN" && role !== "IT_MANAGER") ||
    (entry.access === "admin" && role !== "ADMIN")
  )
    return { kind: "denied" } as const;
  return { kind: "allowed", id, ...entry } as const;
}
