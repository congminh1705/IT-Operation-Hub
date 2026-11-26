import { describe, expect, it, vi } from "vitest";
import type { HttpAccountGateway } from "../../lib/api/http-account";
import { QueryClient } from "../../lib/api/query-client";
import type { ApiOutcome, UserView } from "../../lib/api/types";
import { RealSessionStore } from "./real-session-store";

const user: UserView = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "requester@integration.invalid",
  display_name: "Integration requester",
  role: "REQUESTER",
  active: true,
  version: 1,
};
const success: ApiOutcome<UserView> = {
  kind: "success",
  status: 200,
  data: user,
};
const unauthenticated: ApiOutcome<UserView> = {
  kind: "unauthenticated",
  status: 401,
  error: { code: "SESSION_INVALID", message: "Invalid", request_id: "test" },
};
const unknown: ApiOutcome<null> = {
  kind: "unknown",
  effect: "unconfirmed",
  message: "",
};

function fixture() {
  const gateway: HttpAccountGateway = {
    admin: vi.fn(),
    login: vi.fn(),
    currentUser: vi.fn(),
    logout: vi.fn(),
    updateOwnProfile: vi.fn(),
    changeOwnPassword: vi.fn(),
  };
  const query = new QueryClient();
  return { gateway, query, store: new RealSessionStore(query, gateway) };
}

describe("real session store", () => {
  it("checks the server cookie before exposing the login response", async () => {
    const { gateway, store } = fixture();
    vi.mocked(gateway.login).mockResolvedValue(success);
    vi.mocked(gateway.currentUser).mockResolvedValue(unauthenticated);
    const result = await store.login({
      email: user.email,
      password: "synthetic",
    });
    expect(result.kind).toBe("unauthenticated");
    expect(store.getSnapshot().status).toBe("signed-out");
  });

  it("discards an in-flight directory result after losing Admin scope", async () => {
    const { gateway, store } = fixture();
    vi.mocked(gateway.currentUser).mockResolvedValueOnce({
      ...success,
      data: { ...user, role: "ADMIN" },
    });
    await store.refresh();
    let deliver!: () => void;
    vi.mocked(gateway.admin).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          deliver = () =>
            resolve({ kind: "success", status: 200, data: { items: [user] } });
        }),
    );
    const response = store.admin("/api/v1/users");
    vi.mocked(gateway.currentUser).mockResolvedValueOnce(success);
    await store.refresh();
    deliver();
    expect((await response).kind).toBe("unknown");
    expect((await store.admin("/api/v1/users")).kind).toBe("unknown");
    expect(gateway.admin).toHaveBeenCalledTimes(1);
  });

  it("keeps an unconfirmed logout locked and ignores the old identity read", async () => {
    const { gateway, query, store } = fixture();
    vi.mocked(gateway.currentUser).mockResolvedValueOnce(success);
    await store.refresh();
    const key = [user.id, "real:REQUESTER:1", "private", ""] as const;
    await query.fetch(key, async () => ({
      kind: "success",
      status: 200,
      data: "private",
    }));
    expect(query.getState(key).status).toBe("success");

    let deliver!: (result: ApiOutcome<UserView>) => void;
    vi.mocked(gateway.currentUser).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          deliver = resolve;
        }),
    );
    const waiting = store.refresh();
    vi.mocked(gateway.logout).mockResolvedValueOnce(unknown);
    await store.logout();
    deliver(success);
    await waiting;
    expect(store.getSnapshot().status).toBe("logout-error");
    expect(query.getState(key).status).toBe("idle");
    await store.refresh();
    expect(gateway.currentUser).toHaveBeenCalledTimes(2);
    vi.mocked(gateway.logout).mockResolvedValueOnce({
      kind: "success",
      status: 204,
      data: null,
    });
    await store.logout();
    expect(store.getSnapshot().status).toBe("signed-out");
  });
});
