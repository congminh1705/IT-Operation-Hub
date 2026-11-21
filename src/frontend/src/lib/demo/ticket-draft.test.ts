import { expect, it } from "vitest";
import { createDemoFixtures } from "./fixtures";
import { createAssets } from "./assets";
import { readTicketDraft } from "./ticket-draft";
it("derives priority and rejects another user's asset", () => {
  const { REQUESTER } = createDemoFixtures().personas;
  const options = createAssets(() => []).ticketOptions(REQUESTER);
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
  expect(readTicketDraft(data, ["Thiết bị"], options)).toMatchObject({
    ok: false,
    field: "asset",
  });
  data.set("asset", "LT-001");
  expect(readTicketDraft(data, ["Thiết bị"], options)).toMatchObject({
    ok: true,
    draft: { priority: "P4" },
  });
});
