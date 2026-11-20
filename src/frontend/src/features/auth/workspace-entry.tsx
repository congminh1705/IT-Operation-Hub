"use client";
import { TicketForm } from "@/features/tickets/intake/ticket-form";
import { TicketList } from "@/features/tickets/intake/ticket-list";
import { SlaScreen } from "@/features/administration/sla-screen";
import { TeamsScreen } from "@/features/administration/teams-screen";
import { CatalogScreen } from "@/features/administration/catalog-screen";
import { UsersScreen } from "@/features/administration/users-screen";
import { PasswordForm } from "./password-form";
import { ProfileForm } from "./profile-form";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Feedback } from "@/components/feedback/feedback";
import { knownDestinations } from "@/lib/navigation";
import {
  WorkspacePage,
  type WorkspaceSearch,
} from "@/components/layout/workspace-page";
import { useSession, safeReturnPath } from "./session";
export function WorkspaceEntry({
  pathname,
  search,
}: {
  pathname: string;
  search: WorkspaceSearch;
}) {
  const { persona, logout, refresh } = useSession();
  const router = useRouter();
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (typeof value === "string") params.set(key, value);
  }
  const target = safeReturnPath(`${pathname}?${params}`);
  useEffect(() => {
    if (pathname === "/logout") void logout();
    else void refresh();
  }, [pathname, logout, refresh]);
  useEffect(() => {
    if (!persona)
      router.replace(`/login?returnTo=${encodeURIComponent(target)}`);
  }, [persona, router, target]);
  if (persona && !knownDestinations.has(pathname))
    return (
      <Feedback
        kind="empty"
        title="Không tìm thấy nội dung"
        description="Nội dung không tồn tại hoặc bạn không có quyền xem."
        action={{
          label: "Về tổng quan",
          onClick: () => router.replace("/dashboard"),
        }}
      />
    );
  return persona && pathname !== "/logout" ? (
    <WorkspacePage
      key={
        pathname === "/profile"
          ? persona.user.id
          : `${persona.user.id}:${persona.user.version}`
      }
      content={
        pathname === "/tickets" ? (
          <TicketList search={search} />
        ) : pathname === "/tickets/new" ? (
          <TicketForm />
        ) : pathname === "/profile" ? (
          <ProfileForm user={persona.user} />
        ) : pathname === "/profile/security" ? (
          <PasswordForm />
        ) : pathname === "/admin/users" || pathname === "/admin/users/new" ? (
          <UsersScreen key={pathname} create={pathname.endsWith("/new")} />
        ) : pathname === "/admin/departments" ||
          pathname === "/admin/categories" ? (
          <CatalogScreen
            key={pathname}
            kind={
              pathname === "/admin/departments" ? "departments" : "categories"
            }
          />
        ) : pathname === "/admin/teams" ? (
          <TeamsScreen />
        ) : pathname === "/admin/sla" ? (
          <SlaScreen />
        ) : undefined
      }
      persona={persona}
      pathname={pathname}
      search={search}
    />
  ) : (
    <p role="status">Đang kiểm tra phiên đăng nhập…</p>
  );
}
