import { expect, test } from "vitest";
import { createDemoFixtures } from "./fixtures";
import { createTicketIntake } from "./ticket-intake";
import { baseline } from "./sla-policy";

test("attachment metadata and bytes follow current ticket and audience scope", () => {
  const { personas } = createDemoFixtures();
  let actor = personas.TECHNICIAN;
  let memberships = ["support"];
  let scope = "technician";
  const store = createTicketIntake({
    identity: () => ({ userId: actor.user.id, scope }),
    actor: () => actor,
    memberships: () => memberships,
    isTeamMember: () => true,
    intake: () => ({ id: "support", name: "IT Support" }),
    snapshot: () => ({ version: 3, budgets: baseline }),
    teams: () => [],
    people: () => [],
  });
  const id = "TKT-000127";
  const note = id + "-internal";
  expect(store.attachmentForDownload(id, note, scope)).toMatchObject({
    kind: "success",
  });
  memberships = [];
  expect(store.attachmentForDownload(id, note, scope)).toEqual({
    kind: "forbidden",
  });
  actor = personas.REQUESTER;
  scope = "requester";
  const detail = store.detail(actor, id, memberships);
  expect(detail?.attachments.map((file) => file.id)).not.toContain(note);
  expect(store.attachmentForDownload(id, note, scope)).toEqual({
    kind: "forbidden",
  });
  expect(store.attachmentForDownload(id, id + "-missing", scope)).toEqual({
    kind: "missing",
  });
  expect(store.attachmentForDownload(id, id + "-sample", "technician")).toEqual(
    { kind: "forbidden" },
  );
  expect(store.attachmentForDownload(id, id + "-sample", scope)).toMatchObject({
    kind: "success",
    mime: "application/pdf",
  });
});
