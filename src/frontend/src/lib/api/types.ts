/** A1 wire DTO subset; handwritten from the draft OpenAPI, not generated types. */
export type Role = "REQUESTER" | "TECHNICIAN" | "IT_MANAGER" | "ADMIN";

export interface UserView {
  id: string;
  display_name: string;
  email?: string;
  role: Role;
  active: boolean;
  version: number;
}

/** Transient input only. Never retain credentials in fixtures, logs or storage. */
export interface LoginInput {
  email: string;
  password: string;
}

/** Own display name only in A1. No user ID, email, role or active flag writes. */
export interface ProfileUpdate {
  expectedVersion: number;
  display_name: string;
}

/** Policy thresholds remain undecided; DEMO scenarios do not establish them. */
export interface PasswordChange {
  current_password: string;
  new_password: string;
}

export interface ApiError {
  code: string;
  message: string;
  field_errors?: Record<string, string[]>;
  request_id: string;
}

type FailureStatus = {
  unauthenticated: 401;
  forbidden: 403;
  "not-found": 404;
  conflict: 409;
  validation: 422;
  "rate-limited": 429;
  unavailable: 503;
  error: 500;
};

export type ApiFailure = {
  [Kind in keyof FailureStatus]: {
    kind: Kind;
    status: FailureStatus[Kind];
    error: ApiError;
  };
}[keyof FailureStatus];

export type ApiSuccess<T> = {
  kind: "success";
  status: T extends null ? 204 : 200;
  data: T;
};

/** These local transport states are NOT successful HTTP/domain effects. */
export type UnconfirmedOutcome =
  | { kind: "pending"; effect: "unconfirmed" }
  | { kind: "unknown"; effect: "unconfirmed"; message: string };

export type ApiOutcome<T> = ApiSuccess<T> | ApiFailure | UnconfirmedOutcome;

/** Transport-independent contract only. FE-01.03 implements the mock adapter. */
export interface AccountGateway {
  login(input: LoginInput): Promise<ApiOutcome<UserView>>;
  currentUser(): Promise<ApiOutcome<UserView>>;
  logout(): Promise<ApiOutcome<null>>;
  updateOwnProfile(input: ProfileUpdate): Promise<ApiOutcome<UserView>>;
  changeOwnPassword(input: PasswordChange): Promise<ApiOutcome<null>>;
}

export type AccountOperation = keyof AccountGateway;
export type AccountOutcome<K extends AccountOperation> = Awaited<
  ReturnType<AccountGateway[K]>
>;
