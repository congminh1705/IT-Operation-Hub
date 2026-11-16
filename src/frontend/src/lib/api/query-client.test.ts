import { afterEach, describe, expect, it, vi } from "vitest";
import { bindQueryActivity, QueryClient } from "./query-client";
import { queryKey } from "./query-keys";
import type { ApiOutcome } from "./types";

const identity = { userId: "demo-a", scope: "REQUESTER:mine:v1" };
const key = queryKey(identity, "tickets");
const success = (data: string[]): ApiOutcome<string[]> => ({
  kind: "success",
  status: 200,
  data,
});
function setup() {
  const client = new QueryClient();
  client.setIdentity(identity);
  return client;
}
afterEach(() => vi.useRealTimers());
describe("private query lifecycle", () => {
  it("canonicalizes params and partitions user, scope and resource", () => {
    expect(queryKey(identity, "tickets", { b: "2", a: "1" })).toEqual(
      queryKey(identity, "tickets", { a: "1", b: "2" }),
    );
    expect(queryKey({ ...identity, userId: "b" }, "tickets")).not.toEqual(key);
    expect(queryKey({ ...identity, scope: "team" }, "tickets")).not.toEqual(
      key,
    );
    expect(queryKey(identity, "assets")).not.toEqual(key);
  });
  it("distinguishes idle, pending, empty, success and failed reads", async () => {
    const client = setup();
    expect(client.getState(key).status).toBe("idle");
    const request = client.fetch(key, async () => success([]));
    expect(client.getState(key).status).toBe("pending");
    await request;
    expect(client.getState(key)).toEqual({ status: "empty", data: [] });
    await client.fetch(key, async () => success(["one"]));
    expect(client.getState(key)).toEqual({ status: "success", data: ["one"] });
    await client.fetch(key, async () => {
      throw new Error("offline");
    });
    expect(client.getState(key).status).toBe("error");
    await client.fetch(key, async () => ({
      kind: "pending",
      effect: "unconfirmed",
    }));
    expect(client.getState(key).status).toBe("pending");
    await client.fetch(key, async () => ({
      kind: "unknown",
      effect: "unconfirmed",
      message: "lost",
    }));
    expect(client.getState(key).status).toBe("error");
  });
  it.each(["logout", "user", "scope", "invalidate", "clear"])(
    "rejects late responses after %s even when transport ignores abort",
    async (change) => {
      const client = setup();
      let resolve!: (value: ApiOutcome<string[]>) => void;
      let signal!: AbortSignal;
      const request = client.fetch(key, (s) => {
        signal = s;
        return new Promise<ApiOutcome<string[]>>((r) => {
          resolve = r;
        });
      });
      await Promise.resolve();
      if (change === "logout") client.logout();
      if (change === "user") client.setIdentity({ ...identity, userId: "b" });
      if (change === "scope")
        client.setIdentity({ ...identity, scope: "team" });
      if (change === "invalidate") client.invalidate("tickets");
      if (change === "clear") client.clear();
      expect(signal.aborted).toBe(true);
      client.setIdentity(identity);
      await client.fetch(key, async () => success(["new"]));
      resolve(success(["private-old"]));
      await request;
      expect(client.getState(key)).toEqual({
        status: "success",
        data: ["new"],
      });
    },
  );
  it("clears all cached resources and blocks old-user reads", async () => {
    const client = setup();
    await client.fetch(key, async () => success(["private"]));
    client.setIdentity({ ...identity, userId: "b" });
    const read = vi.fn(async () => success(["leak"]));
    await client.fetch(key, read);
    expect(read).not.toHaveBeenCalled();
    expect(client.getState(key).status).toBe("idle");
    client.setIdentity(identity);
    expect(client.getState(key).status).toBe("idle");
  });
  it("deduplicates in-flight reads and selectively invalidates resources", async () => {
    const client = setup();
    const read = vi.fn(async () => success(["one"]));
    await Promise.all([client.fetch(key, read), client.fetch(key, read)]);
    expect(read).toHaveBeenCalledTimes(1);
    const assets = queryKey(identity, "assets");
    await client.fetch(assets, read);
    client.invalidate("tickets");
    expect(client.getState(key).status).toBe("idle");
    expect(client.getState(assets).status).toBe("success");
  });
  it("polls each 30 seconds only when visible and focused; cleans listeners and timers", async () => {
    vi.useFakeTimers();
    const client = setup();
    const page = Object.assign(new EventTarget(), {
      visibilityState: "visible" as DocumentVisibilityState,
      hasFocus: () => focused,
    });
    const windowEvents = new EventTarget();
    let focused = true;
    const read = vi.fn(async () => success([]));
    const stop = client.poll(key, read);
    const dispose = bindQueryActivity(client, page, windowEvents);
    await vi.advanceTimersByTimeAsync(29_999);
    expect(read).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(read).toHaveBeenCalledTimes(1);
    page.visibilityState = "hidden";
    page.dispatchEvent(new Event("visibilitychange"));
    await vi.advanceTimersByTimeAsync(90_000);
    expect(read).toHaveBeenCalledTimes(1);
    page.visibilityState = "visible";
    focused = false;
    page.dispatchEvent(new Event("visibilitychange"));
    await vi.advanceTimersByTimeAsync(30_000);
    expect(read).toHaveBeenCalledTimes(1);
    focused = true;
    windowEvents.dispatchEvent(new Event("focus"));
    await vi.advanceTimersByTimeAsync(30_000);
    expect(read).toHaveBeenCalledTimes(2);
    client.logout();
    await vi.advanceTimersByTimeAsync(30_000);
    expect(read).toHaveBeenCalledTimes(2);
    stop();
    dispose();
    windowEvents.dispatchEvent(new Event("focus"));
    expect(vi.getTimerCount()).toBe(0);
  });
});
