import type { UserView } from "../api/types";

export type CatalogKind = "departments" | "categories";
type CatalogRecord = {
  id: string;
  label: string;
  code: string;
  active: boolean;
};
const fixtures = {
  departments: [
    ["dept-acc", "Kế toán", "ACC"],
    ["dept-hr", "Nhân sự", "HR"],
    ["dept-it", "IT", "IT"],
    ["dept-sales", "Kinh doanh", "SALES"],
  ],
  categories: [
    ["category-device", "Thiết bị", "DEVICE"],
    ["category-network", "Mạng & kết nối", "NETWORK"],
    ["category-account", "Tài khoản", "ACCOUNT"],
  ],
} as const;
const references = {
  departments: { recordId: "dept-acc", reference: "TKT-000123" },
  categories: { recordId: "category-account", reference: "TKT-000125" },
} as const;
const normalize = (value: string) =>
  value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("vi");

export function createOrganizationCatalog(
  getActor: () => UserView | undefined,
) {
  const initial = (kind: CatalogKind): CatalogRecord[] =>
    fixtures[kind].map(([id, label, code]) => ({
      id,
      label,
      code,
      active: true,
    }));
  const records = {
    departments: initial("departments"),
    categories: initial("categories"),
  };
  const admin = () => {
    const actor = getActor();
    return actor?.active && actor.role === "ADMIN";
  };
  const denied = {
    ok: false,
    error: "Bạn không có quyền sửa cấu hình.",
  } as const;
  return {
    activeLabels(kind: CatalogKind) {
      return getActor()?.active
        ? records[kind]
            .filter((record) => record.active)
            .map((record) => record.label)
        : [];
    },
    list(kind: CatalogKind) {
      return admin() ? records[kind].map((record) => ({ ...record })) : [];
    },
    history(kind: CatalogKind) {
      if (!admin()) return null;
      const { reference, recordId } = references[kind];
      const record = records[kind].find((row) => row.id === recordId);
      return record ? { reference, record: { ...record } } : null;
    },
    save(
      kind: CatalogKind,
      input: { id?: string; label: string; code: string },
    ) {
      if (!admin()) return denied;
      const label = input.label.normalize("NFC").trim().replace(/\s+/g, " ");
      const code = input.code.trim().toUpperCase();
      const rows = records[kind];
      const current = rows.find((row) => row.id === input.id);
      if (input.id && !current?.active)
        return { ok: false, error: "Bản ghi không còn hoạt động." } as const;
      if (!label || [...label].length > 120)
        return {
          ok: false,
          error: "Nhập tên từ 1 đến 120 ký tự.",
          field: "label",
        } as const;
      if (
        !current &&
        kind === "departments" &&
        !/^[A-Z0-9_-]{1,20}$/.test(code)
      )
        return {
          ok: false,
          error:
            "Nhập mã từ 1 đến 20 ký tự gồm A–Z, số, dấu gạch ngang hoặc gạch dưới.",
          field: "code",
        } as const;
      if (
        rows.some(
          (row) =>
            row.id !== input.id && normalize(row.label) === normalize(label),
        )
      )
        return { ok: false, error: "Tên đã tồn tại.", field: "label" } as const;
      if (
        !current &&
        kind === "departments" &&
        rows.some((row) => row.code === code)
      )
        return { ok: false, error: "Mã đã tồn tại.", field: "code" } as const;
      if (current) current.label = label;
      else
        rows.push({
          id: crypto.randomUUID(),
          label,
          code: kind === "departments" ? code : "",
          active: true,
        });
      return { ok: true } as const;
    },
    deactivate(kind: CatalogKind, id: string) {
      if (!admin()) return denied;
      const record = records[kind].find((row) => row.id === id);
      if (!record?.active)
        return { ok: false, error: "Bản ghi không còn hoạt động." } as const;
      record.active = false;
      return { ok: true } as const;
    },
  };
}
export type OrganizationCatalog = ReturnType<typeof createOrganizationCatalog>;
