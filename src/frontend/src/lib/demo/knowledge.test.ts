import { expect, test } from "vitest";
import { createDemoFixtures } from "./fixtures";
import { createKnowledge } from "./knowledge";

test("ACL changes invalidate historical reads and citations immediately", () => {
  const { REQUESTER, IT_MANAGER, ADMIN } = createDemoFixtures().personas;
  const knowledge = createKnowledge();
  const id = "KB-014";
  const edit = knowledge.edit(IT_MANAGER, id)!;
  expect(knowledge.citation(REQUESTER, [], id, 2)).toMatchObject({
    id,
    version: 2,
  });
  expect(
    knowledge.commit(ADMIN, id, edit.revision, "access", {
      ...edit.current,
      audience: "support",
    }),
  ).toContain("chưa được cấp quyền");
  expect(
    knowledge.commit(IT_MANAGER, id, edit.revision, "access", {
      ...edit.current,
      audience: "support",
    }),
  ).toBeNull();
  expect(knowledge.read(REQUESTER, [], id, 1)).toBeNull();
  expect(knowledge.citation(REQUESTER, [], id, 2)).toBeNull();
  expect(knowledge.list(REQUESTER, []).some((entry) => entry.id === id)).toBe(
    false,
  );
  expect(knowledge.citation(IT_MANAGER, ["support"], id, 2)).not.toBeNull();
});

test("retirement blocks index results and every version after a retry starts", () => {
  const { IT_MANAGER } = createDemoFixtures().personas;
  const knowledge = createKnowledge();
  const id = "KB-014";
  expect(knowledge.advanceIndex(IT_MANAGER, ["support"], id, 1, "retry")).toBe(
    true,
  );
  expect(knowledge.makeUnavailable(IT_MANAGER, id, "retired")).toBe(true);
  expect(knowledge.advanceIndex(IT_MANAGER, ["support"], id, 1, "result")).toBe(
    false,
  );
  expect(knowledge.read(IT_MANAGER, ["support"], id)).toBeNull();
  expect(knowledge.citation(IT_MANAGER, ["support"], id, 2)).toBeNull();
});
