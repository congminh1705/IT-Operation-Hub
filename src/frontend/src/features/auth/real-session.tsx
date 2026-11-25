"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createAccountGateway } from "@/lib/api/gateway";
import { POLL_INTERVAL_MS, type QueryClient } from "@/lib/api/query-client";
import { RealSessionStore } from "./real-session-store";

const Context = createContext<RealSessionStore | null>(null);

export function RealSessionProvider({
  client,
  children,
}: {
  client: QueryClient;
  children: ReactNode;
}) {
  const [store] = useState(
    () =>
      new RealSessionStore(
        client,
        createAccountGateway({
          mode: "real",
          configuration: { deployment: "same-origin" },
        }).gateway,
      ),
  );
  useEffect(() => store.connect(), [store]);
  useEffect(() => {
    const refresh = () => {
      if (store.getSnapshot().status === "authenticated") void store.refresh();
    };
    const whenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    document.addEventListener("visibilitychange", whenVisible);
    const interval = window.setInterval(whenVisible, POLL_INTERVAL_MS);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      document.removeEventListener("visibilitychange", whenVisible);
      window.clearInterval(interval);
    };
  }, [store]);
  return <Context.Provider value={store}>{children}</Context.Provider>;
}

export function useOptionalRealSession() {
  return useContext(Context);
}

export function useRealSession(store: RealSessionStore) {
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
}
