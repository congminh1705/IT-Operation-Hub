"use client";
import { AssetScreen } from "@/features/assets/asset-screen";
import { ApprovalProposal } from "@/features/automation/approval-proposal";
import { AutomationActivity } from "@/features/automation/automation-activity";
import { AutomationScreen } from "@/features/automation/automation-screen";
import { WorkforceScreen } from "@/features/workforce/workforce-screen";
import { WorkBoard } from "@/features/work/work-board";
import {
  downloadRevokedFixture,
  uploadFixtures,
} from "@/lib/demo/ticket-attachments";
import { TicketDetail } from "@/features/tickets/intake/ticket-detail";
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
import { isKnownDestination, isTicketDetail } from "@/lib/navigation";
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
  if (persona && !isKnownDestination(pathname))
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
        pathname === "/assets" ? (
          <AssetScreen
            scope={params.get("scope") ?? "work"}
            id={params.get("id") ?? undefined}
          />
        ) : pathname === "/approvals" ? (
          <ApprovalProposal />
        ) : pathname === "/automation/activity" ? (
          <AutomationActivity />
        ) : pathname === "/automation/policies" ? (
          <AutomationScreen />
        ) : pathname === "/workforce" ? (
          <WorkforceScreen
            persona={persona}
            conflict={params.get("demo") === "workforce-conflict"}
          />
        ) : pathname === "/work" ? (
          <WorkBoard
            scope={params.get("scope") ?? undefined}
            scenario={params.get("demo") ?? undefined}
          />
        ) : pathname === "/tickets" ? (
          <TicketList search={search} />
        ) : pathname === "/tickets/new" ? (
          <TicketForm search={search} />
        ) : isTicketDetail(pathname) ? (
          <TicketDetail
            key={pathname}
            id={pathname.split("/").at(-1)!}
            unavailable={search.demo === "detail-error"}
            simulateDownloadTransfer={search.demo === downloadRevokedFixture}
            uploadFixture={uploadFixtures.find(
              (value) => value === search.demo,
            )}
            simulateRevocation={search.demo === "reply-revoked"}
            simulateTransitionConflict={search.demo === "transition-stale"}
          />
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
