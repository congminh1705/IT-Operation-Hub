"use client";
import { useState } from "react";
import Link from "next/link";
import { Feedback } from "@/components/feedback/feedback";
import { useSession } from "@/features/auth/session";
import { runLabels, type RunCase } from "@/lib/demo/automation-activity";
import "./automation.css";

export function AutomationActivity({
  selectedScenario,
  onScenarioChange,
}: {
  selectedScenario?: RunCase;
  onScenarioChange?: (scenario: RunCase) => void;
} = {}) {
  const { store, persona } = useSession();
  const [localScenario, setScenario] = useState<RunCase>("none");
  const scenario = selectedScenario ?? localScenario;
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const [, refresh] = useState(0);
  if (!persona) return null;
  const teams = store.teams.ownTeamIds();
  const scenarios = store.automationActivity.cases(persona, teams);
  const result = store.automationActivity.read(persona, teams, scenario);
  if (!result) return <Feedback kind="forbidden" />;
  const steps = [
    {
      title: "Sự kiện",
      state: result.runId ? "committed" : "future",
      note: result.event ?? "Chưa ghi nhận",
    },
    {
      title: "Đề xuất",
      state: result.proposal ? "committed" : "future",
      note: result.proposal ? "Đã lưu đề xuất DEMO" : "Chưa có đề xuất",
    },
    {
      title: "Phê duyệt",
      state: result.committed
        ? "skipped"
        : result.approved
          ? "approved"
          : "future",
      note: result.committed
        ? "Không cần phê duyệt"
        : result.approved
          ? "Đã phê duyệt, chờ kết quả thực thi"
          : "Chưa có quyết định",
    },
    {
      title: "Thực thi",
      state: result.committed
        ? "committed"
        : result.state === "failed"
          ? "failed"
          : result.state === "queued"
            ? "queued"
            : "future",
      note: result.committed
        ? "Đã thực thi trong lịch sử DEMO"
        : result.state === "queued"
          ? "Đang chờ thực thi"
          : result.state === "failed"
            ? "Thực thi thất bại"
            : "Chưa thực thi",
    },
  ];
  return (
    <div className="automation">
      <div>
        <Link
          href="/automation/policies"
          className="ui-button"
          data-variant="secondary"
        >
          Về quy trình
        </Link>
      </div>
      <section className="automation-panel" aria-label="Bộ lọc hoạt động">
        <label>
          Kịch bản DEMO
          <select
            aria-label="Kịch bản hoạt động DEMO"
            value={scenario}
            onChange={(event) => {
              (onScenarioChange ?? setScenario)(event.target.value as RunCase);
              setPreview(false);
              setError("");
            }}
          >
            {scenarios.map((id) => (
              <option key={id} value={id}>
                {runLabels[id]}
              </option>
            ))}
          </select>
        </label>
      </section>
      <section
        className="automation-coordination"
        aria-label="Dòng thời gian điều phối"
      >
        <h2>Hoạt động điều phối</h2>
        <p role="status">
          {result.retried
            ? "Đã ghi yêu cầu thử lại · Đang chờ thực thi"
            : runLabels[result.state]}
        </p>
        {result.policyCheck && (
          <p>Chính sách không cho phép thực thi mới trong phạm vi này.</p>
        )}
        {result.runId ? (
          <>
            <p>
              {result.runId} · {result.team}
            </p>
            <p>Nguồn: {result.source}</p>
            {result.proposalId && <p>Đề xuất: {result.proposalId}</p>}
            {result.manualLock && (
              <p className="automation-lock">Khóa phân công vẫn được giữ.</p>
            )}
            <ol className="automation-stepper">
              {steps.map((step) => (
                <li key={step.title} data-stage={step.state}>
                  <strong>{step.title}</strong>
                  <p>{step.note}</p>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p>Chưa có đề xuất hoặc hành động được ghi nhận.</p>
        )}
        {result.priorFailure && <p>Lỗi lần trước: {result.priorFailure}</p>}
        {result.error && <p role="alert">{result.error}</p>}
        {error && <p role="alert">{error}</p>}
        {result.canRetry &&
          (preview ? (
            <div className="automation-retry">
              <h3>Xác nhận yêu cầu thử lại</h3>
              <p>Yêu cầu sẽ vào hàng chờ DEMO. Phân công hiện tại được giữ.</p>
              <div className="automation-actions">
                <button
                  type="button"
                  className="ui-button"
                  onClick={() => {
                    const actor = store.getSnapshot();
                    const problem = actor
                      ? store.automationActivity.retry(
                          actor,
                          store.teams.ownTeamIds(),
                          scenario,
                        )
                      : "Phiên đã thay đổi.";
                    setError(problem ?? "");
                    setPreview(false);
                    if (!problem) refresh((value) => value + 1);
                  }}
                >
                  Xác nhận thử lại
                </button>
                <button
                  type="button"
                  className="ui-button"
                  data-variant="secondary"
                  onClick={() => setPreview(false)}
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="ui-button"
              onClick={() => setPreview(true)}
            >
              Yêu cầu thử lại
            </button>
          ))}
      </section>
    </div>
  );
}
