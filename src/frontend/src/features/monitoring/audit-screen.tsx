"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { WorkspaceSearch } from "@/components/layout/workspace-page";
import { useSession } from "@/features/auth/session";
import { auditRows } from "@/lib/demo/audit";
import "../automation/automation.css";
import "./monitoring.css";

const pageSize = 3;
const dateTime = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});
const outcomes = { success: "Thành công", blocked: "Bị chặn" };

export function AuditScreen({ search }: { search: WorkspaceSearch }) {
  const { persona } = useSession();
  const router = useRouter();
  if (!persona) return null;

  const admin = persona.user.role === "ADMIN";
  const scope =
    admin && search.scope !== "business" ? "administration" : "business";
  const q = typeof search.q === "string" ? search.q.trim().slice(0, 100) : "";
  const outcome =
    search.outcome === "success" || search.outcome === "blocked"
      ? search.outcome
      : "";
  const authorized = auditRows(persona, scope);
  const actions = [...new Set(authorized.map((row) => row.action))];
  const action = actions.find((name) => name === search.action) ?? "";
  const filtered = authorized.filter(
    (row) =>
      (!outcome || row.outcome === outcome) &&
      (!action || row.action === action) &&
      [row.actor, row.target, row.action].some((value) =>
        value.toLocaleLowerCase("vi").includes(q.toLocaleLowerCase("vi")),
      ),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(
    pages,
    Math.max(1, Math.trunc(Number(search.page) || 1)),
  );
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const detail = authorized.find((row) => row.id === search.entry);

  function href(nextPage: number, entry?: string) {
    const params = new URLSearchParams();
    if (admin) params.set("scope", scope);
    if (q) params.set("q", q);
    if (action) params.set("action", action);
    if (outcome) params.set("outcome", outcome);
    if (nextPage > 1) params.set("page", String(nextPage));
    if (entry) params.set("entry", entry);
    return params.size ? `/audit?${params}` : "/audit";
  }

  return (
    <section
      className="automation automation-panel monitoring"
      aria-label="Nhật ký hoạt động"
    >
      <h2>Nhật ký hoạt động</h2>
      {search.entry !== undefined ? (
        <>
          <Link
            className="ui-button"
            data-variant="secondary"
            href={href(page)}
          >
            Về danh sách
          </Link>
          {detail ? (
            <dl className="audit-detail">
              <dt>Sự kiện</dt>
              <dd>
                {detail.action} · {detail.target}
              </dd>
              <dt>Thời gian</dt>
              <dd>
                <time dateTime={detail.at}>
                  {dateTime.format(new Date(detail.at))}
                </time>
              </dd>
              <dt>Người thực hiện</dt>
              <dd>{detail.actor}</dd>
              <dt>Trước</dt>
              <dd>{detail.before}</dd>
              <dt>Sau</dt>
              <dd>{detail.after}</dd>
              <dt>Lý do</dt>
              <dd>{detail.reason}</dd>
              <dt>Kết quả</dt>
              <dd>{outcomes[detail.outcome]}</dd>
            </dl>
          ) : (
            <p role="alert">Sự kiện không khả dụng trong phạm vi của bạn.</p>
          )}
        </>
      ) : (
        <>
          <form
            key={`${scope}:${q}:${action}:${outcome}`}
            className="audit-filters"
            onSubmit={(event) => {
              event.preventDefault();
              const values = new FormData(event.currentTarget);
              const params = new URLSearchParams();
              if (admin) params.set("scope", String(values.get("scope")));
              const value = String(values.get("q")).trim();
              if (value) params.set("q", value);
              const selectedAction = String(values.get("action"));
              if (selectedAction) params.set("action", selectedAction);
              const result = String(values.get("outcome"));
              if (result) params.set("outcome", result);
              router.push(params.size ? `/audit?${params}` : "/audit");
            }}
          >
            {admin && (
              <label>
                Phạm vi
                <select name="scope" defaultValue={scope}>
                  <option value="administration">
                    Quản trị tài khoản và SLA
                  </option>
                  <option value="business">Hoạt động nghiệp vụ</option>
                </select>
              </label>
            )}
            <label>
              Tìm nhật ký
              <input
                name="q"
                type="search"
                defaultValue={q}
                maxLength={100}
                placeholder="Tìm người, đối tượng, tác vụ"
              />
            </label>
            <label>
              Thao tác
              <select name="action" defaultValue={action}>
                <option value="">Tất cả thao tác</option>
                {actions.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
            <label>
              Kết quả
              <select name="outcome" defaultValue={outcome}>
                <option value="">Tất cả</option>
                <option value="success">Thành công</option>
                <option value="blocked">Bị chặn</option>
              </select>
            </label>
            <button className="ui-button" type="submit">
              Lọc
            </button>
          </form>
          <p role="status">
            {filtered.length} sự kiện · Trang {page}/{pages}
          </p>
          {rows.length ? (
            <div
              className="audit-table-wrap"
              tabIndex={0}
              role="region"
              aria-label="Bảng sự kiện"
            >
              <table className="audit-table">
                <thead>
                  <tr>
                    <th scope="col">Thời gian</th>
                    <th scope="col">Người thực hiện</th>
                    <th scope="col">Đối tượng</th>
                    <th scope="col">Thay đổi</th>
                    <th scope="col">Kết quả</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <time dateTime={row.at}>
                          {dateTime.format(new Date(row.at))}
                        </time>
                      </td>
                      <td>{row.actor}</td>
                      <td>
                        <Link href={href(page, row.id)}>{row.target}</Link>
                      </td>
                      <td>
                        <strong>{row.action}</strong>
                        <br />
                        {row.before} → {row.after}
                      </td>
                      <td>
                        <span
                          className="audit-result"
                          data-outcome={row.outcome}
                        >
                          {outcomes[row.outcome]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Không có sự kiện phù hợp.</p>
          )}
          {pages > 1 && (
            <nav className="automation-actions" aria-label="Phân trang nhật ký">
              {page > 1 && (
                <Link
                  className="ui-button"
                  data-variant="secondary"
                  href={href(page - 1)}
                >
                  Trang trước
                </Link>
              )}
              {page < pages && (
                <Link
                  className="ui-button"
                  data-variant="secondary"
                  href={href(page + 1)}
                >
                  Trang sau
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </section>
  );
}
