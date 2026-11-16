import { describe, expect, it } from "vitest";
import { formatBusinessTime, localDateWindow } from "./dates";
describe("Vietnam business dates", () => {
  it.each([
    ["2026-11-15T16:59:00Z", "15/11/2026 23:59"],
    ["2026-11-15T17:00:00Z", "16/11/2026 00:00"],
    ["2026-12-31T17:00:00Z", "01/01/2027 00:00"],
  ])("formats UTC %s independently of host timezone", (utc, expected) => {
    expect(formatBusinessTime(utc)).toBe(expected);
  });
  it("converts inclusive date selections into half-open UTC ranges", () => {
    expect(localDateWindow("2026-11-16")).toEqual({
      from: "2026-11-15T17:00:00.000Z",
      toExclusive: "2026-11-16T17:00:00.000Z",
    });
    expect(localDateWindow("2024-02-29", "2024-03-01")).toEqual({
      from: "2024-02-28T17:00:00.000Z",
      toExclusive: "2024-03-01T17:00:00.000Z",
    });
    expect(localDateWindow("2026-12-31").toExclusive).toBe(
      "2026-12-31T17:00:00.000Z",
    );
  });
  it.each(["2026-02-29", "2026-04-31", "2026-13-01", "garbage", "1970-01-01"])(
    "rejects invalid or historical date %s",
    (day) => {
      expect(() => localDateWindow(day)).toThrow(RangeError);
    },
  );
  it("rejects reversed ranges and non-UTC timestamps", () => {
    expect(() => localDateWindow("2026-11-17", "2026-11-16")).toThrow();
    expect(() => formatBusinessTime("2026-11-16T10:00:00")).toThrow();
  });
});
