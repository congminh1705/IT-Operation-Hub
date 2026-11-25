import type { UserView } from "./api/types";

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

export interface WorkspaceIdentity {
  demo: boolean;
  user: UserView;
  navigation: NavigationKey[];
  scope: {
    tickets: "mine" | "team-and-mine" | "organization";
    workforce: "none" | "self-lookup" | "organization";
  };
}

export function workspaceIdentity(user: UserView): WorkspaceIdentity {
  const navigation: NavigationKey[] = [
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
  const it = user.role !== "REQUESTER";
  const management = user.role === "IT_MANAGER" || user.role === "ADMIN";
  if (it) navigation.push("it-tickets", "work", "workforce");
  if (management) navigation.push("reports", "audit");
  if (user.role === "ADMIN") navigation.push("administration");
  return {
    user,
    demo: false,
    navigation,
    scope: {
      tickets: management ? "organization" : it ? "team-and-mine" : "mine",
      workforce: management ? "organization" : it ? "self-lookup" : "none",
    },
  };
}
