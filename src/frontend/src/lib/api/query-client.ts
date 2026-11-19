import type { ApiOutcome } from "./types";
import type { QueryIdentity, QueryKey } from "./query-keys";

export const POLL_INTERVAL_MS = 30_000;
export type QueryState<T> =
  | { status: "idle" | "pending" }
  | { status: "success"; data: T }
  | { status: "empty"; data: T }
  | { status: "error"; error: unknown };
type Entry = {
  key: QueryKey;
  state: QueryState<unknown>;
  controller: AbortController;
  promise?: Promise<void>;
};
const IDLE: QueryState<never> = Object.freeze({ status: "idle" });

/** One memory-only client per mounted application. Never a server/module singleton. */
export class QueryClient {
  private identity: QueryIdentity | null = null;
  private entries = new Map<string, Entry>();
  private listeners = new Set<() => void>();
  private unauthorizedListeners = new Set<() => void>();
  onUnauthorized(listener: () => void) {
    this.unauthorizedListeners.add(listener);
    return () => {
      this.unauthorizedListeners.delete(listener);
    };
  }
  private polls = new Set<() => void>();
  private active = false;
  private timer?: ReturnType<typeof setInterval>;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private emit() {
    this.listeners.forEach((listener) => listener());
  }
  private owns(key: QueryKey) {
    return this.identity?.userId === key[0] && this.identity.scope === key[1];
  }
  setIdentity(identity: QueryIdentity | null) {
    if (
      identity?.userId === this.identity?.userId &&
      identity?.scope === this.identity?.scope
    )
      return;
    this.identity = identity ? { ...identity } : null;
    this.clear();
  }
  logout() {
    this.setIdentity(null);
  }
  clear() {
    this.entries.forEach((entry) => entry.controller.abort());
    this.entries.clear();
    this.emit();
  }
  invalidate(resource?: string) {
    for (const [id, entry] of this.entries) {
      if (!resource || entry.key[2] === resource) {
        entry.controller.abort();
        this.entries.delete(id);
      }
    }
    this.emit();
  }
  getState<T>(key: QueryKey): QueryState<T> {
    return (
      (this.owns(key)
        ? (this.entries.get(JSON.stringify(key))?.state as QueryState<T>)
        : undefined) ?? IDLE
    );
  }
  fetch<T>(
    key: QueryKey,
    read: (signal: AbortSignal) => Promise<ApiOutcome<T>>,
    isEmpty: (data: T) => boolean = (data) =>
      data === null || (Array.isArray(data) && data.length === 0),
  ): Promise<void> {
    if (!this.owns(key)) return Promise.resolve();
    const id = JSON.stringify(key);
    const previous = this.entries.get(id);
    if (previous?.promise) return previous.promise;
    const entry: Entry = {
      key: [...key],
      state: { status: "pending" },
      controller: new AbortController(),
    };
    this.entries.set(id, entry);
    // Defer transport invocation so a synchronous subscriber cannot duplicate this read.
    entry.promise = Promise.resolve()
      .then(() => {
        if (entry.controller.signal.aborted) return undefined;
        return read(entry.controller.signal);
      })
      .then((outcome) => {
        if (
          !outcome ||
          entry.controller.signal.aborted ||
          this.entries.get(id) !== entry ||
          !this.owns(key)
        )
          return;
        if (outcome.kind === "unauthenticated") {
          this.logout();
          this.unauthorizedListeners.forEach((listener) => listener());
          return;
        }
        if (outcome.kind === "success")
          entry.state = {
            status: isEmpty(outcome.data) ? "empty" : "success",
            data: outcome.data,
          };
        else if (outcome.kind === "pending")
          entry.state = { status: "pending" };
        else entry.state = { status: "error", error: outcome };
      })
      .catch((error: unknown) => {
        if (!entry.controller.signal.aborted && this.entries.get(id) === entry)
          entry.state = { status: "error", error };
      })
      .finally(() => {
        entry.promise = undefined;
        if (this.entries.get(id) === entry) this.emit();
      });
    this.emit();
    return entry.promise;
  }
  /** Poll registrations capture their original key; identity changes cannot elevate them. */
  poll<T>(
    key: QueryKey,
    read: (signal: AbortSignal) => Promise<ApiOutcome<T>>,
    isEmpty?: (data: T) => boolean,
  ) {
    const run = () => {
      void this.fetch(key, read, isEmpty);
    };
    this.polls.add(run);
    return () => {
      this.polls.delete(run);
    };
  }
  setActive(active: boolean) {
    this.active = active;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    if (active)
      this.timer = setInterval(() => {
        if (this.active) this.polls.forEach((run) => run());
      }, POLL_INTERVAL_MS);
  }
}

/** Active means visible AND focused. Returning starts a fresh 30-second interval. */
export function bindQueryActivity(
  client: QueryClient,
  page: Pick<
    Document,
    "visibilityState" | "hasFocus" | "addEventListener" | "removeEventListener"
  >,
  windowEvents: Pick<Window, "addEventListener" | "removeEventListener">,
) {
  const sync = () =>
    client.setActive(page.visibilityState === "visible" && page.hasFocus());
  page.addEventListener("visibilitychange", sync);
  windowEvents.addEventListener("focus", sync);
  windowEvents.addEventListener("blur", sync);
  sync();
  return () => {
    page.removeEventListener("visibilitychange", sync);
    windowEvents.removeEventListener("focus", sync);
    windowEvents.removeEventListener("blur", sync);
    client.setActive(false);
    client.clear();
  };
}
