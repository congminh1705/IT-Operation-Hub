"use client";

import { useState } from "react";
import Link from "next/link";
import { Feedback } from "@/components/feedback/feedback";
import { useSession } from "@/features/auth/session";
import { readApprovalProposal } from "@/lib/demo/approval-proposal";
import "./automation.css";

export function ApprovalProposal() {
  const { persona } = useSession();
  const [missing, setMissing] = useState(false);
  const proposal = persona && readApprovalProposal(persona, missing);
  if (!proposal) return <Feedback kind="forbidden" />;

  return (
    <div className="automation">
      <div className="automation-actions">
        <Link
          href="/automation/activity"
          className="ui-button"
          data-variant="secondary"
        >
          Xem hoạt động điều phối
        </Link>
        <label>
          Bằng chứng DEMO
          <select
            value={missing ? "missing" : "full"}
            onChange={(event) => setMissing(event.target.value === "missing")}
          >
            <option value="full">Đầy đủ</option>
            <option value="missing">Thiếu bằng chứng</option>
          </select>
        </label>
      </div>
      <section className="automation-panel" aria-labelledby="proposal-heading">
        <p>{proposal.id} · Chờ phê duyệt</p>
        <h2 id="proposal-heading">{proposal.task}</h2>
        <p>{proposal.reason}</p>
        <p className="approval-lock">
          {proposal.lock} Phương án chưa thực thi.
        </p>
        <p>
          Nguồn tại thời điểm đề xuất ·{" "}
          {proposal.source ?? "Chưa có ảnh chụp nguồn"}
        </p>
        {missing && (
          <p role="alert">
            Thiếu bằng chứng nguồn và kỹ năng. Cần đánh giá lại đề xuất.
          </p>
        )}
        <div className="approval-diff">
          {(
            [
              ["Phân công hiện tại", proposal.current],
              ["Phân công đề xuất", proposal.proposed],
            ] as const
          ).map(([title, assignment]) => (
            <section className="automation-panel" key={title}>
              <h3>{title}</h3>
              <dl>
                <dt>Người phụ trách</dt>
                <dd>{assignment.assignee}</dd>
                <dt>Kỹ năng</dt>
                <dd>{assignment.skills ?? "Chưa có bằng chứng kỹ năng"}</dd>
                <dt>Khung lịch</dt>
                <dd>{assignment.window}</dd>
                <dt>Effort còn lại</dt>
                <dd>{assignment.effort}</dd>
              </dl>
            </section>
          ))}
        </div>
        <h3>Tác động và bàn giao</h3>
        <dl className="automation-facts">
          <div>
            <dt>Hạn công việc</dt>
            <dd>{proposal.deadline}</dd>
          </div>
          <div>
            <dt>Bàn giao</dt>
            <dd>{proposal.handover}</dd>
          </div>
          <div>
            <dt>SLA ticket</dt>
            <dd>{proposal.sla}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
