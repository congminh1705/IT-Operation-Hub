import type { UserView } from "../api/types";

export const priorities = ["P1", "P2", "P3", "P4"] as const;
export type Priority = (typeof priorities)[number];
export type Budget = { response: number; resolution: number };
export type Budgets = Record<Priority, Budget>;
export type BudgetDraft = Record<
  Priority,
  { response: string; resolution: string }
>;
type Version = {
  number: number;
  budgets: Budgets;
  reason: string;
  actor: string;
  savedAt: string;
};
const baseline: Budgets = {
  P1: { response: 15, resolution: 120 },
  P2: { response: 30, resolution: 240 },
  P3: { response: 60, resolution: 480 },
  P4: { response: 240, resolution: 1440 },
};
type Check =
  | { ok: true; budgets: Budgets; reason: string }
  | {
      ok: false;
      error: string;
      priority?: Priority;
      field?: "response" | "resolution" | "reason";
    };

export function createSlaPolicy(getActor: () => UserView | undefined) {
  const versions: Version[] = [
    {
      number: 3,
      budgets: structuredClone(baseline),
      reason: "Cấu hình mẫu DEMO",
      actor: "Admin DEMO",
      savedAt: "2026-11-09T03:00:00Z",
    },
    {
      number: 2,
      budgets: structuredClone(baseline),
      reason: "Phiên bản lịch sử DEMO",
      actor: "Admin DEMO",
      savedAt: "2026-11-01T03:00:00Z",
    },
  ];
  const current = () => versions[0];
  const existingTicket = {
    id: "TKT-000125",
    priority: "P3" as const,
    version: 3,
    ...baseline.P3,
  };
  const admin = () => {
    const actor = getActor();
    return actor?.active && actor.role === "ADMIN" ? actor : undefined;
  };
  function preview(base: number, draft: BudgetDraft, reason: string): Check {
    if (!admin())
      return { ok: false, error: "Bạn không có quyền cập nhật SLA." };
    if (base !== current().number)
      return {
        ok: false,
        error:
          "Phiên bản hiện hành đã thay đổi. Mở lại bộ chỉnh sửa trước khi lưu.",
      };
    const budgets = structuredClone(current().budgets);
    let changed = false;
    for (const priority of priorities)
      for (const field of ["response", "resolution"] as const) {
        const raw = draft[priority][field].trim();
        const value = Number(raw);
        if (!/^\d+$/.test(raw) || !Number.isSafeInteger(value) || value <= 0)
          return {
            ok: false,
            error: `${priority}: nhập số phút nguyên lớn hơn 0.`,
            priority,
            field,
          };
        changed ||= value !== budgets[priority][field];
        budgets[priority][field] = value;
      }
    if (!reason.trim())
      return { ok: false, error: "Nhập lý do thay đổi.", field: "reason" };
    if (!changed)
      return { ok: false, error: "Chưa có thay đổi ngân sách để lưu." };
    return { ok: true, budgets, reason: reason.trim() };
  }
  return {
    snapshot(priority: Priority) {
      const active = current();
      return { version: active.number, ...active.budgets[priority] };
    },
    read() {
      if (!admin()) return null;
      const active = current();
      return {
        current: structuredClone(active),
        history: versions.map(({ number, reason, actor, savedAt }) => ({
          number,
          reason,
          actor,
          savedAt,
        })),
        existingTicket: { ...existingTicket },
        newTicket: {
          priority: "P3" as const,
          version: active.number,
          ...active.budgets.P3,
        },
      };
    },
    preview,
    save(base: number, draft: BudgetDraft, reason: string): Check {
      const result = preview(base, draft, reason);
      const actor = admin();
      if (!result.ok || !actor) return result;
      versions.unshift({
        number: base + 1,
        budgets: result.budgets,
        reason: result.reason,
        actor: actor.display_name,
        savedAt: new Date().toISOString(),
      });
      return result;
    },
  };
}
