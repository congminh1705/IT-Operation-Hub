import type {
  AccountGateway,
  AccountOperation,
  ApiFailure,
  ApiOutcome,
  Role,
  UnconfirmedOutcome,
  UserView,
} from "../api/types";
import { createDemoFixtures, type NavigationKey } from "./fixtures";
import { createDemoScenarios } from "./scenarios";

type SessionState = "anonymous" | "active" | "expired" | "revoked";

export interface DemoControls {
  selectScenario(id: string): void;
  clearScenarios(): void;
  advanceTime(milliseconds: number): void;
  setSessionExpiry(utc: string): void;
  revokeSession(): void;
  reset(): void;
  snapshot(): {
    demo: true;
    now: string;
    session: SessionState;
    user: UserView | null;
    navigation: NavigationKey[];
  };
}

export interface DemoAdapter {
  mode: "demo";
  gateway: AccountGateway;
  controls: DemoControls;
}

/** Isolated, explicit simulation. No fetch, cookies, storage or credential state. */
export function createDemoGateway(): DemoAdapter {
  let fixtures = createDemoFixtures();
  let users = Object.values(fixtures.personas).map((p) => p.user);
  let now = Date.parse(fixtures.now);
  let userId: string | null = null;
  let expiresAt: number | null = null;
  let session: SessionState = "anonymous";
  const selected = new Map<AccountOperation, string>();

  const failure = (
    kind: "unauthenticated" | "validation" | "conflict",
    code: string,
    message: string,
    fields?: Record<string, string[]>,
  ): ApiFailure => {
    const error = {
      code,
      message,
      request_id: `demo-request-${code.toLowerCase()}`,
      ...(fields ? { field_errors: fields } : {}),
    };
    if (kind === "unauthenticated") return { kind, status: 401, error };
    if (kind === "conflict") return { kind, status: 409, error };
    return { kind, status: 422, error };
  };
  const invalidate = (reason: SessionState) => {
    userId = null;
    expiresAt = null;
    session = reason;
  };
  const current = () => {
    if (session === "active" && expiresAt !== null && now >= expiresAt)
      invalidate("expired");
    return session === "active"
      ? users.find((u) => u.id === userId)
      : undefined;
  };
  const noSession = (): ApiFailure =>
    failure(
      "unauthenticated",
      `DEMO_SESSION_${session.toUpperCase()}`,
      "Phiên đăng nhập không còn hợp lệ.",
    );
  const scenario = (operation: AccountOperation) =>
    createDemoScenarios().find((s) => s.id === selected.get(operation));
  const injected = (
    operation: AccountOperation,
  ): ApiFailure | UnconfirmedOutcome | undefined => {
    const result = scenario(operation)?.expected;
    return result && result.kind !== "success"
      ? structuredClone(result)
      : undefined;
  };
  const success = (user: UserView): ApiOutcome<UserView> => ({
    kind: "success",
    status: 200,
    data: structuredClone(user),
  });
  const invalidCredentials = () =>
    failure(
      "unauthenticated",
      "DEMO_INVALID_CREDENTIALS",
      "Email hoặc mật khẩu không hợp lệ.",
    );

  const gateway: AccountGateway = {
    async login(input) {
      // Any nonempty throwaway password is accepted only in explicitly selected DEMO mode.
      const user = users.find(
        (u) => u.email === input.email?.trim().toLowerCase(),
      );
      if (
        !user ||
        !user.active ||
        typeof input.password !== "string" ||
        !input.password.trim()
      )
        return invalidCredentials();
      const chosen = scenario("login");
      if (
        chosen?.expected.kind === "success" &&
        user.id !== fixtures.personas[chosen.persona].user.id
      )
        return invalidCredentials();
      const outcome = injected("login");
      if (outcome) return outcome;
      // A completed account change drops old account-specific scenario selections.
      selected.clear();
      userId = user.id;
      session = "active";
      expiresAt = null;
      return success(user);
    },
    async currentUser() {
      const chosen = selected.get("currentUser");
      if (chosen === "session-expired" || chosen === "session-revoked") {
        invalidate(chosen === "session-expired" ? "expired" : "revoked");
      }
      const user = current();
      if (!user) return noSession();
      const outcome = injected("currentUser");
      if (outcome) return outcome;
      if (chosen === "permission-changed" && user.role === "TECHNICIAN") {
        user.role = "REQUESTER";
        user.version += 1;
      }
      return success(user);
    },
    async logout() {
      if (!current()) return noSession();
      const outcome = injected("logout");
      if (outcome) return outcome;
      invalidate("anonymous");
      selected.clear();
      return { kind: "success", status: 204, data: null };
    },
    async updateOwnProfile(input) {
      const user = current();
      if (!user) return noSession();
      const valid =
        Object.keys(input).every(
          (k) => k === "expectedVersion" || k === "display_name",
        ) &&
        Number.isInteger(input.expectedVersion) &&
        input.expectedVersion > 0 &&
        typeof input.display_name === "string" &&
        input.display_name.trim().length > 0 &&
        [...input.display_name].length <= 120;
      if (!valid)
        return failure(
          "validation",
          "DEMO_VALIDATION",
          "Kiểm tra thông tin đã nhập.",
          {
            display_name: [
              "Chỉ cập nhật tên hiển thị từ 1 đến 120 ký tự cùng phiên bản hợp lệ.",
            ],
          },
        );
      if (input.expectedVersion !== user.version)
        return failure(
          "conflict",
          "DEMO_VERSION_CONFLICT",
          "Thông tin đã thay đổi. Vui lòng tải lại trước khi sửa.",
        );
      const outcome = injected("updateOwnProfile");
      if (outcome) return outcome;
      user.display_name = input.display_name.trim();
      user.version += 1;
      return success(user);
    },
    async changeOwnPassword(input) {
      if (!current()) return noSession();
      const valid =
        Object.keys(input).every(
          (k) => k === "current_password" || k === "new_password",
        ) &&
        typeof input.current_password === "string" &&
        input.current_password.trim().length > 0 &&
        typeof input.new_password === "string" &&
        input.new_password.trim().length > 0;
      if (!valid)
        return failure(
          "validation",
          "DEMO_PASSWORD_REJECTED",
          "Không thể đổi mật khẩu.",
          {
            current_password: [
              "Nhập thông tin xác nhận DEMO; không dùng mật khẩu thật.",
            ],
          },
        );
      const outcome = injected("changeOwnPassword");
      if (outcome) return outcome;
      // No password is retained or compared. Re-login after this DEMO-only transition.
      invalidate("revoked");
      selected.clear();
      return { kind: "success", status: 204, data: null };
    },
  };

  const controls: DemoControls = {
    selectScenario(id) {
      const found = createDemoScenarios().find((s) => s.id === id);
      if (!found) throw new Error("Unknown DEMO scenario.");
      selected.set(found.operation, id);
    },
    clearScenarios() {
      selected.clear();
    },
    advanceTime(milliseconds) {
      if (
        !Number.isSafeInteger(milliseconds) ||
        milliseconds < 0 ||
        !Number.isFinite(new Date(now + milliseconds).getTime())
      ) {
        throw new Error(
          "DEMO clock requires a nonnegative safe millisecond advance.",
        );
      }
      now += milliseconds;
      current();
    },
    setSessionExpiry(utc) {
      const value = Date.parse(utc);
      if (!current()) throw new Error("No active DEMO session.");
      if (!utc.endsWith("Z") || !Number.isFinite(value))
        throw new Error("DEMO expiry requires a UTC ISO instant.");
      expiresAt = value;
      current();
    },
    revokeSession() {
      invalidate("revoked");
    },
    reset() {
      fixtures = createDemoFixtures();
      users = Object.values(fixtures.personas).map((p) => p.user);
      now = Date.parse(fixtures.now);
      selected.clear();
      invalidate("anonymous");
    },
    snapshot() {
      const user = current();
      return {
        demo: true,
        now: new Date(now).toISOString(),
        session,
        user: user ? structuredClone(user) : null,
        navigation: user
          ? [...fixtures.personas[user.role as Role].navigation]
          : [],
      };
    },
  };
  return { mode: "demo", gateway, controls };
}
