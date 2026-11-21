import { expect, test } from "vitest";
import { createAssets } from "./assets";
import { createDemoFixtures } from "./fixtures";

test("metadata writes ignore attempted holder and lifecycle overposting", () => {
  const assets = createAssets(() => []);
  const actor = createDemoFixtures().personas.IT_MANAGER;
  const asset = assets
    .list(actor, [], "work")
    .find((row) => row.id === "LT-001")!;
  const forged = { ...asset, code: "LT-NEW", holder: null, state: "retired" };
  expect(assets.saveMetadata(actor, asset.id, asset.version, forged)).toEqual({
    id: asset.id,
  });
  expect(
    assets.list(actor, [], "work").find((row) => row.id === asset.id),
  ).toMatchObject({
    code: "LT-NEW",
    holder: asset.holder,
    state: "assigned",
    history: asset.history,
  });
  expect(
    assets.saveMetadata(actor, asset.id, asset.version, forged),
  ).toMatchObject({ error: expect.stringContaining("đã thay đổi") });
});
