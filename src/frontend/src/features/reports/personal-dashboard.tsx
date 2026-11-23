"use client";
import Link from "next/link";
import { useSession } from "@/features/auth/session";
import { personalTicketMetric } from "@/lib/demo/dashboard-metrics";
import { scopedTicketRows } from "@/lib/demo/ticket-list";
import { workStates } from "@/lib/demo/work-board";
import "../automation/automation.css";
import "./reports.css";

export function PersonalDashboard() {
  const { persona, store } = useSession();
  if (!persona) return null;
  const requester = persona.user.role === "REQUESTER";
  const scope = requester ? "mine" : "work";
  const teams = store.teams.ownTeamIds();
  const ticketResult = scopedTicketRows(
    persona,
    scope,
    teams,
    false,
    store.tickets.rows(),
  );
  const rows = ticketResult.kind === "success" ? ticketResult.rows : [];
  const pending = personalTicketMetric(persona, teams, rows, "MET11");
  const assigned = personalTicketMetric(persona, teams, rows, "MET13");
  const unassigned = personalTicketMetric(persona, teams, rows, "MET14");
  const assets = store.assets.list(persona, teams, "mine");
  const work = requester ? [] : store.work.list(persona, teams, "mine");
  const metrics = requester
    ? ([
        [
          "MET11",
          "Yêu cầu cần bạn phản hồi",
          pending.length,
          "/tickets?scope=mine&metric=MET11",
        ],
        [
          "MET12",
          "Thiết bị đang được cấp",
          assets.length,
          "/assets?scope=mine",
        ],
      ] as const)
    : ([
        [
          "MET13",
          "Ticket đang giao cho bạn",
          assigned.length,
          "/tickets?scope=work&metric=MET13",
        ],
        [
          "MET14",
          "Ticket nhóm chưa phân công",
          unassigned.length,
          "/tickets?scope=work&metric=MET14",
        ],
        [
          "MET12",
          "Thiết bị đang được cấp",
          assets.length,
          "/assets?scope=mine",
        ],
      ] as const);

  return (
    <div className="automation reports-view">
      <section className="report-hero">
        <h2>{requester ? "Không gian của bạn" : "Công việc trong ca"}</h2>
        <Link
          className="ui-button"
          href={requester ? "/tickets/new" : "/work?scope=mine"}
        >
          {requester ? "Tạo yêu cầu" : "Xem việc của tôi"}
        </Link>
      </section>
      <section className="report-kpis" aria-label="Chỉ số cá nhân">
        {metrics.map(([code, label, count, href]) => (
          <Link key={code} href={href} className="report-kpi">
            <span>{label}</span>
            <strong>{count}</strong>
            <small>{code} · DEMO</small>
          </Link>
        ))}
      </section>
      <div className="report-columns">
        <section className="automation-panel" aria-labelledby="personal-next">
          <h2 id="personal-next">
            {requester ? "Cần bạn phản hồi" : "Thứ tự xử lý"}
          </h2>
          {requester ? (
            pending.length ? (
              <ul className="report-list">
                {pending.map((row) => (
                  <li key={row.id}>
                    <Link href={`/tickets/${row.id}`}>
                      {row.id} · {row.title}
                    </Link>
                    <p>
                      {row.state} ·{" "}
                      {row.state === "Đã giải quyết"
                        ? "Xem kết quả để xác nhận hoặc mở lại"
                        : "Bổ sung thông tin để IT tiếp tục"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Chưa có yêu cầu cần phản hồi.</p>
            )
          ) : work.length ? (
            <ul className="report-list">
              {[...work]
                .sort(
                  (a, b) =>
                    Number(b.state === "active") - Number(a.state === "active"),
                )
                .slice(0, 5)
                .map((row) => (
                  <li key={row.id}>
                    <Link href={`/work?scope=mine&task=${row.id}`}>
                      {row.id} · {row.title}
                    </Link>
                    <p>
                      {workStates[row.state]} · Còn {row.remaining} phút
                    </p>
                  </li>
                ))}
            </ul>
          ) : (
            <p>Chưa có công việc được giao.</p>
          )}
        </section>
        <aside className="automation-panel" aria-label="Hỗ trợ và thiết bị">
          <h2>Thiết bị của bạn</h2>
          {assets.length ? (
            <ul className="report-list">
              {assets.map((row) => (
                <li key={row.id}>
                  <Link href={`/assets?scope=mine&id=${row.id}`}>
                    {row.code} · {row.model}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>Chưa có thiết bị được cấp.</p>
          )}
          <div className="automation-actions">
            <Link href="/knowledge">Kho kiến thức</Link>
            <Link href="/assistant">Mở AI Workspace</Link>
          </div>
        </aside>
      </div>
      <section className="automation-panel" aria-label="Yêu cầu trong phạm vi">
        <h2>{requester ? "Yêu cầu của bạn" : "Yêu cầu trong phạm vi"}</h2>
        <ul className="report-list">
          {rows.slice(0, 4).map((row) => (
            <li key={row.id}>
              <Link href={`/tickets/${row.id}`}>
                {row.id} · {row.title}
              </Link>{" "}
              <span>
                · {row.state} · {row.priority}
              </span>
            </li>
          ))}
        </ul>
        <Link
          className="ui-button"
          data-variant="secondary"
          href={`/tickets?scope=${scope}`}
        >
          Xem danh sách
        </Link>
      </section>
    </div>
  );
}
