import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

async function open(page: Page, role: string, route = "/assets") {
  await page.goto("/login?returnTo=" + encodeURIComponent(route));
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
}

test("catalog counts, searches and filters", async ({ page }) => {
  await open(page, "it_manager");
  await expect(page.getByText("6 / 6 thiết bị")).toBeVisible();
  await page.getByLabel("Tìm trong danh sách").fill("thiet bi mang");
  await expect(page.getByText("1 / 6 thiết bị")).toBeVisible();
  await page.getByLabel("Lọc trạng thái").selectOption("stock");
  await expect(page.getByText("0 / 6 thiết bị")).toBeVisible();
  await page.getByLabel("Tìm trong danh sách").clear();
  await expect(page.getByRole("link", { name: /LT-018/ })).toBeVisible();
});

test("requester history omits internal entries and other tickets", async ({
  page,
}) => {
  await open(page, "requester", "/assets?scope=work");
  await expect(page.getByText("2 / 2 thiết bị")).toBeVisible();
  await page.getByRole("link", { name: /LT-001/ }).click();
  await expect(page.getByText("Cấp phát thiết bị")).toBeVisible();
  await expect(page.getByText("Nhập kho")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /TKT-000126/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /TKT-000130/ })).toHaveCount(0);
  await open(page, "requester", "/tickets/TKT-000130");
  await expect(
    page.getByRole("heading", { name: "Không tìm thấy nội dung" }),
  ).toBeVisible();
  await open(page, "requester", "/assets?id=LT-018");
  await expect(
    page.getByText("Bạn không có quyền truy cập", { exact: false }).first(),
  ).toBeVisible();
});

test("technician own and support scopes are independent", async ({ page }) => {
  await open(page, "technician", "/assets?scope=mine");
  await expect(page.getByText("1 / 1 thiết bị")).toBeVisible();
  await page.getByRole("link", { name: "Thiết bị hỗ trợ" }).click();
  await expect(page.getByRole("link", { name: /LT-018/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /PR-008/ })).toHaveCount(0);
});

for (const [ref, role] of [
  ["assets", "it_manager"],
  ["my-assets", "requester"],
  ["asset", "it_manager"],
]) {
  test(`compare ${ref}`, async ({ page, context }) => {
    const url = process.env.TICKET_DETAIL_DESIGN_URL;
    test.skip(!url, "Design server required");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, role);
    const firstAsset = page.getByRole("link", { name: /LT-001/ });
    await expect(firstAsset).toBeVisible();
    await firstAsset.focus();
    await expect(firstAsset).toBeFocused();
    if (ref === "asset") {
      await firstAsset.press("Enter");
      await expect(
        page.getByRole("region", { name: "Lịch sử thiết bị" }),
      ).toBeVisible();
    }
    const design = await context.newPage();
    await design.emulateMedia({ reducedMotion: "reduce" });
    await design.goto(url + "/06-knowledge-assets.html#" + ref);
    const dir = path.resolve("../../docs/implementation/evidence/FE-12.01");
    for (const width of [1440, 390]) {
      for (const [name, target] of [
        ["actual", page],
        ["reference", design],
      ] as const) {
        await target.setViewportSize({ width, height: 1000 });
        await target.evaluate(() => window.scrollTo(0, 0));
        await target.screenshot({
          path: path.join(dir, `${name}-${ref}-${width}.png`),
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
