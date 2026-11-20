import { Feedback } from "@/components/feedback/feedback";
import type { DemoPersona } from "@/lib/demo/fixtures";
import { workforceProjection } from "@/lib/demo/workforce";
import "./workforce-screen.css";

const time = (minutes: number) =>
  String(Math.floor(minutes / 60)).padStart(2, "0") +
  ":" +
  String(minutes % 60).padStart(2, "0");
const range = ([start, end]: readonly [number, number]) =>
  time(start) + "–" + time(end);
const minutes = (value: number | null) =>
  value === null ? "Chưa đủ dữ liệu" : value + " phút";

export function WorkforceScreen({ persona }: { persona: DemoPersona }) {
  const projection = workforceProjection(persona);
  if (!projection) return <Feedback kind="forbidden" />;
  const { management, rows, unallocated } = projection;
  const identified = rows.filter((row) => row.capacity !== null);
  const metrics = [
    [
      "Nhân sự mẫu",
      String(rows.length),
      management ? "Phạm vi quản lý DEMO" : "Thông tin của tôi",
    ],
    [
      "Công việc còn lại",
      minutes(rows.reduce((sum, row) => sum + row.load, 0)),
      "Khối lượng đã phân bổ",
    ],
    [
      "Năng lực đã xác định",
      minutes(identified.reduce((sum, row) => sum + (row.capacity ?? 0), 0)),
      rows.length === identified.length
        ? "Theo lịch và ngân sách"
        : "Còn " + (rows.length - identified.length) + " người thiếu dữ liệu",
    ],
    [
      "Có lịch vắng",
      String(rows.filter((row) => row.absences.length).length),
      "Theo khung hiển thị",
    ],
  ];
  return (
    <div className="workforce">
      <section className="workforce-notice">
        <strong>Thời gian trống cần phù hợp với kỹ năng và khung lịch</strong>
        <p>
          Năng lực theo ngày hỗ trợ đối chiếu. Chọn người thực hiện còn cần kiểm
          tra lịch cụ thể.
        </p>
      </section>
      <dl className="workforce-metrics">
        {metrics.map(([label, value, detail]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              {value}
              <span>{detail}</span>
            </dd>
          </div>
        ))}
      </dl>
      <section className="workforce-panel">
        <h2>Khả năng tiếp nhận theo ngày</h2>
        <p>20/11/2026 · GMT+7 · Dữ liệu DEMO</p>
        <p className="workforce-scroll-hint">
          Cuộn ngang để xem lịch và năng lực.
        </p>
        <div
          className="workforce-table"
          role="region"
          aria-label="Bảng khả năng tiếp nhận"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                <th>Nhân sự</th>
                <th>Kỹ năng và xác minh</th>
                <th>Lịch và ngân sách</th>
                <th>Khối lượng và năng lực</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} data-workforce-id={row.id}>
                  <th scope="row">{row.name}</th>
                  <td>
                    {row.skills.length ? (
                      <ul>
                        {row.skills.map((skill) => (
                          <li key={skill.name}>
                            {skill.name} ·{" "}
                            {skill.verifier
                              ? "Đã xác minh bởi " + skill.verifier
                              : "Chưa xác minh"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "Chưa có dữ liệu kỹ năng"
                    )}
                  </td>
                  <td>
                    <p>
                      Lịch:{" "}
                      {row.schedule ? range(row.schedule) : "Chưa có lịch"}
                    </p>
                    <p>Ngân sách: {minutes(row.budget)}</p>
                    {row.absences.length > 0 && (
                      <>
                        <ul aria-label="Các khung vắng">
                          {row.absences.map((interval) => (
                            <li key={range(interval)}>
                              Vắng {range(interval)}
                            </li>
                          ))}
                        </ul>
                        <p>Vắng trong lịch sau gộp: {minutes(row.absent)}</p>
                      </>
                    )}
                  </td>
                  <td>
                    <p>Đã phân bổ: {minutes(row.load)}</p>
                    <p>Năng lực: {minutes(row.capacity)}</p>
                    <p
                      className={
                        row.free === null ? "workforce-missing" : undefined
                      }
                    >
                      Còn trống: {minutes(row.free)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {management && (
        <section className="workforce-panel">
          <h2>Công việc chưa phân bổ</h2>
          <ul>
            {unallocated.map((item) => (
              <li key={item.id}>
                {item.id} · {item.title} · {minutes(item.remaining)}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
