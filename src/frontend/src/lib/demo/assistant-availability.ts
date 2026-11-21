import type { DemoPersona } from "./fixtures";

export const assistantModes = {
  unconfigured: "Chưa cấu hình",
  enabled: "Bật với cấu hình DEMO",
  disabled: "Tạm ngừng",
} as const;
export type AssistantSettingsDraft = {
  mode: keyof typeof assistantModes;
  name: string;
  model: string;
};
export const assistantFailures = {
  none: "Bình thường",
  unavailable: "Trợ lý không khả dụng",
  quota: "Đã hết hạn mức DEMO",
  network: "Lỗi mạng DEMO",
} as const;
export type AssistantFailure = keyof typeof assistantFailures;

export function createAssistantAvailability(
  getActor: () => DemoPersona | null,
) {
  let current: AssistantSettingsDraft = {
    mode: "enabled",
    name: "Cấu hình mẫu",
    model: "Mô hình DEMO",
  };
  let epoch = 0;
  const listeners = new Set<() => void>();
  function validate(input: AssistantSettingsDraft) {
    const actor = getActor();
    if (!actor?.user.active || actor.user.role !== "ADMIN")
      return "Bạn không có quyền cấu hình trợ lý.";
    if (!Object.hasOwn(assistantModes, input.mode))
      return "Chọn trạng thái hợp lệ.";
    if (input.mode === "enabled" && (!input.name.trim() || !input.model.trim()))
      return "Nhập tên cấu hình và nhãn model DEMO trước khi bật.";
    if (input.name.length > 60 || input.model.length > 60)
      return "Nhãn cấu hình tối đa 60 ký tự.";
    return null;
  }
  return {
    getSnapshot: () => current,
    epoch: () => epoch,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    validate,
    save(input: AssistantSettingsDraft) {
      const problem = validate(input);
      if (problem) return problem;
      current = {
        mode: input.mode,
        name: input.name.trim(),
        model: input.model.trim(),
      };
      epoch++;
      listeners.forEach((listener) => listener());
      return null;
    },
  };
}
