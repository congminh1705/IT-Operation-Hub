"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import type { WorkspaceIdentity } from "@/lib/workspace-identity";
import { SidebarContent } from "./sidebar";
import { Topbar } from "./topbar";
import { AccountMenu } from "./account-menu";
import { Icon } from "./icon";
import { Dialog } from "../ui/dialog";
import "./workspace.css";

export type WorkspaceShellProps = {
  persona: WorkspaceIdentity;
  pathname: string;
  scope?: string;
  query?: string;
  prefix?: string;
  children: ReactNode;
};

export function WorkspaceShell({
  persona,
  pathname,
  scope,
  query,
  prefix = "",
  children,
}: WorkspaceShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerId = useId();
  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 720px)");
    const closeOnDesktop = () => {
      if (!mobile.matches) setDrawerOpen(false);
    };
    mobile.addEventListener("change", closeOnDesktop);
    return () => mobile.removeEventListener("change", closeOnDesktop);
  }, []);
  return (
    <div className="workspace-shell">
      <a
        href="#workspace-main"
        className="shell-skip"
        onClick={() => document.getElementById("workspace-main")?.focus()}
      >
        Đến nội dung chính
      </a>
      <aside className="workspace-sidebar">
        <SidebarContent
          persona={persona}
          pathname={pathname}
          scope={scope}
          prefix={prefix}
        />
      </aside>
      <div className="workspace-column">
        {persona.demo ? (
          <Topbar
            persona={{ ...persona, demo: true }}
            prefix={prefix}
            query={query}
            drawerId={drawerId}
            drawerOpen={drawerOpen}
            onOpenDrawer={() => setDrawerOpen(true)}
          />
        ) : (
          <header className="workspace-topbar">
            <button
              className="shell-icon-button shell-menu-trigger"
              type="button"
              aria-label="Mở điều hướng"
              aria-expanded={drawerOpen}
              aria-controls={drawerId}
              onClick={() => setDrawerOpen(true)}
            >
              <Icon name="menu" />
            </button>
            <div className="shell-top-actions">
              <AccountMenu persona={persona} prefix={prefix} />
            </div>
          </header>
        )}
        <main id="workspace-main" tabIndex={-1} className="workspace-main">
          {children}
        </main>
        <footer className="workspace-footer">
          {persona.demo
            ? "IT Operations Hub · DEMO — dữ liệu tổng hợp, không phải phân quyền\n          thật"
            : "IT Operations Hub"}
        </footer>
      </div>
      <Dialog
        id={drawerId}
        className="shell-drawer"
        open={drawerOpen}
        title="Điều hướng"
        description="Chọn khu vực bạn muốn mở."
        onRequestClose={() => setDrawerOpen(false)}
      >
        <SidebarContent
          persona={persona}
          pathname={pathname}
          scope={scope}
          prefix={prefix}
          onNavigate={() => setDrawerOpen(false)}
        />
      </Dialog>
    </div>
  );
}
