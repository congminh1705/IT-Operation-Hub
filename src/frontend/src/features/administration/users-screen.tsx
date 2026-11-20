"use client";
import Link from "next/link";
import { AccessReview } from "./access-review";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/session";
import { roleLabels } from "@/lib/navigation";
import {
  departments,
  provisioningRequest,
  type ProvisioningDraft,
  type DirectoryUser,
} from "@/lib/demo/user-directory";
import "./users-screen.css";

const base = "/admin/users";
const initial: ProvisioningDraft = {
  name: "",
  email: "",
  department: departments[0],
  role: "REQUESTER",
  reference: "",
};
const normalize = (value: string) =>
  value
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d");

export function UsersScreen({ create }: { create: boolean }) {
  const { store } = useSession();
  return create ? (
    <ProvisioningForm />
  ) : (
    <Directory rows={store.directory.list()} />
  );
}

function Directory({
  rows,
}: {
  rows: ReturnType<ReturnType<typeof useSession>["store"]["directory"]["list"]>;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<DirectoryUser>();
  const trigger = useRef<HTMLButtonElement>(null);
  const filtered = rows.filter(
    (row) =>
      normalize(row.name + " " + row.email).includes(normalize(query.trim())) &&
      (status === "all" || row.active === (status === "active")),
  );
  return (
    <section className="directory-panel" aria-labelledby="directory-title">
      <header className="directory-head">
        <div>
          <h2 id="directory-title">Người dùng</h2>
          <p>Tài khoản chỉ được tạo bởi Admin có thẩm quyền.</p>
        </div>
        <Link className="ui-button" data-variant="primary" href={base + "/new"}>
          Tạo người dùng
        </Link>
      </header>
      <div className="directory-filters">
        <input
          type="search"
          aria-label="Tìm tên hoặc email công việc"
          placeholder="Tìm tên hoặc email công việc…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          aria-label="Lọc trạng thái"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="locked">Đã khóa</option>
        </select>
      </div>
      {filtered.length ? (
        <div
          className="directory-table"
          tabIndex={0}
          role="region"
          aria-label="Danh sách người dùng"
        >
          <table>
            <thead>
              <tr>
                <th scope="col">Người dùng</th>
                <th scope="col">Phòng ban</th>
                <th scope="col">Vai trò</th>
                <th scope="col">Trạng thái</th>
                <th scope="col">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.email}>
                  <th scope="row">
                    {row.name}
                    <small>{row.email}</small>
                  </th>
                  <td>{row.department}</td>
                  <td>{roleLabels[row.role]}</td>
                  <td>
                    <span className="directory-status" data-active={row.active}>
                      {row.active ? "Đang hoạt động" : "Đã khóa"}
                    </span>
                  </td>
                  <td>
                    <Button
                      variant="secondary"
                      aria-label={`Xem tác động: ${row.name}`}
                      onClick={(event) => {
                        trigger.current = event.currentTarget;
                        setSelected(row);
                        requestAnimationFrame(() =>
                          document
                            .getElementById("access-review-title")
                            ?.focus(),
                        );
                      }}
                    >
                      Xem tác động
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="directory-empty" role="status">
          Không có người dùng phù hợp.
        </p>
      )}
      {selected && (
        <AccessReview
          key={selected.email}
          user={selected}
          onClose={() => {
            setSelected(undefined);
            trigger.current?.focus();
          }}
        />
      )}
    </section>
  );
}

