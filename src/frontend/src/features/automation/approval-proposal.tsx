"use client";

import { useState } from "react";
import Link from "next/link";
import { Feedback } from "@/components/feedback/feedback";
import { useSession } from "@/features/auth/session";
import { readApprovalProposal } from "@/lib/demo/approval-proposal";
import {
  decisionErrors,
  decisionScenarios,
  type Decision,
  type DecisionScenario,
} from "@/lib/demo/approval-decisions";
import "./automation.css";

const executionLabels = {
  pending: "Đang chờ thực thi",
  succeeded: "Thực thi thành công (fixture)",
  failed: "Thực thi thất bại (fixture)",
};

export function ApprovalProposal() {
  const { persona, store } = useSession();
  const [missing, setMissing] = useState(false);
  const [scenario, setScenario] = useState<DecisionScenario>("pending");
  const [version, setVersion] = useState(1);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState<
    keyof typeof decisionErrors | "refreshed" | null
  >(null);
  const [, redraw] = useState(0);
  const decisions = store.approvalDecisions;
  const proposal = persona && readApprovalProposal(persona, missing);
  const view = persona && decisions.read(persona, scenario);
  if (!proposal || !view) return <Feedback kind="forbidden" />;

  function submit(decision: Decision) {
    const actor = store.getSnapshot();
    setNotice(
      actor
        ? decisions.submit(actor, {
            decision,
            reason,
            version,
            scenario,
            missing,
          })
        : "forbidden",
    );
    redraw((value) => value + 1);
  }

  const decisionLabel =
    view.record?.decision === "approved"
      ? "Đã phê duyệt"
      : view.record?.decision === "rejected"
        ? "Đã từ chối"
        : "Chờ phê duyệt";

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
        <p>
          {proposal.id} · {decisionLabel}
        </p>
        <h2 id="proposal-heading">{proposal.task}</h2>
        <p>{proposal.reason}</p>
        <p className="approval-lock">
          {proposal.lock} Đây là trạng thái tại thời điểm đề xuất.
        </p>
        <p>
          Nguồn tại thời điểm đề xuất ·{" "}
          {proposal.source
            ? `${proposal.source} · Bản ${version}`
            : "Chưa có ảnh chụp nguồn"}
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
      <section
        className="automation-panel automation-form"
        aria-labelledby="decision-heading"
      >
        <h2 id="decision-heading">Quyết định đề xuất</h2>
        <label>
          Tình huống quyết định DEMO
          <select
            value={scenario}
            onChange={(event) =>
              setScenario(event.target.value as DecisionScenario)
            }
          >
            {Object.entries(decisionScenarios).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {view.record ? (
          <div role="status" className="approval-result">
            <p>
              <strong>{decisionLabel}</strong>
            </p>
            <p>Lý do: {view.record.reason}</p>
            <p data-execution={view.execution ?? "none"}>
              {view.execution
                ? executionLabels[view.execution]
                : "Không có yêu cầu thực thi"}
            </p>
          </div>
        ) : (
          <>
            <label>
              Lý do quyết định *
              <textarea
                required
                maxLength={500}
                rows={3}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>
            <div className="automation-actions">
              <button
                type="button"
                className="ui-button"
                onClick={() => submit("approved")}
              >
                Duyệt phương án
              </button>
              <button
                type="button"
                className="ui-button"
                data-variant="secondary"
                onClick={() => submit("rejected")}
              >
                Từ chối
              </button>
            </div>
          </>
        )}
        {view.execution === "pending" &&
          (scenario === "succeeded" || scenario === "failed") && (
            <div>
              <button
                type="button"
                className="ui-button"
                data-variant="secondary"
                onClick={() => {
                  const actor = store.getSnapshot();
                  if (actor) decisions.receiveExecutionFixture(actor, scenario);
                  redraw((value) => value + 1);
                }}
              >
                Nhận kết quả thực thi DEMO
              </button>
            </div>
          )}
        {notice === "refreshed" ? (
          <p role="status">
            Đã tải ảnh chụp mới. Kiểm tra lại đề xuất trước khi gửi quyết định.
          </p>
        ) : (
          notice && (
            <>
              <p role="alert">{decisionErrors[notice]}</p>
              {notice === "stale" && (
                <div>
                  <button
                    type="button"
                    className="ui-button"
                    data-variant="secondary"
                    onClick={() => {
                      setVersion(view.version);
                      setNotice("refreshed");
                    }}
                  >
                    Tải lại ảnh chụp
                  </button>
                </div>
              )}
            </>
          )
        )}
      </section>
    </div>
  );
}
