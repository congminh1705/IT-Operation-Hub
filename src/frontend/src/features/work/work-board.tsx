"use client";
import { useState } from "react";
import { Feedback } from "@/components/feedback/feedback";
import { useSession } from "@/features/auth/session";
import { workStates } from "@/lib/demo/work-board";
import { effectiveScope } from "@/lib/navigation";
import { formatBusinessTime } from "@/lib/dates";
import "./work-board.css";
import { WorkPlan } from "./work-plan";
export function WorkBoard({ scope }: { scope?: string }) {
  const { store, persona } = useSession();
  const [showPlan, setShowPlan] = useState(false);
  const [view, setView] = useState<"cards" | "table">("cards");
  const [filter, setFilter] = useState("");
  const [state, setState] = useState("");
  if (!persona) return null;
  if (persona.user.role === "REQUESTER") return <Feedback kind="forbidden" />;
  const rows = store.work
    .list(
      persona,
      store.teams.ownTeamIds(),
      effectiveScope(persona, "/work", scope),
    )
    .filter(
      (row) =>
        (!state || row.state === state) &&
        [row.id, row.ticket, row.title, row.assignee].some((value) =>
          value
            .toLocaleLowerCase("vi")
            .includes(filter.trim().toLocaleLowerCase("vi")),
        ),
    );
  const planTasks = store.work.list(persona, store.teams.ownTeamIds(), "team");
  const hasPlan = planTasks.some((row) => row.ticket === "TKT-000127");
  if (showPlan && hasPlan)
    return (
      <div className="work-board">
        <button
          type="button"
          className="ui-button work-back"
          data-variant="secondary"
          onClick={() => setShowPlan(false)}
        >
          Về bảng công việc
        </button>
        <WorkPlan rows={planTasks} />
      </div>
    );
  return (
    <div className="work-board">
      <div className="work-board-summary">
        <strong>{rows.length} công việc</strong>
        <p>Hoàn thành công việc không tự đóng yêu cầu.</p>
        {hasPlan && (
          <button
            type="button"
            className="ui-button"
            data-variant="secondary"
            onClick={() => setShowPlan(true)}
          >
            Xem kế hoạch
          </button>
        )}
      </div>
      <section className="work-panel" aria-label="Bộ lọc công việc">
        <div className="work-controls">
          <label>
            Tìm công việc
            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
          </label>
          <label>
            Trạng thái
            <select
              aria-label="Trạng thái"
              value={state}
              onChange={(event) => setState(event.target.value)}
            >
              <option value="">Tất cả</option>
              {Object.entries(workStates).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div
            className="work-controls"
            role="group"
            aria-label="Chế độ hiển thị"
          >
            <button
              className="ui-button"
              data-variant="secondary"
              aria-pressed={view === "cards"}
              type="button"
              onClick={() => setView("cards")}
            >
              Thẻ
            </button>
            <button
              className="ui-button"
              data-variant="secondary"
              aria-pressed={view === "table"}
              type="button"
              onClick={() => setView("table")}
            >
              Bảng
            </button>
          </div>
        </div>
      </section>
      {!rows.length ? (
        <Feedback kind="filter-empty" />
      ) : view === "cards" ? (
        <div className="work-columns">
          {Object.entries(workStates)
            .filter(
              ([id]) =>
                ["ready", "active", "blocked"].includes(id) ||
                rows.some((row) => row.state === id),
            )
            .map(([id, label]) => {
              const group = rows.filter((row) => row.state === id);
              return (
                <section key={id} className="work-panel">
                  <h2>
                    {label} · {group.length}
                  </h2>
                  {group.map((row) => (
                    <article
                      className="work-card"
                      key={row.id}
                      data-work-id={row.id}
                    >
                      <p>
                        {row.id} · {row.ticket}
                      </p>
                      <h3>{row.title}</h3>
                      <p className="work-state" data-state={row.state}>
                        {workStates[row.state]}
                        {row.locked && " · Đang khóa"}
                      </p>
                      <p>
                        {row.assignee} · Còn {row.remaining} phút
                      </p>
                      <p>Hạn {formatBusinessTime(row.deadline)}</p>
                      <p>Phụ thuộc: {row.dependencies.join(", ") || "Không"}</p>
                    </article>
                  ))}
                  {!group.length && <p>Chưa có công việc ở trạng thái này.</p>}
                </section>
              );
            })}
        </div>
      ) : (
        <div
          className="work-panel work-table"
          role="region"
          aria-label="Bảng công việc"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                <th>Công việc</th>
                <th>Trạng thái</th>
                <th>Phụ trách</th>
                <th>Còn lại</th>
                <th>Hạn</th>
                <th>Phụ thuộc</th>
                <th>Khóa</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} data-work-id={row.id}>
                  <th scope="row">
                    {row.id} · {row.title}
                    <small>{row.ticket}</small>
                  </th>
                  <td>{workStates[row.state]}</td>
                  <td>{row.assignee}</td>
                  <td>{row.remaining} phút</td>
                  <td>{formatBusinessTime(row.deadline)}</td>
                  <td>{row.dependencies.join(", ") || "Không"}</td>
                  <td>{row.locked ? "Đang khóa" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
