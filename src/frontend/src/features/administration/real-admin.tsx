"use client";

import Link from "next/link";
import { useOptionalRealSession } from "@/features/auth/real-session";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Feedback } from "@/components/feedback/feedback";
import { roleLabels } from "@/lib/navigation";
import { type AdminPath, type AdminOutcome } from "@/lib/api/http-account";
import type { Role, UserView } from "@/lib/api/types";
import "./users-screen.css";
import "./catalog-screen.css";
import "./real-admin.css";
import "../auth/profile-form.css";

type NamedRecord = {
  id: string;
  name: string;
  active: boolean;
  version: number;
  intake?: boolean;
};
type Account = UserView & {
  department_id: string | null;
  handover_pending: boolean;
};
type Page<T> = { items: T[]; total: number; page: number; page_size: number };
type Handover = {
  version: number;
  items: Array<{
    id: string;
    kind: "ticket" | "task";
    version: number;
    status: string;
    team_id: string;
    requires_replacement: boolean;
    protected_work: boolean;
  }>;
};
type Priority = (typeof priorities)[number];
type Budget = { response_seconds: number; resolution_seconds: number };
type Policy = { version: number; priority_budgets: Record<Priority, Budget> };
const priorities = ["P1", "P2", "P3", "P4"] as const;

const users = "/api/v1/users";
const departments = "/api/v1/departments";
const value = (data: FormData, key: string) =>
  String(data.get(key) ?? "").trim();

function outcomeText(result: AdminOutcome<unknown>) {
  if (result.kind === "conflict")
    return `Dữ liệu hoặc điều kiện bàn giao đã thay đổi (${result.error.code}). Tải lại và kiểm tra trước khi gửi tiếp.`;
  if (result.kind === "validation")
    return `Thông tin chưa hợp lệ (${result.error.code}).`;
  if (result.kind === "forbidden")
    return "Bạn không có quyền thực hiện thao tác này.";
  return "Chưa xác nhận được kết quả. Kiểm tra trạng thái trên máy chủ trước khi gửi lại.";
}

function useRead<T>(path?: AdminPath) {
  const admin = useOptionalRealSession()!.admin;
  const [result, setResult] = useState<{
    path: AdminPath;
    outcome: AdminOutcome<T>;
  }>();
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    void admin<T>(path, { signal: controller.signal }).then((result) => {
      if (!controller.signal.aborted) setResult({ path, outcome: result });
    });
    return () => controller.abort();
  }, [admin, path, revision]);
  return {
    state: result && result.path === path ? result.outcome : undefined,
    reload: () => setRevision((previous) => previous + 1),
  };
}

function useCollection<T>(resource?: AdminPath) {
  const admin = useOptionalRealSession()!.admin;
  const [result, setResult] = useState<{
    resource: AdminPath;
    outcome: AdminOutcome<Page<T>>;
  }>();
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!resource) return;
    const controller = new AbortController();
    const { signal } = controller;
    async function collect(path: AdminPath) {
      const items = new Map<string, T>();
      for (let page = 1; !signal.aborted; page += 1) {
        const response = await admin<Page<T & { id: string }>>(
          `${path}?page=${page}&page_size=100` as AdminPath,
          { signal },
        );
        if (signal.aborted) return;
        if (response.kind !== "success") {
          setResult({ resource: path, outcome: response });
          return;
        }
        for (const row of response.data.items) items.set(row.id, row);
        if (
          !response.data.items.length ||
          page * response.data.page_size >= response.data.total
        ) {
          setResult({
            resource: path,
            outcome: {
              ...response,
              data: { ...response.data, items: [...items.values()] },
            },
          });
          return;
        }
      }
    }
    void collect(resource);
    return () => controller.abort();
  }, [admin, resource, revision]);
  return {
    state: result?.resource === resource ? result?.outcome : undefined,
    reload: () => setRevision((current) => current + 1),
  };
}

