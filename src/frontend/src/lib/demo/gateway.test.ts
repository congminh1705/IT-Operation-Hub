import { describe, expect, it, vi } from "vitest";
import { createAccountGateway } from "../api/gateway";
import type { ApiOutcome, ProfileUpdate, Role, UserView } from "../api/types";
import { createDemoFixtures, DEMO_CONVENTIONS } from "./fixtures";
import { createDemoGateway } from "./gateway";

const login = (
  adapter: ReturnType<typeof createDemoGateway>,
  role: Role = "REQUESTER",
) =>
  adapter.gateway.login({
    email: createDemoFixtures().personas[role].user.email!,
    password: "throwaway-demo-input",
  });
function user(result: ApiOutcome<UserView>): UserView {
  if (result.kind !== "success")
    throw new Error(`Expected success, got ${result.kind}`);
  return result.data;
}

describe("explicit adapter selection", () => {
  it("requires DEMO mode and never silently replaces real or missing mode", () => {
    expect(createAccountGateway({ mode: "demo" }).mode).toBe("demo");
    expect(() => createAccountGateway({ mode: "real" })).toThrow(
      /not implemented/,
    );
    // @ts-expect-error Runtime callers also receive a clear missing-mode failure.
    expect(() => createAccountGateway()).toThrow(/explicit DEMO/);
  });
});

