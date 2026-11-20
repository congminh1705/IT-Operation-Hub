import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

async function open(page: Page, role: string) {
  await page.goto("/login?returnTo=%2Fworkforce%3Fscope%3Dwork");
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(page).toHaveURL(/\/workforce/);
}

test("management sees verified skills, union of overlapping absences and unknown capacity", async ({
  page,
}) => {
  await open(page, "it_manager");
  await expect(page.locator("[data-workforce-id]")).toHaveCount(3);
  const person = page.getByRole("row", { name: /DEMO Kỹ thuật viên B/ });
  await expect(person).toContainText("Ảo hóa · Chưa xác minh");
  await expect(person).toContainText("Vắng 10:00–13:00");
  await expect(person).toContainText("Vắng 12:00–14:00");
  await expect(person).toContainText("Vắng trong lịch sau gộp: 240 phút");
  await expect(person).toContainText("Còn trống: 120 phút");
  const missing = page.getByRole("row", { name: /DEMO Kỹ thuật viên C/ });
  await expect(missing).toContainText("Còn trống: Chưa đủ dữ liệu");
  await expect(missing).not.toContainText("Còn trống: 0 phút");
  await expect(
    page.getByRole("heading", { name: "Công việc chưa phân bổ" }),
  ).toBeVisible();
});
test("technician query cannot widen the projection", async ({ page }) => {
  await open(page, "technician");
  await expect(page.locator("[data-workforce-id]")).toHaveCount(1);
  await expect(
    page.getByRole("row", { name: /DEMO TECHNICIAN/ }),
  ).toBeVisible();
  await expect(page.getByText("DEMO Kỹ thuật viên B")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Công việc chưa phân bổ" }),
  ).toHaveCount(0);
});
test("requester sees forbidden state without workforce rows", async ({
  page,
}) => {
  await open(page, "requester");
  await expect(page.getByText("Bạn không có quyền truy cập")).toBeVisible();
  await expect(page.locator("[data-workforce-id]")).toHaveCount(0);
});
test("compare approved workforce view at desktop and mobile", async ({
  page,
  context,
}) => {
  const url = process.env.TICKET_DETAIL_DESIGN_URL;
  test.skip(!url, "Design server required");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "it_manager");
  await expect(page.getByRole("table")).toBeVisible();
  const design = await context.newPage();
  await design.emulateMedia({ reducedMotion: "reduce" });
  await design.goto(url + "/04-workforce.html#workforce");
  await expect(design.locator("main")).toBeVisible();
  const folder = path.resolve("../../docs/implementation/evidence/FE-09.01");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await design.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: path.join(folder, `actual-workforce-${width}.png`),
      fullPage: true,
    });
    await design.screenshot({
      path: path.join(folder, `reference-workforce-${width}.png`),
      fullPage: true,
    });
  }
});
