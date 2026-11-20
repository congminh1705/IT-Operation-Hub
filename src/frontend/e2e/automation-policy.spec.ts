import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
async function open(page: Page) {
  await page.goto("/login?returnTo=%2Fautomation%2Fpolicies");
  await page.locator("#login-email").fill("it_manager@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  return page.getByRole("region", { name: "Chính sách điều phối" });
}
test("default denies missing and expired grants and disabled policy independently", async ({
  page,
}) => {
  const policy = await open(page);
  const scenario = policy.getByLabel("Kịch bản chính sách DEMO");
  for (const value of ["missing", "expired", "disabled", "assistantOff"]) {
    await scenario.selectOption(value);
    await expect(
      policy.getByText("Từ chối mặc định", { exact: true }),
    ).toBeVisible();
  }
  await expect(policy.getByText("Tạm tắt", { exact: true })).toBeVisible();
  await expect(policy.getByText("Đang bật", { exact: true })).toBeVisible();
  await scenario.selectOption("missing");
  await policy.getByRole("button", { name: "Chỉnh chính sách" }).click();
  await policy.getByLabel("Trạng thái chính sách mới").selectOption("on");
  await policy.getByRole("button", { name: "Xem trước chính sách" }).click();
  await expect(policy.getByRole("alert")).toContainText(
    "ủy quyền còn hiệu lực",
  );
});
test("preview cancellation does not save, confirmation disables only policy", async ({
  page,
}) => {
  const policy = await open(page);
  async function preview() {
    await policy.getByRole("button", { name: "Chỉnh chính sách" }).click();
    await policy.getByLabel("Trạng thái chính sách mới").selectOption("off");
    await policy.getByLabel("Giới hạn công việc/lượt").fill("2");
    await policy.getByRole("button", { name: "Xem trước chính sách" }).click();
  }
  await preview();
  await expect(
    policy.getByRole("region", { name: "Xem trước chính sách" }),
  ).toContainText("Tối đa 2 công việc/lượt");
  await policy.getByRole("button", { name: "Hủy thay đổi" }).click();
  await expect(policy.getByText("Đang bật", { exact: true })).toBeVisible();
  await preview();
  await policy.getByRole("button", { name: "Xác nhận lưu chính sách" }).click();
  await expect(policy.getByText("Đã lưu chính sách DEMO.")).toBeVisible();
  await expect(policy.getByText("Đã tắt", { exact: true })).toBeVisible();
  await expect(policy.getByText("Khả dụng", { exact: true })).toBeVisible();
});
test("compare policy desktop and mobile", async ({ page, context }) => {
  const url = process.env.TICKET_DETAIL_DESIGN_URL;
  test.skip(!url, "Design server required");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const policy = await open(page);
  await policy.getByRole("button", { name: "Chỉnh chính sách" }).click();
  await policy.getByLabel("Trạng thái chính sách mới").selectOption("off");
  await policy.getByRole("button", { name: "Xem trước chính sách" }).click();
  const design = await context.newPage();
  await design.goto(url + "/05-ai.html#policies");
  const dir = path.resolve("../../docs/implementation/evidence/FE-10.02");
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
