"use client";

import { useState } from "react";
import { useSession } from "@/features/auth/session";
import { assetTypes, type AssetMetadata } from "@/lib/demo/assets";

const empty: AssetMetadata = {
  code: "",
  serial: "",
  type: "Laptop",
  model: "",
  purchased: "",
  warranty: "",
  notes: "",
};

const fields = [
  ["code", "Mã tài sản *", "text", 32],
  ["serial", "Serial", "text", 80],
  ["model", "Hãng / Model", "text", 120],
  ["purchased", "Ngày mua", "date", undefined],
  ["warranty", "Hết bảo hành", "date", undefined],
] as const;

export function AssetMetadataForm({
  asset,
  onCancel,
  onSaved,
}: {
  asset?: AssetMetadata & { id: string; version: number };
  onCancel: () => void;
  onSaved: (id: string) => void;
}) {
  const { store } = useSession();
  const [draft, setDraft] = useState<AssetMetadata>(asset ?? empty);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const id = asset?.id ?? null;
  const version = asset?.version ?? 0;

  function update(name: keyof AssetMetadata, value: string) {
    setDraft((current) => ({ ...current, [name]: value }));
    setPreview(false);
  }

  function submit() {
    const actor = store.getSnapshot();
    if (!actor) return;
    if (preview) {
      const result = store.assets.saveMetadata(actor, id, version, draft);
      if ("id" in result) onSaved(result.id);
      else setError(result.error ?? "Không thể lưu tài sản.");
    } else {
      const problem = store.assets.validateMetadata(actor, id, version, draft);
      setError(problem ?? "");
      setPreview(!problem);
    }
  }

  return (
    <section className="automation-panel" aria-labelledby="asset-meta">
      <h2 id="asset-meta">
        {asset ? "Sửa thông tin tài sản" : "Thêm tài sản"}
      </h2>
      <form
        className="automation-form"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="asset-form-grid">
          {fields.map(([name, label, type, maxLength]) => (
            <label key={name}>
              {label}
              <input
                type={type}
                maxLength={maxLength}
                required={name === "code"}
                value={draft[name]}
                onChange={(event) => update(name, event.target.value)}
              />
            </label>
          ))}
          <label>
            Loại
            <select
              value={draft.type}
              onChange={(event) => update("type", event.target.value)}
            >
              {assetTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Ghi chú
          <textarea
            maxLength={500}
            rows={3}
            value={draft.notes}
            onChange={(event) => update("notes", event.target.value)}
          />
        </label>
        <div className="automation-notice">
          {asset
            ? "Thay đổi người giữ bằng thao tác vòng đời."
            : "Tài sản mới được ghi nhận trong kho."}
        </div>
        {error && <p role="alert">{error}</p>}
        {preview && (
          <p role="status">
            Xem trước · {draft.code.trim().toUpperCase()} · {draft.type} ·{" "}
            {draft.model}
          </p>
        )}
        <div className="automation-actions">
          <button
            type="button"
            className="ui-button"
            data-variant="secondary"
            onClick={onCancel}
          >
            Hủy
          </button>
          <button type="submit" className="ui-button">
            {preview ? "Xác nhận lưu tài sản" : "Xem trước tài sản"}
          </button>
        </div>
      </form>
    </section>
  );
}
