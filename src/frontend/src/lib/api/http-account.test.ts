import { describe, expect, expectTypeOf, it, vi } from "vitest";
import type { TicketPublic as WireTicketPublic } from "./contract.generated";
import { createHttpAccountGateway, currentAccountQuery } from "./http-account";
import type { TicketInternal, TicketPage, TicketPublic } from "./projections";
import { QueryClient } from "./query-client";
import type { ProfileUpdate, UserView } from "./types";

const user = {
  id: "00000000-0000-4000-8000-000000000001",
  display_name: "Synthetic account",
  email: "synthetic@example.invalid",
  role: "REQUESTER",
  active: true,
  version: 2,
} satisfies UserView;
const error = {
  code: "REQUEST_REJECTED",
  message: "Request rejected.",
  request_id: "test-request",
};
const csrf = () => Response.json({ csrf_token: "synthetic-token" });

function transport(...responses: Response[]) {
  const fetcher = vi.fn<typeof fetch>();
  for (const response of responses) fetcher.mockResolvedValueOnce(response);
  return { fetcher, gateway: createHttpAccountGateway(fetcher) };
}

describe("account HTTP contract", () => {
  it("sends login with fresh CSRF and same-origin settings without a command key", async () => {
    const { gateway, fetcher } = transport(csrf(), Response.json(user));
    const input = {
      email: "synthetic@example.invalid",
      password: "test-only",
      role: "ADMIN",
    };
    expect(
      await gateway.login(input, { idempotencyKey: "test-login-1" }),
    ).toEqual({
      kind: "success",
      status: 200,
      data: user,
    });
    expect(
      fetcher.mock.calls.map(([url, init]) => [url, init?.method]),
    ).toEqual([
      ["/api/v1/auth/csrf?purpose=login", "GET"],
      ["/api/v1/auth/login", "POST"],
    ]);
    for (const [, init] of fetcher.mock.calls)
      expect(init).toMatchObject({
        credentials: "same-origin",
        mode: "same-origin",
        cache: "no-store",
        redirect: "error",
      });
    const init = fetcher.mock.calls[1][1];
    const headers = new Headers(init?.headers);
    expect(headers.get("X-CSRF-Token")).toBe("synthetic-token");
    expect(headers.has("Idempotency-Key")).toBe(false);
    expect(headers.has("Cookie")).toBe(false);
    expect(headers.has("Origin")).toBe(false);
    expect(JSON.parse(String(init?.body))).toEqual({
      email: input.email,
      password: input.password,
    });
  });

  it("keeps profile updates display-name-only and follows operation-specific 204 and header semantics", async () => {
    const { fetcher, gateway } = transport(
      csrf(),
      Response.json(user),
      csrf(),
      new Response(null, { status: 204 }),
      csrf(),
      new Response(null, { status: 204 }),
    );
    const profile = {
      expectedVersion: 2,
      display_name: "Synthetic",
      contact_phone: "test-only",
    };
    expect((await gateway.updateOwnProfile(profile)).kind).toBe("success");
    expect(
      await gateway.changeOwnPassword({
        current_password: "test-current",
        new_password: "test-new",
      }),
    ).toMatchObject({ status: 204, data: null });
    expect(await gateway.logout()).toEqual({
      kind: "success",
      status: 204,
      data: null,
    });
    const [profileCall, passwordCall, logoutCall] = [1, 3, 5].map(
      (index) => fetcher.mock.calls[index],
    );
    expect([profileCall[0], passwordCall[0], logoutCall[0]]).toEqual([
      "/api/v1/auth/profile",
      "/api/v1/auth/password",
      "/api/v1/auth/logout",
    ]);
    expect(JSON.parse(String(profileCall[1]?.body))).toEqual({
      expectedVersion: 2,
      display_name: "Synthetic",
    });
    expect(
      new Headers(profileCall[1]?.headers).get("Idempotency-Key"),
    ).toBeTruthy();
    expect(
      new Headers(passwordCall[1]?.headers).get("Idempotency-Key"),
    ).toBeTruthy();
    expect(new Headers(logoutCall[1]?.headers).has("Idempotency-Key")).toBe(
      false,
    );
    expect(logoutCall[1]?.body).toBeUndefined();
  });

  it("fails closed on CSRF rejection or invalid token response before sending a mutation", async () => {
    const { fetcher, gateway } = transport(
      Response.json(error, { status: 403 }),
      Response.json({ csrf_token: "" }),
    );
    expect((await gateway.logout()).kind).toBe("forbidden");
    expect((await gateway.logout()).kind).toBe("unknown");
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      "/api/v1/auth/csrf",
      "/api/v1/auth/csrf",
    ]);
  });

  it.each([
    [401, "unauthenticated"],
    [403, "forbidden"],
    [404, "not-found"],
    [409, "conflict"],
    [422, "validation"],
    [429, "rate-limited"],
    [503, "unavailable"],
  ])("maps the %i account error to %s", async (status, kind) => {
    const { gateway } = transport(Response.json(error, { status }));
    expect(await gateway.currentUser()).toEqual({ kind, status, error });
  });

  it("keeps reviewed form errors and rejects raw or widened payloads", async () => {
    const { gateway } = transport(
      csrf(),
      Response.json(
        {
          ...error,
          field_errors: {
            display_name: ["Invalid"],
            internal_context: ["test-only"],
          },
        },
        { status: 422 },
      ),
      Response.json(
        { ...error, internal_context: "test-only" },
        { status: 403 },
      ),
      Response.json({ ...user, password_hash: "test-only" }),
      Response.json({ ...user, email: null }),
    );
    expect(
      await gateway.updateOwnProfile({ expectedVersion: 2, display_name: "" }),
    ).toMatchObject({
      kind: "validation",
      error: { field_errors: { display_name: ["Invalid"] } },
    });
    const denied = await gateway.currentUser();
    expect(denied).toMatchObject({
      kind: "forbidden",
      error: { code: "INVALID_ERROR_RESPONSE" },
    });
    expect(JSON.stringify(denied)).not.toContain("test-only");
    expect((await gateway.currentUser()).kind).toBe("unknown");
    expect((await gateway.currentUser()).kind).toBe("unknown");
  });

  it("distinguishes invalid credentials, accepted work and unknown writes without retry", async () => {
    const { gateway, fetcher } = transport(
      csrf(),
      Response.json(error, { status: 401 }),
      csrf(),
      new Response(null, { status: 202 }),
      csrf(),
    );
    fetcher.mockRejectedValueOnce(new Error("synthetic connection loss"));
    expect(
      (
        await gateway.login({
          email: "test@example.invalid",
          password: "test-only",
        })
      ).kind,
    ).toBe("unauthenticated");
    expect(await gateway.logout()).toEqual({
      kind: "pending",
      effect: "unconfirmed",
    });
    expect(await gateway.logout()).toMatchObject({
      kind: "unknown",
      effect: "unconfirmed",
    });
    expect(fetcher).toHaveBeenCalledTimes(6);
  });
});

