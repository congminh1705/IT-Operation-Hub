"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useOptionalSessionStore } from "@/features/auth/session";
import { Icon } from "@/components/layout/icon";
import "./monitoring.css";

const emptySubscribe = () => () => {};
const zero = () => 0;

export function NotificationBell({ prefix }: { prefix: string }) {
  const store = useOptionalSessionStore();
  const notices = store?.notifications;
  useSyncExternalStore(
    notices?.subscribe ?? emptySubscribe,
    notices?.getSnapshot ?? zero,
    zero,
  );
  const unread = prefix ? 0 : (notices?.unread() ?? 0);
  return (
    <Link
      className="shell-icon-button notice-bell"
      href={`${prefix}/notifications`}
      aria-label="Thông báo"
      aria-description={unread ? `${unread} thông báo chưa đọc` : undefined}
    >
      <Icon name="bell" />
      {unread > 0 && (
        <span
          className="notice-badge"
          aria-hidden="true"
          data-unread-count={unread}
        >
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
