import { expect, it } from "vitest";
import { createDemoFixtures } from "./fixtures";
import { scopedTicketRows } from "./ticket-list";

it("denies unauthorized work scope before simulating transport failures", () => {
  const { REQUESTER } = createDemoFixtures().personas;
  expect(scopedTicketRows(REQUESTER, "work", ["support"], true)).toEqual({
    kind: "forbidden",
  });
});
it("re-scopes technician data when team membership changes", () => {
  const { TECHNICIAN } = createDemoFixtures().personas;
  const result = scopedTicketRows(TECHNICIAN, "work", ["infrastructure"]);
  expect(result.kind).toBe("success");
  if (result.kind === "success") {
    expect(result.rows).toHaveLength(6);
    expect(result.rows.every((row) => row.teamId === "infrastructure")).toBe(
      true,
    );
  }
});
