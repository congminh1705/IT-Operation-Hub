"use client";
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useSession } from "@/features/auth/session";
import {
  workControlLabels,
  type WorkControlDraft,
  type WorkItem,
} from "@/lib/demo/work-board";

export function WorkControls({
  row,
  onChanged,
}: {
  row: WorkItem;
  onChanged: () => void;
}) {
  const { store, persona } = useSession();
  const [action, setAction] = useState<WorkControlDraft["action"]>();
  const [assignee, setAssignee] = useState("");
  const [reason, setReason] = useState("");
  const [exception, setException] = useState(false);
  const [preview, setPreview] = useState<WorkControlDraft>();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  if (!persona) return null;
  const management =
    persona.user.role === "IT_MANAGER" || persona.user.role === "ADMIN";
  const editable =
    management && row.state !== "done" && row.state !== "cancelled";
  const choices = store.teams.routingOptions();
  const candidates = store.work.assignmentChoices(row, choices);
  function open(next: WorkControlDraft["action"]) {
    setAction(next);
    setAssignee("");
    setReason("");
    setException(false);
    setPreview(undefined);
    setError("");
    setNotice("");
  }
  return (
    <section className="work-panel" aria-label="Điều phối thủ công">
      <h2>Phân công và khóa thủ công</h2>
      <p>{row.locked ? "Đang khóa phân công" : "Không khóa phân công"}</p>
      {row.lockReason && <p>Lý do khóa: {row.lockReason}</p>}
      {row.manualReason && (
        <p>Quyết định thủ công gần nhất: {row.manualReason}</p>
      )}
      {notice && <p role="status">{notice}</p>}
      {editable ? (
        <div className="work-controls">
          <button
            className="ui-button"
            data-variant="secondary"
            type="button"
            disabled={row.locked || !candidates.length}
            onClick={() => open("assign")}
          >
            Đổi người thực hiện
          </button>
          <button
            className="ui-button"
            data-variant="secondary"
            type="button"
            onClick={() => open(row.locked ? "unlock" : "lock")}
          >
            {row.locked ? workControlLabels.unlock : workControlLabels.lock}
          </button>
          {row.locked && (
            <p>Bỏ khóa bằng thao tác riêng trước khi đổi người thực hiện.</p>
          )}
          {!row.locked && !candidates.length && (
            <p>Chưa có người đủ điều kiện trong khung DEMO.</p>
          )}
        </div>
      ) : (
        <p>
          Thao tác phân công và khóa không khả dụng với vai trò hoặc trạng thái
          hiện tại.
        </p>
      )}
      <Dialog
        open={!!action}
        title={action ? workControlLabels[action] : "Điều phối thủ công"}
        description={row.id + " · " + row.title}
        onRequestClose={() => setAction(undefined)}
      >
        <form
          className="work-progress-form"
          onSubmit={(event) => {
            event.preventDefault();
            const current = store.getSnapshot();
            if (!current) {
              setError("Phiên đã thay đổi.");
              return;
            }
            const currentOptions = store.teams.routingOptions();
            const draft = preview ?? {
              action: action!,
              assignee,
              reason,
              exception,
              version: row.version,
            };
            const problem = preview
              ? store.work.applyControl(current, row.id, draft, currentOptions)
              : store.work.validateControl(
                  current,
                  row.id,
                  draft,
                  currentOptions,
                );
            setError(problem ?? "");
            if (problem) return;
            if (preview) {
              setAction(undefined);
              setNotice("Đã lưu quyết định thủ công.");
              onChanged();
            } else setPreview(draft);
          }}
        >
          {preview ? (
            <div aria-label="Xem trước tác động">
              <h3>Xem trước tác động</h3>
              {preview.action === "assign" ? (
                <p>
                  {row.assignee} →{" "}
                  {
                    candidates.find((item) => item.id === preview.assignee)
                      ?.display_name
                  }
                  . Chuyển {row.remaining} phút còn lại trong khung DEMO; trạng
                  thái và phụ thuộc giữ nguyên.
                </p>
              ) : (
                <p>
                  {preview.action === "lock"
                    ? "Khóa người đang phụ trách."
                    : "Gỡ khóa; người phụ trách vẫn giữ nguyên."}
                </p>
              )}
              <p>{preview.reason}</p>
            </div>
          ) : (
            <>
              {action === "assign" && (
                <label>
                  Người thực hiện
                  <select
                    aria-label="Người thực hiện"
                    required
                    value={assignee}
                    onChange={(event) => setAssignee(event.target.value)}
                  >
                    <option value="">Chọn người đủ điều kiện</option>
                    {candidates.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.display_name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {action === "assign" && row.state === "active" && (
                <label className="work-exception">
                  <input
                    type="checkbox"
                    checked={exception}
                    onChange={(event) => setException(event.target.checked)}
                  />{" "}
                  Chấp thuận ngoại lệ khi công việc đang thực hiện
                </label>
              )}
              <label>
                Lý do thủ công
                <textarea
                  aria-label="Lý do thủ công"
                  required
                  maxLength={10000}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
              </label>
            </>
          )}
          {error && <p role="alert">{error}</p>}
          <div className="work-controls">
            <button
              type="button"
              className="ui-button"
              data-variant="secondary"
              onClick={() =>
                preview ? setPreview(undefined) : setAction(undefined)
              }
            >
              {preview ? "Quay lại chỉnh sửa" : "Hủy thao tác"}
            </button>
            <button type="submit" className="ui-button">
              {preview ? "Xác nhận quyết định" : "Xem trước tác động"}
            </button>
          </div>
        </form>
      </Dialog>
    </section>
  );
}
