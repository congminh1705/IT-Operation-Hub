import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import path from "node:path";
async function open(page: Page, role: string, target = "/dashboard") {
  await page.goto("/login?returnTo=" + encodeURIComponent(target));
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
}
async function capture(
  page: Page,
  context: BrowserContext,
  task: string,
  name: string,
  reference: string,
) {
  const base = process.env.TICKET_DETAIL_DESIGN_URL;
  test.skip(!base, "Reference server required");
  const design = await context.newPage();
  for (const target of [page, design])
    await target.emulateMedia({ reducedMotion: "reduce" });
  await design.goto(base + "/" + reference);
  if (reference.startsWith("dashboard"))
    await expect(
      design.frameLocator("iframe").locator("main h1").first(),
    ).toBeVisible();
  else await expect(design.locator("main")).toBeVisible();
  const dir = path.resolve("../../docs/implementation/evidence", task);
  for (const width of [1440, 390]) {
    for (const [kind, target] of [
      ["actual", page],
      ["reference", design],
    ] as const) {
      await target.setViewportSize({ width, height: 1000 });
      await target.evaluate(() => window.scrollTo(0, 0));
      await target.screenshot({
        path: path.join(dir, `${kind}-${name}-${width}.png`),
        fullPage: true,
      });
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
}

const metrics = (page: Page) =>
  page.getByRole("region", { name: "Chỉ số cá nhân" });
for (const [role, ids] of [
  ["requester", ["MET11", "MET12"]],
  ["technician", ["MET13", "MET14", "MET12"]],
] as const) {
  test(`${role} metric counts equal native drill-down results`, async ({
    page,
  }) => {
    await open(page, role);
    for (const id of ids) {
      const metric = metrics(page).getByRole("link", { name: new RegExp(id) });
      const count = await metric.locator("strong").innerText();
      await metric.focus();
      await metric.press("Enter");
      if (id === "MET12")
        await expect(
          page
            .getByRole("status")
            .filter({ hasText: `${count} / ${count} thiết bị` }),
        ).toBeVisible();
      else
        await expect(
          page.getByText(new RegExp(`^${count} yêu cầu · Trang`)),
        ).toBeVisible();
      await page.getByRole("link", { name: "Tổng quan", exact: true }).click();
    }
  });
  test(`compare personal dashboard ${role}`, async ({ page, context }) => {
    await open(page, role);
    await expect(metrics(page)).toBeVisible();
    await capture(
      page,
      context,
      "FE-16.01",
      role,
      "dashboard.html?role=" + role,
    );
  });
}

test("account switch does not restore the prior dashboard populations", async ({
  page,
}) => {
  await open(page, "technician");
  await expect(
    metrics(page).getByText("MET14", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Tài khoản:/ }).click();
  await page.getByRole("link", { name: "Đăng xuất", exact: true }).click();
  await page.locator("#login-email").fill("requester@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(
    metrics(page).getByText("MET11", { exact: false }),
  ).toBeVisible();
  await expect(metrics(page).getByText("MET14", { exact: false })).toHaveCount(
    0,
  );
});