function Form({
  title,
  path,
  method,
  body,
  onSaved,
  children,
}: {
  title: string;
  path: AdminPath;
  method: "POST" | "PATCH";
  body: (data: FormData) => Record<string, unknown>;
  onSaved: () => void;
  children: React.ReactNode;
}) {
  const admin = useOptionalRealSession()!.admin;
  const [busy, setBusy] = useState(false);
  const commandKey = useRef<string>(undefined);
  const [message, setMessage] = useState<{ text: string; error: boolean }>();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    setBusy(true);
    setMessage(undefined);
    try {
      const result = await admin(path, {
        method,
        body: body(new FormData(form)),
        key: (commandKey.current ??= crypto.randomUUID()),
      });
      if (result.kind !== "unknown" && result.kind !== "pending")
        commandKey.current = undefined;
      if (result.kind === "success") {
        form
          .querySelectorAll<HTMLInputElement>('input[type="password"]')
          .forEach((field) => {
            field.value = "";
          });
        setMessage({ text: "Đã lưu thay đổi.", error: false });
        onSaved();
      } else {
        setMessage({ text: outcomeText(result), error: true });
      }
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      className="directory-card profile-panel profile-form real-admin-form"
      onSubmit={submit}
      onChange={() => {
        commandKey.current = undefined;
      }}
    >
      <h2>{title}</h2>
      <fieldset disabled={busy}>
        {children}
        <Button type="submit">{busy ? "Đang lưu…" : "Lưu thay đổi"}</Button>
      </fieldset>
      {message && (
        <p role={message.error ? "alert" : "status"}>{message.text}</p>
      )}
    </form>
  );
}

function Loaded<T>({
  state,
  reload,
  children,
}: {
  state?: AdminOutcome<T>;
  reload: () => void;
  children: (data: T) => React.ReactNode;
}) {
  if (!state) return <p role="status">Đang tải dữ liệu…</p>;
  if (state.kind === "success") return children(state.data);
  return (
    <Feedback
      kind={state.kind === "forbidden" ? "forbidden" : "error"}
      title={outcomeText(state)}
      action={{ label: "Tải lại", onClick: reload }}
    />
  );
}

function Reason() {
  return (
    <label>
      Lý do thay đổi{" "}
      <input name="reason" required minLength={10} maxLength={1000} />
    </label>
  );
}

