"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { bindQueryActivity, QueryClient } from "@/lib/api/query-client";
import type { QueryKey } from "@/lib/api/query-keys";
import { SessionProvider } from "@/features/auth/session";

const QueryContext = createContext<QueryClient | null>(null);
export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  useEffect(() => bindQueryActivity(client, document, window), [client]);
  useEffect(() => {
    const root = document.documentElement;
    const pointer = () => {
      if (root.dataset.inputModality !== "pointer")
        root.dataset.inputModality = "pointer";
    };
    const keyboard = () => {
      if (root.dataset.inputModality !== "keyboard")
        root.dataset.inputModality = "keyboard";
    };
    document.addEventListener("pointerdown", pointer, true);
    document.addEventListener("keydown", keyboard, true);
    return () => {
      document.removeEventListener("pointerdown", pointer, true);
      document.removeEventListener("keydown", keyboard, true);
      delete root.dataset.inputModality;
    };
  }, []);
  return (
    <QueryContext.Provider value={client}>
      <SessionProvider client={client}>{children}</SessionProvider>
    </QueryContext.Provider>
  );
}
export function useQueryClient() {
  const client = useContext(QueryContext);
  if (!client) throw new Error("Query hooks require Providers");
  return client;
}
export function useQueryState<T>(key: QueryKey) {
  const client = useQueryClient();
  return useSyncExternalStore(
    client.subscribe,
    () => client.getState<T>(key),
    () => client.getState<T>(key),
  );
}
