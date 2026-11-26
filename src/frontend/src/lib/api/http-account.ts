import { accountOperations, type Csrf } from "./contract.generated";
import type { QueryClient } from "./query-client";
import { queryKey, type QueryIdentity } from "./query-keys";
import type {
  AccountGateway,
  ApiError,
  ApiFailure,
  ApiOutcome,
  LoginInput,
  PasswordChange,
  ProfileUpdate,
  Role,
  UnconfirmedOutcome,
  UserView,
} from "./types";

type Fetch = typeof globalThis.fetch;
type Operation = keyof typeof accountOperations;
type Mutation = { idempotencyKey?: string };
type WireObject = Record<string, unknown>;

export interface HttpAccountGateway extends AccountGateway {
  login(input: LoginInput, command?: Mutation): Promise<ApiOutcome<UserView>>;
  currentUser(signal?: AbortSignal): Promise<ApiOutcome<UserView>>;
  updateOwnProfile(
    input: ProfileUpdate,
    command?: Mutation,
  ): Promise<ApiOutcome<UserView>>;
  changeOwnPassword(
    input: PasswordChange,
    command?: Mutation,
  ): Promise<ApiOutcome<null>>;
}

const roles = {
  REQUESTER: true,
  TECHNICIAN: true,
  IT_MANAGER: true,
  ADMIN: true,
} satisfies Record<Role, true>;
const accountFields = {
  id: true,
  display_name: true,
  email: true,
  role: true,
  active: true,
  version: true,
} satisfies Record<keyof UserView, true>;
const errorFields = {
  code: true,
  message: true,
  field_errors: true,
  request_id: true,
} satisfies Record<keyof ApiError, true>;

const unknown: UnconfirmedOutcome = {
  kind: "unknown",
  effect: "unconfirmed",
  message: "Chưa xác nhận được kết quả. Vui lòng kiểm tra lại trạng thái.",
};

function isObject(value: unknown): value is WireObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseUser(value: unknown): UserView | undefined {
  if (
    !isObject(value) ||
    !Object.keys(value).every((key) => Object.hasOwn(accountFields, key)) ||
    typeof value.id !== "string" ||
    !/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(value.id) ||
    typeof value.display_name !== "string" ||
    (Object.hasOwn(value, "email") && typeof value.email !== "string") ||
    typeof value.role !== "string" ||
    !Object.hasOwn(roles, value.role) ||
    typeof value.active !== "boolean" ||
    typeof value.version !== "number" ||
    !Number.isSafeInteger(value.version) ||
    value.version < 1
  )
    return undefined;

  return {
    id: value.id,
    display_name: value.display_name,
    ...(typeof value.email === "string" ? { email: value.email } : {}),
    role: value.role as Role,
    active: value.active,
    version: value.version,
  };
}

function parseCsrf(value: unknown): Csrf | undefined {
  if (
    isObject(value) &&
    Object.keys(value).length === 1 &&
    typeof value.csrf_token === "string" &&
    value.csrf_token.trim().length > 0
  )
    return { csrf_token: value.csrf_token };
}

function parseError(value: unknown, fields: readonly string[] = []): ApiError {
  if (
    !isObject(value) ||
    !Object.keys(value).every((key) => Object.hasOwn(errorFields, key)) ||
    typeof value.code !== "string" ||
    typeof value.message !== "string" ||
    typeof value.request_id !== "string"
  )
    return {
      code: "INVALID_ERROR_RESPONSE",
      message: "Không thể hoàn tất yêu cầu.",
      request_id: "unavailable",
    };

  const fieldErrors: Record<string, string[]> = {};
  if (isObject(value.field_errors)) {
    for (const name of fields) {
      const messages = value.field_errors[name];
      if (
        Array.isArray(messages) &&
        messages.every((msg) => typeof msg === "string")
      )
        fieldErrors[name] = messages;
    }
  }
  return {
    code: value.code,
    message: value.message,
    request_id: value.request_id,
    ...(Object.keys(fieldErrors).length ? { field_errors: fieldErrors } : {}),
  };
}

