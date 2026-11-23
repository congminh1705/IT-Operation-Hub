import type { DemoPersona } from "./fixtures";

export type AuditScope = "business" | "administration";
export type AuditOutcome = "success" | "blocked";

const fixtures = [
  [
    "017",
    "business",
    "2026-11-20T09:30:00+07:00",
    "Điều phối IT",
    "TKT-000126",
    "Đổi trạng thái",
    "Mới",
    "Đang xử lý",
    "Xác nhận tiếp nhận",
    "success",
  ],
  [
    "016",
    "business",
    "2026-11-20T09:15:00+07:00",
    "Quản lý tài sản",
    "AST-000104",
    "Cập nhật tài sản",
    "Sẵn sàng",
    "Đang sử dụng",
    "Đã xác nhận bàn giao",
    "success",
  ],
  [
    "015",
    "administration",
    "2026-11-20T09:10:00+07:00",
    "Quản trị hệ thống",
    "SLA-001",
    "Điều chỉnh SLA",
    "Phản hồi 4 giờ",
    "Phản hồi 2 giờ",
    "Áp dụng mức ưu tiên cao",
    "success",
  ],
  [
    "014",
    "business",
    "2026-11-19T17:30:00+07:00",
    "Điều phối IT",
    "TKT-000127",
    "Đổi trạng thái",
    "Đang xử lý",
    "Đang xử lý",
    "Chuyển trạng thái ngoài quy trình",
    "blocked",
  ],
  [
    "013",
    "administration",
    "2026-11-19T17:05:00+07:00",
    "Quản trị hệ thống",
    "USR-004",
    "Cập nhật vai trò",
    "Kỹ thuật viên",
    "Quản lý IT",
    "Quyết định phân quyền đã duyệt",
    "success",
  ],
  [
    "012",
    "business",
    "2026-11-19T14:12:00+07:00",
    "Quản lý IT",
    "Lịch trực IT",
    "Phân ca",
    "Chưa phân ca",
    "Ca sáng",
    "Xác nhận lịch tuần",
    "success",
  ],
  [
    "011",
    "business",
    "2026-11-19T10:10:00+07:00",
    "Tự động hóa DEMO",
    "RULE-004",
    "Chạy chính sách",
    "Chờ xử lý",
    "Chờ xử lý",
    "Điều kiện áp dụng thay đổi",
    "blocked",
  ],
  [
    "010",
    "administration",
    "2026-11-19T08:30:00+07:00",
    "Quản trị hệ thống",
    "SLA-002",
    "Điều chỉnh SLA",
    "Đang áp dụng",
    "Đang áp dụng",
    "Cần phê duyệt cấu hình",
    "blocked",
  ],
  [
    "009",
    "business",
    "2026-11-18T15:00:00+07:00",
    "Điều phối IT",
    "TKT-000129",
    "Đổi trạng thái",
    "Đang xử lý",
    "Đã xử lý",
    "Đã xác nhận kết quả",
    "success",
  ],
  [
    "008",
    "administration",
    "2026-11-18T13:00:00+07:00",
    "Quản trị hệ thống",
    "USR-007",
    "Cập nhật tài khoản",
    "Hoạt động",
    "Đã khóa",
    "Đã kết thúc quyền sử dụng DEMO",
    "success",
  ],
] as const;

export function auditRows(persona: DemoPersona, scope: AuditScope) {
  const { role, active } = persona.user;
  if (
    !active ||
    (role !== "ADMIN" && (role !== "IT_MANAGER" || scope !== "business"))
  )
    return [];
  return fixtures
    .filter((row) => row[1] === scope)
    .map(
      ([id, , at, actor, target, action, before, after, reason, outcome]) => ({
        id: `AUD-${id}`,
        at,
        actor,
        target,
        action,
        before,
        after,
        reason,
        outcome,
      }),
    )
    .sort((a, b) => b.at.localeCompare(a.at) || a.id.localeCompare(b.id));
}