describe("typed projection and query integration", () => {
  it("keeps account and public ticket DTOs scoped", () => {
    expectTypeOf<keyof UserView>().toEqualTypeOf<
      "id" | "display_name" | "email" | "role" | "active" | "version"
    >();
    expectTypeOf<keyof ProfileUpdate>().toEqualTypeOf<
      "expectedVersion" | "display_name"
    >();
    expectTypeOf<keyof WireTicketPublic>().toEqualTypeOf<
      | "id"
      | "code"
      | "title"
      | "description"
      | "status"
      | "priority"
      | "requester_id"
      | "team_id"
      | "version"
      | "sla"
    >();
    expectTypeOf<
      Exclude<keyof TicketInternal, keyof WireTicketPublic>
    >().toEqualTypeOf<"internal_context">();
    expectTypeOf<TicketInternal>().not.toExtend<TicketPublic>();
    expectTypeOf<TicketPage<TicketInternal>>().not.toExtend<
      TicketPage<TicketPublic>
    >();
    expectTypeOf<Extract<keyof TicketPublic, "assignee_id">>().toBeNever();
  });

  it("aborts old-scope reads, ignores late responses, and clears scoped cache on a current-session 401", async () => {
    const client = new QueryClient();
    const old = { userId: user.id, scope: "requester:1" };
    const changed = { ...old, scope: "requester:2" };
    const fetcher = vi.fn<typeof fetch>();
    let respond!: (response: Response) => void;
    fetcher.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          respond = resolve;
        }),
    );
    const gateway = createHttpAccountGateway(fetcher);
    client.setIdentity(old);
    const oldQuery = currentAccountQuery(client, gateway, old);
    const read = oldQuery.fetch();
    await Promise.resolve();
    client.setIdentity(changed);
    expect(fetcher.mock.calls[0][1]?.signal?.aborted).toBe(true);
    respond(Response.json(user));
    await read;
    expect(client.getState(oldQuery.key).status).toBe("idle");

    const activeQuery = currentAccountQuery(client, gateway, changed);
    expect(activeQuery.key).not.toEqual(oldQuery.key);
    fetcher.mockResolvedValueOnce(
      Response.json({ ...user, id: "00000000-0000-4000-8000-000000000002" }),
    );
    await activeQuery.fetch();
    expect(client.getState(activeQuery.key).status).toBe("error");
    fetcher
      .mockResolvedValueOnce(Response.json(user))
      .mockResolvedValueOnce(Response.json(error, { status: 401 }));
    await activeQuery.fetch();
    expect(client.getState(activeQuery.key)).toEqual({
      status: "success",
      data: user,
    });
    const unauthorized = vi.fn();
    client.onUnauthorized(unauthorized);
    await activeQuery.fetch();
    expect(unauthorized).toHaveBeenCalledOnce();
    expect(client.getState(activeQuery.key).status).toBe("idle");
  });
});
