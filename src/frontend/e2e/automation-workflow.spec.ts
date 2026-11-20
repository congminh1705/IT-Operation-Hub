import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
async function open(page: Page, role = "it_manager") {
  await page.goto("/login?returnTo=%2Fautomation%2Fpolicies");
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(
    page.getByRole("heading", { name: "Workflow onboarding" }),
  ).toBeVisible();
}
test("invalid effort and cycle block publish; confirmed version leaves v3 immutable", async ({
  page,
}) => {
  await open(page);
  const panel = page.getByRole("region", { name: "Quy trình onboarding" });
  await panel.getByRole("button", { name: "Tạo bản nháp mới" }).click();
  await panel.getByLabel("Công sức T01").fill("0");
  await panel.getByRole("button", { name: "Xem trước công bố" }).click();
  await expect(panel.getByRole("alert")).toContainText("số phút nguyên dương");
  await panel.getByLabel("Công sức T01").fill("25");
  await panel.getByLabel("Phụ thuộc T01").fill("T03");
  await panel.getByRole("button", { name: "Xem trước công bố" }).click();
  await expect(panel.getByRole("alert")).toContainText("chu trình");
  await panel.getByLabel("Phụ thuộc T01").fill("");
  await panel.getByLabel("Tên bước T01").fill("Xác minh bản DEMO mới");
  await panel.getByRole("button", { name: "Xem trước công bố" }).click();
  await panel.getByRole("button", { name: "Xác nhận công bố" }).click();
  await expect(panel.getByLabel("Phiên bản", { exact: true })).toHaveValue("4");
  await panel.getByLabel("Phiên bản", { exact: true }).selectOption("3");
  await expect(panel.getByText(/T01 · Xác minh nhu cầu/)).toBeVisible();
  await expect(panel.getByText(/25 phút/)).toHaveCount(0);
});
test("technician sees reduced team workflow only", async ({ page }) => {
  await open(page, "technician");
  await expect(page.getByText(/T01 · Xác minh nhu cầu/)).toBeVisible();
  await expect(page.getByText(/Nguồn:/)).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Tạo bản nháp mới" }),
  ).toHaveCount(0);
});
test("compare workflow desktop and mobile", async ({ page, context }) => {
  const url = process.env.TICKET_DETAIL_DESIGN_URL;
  test.skip(!url, "Design server required");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  const design = await context.newPage();
  await design.goto(url + "/05-ai.html#policies");
  const dir = path.resolve("../../docs/implementation/evidence/FE-10.01");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await design.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: path.join(dir, `actual-policies-${width}.png`),
      fullPage: true,
    });
    await design.screenshot({
      path: path.join(dir, `reference-policies-${width}.png`),
      fullPage: true,
    });
  }
});