describe("isolated mock sessions", () => {
  it.each<Role>(["REQUESTER", "TECHNICIAN", "IT_MANAGER", "ADMIN"])(
    "logs in as %s with its own identity projection",
    async (role) => {
      const a = createDemoGateway();
      expect((await a.gateway.currentUser()).kind).toBe("unauthenticated");
      const signedIn = user(await login(a, role));
      expect(signedIn.role).toBe(role);
      expect(user(await a.gateway.currentUser())).toEqual(signedIn);
      expect(a.controls.snapshot().navigation).toEqual(
        createDemoFixtures().personas[role].navigation,
      );
      signedIn.role = "ADMIN";
      expect(user(await a.gateway.currentUser()).role).toBe(role);
    },
  );

  it("rejects unknown email and empty credentials without establishing a session", async () => {
    const a = createDemoGateway();
    for (const input of [
      { email: "unknown@demo.invalid", password: "dummy" },
      { email: "requester@demo.invalid", password: "" },
      { email: "", password: "dummy" },
    ]) {
      expect(await a.gateway.login(input)).toMatchObject({
        kind: "unauthenticated",
        status: 401,
      });
      expect(a.controls.snapshot().session).toBe("anonymous");
    }
    a.controls.selectScenario("login-invalid");
    expect((await login(a)).kind).toBe("unauthenticated");
    expect(a.controls.snapshot().user).toBeNull();
  });

  it("keeps injected loading and connection errors distinct from logged-in success", async () => {
    const a = createDemoGateway();
    for (const [id, kind] of [
      ["login-pending", "pending"],
      ["login-unavailable", "unavailable"],
      ["login-rate-limited", "rate-limited"],
    ]) {
      a.controls.selectScenario(id);
      expect((await login(a)).kind).toBe(kind);
      expect(a.controls.snapshot().user).toBeNull();
    }
    a.controls.clearScenarios();
    expect((await login(a)).kind).toBe("success");
  });

  it("does not switch identities via a scenario payload", async () => {
    const a = createDemoGateway();
    a.controls.selectScenario("login-admin");
    expect((await login(a, "REQUESTER")).kind).toBe("unauthenticated");
    expect(user(await login(a, "ADMIN")).role).toBe("ADMIN");
    a.controls.selectScenario("current-user");
    expect(user(await a.gateway.currentUser()).role).toBe("ADMIN");
  });

  it("expires at an explicit DEMO instant and rejects later mutations", async () => {
    const a = createDemoGateway();
    await login(a);
    a.controls.setSessionExpiry("2026-01-01T00:00:01.000Z");
    a.controls.advanceTime(999);
    expect((await a.gateway.currentUser()).kind).toBe("success");
    a.controls.advanceTime(1);
    expect((await a.gateway.currentUser()).kind).toBe("unauthenticated");
    expect(a.controls.snapshot()).toMatchObject({
      session: "expired",
      user: null,
      navigation: [],
    });
    expect(
      (
        await a.gateway.updateOwnProfile({
          expectedVersion: 1,
          display_name: "DEMO changed",
        })
      ).kind,
    ).toBe("unauthenticated");
  });

  it.each(["session-expired", "session-revoked"])(
    "applies %s without keeping protected navigation",
    async (id) => {
      const a = createDemoGateway();
      await login(a, "ADMIN");
      a.controls.selectScenario(id);
      expect((await a.gateway.currentUser()).kind).toBe("unauthenticated");
      expect(a.controls.snapshot().navigation).toEqual([]);
      a.controls.clearScenarios();
      expect((await a.gateway.currentUser()).kind).toBe("unauthenticated");
    },
  );

  it("replaces access after role loss without changing the account ID", async () => {
    const a = createDemoGateway();
    const before = user(await login(a, "TECHNICIAN"));
    a.controls.selectScenario("permission-changed");
    const after = user(await a.gateway.currentUser());
    expect(after).toMatchObject({
      id: before.id,
      role: "REQUESTER",
      version: 2,
    });
    expect(a.controls.snapshot().navigation).not.toContain("it-tickets");
    expect(user(await a.gateway.currentUser()).version).toBe(2);
    a.controls.revokeSession();
    expect((await a.gateway.currentUser()).kind).toBe("unauthenticated");
  });

  it("isolates account data, instances and reset including clock/scenario/session", async () => {
    const a = createDemoGateway();
    const b = createDemoGateway();
    await login(a);
    await a.gateway.updateOwnProfile({
      expectedVersion: 1,
      display_name: "DEMO edited",
    });
    await login(a, "ADMIN");
    expect(user(await a.gateway.currentUser()).display_name).toBe("DEMO ADMIN");
    expect((await b.gateway.currentUser()).kind).toBe("unauthenticated");
    expect(user(await login(b)).display_name).toBe("DEMO REQUESTER");
    a.controls.advanceTime(500);
    a.controls.selectScenario("login-pending");
    a.controls.reset();
    expect(a.controls.snapshot()).toEqual({
      demo: true,
      now: DEMO_CONVENTIONS.initialTime,
      session: "anonymous",
      user: null,
      navigation: [],
    });
    expect(user(await login(a)).display_name).toBe("DEMO REQUESTER");
    const snapshot = a.controls.snapshot();
    snapshot.user!.display_name = "tampered";
    snapshot.navigation.push("administration");
    expect(a.controls.snapshot().navigation).not.toContain("administration");
    expect(user(await a.gateway.currentUser()).display_name).toBe(
      "DEMO REQUESTER",
    );
  });
});

