"use client";
import { useRef, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useSession } from "@/features/auth/session";
import { priorities, type Priority } from "@/lib/demo/sla-policy";
import type { RoutingChange } from "@/lib/demo/ticket-intake";
import type { TicketRow } from "@/lib/demo/ticket-list";

const labels = {
  assign: "Phân công yêu cầu",
  claim: "Tự nhận xử lý",
  priority: "Thay đổi ưu tiên",
};

export function TicketRouting({
  row,
  version,
  assignable,
  claimable,
  conflict,
  onChanged,
}: {
  row: TicketRow;
  version: number;
  assignable: boolean;
  claimable: boolean;
  conflict: boolean;
  onChanged: () => void;
}) {
  const { store } = useSession();
  const [action, setAction] = useState<RoutingChange["kind"] | null>(null);
  const [openedVersion, setOpenedVersion] = useState(version);
  const [teamId, setTeamId] = useState(row.teamId);
  const [assigneeId, setAssigneeId] = useState(row.assigneeId ?? "");
  const [priority, setPriority] = useState<Priority>(row.priority);
  const [reason, setReason] = useState("");
  const [preview, setPreview] = useState<RoutingChange | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);
  const lock = useRef(false);
  const options =
    action === "assign"
      ? store.teams.routingOptions()
      : { teams: [], people: [] };
  const teams = options.teams;
  const team = teams.find((item) => item.id === teamId);
  const people = options.people.filter((person) =>
    team?.members.includes(person.id),
  );
  const requiredAssignee =
    row.state === "Đang xử lý" || row.state === "Chờ bổ sung";

  function open(kind: RoutingChange["kind"]) {
    setAction(kind);
    setOpenedVersion(version);
    setTeamId(row.teamId);
    setAssigneeId(row.assigneeId ?? "");
    setPriority(row.priority);
    setReason("");
    setPreview(kind === "claim" ? { kind } : null);
    setError("");
    setNotice("");
  }

  async function confirm() {
    if (!preview || lock.current) return;
    lock.current = true;
    setSending(true);
    const result = await store.tickets.changeRouting(
      row.id,
      preview,
      openedVersion,
      conflict,
    );
    lock.current = false;
    setSending(false);
    if (result === "success") {
      setNotice("Đã cập nhật yêu cầu.");
      setAction(null);
      onChanged();
    } else {
      setError(
        result === "stale"
          ? "Phiên bản đã thay đổi. Dữ liệu nhập được giữ nguyên."
          : "Không thể cập nhật. Kiểm tra quyền, nhóm và người phụ trách.",
      );
      if (preview.kind !== "claim") setPreview(null);
    }
  }

  return (
    <>
      <div className="ticket-history-controls" id="ticket-routing">
        {assignable && (
          <button
            className="ui-button"
            data-variant="secondary"
            type="button"
            onClick={() => open("assign")}
          >
            {labels.assign}
          </button>
        )}
        {claimable && (
          <button
            className="ui-button"
            data-variant="secondary"
            type="button"
            onClick={() => open("claim")}
          >
            {labels.claim}
          </button>
        )}
        {assignable && (
          <button
            className="ui-button"
            data-variant="secondary"
            type="button"
            onClick={() => open("priority")}
          >
            {labels.priority}
          </button>
        )}
      </div>
      {notice && <p role="status">{notice}</p>}
      <Dialog
        open={!!action}
        title={action ? labels[action] : "Cập nhật yêu cầu"}
        description={`${row.id} · ${row.team} / ${row.assignee} · ${row.priority}`}
        onRequestClose={() => {
          if (!lock.current) setAction(null);
        }}
      >
        <form
          className="ticket-lifecycle-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (preview) {
              void confirm();
              return;
            }
            if (
              reason.trim().length < 10 ||
              (action === "priority" && priority === row.priority)
            ) {
              setError("Chọn thay đổi hợp lệ và nhập lý do ít nhất 10 ký tự.");
              return;
            }
            setError("");
            if (action === "assign")
              setPreview({
                kind: action,
                teamId,
                assigneeId,
                reason: reason.trim(),
              });
            if (action === "priority")
              setPreview({ kind: action, priority, reason: reason.trim() });
          }}
        >
          {preview ? (
            <section aria-label="Nội dung xem trước">
              <h3>Nội dung xem trước</h3>
              {preview.kind === "claim" && (
                <p>Bạn sẽ trở thành người phụ trách yêu cầu này.</p>
              )}
              {preview.kind === "priority" && (
                <p>
                  {row.priority} → {preview.priority}. SLA giữ thời gian đã dùng
                  và lịch sử.
                </p>
              )}
              {preview.kind === "assign" && (
                <p>
                  {team?.name} ·{" "}
                  {people.find((person) => person.id === assigneeId)
                    ?.display_name ?? "Chưa phân công"}
                </p>
              )}
              {preview.kind !== "claim" && (
                <p className="ticket-reply-preview">{preview.reason}</p>
              )}
            </section>
          ) : (
            <>
              {action === "assign" && (
                <>
                  <label>
                    Nhóm tiếp nhận
                    <select
                      value={teamId}
                      required
                      onChange={(event) => {
                        setTeamId(event.target.value);
                        setAssigneeId("");
                      }}
                    >
                      <option value="">Chọn nhóm</option>
                      {teams.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Người thực hiện
                    <select
                      value={assigneeId}
                      required={requiredAssignee}
                      onChange={(event) => setAssigneeId(event.target.value)}
                    >
                      <option value="">
                        {requiredAssignee
                          ? "Chọn người thực hiện"
                          : "Chưa phân công"}
                      </option>
                      {people.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.display_name}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}
              {action === "priority" && (
                <label>
                  Ưu tiên mới
                  <select
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value as Priority)
                    }
                  >
                    {priorities.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
              )}
              <label>
                Lý do
                <textarea
                  className="ticket-reply-input"
                  required
                  minLength={10}
                  maxLength={10000}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
              </label>
            </>
          )}
          {error && <p role="alert">{error}</p>}
          <div className="ticket-history-controls">
            <button
              className="ui-button"
              data-variant="secondary"
              type="button"
              disabled={sending}
              onClick={() =>
                preview && preview.kind !== "claim"
                  ? setPreview(null)
                  : setAction(null)
              }
            >
              Quay lại
            </button>
            <button className="ui-button" type="submit" disabled={sending}>
              {preview ? "Xác nhận" : "Xem trước"}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
