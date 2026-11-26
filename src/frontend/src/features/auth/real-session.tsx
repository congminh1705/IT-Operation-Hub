"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
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
  const sessionSurface = useRef<HTMLDivElement>(null);
  useEffect(() => store.connect(), [store]);
  useEffect(() => {
    const refresh = () => {
      if (store.getSnapshot().status === "authenticated") void store.refresh();
    };
    const whenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    let snapshotGeneration = 0;
    const hideSnapshot = () => {
      snapshotGeneration++;
      if (sessionSurface.current) sessionSurface.current.style.display = "none";
    };
    const restoreSnapshot = async (event: PageTransitionEvent) => {
      const generation = ++snapshotGeneration;
      const surface = sessionSurface.current;
      if (!surface) return;
      if (event.persisted) {
        surface.style.display = "none";
        await store.refresh(true);
      }
      requestAnimationFrame(() => {
        if (generation === snapshotGeneration)
          surface.style.display = "contents";
      });
    };
    window.addEventListener("pagehide", hideSnapshot);
    window.addEventListener("pageshow", restoreSnapshot);
    document.addEventListener("visibilitychange", whenVisible);
    const interval = window.setInterval(whenVisible, POLL_INTERVAL_MS);
    return () => {
      snapshotGeneration++;
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pagehide", hideSnapshot);
      window.removeEventListener("pageshow", restoreSnapshot);
      document.removeEventListener("visibilitychange", whenVisible);
      window.clearInterval(interval);
    };
  }, [store]);
  return (
    <Context.Provider value={store}>
      <div ref={sessionSurface} style={{ display: "contents" }}>
        {children}
      </div>
    </Context.Provider>
  );
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