describe("mock account mutation outcomes", () => {
  it("updates only the signed-in profile and conflicts on stale revisions", async () => {
    const a = createDemoGateway();
    const before = user(await login(a));
    expect(
      user(
        await a.gateway.updateOwnProfile({
          expectedVersion: 1,
          display_name: " DEMO edited ",
        }),
      ),
    ).toEqual({ ...before, display_name: "DEMO edited", version: 2 });
    expect(
      (
        await a.gateway.updateOwnProfile({
          expectedVersion: 1,
          display_name: "stale",
        })
      ).kind,
    ).toBe("conflict");
    expect(user(await a.gateway.currentUser()).display_name).toBe(
      "DEMO edited",
    );
  });

  it("rejects invalid names/versions and undeclared privilege fields without effects", async () => {
    const a = createDemoGateway();
    const before = user(await login(a));
    const inputs: ProfileUpdate[] = [
      { expectedVersion: 1, display_name: " " },
      { expectedVersion: 1, display_name: "a".repeat(121) },
      { expectedVersion: 0, display_name: "DEMO" },
      { expectedVersion: 1.5, display_name: "DEMO" },
      // @ts-expect-error Runtime must also reject undeclared fields.
      { expectedVersion: 1, display_name: "DEMO", role: "ADMIN" },
    ];
    for (const input of inputs) {
      expect((await a.gateway.updateOwnProfile(input)).kind).toBe("validation");
      expect(user(await a.gateway.currentUser())).toEqual(before);
    }
  });

  it.each(["profile-invalid", "profile-conflict", "profile-unknown"])(
    "%s never falsely commits a profile",
    async (id) => {
      const a = createDemoGateway();
      const before = user(await login(a));
      a.controls.selectScenario(id);
      expect(
        (
          await a.gateway.updateOwnProfile({
            expectedVersion: 1,
            display_name: "DEMO changed",
          })
        ).kind,
      ).not.toBe("success");
      expect(user(await a.gateway.currentUser())).toEqual(before);
    },
  );

  it("preserves the active session on password failure; clears it on simulated success", async () => {
    const a = createDemoGateway();
    const before = user(await login(a));
    const input = {
      current_password: "throwaway-current",
      new_password: "throwaway-new",
    };
    a.controls.selectScenario("password-failed");
    expect((await a.gateway.changeOwnPassword(input)).kind).toBe("validation");
    expect(user(await a.gateway.currentUser())).toEqual(before);
    a.controls.clearScenarios();
    expect(
      (await a.gateway.changeOwnPassword({ ...input, new_password: "" })).kind,
    ).toBe("validation");
    expect(await a.gateway.changeOwnPassword(input)).toEqual({
      kind: "success",
      status: 204,
      data: null,
    });
    expect((await a.gateway.currentUser()).kind).toBe("unauthenticated");
    expect(JSON.stringify(a.controls.snapshot())).not.toContain("throwaway");
  });

  it("preserves unknown logout as unconfirmed, then supports explicit reconciliation/logout", async () => {
    const a = createDemoGateway();
    await login(a);
    a.controls.selectScenario("logout-unknown");
    expect(await a.gateway.logout()).toMatchObject({
      kind: "unknown",
      effect: "unconfirmed",
    });
    expect((await a.gateway.currentUser()).kind).toBe("success");
    a.controls.clearScenarios();
    expect(await a.gateway.logout()).toEqual({
      kind: "success",
      status: 204,
      data: null,
    });
    expect(a.controls.snapshot().user).toBeNull();
    expect((await a.gateway.logout()).kind).toBe("unauthenticated");
  });

  it("rejects unknown scenarios/invalid clock controls without corrupting state", () => {
    const a = createDemoGateway();
    const before = a.controls.snapshot();
    expect(() => a.controls.selectScenario("invented-operation")).toThrow();
    expect(() => a.controls.advanceTime(-1)).toThrow();
    expect(() => a.controls.advanceTime(Number.NaN)).toThrow();
    expect(() => a.controls.setSessionExpiry("invalid")).toThrow();
    expect(a.controls.snapshot()).toEqual(before);
  });

  it("never fetches or persists mock credentials/state outside its instance", async () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    const store = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() };
    vi.stubGlobal("localStorage", store);
    vi.stubGlobal("sessionStorage", store);
    try {
      const a = createDemoGateway();
      await login(a);
      await a.gateway.updateOwnProfile({
        expectedVersion: 1,
        display_name: "DEMO changed",
      });
      await a.gateway.logout();
      a.controls.reset();
      expect(fetch).not.toHaveBeenCalled();
      expect(store.setItem).not.toHaveBeenCalled();
      expect(store.getItem).not.toHaveBeenCalled();
      expect(store.removeItem).not.toHaveBeenCalled();
    } finally {
      fetch.mockRestore();
      vi.unstubAllGlobals();
    }
  });
});
