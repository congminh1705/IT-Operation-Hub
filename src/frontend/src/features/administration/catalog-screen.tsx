"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/session";
import type { CatalogKind } from "@/lib/demo/organization-catalog";
import "./users-screen.css";
import "./catalog-screen.css";

type Edit = { id?: string; label: string; code: string };
export function CatalogScreen({ kind }: { kind: CatalogKind }) {
  const { store } = useSession();
  const catalog = store.catalog;
  const department = kind === "departments";
  const noun = department ? "phòng ban" : "danh mục";
  const rows = catalog.list(kind);
  const history = catalog.history(kind);
  const [edit, setEdit] = useState<Edit>();
  const [confirm, setConfirm] = useState<string>();
  const [feedback, setFeedback] = useState<{
    text: string;
    error?: boolean;
    field?: string;
  }>();
  const form = useRef<HTMLFormElement>(null);
  const confirmHeading = useRef<HTMLHeadingElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const label = form.current?.elements.namedItem("label");
    if (edit && label instanceof HTMLElement) label.focus();
    if (confirm) confirmHeading.current?.focus();
  }, [edit, confirm]);
  function start(event: React.MouseEvent<HTMLButtonElement>, row?: Edit) {
    trigger.current = event.currentTarget;
    setConfirm(undefined);
    setFeedback(undefined);
    setEdit(row ? { ...row } : { label: "", code: "" });
  }
  function dismiss() {
    setEdit(undefined);
    setConfirm(undefined);
    trigger.current?.focus();
  }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!edit) return;
    const data = new FormData(event.currentTarget);
    const result = catalog.save(kind, {
      id: edit.id,
      label: String(data.get("label") ?? ""),
      code: String(data.get("code") ?? ""),
    });
    if (!result.ok) {
      const field = "field" in result ? result.field : undefined;
      setFeedback({ text: result.error, error: true, field });
      const target = field && form.current?.elements.namedItem(field);
      if (target instanceof HTMLElement) target.focus();
      return;
    }
    setFeedback({
      text: edit.id ? "Đã lưu thay đổi DEMO." : "Đã thêm bản ghi DEMO.",
    });
    dismiss();
  }
  const pending = rows.find((row) => row.id === confirm);
  return (
    <>
      <nav className="catalog-nav" aria-label="Cấu hình tổ chức">
        <Link
          href="/admin/departments"
          aria-current={department ? "page" : undefined}
        >
          Phòng ban
        </Link>
        <Link
          href="/admin/categories"
          aria-current={!department ? "page" : undefined}
        >
          Danh mục
        </Link>
      </nav>
      <div className="directory-grid">
        <section className="directory-panel">
          <header className="directory-head">
            <div>
              <h2>{department ? "Phòng ban" : "Danh mục"}</h2>
              <p>Cấu hình tổ chức không tự cấp quyền đọc dữ liệu.</p>
            </div>
            <Button onClick={(event) => start(event)}>Thêm {noun}</Button>
          </header>
          <div
            className="directory-table catalog-table"
            role="region"
            aria-label={
              department ? "Danh sách phòng ban" : "Danh sách danh mục"
            }
            tabIndex={0}
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">Tên</th>
                  <th scope="col">
                    {department ? "Mã" : "Nhóm tiếp nhận mặc định"}
                  </th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <th scope="row">{row.label}</th>
                    <td>{department ? row.code : store.teams.intakeName()}</td>
                    <td>
                      <span
                        className="directory-status"
                        data-active={row.active}
                      >
                        {row.active ? "Đang hoạt động" : "Ngừng sử dụng"}
                      </span>
                    </td>
                    <td>
                      {row.active && (
                        <div className="catalog-row-actions">
                          <Button
                            variant="secondary"
                            aria-label={"Sửa " + row.label}
                            onClick={(event) => start(event, row)}
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="secondary"
                            aria-label={"Ngừng sử dụng " + row.label}
                            onClick={(event) => {
                              trigger.current = event.currentTarget;
                              setEdit(undefined);
                              setFeedback(undefined);
                              setConfirm(row.id);
                            }}
                          >
                            Ngừng sử dụng
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {feedback && (
            <p
              className={`catalog-feedback ${feedback.error ? "catalog-error" : ""}`}
              id="catalog-feedback"
              role={feedback.error ? "alert" : "status"}
            >
              {feedback.text}
            </p>
          )}
          {edit && (
            <form
              ref={form}
              key={edit.id ?? "new"}
              className="directory-card"
              onSubmit={save}
              noValidate
            >
              <h2>
                {edit.id ? "Sửa" : "Thêm"} {noun}
              </h2>
              <label>
                Tên
                <input
                  name="label"
                  defaultValue={edit.label}
                  required
                  aria-invalid={feedback?.field === "label"}
                  aria-describedby={
                    feedback?.field === "label" ? "catalog-feedback" : undefined
                  }
                />
              </label>
              {department && (
                <label>
                  Mã
                  <input
                    name="code"
                    defaultValue={edit.code}
                    readOnly={!!edit.id}
                    required
                    aria-invalid={feedback?.field === "code"}
                    aria-describedby={
                      feedback?.field === "code"
                        ? "catalog-feedback"
                        : undefined
                    }
                  />
                </label>
              )}
              <div className="directory-actions">
                <Button variant="secondary" onClick={dismiss}>
                  Hủy
                </Button>
                <Button type="submit">Lưu</Button>
              </div>
            </form>
          )}
          {pending && (
            <section className="directory-card">
              <h2 ref={confirmHeading} tabIndex={-1}>
                Ngừng sử dụng {pending.label}?
              </h2>
              <p>
                Bản ghi sẽ không còn trong lựa chọn mới. Tham chiếu lịch sử vẫn
                được giữ.
              </p>
              <div className="directory-actions">
                <Button variant="secondary" onClick={dismiss}>
                  Hủy
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    const result = catalog.deactivate(kind, pending.id);
                    setFeedback(
                      result.ok
                        ? { text: "Đã ngừng sử dụng DEMO." }
                        : { text: result.error, error: true },
                    );
                    dismiss();
                  }}
                >
                  Xác nhận ngừng sử dụng
                </Button>
              </div>
            </section>
          )}
        </section>
        <aside className="directory-panel directory-card">
          <h2>Kiểm tra trước khi lưu</h2>
          <p>
            Chỉ sử dụng bản ghi đang hoạt động cho yêu cầu mới. Lịch sử vẫn tra
            cứu theo mã tham chiếu.
          </p>
          {history && (
            <p data-testid="catalog-history">
              {history.reference} · {history.record.label} ·{" "}
              {history.record.active ? "Đang hoạt động" : "Ngừng sử dụng"}
            </p>
          )}
          <label>
            Lựa chọn cho yêu cầu mới (DEMO)
            <select
              aria-label="Lựa chọn cho yêu cầu mới (DEMO)"
              defaultValue=""
            >
              <option value="">Chọn {noun}</option>
              {rows
                .filter((row) => row.active)
                .map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.label}
                  </option>
                ))}
            </select>
          </label>
        </aside>
      </div>
    </>
  );
}
