"use client";

import { useId, useState, type ReactNode } from "react";
import type { DemoPersona } from "@/lib/demo/fixtures";
import { SidebarContent } from "./sidebar";
import { Topbar } from "./topbar";
import { Dialog } from "../ui/dialog";
import "./workspace.css";

export type WorkspaceShellProps = {
  persona: DemoPersona;
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
        <Topbar
          persona={persona}
          prefix={prefix}
          query={query}
          drawerId={drawerId}
          drawerOpen={drawerOpen}
          onOpenDrawer={() => setDrawerOpen(true)}
        />
        <main id="workspace-main" tabIndex={-1} className="workspace-main">
          {children}
        </main>
        <footer className="workspace-footer">
          IT Operations Hub · DEMO — dữ liệu tổng hợp, không phải phân quyền
          thật
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
