import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
async function open(page: Page, role: string, scope: string) {
  await page.goto(
    "/login?returnTo=" + encodeURIComponent("/work?scope=" + scope),
  );
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(page).toHaveURL(/\/work/);
}
test("cards and keyboard-selectable table share filtered task set", async ({
  page,
}) => {
  await open(page, "technician", "mine");
  await expect(page.locator("article[data-work-id]")).toHaveCount(4);
  await expect(page.getByText("Kiểm tra hạ tầng ngoài nhóm")).toHaveCount(0);
  await page.getByLabel("Trạng thái", { exact: true }).selectOption("active");
  const ids = await page
    .locator("[data-work-id]")
    .evaluateAll((rows) => rows.map((row) => row.getAttribute("data-work-id")));
  const table = page.getByRole("button", { name: "Bảng", exact: true });
  await table.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("table")).toBeVisible();
  expect(
    (
      await page
        .locator("[data-work-id]")
        .evaluateAll((rows) =>
          rows.map((row) => row.getAttribute("data-work-id")),
        )
    ).sort(),
  ).toEqual(ids.sort());
  await expect(page.getByText("2 công việc", { exact: true })).toBeVisible();
});
test("Requester cannot access tasks by direct link", async ({ page }) => {
  await open(page, "requester", "team");
  await expect(page.getByText("Bạn không có quyền truy cập")).toBeVisible();
  await expect(page.locator("[data-work-id]")).toHaveCount(0);
});
for (const [scope, ref] of [
  ["mine", "my-work"],
  ["team", "work"],
]) {
  test(`compare work board ${ref}`, async ({ page, context }) => {
    const url = process.env.TICKET_DETAIL_DESIGN_URL;
    test.skip(!url, "Design server required");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, "technician", scope);
    await expect(page.locator("[data-work-id]").first()).toBeVisible();
    const design = await context.newPage();
    await design.goto(url + "/03-work.html#" + ref);
    const dir = path.resolve("../../docs/implementation/evidence/FE-08.01");
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await design.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: path.join(dir, `actual-${ref}-${width}.png`),
        fullPage: true,
      });
      await design.screenshot({
        path: path.join(dir, `reference-${ref}-${width}.png`),
        fullPage: true,
      });
    }
  });
}
