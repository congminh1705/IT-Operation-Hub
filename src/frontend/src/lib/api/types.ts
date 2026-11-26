import type {
  Error as WireError,
  Login,
  PasswordChange,
  ProfileUpdate as DraftProfileUpdate,
  UserView,
} from "./contract.generated";

export type { PasswordChange, UserView } from "./contract.generated";

export type Role = UserView["role"];

/** Transient input only. Never retain credentials in fixtures, logs or storage. */
export type LoginInput = Login;

/** Own display name only in A1. No user ID, email, role or active flag writes. */
export type ProfileUpdate = Required<
  Pick<DraftProfileUpdate, "expectedVersion" | "display_name">
>;

export type ApiError = WireError;

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
