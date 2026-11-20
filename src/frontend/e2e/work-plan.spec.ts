import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
async function open(page: Page) {
  await page.goto("/login?returnTo=%2Fwork%3Fscope%3Dteam");
  await page.locator("#login-email").fill("technician@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await page.getByRole("button", { name: "Xem kế hoạch" }).click();
}
test("version navigation, dependency explanation and invalid variants", async ({
  page,
}) => {
  await open(page);
  const version = page.getByLabel("Phiên bản kế hoạch", { exact: true });
  await expect(
    page.getByRole("region", { name: "Luồng phụ thuộc" }),
  ).toBeVisible();
  await expect(page.getByText(/Chờ hoàn tất T07/)).toBeVisible();
  await version.selectOption("v1");
  await expect(page.getByText(/Phiên bản khởi tạo/)).toBeVisible();
  await expect(
    page.getByText(/Xác minh nhu cầu cài VPN/).first(),
  ).toBeVisible();
  await version.selectOption("invalid");
  await expect(
    page.getByText("Kế hoạch có phụ thuộc không hợp lệ"),
  ).toBeVisible();
  await version.selectOption("cycle");
  await expect(page.getByText("Kế hoạch có chu trình phụ thuộc")).toBeVisible();
  await version.selectOption("stale");
  await page.getByRole("button", { name: "Xem phiên bản hiệu lực" }).click();
  await expect(version).toHaveValue("v3");
  await version.selectOption("v2");
  await page.setViewportSize({ width: 390, height: 1000 });
  await expect(
    page.getByText(/Kiểm tra quyền truy cập các phần mềm/).first(),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("compare work plan at desktop and mobile", async ({ page, context }) => {
  const url = process.env.TICKET_DETAIL_DESIGN_URL;
  test.skip(!url, "Design server required");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  const design = await context.newPage();
  await design.goto(url + "/03-work.html#plan");
  await expect(design.locator("main")).toBeVisible();
  const dir = path.resolve("../../docs/implementation/evidence/FE-08.02");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await design.setViewportSize({ width, height: 1000 });
    await page.screenshot({
      path: path.join(dir, `actual-plan-${width}.png`),
      fullPage: true,
    });
    await design.screenshot({
      path: path.join(dir, `reference-plan-${width}.png`),
      fullPage: true,
    });
  }
});
