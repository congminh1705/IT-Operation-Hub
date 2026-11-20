"use client";
import Link from "next/link";
import { Feedback } from "@/components/feedback/feedback";
import { useSession } from "@/features/auth/session";
import "@/features/administration/users-screen.css";
export function TicketDetail({ id }: { id: string }) {
  const { store, persona } = useSession();
  if (!persona) return null;
  const result = store.tickets.detail(persona, id, store.teams.ownTeamIds());
  if (!result)
    return (
      <Feedback
        kind="empty"
        title="Không tìm thấy nội dung"
        description="Yêu cầu không tồn tại hoặc bạn không có quyền xem."
      />
    );
  const { row, draft, budget } = result;
  return (
    <div className="directory-grid">
      <section className="directory-panel directory-card">
        <p>
          {row.id} · {row.category}
        </p>
        <h2>{row.title}</h2>
        <p>
          {row.state} · {row.priority}
        </p>
        {draft && <p style={{ whiteSpace: "pre-wrap" }}>{draft.description}</p>}
        {draft?.onboarding && (
          <section aria-label="Thông tin onboarding">
            <h3>Onboarding</h3>
            <p>
              {draft.onboarding.employees} · {draft.onboarding.configuration} ·{" "}
              {draft.onboarding.quantity}
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
      <aside className="directory-panel directory-card">
        <h2>Tiếp nhận và SLA</h2>
        <p>
          {row.team} · {row.assignee}
        </p>
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
