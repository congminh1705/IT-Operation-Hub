"use client";
import { useState } from "react";
import { Feedback } from "@/components/feedback/feedback";
import {
  planLabels,
  planLevels,
  planRows,
  type PlanVersion,
} from "@/lib/demo/work-plan";
import { workStates, type WorkItem } from "@/lib/demo/work-board";
import { formatBusinessTime } from "@/lib/dates";
export function WorkPlan({ rows }: { rows: WorkItem[] }) {
  const [version, setVersion] = useState<PlanVersion>("v3");
  const tasks = planRows(rows, version);
  const diagram = planLevels(tasks);
  const source =
    version === "v3"
      ? "Điều phối DEMO · Kế hoạch đang hiệu lực"
      : version === "v1"
        ? "Phiên bản khởi tạo · Lịch sử chỉ đọc"
        : version === "v2"
          ? "Điều chỉnh phạm vi DEMO · Lịch sử chỉ đọc"
          : "Kịch bản kiểm tra DEMO";
  return (
    <section className="work-panel" aria-label="Kế hoạch và phụ thuộc">
      <h2>Kế hoạch &amp; phụ thuộc</h2>
      <label>
        Phiên bản kế hoạch
        <select
          aria-label="Phiên bản kế hoạch"
          value={version}
          onChange={(event) => setVersion(event.target.value as PlanVersion)}
        >
          {Object.entries(planLabels).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <p>{planLabels[version]} · TKT-000127</p>
      <p>Nguồn: {source}</p>
      {version === "stale" ? (
        <Feedback
          kind="conflict"
          action={{
            label: "Xem phiên bản hiệu lực",
            onClick: () => setVersion("v3"),
          }}
        />
      ) : !tasks.length ? (
        <Feedback kind="empty" title="Không có công việc trong kế hoạch" />
      ) : (
        <>
          {diagram.kind === "success" ? (
            <section aria-label="Luồng phụ thuộc">
              <h3>Luồng phụ thuộc</h3>
              <ol className="work-plan-levels">
                {diagram.levels.map((level, index) => (
                  <li key={index}>
                    <strong>Bước {index + 1}</strong>
                    {level.map((row) => (
                      <div key={row.id} className="work-card">
                        <b>{row.id}</b> · {row.title}
                        <p>
                          {workStates[row.state]}
                          {row.locked ? " · Đang khóa" : ""}
                        </p>
                      </div>
                    ))}
                  </li>
                ))}
              </ol>
            </section>
          ) : (
            <Feedback
              kind="error"
              title={
                diagram.kind === "cycle"
                  ? "Kế hoạch có chu trình phụ thuộc"
                  : "Kế hoạch có phụ thuộc không hợp lệ"
              }
            />
          )}
          <h3>Danh sách phụ thuộc</h3>
          <ul>
            {tasks.map((row) => {
              const waiting = row.dependencies.filter(
                (id) => tasks.find((item) => item.id === id)?.state !== "done",
              );
              return (
                <li key={row.id} className="work-plan-item">
                  <strong>
                    {row.id} · {row.title}
                  </strong>
                  <p>
                    Phụ thuộc: {row.dependencies.join(", ") || "Không"}
                    {waiting.length > 0
                      ? " · Chờ hoàn tất " + waiting.join(", ")
                      : ""}
                  </p>
                  <p>
                    {row.assignee} · Còn {row.remaining} phút · Hạn{" "}
                    {formatBusinessTime(row.deadline)}
                  </p>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
