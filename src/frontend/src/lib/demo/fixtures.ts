import type { Role, UserView } from "../api/types";

export const DEMO_CONVENTIONS = {
  label: "DEMO — dữ liệu tổng hợp, không phải phân quyền thật",
  initialTime: "2026-01-01T00:00:00.000Z",
  displayTimeZone: "Asia/Ho_Chi_Minh",
  reset:
    "Recreate fixtures and clear in-memory session/scenario state; no browser persistence.",
  clock:
    "Injected UTC clock, advanced explicitly; never infer production session TTL from DEMO.",
} as const;

/** A1 shell visibility projections only, never an authorization mechanism. */
export type NavigationKey =
  | "overview"
  | "my-requests"
  | "it-tickets"
  | "work"
  | "workforce"
  | "assistant"
  | "knowledge"
  | "assets"
  | "notifications"
  | "reports"
  | "audit"
  | "administration"
  | "profile"
  | "password"
  | "logout";

export interface DemoPersona {
  demo: true;
  user: UserView;
  navigation: NavigationKey[];
  scope: {
    tickets: "mine" | "team-and-mine" | "organization";
    workforce: "none" | "self-lookup" | "organization";
  };
}

/** Pure factory: each call supplies fresh nested objects for deterministic reset. */
export function createDemoFixtures(): {
  demo: true;
  now: string;
  sessionUserId: null;
  personas: Record<Role, DemoPersona>;
} {
  const common: NavigationKey[] = [
    "overview",
    "my-requests",
    "assistant",
    "knowledge",
    "assets",
    "notifications",
    "profile",
    "password",
    "logout",
  ];
  const create = (
    role: Role,
    suffix: number,
    navigation: NavigationKey[],
    scope: DemoPersona["scope"],
  ): DemoPersona => ({
    demo: true,
    user: {
      id: `00000000-0000-4000-8000-00000000000${suffix}`,
      display_name: `DEMO ${role}`,
      email: `${role.toLowerCase()}@demo.invalid`,
      role,
      active: true,
      version: 1,
    },
    navigation: [...navigation],
    scope,
  });
  return {
    demo: true,
    now: DEMO_CONVENTIONS.initialTime,
    sessionUserId: null,
    personas: {
      REQUESTER: create("REQUESTER", 1, common, {
        tickets: "mine",
        workforce: "none",
      }),
      TECHNICIAN: create(
        "TECHNICIAN",
        2,
        [...common, "it-tickets", "work", "workforce"],
        {
          tickets: "team-and-mine",
          workforce: "self-lookup",
        },
      ),
      IT_MANAGER: create(
        "IT_MANAGER",
        3,
        [...common, "it-tickets", "work", "workforce", "reports", "audit"],
        {
          tickets: "organization",
          workforce: "organization",
        },
      ),
      ADMIN: create(
        "ADMIN",
        4,
        [
          ...common,
          "it-tickets",
          "work",
          "workforce",
          "reports",
          "audit",
          "administration",
        ],
        {
          tickets: "organization",
          workforce: "organization",
        },
      ),
    },
  };
}
