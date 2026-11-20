import { expect, test } from "vitest";
import { createDemoFixtures } from "./fixtures";
import {
  absentMinutes,
  createWorkforce,
  workforceProjection,
} from "./workforce";

test("absence union clips the window and counts overlapping intervals once", () => {
  expect(
    absentMinutes(
      [540, 1020],
      [
        [300, 560],
        [600, 780],
        [720, 840],
        [960, 1100],
        [1100, 1200],
      ],
    ),
  ).toBe(320);
});

test("workforce scope separates self, management and absent data", () => {
  const { personas } = createDemoFixtures();
  expect(workforceProjection(personas.REQUESTER)).toBeNull();
  const self = workforceProjection(personas.TECHNICIAN);
  expect(self?.rows.map((row) => row.id)).toEqual([
    personas.TECHNICIAN.user.id,
  ]);
  expect(self?.unallocated).toEqual([]);
  const management = workforceProjection(personas.IT_MANAGER);
  expect(management?.rows[1]).toMatchObject({
    absent: 240,
    capacity: 240,
    load: 120,
    free: 120,
  });
  expect(management?.rows[2]).toMatchObject({
    capacity: null,
    load: 60,
    free: null,
  });
  expect(management?.unallocated).toHaveLength(1);
});

test("workforce confirmation checks actor and record version before writes", () => {
  const { personas } = createDemoFixtures();
  const store = createWorkforce();
  const actor = personas.IT_MANAGER;
  const change = {
    person: personas.TECHNICIAN.user.id,
    kind: "absence" as const,
    start: "09:00",
    end: "17:00",
    budget: "",
    skill: "",
    note: "DEMO",
  };
  expect(store.preview(personas.TECHNICIAN, change)).toMatchObject({
    kind: "error",
  });
  const draft = store.preview(actor, change);
  if (draft.kind !== "preview") throw new Error(draft.message);
  expect(store.save(actor, draft, true)).toMatchObject({ kind: "error" });
  expect(store.projection(actor)?.rows[0].absences).toHaveLength(0);
  expect(store.save(actor, draft)).toMatchObject({
    kind: "saved",
    noCapacity: true,
    affected: [{ id: "T07" }],
  });
  expect(store.save(actor, draft)).toMatchObject({ kind: "error" });
  expect(store.projection(actor)?.rows[0].absences).toHaveLength(1);
});
