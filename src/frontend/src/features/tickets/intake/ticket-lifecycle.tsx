"use client";
import { useRef, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useSession } from "@/features/auth/session";
import {
  lifecycleActions,
  requiresCancellationReason,
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
  const [sending, setSending] = useState(false);
  const lock = useRef(false);
  const action = selection && lifecycleActions[selection.action];
  const requiresReason =
    selection?.action === "cancel" &&
    !!persona &&
    requiresCancellationReason(persona);

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
        <section className="ticket-lifecycle">
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
        description={`${row.id} · ${row.state} → ${action?.state ?? row.state}`}
        onRequestClose={() => {
          if (!lock.current) setSelection(null);
        }}
      >
        <form
          className="ticket-lifecycle-form"
          onSubmit={(event) => {
            event.preventDefault();
            void confirm();
          }}
        >
          {selection?.action === "cancel" && (
            <label>
              {requiresReason ? "Lý do hủy (bắt buộc)" : "Lý do hủy (tùy chọn)"}
              <textarea
                className="ticket-reply-input"
                value={reason}
                disabled={sending}
                required={requiresReason}
                minLength={requiresReason ? 10 : undefined}
                maxLength={10000}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>
          )}
          {selection?.action === "start" && <p>Phụ trách: {row.assignee}</p>}
          {error && <p role="alert">{error}</p>}
          <div className="ticket-history-controls">
            <button
              type="button"
              className="ui-button"
              data-variant="secondary"
              disabled={sending}
              onClick={() => setSelection(null)}
            >
              Quay lại
            </button>
            <button type="submit" className="ui-button" disabled={sending}>
              Xác nhận
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
