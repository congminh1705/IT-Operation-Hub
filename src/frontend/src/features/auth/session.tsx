"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { QueryClient } from "../../lib/api/query-client";
import {
  downloadRevokedFixture,
  uploadFixtures,
} from "../../lib/demo/ticket-attachments";
import { isKnownDestination, isTicketDetail } from "../../lib/navigation";
import { SessionStore } from "./session-store";

export function safeReturnPath(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\s%]/.test(value.split("?")[0])
  )
    return "/dashboard";
  const url = new URL(value, "http://demo.invalid");
  if (
    url.origin !== "http://demo.invalid" ||
    !isKnownDestination(url.pathname) ||
    url.pathname === "/logout"
  )
    return "/dashboard";
  const params = new URLSearchParams();
  if (url.pathname === "/audit") {
    const entry = url.searchParams.get("entry");
    const page = url.searchParams.get("page");
    const outcome = url.searchParams.get("outcome");
    const action = url.searchParams.get("action");
    if (entry && /^AUD-\d{3}$/.test(entry)) params.set("entry", entry);
    if (page && /^\d{1,4}$/.test(page)) params.set("page", page);
    if (outcome === "success" || outcome === "blocked")
      params.set("outcome", outcome);
    if (action) params.set("action", action.slice(0, 100));
  }
  const names =
    url.pathname === "/tickets"
      ? [
          "scope",
          "metric",
          "metricTeam",
          "at",
          "from",
          "to",
          "q",
          "state",
          "priority",
          "team",
          "category",
          "assignee",
          "sla",
          "sort",
          "size",
          "page",
        ]
      : url.pathname === "/reports" || url.pathname === "/dashboard"
        ? ["from", "to", "at", "team", "tab"]
        : url.pathname === "/assets"
          ? ["scope", "q", "warranty", "at"]
          : ["scope", "q"];
  for (const name of names) {
    const item = url.searchParams.get(name);
    if (item) params.set(name, item.slice(0, 180));
  }
  const assetId = url.searchParams.get("id");
  if (
    url.pathname === "/reports" &&
    url.searchParams.get("demo") === "report-error"
  )
    params.set("demo", "report-error");
  if (url.pathname === "/assistant" && url.searchParams.get("report") === "1") {
    params.set("report", "1");
    for (const key of ["from", "to", "team", "at"]) {
      const value = url.searchParams.get(key);
      if (value) params.set(key, value.slice(0, 40));
    }
  }
  if (
    url.pathname === "/assistant" &&
    assetId &&
    /^CHAT-\d{1,9}$/.test(assetId)
  )
    params.set("id", assetId);
  if (
    isTicketDetail(url.pathname) &&
    url.searchParams.get("view") === "internal"
  )
    params.set("view", "internal");
  if (url.pathname === "/knowledge") {
    const id = url.searchParams.get("id");
    const version = url.searchParams.get("version");
    if (id && /^KB-\d{3}$/.test(id)) params.set("id", id);
    if (version && /^\d{1,4}$/.test(version)) params.set("version", version);
    if (url.searchParams.get("edit") === "1") params.set("edit", "1");
  }
  if (
    url.pathname === "/assets" &&
    assetId &&
    /^[A-Z0-9-]{1,32}$/.test(assetId)
  )
    params.set("id", assetId);
  if (
    url.pathname === "/tickets" &&
    url.searchParams.get("demo") === "unavailable"
  )
    params.set("demo", "unavailable");
  if (url.pathname === "/tickets/new") {
    const demo = url.searchParams.get("demo");
    const asset = url.searchParams.get("asset");
    if (asset && /^[A-Z0-9-]{1,32}$/.test(asset)) params.set("asset", asset);
    if (
      demo === "failure" ||
      demo === "stale" ||
      demo === "unknown" ||
      demo === "asset-stale"
    )
      params.set("demo", demo);
  }
  if (
    isTicketDetail(url.pathname) &&
    ["detail-error", "reply-revoked", "transition-stale"].includes(
      url.searchParams.get("demo") ?? "",
    )
  )
    params.set("demo", url.searchParams.get("demo")!);
  const upload = uploadFixtures.find(
    (value) => value === url.searchParams.get("demo"),
  );
  if (
    upload &&
    (url.pathname === "/tickets/new" || isTicketDetail(url.pathname))
  )
    params.set("demo", upload);
  if (
    isTicketDetail(url.pathname) &&
    url.searchParams.get("demo") === downloadRevokedFixture
  )
    params.set("demo", downloadRevokedFixture);
  if (url.pathname === "/work" && url.searchParams.get("demo") === "work-stale")
    params.set("demo", "work-stale");
  const task = url.searchParams.get("task");
  if (url.pathname === "/work" && task && /^T\d{2}$/.test(task))
    params.set("task", task);
  if (url.pathname === "/assets" && url.searchParams.get("lifecycle") === "1")
    params.set("lifecycle", "1");
  if (
    url.pathname === "/workforce" &&
    url.searchParams.get("demo") === "workforce-conflict"
  )
    params.set("demo", "workforce-conflict");
  return url.pathname + (params.size ? `?${params}` : "");
}
const Context = createContext<SessionStore | null>(null);
export function SessionProvider({
  client,
  children,
}: {
  client: QueryClient;
  children: ReactNode;
}) {
  const [store] = useState(() => new SessionStore(client));
  useEffect(() => store.connect(), [store]);
  useEffect(() => {
    const refresh = () => {
      if (store.getSnapshot()) void store.refresh();
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
    };
  }, [store]);
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function useOptionalSessionStore() {
  return useContext(Context);
}
export function useSession() {
  const store = useOptionalSessionStore();
  if (!store) throw new Error("SessionProvider missing");
  const persona = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  return {
    persona,
    login: store.login,
    logout: store.logout,
    refresh: store.refresh,
    store,
  };
}
