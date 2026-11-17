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
import { knownDestinations } from "../../lib/navigation";
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
    !knownDestinations.has(url.pathname) ||
    url.pathname === "/logout"
  )
    return "/dashboard";
  const params = new URLSearchParams();
  for (const name of ["scope", "q"]) {
    const item = url.searchParams.get(name);
    if (item) params.set(name, item.slice(0, 180));
  }
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