function RoleSelect({ role = "REQUESTER" }: { role?: Role }) {
  return (
    <label>
      Vai trò{" "}
      <select name="role" defaultValue={role}>
        {Object.entries(roleLabels).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

function DepartmentSelect({
  rows,
  selected,
}: {
  rows: NamedRecord[];
  selected?: string | null;
}) {
  return (
    <label>
      Phòng ban{" "}
      <select name="department_id" defaultValue={selected ?? ""} required>
        <option value="" disabled>
          Chọn phòng ban
        </option>
        {rows
          .filter((row) => row.active || row.id === selected)
          .map((row) => (
            <option key={row.id} value={row.id}>
              {row.name}
            </option>
          ))}
      </select>
    </label>
  );
}

function UserCreate() {
  const read = useCollection<NamedRecord>(departments);
  return (
    <Loaded {...read}>
      {({ items }) => (
        <Form
          title="Tạo người dùng"
          path={users}
          method="POST"
          onSaved={() => undefined}
          body={(data) => ({
            email: value(data, "email"),
            display_name: value(data, "display_name"),
            department_id: value(data, "department_id"),
            role: value(data, "role"),
            verification_id: value(data, "verification_id"),
            initial_password: data.get("initial_password"),
          })}
        >
          <label>
            Họ và tên <input name="display_name" required maxLength={120} />
          </label>
          <label>
            Email công việc{" "}
            <input name="email" type="email" required maxLength={254} />
          </label>
          <DepartmentSelect rows={items} />
          <RoleSelect />
          <label>
            Mã xác minh D-29 <input name="verification_id" required />
          </label>
          <label>
            Mật khẩu tạm thời{" "}
            <input
              name="initial_password"
              type="password"
              autoComplete="new-password"
              required
              minLength={15}
              maxLength={128}
            />
          </label>
          <Link href="/admin/users">Về danh sách người dùng</Link>
        </Form>
      )}
    </Loaded>
  );
}

function handoverDecisions(data: FormData, items: Handover["items"]) {
  return items.map((item) => ({
    id: item.id,
    kind: item.kind,
    expectedVersion: item.version,
    replacement_user_id: value(data, item.id) || null,
    protected_work_reviewed:
      item.kind === "task" && data.has(`review-${item.id}`),
    allocations: data.getAll(`start-${item.id}`).flatMap((start, index) => {
      const end = data.getAll(`end-${item.id}`)[index];
      if (!start && !end) return [];
      return [{ starts_at: String(start).trim(), ends_at: String(end).trim() }];
    }),
  }));
}

function AllocationFields({ id }: { id: string }) {
  const [count, setCount] = useState(0);
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          <label>
            Bắt đầu (ISO 8601){" "}
            <input
              name={`start-${id}`}
              placeholder="2026-12-01T09:00:00+07:00"
            />
          </label>
          <label>
            Kết thúc (ISO 8601){" "}
            <input name={`end-${id}`} placeholder="2026-12-01T10:00:00+07:00" />
          </label>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        disabled={count >= 366}
        onClick={() => setCount(count + 1)}
      >
        Thêm khung giờ
      </Button>
    </>
  );
}

function UserChange({
  account,
  rows,
  users: candidates,
  reload,
}: {
  account: Account;
  rows: NamedRecord[];
  users: Account[];
  reload: () => void;
}) {
  const handover = useRead<Handover>(`${users}/${account.id}/handover`);
  return (
    <Loaded {...handover}>
      {(review) => {
        const repair = account.handover_pending;
        const body = (data: FormData) => {
          const suspend = data.has("suspend");
          const picks = suspend ? [] : handoverDecisions(data, review.items);
          const base = {
            expectedVersion: account.version,
            reason: value(data, "reason"),
            handover: picks,
          };
          if (repair) return base;
          if (suspend)
            return {
              ...base,
              active: false,
              suspend_without_replacement: true,
            };
          const department = value(data, "department_id");
          return {
            ...base,
            active: value(data, "active") === "yes",
            role: value(data, "role"),
            ...(department ? { department_id: department } : {}),
          };
        };
        return (
          <Form
            key={account.id}
            title={account.display_name}
            path={
              repair
                ? `${users}/${account.id}/handover`
                : `${users}/${account.id}`
            }
            method={repair ? "POST" : "PATCH"}
            body={body}
            onSaved={() => {
              reload();
              handover.reload();
            }}
          >
            <p>Phiên bản {account.version}</p>
            {!repair && (
              <>
                <RoleSelect role={account.role} />
                {(account.department_id || rows.some((row) => row.active)) && (
                  <DepartmentSelect
                    rows={rows}
                    selected={account.department_id}
                  />
                )}
                <label>
                  Trạng thái{" "}
                  <select
                    name="active"
                    defaultValue={account.active ? "yes" : "no"}
                  >
                    <option value="yes">Hoạt động</option>
                    <option value="no">Khóa</option>
                  </select>
                </label>
                {account.active && (
                  <label>
                    <input name="suspend" type="checkbox" /> Thu hồi khẩn cấp,
                    chờ bàn giao
                  </label>
                )}
              </>
            )}
            <WorkFields
              items={review.items}
              candidates={candidates.filter(
                (row) =>
                  row.id !== account.id &&
                  row.active &&
                  row.role !== "REQUESTER",
              )}
            />
            <Reason />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                reload();
                handover.reload();
              }}
            >
              Tải phiên bản mới nhất
            </Button>
          </Form>
        );
      }}
    </Loaded>
  );
}

