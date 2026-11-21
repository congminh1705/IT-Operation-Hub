import { attachmentError, maxAttachments } from "./ticket-attachments";

export const levels = ["low", "medium", "high"] as const;
export type Level = (typeof levels)[number];
const matrix = [
  ["P4", "P3", "P3"],
  ["P3", "P3", "P2"],
  ["P3", "P2", "P1"],
] as const;
export function derivePriority(impact: string, urgency: string) {
  const i = levels.findIndex((level) => level === impact),
    u = levels.findIndex((level) => level === urgency);
  return i < 0 || u < 0 ? undefined : matrix[i][u];
}
export type TicketDraft = {
  type: "incident" | "service";
  category: string;
  title: string;
  description: string;
  impact: Level;
  urgency: Level;
  priority: NonNullable<ReturnType<typeof derivePriority>>;
  asset: string;
  assetVersion?: number;
  onboarding?: {
    employees: string;
    configuration: string;
    quantity: number;
    deadline: string;
  };
  attachments: { name: string; size: number }[];
};
export type DraftResult =
  | { ok: true; draft: TicketDraft }
  | { ok: false; field: string; message: string };
export function readTicketDraft(
  data: FormData,
  categories: string[],
  assetOptions: readonly { id: string; version: number }[],
): DraftResult {
  const str = (key: string) => String(data.get(key) ?? "").trim();
  const fail = (field: string, message: string) =>
    ({ ok: false, field, message }) as const;
  const type = str("type"),
    category = str("category"),
    title = str("title"),
    description = str("description");
  const impact = str("impact"),
    urgency = str("urgency"),
    asset = str("asset");
  const priority = derivePriority(impact, urgency);
  if (type !== "incident" && type !== "service")
    return fail("type", "Chọn loại yêu cầu.");
  if (!categories.includes(category))
    return fail("category", "Chọn danh mục đang hoạt động.");
  if (title.length < 5 || title.length > 180)
    return fail("title", "Nhập tiêu đề từ 5 đến 180 ký tự.");
  if (description.length < 10 || description.length > 10000)
    return fail("description", "Nhập mô tả từ 10 đến 10.000 ký tự.");
  if (!priority)
    return fail(
      !levels.some((level) => level === impact) ? "impact" : "urgency",
      "Chọn mức ảnh hưởng và khẩn cấp hợp lệ.",
    );
  const selectedAsset = assetOptions.find((item) => item.id === asset);
  if (asset && !selectedAsset)
    return fail("asset", "Thiết bị không thuộc phạm vi được phép.");
  let onboarding: TicketDraft["onboarding"];
  if (type === "service" && str("onboarding") === "yes") {
    const employees = str("employees"),
      configuration = str("configuration"),
      quantity = Number(str("quantity")),
      deadline = str("deadline");
    if (!employees) return fail("employees", "Bổ sung danh sách nhân sự.");
    if (!configuration)
      return fail("configuration", "Bổ sung cấu hình hoặc mẫu thiết bị.");
    if (!Number.isSafeInteger(quantity) || quantity < 1)
      return fail("quantity", "Nhập số lượng nguyên dương.");
    if (
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(deadline) ||
      !Number.isFinite(Date.parse(deadline + "+07:00"))
    )
      return fail("deadline", "Nhập thời hạn bàn giao (GMT+7).");
    onboarding = {
      employees,
      configuration,
      quantity,
      deadline: deadline + "+07:00",
    };
  }
  const files = data
    .getAll("files")
    .filter((file): file is File => typeof file !== "string" && !!file.name);
  if (files.length > maxAttachments || files.some(attachmentError))
    return fail(
      "files",
      "Chọn tối đa 5 tệp PNG, JPEG, WebP hoặc PDF, mỗi tệp không quá 10 MB.",
    );
  return {
    ok: true,
    draft: {
      type,
      category,
      title,
      description,
      impact: impact as Level,
      urgency: urgency as Level,
      priority,
      asset,
      assetVersion: selectedAsset?.version,
      onboarding,
      attachments: files.map(({ name, size }) => ({ name, size })),
    },
  };
}
