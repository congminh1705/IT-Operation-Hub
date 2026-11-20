import { expect, test, vi } from "vitest";
import { createDemoFixtures } from "./fixtures";
import { createTicketIntake } from "./ticket-intake";
import { baseline } from "./sla-policy";

test("two concurrent claims of one version leave exactly one claim event", async () => {
  vi.useFakeTimers();
  try {
    const actor = createDemoFixtures().personas.TECHNICIAN;
    const store = createTicketIntake({
      identity: () => ({ userId: actor.user.id, scope: "test" }),
      actor: () => actor,
      memberships: () => ["support"],
      isTeamMember: () => true,
      intake: () => ({ id: "support", name: "IT Support" }),
      snapshot: () => ({ version: 3, budgets: baseline }),
      teams: () => [],
      people: () => [],
    });
    const id = "TKT-000126";
    const first = store.changeRouting(id, { kind: "claim" }, 1);
    const second = store.changeRouting(id, { kind: "claim" }, 1);
    await vi.advanceTimersByTimeAsync(450);
    expect(await Promise.all([first, second])).toEqual(["success", "stale"]);
    const detail = store.detail(actor, id, ["support"]);
    expect(detail?.row.assigneeId).toBe(actor.user.id);
    expect(
      detail?.events.filter((event) => event.id.startsWith("routing-")),
    ).toHaveLength(1);
    expect(detail?.version).toBe(2);
  } finally {
    vi.useRealTimers();
  }
});