function Users() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState("");
  const read = useRead<Page<Account>>(`${users}?page=${page}&page_size=100`);
  const org = useCollection<NamedRecord>(selected ? departments : undefined);
  const candidates = useCollection<Account>(selected ? users : undefined);
  return (
    <Loaded {...read}>
      {({ items, total, page_size }) => {
        const account = items.find((row) => row.id === selected);
        return (
          <section className="directory-panel">
            <header className="directory-head">
              <h2>Người dùng</h2>
              <Link
                className="ui-button"
                data-variant="primary"
                href="/admin/users/new"
              >
                Tạo người dùng
              </Link>
            </header>
            <div className="directory-table">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Người dùng</th>
                    <th scope="col">Vai trò</th>
                    <th scope="col">Trạng thái</th>
                    <th scope="col">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr key={row.id}>
                      <td>
                        {row.display_name}
                        <br />
                        {row.email}
                      </td>
                      <td>{roleLabels[row.role]}</td>
                      <td>{row.active ? "Hoạt động" : "Đã khóa"}</td>
                      <td>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setSelected(row.id)}
                        >
                          Quản lý quyền
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Trang trước
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={page * page_size >= total}
              onClick={() => setPage(page + 1)}
            >
              Trang sau
            </Button>
            {account && (
              <Loaded {...org}>
                {({ items: rows }) => (
                  <Loaded {...candidates}>
                    {({ items: eligible }) => (
                      <UserChange
                        key={account.id}
                        account={account}
                        rows={rows}
                        users={eligible}
                        reload={() => {
                          read.reload();
                          candidates.reload();
                        }}
                      />
                    )}
                  </Loaded>
                )}
              </Loaded>
            )}
          </section>
        );
      }}
    </Loaded>
  );
}

function WorkFields({
  items,
  candidates,
}: {
  items: Handover["items"];
  candidates: UserView[];
}) {
  return items.map((item) => (
    <fieldset key={item.id}>
      <legend>
        {item.kind === "ticket" ? "Yêu cầu" : "Công việc"} {item.id} ·{" "}
        {item.status}
      </legend>
      <label>
        Người thay thế{" "}
        <select name={item.id}>
          <option value="">
            {item.requires_replacement
              ? "Cần chọn người thay thế"
              : "Không chỉ định"}
          </option>
          {candidates.map((row) => (
            <option key={row.id} value={row.id}>
              {row.display_name}
            </option>
          ))}
        </select>
      </label>
      {item.kind === "task" && <AllocationFields id={item.id} />}
      {item.kind === "task" && item.protected_work && (
        <label>
          <input name={`review-${item.id}`} type="checkbox" /> Đã kiểm tra công
          việc được bảo vệ
        </label>
      )}
    </fieldset>
  ));
}

