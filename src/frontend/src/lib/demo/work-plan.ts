import type { WorkItem } from "./work-board";
export type PlanVersion = "v3" | "v2" | "v1" | "invalid" | "cycle" | "stale";
export const planLabels: Record<PlanVersion, string> = {
  v3: "v3 · Đang hiệu lực",
  v2: "v2 · Lịch sử",
  v1: "v1 · Lịch sử",
  invalid: "DEMO · Phụ thuộc không hợp lệ",
  cycle: "DEMO · Chu trình",
  stale: "DEMO · Phiên bản đã thay đổi",
};
export function planRows(all: WorkItem[], version: PlanVersion) {
  const current = all.filter((row) => row.ticket === "TKT-000127");
  if (version === "v1")
    return current
      .filter((row) => row.id === "T07")
      .map((row) => ({
        ...row,
        title: "Xác minh nhu cầu cài VPN",
        dependencies: [],
      }));
  if (version === "v2")
    return current
      .filter((row) => row.id !== "T03")
      .map((row) => ({
        ...row,
        title:
          row.id === "T11"
            ? "Kiểm tra quyền truy cập các phần mềm nghiệp vụ liên phòng ban và công cụ hỗ trợ từ xa ở môi trường DEMO"
            : row.title,
      }));
  if (version === "invalid")
    return current.map((row) =>
      row.id === "T11" ? { ...row, dependencies: ["T99"] } : row,
    );
  if (version === "cycle")
    return current.map((row) =>
      row.id === "T07" ? { ...row, dependencies: ["T11"] } : row,
    );
  return current;
}
export function planLevels(rows: WorkItem[]) {
  const ids = new Set(rows.map((row) => row.id));
  if (rows.some((row) => row.dependencies.some((id) => !ids.has(id))))
    return { kind: "invalid" } as const;
  const resolved = new Set<string>();
  const levels: WorkItem[][] = [];
  while (resolved.size < rows.length) {
    const level = rows.filter(
      (row) =>
        !resolved.has(row.id) &&
        row.dependencies.every((id) => resolved.has(id)),
    );
    if (!level.length) return { kind: "cycle" } as const;
    levels.push(level);
    for (const row of level) resolved.add(row.id);
  }
  return { kind: "success", levels } as const;
}
