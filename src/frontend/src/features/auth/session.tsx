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
  const names =
    url.pathname === "/tickets"
      ? [
          "scope",
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
      : ["scope", "q"];
  for (const name of names) {
    const item = url.searchParams.get(name);
    if (item) params.set(name, item.slice(0, 180));
  }
  const assetId = url.searchParams.get("id");
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
export function useSession() {
  const store = useContext(Context);
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
