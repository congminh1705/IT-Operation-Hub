"use client";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/session";
import {
  priorities,
  type Budgets,
  type BudgetDraft,
  type Priority,
} from "@/lib/demo/sla-policy";
import "./users-screen.css";
import "./sla-screen.css";

function toDraft(budgets: Budgets): BudgetDraft {
  return {
    P1: strings(budgets.P1),
    P2: strings(budgets.P2),
    P3: strings(budgets.P3),
    P4: strings(budgets.P4),
  };
}
function strings(budget: Budgets[Priority]) {
  return {
    response: String(budget.response),
    resolution: String(budget.resolution),
  };
}
function BudgetTable({
  budgets,
  previous,
}: {
  budgets: Budgets;
  previous?: Budgets;
}) {
  return (
    <div
      className="directory-table sla-table"
      tabIndex={0}
      role="region"
      aria-label={previous ? "So sánh ngân sách" : "Ngân sách hiện hành"}
    >
      <table>
        <thead>
          <tr>
            <th scope="col">Ưu tiên</th>
            <th scope="col">Phản hồi (phút)</th>
            <th scope="col">Giải quyết (phút)</th>
          </tr>
        </thead>
        <tbody>
          {priorities.map((priority) => (
            <tr key={priority}>
              <th scope="row">{priority}</th>
              {(["response", "resolution"] as const).map((field) => (
                <td key={field}>
                  {previous ? `${previous[priority][field]} → ` : ""}
                  {budgets[priority][field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SlaScreen() {
  const { store } = useSession();
  const policy = store.sla;
  const data = policy.read();
  if (!data) return null;
  return <SlaEditor policy={policy} initial={data} />;
}

type Policy = ReturnType<typeof useSession>["store"]["sla"];
type Snapshot = NonNullable<ReturnType<Policy["read"]>>;
function SlaEditor({ policy, initial }: { policy: Policy; initial: Snapshot }) {
  const [data, setData] = useState(initial);
  const [draft, setDraft] = useState(() => toDraft(initial.current.budgets));
  const [priority, setPriority] = useState<Priority>("P3");
  const [reason, setReason] = useState("");
  const [preview, setPreview] = useState<Budgets>();
  const [error, setError] = useState<{ error: string; field?: string }>();
  const [notice, setNotice] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const previewHeading = useRef<HTMLHeadingElement>(null);
  const previewButton = useRef<HTMLButtonElement>(null);
  const version = data.current.number;
  function inspect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (preview) return;
    const result = policy.preview(version, draft, reason);
    setNotice("");
    setError(undefined);
    if (!result.ok) {
      setError(result);
      if (result.priority) setPriority(result.priority);
      requestAnimationFrame(() => {
        const field =
          result.field && form.current?.elements.namedItem(result.field);
        if (field instanceof HTMLElement) field.focus();
        else document.getElementById("sla-error")?.focus();
      });
      return;
    }
    setPreview(result.budgets);
    requestAnimationFrame(() => previewHeading.current?.focus());
  }
  function confirm() {
    const result = policy.save(version, draft, reason);
    setPreview(undefined);
    if (!result.ok) {
      setError(result);
      requestAnimationFrame(() =>
        document.getElementById("sla-error")?.focus(),
      );
      return;
    }
    const refreshed = policy.read();
    if (!refreshed) return;
    setData(refreshed);
    setDraft(toDraft(refreshed.current.budgets));
    setReason("");
    setNotice(`Đã lưu phiên bản v${refreshed.current.number} DEMO.`);
    requestAnimationFrame(() => document.getElementById("sla-notice")?.focus());
  }
  return (
    <div className="directory-grid">
      <section className="directory-panel directory-card">
        <h2>Ngân sách SLA mặc định · v{version}</h2>
        <p>Hai đồng hồ độc lập: phản hồi đầu tiên và giải quyết.</p>
        <BudgetTable budgets={data.current.budgets} />
        <form className="sla-editor" ref={form} onSubmit={inspect} noValidate>
          <fieldset disabled={!!preview}>
            <div className="directory-pair">
              <label>
                Ưu tiên đang chỉnh
                <select
                  aria-label="Ưu tiên đang chỉnh"
                  value={priority}
                  onChange={(event) => {
                    setPriority(event.target.value as Priority);
                    setError(undefined);
                  }}
                >
                  {priorities.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              {(["response", "resolution"] as const).map((field) => (
                <label key={field}>
                  {field === "response"
                    ? "Phản hồi đầu (phút)"
                    : "Giải quyết (phút)"}
                  <input
                    name={field}
                    type="number"
                    min={1}
                    step={1}
                    required
                    value={draft[priority][field]}
                    aria-invalid={error?.field === field}
                    aria-describedby={
                      error?.field === field ? "sla-error" : undefined
                    }
                    onChange={(event) => {
                      setDraft({
                        ...draft,
                        [priority]: {
                          ...draft[priority],
                          [field]: event.target.value,
                        },
                      });
                      setError(undefined);
                    }}
                  />
                </label>
              ))}
            </div>
            <label>
              Lý do thay đổi
              <textarea
                name="reason"
                required
                value={reason}
                aria-invalid={error?.field === "reason"}
                aria-describedby={
                  error?.field === "reason" ? "sla-error" : undefined
                }
                onChange={(event) => {
                  setReason(event.target.value);
                  setError(undefined);
                }}
              />
            </label>
            <div className="directory-actions">
              <Button type="submit" ref={previewButton}>
                Xem trước phiên bản mới
              </Button>
            </div>
          </fieldset>
        </form>
        {error && (
          <p id="sla-error" role="alert" tabIndex={-1}>
            {error.error}
          </p>
        )}
        {notice && (
          <p id="sla-notice" role="status" tabIndex={-1}>
            {notice}
          </p>
        )}
        {preview && (
          <section className="directory-preview access-result">
            <h3 tabIndex={-1} ref={previewHeading}>
              Xem trước v{version} → v{version + 1}
            </h3>
            <BudgetTable budgets={preview} previous={data.current.budgets} />
            <p>Lý do: {reason.trim()}</p>
            <div className="directory-actions">
              <Button
                variant="secondary"
                onClick={() => {
                  setPreview(undefined);
                  requestAnimationFrame(() => previewButton.current?.focus());
                }}
              >
                Hủy xem trước
              </Button>
              <Button onClick={confirm}>Xác nhận lưu</Button>
            </div>
          </section>
        )}
      </section>
      <aside className="directory-panel directory-card">
        <div className="directory-note">
          <strong>Chỉ áp dụng cho ticket mới</strong>
          <p>Ticket đã tạo giữ ngân sách SLA của phiên bản lúc tạo.</p>
        </div>
        <h2>Đối chiếu ticket DEMO</h2>
        <p data-testid="sla-old-ticket">
          {data.existingTicket.id} · {data.existingTicket.priority} · v
          {data.existingTicket.version} · {data.existingTicket.response}/
          {data.existingTicket.resolution} phút
        </p>
        <p data-testid="sla-new-ticket">
          Ticket mới · {data.newTicket.priority} · v{data.newTicket.version} ·{" "}
          {data.newTicket.response}/{data.newTicket.resolution} phút
        </p>
        <h2>Lịch sử cấu hình</h2>
        <ul className="sla-history">
          {data.history.map((item) => (
            <li key={item.number}>
              <strong>
                v{item.number} ·{" "}
                {item.number === version ? "Hiện hành" : "Chỉ đọc"}
              </strong>
              <p>
                {item.actor} · {item.savedAt.slice(0, 10)} · {item.reason}
              </p>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
