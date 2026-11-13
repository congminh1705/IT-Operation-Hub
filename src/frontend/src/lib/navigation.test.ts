import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createDemoFixtures } from "./demo/fixtures";
import type { Role } from "./api/types";
import {
  activeNavigation,
  canOpenDestination,
  effectiveScope,
  getAccountLinks,
  getNavigation,
  knownDestinations,
  ticketSearchHref,
} from "./navigation";

describe("role-aware DEMO navigation", () => {
  it.each(["REQUESTER", "TECHNICIAN", "IT_MANAGER", "ADMIN"] as const)(
    "%s has one AI entry and only known destinations",
    (role) => {
      const persona = createDemoFixtures().personas[role];
      const items = getNavigation(persona);
      expect(items.filter((item) => item.id === "assistant")).toHaveLength(1);
      expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
      for (const item of [...items, ...getAccountLinks(persona)])
        expect(knownDestinations.has(item.href.split("?")[0])).toBe(true);
      expect(getAccountLinks(persona).map((item) => item.id)).toEqual([
        "profile",
        "password",
        "logout",
      ]);
    },
  );
  it("requester omits all internal work, workforce, approval, reports, audit and admin links", () => {
    const persona = createDemoFixtures().personas.REQUESTER;
    const ids = getNavigation(persona).map((item) => item.id);
    for (const id of [
      "work",
      "workforce",
      "it-tickets",
      "approvals",
      "policies",
      "reports",
      "audit",
      "admin-users",
    ])
      expect(ids).not.toContain(id);
    expect(canOpenDestination(persona, "/admin/users")).toBe(false);
  });
  it("technician has team work and only self workforce lookup", () => {
    const persona = createDemoFixtures().personas.TECHNICIAN;
    const items = getNavigation(persona);
    expect(items.find((item) => item.id === "workforce")?.href).toBe(
      "/workforce?scope=mine",
    );
    expect(items.some((item) => item.id === "team-work")).toBe(true);
    for (const path of ["/reports", "/audit", "/approvals", "/admin/users"])
      expect(canOpenDestination(persona, path)).toBe(false);
    expect(effectiveScope(persona, "/workforce", "organization")).toBe("mine");
    expect(effectiveScope(persona, "/work", "work")).toBe("team");
  });
  it("manager gets decisions and reports but never administration", () => {
    const persona = createDemoFixtures().personas.IT_MANAGER;
    for (const path of [
      "/approvals",
      "/automation/policies",
      "/reports",
      "/audit",
    ])
      expect(canOpenDestination(persona, path)).toBe(true);
    expect(getNavigation(persona).some((item) => item.group === "admin")).toBe(
      false,
    );
  });
  it("admin exposes the declared administration destinations", () => {
    const items = getNavigation(createDemoFixtures().personas.ADMIN);
    expect(
      items.filter((item) => item.group === "admin").map((item) => item.href),
    ).toEqual([
      "/admin/users",
      "/admin/departments",
      "/admin/teams",
      "/admin/categories",
      "/admin/sla",
      "/admin/assistant",
    ]);
  });
  it("does not grant requester internal links even if a fixture capability array is widened", () => {
    const persona = createDemoFixtures().personas.REQUESTER;
    persona.navigation.push(
      "administration",
      "reports",
      "work",
      "workforce",
      "it-tickets",
    );
    for (const path of ["/reports", "/work", "/workforce", "/admin/users"])
      expect(canOpenDestination(persona, path)).toBe(false);
    expect(effectiveScope(persona, "/tickets", "work")).toBe("mine");
  });
  it("honors removed capabilities and inactive personas", () => {
    const persona = createDemoFixtures().personas.IT_MANAGER;
    persona.navigation = persona.navigation.filter(
      (item) => item !== "assistant",
    );
    expect(
      getNavigation(persona).some((item) =>
        ["assistant", "approvals", "policies"].includes(item.id),
      ),
    ).toBe(false);
    persona.user.active = false;
    expect(getNavigation(persona)).toEqual([]);
    expect(getAccountLinks(persona)).toEqual([]);
  });
  it("distinguishes personal/team locations without multiple active entries", () => {
    const persona = createDemoFixtures().personas.TECHNICIAN;
    expect(activeNavigation(persona, "/tickets", "mine")?.id).toBe(
      "my-requests",
    );
    expect(activeNavigation(persona, "/tickets", "work")?.id).toBe(
      "it-tickets",
    );
    expect(activeNavigation(persona, "/work", "team")?.id).toBe("team-work");
    expect(activeNavigation(persona, "/profile/security")).toBeUndefined();
  });
  it.each(["REQUESTER", "TECHNICIAN", "IT_MANAGER", "ADMIN"] as Role[])(
    "%s ticket search encodes text without granting URL capabilities",
    (role) => {
      const persona = createDemoFixtures().personas[role];
      const url = new URL(
        ticketSearchHref(
          persona,
          " VPN & role=ADMIN ",
          "/preview/workspace/requester",
        ),
        "http://demo.invalid",
      );
      expect(url.searchParams.get("scope")).toBe(
        role === "REQUESTER" ? "mine" : "work",
      );
      expect(url.searchParams.get("q")).toBe("VPN & role=ADMIN");
      expect(url.searchParams.has("role")).toBe(false);
      const long = new URL(
        ticketSearchHref(persona, "x".repeat(500)),
        "http://demo.invalid",
      );
      expect(long.searchParams.get("q")).toHaveLength(180);
    },
  );
  it("uses the existing icon sprite for every navigation icon", () => {
    const sprite = readFileSync("public/icons.svg", "utf8");
    for (const persona of Object.values(createDemoFixtures().personas))
      for (const item of getNavigation(persona))
        expect(sprite).toContain(`id="i-${item.icon}"`);
  });
});
