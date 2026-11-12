import { describe, expect, expectTypeOf, it } from "vitest";
import type {
  AccountGateway,
  ApiOutcome,
  ApiSuccess,
  ProfileUpdate,
  Role,
  UserView,
} from "../api/types";
import { createDemoFixtures, DEMO_CONVENTIONS } from "./fixtures";
import { createDemoScenarios } from "./scenarios";

describe("A1 synthetic account projections", () => {
  it("provides exactly four unique, explicitly synthetic active personas", () => {
    const { personas } = createDemoFixtures();
    expect(Object.keys(personas).sort()).toEqual([
      "ADMIN",
      "IT_MANAGER",
      "REQUESTER",
      "TECHNICIAN",
    ]);
    const users = Object.values(personas).map((p) => p.user);
    expect(new Set(users.map((u) => u.id)).size).toBe(4);
    for (const persona of Object.values(personas)) {
      expect(persona.demo).toBe(true);
      expect(persona.user.email).toMatch(/@demo\.invalid$/);
      expect(persona.user.id).toMatch(
        /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/,
      );
      expect(persona.user.display_name).toMatch(/^DEMO /);
      expect(persona.user.active).toBe(true);
      expect(persona.user.version).toBeGreaterThan(0);
    }
  });

  it("keeps privileged navigation absent for requester and technician", () => {
    const p = createDemoFixtures().personas;
    for (const key of [
      "it-tickets",
      "work",
      "workforce",
      "reports",
      "audit",
      "administration",
    ]) {
      expect(p.REQUESTER.navigation).not.toContain(key);
    }
    for (const key of ["reports", "audit", "administration"]) {
      expect(p.TECHNICIAN.navigation).not.toContain(key);
    }
    expect(p.IT_MANAGER.navigation).not.toContain("administration");
    expect(p.ADMIN.navigation).toContain("administration");
    expect(p.IT_MANAGER.navigation).toEqual(
      expect.arrayContaining(["reports", "audit", "workforce"]),
    );
    expect(p.TECHNICIAN.scope).toEqual({
      tickets: "team-and-mine",
      workforce: "self-lookup",
    });
    expect(p.REQUESTER.scope).toEqual({ tickets: "mine", workforce: "none" });
  });

  it.each<Role>(["REQUESTER", "TECHNICIAN", "IT_MANAGER", "ADMIN"])(
    "retains personal requests and own account actions for %s",
    (role) => {
      expect(createDemoFixtures().personas[role].navigation).toEqual(
        expect.arrayContaining([
          "my-requests",
          "profile",
          "password",
          "logout",
          "assistant",
          "knowledge",
        ]),
      );
    },
  );

  it("reset recreates nested data without mutating another role or retaining login", () => {
    const original = createDemoFixtures();
    const changed = createDemoFixtures();
    changed.personas.REQUESTER.user.display_name = "changed";
    changed.personas.REQUESTER.navigation.push("administration");
    changed.personas.REQUESTER.scope.tickets = "organization";
    changed.now = "2030-01-01T00:00:00.000Z";
    expect(createDemoFixtures()).toEqual(original);
    expect(original.sessionUserId).toBeNull();
    expect(changed.personas.TECHNICIAN.navigation).not.toContain(
      "administration",
    );
    expect(new Date(original.now).toISOString()).toBe(
      DEMO_CONVENTIONS.initialTime,
    );
    expect(DEMO_CONVENTIONS.displayTimeZone).toBe("Asia/Ho_Chi_Minh");
  });
});

