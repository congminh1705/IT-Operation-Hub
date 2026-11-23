"use client";
import { useRef, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useSession } from "@/features/auth/session";
import {
  lifecycleActions,
  lifecycleTextMinimum,
  type LifecycleAction,
} from "@/lib/demo/ticket-lifecycle";
import type { TicketRow } from "@/lib/demo/ticket-list";

export function TicketLifecycle({
  row,
  actions,
  version,
  simulateConflict,
  onChanged,
}: {
  row: TicketRow;
  actions: LifecycleAction[];
  version: number;
  simulateConflict: boolean;
  onChanged: () => void;
}) {
  const { store, persona } = useSession();
  const [selection, setSelection] = useState<{
    action: LifecycleAction;
    version: number;
  } | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const lock = useRef(false);
  const action = selection && lifecycleActions[selection.action];
  const actionId = selection?.action;
  const minimum =
    actionId && persona ? lifecycleTextMinimum(actionId, persona) : 0;
  const textLabel =
    actionId === "wait"
      ? "Câu hỏi công khai"
      : actionId === "resolve"
        ? "Giải pháp công khai"
        : actionId === "resume"
          ? "Lý do tiếp tục xử lý"
          : actionId === "reopen"
            ? "Lý do mở lại"
            : actionId === "cancel"
              ? minimum
                ? "Lý do hủy (bắt buộc)"
                : "Lý do hủy (tùy chọn)"
              : null;
  const needsPreview =
    actionId === "wait" || actionId === "resolve" || actionId === "reopen";

  async function confirm() {
    if (!selection || lock.current) return;
    lock.current = true;
    setSending(true);
    const outcome = await store.tickets.transition(
      row.id,
      selection.action,
      reason,
      selection.version,
      simulateConflict,
    );
    lock.current = false;
    setSending(false);
    if (outcome === "success") {
      setNotice("Đã cập nhật trạng thái yêu cầu.");
      setSelection(null);
      onChanged();
    } else {
      setError(
        outcome === "stale"
          ? "Phiên bản đã thay đổi. Nội dung lý do được giữ nguyên."
          : "Không thể thực hiện thao tác. Kiểm tra quyền, trạng thái và lý do.",
      );
    }
  }

  return (
    <>
      {(actions.length > 0 || notice) && (
        <section className="ticket-lifecycle" id="ticket-actions">
          <h3>Thao tác</h3>
          {notice && <p role="status">{notice}</p>}
          <div className="ticket-history-controls">
            {actions.map((id) => (
              <button
                type="button"
                className="ui-button"
                data-variant="secondary"
                key={id}
                onClick={() => {
                  setSelection({ action: id, version });
                  setReason("");
                  setError("");
                  setPreview(false);
                }}
              >
                {lifecycleActions[id].label}
              </button>
            ))}
          </div>
        </section>
      )}
      <Dialog
        open={!!action}
        title={action?.label ?? "Cập nhật trạng thái"}
        description={`${row.id} · ${row.state} → ${action?.state ?? row.state}${selection ? " · Phiên bản " + selection.version : ""}`}
        onRequestClose={() => {
          if (!lock.current) setSelection(null);
        }}
      >
        <form
          className="ticket-lifecycle-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (reason.trim().length < minimum) {
              setError("Nhập nội dung hợp lệ trước khi tiếp tục.");
              return;
            }
            if (needsPreview && !preview) {
              setError("");
              setPreview(true);
              return;
            }
            void confirm();
          }}
        >
          {textLabel && !preview && (
            <label>
              {textLabel}
              <textarea
                className="ticket-reply-input"
                value={reason}
                disabled={sending}
                required={minimum > 0}
                minLength={minimum}
                maxLength={10000}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>
          )}
          {preview && (
            <section aria-label="Nội dung xem trước">
              <h3>Nội dung xem trước</h3>
              <p className="ticket-reply-preview">{reason.trim()}</p>
            </section>
          )}
          {selection?.action === "start" && <p>Phụ trách: {row.assignee}</p>}
          {error && <p role="alert">{error}</p>}
          <div className="ticket-history-controls">
            <button
              type="button"
              className="ui-button"
              data-variant="secondary"
              disabled={sending}
              onClick={() => (preview ? setPreview(false) : setSelection(null))}
            >
              Quay lại
            </button>
            <button type="submit" className="ui-button" disabled={sending}>
              {needsPreview && !preview ? "Xem trước" : "Xác nhận"}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