function TeamRetirement({
  team,
  teams,
  reload,
}: {
  team: NamedRecord;
  teams: NamedRecord[];
  reload: () => void;
}) {
  const path = `/api/v1/teams/${team.id}` as const;
  const read = useRead<Handover>(`${path}/handover`);
  const [destination, setDestination] = useState("");
  const target = teams.find((row) => row.id === destination && row.active);
  return (
    <Loaded {...read}>
      {(review) => (
        <>
          <label>
            Nhóm nhận bàn giao{" "}
            <select
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
            >
              <option value="">Chọn nhóm</option>
              {teams
                .filter((row) => row.active && row.id !== team.id)
                .map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
            </select>
          </label>
          {target ? (
            <RetirementForm
              key={target.id}
              team={team}
              target={target}
              review={review}
              reload={() => {
                reload();
                read.reload();
              }}
            />
          ) : (
            !(review.items.length || team.intake) && (
              <RetirementForm team={team} review={review} reload={reload} />
            )
          )}
        </>
      )}
    </Loaded>
  );
}

function RetirementForm({
  team,
  target,
  review,
  reload,
}: {
  team: NamedRecord;
  target?: NamedRecord;
  review: Handover;
  reload: () => void;
}) {
  const read = useCollection<UserView>(
    target ? `/api/v1/teams/${target.id}/members` : undefined,
  );
  const form = (items: UserView[]) => (
    <Form
      title="Ngừng nhóm và bàn giao"
      path={`/api/v1/teams/${team.id}`}
      method="PATCH"
      onSaved={reload}
      body={(data) => ({
        expectedVersion: review.version,
        active: false,
        reason: value(data, "reason"),
        ...(target
          ? {
              handover_team_id: target.id,
              handover_team_expectedVersion: target.version,
              handover: handoverDecisions(data, review.items),
            }
          : {}),
      })}
    >
      <WorkFields items={review.items} candidates={items} />
      <Reason />
      <Button type="button" variant="secondary" onClick={reload}>
        Tải phiên bản mới nhất
      </Button>
    </Form>
  );
  return target ? (
    <Loaded {...read}>{(data) => form(data?.items ?? [])}</Loaded>
  ) : (
    form([])
  );
}

function Membership({
  team,
  reload,
}: {
  team: NamedRecord;
  reload: () => void;
}) {
  const members = useCollection<UserView>(`/api/v1/teams/${team.id}/members`);
  const accounts = useCollection<Account>(users);
  const [removal, setRemoval] = useState(false);
  const [subject, setSubject] = useState("");
  const review = useRead<Handover>(
    removal && subject ? `${users}/${subject}/handover` : undefined,
  );
  const affected =
    review.state?.kind === "success"
      ? review.state.data.items.filter((item) => item.team_id === team.id)
      : [];
  return (
    <Loaded {...members}>
      {({ items }) => (
        <Loaded {...accounts}>
          {({ items: candidates }) => (
            <Form
              title="Thành viên nhóm"
              path={`/api/v1/teams/${team.id}/members`}
              method="POST"
              body={(data) => ({
                expectedVersion: team.version,
                user_id: value(data, "user_id"),
                active: !removal,
                handover: removal ? handoverDecisions(data, affected) : [],
                reason: value(data, "reason"),
              })}
              onSaved={() => {
                reload();
                members.reload();
              }}
            >
              <ul>
                {items.map((row) => (
                  <li key={row.id}>{row.display_name}</li>
                ))}
              </ul>
              <label>
                Người dùng{" "}
                <select
                  name="user_id"
                  required
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                >
                  <option value="">Chọn người dùng</option>
                  {candidates
                    .filter((row) => row.active && row.role !== "REQUESTER")
                    .map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.display_name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Thay đổi{" "}
                <select
                  name="active"
                  value={removal ? "no" : "yes"}
                  onChange={(event) => setRemoval(event.target.value === "no")}
                >
                  <option value="yes">Thêm</option>
                  <option value="no">Gỡ khỏi nhóm</option>
                </select>
              </label>
              {removal && subject && (
                <Loaded {...review}>
                  {() => (
                    <WorkFields
                      items={affected}
                      candidates={items.filter((row) => row.id !== subject)}
                    />
                  )}
                </Loaded>
              )}
              <Reason />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  reload();
                  members.reload();
                  review.reload();
                }}
              >
                Tải phiên bản mới nhất
              </Button>
            </Form>
          )}
        </Loaded>
      )}
    </Loaded>
  );
}

