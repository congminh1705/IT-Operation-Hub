"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Feedback } from "@/components/feedback/feedback";
import type { WorkspaceSearch } from "@/components/layout/workspace-page";
import { useSession } from "@/features/auth/session";
import {
  normalizeTicketText,
  scopedTicketRows,
  ticketPriorities,
  ticketStates,
} from "@/lib/demo/ticket-list";
import "./ticket-list.css";

const scopes = ["mine", "work"] as const;
const fields = [
  "state",
  "priority",
  "team",
  "category",
  "assignee",
  "sla",
] as const;
const labels = {
  state: "Trạng thái",
  priority: "Ưu tiên",
  team: "Nhóm",
  category: "Danh mục",
  assignee: "Người phụ trách",
  sla: "SLA",
};
const sorts = ["recent", "oldest", "priority"] as const;
const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
function href(params: URLSearchParams) {
  return "/tickets?" + params.toString();
}

export function TicketList({ search }: { search: WorkspaceSearch }) {
  const router = useRouter();
  const { persona, store } = useSession();
  if (!persona) return null;
  const workAllowed = persona.scope.tickets !== "mine";
  const requested = first(search.scope);
  const scope: (typeof scopes)[number] =
    workAllowed && requested !== "mine" ? "work" : "mine";
  const base = new URLSearchParams({ scope });
  const baseHref = href(base);
  const result = scopedTicketRows(
    persona,
    scope,
    store.teams.ownTeamIds(),
    first(search.demo) === "unavailable",
  );
  if (result.kind !== "success")
    return (
      <Feedback
        kind={result.kind === "error" ? "error" : "forbidden"}
        action={
          result.kind === "error"
            ? {
                label: "Thử lại",
                onClick: () => {
                  const clean = new URLSearchParams();
                  for (const key of [
                    "scope",
                    "q",
                    ...fields,
                    "sort",
                    "size",
                    "page",
                  ]) {
                    const value = first(search[key]);
                    if (value) clean.set(key, value);
                  }
                  clean.set("scope", scope);
                  router.replace(href(clean));
                },
              }
            : undefined
        }
      />
    );
  const source = result.rows;
  const options = {
    state: ticketStates,
    priority: ticketPriorities,
    team: [...new Set(source.map((row) => row.team))],
    category: [...new Set(source.map((row) => row.category))],
    assignee: [...new Set(source.map((row) => row.assignee))],
    sla: [...new Set(source.map((row) => row.sla))],
  };
  const params = new URLSearchParams(base);
  const query = first(search.q).trim().slice(0, 180);
  if (query) params.set("q", query);
  for (const field of fields) {
    const value = first(search[field]);
    if (options[field].includes(value as never)) params.set(field, value);
  }
  const sort = sorts.find((item) => item === first(search.sort)) ?? "recent";
  const size =
    [20, 50, 100].find((item) => String(item) === first(search.size)) ?? 20;
  if (sort !== "recent") params.set("sort", sort);
  if (size !== 20) params.set("size", String(size));
  const filtered = source.filter(
    (row) =>
      (!query ||
        normalizeTicketText(row.id + " " + row.title).includes(
          normalizeTicketText(query),
        )) &&
      fields.every(
        (field) => !params.has(field) || params.get(field) === row[field],
      ),
  );
  filtered.sort(
    (a, b) =>
      (sort === "priority"
        ? ticketPriorities.indexOf(a.priority) -
          ticketPriorities.indexOf(b.priority)
        : sort === "oldest"
          ? a.updated.localeCompare(b.updated)
          : b.updated.localeCompare(a.updated)) || a.id.localeCompare(b.id),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const page = Math.min(
    pages,
    Math.max(1, Number.parseInt(first(search.page), 10) || 1),
  );
  function pageHref(next: number) {
    const copy = new URLSearchParams(params);
    if (next > 1) copy.set("page", String(next));
    return href(copy);
  }
  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = new URLSearchParams(base);
    const values = new FormData(event.currentTarget);
    for (const key of ["q", ...fields, "sort", "size"]) {
      const value = String(values.get(key) ?? "").trim();
      if (
        value &&
        !(key === "sort" && value === "recent") &&
        !(key === "size" && value === "20")
      )
        next.set(key, value);
    }
    router.push(href(next));
  }
  return (
    <section
      className="ticket-list-panel"
      data-effective-scope={scope}
      aria-labelledby="ticket-list-title"
    >
      <header className="ticket-list-header">
        <div>
          <h2 id="ticket-list-title">
            {scope === "mine" ? "Yêu cầu của bạn" : "Hàng chờ hỗ trợ"}
          </h2>
          <p>
            {scope === "mine"
              ? "Chỉ yêu cầu do tài khoản hiện tại gửi."
              : persona.user.role === "TECHNICIAN"
                ? "Yêu cầu thuộc nhóm bạn đang tham gia."
                : "Yêu cầu trong phạm vi phòng IT DEMO."}
          </p>
        </div>
        {workAllowed && (
          <nav aria-label="Phạm vi yêu cầu" className="ticket-list-actions">
            {scopes.map((item) => (
              <Link
                key={item}
                href={href(new URLSearchParams({ scope: item }))}
                aria-current={scope === item ? "page" : undefined}
              >
                {item === "mine" ? "Của tôi" : "Công việc IT"}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <form
        className="ticket-list-filters"
        key={params.toString()}
        onSubmit={apply}
      >
        <label>
          Tìm yêu cầu
          <input
            type="search"
            name="q"
            placeholder="Tìm mã hoặc tiêu đề…"
            defaultValue={query}
            maxLength={180}
          />
        </label>
        {fields.slice(0, 3).map((field) => (
          <label key={field}>
            {labels[field]}
            <select
              aria-label={labels[field]}
              name={field}
              defaultValue={params.get(field) ?? ""}
            >
              <option value="">Tất cả</option>
              {options[field].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        ))}
        <label>
          Sắp xếp
          <select aria-label="Sắp xếp" name="sort" defaultValue={sort}>
            <option value="recent">Mới cập nhật</option>
            <option value="oldest">Cũ nhất</option>
            <option value="priority">Ưu tiên P1–P4</option>
          </select>
        </label>
        <label>
          Số dòng
          <select aria-label="Số dòng" name="size" defaultValue={size}>
            {[20, 50, 100].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <details
          className="ticket-list-more"
          open={fields.slice(3).some((field) => params.has(field))}
        >
          <summary>Bộ lọc chi tiết</summary>
          <div>
            {fields.slice(3).map((field) => (
              <label key={field}>
                {labels[field]}
                <select
                  aria-label={labels[field]}
                  name={field}
                  defaultValue={params.get(field) ?? ""}
                >
                  <option value="">Tất cả</option>
                  {options[field].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </details>
        <div className="ticket-list-actions">
          <Button type="submit">Áp dụng</Button>
          <Link href={baseHref}>Đặt lại</Link>
        </div>
      </form>
      {(query || fields.some((field) => params.has(field))) && (
        <div className="ticket-list-chips" aria-label="Bộ lọc đang dùng">
          {["q", ...fields]
            .filter((field) => params.has(field))
            .map((field) => {
              const next = new URLSearchParams(params);
              next.delete(field);
              return (
                <Link
                  href={href(next)}
                  key={field}
                  aria-label={`Bỏ ${params.get(field)}`}
                >
                  {params.get(field)} ×
                </Link>
              );
            })}
        </div>
      )}
      {filtered.length === 0 ? (
        <div className="ticket-list-empty">
          <Feedback
            kind="empty"
            title={
              source.length
                ? "Không có kết quả phù hợp"
                : "Bạn chưa có yêu cầu nào"
            }
            action={
              source.length
                ? { label: "Xóa bộ lọc", onClick: () => router.push(baseHref) }
                : undefined
            }
          />
        </div>
      ) : (
        <table className="ticket-list-table" aria-label="Danh sách yêu cầu">
          <thead>
            <tr>
              <th scope="col">Yêu cầu</th>
              {scope === "work" && <th scope="col">Người yêu cầu</th>}
              <th scope="col">Trạng thái</th>
              <th scope="col">Ưu tiên</th>
              <th scope="col">Phụ trách</th>
              <th scope="col">SLA</th>
              <th scope="col">Cập nhật</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice((page - 1) * size, page * size).map((row) => (
              <tr key={row.id}>
                <th scope="row">
                  <span>{row.id}</span>
                  {row.title}
                </th>
                {scope === "work" && (
                  <td data-label="Người yêu cầu">{row.requester}</td>
                )}
                <td data-label="Trạng thái">
                  <span
                    className="ticket-state"
                    data-state={ticketStates.indexOf(row.state)}
                  >
                    {row.state}
                  </span>
                </td>
                <td data-label="Ưu tiên">{row.priority}</td>
                <td data-label="Phụ trách">
                  {row.assignee}
                  <small>{row.team}</small>
                </td>
                <td data-label="SLA">{row.sla}</td>
                <td data-label="Cập nhật">{row.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <footer className="ticket-list-footer">
        <span>
          {filtered.length} yêu cầu · Trang {page}/{pages}
        </span>
        <nav aria-label="Phân trang" className="ticket-list-actions">
          {page > 1 && <Link href={pageHref(page - 1)}>Trang trước</Link>}
          {page < pages && <Link href={pageHref(page + 1)}>Trang sau</Link>}
        </nav>
      </footer>
    </section>
  );
}
