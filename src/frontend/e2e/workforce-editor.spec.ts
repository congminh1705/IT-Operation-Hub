import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
async function open(page: Page, role = "it_manager") {
  await page.goto("/login?returnTo=%2Fworkforce");
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(page.getByRole("table")).toBeVisible();
}
test("invalid hours keep note; corrected absence previews affected work", async ({
  page,
}) => {
  await open(page);
  await page.getByLabel("Từ", { exact: true }).fill("12:00");
  await page.getByLabel("Đến", { exact: true }).fill("11:00");
  await page.getByLabel("Ghi chú nội bộ").fill("Lịch DEMO cần đối chiếu.");
  await page.getByRole("button", { name: "Xem trước thay đổi" }).click();
  await expect(
    page.getByRole("region", { name: "Cập nhật nhân sự" }).getByRole("alert"),
  ).toContainText("Giờ kết thúc phải sau");
  await expect(page.getByLabel("Ghi chú nội bộ")).toHaveValue(
    "Lịch DEMO cần đối chiếu.",
  );
  await page.getByLabel("Từ", { exact: true }).fill("10:00");
  await page.getByLabel("Đến", { exact: true }).fill("12:00");
  await page.getByRole("button", { name: "Xem trước thay đổi" }).click();
  await expect(page.getByText(/T07 · Kiểm tra kết nối VPN/)).toBeVisible();
  await page.getByRole("button", { name: "Quay lại chỉnh sửa" }).click();
  await expect(page.getByLabel("Ghi chú nội bộ")).toHaveValue(
    "Lịch DEMO cần đối chiếu.",
  );
});
test("manager previews verification; technician cannot verify self", async ({
  page,
  context,
}) => {
  await open(page);
  await page.getByLabel("Loại thay đổi").selectOption("skill");
  await page.getByLabel("Kỹ năng", { exact: true }).fill("Mạng");
  await page.getByRole("button", { name: "Xem trước thay đổi" }).click();
  await expect(page.getByText(/Xác minh bởi DEMO IT_MANAGER/)).toBeVisible();
  const technician = await context.newPage();
  await open(technician, "technician");
  await expect(
    technician.getByRole("region", { name: "Cập nhật nhân sự" }),
  ).toHaveCount(0);
});
test("compare workforce editor at desktop and mobile", async ({
  page,
  context,
}) => {
  const url = process.env.TICKET_DETAIL_DESIGN_URL;
  test.skip(!url, "Design server required");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  const design = await context.newPage();
  await design.goto(url + "/04-workforce.html#workforce");
  await expect(design.locator("main")).toBeVisible();
  const dir = path.resolve("../../docs/implementation/evidence/FE-09.02");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await design.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: path.join(dir, `actual-workforce-${width}.png`),
      fullPage: true,
    });
    await design.screenshot({
      path: path.join(dir, `reference-workforce-${width}.png`),
      fullPage: true,
    });
  }
});
