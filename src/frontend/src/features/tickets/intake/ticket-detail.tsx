"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "./ticket-detail.css";
import { TicketSlaClocks } from "./ticket-sla-clocks";
import { formatBusinessTime } from "@/lib/dates";
import { TicketRouting } from "./ticket-routing";
import { TicketLifecycle } from "./ticket-lifecycle";
import type { UploadFixture } from "@/lib/demo/ticket-attachments";
import { TicketReplyComposer } from "./ticket-reply-composer";
import { Feedback } from "@/components/feedback/feedback";
import { useSession } from "@/features/auth/session";
import "@/features/administration/users-screen.css";
export function TicketDetail({
  id,
  unavailable,
  uploadFixture,
  simulateRevocation,
  simulateTransitionConflict,
}: {
  id: string;
  unavailable: boolean;
  uploadFixture?: UploadFixture;
  simulateRevocation: boolean;
  simulateTransitionConflict: boolean;
}) {
  const router = useRouter();
  const { store, persona } = useSession();
  const [view, setView] = useState<"public" | "internal" | "history">("public");
  const [, setRevision] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(
      () => setRevision((value) => value + 1),
      30000,
    );
    return () => window.clearInterval(timer);
  }, []);
  const [revokedDraft, setRevokedDraft] = useState<string | null>(null);
  if (!persona) return null;
  if (revokedDraft !== null)
    return (
      <section className="directory-panel directory-card">
        <Feedback kind="forbidden" title="Quyền truy cập đã thay đổi" />
        <label>
          Bản nháp của bạn
          <textarea
            className="ticket-reply-input"
            readOnly
            value={revokedDraft}
          />
        </label>
      </section>
    );
  if (unavailable)
    return (
      <Feedback
        kind="error"
        action={{
          label: "Thử lại",
          onClick: () => router.replace(`/tickets/${id}`),
        }}
      />
    );
  const result = store.tickets.detail(persona, id, store.teams.ownTeamIds());
  if (!result)
    return (
      <Feedback
        kind="forbidden"
        title="Không tìm thấy nội dung"
        description="Yêu cầu không tồn tại hoặc bạn không có quyền xem."
      />
    );
  const {
    row,
    draft,
    budget,
    events,
    internal,
    version,
    canReply,
    actions,
    sla,
    assignable,
    claimable,
  } = result;
  const visibleView = view === "internal" && !internal ? "public" : view;
  const shown = events.filter((event) =>
    visibleView === "history"
      ? event.kind === "history"
      : event.kind === "message" && event.audience === visibleView,
  );
  const views = [
    { id: "public", label: "Trao đổi công khai" },
    ...(internal ? [{ id: "internal", label: "Ghi chú nội bộ" } as const] : []),
    { id: "history", label: "Lịch sử" },
  ] as const;
  return (
    <div className="ticket-detail-grid">
      {row.state === "Đã giải quyết" && row.requesterId === persona.user.id && (
        <div className="ticket-next-action" role="status">
          <strong>Kết quả đã sẵn sàng để bạn kiểm tra</strong>
          <p>
            {events.findLast((event) => event.purpose === "solution")?.text}
          </p>
        </div>
      )}
      {!internal && row.state === "Chờ bổ sung" && (
        <div className="ticket-next-action" role="status">
          <strong>IT đang chờ phản hồi của bạn</strong>
          <p>Gửi thêm thông tin để IT tiếp tục xử lý.</p>
        </div>
      )}
      <div className="ticket-detail-stack">
        <section className="directory-panel directory-card">
          <h2>{row.title}</h2>
          <p className="ticket-detail-code">{row.id}</p>
          <p className="ticket-detail-badges">
            <span data-state={row.state}>{row.state}</span>
            <span>{row.priority}</span>
          </p>
          {draft && (
            <p style={{ whiteSpace: "pre-wrap" }}>{draft.description}</p>
          )}
          {draft?.onboarding && (
            <section aria-label="Thông tin onboarding">
              <h3>Onboarding</h3>
              <p>
                {draft.onboarding.employees} · {draft.onboarding.configuration}{" "}
                · {draft.onboarding.quantity}
              </p>
              <p>{draft.onboarding.deadline}</p>
            </section>
          )}
          {!!draft?.attachments.length && (
            <ul aria-label="Tệp đính kèm DEMO">
              {draft.attachments.map(({ name, size }, i) => (
                <li key={i}>
                  {name} · {Math.ceil(size / 1024)} KB
                </li>
              ))}
            </ul>
          )}
        </section>
        <section
          className="directory-panel directory-card ticket-history"
          aria-labelledby="ticket-history-title"
        >
          <h2 id="ticket-history-title">Trao đổi</h2>
          <div
            className="ticket-history-controls"
            role="group"
            aria-label="Nội dung trao đổi"
          >
            {views.map(({ id, label }) => (
              <button
                className="ui-button"
                data-variant="secondary"
                type="button"
                key={id}
                aria-pressed={visibleView === id}
                onClick={() => setView(id)}
              >
                {label}
              </button>
            ))}
          </div>
          {visibleView === "internal" && (
            <p>Chỉ thành viên IT có quyền trên yêu cầu được xem.</p>
          )}
          {shown.length === 0 ? (
            <p role="status">Chưa có nội dung.</p>
          ) : (
            <ol className="ticket-history-events">
              {shown.map((event) => (
                <li key={event.id}>
                  <strong>{event.actor}</strong>
                  {" · "}
                  <time dateTime={event.at}>
                    {formatBusinessTime(new Date(event.at).toISOString())}
                  </time>
                  {event.audience === "internal" && <span> · Nội bộ</span>}
                  <p>{event.text}</p>
                </li>
              ))}
            </ol>
          )}
          {canReply && (
            <TicketReplyComposer
              id={id}
              view={visibleView}
              version={version}
              internal={internal}
              simulateRevocation={simulateRevocation}
              uploadFixture={uploadFixture}
              onPosted={() => setRevision((value) => value + 1)}
              onRevoked={setRevokedDraft}
            />
          )}
          <Link
            className="ui-button"
            data-variant="secondary"
            href={
              row.requesterId === persona.user.id
                ? "/tickets?scope=mine"
                : "/tickets?scope=work"
            }
          >
            Về danh sách yêu cầu
          </Link>
        </section>
      </div>
      <aside className="directory-panel directory-card">
        <h2>Thông tin yêu cầu</h2>
        <dl className="ticket-detail-context">
          <div>
            <dt>Người gửi</dt>
            <dd>{row.requester}</dd>
          </div>
          <div>
            <dt>Danh mục</dt>
            <dd>{row.category}</dd>
          </div>
          {internal && (
            <div>
              <dt>Phụ trách</dt>
              <dd>{row.assignee}</dd>
            </div>
          )}
          {draft && (
            <div>
              <dt>Loại yêu cầu</dt>
              <dd>{draft.type === "incident" ? "Sự cố" : "Yêu cầu dịch vụ"}</dd>
            </div>
          )}
        </dl>
        <h3>Nhóm tiếp nhận</h3>
        <p>{row.team}</p>
        <TicketSlaClocks response={sla.response} resolution={sla.resolution} />
        {budget && (
          <p>
            Phiên bản v{budget.version} · Phản hồi {budget.response} phút · Giải
            quyết {budget.resolution} phút
          </p>
        )}
        <TicketLifecycle
          row={row}
          actions={actions}
          version={version}
          simulateConflict={simulateTransitionConflict}
          onChanged={() => setRevision((value) => value + 1)}
        />
        <TicketRouting
          row={row}
          version={version}
          assignable={assignable}
          claimable={claimable}
          conflict={simulateTransitionConflict}
          onChanged={() => setRevision((value) => value + 1)}
        />
      </aside>
    </div>
  );
}
