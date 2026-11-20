import type { DemoClock } from "@/lib/demo/ticket-sla";

const labels = {
  running: "Đang chạy",
  risk: "Sắp tới hạn",
  breached: "Quá hạn",
  paused: "Đang tạm dừng",
  stopped: "Đã dừng",
} as const;

function formatMinutes(ms: number) {
  const minutes = Math.floor(ms / 60_000);
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours} giờ ${minutes % 60} phút` : `${minutes} phút`;
}

export function TicketSlaClocks({
  response,
  resolution,
}: {
  response: DemoClock;
  resolution: DemoClock;
}) {
  return (
    <section className="ticket-sla" aria-label="Cam kết hỗ trợ">
      <h3>Cam kết hỗ trợ</h3>
      {(
        [
          ["response", "Phản hồi đầu", response],
          ["resolution", "Giải quyết", resolution],
        ] as const
      ).map(([kind, label, clock]) => (
        <section
          key={kind}
          className="ticket-sla-clock"
          data-clock={kind}
          data-status={clock.status}
        >
          <h4>{label}</h4>
          <strong>
            {clock.completed
              ? kind === "response"
                ? "Đã phản hồi lần đầu"
                : "Đã giải quyết"
              : labels[clock.status]}
          </strong>
          <p>
            Đã dùng {formatMinutes(clock.used)} / {formatMinutes(clock.budget)}
          </p>
          {clock.status === "stopped" &&
            !clock.completed &&
            kind === "response" && <p>Chưa có phản hồi IT hợp lệ</p>}
          {clock.wasBreached && (
            <p className="ticket-sla-breach">Đã ghi nhận quá hạn</p>
          )}
          {clock.status !== "stopped" && (
            <p>Còn {formatMinutes(Math.max(0, clock.budget - clock.used))}</p>
          )}
        </section>
      ))}
      <p>Đồng hồ 24/7 · Theo snapshot DEMO</p>
    </section>
  );
}
