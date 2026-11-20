"use client";
import { useState } from "react";
import { useSession } from "@/features/auth/session";
import type { WorkforceChange, WorkforcePreview } from "@/lib/demo/workforce";

export function WorkforceEditor({
  people,
}: {
  people: { id: string; name: string }[];
}) {
  const { store } = useSession();
  const [person, setPerson] = useState(people[0]?.id ?? "");
  const [kind, setKind] = useState<WorkforceChange["kind"]>("absence");
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("12:00");
  const [budget, setBudget] = useState("360");
  const [skill, setSkill] = useState("");
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState<WorkforcePreview>();
  const [error, setError] = useState("");
  return (
    <section className="workforce-panel" aria-label="Cập nhật nhân sự">
      <h2>Lịch nhân sự và kỹ năng</h2>
      <p>Khung DEMO ngày 20/11/2026 · GMT+7 · Ngân sách theo phút mỗi ngày</p>
      {error && <p role="alert">{error}</p>}
      {preview ? (
        <div aria-label="Xem trước thay đổi">
          <h3>Xem trước thay đổi</h3>
          <p>{preview.name}</p>
          <p>Trước: {preview.before}</p>
          <p>Sau: {preview.after}</p>
          <h4>Công việc có thể bị ảnh hưởng</h4>
          {preview.affected.length ? (
            <ul>
              {preview.affected.map((task) => (
                <li key={task.id}>
                  {task.id} · {task.title} · Còn {task.remaining} phút
                </li>
              ))}
            </ul>
          ) : (
            <p>Không có công việc trong khung mẫu bị ảnh hưởng.</p>
          )}
          <button
            className="ui-button"
            type="button"
            data-variant="secondary"
            onClick={() => setPreview(undefined)}
          >
            Quay lại chỉnh sửa
          </button>
        </div>
      ) : (
        <form
          className="workforce-editor"
          onSubmit={(event) => {
            event.preventDefault();
            const actor = store.getSnapshot();
            if (!actor) {
              setError("Phiên đã thay đổi.");
              return;
            }
            const outcome = store.workforce.preview(actor, {
              person,
              kind,
              start,
              end,
              budget,
              skill,
              note,
            });
            if (outcome.kind === "error") {
              setError(outcome.message);
              return;
            }
            setError("");
            setPreview(outcome);
          }}
        >
          <label>
            Nhân sự
            <select
              aria-label="Nhân sự"
              value={person}
              onChange={(event) => setPerson(event.target.value)}
            >
              {people.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Loại thay đổi
            <select
              aria-label="Loại thay đổi"
              value={kind}
              onChange={(event) =>
                setKind(event.target.value as WorkforceChange["kind"])
              }
            >
              <option value="absence">Vắng có kế hoạch</option>
              <option value="schedule">Giờ làm việc và ngân sách</option>
              <option value="skill">Xác minh kỹ năng</option>
            </select>
          </label>
          {kind === "skill" ? (
            <label>
              Kỹ năng
              <input
                aria-label="Kỹ năng"
                required
                value={skill}
                onChange={(event) => setSkill(event.target.value)}
                maxLength={80}
              />
            </label>
          ) : (
            <>
              <div className="workforce-editor-period">
                <label>
                  Từ
                  <input
                    aria-label="Từ"
                    type="time"
                    required
                    value={start}
                    onChange={(event) => setStart(event.target.value)}
                  />
                </label>
                <label>
                  Đến
                  <input
                    aria-label="Đến"
                    type="time"
                    required
                    value={end}
                    onChange={(event) => setEnd(event.target.value)}
                  />
                </label>
              </div>
              {kind === "schedule" && (
                <label>
                  Ngân sách (phút/ngày)
                  <input
                    aria-label="Ngân sách (phút/ngày)"
                    type="number"
                    required
                    min={0}
                    max={1440}
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                  />
                </label>
              )}
            </>
          )}
          <label>
            Ghi chú nội bộ
            <textarea
              aria-label="Ghi chú nội bộ"
              value={note}
              maxLength={2000}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
          <button className="ui-button" type="submit">
            Xem trước thay đổi
          </button>
        </form>
      )}
    </section>
  );
}