function Catalog({
  resource,
  label,
}: {
  resource: "departments" | "categories" | "teams";
  label: string;
}) {
  const path = `/api/v1/${resource}` as const;
  const read = useCollection<NamedRecord>(path);
  const [selected, setSelected] = useState("");
  return (
    <Loaded {...read}>
      {({ items }) => {
        const row = items.find((item) => item.id === selected);
        return (
          <div className="directory-grid">
            <section className="directory-panel">
              <header className="directory-head">
                <h2>{label}</h2>
              </header>
              <div className="directory-table catalog-table">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Tên</th>
                      <th scope="col">Trạng thái</th>
                      <th scope="col">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.active ? "Hoạt động" : "Đã ngừng"}</td>
                        <td>
                          <Button
                            variant="secondary"
                            onClick={() => setSelected(item.id)}
                          >
                            Chỉnh sửa
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <div>
              <Form
                title="Tạo mới"
                path={path}
                method="POST"
                onSaved={read.reload}
                body={(data) => ({ name: value(data, "name"), active: true })}
              >
                <label>
                  Tên <input name="name" required maxLength={120} />
                </label>
              </Form>
              {row && (
                <Form
                  key={row.id}
                  title={row.name}
                  path={`${path}/${row.id}`}
                  method="PATCH"
                  onSaved={read.reload}
                  body={(data) => ({
                    expectedVersion: row.version,
                    name: value(data, "name"),
                    active:
                      resource === "teams" && row.active
                        ? true
                        : value(data, "active") === "yes",
                    reason: value(data, "reason"),
                    ...(resource === "teams"
                      ? { intake: data.has("intake") }
                      : {}),
                  })}
                >
                  <label>
                    Tên{" "}
                    <input
                      name="name"
                      defaultValue={row.name}
                      required
                      maxLength={120}
                    />
                  </label>
                  <label>
                    Trạng thái{" "}
                    <select
                      name="active"
                      disabled={resource === "teams" && row.active}
                      defaultValue={row.active ? "yes" : "no"}
                    >
                      <option value="yes">Hoạt động</option>
                      <option value="no">Ngừng</option>
                    </select>
                  </label>
                  {resource === "teams" && (
                    <label>
                      <input
                        name="intake"
                        type="checkbox"
                        defaultChecked={row.intake}
                      />{" "}
                      Nhóm tiếp nhận
                    </label>
                  )}
                  <Reason />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={read.reload}
                  >
                    Tải phiên bản mới nhất
                  </Button>
                </Form>
              )}
              {row?.active && resource === "teams" && (
                <TeamRetirement
                  key={`retire-${row.id}`}
                  team={row}
                  teams={items}
                  reload={read.reload}
                />
              )}
              {row?.active && resource === "teams" && (
                <Membership
                  key={`members-${row.id}`}
                  team={row}
                  reload={read.reload}
                />
              )}
            </div>
          </div>
        );
      }}
    </Loaded>
  );
}

function Sla() {
  const path = "/api/v1/sla/policy";
  const read = useRead<Policy>(path);
  return (
    <Loaded {...read}>
      {(policy) => (
        <Form
          title="Chính sách SLA"
          path={path}
          method="PATCH"
          onSaved={read.reload}
          body={(data) => ({
            expectedVersion: policy.version,
            reason: value(data, "reason"),
            priority_budgets: Object.fromEntries(
              priorities.map((priority) => [
                priority,
                {
                  response_seconds: Number(data.get(`${priority}-response`)),
                  resolution_seconds: Number(
                    data.get(`${priority}-resolution`),
                  ),
                },
              ]),
            ),
          })}
        >
          <p>Phiên bản {policy.version}</p>
          {priorities.map((priority) => (
            <fieldset key={priority}>
              <legend>{priority}</legend>
              <label>
                Phản hồi (giây){" "}
                <input
                  name={`${priority}-response`}
                  type="number"
                  min={1}
                  required
                  defaultValue={
                    policy.priority_budgets[priority].response_seconds
                  }
                />
              </label>
              <label>
                Xử lý (giây){" "}
                <input
                  name={`${priority}-resolution`}
                  type="number"
                  min={1}
                  required
                  defaultValue={
                    policy.priority_budgets[priority].resolution_seconds
                  }
                />
              </label>
            </fieldset>
          ))}
          <Reason />
          <Button type="button" variant="secondary" onClick={read.reload}>
            Tải phiên bản mới nhất
          </Button>
        </Form>
      )}
    </Loaded>
  );
}

export function RealAdmin({ pathname }: { pathname: string }) {
  switch (pathname) {
    case "/admin/users":
      return <Users />;
    case "/admin/users/new":
      return <UserCreate />;
    case "/admin/departments":
      return (
        <Catalog key="departments" resource="departments" label="Phòng ban" />
      );
    case "/admin/categories":
      return (
        <Catalog
          key="categories"
          resource="categories"
          label="Danh mục yêu cầu"
        />
      );
    case "/admin/teams":
      return <Catalog key="teams" resource="teams" label="Nhóm xử lý" />;
    case "/admin/sla":
      return <Sla />;
    default:
      return null;
  }
}
