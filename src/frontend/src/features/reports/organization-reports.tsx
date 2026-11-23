"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Feedback } from "@/components/feedback/feedback";
import { useSession } from "@/features/auth/session";
import type { WorkspaceSearch } from "@/components/layout/workspace-page";
import {
  metricTicketHref,
  readOrganizationReport,
  reportFilters,
  reportQuery,
  type OrganizationTicketMetric,
} from "@/lib/demo/organization-metrics";
import "../automation/automation.css";
import "./reports.css";

const labels = {
  MET01: "Yêu cầu chưa hoàn tất",
  MET02: "Chưa có người phụ trách",
  MET03: "SLA có nguy cơ trễ",
  MET04: "SLA đã quá hạn",
  MET05: "Phân nhóm ticket tạo trong kỳ",
  MET06: "Tạo trong kỳ",
  MET07: "Giải quyết mới nhất trong kỳ",
  MET08: "Thời gian xử lý chủ động trung bình",
  MET09: "Ticket theo người phụ trách",
  MET15: "Vi phạm SLA đã ghi nhận",
};
const queueIds = ["MET01", "MET02", "MET03", "MET04"] as const;
const tabs = { ticket: "Ticket", sla: "SLA", workload: "Workload" };

export function OrganizationReports({
  search,
  dashboard = false,
}: {
  search: WorkspaceSearch;
  dashboard?: boolean;
}) {
  const { persona, store } = useSession();
  const router = useRouter();
  const [now] = useState(Date.now);
  if (!persona) return null;
  const filters = reportFilters(search, now);
  const report = readOrganizationReport(store, persona, filters);
  if (!report) return <Feedback kind="forbidden" />;
  const tab =
    search.tab === "sla" || search.tab === "workload" ? search.tab : "ticket";
  const snapshot = new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(filters.at);
  const query = reportQuery(filters);
  const kpis = (items: readonly OrganizationTicketMetric[]) => (
    <div className="report-kpis">
      {items.map((id) => (
        <Link
          className="report-kpi"
          href={metricTicketHref(id, filters)}
          key={id}
        >
          <span>{labels[id]}</span>
          <strong>
            {id === "MET08"
              ? report.meanMinutes === null
                ? "—"
                : report.meanMinutes.toFixed(1) + " phút"
              : report.population[id].length}
          </strong>
          <small>
            {id}
            {id === "MET08" ? " · n=" + report.population.MET08.length : ""}
          </small>
        </Link>
      ))}
    </div>
  );
  const warranty = (
    <section className="automation-panel" aria-label="Bảo hành thiết bị">
      <h2>Bảo hành thiết bị</h2>
      <p>MET10 · Hôm nay đến hết ngày thứ 30 · Toàn tổ chức</p>
      <ul className="report-list">
        {(
          [
            ["expiring", "Sắp hết hạn"],
            ["expired", "Đã hết hạn"],
            ["unknown", "Chưa có ngày"],
          ] as const
        ).map(([key, name]) => (
          <li key={key}>
            <Link href={`/assets?scope=work&warranty=${key}&at=${filters.at}`}>
              {name} · {report.warranty[key].length}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
  return (
    <div className="automation reports-view">
      <section className="report-hero">
        <h2>
          {dashboard
            ? persona.user.role === "ADMIN"
              ? "Tổng quan quản trị"
              : "Nhịp vận hành hôm nay"
            : "Báo cáo vận hành"}
        </h2>
        {dashboard && (
          <Link className="ui-button" href={"/reports?" + query}>
            Mở báo cáo
          </Link>
        )}
      </section>
      <p>
        Snapshot DEMO · {snapshot} GMT+7 ·{" "}
        {filters.team
          ? (report.teams.find(([id]) => id === filters.team)?.[1] ??
            "Nhóm không có dữ liệu")
          : "Toàn tổ chức"}
      </p>
      <section className="automation-panel" aria-label="Hàng đợi hiện tại">
        <h2>Hàng đợi hiện tại</h2>
        <p>Tất cả ngày tạo. Bộ lọc kỳ chỉ áp dụng cho số liệu theo kỳ.</p>
        {kpis(queueIds)}
      </section>
      {dashboard ? (
        <div className="report-columns">
          <section className="automation-panel" aria-label="Việc cần theo dõi">
            <h2>
              {persona.user.role === "ADMIN"
                ? "Truy cập & cấu hình"
                : "Cần bạn quyết định"}
            </h2>
            <div className="automation-actions">
              {persona.user.role === "ADMIN" ? (
                <>
                  <Link href="/admin/users">Quản lý người dùng</Link>
                  <Link href="/admin/sla">Cấu hình SLA</Link>
                </>
              ) : (
                <>
                  <Link href="/approvals">Xem đề xuất điều phối</Link>
                  <Link href="/workforce">Xem khả năng tiếp nhận</Link>
                </>
              )}
              <Link href="/automation/activity">Hoạt động điều phối</Link>
            </div>
            <ul className="report-list">
              {report.population.MET01.slice(0, 4).map(({ row }) => (
                <li key={row.id}>
                  <Link href={`/tickets/${row.id}`}>
                    {row.id} · {row.title}
                  </Link>{" "}
                  · {row.state}
                </li>
              ))}
            </ul>
          </section>
          {warranty}
        </div>
      ) : (
        <>
          <section className="automation-panel" aria-label="Bộ lọc báo cáo">
            <nav className="automation-actions" aria-label="Nhóm báo cáo">
              {Object.entries(tabs).map(([id, label]) => {
                const params = new URLSearchParams(query);
                params.set("tab", id);
                return (
                  <Link
                    key={id}
                    className="ui-button"
                    data-variant={id === tab ? undefined : "secondary"}
                    aria-current={id === tab ? "page" : undefined}
                    href={"/reports?" + params}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
            <form
              className="report-filters"
              key={query.toString()}
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                const params = reportQuery({
                  ...filters,
                  from: String(data.get("from")),
                  to: String(data.get("to")),
                  team: String(data.get("team")),
                });
                params.set("tab", tab);
                router.push("/reports?" + params);
              }}
            >
              <label>
                Từ ngày
                <input
                  name="from"
                  type="date"
                  required
                  defaultValue={filters.from}
                />
              </label>
              <label>
                Đến ngày
                <input
                  name="to"
                  type="date"
                  required
                  defaultValue={filters.to}
                />
              </label>
              <label>
                Nhóm hỗ trợ
                <select name="team" defaultValue={filters.team}>
                  <option value="">Tất cả nhóm</option>
                  {report.teams.map(([id, label]) => (
                    <option value={id} key={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="ui-button">
                Áp dụng kỳ DEMO
              </button>
            </form>
            {!report.range && (
              <p role="alert">Chọn khoảng ngày hợp lệ, tối đa 31 ngày.</p>
            )}
          </section>
          {tab === "ticket" && report.range && (
            <section
              className="automation-panel"
              aria-label="Tiếp nhận và xử lý theo ngày"
            >
              <h2>Tiếp nhận &amp; xử lý theo ngày</h2>
              {kpis(["MET06", "MET07"])}
              {report.population.MET06.length +
                report.population.MET07.length ===
              0 ? (
                <p>Không có dữ liệu trong kỳ đã chọn.</p>
              ) : (
                <div className="report-chart" aria-hidden="true">
                  {report.days.map((day) => (
                    <div key={day.day} title={day.day}>
                      <i
                        style={{
                          blockSize: 8 + 12 * Math.min(day.created, 15),
                        }}
                      />
                      <b
                        style={{
                          blockSize: 8 + 12 * Math.min(day.resolved, 15),
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="report-scroll">
                <table className="report-table">
                  <caption>Số liệu theo ngày · GMT+7</caption>
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      <th>Tạo mới</th>
                      <th>Giải quyết mới nhất</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.days.map((day) => (
                      <tr key={day.day}>
                        <th scope="row">{day.day}</th>
                        <td>
                          <Link
                            href={metricTicketHref("MET06", {
                              ...filters,
                              from: day.day,
                              to: day.day,
                            })}
                          >
                            {day.created}
                          </Link>
                        </td>
                        <td>
                          <Link
                            href={metricTicketHref("MET07", {
                              ...filters,
                              from: day.day,
                              to: day.day,
                            })}
                          >
                            {day.resolved}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="report-group-grid">
                {(
                  [
                    ["state", "Trạng thái"],
                    ["priority", "Ưu tiên"],
                    ["team", "Nhóm"],
                  ] as const
                ).map(([field, name]) => (
                  <section key={field}>
                    <h3>{name} · MET05</h3>
                    <ul className="report-list">
                      {report.groups[field].map(([label, count]) => (
                        <li key={label}>
                          <Link
                            href={
                              metricTicketHref("MET05", filters) +
                              "&" +
                              field +
                              "=" +
                              encodeURIComponent(label)
                            }
                          >
                            {label} · {count}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </section>
          )}
          {tab === "sla" && report.range && (
            <section className="automation-panel" aria-label="Báo cáo SLA">
              <h2>SLA trong kỳ</h2>
              {kpis(["MET08", "MET15"])}
              <p>
                Lần giải quyết mới nhất; loại thời gian chờ bổ sung và thời gian
                sau lần giải quyết đó.
              </p>
            </section>
          )}
          {tab === "workload" && (
            <section
              className="automation-panel"
              aria-label="Khối lượng ticket"
            >
              <h2>Khối lượng ticket hiện tại · MET09</h2>
              <p>
                Số hồ sơ được giao, gồm hàng chờ và quá hạn. Số đếm không đo
                năng suất.
              </p>
              <div className="report-scroll">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Người phụ trách</th>
                      <th>Tổng</th>
                      <th>Đang xử lý</th>
                      <th>Chờ bổ sung</th>
                      <th>Quá hạn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.workload.map((row) => (
                      <tr key={row.assignee}>
                        <th scope="row">{row.assignee}</th>
                        <td>
                          <Link
                            href={
                              metricTicketHref("MET09", filters) +
                              "&assignee=" +
                              encodeURIComponent(row.assignee)
                            }
                          >
                            {row.total}
                          </Link>
                        </td>
                        <td>{row.active}</td>
                        <td>{row.pending}</td>
                        <td>{row.overdue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {report.workload.length === 0 && (
                <p>Không có ticket đang mở trong phạm vi này.</p>
              )}
            </section>
          )}
          {warranty}
        </>
      )}
    </div>
  );
}
