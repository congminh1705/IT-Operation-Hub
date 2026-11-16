import type { Role } from "./api/types";
import type { DemoPersona, NavigationKey } from "./demo/fixtures";

export type IconName =
  | "dashboard"
  | "ticket"
  | "inbox"
  | "toolbox"
  | "users"
  | "calendar"
  | "ai"
  | "check-circle"
  | "settings"
  | "folder"
  | "laptop"
  | "chart"
  | "bell"
  | "history"
  | "building"
  | "user"
  | "clock"
  | "lock"
  | "logout"
  | "menu"
  | "search"
  | "arrow-right";
export type NavigationItem = {
  id: string;
  label: string;
  href: string;
  icon: IconName;
  group: "workspace" | "monitoring" | "admin";
  capability: NavigationKey;
  roles?: Role[];
};
const internal: Role[] = ["TECHNICIAN", "IT_MANAGER", "ADMIN"];
const managers: Role[] = ["IT_MANAGER", "ADMIN"];

export const roleLabels: Record<Role, string> = {
  REQUESTER: "Nhân viên",
  TECHNICIAN: "Kỹ thuật viên",
  IT_MANAGER: "Trưởng phòng IT",
  ADMIN: "Quản trị viên",
};

/** Visibility projection only; these fixture capabilities never grant real service access. */
export function getNavigation(persona: DemoPersona): NavigationItem[] {
  if (!persona.user.active) return [];
  const technician = persona.user.role === "TECHNICIAN";
  const personalAssets = persona.user.role === "REQUESTER" || technician;
  const items: NavigationItem[] = [
    {
      id: "overview",
      label: "Tổng quan",
      href: "/dashboard",
      icon: "dashboard",
      group: "workspace",
      capability: "overview",
    },
    {
      id: "my-requests",
      label: "Yêu cầu của tôi",
      href: "/tickets?scope=mine",
      icon: "ticket",
      group: "workspace",
      capability: "my-requests",
    },
    {
      id: "it-tickets",
      label: technician ? "Yêu cầu nhóm" : "Tất cả ticket",
      href: "/tickets?scope=work",
      icon: "inbox",
      group: "workspace",
      capability: "it-tickets",
      roles: internal,
    },
    {
      id: "work",
      label: technician ? "Công việc của tôi" : "Công việc IT",
      href: technician ? "/work?scope=mine" : "/work?scope=work",
      icon: "toolbox",
      group: "workspace",
      capability: "work",
      roles: internal,
    },
    {
      id: "team-work",
      label: "Công việc nhóm",
      href: "/work?scope=team",
      icon: "users",
      group: "workspace",
      capability: "work",
      roles: ["TECHNICIAN"],
    },
    {
      id: "workforce",
      label: technician ? "Lịch của tôi" : "Nhân sự & lịch",
      href: technician ? "/workforce?scope=mine" : "/workforce",
      icon: "calendar",
      group: "workspace",
      capability: "workforce",
      roles: internal,
    },
    {
      id: "assistant",
      label: "AI Workspace",
      href: "/assistant",
      icon: "ai",
      group: "workspace",
      capability: "assistant",
    },
    {
      id: "approvals",
      label: "Phê duyệt",
      href: "/approvals",
      icon: "check-circle",
      group: "workspace",
      capability: "assistant",
      roles: managers,
    },
    {
      id: "policies",
      label: "Chính sách & quy trình",
      href: "/automation/policies",
      icon: "settings",
      group: "workspace",
      capability: "assistant",
      roles: managers,
    },
    {
      id: "knowledge",
      label: "Kho kiến thức",
      href: "/knowledge",
      icon: "folder",
      group: "workspace",
      capability: "knowledge",
    },
    {
      id: "assets",
      label: personalAssets ? "Thiết bị của tôi" : "Tài sản & thiết bị",
      href: personalAssets ? "/assets?scope=mine" : "/assets?scope=work",
      icon: "laptop",
      group: "workspace",
      capability: "assets",
    },
    {
      id: "support-assets",
      label: "Thiết bị hỗ trợ",
      href: "/assets?scope=work",
      icon: "laptop",
      group: "workspace",
      capability: "assets",
      roles: ["TECHNICIAN"],
    },
    {
      id: "reports",
      label: "Báo cáo",
      href: "/reports",
      icon: "chart",
      group: "monitoring",
      capability: "reports",
      roles: managers,
    },
    {
      id: "notifications",
      label: "Thông báo",
      href: "/notifications",
      icon: "bell",
      group: "monitoring",
      capability: "notifications",
    },
    {
      id: "audit",
      label: "Nhật ký",
      href: "/audit",
      icon: "history",
      group: "monitoring",
      capability: "audit",
      roles: managers,
    },
    ...(
      [
        ["users", "Người dùng", "user"],
        ["departments", "Phòng ban", "building"],
        ["teams", "Nhóm IT", "users"],
        ["categories", "Danh mục", "folder"],
        ["sla", "Chính sách SLA", "clock"],
        ["assistant", "Cấu hình AI", "settings"],
      ] as const
    ).map(([id, label, icon]): NavigationItem => ({
      id: `admin-${id}`,
      label,
      href: `/admin/${id}`,
      icon,
      group: "admin",
      capability: "administration",
      roles: ["ADMIN"],
    })),
  ];
  return items.filter(
    (item) =>
      persona.navigation.includes(item.capability) &&
      (!item.roles || item.roles.includes(persona.user.role)),
  );
}

