"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "./ticket-detail.css";
import { Feedback } from "@/components/feedback/feedback";
import { useSession } from "@/features/auth/session";
import "@/features/administration/users-screen.css";
export function TicketDetail({
  id,
  unavailable,
}: {
  id: string;
  unavailable: boolean;
}) {
  const router = useRouter();
  const { store, persona } = useSession();
  const [view, setView] = useState<"public" | "internal" | "history">("public");
  if (!persona) return null;
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
  const { row, draft, budget, events, internal } = result;
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
                    {new Intl.DateTimeFormat("vi-VN", {
                      timeZone: "Asia/Ho_Chi_Minh",
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(new Date(event.at))}
                  </time>
                  {event.audience === "internal" && <span> · Nội bộ</span>}
                  <p>{event.text}</p>
                </li>
              ))}
            </ol>
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
        <h3>Tiếp nhận và SLA</h3>
        <p>{row.team}</p>
        <p>{row.sla}</p>
        {budget && (
          <p>
            Phiên bản v{budget.version} · Phản hồi {budget.response} phút · Giải
            quyết {budget.resolution} phút
          </p>
        )}
      </aside>
    </div>
  );
}
