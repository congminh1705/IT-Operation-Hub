import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

async function open(page: Page) {
  await page.goto("/login?returnTo=%2Fassets");
  await page.locator("#login-email").fill("it_manager@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await page.getByRole("button", { name: "Thêm tài sản" }).click();
}

test("validation preserves metadata and new records start in stock", async ({
  page,
}) => {
  await open(page);
  const form = page.getByRole("region", { name: "Thêm tài sản" });
  const code = form.getByLabel("Mã tài sản");
  const serial = form.getByLabel("Serial");
  const preview = form.getByRole("button", { name: "Xem trước tài sản" });
  await code.fill("lt-001");
  await preview.click();
  await expect(form.getByRole("alert")).toHaveText("Mã tài sản đã tồn tại.");
  await expect(code).toHaveValue("lt-001");
  await code.fill("LT-020");
  await serial.fill("demo-lt-001");
  await preview.click();
  await expect(form.getByRole("alert")).toHaveText("Serial đã tồn tại.");
  await expect(serial).toHaveValue("demo-lt-001");
  await serial.fill("SERIAL-020");
  await form.getByLabel("Ngày mua").fill("2026-11-20");
  await form.getByLabel("Hết bảo hành").fill("2025-11-20");
  await preview.click();
  await expect(form.getByRole("alert")).toContainText("không hợp lệ");
  await expect(form.getByLabel("Ngày mua")).toHaveValue("2026-11-20");
  await form.getByLabel("Hết bảo hành").fill("2027-11-20");
  await form.getByLabel("Hãng / Model").fill("Laptop DEMO mới");
  await expect(form.getByLabel("Người giữ")).toHaveCount(0);
  await preview.click();
  await form.getByRole("button", { name: "Xác nhận lưu tài sản" }).click();
  const detail = page.getByRole("region", { name: "Hồ sơ tài sản" });
  await expect(detail).toContainText("Trong kho");
  await detail.getByRole("button", { name: "Sửa thông tin" }).click();
  const edit = page.getByRole("region", { name: "Sửa thông tin tài sản" });
  await edit.getByLabel("Hãng / Model").fill("Laptop đã sửa");
  await edit.getByRole("button", { name: "Xem trước tài sản" }).click();
  await edit.getByRole("button", { name: "Xác nhận lưu tài sản" }).click();
  await expect(detail).toContainText("Laptop đã sửa");
});

test("compare metadata form at desktop and mobile", async ({
  page,
  context,
}) => {
  const url = process.env.TICKET_DETAIL_DESIGN_URL;
  test.skip(!url, "Design server required");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  await page.getByLabel("Mã tài sản").focus();
  await expect(page.getByLabel("Mã tài sản")).toBeFocused();
  const design = await context.newPage();
  await design.emulateMedia({ reducedMotion: "reduce" });
  await design.goto(url + "/06-knowledge-assets.html#asset-form");
  const dir = path.resolve("../../docs/implementation/evidence/FE-12.02");
  for (const width of [1440, 390]) {
    for (const [name, target] of [
      ["actual", page],
      ["reference", design],
    ] as const) {
      await target.setViewportSize({ width, height: 1000 });
      await target.evaluate(() => window.scrollTo(0, 0));
      await target.screenshot({
        path: path.join(dir, `${name}-asset-form-${width}.png`),
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