async function json(response: Response): Promise<unknown> {
  if (
    response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  )
    return undefined;
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

const failureKinds = {
  401: "unauthenticated",
  403: "forbidden",
  404: "not-found",
  409: "conflict",
  422: "validation",
  429: "rate-limited",
  503: "unavailable",
} as const;

async function failure(
  response: Response,
  method: string,
  fields?: readonly string[],
): Promise<ApiFailure | UnconfirmedOutcome> {
  if (response.status === 202 && method !== "GET")
    return { kind: "pending", effect: "unconfirmed" };
  const status = response.status as keyof typeof failureKinds;
  if (Object.hasOwn(failureKinds, status)) {
    return {
      kind: failureKinds[status],
      status,
      error: parseError(await json(response), fields),
    } as ApiFailure;
  }
  if (method !== "GET") return unknown;
  return { kind: "error", status: 500, error: parseError(undefined) };
}

type RequestOptions = {
  body?: WireObject;
  key?: string;
  signal?: AbortSignal;
  loginCsrf?: boolean;
};
type RequestResult =
  { response: Response } | { outcome: ApiFailure | UnconfirmedOutcome };

/** Same-origin browser transport. The application integration chooses when to use it. */
export function createHttpAccountGateway(
  fetcher: Fetch = globalThis.fetch.bind(globalThis),
): HttpAccountGateway {
  async function request(
    operation: Operation,
    options: RequestOptions = {},
  ): Promise<RequestResult> {
    const { path, method, csrf, idempotency } = accountOperations[operation];
    try {
      const headers = new Headers({ Accept: "application/json" });
      if (csrf) {
        const token = await request("getCsrf", {
          loginCsrf: operation === "login",
        });
        if ("outcome" in token) return token;
        if (token.response.status !== 200)
          return { outcome: await failure(token.response, "GET") };
        const parsed = parseCsrf(await json(token.response));
        if (!parsed) return { outcome: unknown };
        headers.set("X-CSRF-Token", parsed.csrf_token);
      }
      if (idempotency)
        headers.set("Idempotency-Key", options.key ?? crypto.randomUUID());
      if (options.body) headers.set("Content-Type", "application/json");
      const response = await fetcher(
        options.loginCsrf ? path + "?purpose=login" : path,
        {
          method,
          headers,
          credentials: "same-origin",
          mode: "same-origin",
          cache: "no-store",
          redirect: "error",
          signal: options.signal,
          body: options.body && JSON.stringify(options.body),
        },
      );
      return { response };
    } catch {
      return { outcome: unknown };
    }
  }

  async function readUser(
    operation: "login" | "getCurrentUser" | "updateOwnProfile",
    options?: RequestOptions,
  ): Promise<ApiOutcome<UserView>> {
    const result = await request(operation, options);
    if ("outcome" in result) return result.outcome;
    const method = accountOperations[operation].method;
    if (result.response.status !== 200)
      return failure(result.response, method, Object.keys(options?.body ?? {}));
    const user = parseUser(await json(result.response));
    return user ? { kind: "success", status: 200, data: user } : unknown;
  }

  async function noContent(
    operation: "logout" | "changeOwnPassword",
    options?: RequestOptions,
  ): Promise<ApiOutcome<null>> {
    const result = await request(operation, options);
    if ("outcome" in result) return result.outcome;
    return result.response.status === 204
      ? { kind: "success", status: 204, data: null }
      : failure(
          result.response,
          accountOperations[operation].method,
          Object.keys(options?.body ?? {}),
        );
  }

  return {
    login: ({ email, password }, command) =>
      readUser("login", {
        body: { email, password },
        key: command?.idempotencyKey,
      }),
    currentUser: (signal) => readUser("getCurrentUser", { signal }),
    logout: () => noContent("logout"),
    updateOwnProfile: ({ expectedVersion, display_name }, command) =>
      readUser("updateOwnProfile", {
        body: { expectedVersion, display_name },
        key: command?.idempotencyKey,
      }),
    changeOwnPassword: ({ current_password, new_password }, command) =>
      noContent("changeOwnPassword", {
        body: { current_password, new_password },
        key: command?.idempotencyKey,
      }),
  };
}

/** Use after the session has established the effective identity/scope. */
export function currentAccountQuery(
  client: QueryClient,
  gateway: HttpAccountGateway,
  identity: QueryIdentity,
) {
  const key = queryKey(identity, "current-account");
  const userId = identity.userId;
  return {
    key,
    fetch: () =>
      client.fetch(key, async (signal) => {
        const outcome = await gateway.currentUser(signal);
        return outcome.kind === "success" && outcome.data.id !== userId
          ? unknown
          : outcome;
      }),
  };
}
