import { expect, type BrowserContext, type Page } from "@playwright/test";
import path from "node:path";

export async function loginMonitoring(
  page: Page,
  role: string,
  target: string,
) {
  await page.goto("/login?returnTo=" + encodeURIComponent(target));
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
}

export async function captureMonitoring(
  page: Page,
  context: BrowserContext,
  task: string,
  section: string,
  name = section,
) {
  const design = await context.newPage();
  await design.goto(
    process.env.TICKET_DETAIL_DESIGN_URL + "/07-monitoring.html#" + section,
  );
  await expect(design.locator("main")).toBeVisible();
  const original = page.viewportSize()!;
  for (const width of [1440, 390]) {
    for (const [kind, target] of [
      ["actual", page],
      ["reference", design],
    ] as const) {
      await target.emulateMedia({ reducedMotion: "reduce" });
      await target.setViewportSize({ width, height: 1000 });
      await target.evaluate(() => window.scrollTo(0, 0));
      await target.screenshot({
        path: path.resolve(
          "../../docs/implementation/evidence",
          task,
          `${kind}-${name}-${width}.png`,
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
  await page.setViewportSize(original);
  await design.close();
}
