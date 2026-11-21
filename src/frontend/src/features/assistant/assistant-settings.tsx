"use client";

import { useState } from "react";
import { useSession } from "@/features/auth/session";
import { Feedback } from "@/components/feedback/feedback";
import {
  assistantModes,
  type AssistantSettingsDraft,
} from "@/lib/demo/assistant-availability";
import "../automation/automation.css";

export function AssistantSettings({ onClose }: { onClose?: () => void }) {
  const { store, persona } = useSession();
  const availability = store.assistantAvailability;
  const [draft, setDraft] = useState(availability.getSnapshot);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  if (persona?.user.role !== "ADMIN") return <Feedback kind="forbidden" />;

  function update<K extends keyof AssistantSettingsDraft>(
    key: K,
    value: AssistantSettingsDraft[K],
  ) {
    setDraft((valueBefore) => ({ ...valueBefore, [key]: value }));
    setPreview(false);
    setSaved(false);
    setError("");
  }
  function submit() {
    const problem = preview
      ? availability.save(draft)
      : availability.validate(draft);
    setError(problem ?? "");
    if (problem) return;
    setSaved(preview);
    setPreview(!preview);
  }

  return (
    <section
      className="automation automation-panel"
      aria-label="Cấu hình trợ lý AI"
    >
      <h2>Khả năng sử dụng trợ lý</h2>
      <p>
        DEMO · Chưa kết nối nhà cung cấp. Các biểu mẫu thủ công vẫn sử dụng được
        theo quyền.
      </p>
      <form
        className="automation-form"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <label>
          Trạng thái trợ lý
          <select
            value={draft.mode}
            onChange={(event) =>
              update(
                "mode",
                event.target.value as AssistantSettingsDraft["mode"],
              )
            }
          >
            {Object.entries(assistantModes).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tên cấu hình
          <input
            maxLength={60}
            value={draft.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </label>
        <label>
          Model hiển thị
          <input
            maxLength={60}
            value={draft.model}
            onChange={(event) => update("model", event.target.value)}
          />
        </label>
        <p>
          Tên cấu hình và model là nhãn mô phỏng. Không nhập khóa API hoặc bí
          mật.
        </p>
        {error && <p role="alert">{error}</p>}
        {saved && <p role="status">Đã lưu cấu hình DEMO.</p>}
        {preview && (
          <p role="status">Xem trước · {assistantModes[draft.mode]}</p>
        )}
        <div className="automation-actions">
          <button type="submit" className="ui-button">
            {preview ? "Xác nhận lưu" : "Xem trước cấu hình"}
          </button>
          {onClose && (
            <button
              type="button"
              className="ui-button"
              data-variant="secondary"
              onClick={onClose}
            >
              Về hội thoại
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
