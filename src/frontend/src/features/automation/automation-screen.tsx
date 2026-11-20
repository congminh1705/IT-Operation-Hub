"use client";
import { useState } from "react";
import { Feedback } from "@/components/feedback/feedback";
import { useSession } from "@/features/auth/session";
import {
  managesAutomation,
  validateWorkflow,
  type WorkflowStep,
} from "@/lib/demo/automation-workflow";
import "./automation.css";
import { AutomationPolicyPanel } from "./automation-policy-panel";
export function AutomationScreen() {
  const { store, persona } = useSession();
  const [selection, setSelection] = useState<number>();
  const [draft, setDraft] = useState<{ base: number; steps: WorkflowStep[] }>();
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  if (!persona) return null;
  const management = managesAutomation(persona);
  const versions = store.workflow.read(persona, store.teams.ownTeamIds());
  const effective = versions[0];
  const selected =
    versions.find((item) => item.number === selection) ?? effective;
  if (!effective) return <Feedback kind="forbidden" />;
  function change(index: number, patch: Partial<WorkflowStep>) {
    setDraft((current) =>
      current
        ? {
            ...current,
            steps: current.steps.map((step, i) =>
              i === index ? { ...step, ...patch } : step,
            ),
          }
        : undefined,
    );
  }
  return (
    <div className="automation">
      <section className="automation-notice">
        <strong>Quyền điều phối phải có phạm vi rõ ràng</strong>
        <p>
          Phiên bản công bố được giữ để đối chiếu. Thay đổi bắt đầu từ bản nháp
          DEMO.
        </p>
      </section>
      {management && (
        <AutomationPolicyPanel
          versions={versions.map((version) => version.number)}
        />
      )}
      <section className="automation-panel" aria-label="Quy trình onboarding">
        <h2>Workflow onboarding</h2>
        {error && <p role="alert">{error}</p>}
        {notice && <p role="status">{notice}</p>}
        {!draft ? (
          <>
            <label>
              Phiên bản
              <select
                aria-label="Phiên bản"
                value={selected.number}
                onChange={(event) => setSelection(Number(event.target.value))}
              >
                {(management ? versions : [effective]).map((version) => (
                  <option key={version.number} value={version.number}>
                    v{version.number} · Đã công bố
                  </option>
                ))}
              </select>
            </label>
            <ol className="automation-steps">
              {selected.steps.map((step) => (
                <li key={step.id}>
                  <strong>
                    {step.id} · {step.title}
                  </strong>
                  <p>
                    {step.effort} phút · Phụ thuộc:{" "}
                    {step.dependencies.join(", ") || "Không"}
                  </p>
                  {management && <p>Nguồn: {step.source}</p>}
                </li>
              ))}
            </ol>
            {management && (
              <button
                className="ui-button"
                type="button"
                onClick={() => {
                  setDraft({
                    base: effective.number,
                    steps: structuredClone(effective.steps),
                  });
                  setNotice("");
                }}
              >
                Tạo bản nháp mới
              </button>
            )}
          </>
        ) : (
          <form
            className="automation-form"
            onSubmit={(event) => {
              event.preventDefault();
              const steps = draft.steps.map((step) => ({
                ...step,
                dependencies: step.dependencies
                  .map((id) => id.trim())
                  .filter(Boolean),
              }));
              const problem = validateWorkflow(steps);
              setError(problem ?? "");
              if (!problem) {
                setDraft({ ...draft, steps });
                setPreview(true);
              }
            }}
          >
            <h3>
              {preview ? "Xem trước công bố" : "Bản nháp"} v{draft.base + 1}
            </h3>
            {preview ? (
              <>
                <p>Công bố bản mới và giữ các phiên bản đã công bố.</p>
                <ol>
                  {draft.steps.map((step) => (
                    <li key={step.id}>
                      {step.id} · {step.title} · {step.effort} phút ·{" "}
                      {step.source}
                    </li>
                  ))}
                </ol>
                <div className="automation-actions">
                  <button
                    className="ui-button"
                    type="button"
                    onClick={() => {
                      const actor = store.getSnapshot();
                      const problem = actor
                        ? store.workflow.publish(actor, draft.base, draft.steps)
                        : "Phiên đã thay đổi.";
                      if (problem) {
                        setError(problem);
                        return;
                      }
                      setSelection(draft.base + 1);
                      setNotice("Đã công bố phiên bản mới.");
                      setDraft(undefined);
                      setPreview(false);
                    }}
                  >
                    Xác nhận công bố
                  </button>
                  <button
                    className="ui-button"
                    type="button"
                    data-variant="secondary"
                    onClick={() => setPreview(false)}
                  >
                    Quay lại chỉnh sửa
                  </button>
                </div>
              </>
            ) : (
              <>
                {draft.steps.map((step, index) => (
                  <fieldset key={step.id}>
                    <legend>{step.id}</legend>
                    <label>
                      Tên bước
                      <input
                        aria-label={"Tên bước " + step.id}
                        value={step.title}
                        onChange={(event) =>
                          change(index, { title: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      Công sức (phút)
                      <input
                        aria-label={"Công sức " + step.id}
                        type="number"
                        value={step.effort}
                        onChange={(event) =>
                          change(index, { effort: Number(event.target.value) })
                        }
                      />
                    </label>
                    <label>
                      Phụ thuộc
                      <input
                        aria-label={"Phụ thuộc " + step.id}
                        value={step.dependencies.join(",")}
                        onChange={(event) =>
                          change(index, {
                            dependencies: event.target.value.split(","),
                          })
                        }
                      />
                    </label>
                    <label>
                      Nguồn
                      <input
                        aria-label={"Nguồn " + step.id}
                        value={step.source}
                        onChange={(event) =>
                          change(index, { source: event.target.value })
                        }
                      />
                    </label>
                    <button
                      className="ui-button"
                      data-variant="secondary"
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          steps: draft.steps.filter((_, i) => i !== index),
                        })
                      }
                    >
                      Bỏ bước {step.id}
                    </button>
                  </fieldset>
                ))}
                <div className="automation-actions">
                  <button
                    className="ui-button"
                    type="button"
                    data-variant="secondary"
                    onClick={() => {
                      let next = 1;
                      while (
                        draft.steps.some(
                          (step) =>
                            step.id === "T" + String(next).padStart(2, "0"),
                        )
                      )
                        next++;
                      setDraft({
                        ...draft,
                        steps: [
                          ...draft.steps,
                          {
                            id: "T" + String(next).padStart(2, "0"),
                            title: "",
                            effort: 30,
                            dependencies: [],
                            source: "",
                          },
                        ],
                      });
                    }}
                  >
                    Thêm bước
                  </button>
                  <button className="ui-button" type="submit">
                    Xem trước công bố
                  </button>
                  <button
                    className="ui-button"
                    type="button"
                    data-variant="secondary"
                    onClick={() => {
                      setDraft(undefined);
                      setError("");
                    }}
                  >
                    Hủy bản nháp
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </section>
    </div>
  );
}
