import type { Role } from "../api/types";
import type { DirectoryUser } from "./user-directory";

export type AccessChange =
  | { kind: "role"; role: Role }
  | { kind: "department"; department: string }
  | { kind: "lock"; emergency: boolean }
  | { kind: "unlock" };

const assignments = [
  {
    owner: "technician@demo.invalid",
    id: "TKT-000126",
    title: "Khôi phục máy trạm DEMO",
    state: "Đang xử lý",
    replacement: null,
  },
  {
    owner: "technician@demo.invalid",
    id: "TASK-DEMO-17",
    title: "Kiểm tra thiết bị dự phòng",
    state: "Chờ bổ sung",
    replacement: null,
  },
  {
    owner: "it_manager@demo.invalid",
    id: "TKT-000127",
    title: "Kiểm tra kết nối DEMO",
    state: "Đang xử lý",
    replacement: "technician@demo.invalid",
  },
] as const;

export function reviewAccessImpact(
  user: DirectoryUser,
  change: AccessChange,
  actorEmail: string | undefined,
  users: DirectoryUser[],
) {
  const current = {
    role: user.role,
    department: user.department,
    active: user.active,
  };
  const proposed = { ...current };
  if (change.kind === "role") proposed.role = change.role;
  if (change.kind === "department") proposed.department = change.department;
  if (change.kind === "lock" || change.kind === "unlock")
    proposed.active = change.kind === "unlock";
  const changed =
    current.role !== proposed.role ||
    current.department !== proposed.department ||
    current.active !== proposed.active;
  const blockers: string[] = [];
  const losesAccess =
    changed &&
    (change.kind === "lock" ||
      change.kind === "role" ||
      change.kind === "department");
  if (change.kind === "lock" && user.email === actorEmail)
    blockers.push("Không thể tự khóa tài khoản đang đăng nhập.");
  if (
    user.active &&
    user.role === "ADMIN" &&
    (!proposed.active || proposed.role !== "ADMIN") &&
    !users.some(
      (row) => row.email !== user.email && row.role === "ADMIN" && row.active,
    )
  )
    blockers.push("Phải giữ ít nhất một Admin đang hoạt động.");
  if (!changed) blockers.push("Chưa có thay đổi để xem trước.");
  const affected = losesAccess
    ? assignments
        .filter((item) => item.owner === user.email)
        .map((item) => ({
          ...item,
          candidate: users.find(
            (row) =>
              row.email === item.replacement &&
              row.active &&
              row.role !== "REQUESTER",
          )?.name,
        }))
    : [];
  const conflict = affected.some((item) => !item.candidate);
  if (conflict)
    blockers.push(
      "Có công việc đang xử lý hoặc chờ bổ sung chưa có người thay thế đủ điều kiện.",
    );
  return {
    current,
    proposed,
    affected,
    blockers,
    emergency: conflict && change.kind === "lock" && change.emergency,
    session:
      changed && change.kind === "unlock"
        ? ("no-restore" as const)
        : losesAccess
          ? ("revoke" as const)
          : ("unchanged" as const),
  };
}
