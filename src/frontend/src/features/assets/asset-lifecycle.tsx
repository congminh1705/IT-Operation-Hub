"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useSession } from "@/features/auth/session";
import {
  assetActions,
  assetStates,
  type AssetChange,
  type AssetState,
} from "@/lib/demo/assets";

export function AssetLifecycle({
  asset,
  onClose,
}: {
  asset: {
    id: string;
    version: number;
    code: string;
    model: string;
    state: AssetState;
    holderLabel?: string;
  };
  onClose: () => void;
}) {
  const { store, persona } = useSession();
  const [input, setInput] = useState<AssetChange>({
    action: asset.state === "assigned" ? "return" : "issue",
    date: "",
    reason: "",
    recipient: "",
    returnState: "stock",
  });
  const [preview, setPreview] = useState(false);
  const [problem, setProblem] = useState("");
  const [simulate, setSimulate] = useState(false);
  const recipients = persona ? store.assets.recipients(persona) : [];

  function change<K extends keyof AssetChange>(name: K, value: AssetChange[K]) {
    setInput((draft) => ({ ...draft, [name]: value }));
    setPreview(false);
    setProblem("");
  }

  function submit() {
    const actor = store.getSnapshot();
    if (!actor) return;
    if (!preview) {
      const error = store.assets.previewChange(
        actor,
        asset.id,
        asset.version,
        input,
      );
      setProblem(error ?? "");
      setPreview(!error);
      return;
    }
    if (simulate && input.action === "issue") {
      store.assets.applyChange(actor, asset.id, asset.version, {
        ...input,
        reason: "Cấp phát đồng thời DEMO",
      });
    }
    const error = store.assets.applyChange(
      actor,
      asset.id,
      asset.version,
      input,
    );
    if (error) {
      setProblem(error);
      setPreview(false);
    } else onClose();
  }

  return (
    <Dialog
      open
      title="Vòng đời tài sản"
      description={`${asset.code} · ${asset.model} · ${assetStates[asset.state]} · ${asset.holderLabel ?? "Chưa có người giữ"}`}
      onRequestClose={onClose}
      className="asset-action-dialog"
    >
      <form
        className="automation-form"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="asset-form-grid">
          <label>
            Thao tác
            <select
              value={input.action}
              onChange={(event) =>
                change("action", event.target.value as AssetChange["action"])
              }
            >
              {Object.entries(assetActions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Ngày thực hiện *
            <input
              type="date"
              required
              value={input.date}
              onChange={(event) => change("date", event.target.value)}
            />
          </label>
          {input.action === "issue" && (
            <label>
              Người nhận *
              <select
                required
                value={input.recipient}
                onChange={(event) => change("recipient", event.target.value)}
              >
                <option value="">Chọn người nhận</option>
                {recipients.map((user) => (
                  <option value={user.id} key={user.id}>
                    {user.name} · {user.department}
                  </option>
                ))}
              </select>
            </label>
          )}
          {input.action === "return" && (
            <label>
              Trạng thái sau thu hồi
              <select
                value={input.returnState}
                onChange={(event) =>
                  change(
                    "returnState",
                    event.target.value as AssetChange["returnState"],
                  )
                }
              >
                <option value="stock">Trong kho</option>
                <option value="repair">Đang sửa chữa</option>
              </select>
            </label>
          )}
        </div>
        <label>
          Ghi chú / lý do *
          <textarea
            rows={3}
            required
            maxLength={500}
            value={input.reason}
            onChange={(event) => change("reason", event.target.value)}
          />
        </label>
        {asset.state === "assigned" && (
          <p className="automation-notice">
            Tài sản đang có người giữ. Thu hồi trước khi đổi trạng thái.
          </p>
        )}
        {preview && (
          <div className="automation-notice">
            <p role="status">
              Xác nhận {assetActions[input.action]} · {input.date} ·{" "}
              {input.reason}
            </p>
            {input.action === "issue" && (
              <label className="asset-conflict">
                <input
                  type="checkbox"
                  checked={simulate}
                  onChange={(event) => setSimulate(event.target.checked)}
                />
                Mô phỏng một lượt cấp phát đồng thời
              </label>
            )}
          </div>
        )}
        {problem && <p role="alert">{problem}</p>}
        <div className="automation-actions">
          <button
            type="button"
            className="ui-button"
            data-variant="secondary"
            onClick={onClose}
          >
            Hủy
          </button>
          <button type="submit" className="ui-button">
            {preview ? "Xác nhận thay đổi" : "Xem trước thay đổi"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
