"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Feedback } from "@/components/feedback/feedback";
import {
  WorkspacePage,
  type WorkspaceSearch,
} from "@/components/layout/workspace-page";
import { isKnownDestination } from "@/lib/navigation";
import { workspaceIdentity } from "@/lib/workspace-identity";
import { useRealSession } from "./real-session";
import type { RealSessionStore } from "./real-session-store";
import { safeReturnPath } from "./session";

export function realReturnPath(value: string | null): string {
  const url = new URL(safeReturnPath(value), "https://itoh.invalid");
  url.searchParams.delete("demo");
  return url.pathname + url.search;
}

export function RealWorkspaceEntry({
  store,
  pathname,
  search,
}: {
  store: RealSessionStore;
  pathname: string;
  search: WorkspaceSearch;
}) {
  const state = useRealSession(store);
  const router = useRouter();
  const logout = pathname === "/logout";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (typeof value === "string") params.set(key, value);
  }
  const target = realReturnPath(`${pathname}?${params}`);
  useEffect(() => {
    if (logout) void store.logout();
    else void store.refresh();
  }, [logout, pathname, store]);
  useEffect(() => {
    if (state.status === "signed-out")
      router.replace(
        logout ? "/login" : `/login?returnTo=${encodeURIComponent(target)}`,
      );
  }, [state.status, logout, target, router]);

  if (state.status === "logout-error")
    return (
      <Feedback
        kind="error"
        title="Chưa xác nhận đăng xuất"
        action={{ label: "Thử lại", onClick: () => void store.logout() }}
      />
    );
  if (state.status === "unavailable")
    return (
      <Feedback
        kind="error"
        title="Chưa kiểm tra được phiên"
        action={{ label: "Thử lại", onClick: () => void store.refresh() }}
      />
    );
  if (logout || state.status !== "authenticated")
    return <p role="status">Đang kiểm tra phiên đăng nhập…</p>;
  if (!isKnownDestination(pathname))
    return (
      <Feedback
        kind="empty"
        title="Không tìm thấy nội dung"
        action={{
          label: "Về tổng quan",
          onClick: () => router.replace("/dashboard"),
        }}
      />
    );

  return (
    <WorkspacePage
      persona={workspaceIdentity(state.user)}
      pathname={pathname}
      search={search}
      content={
        pathname === "/dashboard" ? (
          <p>Đã xác thực đăng nhập với {state.user.email}.</p>
        ) : undefined
      }
    />
  );
}
