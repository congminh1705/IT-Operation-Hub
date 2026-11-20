"use client";
import { useState } from "react";
import { useSession } from "@/features/auth/session";
import {
  policyActions,
  policyScenarios,
  type PolicyDraft,
  type PolicyScenario,
} from "@/lib/demo/automation-policy";
export function AutomationPolicyPanel({ versions }: { versions: number[] }) {
  const { store, persona } = useSession();
  const [scenario, setScenario] = useState<PolicyScenario>("active");
  const [draft, setDraft] = useState<{ data: PolicyDraft; version: number }>();
  const [review, setReview] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  if (!persona) return null;
  const policy = store.automationPolicy.read(persona, scenario);
  if (!policy) return null;
  function patch(partial: Partial<PolicyDraft>) {
    setDraft((current) =>
      current
        ? { ...current, data: { ...current.data, ...partial } }
        : undefined,
    );
  }
  return (
    <section className="automation-panel" aria-label="Chính sách điều phối">
      <h2>Chính sách đang áp dụng</h2>
      <label>
        Kịch bản DEMO
        <select
          aria-label="Kịch bản chính sách DEMO"
          value={scenario}
          onChange={(event) => {
            setScenario(event.target.value as PolicyScenario);
            setDraft(undefined);
            setReview(false);
            setError("");
            setMessage("");
          }}
        >
          {Object.entries(policyScenarios).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <dl className="automation-facts">
        <div>
          <dt>Chính sách</dt>
          <dd>{policy.draft.enabled ? "Đang bật" : "Đã tắt"}</dd>
        </div>
        <div>
          <dt>Trợ lý</dt>
          <dd>{policy.assistant ? "Khả dụng" : "Tạm tắt"}</dd>
        </div>
        <div>
          <dt>Ủy quyền</dt>
          <dd>
            {policy.grantStatus === "valid"
              ? "Còn hiệu lực"
              : policy.grantStatus === "expired"
                ? "Đã hết hạn"
                : "Chưa được cấp"}
          </dd>
        </div>
        <div>
          <dt>Thực thi theo phạm vi</dt>
          <dd>
            {policy.allows ? "Đủ điều kiện theo fixture" : "Từ chối mặc định"}
          </dd>
        </div>
      </dl>
      {policy.grant && (
        <p>
          Người cấp: {policy.grant.grantor} · Hạn: {policy.grant.expires}
        </p>
      )}
      <p>
        IT Support · Workflow v{policy.draft.workflow} · {policy.draft.priority}{" "}
        · {policyActions[policy.draft.action as keyof typeof policyActions]} ·
        Tối đa {policy.draft.limit} công việc/lượt
      </p>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      {!draft ? (
        <button
          className="ui-button"
          type="button"
          onClick={() => {
            setDraft({ data: { ...policy.draft }, version: policy.version });
            setMessage("");
          }}
        >
          Chỉnh chính sách
        </button>
      ) : review ? (
        <section aria-label="Xem trước chính sách">
          <h3>Xem trước chính sách</h3>
          <p>
            {policy.draft.enabled ? "Đang bật" : "Đã tắt"} →{" "}
            {draft.data.enabled ? "Bật" : "Tắt"}
          </p>
          <p>
            IT Support · Workflow v{draft.data.workflow} · {draft.data.priority}{" "}
            · {policyActions[draft.data.action as keyof typeof policyActions]} ·
            Tối đa {draft.data.limit} công việc/lượt
          </p>
          {policy.grant && <p>Người cấp: {policy.grant.grantor}</p>}
          {!draft.data.enabled && (
            <p>Tắt chính sách ngăn lượt thực thi mới. Lịch sử vẫn được giữ.</p>
          )}
          <div className="automation-actions">
            <button
              className="ui-button"
              type="button"
              onClick={() => {
                const actor = store.getSnapshot();
                const problem = actor
                  ? store.automationPolicy.save(
                      actor,
                      scenario,
                      draft.data,
                      draft.version,
                      versions,
                    )
                  : "Phiên đã thay đổi.";
                setError(problem ?? "");
                if (!problem) {
                  setDraft(undefined);
                  setReview(false);
                  setMessage("Đã lưu chính sách DEMO.");
                }
              }}
            >
              Xác nhận lưu chính sách
            </button>
            <button
              className="ui-button"
              data-variant="secondary"
              type="button"
              onClick={() => {
                setDraft(undefined);
                setReview(false);
                setError("");
              }}
            >
              Hủy thay đổi
            </button>
          </div>
        </section>
      ) : (
        <form
          className="automation-form"
          onSubmit={(event) => {
            event.preventDefault();
            const problem = store.automationPolicy.validate(
              persona,
              scenario,
              draft.data,
              draft.version,
              versions,
            );
            setError(problem ?? "");
            if (!problem) setReview(true);
          }}
        >
          <label>
            Nhóm
            <select
              aria-label="Nhóm chính sách"
              value={draft.data.team}
              onChange={(event) => patch({ team: event.target.value })}
            >
              <option value="support">IT Support</option>
            </select>
          </label>
          <label>
            Workflow
            <select
              aria-label="Workflow chính sách"
              value={draft.data.workflow}
              onChange={(event) =>
                patch({ workflow: Number(event.target.value) })
              }
            >
              {versions.map((number) => (
                <option key={number} value={number}>
                  v{number}
                </option>
              ))}
            </select>
          </label>
          <label>
            Ưu tiên
            <select
              aria-label="Ưu tiên chính sách"
              value={draft.data.priority}
              onChange={(event) => patch({ priority: event.target.value })}
            >
              {["P2", "P3", "P4"].map((id) => (
                <option key={id}>{id}</option>
              ))}
            </select>
          </label>
          <label>
            Hành động
            <select
              aria-label="Hành động chính sách"
              value={draft.data.action}
              onChange={(event) => patch({ action: event.target.value })}
            >
              {Object.entries(policyActions).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Giới hạn công việc/lượt
            <input
              aria-label="Giới hạn công việc/lượt"
              type="number"
              value={draft.data.limit}
              onChange={(event) => patch({ limit: Number(event.target.value) })}
            />
          </label>
          <label>
            Trạng thái mới
            <select
              aria-label="Trạng thái chính sách mới"
              value={draft.data.enabled ? "on" : "off"}
              onChange={(event) =>
                patch({ enabled: event.target.value === "on" })
              }
            >
              <option value="on">Bật</option>
              <option value="off">Tắt</option>
            </select>
          </label>
          <div className="automation-actions">
            <button className="ui-button" type="submit">
              Xem trước chính sách
            </button>
            <button
              className="ui-button"
              data-variant="secondary"
              type="button"
              onClick={() => {
                setDraft(undefined);
                setError("");
              }}
            >
              Hủy thay đổi
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
