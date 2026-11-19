"use client";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/session";
import type { TeamChange } from "@/lib/demo/team-directory";
import "./users-screen.css";
import "./catalog-screen.css";

export function TeamsScreen() {
  const { store } = useSession();
  const directory = store.teams;
  const teams = directory.list();
  const people = directory.people();
  const [teamId, setTeamId] = useState("support");
  const [action, setAction] = useState<TeamChange["action"]>("save");
  const [draft, setDraft] = useState<TeamChange>();
  const [notice, setNotice] = useState("");
  const resultTitle = useRef<HTMLHeadingElement>(null);
  const team = teams.find((item) => item.id === teamId);
  const result = draft ? directory.preview(draft) : undefined;
  const candidates = people.filter(
    (person) => team?.members.includes(person.id) === (action === "remove"),
  );
  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const change: TeamChange =
      action === "save"
        ? {
            action,
            teamId,
            name: String(data.get("name") ?? ""),
            scope: String(data.get("scope") ?? ""),
          }
        : action === "add" || action === "remove"
          ? { action, teamId, memberId: String(data.get("member") ?? "") }
          : { action, teamId };
    setNotice("");
    setDraft(change);
    requestAnimationFrame(() => resultTitle.current?.focus());
  }
  return (
    <div className="directory-grid">
      <section className="directory-panel">
        <header className="directory-head">
          <div>
            <h2>Nhóm hỗ trợ</h2>
            <p>
              Nhóm tiếp nhận hiện tại:{" "}
              <strong data-testid="active-intake">
                {directory.intakeName()}
              </strong>
            </p>
          </div>
          <Button
            onClick={() => {
              setTeamId("");
              setAction("save");
              setDraft(undefined);
              setNotice("");
            }}
          >
            Thêm nhóm
          </Button>
        </header>
        <div
          className="directory-table"
          tabIndex={0}
          role="region"
          aria-label="Danh sách nhóm"
        >
          <table>
            <thead>
              <tr>
                <th scope="col">Nhóm</th>
                <th scope="col">Thành viên</th>
                <th scope="col">Phạm vi</th>
                <th scope="col">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((item) => (
                <tr key={item.id}>
                  <th scope="row">{item.name}</th>
                  <td>
                    {people
                      .filter((person) => item.members.includes(person.id))
                      .map((person) => person.display_name)
                      .join(", ") || "Chưa có"}
                  </td>
                  <td>{item.scope}</td>
                  <td>
                    {item.intake
                      ? "Tiếp nhận mặc định"
                      : item.active
                        ? "Đang hoạt động"
                        : "Ngừng sử dụng"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form
          className="directory-card"
          onSubmit={review}
          onChange={() => {
            setDraft(undefined);
            setNotice("");
          }}
          key={teamId + ":" + action}
          noValidate
        >
          <h2>Cấu hình nhóm và thành viên</h2>
          <label>
            Nhóm
            <select
              aria-label="Nhóm"
              value={teamId}
              onChange={(event) => {
                setTeamId(event.target.value);
                setAction("save");
              }}
            >
              <option value="">Nhóm mới</option>
              {teams.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          {team && (
            <label>
              Thao tác
              <select
                aria-label="Thao tác"
                value={action}
                onChange={(event) =>
                  setAction(event.target.value as TeamChange["action"])
                }
              >
                <option value="save">Sửa nhóm</option>
                <option value="add">Thêm thành viên</option>
                <option value="remove">Gỡ thành viên</option>
                <option value="intake">Đặt làm nhóm tiếp nhận</option>
                <option value="clear-intake">Bỏ nhóm tiếp nhận</option>
                <option value="deactivate">Ngừng sử dụng nhóm</option>
              </select>
            </label>
          )}
          {action === "save" && (
            <>
              <label>
                Tên nhóm
                <input name="name" defaultValue={team?.name} required />
              </label>
              <label>
                Phạm vi
                <input name="scope" defaultValue={team?.scope} required />
              </label>
            </>
          )}
          {(action === "add" || action === "remove") && (
            <label>
              Thành viên
              <select aria-label="Thành viên" name="member" defaultValue="">
                <option value="">Chọn thành viên</option>
                {candidates.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.display_name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="directory-actions">
            <Button type="submit">Xem tác động</Button>
          </div>
        </form>
      </section>
      <aside className="directory-panel directory-card">
        <h2 ref={resultTitle} tabIndex={-1}>
          Kiểm tra trước khi lưu
        </h2>
        <p>
          Giữ đúng một nhóm tiếp nhận đang hoạt động. Kiểm tra công việc đang
          giao trước khi gỡ thành viên hoặc ngừng sử dụng nhóm.
        </p>
        {draft && result && (
          <div className="directory-preview access-result">
            <h3>Tác động dự kiến</h3>
            {draft.action === "intake" && (
              <p>
                Tiếp nhận dự kiến: {team?.name}. Công việc đã giao giữ nguyên
                nhóm.
              </p>
            )}
            {draft.action === "remove" && (
              <p>
                Phạm vi dự kiến chỉ mất quyền theo nhóm này. Các nhóm khác không
                đổi.
              </p>
            )}
            {result.affected.length ? (
              <ul>
                {result.affected.map((item) => (
                  <li key={item.id}>
                    {item.id} · {item.state}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Không có công việc đang giao bị ảnh hưởng trong fixture.</p>
            )}
            {result.error && (
              <p className="access-blocked" role="alert">
                {result.error}
              </p>
            )}
            <div className="directory-actions">
              <Button variant="secondary" onClick={() => setDraft(undefined)}>
                Hủy
              </Button>
              <Button
                disabled={!!result.error}
                onClick={() => {
                  const outcome = directory.apply(draft);
                  if (outcome.error) {
                    setNotice(outcome.error);
                    return;
                  }
                  setDraft(undefined);
                  setNotice("Đã lưu cấu hình DEMO.");
                }}
              >
                Xác nhận lưu
              </Button>
            </div>
          </div>
        )}
        {notice && <p role="status">{notice}</p>}
      </aside>
    </div>
  );
}
