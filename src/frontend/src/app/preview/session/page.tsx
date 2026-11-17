"use client";

// Isolated synthetic verification surface, never linked from product navigation.
import Link from "next/link";
import { useRef, useState } from "react";
import { useSession } from "@/features/auth/session";
import { useQueryClient, useQueryState } from "@/app/providers";
import { queryKey, type QueryKey } from "@/lib/api/query-keys";
import { createDemoFixtures } from "@/lib/demo/fixtures";
import type { ApiOutcome } from "@/lib/api/types";

export default function SessionPreview() {
  const { persona, store, login, logout, refresh } = useSession();
  const client = useQueryClient();
  const [key, setKey] = useState<QueryKey>(["", "", "probe", ""]);
  const state = useQueryState<string>(key);
  const release = useRef<((result: ApiOutcome<string>) => void) | null>(null);
  const startRead = (delayed: boolean, unauthorized = false) => {
    const identity = store.identity();
    if (!identity) return;
    const next = queryKey(identity, "probe");
    setKey(next);
    client.invalidate("probe");
    void client.fetch(next, () =>
      delayed
        ? new Promise<ApiOutcome<string>>((resolve) => {
            release.current = resolve;
          })
        : Promise.resolve(
            unauthorized
              ? {
                  kind: "unauthenticated",
                  status: 401,
                  error: {
                    code: "DEMO_SESSION_REVOKED",
                    message: "Session revoked",
                    request_id: "demo",
                  },
                }
              : { kind: "success", status: 200, data: "PRIVATE DEMO RESULT" },
          ),
    );
  };
  return (
    <main>
      <h1>DEMO session verification</h1>
      <p>Isolated fixtures; no production authorization or real data.</p>
      {Object.values(createDemoFixtures().personas).map(({ user }) => (
        <button
          key={user.id}
          onClick={() => void login({ email: user.email!, password: "demo" })}
        >
          {user.role}
        </button>
      ))}
      <button onClick={() => void logout()}>Logout</button>
      <button onClick={() => store.adapter.controls.revokeSession()}>
        Revoke
      </button>
      <button
        onClick={() => {
          store.adapter.controls.setSessionExpiry("2026-01-01T00:00:01Z");
          store.adapter.controls.advanceTime(1000);
        }}
      >
        Expire
      </button>
      <button
        onClick={() => {
          store.adapter.controls.selectScenario("permission-changed");
          void refresh();
        }}
      >
        Change permission
      </button>
      <button onClick={() => startRead(false)}>Load private query</button>
      <button onClick={() => startRead(true)}>Start late query</button>
      <button
        onClick={() => {
          release.current?.({
            kind: "success",
            status: 200,
            data: "STALE PRIVATE RESULT",
          });
          release.current = null;
        }}
      >
        Resolve late query
      </button>
      <button onClick={() => startRead(false, true)}>Query 401</button>
      <output data-testid="persona">{persona?.user.role ?? "anonymous"}</output>
      <output data-testid="cache">{state.status}</output>
      {persona && (
        <section data-testid="private">
          PRIVATE {persona.user.display_name}
          {state.status === "success" && <p>{state.data}</p>}
        </section>
      )}
      <Link href="/dashboard">Open workspace</Link>
      <Link href="/login">Open login</Link>
      <Link href="/tickets/missing-demo">Missing fixture</Link>
      <Link href="/tickets/out-of-scope-demo">Out-of-scope fixture</Link>
      <button
        onClick={() => {
          setTimeout(() => store.adapter.controls.revokeSession(), 1000);
        }}
      >
        Revoke after navigation
      </button>
      <button
        onClick={() => {
          store.adapter.controls.setSessionExpiry("2026-01-01T00:00:01Z");
          setTimeout(() => store.adapter.controls.advanceTime(1000), 1000);
        }}
      >
        Expire after navigation
      </button>
    </main>
  );
}
