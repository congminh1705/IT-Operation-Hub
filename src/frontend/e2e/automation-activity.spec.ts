import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
async function open(
  page: Page,
  role = "it_manager",
  route = "/automation/activity",
) {
  await page.goto("/login?returnTo=" + encodeURIComponent(route));
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
}
const panel = (page: Page) =>
  page.getByRole("region", { name: "Dòng thời gian điều phối" });
const choose = (page: Page, id: string) =>
  page.getByLabel("Kịch bản hoạt động DEMO").selectOption(id);
test("page opening is read-only, queued and approved are not success, normal skips approval", async ({
  page,
}) => {
  await open(page);
  await expect(panel(page)).toContainText("Chưa có lượt chạy");
  await expect(panel(page).locator("[data-stage=committed]")).toHaveCount(0);
  await choose(page, "disabled");
  await expect(panel(page)).toContainText(
    "Chính sách không cho phép thực thi mới",
  );
  await choose(page, "queued");
  await expect(panel(page).locator("[data-stage=queued]")).toContainText(
    "Đang chờ thực thi",
  );
  await choose(page, "approved");
  await expect(panel(page).locator("[data-stage=approved]")).toContainText(
    "chờ kết quả thực thi",
  );
  await expect(
    panel(page).getByText("Chưa thực thi", { exact: true }),
  ).toBeVisible();
  await choose(page, "normal");
  await expect(panel(page).locator("[data-stage=skipped]")).toContainText(
    "Không cần phê duyệt",
  );
  await expect(panel(page)).toContainText("Đã thực thi trong lịch sử DEMO");
});
test("failed retry requires confirmation and queues without clearing manual lock", async ({
  page,
}) => {
  await open(page);
  await choose(page, "failed");
  const scope = panel(page);
  await expect(scope.getByRole("alert")).toContainText(
    "Phiên bản công việc thay đổi",
  );
  await scope.getByRole("button", { name: "Yêu cầu thử lại" }).click();
  await scope.getByRole("button", { name: "Hủy", exact: true }).click();
  await expect(scope.locator("[data-stage=failed]")).toBeVisible();
  await scope.getByRole("button", { name: "Yêu cầu thử lại" }).click();
  await scope.getByRole("button", { name: "Xác nhận thử lại" }).click();
  await expect(scope).toContainText("Đã ghi yêu cầu thử lại");
  await expect(scope).toContainText("Khóa phân công vẫn được giữ.");
  await expect(scope).toContainText("Lỗi lần trước:");
  await expect(
    scope.getByRole("button", { name: "Yêu cầu thử lại" }),
  ).toHaveCount(0);
  await expect(scope.locator("[data-stage=queued]")).toBeVisible();
});
test("disabled policy blocks retry from the linked activity view", async ({
  page,
}) => {
  await open(page, "it_manager", "/automation/policies");
  const policy = page.getByRole("region", { name: "Chính sách điều phối" });
  await policy.getByRole("button", { name: "Chỉnh chính sách" }).click();
  await policy.getByLabel("Trạng thái chính sách mới").selectOption("off");
  await policy.getByRole("button", { name: "Xem trước chính sách" }).click();
  await policy.getByRole("button", { name: "Xác nhận lưu chính sách" }).click();
  await page.getByRole("link", { name: "Xem hoạt động điều phối" }).click();
  await choose(page, "failed");
  await expect(panel(page)).toContainText("Chính sách không cho phép");
  await expect(
    panel(page).getByRole("button", { name: "Yêu cầu thử lại" }),
  ).toHaveCount(0);
});
test("technician view excludes activity outside the team", async ({ page }) => {
  await open(page, "technician");
  await expect(page.getByLabel("Kịch bản hoạt động DEMO")).toBeVisible();
  await expect(page.locator('option[value="outside"]')).toHaveCount(0);
});
for (const [ref, id] of [
  ["ai-normal", "normal"],
  ["ai-exception", "approved"],
]) {
  test(`compare activity ${ref}`, async ({ page, context }) => {
    const url = process.env.TICKET_DETAIL_DESIGN_URL;
    test.skip(!url, "Design server required");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page);
    await choose(page, id);
    const design = await context.newPage();
    await design.goto(url + "/05-ai.html#" + ref);
    await expect(design.locator("main")).toBeVisible();
    const dir = path.resolve("../../docs/implementation/evidence/FE-10.03");
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
