import { expect, test, vi } from "vitest";
import { createAssistant } from "./assistant";
import { createDemoFixtures } from "./fixtures";
import { createAssets } from "./assets";

test("switching user fences pending responses and chat deletion leaves assets intact", async () => {
  vi.useFakeTimers();
  try {
    const { REQUESTER, TECHNICIAN } = createDemoFixtures().personas;
    let actor = REQUESTER;
    let scope = "session-one";
    const assistant = createAssistant(
      () => actor,
      () => ({ userId: actor.user.id, scope }),
    );
    const assets = createAssets(() => []);
    const records = assets.ticketOptions(actor);
    const id = assistant.create("PUBLIC")!;
    expect(assistant.create("INTERNAL")).toBeNull();
    const pending = assistant.send(
      id,
      "PUBLIC",
      "DEMO pending",
      new AbortController().signal,
    );
    actor = TECHNICIAN;
    scope = "session-two";
    expect(assistant.read(id)).toBeNull();
    expect(assistant.remove(id)).toBe(false);
    await vi.advanceTimersByTimeAsync(650);
    expect(await pending).toEqual({ kind: "invalid" });
    actor = REQUESTER;
    scope = "session-three";
    expect(assistant.read(id)?.messages).toHaveLength(0);
    expect(assistant.remove(id)).toBe(true);
    expect(assets.ticketOptions(actor)).toEqual(records);
  } finally {
    vi.useRealTimers();
  }
});
