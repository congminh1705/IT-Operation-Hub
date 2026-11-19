import { reviewAccessImpact, type AccessChange } from "./access-impact";
import { createDemoFixtures } from "./fixtures";
import type { Role, UserView } from "../api/types";

export const departments = ["Kế toán", "IT", "Nhân sự", "Kinh doanh"] as const;
export const provisioningRequest = {
  id: "TKT-000123",
  name: "Nhân viên DEMO B",
  email: "demo-b@example.invalid",
  department: "Kế toán",
} as const;

export type ProvisioningDraft = {
  name: string;
  email: string;
  department: string;
  reference: string;
  role: Role;
};

export type DirectoryUser = Omit<ProvisioningDraft, "reference"> & {
  active: boolean;
};

type ProvisioningResult =
  | { kind: "success"; account: Omit<DirectoryUser, "active"> }
  | {
      kind: "error";
      field?: keyof ProvisioningDraft | "password";
      message: string;
    };

export function createUserDirectory(getActor: () => UserView | undefined) {
  const users: DirectoryUser[] = Object.values(
    createDemoFixtures().personas,
  ).map(({ user }) => ({
    name: user.display_name,
    email: user.email ?? "",
    role: user.role,
    active: user.active,
    department: user.role === "REQUESTER" ? "Kế toán" : "IT",
  }));
  users.push({
    name: "Nhân viên DEMO đã khóa",
    email: "locked@demo.invalid",
    role: "REQUESTER",
    active: false,
    department: "Kinh doanh",
  });
  const isAdmin = () => {
    const actor = getActor();
    return actor?.active && actor.role === "ADMIN";
  };
  function validate(
    draft: ProvisioningDraft,
    password: string,
  ): ProvisioningResult {
    if (!isAdmin())
      return { kind: "error", message: "Bạn không có quyền tạo tài khoản." };
    const name = draft.name.trim();
    const email = draft.email.trim().toLowerCase();
    const { department, role } = draft;
    if (!name || [...name].length > 120)
      return {
        kind: "error",
        field: "name",
        message: "Nhập họ tên từ 1 đến 120 ký tự.",
      };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return {
        kind: "error",
        field: "email",
        message: "Nhập email công việc hợp lệ.",
      };
    if (users.some((user) => user.email === email))
      return {
        kind: "error",
        field: "email",
        message: "Email công việc đã tồn tại.",
      };
    if (
      draft.reference.trim().toUpperCase() !== provisioningRequest.id ||
      email !== provisioningRequest.email ||
      department !== provisioningRequest.department
    )
      return {
        kind: "error",
        field: "reference",
        message:
          "Yêu cầu chưa được xác minh hoặc email/phòng ban không khớp với yêu cầu DEMO.",
      };
    if (role !== "REQUESTER")
      return {
        kind: "error",
        field: "role",
        message: "Fixture này chỉ xác minh vai trò Requester.",
      };
    if (!password.trim())
      return {
        kind: "error",
        field: "password",
        message: "Nhập mật khẩu ban đầu DEMO.",
      };
    return { kind: "success", account: { name, email, department, role } };
  }
  return {
    list: (): DirectoryUser[] =>
      isAdmin() ? users.map((user) => ({ ...user })) : [],
    reviewAccess(email: string, change: AccessChange) {
      if (!isAdmin()) return null;
      const user = users.find((row) => row.email === email);
      const actor = getActor();
      return user && actor
        ? reviewAccessImpact(user, change, actor.email, users)
        : null;
    },
    preview: validate,
    create(draft: ProvisioningDraft, password: string): ProvisioningResult {
      const result = validate(draft, password);
      if (result.kind === "success")
        users.push({ ...result.account, active: true });
      return result;
    },
  };
}
