import { expect, test, vi } from "vitest";
import { createAssets } from "./assets";
import { createDemoFixtures } from "./fixtures";
import { createTicketIntake } from "./ticket-intake";
import { baseline } from "./sla-policy";

test("a returned asset is rejected after submit starts and writes no ticket", async () => {
  vi.useFakeTimers();
  try {
    const { REQUESTER: actor, IT_MANAGER: manager } =
      createDemoFixtures().personas;
    const assets = createAssets(() => []);
    const tickets = createTicketIntake({
      identity: () => ({ userId: actor.user.id, scope: "test" }),
      actor: () => actor,
      memberships: () => [],
      isTeamMember: () => false,
      intake: () => ({ id: "support", name: "IT Support" }),
      snapshot: () => ({ version: 3, budgets: baseline }),
      teams: () => [],
      people: () => [],
      assetOptions: (persona) => assets.ticketOptions(persona),
    });
    const asset = assets
      .ticketOptions(actor)
      .find((item) => item.id === "LT-001")!;
    const pending = tickets.submit(
      actor,
      {
        type: "incident",
        category: "Thiết bị",
        title: "Hỗ trợ thiết bị",
        description: "Mô tả lỗi thiết bị DEMO",
        impact: "low",
        urgency: "low",
        priority: "P4",
        asset: asset.id,
        assetVersion: asset.version,
        attachments: [],
      },
      "asset-return-race",
    );
    expect(
      assets.applyChange(manager, asset.id, asset.version, {
        action: "return",
        date: "2026-11-21",
        reason: "Đã thu hồi",
        recipient: "",
        returnState: "stock",
      }),
    ).toBeNull();
    await vi.advanceTimersByTimeAsync(650);
    expect(await pending).toEqual({ kind: "asset-stale" });
    expect(tickets.rows()).toHaveLength(0);
  } finally {
    vi.useRealTimers();
  }
});