export function getAccountLinks(persona: DemoPersona) {
  if (!persona.user.active) return [];
  return [
    { id: "profile", label: "Hồ sơ", href: "/profile" },
    { id: "password", label: "Đổi mật khẩu", href: "/profile/security" },
    { id: "logout", label: "Đăng xuất", href: "/logout" },
  ].filter((item) => persona.navigation.includes(item.id as NavigationKey));
}

export const knownDestinations = new Set([
  "/dashboard",
  "/tickets",
  "/work",
  "/workforce",
  "/assistant",
  "/approvals",
  "/automation/policies",
  "/knowledge",
  "/assets",
  "/reports",
  "/notifications",
  "/audit",
  "/admin/users",
  "/admin/departments",
  "/admin/teams",
  "/admin/categories",
  "/admin/sla",
  "/admin/assistant",
  "/profile",
  "/profile/security",
  "/logout",
]);

export function effectiveScope(
  persona: DemoPersona,
  pathname: string,
  requested?: string,
): string {
  if (pathname === "/workforce")
    return persona.scope.workforce === "self-lookup" ? "mine" : "work";
  if (pathname === "/work")
    return persona.user.role === "TECHNICIAN"
      ? requested === "team" || requested === "work"
        ? "team"
        : "mine"
      : "work";
  if (pathname === "/tickets" || pathname === "/assets") {
    if (persona.user.role === "REQUESTER") return "mine";
    return requested === "mine" ? "mine" : "work";
  }
  return "";
}

export function activeNavigation(
  persona: DemoPersona,
  pathname: string,
  requestedScope?: string,
) {
  const candidates = getNavigation(persona).filter(
    (item) => item.href.split("?")[0] === pathname,
  );
  const scope = effectiveScope(persona, pathname, requestedScope);
  return (
    candidates.find(
      (item) =>
        new URL(item.href, "http://demo.invalid").searchParams.get("scope") ===
        scope,
    ) ?? candidates[0]
  );
}

export function canOpenDestination(persona: DemoPersona, pathname: string) {
  return [...getNavigation(persona), ...getAccountLinks(persona)].some(
    (item) => item.href.split("?")[0] === pathname,
  );
}

export function ticketSearchHref(
  persona: DemoPersona,
  value: string,
  prefix = "",
) {
  const scope =
    persona.user.role !== "REQUESTER" &&
    persona.navigation.includes("it-tickets")
      ? "work"
      : "mine";
  const query = new URLSearchParams({ scope, q: value.trim().slice(0, 180) });
  return `${prefix}/tickets?${query}`;
}
