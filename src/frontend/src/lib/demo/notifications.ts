import type { DemoPersona } from "./fixtures";

type Notice = {
  id: string;
  target: string;
  audience: "public" | "internal";
  label: string;
  at: string;
  readAt: string | null;
};

export function createNotifications(
  actor: () => DemoPersona | null,
  canRead: (actor: DemoPersona, ticket: string, internal: boolean) => boolean,
) {
  const recipients = new Map<string, Notice[]>();
  const listeners = new Set<() => void>();
  let revision = 0;
  function own() {
    const current = actor();
    if (!current?.user.active) return null;
    const { id, role } = current.user;
    let rows = recipients.get(id);
    if (!rows) {
      const requester = role === "REQUESTER";
      const fixture = (
        number: number,
        target: string,
        label: string,
        audience: Notice["audience"] = "public",
        readAt: string | null = null,
      ): Notice => ({
        id: `notice-${id.slice(-2)}-${number}`,
        target,
        label,
        audience,
        readAt,
        at: `2026-11-20T0${number + 6}:35:00+07:00`,
      });
      rows = [
        fixture(
          3,
          requester ? "TKT-000129" : "TKT-000126",
          requester
            ? "Kết quả đã sẵn sàng để kiểm tra"
            : "Yêu cầu cần được theo dõi",
        ),
        fixture(2, "TKT-999999", "Có cập nhật mới về yêu cầu"),
        fixture(
          1,
          "TKT-000126",
          "IT đã tiếp nhận yêu cầu",
          "public",
          "2026-11-20T08:00:00+07:00",
        ),
        ...(!requester
          ? [
              fixture(
                0,
                "TKT-000127",
                "Có cập nhật nội bộ trong phạm vi hỗ trợ",
                "internal",
              ),
            ]
          : []),
      ];
      recipients.set(id, rows);
    }
    return {
      current,
      rows: rows.filter(
        (row) => row.audience === "public" || role !== "REQUESTER",
      ),
    };
  }

  function markRead(id: string, now = new Date().toISOString()) {
    const row = own()?.rows.find((item) => item.id === id);
    if (!row) return null;
    if (!row.readAt) {
      row.readAt = now;
      revision++;
      listeners.forEach((listener) => listener());
    }
    return row.readAt;
  }

  function visibleTarget(persona: DemoPersona, row: Notice) {
    return canRead(persona, row.target, row.audience === "internal")
      ? row.target
      : null;
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => revision,
    unread: () => own()?.rows.filter((row) => !row.readAt).length ?? 0,
    list() {
      const session = own();
      return (
        session?.rows.map((row) => {
          const target = visibleTarget(session.current, row);
          return {
            id: row.id,
            at: row.at,
            readAt: row.readAt,
            target,
            label: target ? row.label : "Có cập nhật về một hồ sơ",
          };
        }) ?? []
      );
    },
    markRead,
    open(id: string) {
      const session = own();
      const row = session?.rows.find((item) => item.id === id);
      if (!session || !row) return null;
      markRead(id);
      const target = visibleTarget(session.current, row);
      return target
        ? `/tickets/${target}${row.audience === "internal" ? "?view=internal" : ""}`
        : null;
    },
  };
}
