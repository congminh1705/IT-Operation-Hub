import type { AdminOutcome, HttpAccountGateway } from "@/lib/api/http-account";
import type { QueryClient } from "@/lib/api/query-client";
import type {
  ApiOutcome,
  LoginInput,
  PasswordChange,
  ProfileUpdate,
  UserView,
} from "@/lib/api/types";

type State =
  | {
      status:
        | "checking"
        | "signed-out"
        | "unavailable"
        | "logout-error"
        | "password-required";
    }
  | { status: "authenticated"; user: UserView };

const checking: State = { status: "checking" };
const unknown: ApiOutcome<never> = {
  kind: "unknown",
  effect: "unconfirmed",
  message: "",
};

export class RealSessionStore {
  private state: State = checking;
  private listeners = new Set<() => void>();
  private operation = 0;
  private reader?: AbortController;
  private writing = false;
  private scopeEpoch = 0;

  private scope(state: State) {
    return state.status === "authenticated"
      ? JSON.stringify([state.user.id, state.user.role, state.user.version])
      : undefined;
  }

  constructor(
    private client: QueryClient,
    private gateway: HttpAccountGateway,
  ) {}

  getSnapshot = () => this.state;
  getServerSnapshot = () => checking;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private set(state: State) {
    if (this.scope(this.state) !== this.scope(state)) this.scopeEpoch++;
    this.state = state;
    if (state.status === "authenticated") {
      const { user } = state;
      this.client.setIdentity({
        userId: user.id,
        scope: `real:${user.role}:${user.version}`,
      });
    } else {
      this.client.logout();
    }
    this.listeners.forEach((listener) => listener());
  }

  private interrupt() {
    this.reader?.abort();
    this.reader = undefined;
    return ++this.operation;
  }

  private accept(outcome: ApiOutcome<UserView>) {
    if (outcome.kind === "success" && outcome.data.active)
      this.set({ status: "authenticated", user: outcome.data });
    else if (outcome.kind === "unauthenticated" || outcome.kind === "success")
      this.set({ status: "signed-out" });
    else this.set({ status: "unavailable" });
  }

  refresh = async (hidePrevious = false) => {
    if (
      this.writing ||
      ["logout-error", "password-required"].includes(this.state.status)
    )
      return;
    if (hidePrevious) this.set(checking);
    const id = this.interrupt();
    const reader = new AbortController();
    this.reader = reader;
    const outcome = await this.gateway.currentUser(reader.signal);
    if (id === this.operation) this.accept(outcome);
  };

  login = async (input: LoginInput): Promise<ApiOutcome<UserView>> => {
    if (this.writing) return unknown;
    const id = this.interrupt();
    this.writing = true;
    this.set(checking);
    try {
      const outcome = await this.gateway.login(input);
      if (id !== this.operation) return unknown;
      if (outcome.kind !== "success") {
        if (
          outcome.kind === "forbidden" &&
          outcome.error.code === "PASSWORD_CHANGE_REQUIRED"
        )
          this.set({ status: "password-required" });
        else this.accept(outcome);
        return outcome;
      }
      const reader = new AbortController();
      this.reader = reader;
      const verified = await this.gateway.currentUser(reader.signal);
      if (id !== this.operation) return unknown;
      if (verified.kind === "success" && verified.data.id !== outcome.data.id) {
        this.set({ status: "signed-out" });
        return unknown;
      }
      this.accept(verified);
      return verified.kind === "success" && !verified.data.active
        ? unknown
        : verified;
    } finally {
      if (id === this.operation) this.writing = false;
    }
  };

  updateOwnProfile = async (
    input: ProfileUpdate,
  ): Promise<ApiOutcome<UserView>> => {
    if (this.writing || this.state.status !== "authenticated") return unknown;
    const current = this.state.user.id;
    const id = this.interrupt();
    this.writing = true;
    try {
      const result = await this.gateway.updateOwnProfile(input);
      if (id !== this.operation) return unknown;
      if (result.kind === "success" && result.data.id === current)
        this.accept(result);
      else if (result.kind === "unauthenticated") this.accept(result);
      else if (result.kind === "success") return unknown;
      return result;
    } finally {
      if (id === this.operation) this.writing = false;
    }
  };

  changeOwnPassword = async (
    input: PasswordChange,
  ): Promise<ApiOutcome<null>> => {
    if (
      this.writing ||
      !["authenticated", "password-required"].includes(this.state.status)
    )
      return unknown;
    const id = this.interrupt();
    this.writing = true;
    try {
      const result = await this.gateway.changeOwnPassword(input);
      if (id !== this.operation) return unknown;
      if (result.kind === "success" || result.kind === "unauthenticated")
        this.set({ status: "signed-out" });
      return result;
    } finally {
      if (id === this.operation) this.writing = false;
    }
  };

  admin: HttpAccountGateway["admin"] = async <T>(
    ...args: Parameters<HttpAccountGateway["admin"]>
  ): Promise<AdminOutcome<T>> => {
    if (
      this.state.status !== "authenticated" ||
      this.state.user.role !== "ADMIN"
    )
      return unknown;
    const epoch = this.scopeEpoch;
    const result = await this.gateway.admin<T>(...args);
    if (epoch !== this.scopeEpoch) return unknown;
    if (result.kind === "unauthenticated" || result.kind === "forbidden") {
      await this.refresh();
      if (epoch !== this.scopeEpoch) return unknown;
    }
    return result;
  };

  logout = async () => {
    if (this.writing) return;
    const id = this.interrupt();
    this.writing = true;
    this.set(checking);
    try {
      const outcome = await this.gateway.logout();
      if (id !== this.operation) return;
      this.set({
        status:
          outcome.kind === "success" || outcome.kind === "unauthenticated"
            ? "signed-out"
            : "logout-error",
      });
    } finally {
      if (id === this.operation) this.writing = false;
    }
  };

  connect = () => {
    const stop = this.client.onUnauthorized(() => {
      this.interrupt();
      this.writing = false;
      this.set({ status: "signed-out" });
    });
    void this.refresh();
    return () => {
      stop();
      this.interrupt();
      this.writing = false;
      this.set(checking);
    };
  };
}
