"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "@/features/auth/session";
import {
  progressActions,
  workStates,
  type WorkItem,
  type WorkProgressDraft,
} from "@/lib/demo/work-board";

export function WorkProgress({
  row,
  stale,
  onChanged,
}: {
  row: WorkItem;
  stale: boolean;
  onChanged: () => void;
}) {
  const { store, persona } = useSession();
  const [action, setAction] = useState<WorkProgressDraft["action"]>("update");
  const [remaining, setRemaining] = useState(String(row.remaining));
  const [result, setResult] = useState("");
  const [reason, setReason] = useState("");
  const [preview, setPreview] = useState<WorkProgressDraft>();
  const [feedback, setFeedback] = useState("");
  const [notice, setNotice] = useState("");
  if (!persona) return null;
  const canWrite =
    persona.user.role !== "TECHNICIAN" || row.assigneeId === persona.user.id;
  const options = progressActions(row);
  const value = options.includes(action) ? action : options[0];
  const labels = {
    start: "Bắt đầu",
    block: "Chặn công việc",
    unblock: "Bỏ chặn",
    update: "Cập nhật tiến độ",
    done: "Xác nhận hoàn tất",
  };
  const usesRemaining = value === "done" || value === "update";
  return (
    <section className="work-panel" aria-label="Tiến độ và kết quả">
      <h2>
        {row.id} · {row.title}
      </h2>
      <p>
        {row.assignee} · {workStates[row.state]} · Còn {row.remaining} phút
      </p>
      <p>Phụ thuộc: {row.dependencies.join(", ") || "Không"}</p>
      {row.result && <p>Kết quả: {row.result}</p>}
      {feedback && <p role="alert">{feedback}</p>}
      {notice && <p role="status">{notice}</p>}
      {!canWrite || !options.length ? (
        <p>Thao tác tiến độ hiện không khả dụng.</p>
      ) : preview ? (
        <div className="work-board-summary" aria-label="Xem trước cập nhật">
          <h3>Xem trước cập nhật</h3>
          <p>
            {labels[preview.action]} · Còn {preview.remaining} phút
          </p>
          {preview.result && <p>{preview.result}</p>}
          {preview.reason && <p>{preview.reason}</p>}
          <div className="work-controls">
            <button
              className="ui-button"
              type="button"
              onClick={() => {
                const current = store.getSnapshot();
                const outcome = current
                  ? store.work.changeProgress(
                      current,
                      store.teams.ownTeamIds(),
                      row.id,
                      preview,
                      stale,
                    )
                  : "Phiên đã thay đổi.";
                if (outcome) {
                  setFeedback(outcome);
                  setPreview(undefined);
                  return;
                }
                setPreview(undefined);
                setFeedback("");
                setNotice("Đã cập nhật công việc.");
                setResult("");
                setReason("");
                onChanged();
              }}
            >
              Xác nhận cập nhật
            </button>
            <button
              className="ui-button"
              data-variant="secondary"
              type="button"
              onClick={() => setPreview(undefined)}
            >
              Quay lại chỉnh sửa
            </button>
          </div>
        </div>
      ) : (
        <form
          className="work-progress-form"
          onSubmit={(event) => {
            event.preventDefault();
            const draft = {
              action: value,
              remaining: usesRemaining ? Number(remaining) : row.remaining,
              result: result.trim(),
              reason: reason.trim(),
              version: row.version,
            };
            const error = store.work.validateProgress(
              persona,
              store.teams.ownTeamIds(),
              row.id,
              draft,
            );
            setNotice("");
            setFeedback(error ?? "");
            if (!error) setPreview(draft);
          }}
        >
          <label>
            Thao tác tiến độ
            <select
              aria-label="Thao tác tiến độ"
              value={value}
              onChange={(event) =>
                setAction(event.target.value as WorkProgressDraft["action"])
              }
            >
              {options.map((item) => (
                <option key={item} value={item}>
                  {labels[item]}
                </option>
              ))}
            </select>
          </label>
          {usesRemaining && (
            <label>
              Thời gian còn lại (phút)
              <input
                type="number"
                value={remaining}
                min={0}
                step={1}
                required
                onChange={(event) => setRemaining(event.target.value)}
              />
            </label>
          )}
          {usesRemaining && (
            <label>
              Kết quả
              <textarea
                aria-label="Kết quả"
                value={result}
                onChange={(event) => setResult(event.target.value)}
                maxLength={10000}
              />
            </label>
          )}
          {(value === "block" ||
            value === "unblock" ||
            persona.user.role !== "TECHNICIAN") && (
            <label>
              Lý do
              <textarea
                aria-label="Lý do"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={10000}
              />
            </label>
          )}
          <button type="submit" className="ui-button">
            Xem trước cập nhật
          </button>
        </form>
      )}
      <p>
        <Link href={"/tickets/" + row.ticket}>Mở yêu cầu liên quan</Link>
      </p>
      {!!row.history?.length && (
        <section aria-label="Lịch sử thực hiện">
          <h3>Lịch sử thực hiện</h3>
          <ul>
            {row.history.map((entry, index) => (
              <li key={index}>{entry}</li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
