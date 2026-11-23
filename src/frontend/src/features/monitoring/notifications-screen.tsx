"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/features/auth/session";
import "../automation/automation.css";
import "./monitoring.css";

const time = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

export function NotificationsScreen() {
  const { store } = useSession();
  const router = useRouter();
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const unreadFilter = useRef<HTMLButtonElement>(null);
  const notices = store.notifications;
  useSyncExternalStore(
    notices.subscribe,
    notices.getSnapshot,
    notices.getSnapshot,
  );
  const rows = notices.list().filter((row) => !onlyUnread || !row.readAt);
  function filter(unread: boolean) {
    setOnlyUnread(unread);
    setUnavailable(false);
  }
  function moveFocus(control: HTMLButtonElement) {
    const item = control.closest("li");
    const destination = onlyUnread
      ? (item?.nextElementSibling ?? item?.previousElementSibling)
      : item;
    (destination?.querySelector("button") ?? unreadFilter.current)?.focus();
  }
  return (
    <section
      className="automation automation-panel monitoring"
      aria-label="Thông báo của bạn"
    >
      <h2>Thông báo của bạn</h2>
      <div className="automation-actions" aria-label="Lọc thông báo">
        <button
          className="ui-button"
          type="button"
          data-variant={onlyUnread ? "secondary" : undefined}
          aria-pressed={!onlyUnread}
          onClick={() => filter(false)}
        >
          Tất cả
        </button>
        <button
          ref={unreadFilter}
          className="ui-button"
          type="button"
          data-variant={onlyUnread ? undefined : "secondary"}
          aria-pressed={onlyUnread}
          onClick={() => filter(true)}
        >
          Chưa đọc
        </button>
      </div>
      <p role="status">{notices.unread()} thông báo chưa đọc</p>
      {unavailable && (
        <p role="alert">Hồ sơ không còn khả dụng trong phạm vi của bạn.</p>
      )}
      {rows.length ? (
        <ul className="monitoring-list">
          {rows.map((row) => (
            <li key={row.id}>
              <div>
                <h3>{row.label}</h3>
                <p>
                  {row.target && row.target + " · "}
                  <time dateTime={row.at}>
                    {time.format(new Date(row.at))}
                  </time>{" "}
                  · {row.readAt ? "Đã đọc" : "Chưa đọc"}
                </p>
              </div>
              <div className="automation-actions">
                <button
                  type="button"
                  className="ui-button"
                  data-variant="secondary"
                  onClick={(event) => {
                    const href = notices.open(row.id);
                    setUnavailable(!href);
                    if (href) router.push(href);
                    else if (onlyUnread) moveFocus(event.currentTarget);
                  }}
                >
                  {row.target ? "Mở yêu cầu" : "Mở thông báo"}
                </button>
                {!row.readAt && (
                  <button
                    type="button"
                    className="ui-button"
                    data-variant="secondary"
                    onClick={(event) => {
                      moveFocus(event.currentTarget);
                      notices.markRead(row.id);
                    }}
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>
          {onlyUnread ? "Không còn thông báo chưa đọc." : "Chưa có thông báo."}
        </p>
      )}
    </section>
  );
}
