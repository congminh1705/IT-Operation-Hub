import { expect, it } from "vitest";
import { createDemoFixtures } from "./fixtures";
import { createNotifications } from "./notifications";

it("keeps the first read timestamp and rechecks scope before building a link", () => {
  const { personas } = createDemoFixtures();
  let actor = personas.REQUESTER;
  let allowed = true;
  const store = createNotifications(
    () => actor,
    (_, id) => allowed && id === "TKT-000129",
  );
  const row = store.list()[0];
  expect(row.target).toBe("TKT-000129");
  allowed = false;
  expect(store.open(row.id)).toBeNull();
  expect(store.list()[0].target).toBeNull();
  const first = store.list()[0].readAt;
  expect(first).not.toBeNull();
  expect(store.markRead(row.id, "2026-12-02T01:00:00Z")).toBe(first);
  expect(store.unread()).toBe(1);
  actor = personas.IT_MANAGER;
  expect(store.markRead(row.id)).toBeNull();
  expect(store.unread()).toBe(3);
  actor = personas.REQUESTER;
  expect(store.list()[0].readAt).toBe(first);
});
