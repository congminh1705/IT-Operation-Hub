import Link from "next/link";
import { workStates } from "@/lib/demo/work-board";
import type { OrganizationReport } from "@/lib/demo/organization-metrics";

export function OperationalFacts({ report }: { report: OrganizationReport }) {
  const { operations } = report;
  const facts = [
    ["MET16", "Công việc chưa hoàn tất", String(operations.unfinished.length)],
    [
      "MET17",
      "Tải được phân bổ toàn tổ chức",
      (operations.staff?.rows.reduce((sum, row) => sum + row.load, 0) ?? "—") +
        " phút",
    ],
    ["MET18", "Công việc có rủi ro", String(operations.risks.length)],
    [
      "MET19",
      "Phê duyệt hợp lệ đang chờ",
      String(operations.approvals.pending),
    ],
    [
      "MET20",
      "Kết quả hành động trong kỳ",
      `${operations.outcomes.success} thành công · ${operations.outcomes.failure} thất bại · ${operations.outcomes.conflict} xung đột`,
    ],
    [
      "MET21",
      "Tiếp nhận đến phân công đủ",
      operations.assignment.n === 1
        ? `${operations.assignment.minutes[0]} phút · n=1`
        : `— · n=${operations.assignment.n}`,
    ],
    ["MET22", "Chi phí nhà cung cấp", "Chưa biết"],
  ];
  return (
    <dl className="automation-facts" aria-label="Số liệu vận hành DEMO">
      {facts.map(([id, label, value]) => (
        <div key={id} data-report-metric={id}>
          <dt>
            {id} · {label}
          </dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function OperationalReportDetail({
  report,
}: {
  report: OrganizationReport;
}) {
  const { operations } = report;
  return (
    <section
      className="automation-panel"
      aria-label="Công việc, công suất và sử dụng"
    >
      <h2>Công việc, công suất và sử dụng</h2>
      <p>
        Công việc và tải là snapshot hiện tại. Kết quả hành động, phân công và
        sử dụng theo kỳ DEMO được chọn.
      </p>
      <OperationalFacts report={report} />
      <div className="report-columns">
        <section>
          <h3>MET16 · Trạng thái công việc</h3>
          <ul className="report-list">
            {(["todo", "ready", "active", "blocked"] as const).map((state) => (
              <li key={state}>
                {workStates[state]} ·{" "}
                {
                  operations.unfinished.filter((row) => row.state === state)
                    .length
                }
              </li>
            ))}
          </ul>
          <h3>MET18 · Hồ sơ có rủi ro</h3>
          {operations.risks.length ? (
            <ul className="report-list">
              {operations.risks.map((row) => (
                <li key={row.id}>
                  <Link href={`/work?scope=work&task=${row.id}`}>
                    {row.id} · {row.title}
                  </Link>
                  <p>{row.reasons.join(" · ")}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>Chưa có công việc có rủi ro trong phạm vi này.</p>
          )}
        </section>
        <section>
          <h3>MET17 · Tải và công suất</h3>
          <p>
            Ca DEMO, toàn tổ chức. Chưa có lịch thì công suất và thời gian còn
            lại chưa biết.
          </p>
          <div className="report-scroll">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Người phụ trách</th>
                  <th>Tải</th>
                  <th>Công suất</th>
                  <th>Còn lại</th>
                </tr>
              </thead>
              <tbody>
                {operations.staff?.rows.map((row) => (
                  <tr key={row.id}>
                    <th scope="row">{row.name}</th>
                    <td>{row.load}</td>
                    <td>{row.capacity ?? "—"}</td>
                    <td>{row.free ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Đơn vị phút. Chưa phân bổ{" "}
            {operations.staff?.unallocated.length ?? 0} công việc ·{" "}
            {operations.staff?.unallocated.reduce(
              (sum, row) => sum + row.remaining,
              0,
            ) ?? 0}{" "}
            phút.
          </p>
          <Link href="/workforce">Xem lịch và công suất</Link>
        </section>
      </div>
      <section>
        <h3>Điều phối và sử dụng</h3>
        <p>
          Bản nháp {operations.approvals.drafts} · Đã duyệt{" "}
          {operations.approvals.approved} · Lỗi thực thi hiện tại{" "}
          {operations.approvals.failed}. Kết quả theo kỳ chỉ đếm các mã hành
          động đã có kết quả.
        </p>
        <p>
          Chưa phân công đủ trong kỳ {operations.assignment.pending}. Trung vị
          và p95 cần thêm mẫu.
        </p>
        <p>
          Lượt DEMO trong kỳ {operations.usage.runs}. Token, chi phí và độ trễ
          nhà cung cấp chưa biết.
        </p>
      </section>
    </section>
  );
}
