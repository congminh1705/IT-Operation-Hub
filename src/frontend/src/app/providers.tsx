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

const QueryContext = createContext<QueryClient | null>(null);
export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  useEffect(() => bindQueryActivity(client, document, window), [client]);
  return (
    <QueryContext.Provider value={client}>{children}</QueryContext.Provider>
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
