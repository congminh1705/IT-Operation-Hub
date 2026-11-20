import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
async function open(page: Page, role: string, id: string) {
  await page.goto("/login?returnTo=%2Fwork%3Fscope%3Dteam");
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await page.getByRole("button", { name: "Xem công việc " + id }).click();
}
async function dialog(page: Page, label: string) {
  await page.getByRole("button", { name: label, exact: true }).click();
  return page.getByRole("dialog", { name: label });
}
test("technician gets unavailable management actions", async ({ page }) => {
  await open(page, "technician", "T07");
  await expect(
    page.getByText("Thao tác phân công và khóa không khả dụng", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Đổi người thực hiện" }),
  ).toHaveCount(0);
});
test("unlock cancel preserves lock, confirmed unlock and lock retain decision and assignee", async ({
  page,
}) => {
  await open(page, "it_manager", "T03");
  await expect(
    page.getByRole("button", { name: "Đổi người thực hiện" }),
  ).toBeDisabled();
  await expect(
    page.getByText(/Phân công thủ công cho người theo dõi/),
  ).toBeVisible();
  let panel = await dialog(page, "Bỏ khóa phân công");
  await panel
    .getByLabel("Lý do thủ công")
    .fill("Cần đánh giá lại phương án bàn giao.");
  await panel.getByRole("button", { name: "Hủy thao tác" }).click();
  await expect(
    page.getByRole("button", { name: "Đổi người thực hiện" }),
  ).toBeDisabled();
  panel = await dialog(page, "Bỏ khóa phân công");
  await panel
    .getByLabel("Lý do thủ công")
    .fill("Đã kiểm tra lại kế hoạch bàn giao.");
  await panel.getByRole("button", { name: "Xem trước tác động" }).click();
  await panel.getByRole("button", { name: "Xác nhận quyết định" }).click();
  await expect(
    page.getByText("Không khóa phân công", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Đổi người thực hiện" }),
  ).toBeEnabled();
  panel = await dialog(page, "Khóa phân công");
  await panel
    .getByLabel("Lý do thủ công")
    .fill("Giữ phân công đã chốt sau rà soát.");
  await panel.getByRole("button", { name: "Xem trước tác động" }).click();
  await panel.getByRole("button", { name: "Xác nhận quyết định" }).click();
  await expect(page.getByText(/Lý do khóa: Giữ phân công/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Đổi người thực hiện" }),
  ).toBeDisabled();
  await expect(page.getByText(/DEMO IT_MANAGER · Sẵn sàng/)).toBeVisible();
  await page.getByRole("button", { name: "Về bảng công việc" }).click();
  await page.getByRole("button", { name: "Xem kế hoạch" }).click();
  await expect(page.getByText(/Đang khóa/).first()).toBeVisible();
});
test("in-progress assignment needs explicit exception, history snapshot is stable", async ({
  page,
}) => {
  await open(page, "it_manager", "T07");
  const panel = await dialog(page, "Đổi người thực hiện");
  await panel
    .getByLabel("Người thực hiện")
    .selectOption({ label: "DEMO IT_MANAGER" });
  await panel
    .getByLabel("Lý do thủ công")
    .fill("Cần tiếp tục xử lý trong khung hiện tại.");
  await panel.getByRole("button", { name: "Xem trước tác động" }).click();
  await expect(panel.getByRole("alert")).toContainText("Cần xác nhận ngoại lệ");
  await panel.getByRole("checkbox").check();
  await panel.getByRole("button", { name: "Xem trước tác động" }).click();
  await expect(panel.getByText(/Chuyển 60 phút/)).toBeVisible();
  await panel.getByRole("button", { name: "Xác nhận quyết định" }).click();
  await expect(
    page.getByText(/DEMO IT_MANAGER · Đang thực hiện/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Về bảng công việc" }).click();
  await page.getByRole("button", { name: "Xem kế hoạch" }).click();
  await page.getByLabel("Phiên bản kế hoạch").selectOption("v1");
  await expect(page.getByText(/DEMO TECHNICIAN · Còn 60 phút/)).toBeVisible();
});
for (const [ref, id, action] of [
  ["plan", "T03", "Bỏ khóa phân công"],
  ["progress", "T07", "Đổi người thực hiện"],
]) {
  test(`compare manual work controls ${ref}`, async ({ page, context }) => {
    const url = process.env.TICKET_DETAIL_DESIGN_URL;
    test.skip(!url, "Design server required");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, "it_manager", id);
    await expect(await dialog(page, action)).toBeVisible();
    const design = await context.newPage();
    await design.goto(url + "/03-work.html#" + ref);
    await expect(design.locator("main")).toBeVisible();
    const dir = path.resolve("../../docs/implementation/evidence/FE-08.04");
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
      });
      await design.screenshot({
        path: path.join(dir, `reference-${ref}-${width}.png`),
      });
    }
  });
}
