import { expect, test } from "@playwright/test";
import path from "node:path";
import { loginMonitoring } from "./monitoring-helpers";

const common = [
  "/dashboard",
  "/tickets?scope=mine",
  "/assistant",
  "/knowledge",
  "/notifications",
];
const management = [
  "/tickets?scope=work",
  "/work?scope=work",
  "/workforce",
  "/approvals",
  "/automation/policies",
  "/assets?scope=work",
  "/reports",
  "/audit",
];
const routes = {
  requester: [...common, "/assets?scope=mine"],
  technician: [
    ...common,
    "/tickets?scope=work",
    "/work?scope=mine",
    "/work?scope=team",
    "/workforce?scope=mine",
    "/automation/policies",
    "/assets?scope=mine",
    "/assets?scope=work",
  ],
  it_manager: [...common, ...management],
  admin: [
    ...common,
    ...management,
    "/admin/users",
    "/admin/departments",
    "/admin/teams",
    "/admin/categories",
    "/admin/sla",
    "/admin/assistant",
  ],
};
const reference = process.env.PHASE_A_DESIGN_URL;

for (const [role, destinations] of Object.entries(routes)) {
  test(`${role} opens every native sidebar destination without pending screen`, async ({
    page,
    context,
  }) => {
    await loginMonitoring(page, role, "/dashboard");
    const nav = page.getByRole("navigation", { name: "Điều hướng chính" });
    const main = page.getByRole("main");
    await expect(nav.getByRole("link")).toHaveCount(destinations.length);
    for (const destination of destinations) {
      await nav.locator(`a[href="${destination}"]`).click();
      await expect(page).toHaveURL(new URL(destination, page.url()).href);
      await expect(main.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(main.locator(".shell-pending")).toHaveCount(0);
      const actions = await main.locator('a[href=""], a[href="#"]').count();
      expect(actions, `Dead primary link on ${role} ${destination}`).toBe(0);
    }
    if (!reference) return;
    await nav.locator('a[href="/dashboard"]').click();
    const roleName = role === "it_manager" ? "manager" : role;
    const design = await context.newPage();
    await design.goto(reference + "/dashboard.html?role=" + roleName);
    await expect(
      design.frameLocator("iframe").locator("main h1").first(),
    ).toBeVisible();
    for (const width of [1440, 390]) {
      for (const [kind, target] of [
        ["actual", page],
        ["reference", design],
      ] as const) {
        await target.setViewportSize({ width, height: 1000 });
        await target.emulateMedia({ reducedMotion: "reduce" });
        await target.evaluate(() => window.scrollTo(0, 0));
        await target.screenshot({
          path: path.resolve(
            "../../docs/implementation/evidence/FE-18.01",
            `${kind}-${roleName}-dashboard-${width}.png`,
          ),
          fullPage: true,
        });
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  });
}
