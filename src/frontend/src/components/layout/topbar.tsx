"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DemoPersona } from "@/lib/demo/fixtures";
import { ticketSearchHref } from "@/lib/navigation";
import { Icon } from "./icon";
import { AccountMenu } from "./account-menu";

export function Topbar({
  persona,
  prefix = "",
  query = "",
  drawerId,
  drawerOpen,
  onOpenDrawer,
}: {
  persona: DemoPersona;
  prefix?: string;
  query?: string;
  drawerId: string;
  drawerOpen: boolean;
  onOpenDrawer: () => void;
}) {
  const router = useRouter();
  return (
    <header className="workspace-topbar">
      <button
        className="shell-icon-button shell-menu-trigger"
        type="button"
        aria-label="Mở điều hướng"
        aria-expanded={drawerOpen}
        aria-controls={drawerId}
        onClick={onOpenDrawer}
      >
        <Icon name="menu" />
      </button>
      <form
        key={query}
        className="shell-ticket-search"
        role="search"
        aria-label="Tìm yêu cầu"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const value = String(data.get("q") ?? "");
          if (value.trim())
            router.push(ticketSearchHref(persona, value, prefix));
        }}
      >
        <Icon name="search" />
        <label htmlFor="shell-ticket-query" className="shell-sr-only">
          Tìm yêu cầu trong phạm vi của bạn
        </label>
        <input
          id="shell-ticket-query"
          name="q"
          type="search"
          defaultValue={query}
          maxLength={180}
          placeholder="Tìm mã, tên yêu cầu…"
          required
        />
        <button
          type="submit"
          className="shell-icon-button"
          aria-label="Tìm yêu cầu"
        >
          <Icon name="arrow-right" />
        </button>
      </form>
      <div className="shell-top-actions">
        <Link
          className="shell-icon-button"
          href={`${prefix}/notifications`}
          aria-label="Thông báo"
        >
          <Icon name="bell" />
        </Link>
        <AccountMenu persona={persona} prefix={prefix} />
      </div>
    </header>
  );
}
