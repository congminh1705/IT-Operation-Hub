import { expect, it } from "vitest";
import { createDemoFixtures } from "./fixtures";
import { readTicketDraft } from "./ticket-draft";
it("derives priority and rejects another user's asset", () => {
  const { REQUESTER } = createDemoFixtures().personas;
  const data = new FormData();
  for (const [key, value] of Object.entries({
    type: "incident",
    category: "Thiết bị",
    title: "Máy trạm DEMO",
    description: "Không phản hồi khi thử nghiệm.",
    impact: "low",
    urgency: "low",
    priority: "P1",
    asset: "LT-014",
  }))
    data.set(key, value);
  expect(readTicketDraft(data, REQUESTER, ["Thiết bị"])).toMatchObject({
    ok: false,
    field: "asset",
  });
  data.set("asset", "LT-001");
  expect(readTicketDraft(data, REQUESTER, ["Thiết bị"])).toMatchObject({
    ok: true,
    draft: { priority: "P4" },
  });
});
