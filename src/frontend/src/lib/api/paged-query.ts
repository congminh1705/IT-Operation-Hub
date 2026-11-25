import type { QueryClient } from "./query-client";
import { queryKey, type QueryIdentity } from "./query-keys";
import type { ApiOutcome } from "./types";

export function createPagedQuery<T extends { items: readonly unknown[] }>(
  client: QueryClient,
  identity: QueryIdentity,
  resource: string,
  read: (
    params: Readonly<Record<string, string>>,
    signal: AbortSignal,
  ) => Promise<ApiOutcome<T>>,
  pagination: Readonly<{ page: number; page_size: number }> = {
    page: 1,
    page_size: 20,
  },
  filters: Readonly<Record<string, string>> = {},
) {
  const { page, page_size } = pagination;
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(page_size) ||
    page_size < 1 ||
    page_size > 100
  )
    throw new RangeError("Invalid pagination");

  const params = Object.freeze({
    ...filters,
    page: String(page),
    page_size: String(page_size),
  });
  const key = queryKey(identity, resource, params);
  const load = (signal: AbortSignal) => read(params, signal);
  const isEmpty = (data: T) => data.items.length === 0;
  return {
    key,
    fetch: () => client.fetch(key, load, isEmpty),
    poll: () => client.poll(key, load, isEmpty),
  };
}