function ProvisioningForm() {
  const { store } = useSession();
  const availableDepartments = store.catalog
    .list("departments")
    .filter((row) => row.active);
  const [draft, setDraft] = useState({
    ...initial,
    department: availableDepartments[0]?.label ?? "",
  });
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<{ field?: string; message: string }>();
  const form = useRef<HTMLFormElement>(null);
  function edit(field: keyof ProvisioningDraft, value: string) {
    setDraft({ ...draft, [field]: value });
    setPreview(false);
    setError(undefined);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saved) return;
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    const result = preview
      ? store.directory.create(draft, password)
      : store.directory.preview(draft, password);
    if (result.kind === "error") {
      setPreview(false);
      setError(result);
      requestAnimationFrame(() => {
        const target = result.field
          ? form.current?.elements.namedItem(result.field)
          : document.getElementById("directory-error");
        if (target instanceof HTMLElement) target.focus();
      });
      return;
    }
    setError(undefined);
    if (preview) {
      event.currentTarget.reset();
      setSaved(true);
    } else {
      setPreview(true);
    }
    requestAnimationFrame(() =>
      document.getElementById("directory-result")?.focus(),
    );
  }
  const invalid = (field: string) => ({
    "aria-invalid": error?.field === field,
    "aria-describedby": error?.field === field ? "directory-error" : undefined,
  });
  if (saved)
    return (
      <section className="directory-panel directory-card">
        <h2 id="directory-result" tabIndex={-1}>
          Đã tạo người dùng DEMO
        </h2>
        <p>
          Tài khoản xuất hiện trong danh sách DEMO. Bàn giao theo kênh được tổ
          chức phê duyệt.
        </p>
        <Link className="ui-button" data-variant="primary" href={base}>
          Về danh sách
        </Link>
      </section>
    );
  return (
    <div className="directory-grid">
      <form
        className="directory-panel directory-card"
        onSubmit={submit}
        ref={form}
        noValidate
      >
        <label>
          Mã yêu cầu đã xác minh
          <input
            name="reference"
            required
            {...invalid("reference")}
            value={draft.reference}
            onChange={(e) => edit("reference", e.target.value)}
          />
        </label>
        <label>
          Họ và tên
          <input
            name="name"
            required
            {...invalid("name")}
            value={draft.name}
            onChange={(e) => edit("name", e.target.value)}
          />
        </label>
        <label>
          Email công việc
          <input
            name="email"
            type="email"
            required
            {...invalid("email")}
            value={draft.email}
            onChange={(e) => edit("email", e.target.value)}
          />
        </label>
        <div className="directory-pair">
          <label>
            Phòng ban
            <select
              name="department"
              aria-label="Phòng ban"
              value={draft.department}
              onChange={(e) => edit("department", e.target.value)}
            >
              {availableDepartments.map(({ label: item }) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Vai trò
            <select
              name="role"
              aria-label="Vai trò"
              value={draft.role}
              onChange={(e) => edit("role", e.target.value)}
            >
              <option value="REQUESTER">Requester</option>
            </select>
          </label>
        </div>
        <label>
          Mật khẩu ban đầu
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            {...invalid("password")}
            onChange={() => {
              setPreview(false);
              setError(undefined);
            }}
          />
        </label>
        <p className="directory-note">
          Vai trò mặc định: Requester. Cấp quyền IT cần phê duyệt phù hợp. Tạo
          tài khoản không chuyển trạng thái ticket.
        </p>
        {error && (
          <p role="alert" id="directory-error" tabIndex={-1}>
            {error.message}
          </p>
        )}
        {preview && (
          <section
            className="directory-preview"
            aria-labelledby="directory-result"
          >
            <h2 tabIndex={-1} id="directory-result">
              Xác nhận tạo tài khoản DEMO
            </h2>
            <p>
              {draft.name} · {draft.email}
            </p>
            <p>
              {draft.department} · Requester · {provisioningRequest.id}
            </p>
          </section>
        )}
        <div className="directory-actions">
          <Link
            href={base}
            className="ui-button"
            data-variant="secondary"
            onClick={() => form.current?.reset()}
          >
            Hủy
          </Link>
          <Button type="submit">
            {preview ? "Xác nhận tạo" : "Xem trước thông tin tài khoản"}
          </Button>
        </div>
      </form>
      <aside className="directory-panel directory-card">
        <h2>Nguyên tắc bàn giao</h2>
        <p>
          Bản xem trước không hiển thị mật khẩu. Chỉ dùng dữ liệu DEMO. Bàn giao
          mật khẩu qua kênh doanh nghiệp.
        </p>
        <p>
          Yêu cầu DEMO đã xác minh: <strong>{provisioningRequest.id}</strong>
          <br />
          {provisioningRequest.email} · {provisioningRequest.department}
        </p>
      </aside>
    </div>
  );
}
