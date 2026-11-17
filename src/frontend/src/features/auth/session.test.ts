import { describe, expect, it } from "vitest";
import { SessionStore } from "./session-store";
import { QueryClient } from "../../lib/api/query-client";
import { createDemoGateway } from "../../lib/demo/gateway";
import { createDemoFixtures } from "../../lib/demo/fixtures";
import { safeReturnPath } from "./session";
import type { ApiOutcome, UserView } from "../../lib/api/types";

describe("safe return paths", () => {
  it.each([
    "https://evil.invalid",
    "//evil.invalid",
    "/\\evil.invalid",
    "javascript:alert(1)",
    "/%2f%2fevil.invalid",
    "/logout",
    "/login",
    "/unknown",
    "/dashboard\n",
    "/dashboard#//evil.invalid",
  ])("normalizes/rejects %s", (url) => {
    expect(safeReturnPath(url)).toBe("/dashboard");
  });
  it("drops role, identity, redirect and arbitrary parameters", () => {
    expect(
      safeReturnPath(
        "/tickets?scope=mine&q=hello&role=ADMIN&userId=other&redirect=https://evil.invalid",
      ),
    ).toBe("/tickets?scope=mine&q=hello");
  });
});

describe("session response races", () => {
  it("cannot restore a principal from an old currentUser response", async () => {
    const adapter = createDemoGateway();
    const store = new SessionStore(new QueryClient(), adapter);
    const disconnect = store.connect();
    await store.login({ email: "requester@demo.invalid", password: "demo" });
    let resolve!: (value: ApiOutcome<UserView>) => void;
    adapter.gateway.currentUser = () =>
      new Promise((done) => {
        resolve = done;
      });
    const pending = store.refresh();
    await store.login({ email: "admin@demo.invalid", password: "demo" });
    resolve({
      kind: "success",
      status: 200,
      data: createDemoFixtures().personas.REQUESTER.user,
    });
    await pending;
    expect(store.getSnapshot()?.user.role).toBe("ADMIN");
    disconnect();
  });
  it("cannot finish an old login after revocation", async () => {
    const adapter = createDemoGateway();
    const store = new SessionStore(new QueryClient(), adapter);
    const disconnect = store.connect();
    let resolve!: (value: ApiOutcome<UserView>) => void;
    adapter.gateway.login = () =>
      new Promise((done) => {
        resolve = done;
      });
    const pending = store.login({
      email: "admin@demo.invalid",
      password: "demo",
    });
    adapter.controls.revokeSession();
    resolve({
      kind: "success",
      status: 200,
      data: createDemoFixtures().personas.ADMIN.user,
    });
    expect((await pending).kind).toBe("unknown");
    expect(store.getSnapshot()).toBeNull();
    disconnect();
  });
});
