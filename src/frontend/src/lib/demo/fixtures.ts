import type { Role } from "../api/types";
import {
  workspaceIdentity,
  type WorkspaceIdentity,
} from "../workspace-identity";

export const DEMO_CONVENTIONS = {
  label: "DEMO — dữ liệu tổng hợp, không phải phân quyền thật",
  initialTime: "2026-01-01T00:00:00.000Z",
  displayTimeZone: "Asia/Ho_Chi_Minh",
  reset:
    "Recreate fixtures and clear in-memory session/scenario state; no browser persistence.",
  clock:
    "Injected UTC clock, advanced explicitly; never infer production session TTL from DEMO.",
} as const;

export type { NavigationKey } from "../workspace-identity";

export interface DemoPersona extends WorkspaceIdentity {
  demo: true;
}

/** Pure factory: each call supplies fresh nested objects for deterministic reset. */
export function createDemoFixtures(): {
  demo: true;
  now: string;
  sessionUserId: null;
  personas: Record<Role, DemoPersona>;
} {
  const create = (role: Role, suffix: number): DemoPersona => ({
    ...workspaceIdentity({
      id: `00000000-0000-4000-8000-00000000000${suffix}`,
      display_name: `DEMO ${role}`,
      email: `${role.toLowerCase()}@demo.invalid`,
      role,
      active: true,
      version: 1,
    }),
    demo: true,
  });
  return {
    demo: true,
    now: DEMO_CONVENTIONS.initialTime,
    sessionUserId: null,
    personas: {
      REQUESTER: create("REQUESTER", 1),
      TECHNICIAN: create("TECHNICIAN", 2),
      IT_MANAGER: create("IT_MANAGER", 3),
      ADMIN: create("ADMIN", 4),
    },
  };
}
