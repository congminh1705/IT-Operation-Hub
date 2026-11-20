import { expect, test } from "vitest";
import { createDemoFixtures } from "./fixtures";
import { absentMinutes, workforceProjection } from "./workforce";

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
