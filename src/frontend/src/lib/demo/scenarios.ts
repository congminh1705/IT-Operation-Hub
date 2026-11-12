import type {
  AccountOperation,
  AccountOutcome,
  ApiError,
  Role,
} from "../api/types";
import { createDemoFixtures } from "./fixtures";

/** Discriminated by operation so a profile scenario cannot return logout data. */
export type AccountScenario = {
  [K in AccountOperation]: {
    id: string;
    demo: true;
    operation: K;
    persona: Role;
    trigger: string;
    expected: AccountOutcome<K>;
    simulatedEffect: "none" | "committed" | "unconfirmed";
  };
}[AccountOperation];

export function createDemoScenarios(): AccountScenario[] {
  const personas = createDemoFixtures().personas;
  const error = (
    code: string,
    message: string,
    fields?: ApiError["field_errors"],
  ): ApiError => ({
    code,
    message,
    request_id: `demo-request-${code.toLowerCase()}`,
    ...(fields ? { field_errors: fields } : {}),
  });
  const scenario = <K extends AccountOperation>(
    id: string,
    operation: K,
    expected: AccountOutcome<K>,
    simulatedEffect: AccountScenario["simulatedEffect"] = "none",
  ) => ({
    id,
    demo: true as const,
    operation,
    persona: "REQUESTER" as const,
    trigger: `DEMO explicit selection: ${id}; no credential matching policy implied.`,
    expected: structuredClone(expected),
    simulatedEffect,
  });

  return [
    ...Object.values(personas).map(({ user }) => ({
      ...scenario(
        `login-${user.role.toLowerCase()}`,
        "login",
        { kind: "success", status: 200, data: user },
        "committed",
      ),
      persona: user.role,
    })),
    scenario("login-invalid", "login", {
      kind: "unauthenticated",
      status: 401,
      error: error(
        "DEMO_INVALID_CREDENTIALS",
        "Email hoặc mật khẩu không hợp lệ.",
      ),
    }),
    scenario(
      "login-pending",
      "login",
      { kind: "pending", effect: "unconfirmed" },
      "unconfirmed",
    ),
    scenario("login-unavailable", "login", {
      kind: "unavailable",
      status: 503,
      error: error(
        "DEMO_UNAVAILABLE",
        "Không thể kết nối. Vui lòng thử lại sau.",
      ),
    }),
    scenario("login-rate-limited", "login", {
      kind: "rate-limited",
      status: 429,
      error: error("DEMO_RATE_LIMITED", "Vui lòng thử lại sau."),
    }),
    scenario("current-user", "currentUser", {
      kind: "success",
      status: 200,
      data: personas.REQUESTER.user,
    }),
    scenario("session-expired", "currentUser", {
      kind: "unauthenticated",
      status: 401,
      error: error("DEMO_SESSION_EXPIRED", "Phiên đăng nhập đã hết hạn."),
    }),
    scenario("session-revoked", "currentUser", {
      kind: "unauthenticated",
      status: 401,
      error: error("DEMO_SESSION_REVOKED", "Phiên đăng nhập không còn hợp lệ."),
    }),
    {
      ...scenario("permission-changed", "currentUser", {
        kind: "success",
        status: 200,
        data: { ...personas.TECHNICIAN.user, role: "REQUESTER", version: 2 },
      }),
      persona: "TECHNICIAN",
    },
    scenario("function-forbidden", "currentUser", {
      kind: "forbidden",
      status: 403,
      error: error(
        "DEMO_FORBIDDEN",
        "Bạn không có quyền thực hiện thao tác này.",
      ),
    }),
    scenario(
      "profile-saved",
      "updateOwnProfile",
      {
        kind: "success",
        status: 200,
        data: {
          ...personas.REQUESTER.user,
          display_name: "DEMO tên cập nhật",
          version: 2,
        },
      },
      "committed",
    ),
    scenario("profile-invalid", "updateOwnProfile", {
      kind: "validation",
      status: 422,
      error: error("DEMO_VALIDATION", "Kiểm tra thông tin đã nhập.", {
        display_name: ["Tên hiển thị không được để trống."],
      }),
    }),
    scenario("profile-conflict", "updateOwnProfile", {
      kind: "conflict",
      status: 409,
      error: error(
        "DEMO_VERSION_CONFLICT",
        "Thông tin đã thay đổi. Vui lòng tải lại trước khi sửa.",
      ),
    }),
    scenario(
      "profile-unknown",
      "updateOwnProfile",
      {
        kind: "unknown",
        effect: "unconfirmed",
        message:
          "Chưa xác định kết quả. Kiểm tra trạng thái trước khi gửi lại.",
      },
      "unconfirmed",
    ),
    scenario(
      "password-changed",
      "changeOwnPassword",
      { kind: "success", status: 204, data: null },
      "committed",
    ),
    scenario("password-failed", "changeOwnPassword", {
      kind: "validation",
      status: 422,
      error: error("DEMO_PASSWORD_REJECTED", "Không thể đổi mật khẩu.", {
        current_password: ["Thông tin xác nhận không hợp lệ."],
      }),
    }),
    scenario(
      "logout",
      "logout",
      { kind: "success", status: 204, data: null },
      "committed",
    ),
    scenario(
      "logout-unknown",
      "logout",
      {
        kind: "unknown",
        effect: "unconfirmed",
        message: "Chưa xác nhận đăng xuất. Vui lòng kiểm tra lại phiên.",
      },
      "unconfirmed",
    ),
  ];
}