describe("A1 scenario boundaries", () => {
  it("covers each contract operation and the required failure/revocation cases", () => {
    const scenarios = createDemoScenarios();
    expect(new Set(scenarios.map((s) => s.id)).size).toBe(scenarios.length);
    expect([...new Set(scenarios.map((s) => s.operation))].sort()).toEqual([
      "changeOwnPassword",
      "currentUser",
      "login",
      "logout",
      "updateOwnProfile",
    ]);
    expect(scenarios.map((s) => s.id)).toEqual(
      expect.arrayContaining([
        "login-invalid",
        "session-expired",
        "session-revoked",
        "permission-changed",
        "profile-invalid",
        "profile-conflict",
        "password-failed",
        "profile-unknown",
      ]),
    );
    for (const s of scenarios) {
      expect(s.demo).toBe(true);
      if (s.expected.kind !== "success")
        expect(s.simulatedEffect).not.toBe("committed");
      if (s.expected.kind === "pending" || s.expected.kind === "unknown") {
        expect(s.expected.effect).toBe("unconfirmed");
        expect(s.expected).not.toHaveProperty("data");
      }
      if ("error" in s.expected) {
        expect(s.expected.error.request_id).toMatch(/^demo-request-/);
        expect(s.expected.error.code).toMatch(/^DEMO_/);
        expect(s.expected).not.toHaveProperty("data");
      }
    }
  });

  it("supports valid login for each persona without storing credentials", () => {
    const successes = createDemoScenarios().filter(
      (s) => s.operation === "login" && s.expected.kind === "success",
    );
    expect(successes.map((s) => s.persona).sort()).toEqual([
      "ADMIN",
      "IT_MANAGER",
      "REQUESTER",
      "TECHNICIAN",
    ]);
    for (const s of successes) {
      expect(s).not.toHaveProperty("input");
      expect(s).not.toHaveProperty("password");
      if (s.operation === "login" && s.expected.kind === "success") {
        expect(s.expected.data.role).toBe(s.persona);
        expect(s.expected.data).not.toHaveProperty("password");
        expect(s.expected.data).not.toHaveProperty("token");
      }
    }
  });

  it("a changed role yields requester navigation rather than old technician access", () => {
    const s = createDemoScenarios().find((s) => s.id === "permission-changed")!;
    expect(s.persona).toBe("TECHNICIAN");
    expect(s.operation).toBe("currentUser");
    if (s.operation !== "currentUser" || s.expected.kind !== "success")
      throw new Error("Expected refreshed account");
    expect(s.expected.data.role).toBe("REQUESTER");
    expect(s.expected.data.version).toBe(2);
    expect(
      createDemoFixtures().personas[s.expected.data.role].navigation,
    ).not.toContain("it-tickets");
  });

  it("keeps success status/payload and field-error shapes consistent with A1 wire contracts", () => {
    for (const s of createDemoScenarios()) {
      const r = s.expected;
      if (r.kind === "success") {
        expect(r.status).toBe(
          s.operation === "logout" || s.operation === "changeOwnPassword"
            ? 204
            : 200,
        );
        if (r.status === 204) expect(r.data).toBeNull();
      }
      if (r.kind === "validation") {
        expect(r.status).toBe(422);
        for (const messages of Object.values(r.error.field_errors ?? {})) {
          expect(messages.length).toBeGreaterThan(0);
          expect(messages.every((m) => typeof m === "string")).toBe(true);
        }
      }
      if (r.kind === "conflict") expect(r.status).toBe(409);
      if (r.kind === "forbidden") expect(r.status).toBe(403);
      if (r.kind === "unauthenticated") expect(r.status).toBe(401);
    }
  });

  it("scenario instances and resets do not share mutable payloads", () => {
    const pristine = createDemoScenarios();
    const changed = createDemoScenarios();
    const login = changed.find((s) => s.id === "login-requester")!;
    if (login.operation !== "login" || login.expected.kind !== "success")
      throw new Error("Expected login success");
    login.expected.data.display_name = "changed";
    expect(createDemoScenarios()).toEqual(pristine);
    expect(changed.find((s) => s.id === "current-user")).toEqual(
      pristine.find((s) => s.id === "current-user"),
    );
  });
});

describe("compile-time contract", () => {
  it("limits the gateway to A1 and rejects role writes or false successes", () => {
    expectTypeOf<keyof AccountGateway>().toEqualTypeOf<
      | "login"
      | "currentUser"
      | "logout"
      | "updateOwnProfile"
      | "changeOwnPassword"
    >();
    expectTypeOf<ProfileUpdate>().not.toHaveProperty("role");
    expectTypeOf<ProfileUpdate>().not.toHaveProperty("email");
    expectTypeOf<AccountGateway["logout"]>().returns.toEqualTypeOf<
      Promise<ApiOutcome<null>>
    >();
    const invalidLogout: ApiSuccess<null> = {
      kind: "success",
      // @ts-expect-error A no-content success cannot claim resource status.
      status: 200,
      data: null,
    };
    const invalidFailure: ApiOutcome<UserView> = {
      kind: "forbidden",
      status: 403,
      // @ts-expect-error A failed outcome cannot carry successful user data.
      data: {},
    };
    const elevated: ProfileUpdate = {
      expectedVersion: 1,
      display_name: "DEMO",
      // @ts-expect-error Profile updates cannot grant a role.
      role: "ADMIN",
    };
    void [invalidLogout, invalidFailure, elevated];
  });
});
