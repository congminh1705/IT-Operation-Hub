import { expect, it, vi } from "vitest";
import { createAccountGateway } from "./gateway";
import { createPagedQuery } from "./paged-query";
import { QueryClient } from "./query-client";
import type { ApiOutcome } from "./types";

it("requires real configuration and never substitutes DEMO on failure", async () => {
  const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new Error("offline"));
  expect(() => createAccountGateway({ mode: "real" })).toThrow();
  expect(createAccountGateway({ mode: "demo" }).mode).toBe("demo");
  const adapter = createAccountGateway({
    mode: "real",
    configuration: { deployment: "same-origin", fetcher },
  });
  expect(fetcher).not.toHaveBeenCalled();
  expect(await adapter.gateway.currentUser()).toMatchObject({
    kind: "unknown",
  });
  expect(fetcher).toHaveBeenCalledTimes(1);
});

it("bounds pages, isolates scope and keeps denied reads distinct from empty results", async () => {
  const client = new QueryClient();
  const identity = { userId: "u", scope: "own" };
  const read =
    vi.fn<
      (
        params: Readonly<Record<string, string>>,
        signal: AbortSignal,
      ) => Promise<ApiOutcome<{ items: string[] }>>
    >();
  expect(() =>
    createPagedQuery(client, identity, "tickets", read, {
      page: 1,
      page_size: 101,
    }),
  ).toThrow(RangeError);
  const query = createPagedQuery(client, identity, "tickets", read, undefined, {
    status: "open",
  });
  expect(query.key).not.toEqual(
    createPagedQuery(client, identity, "tickets", read).key,
  );
  await query.fetch();
  expect(read).not.toHaveBeenCalled();
  client.setIdentity(identity);
  read.mockResolvedValueOnce({
    kind: "success",
    status: 200,
    data: { items: [] },
  });
  await query.fetch();
  expect(read).toHaveBeenCalledWith(
    { page: "1", page_size: "20", status: "open" },
    expect.any(AbortSignal),
  );
  expect(client.getState(query.key)).toMatchObject({ status: "empty" });
  read.mockResolvedValueOnce({
    kind: "forbidden",
    status: 403,
    error: { code: "DENIED", message: "Denied", request_id: "test" },
  });
  await query.fetch();
  expect(client.getState(query.key)).toMatchObject({
    status: "error",
    error: { kind: "forbidden" },
  });
  client.setIdentity({ ...identity, scope: "team" });
  await query.fetch();
  expect(read).toHaveBeenCalledTimes(2);
  expect(client.getState(query.key)).toEqual({ status: "idle" });
});
