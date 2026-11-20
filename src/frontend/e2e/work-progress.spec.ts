import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
async function open(page: Page, id: string, stale = false) {
  await page.goto(
    "/login?returnTo=" +
      encodeURIComponent(
        "/work?scope=mine" + (stale ? "&demo=work-stale" : ""),
      ),
  );
  await page.locator("#login-email").fill("technician@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await page.getByRole("button", { name: "Xem công việc " + id }).click();
}
const action = (page: Page, value: string) =>
  page.getByLabel("Thao tác tiến độ", { exact: true }).selectOption(value);
const preview = (page: Page) =>
  page.getByRole("button", { name: "Xem trước cập nhật" }).click();
const confirm = (page: Page) =>
  page.getByRole("button", { name: "Xác nhận cập nhật" }).click();
test("blocked dependency prevents unblock, start and block use explicit confirmation", async ({
  page,
}) => {
  await open(page, "T11");
  await page
    .getByLabel("Lý do", { exact: true })
    .fill("Đã xem lại điều kiện trước khi bỏ chặn.");
  await preview(page);
  await expect(
    page.getByText("Công việc phụ thuộc chưa hoàn tất."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Về bảng công việc" }).click();
  await page.getByRole("button", { name: "Xem công việc T09" }).click();
  await preview(page);
  await confirm(page);
  await expect(
    page.getByText(/DEMO TECHNICIAN · Đang thực hiện · Còn/),
  ).toBeVisible();
  await action(page, "block");
  await page
    .getByLabel("Lý do", { exact: true })
    .fill("Cần chờ kiểm tra nguồn thiết bị.");
  await preview(page);
  await confirm(page);
  await expect(page.getByText(/DEMO TECHNICIAN · Bị chặn · Còn/)).toBeVisible();
});
test("capacity and result checks, then Done leaves ticket unchanged", async ({
  page,
}) => {
  await open(page, "T07");
  await page.getByLabel("Thời gian còn lại (phút)").fill("300");
  await preview(page);
  await expect(page.getByText(/Không đủ năng lực/)).toBeVisible();
  await action(page, "done");
  await page.getByLabel("Thời gian còn lại (phút)").fill("0");
  await preview(page);
  await expect(page.getByText(/Hoàn tất yêu cầu kết quả/)).toBeVisible();
  await page
    .getByLabel("Kết quả", { exact: true })
    .fill("Đã xác minh VPN qua phiên DEMO.");
  await preview(page);
  await confirm(page);
  await expect(
    page.getByText(/DEMO TECHNICIAN · Hoàn tất · Còn 0/),
  ).toBeVisible();
  await page.getByRole("link", { name: "Mở yêu cầu liên quan" }).click();
  await expect(page.locator(".ticket-detail-badges")).toContainText(
    "Đang xử lý",
  );
});
test("stale progress does not overwrite task and keeps input", async ({
  page,
}) => {
  await open(page, "T07", true);
  await page.getByLabel("Thời gian còn lại (phút)").fill("25");
  await page
    .getByLabel("Kết quả", { exact: true })
    .fill("Kết quả từ bản nháp cũ.");
  await preview(page);
  await confirm(page);
  await expect(page.getByText(/Phiên bản công việc đã thay đổi/)).toBeVisible();
  await expect(page.getByLabel("Thời gian còn lại (phút)")).toHaveValue("25");
  await expect(page.getByLabel("Kết quả", { exact: true })).toHaveValue(
    "Kết quả từ bản nháp cũ.",
  );
  await expect(page.getByText(/Còn 60 phút/)).toBeVisible();
});
test("compare progress desktop and mobile", async ({ page, context }) => {
  const url = process.env.TICKET_DETAIL_DESIGN_URL;
  test.skip(!url, "Design server required");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "T07");
  const design = await context.newPage();
  await design.goto(url + "/03-work.html#progress");
  await expect(design.locator("main")).toBeVisible();
  const dir = path.resolve("../../docs/implementation/evidence/FE-08.03");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await design.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: path.join(dir, `actual-progress-${width}.png`),
      fullPage: true,
    });
    await design.screenshot({
      path: path.join(dir, `reference-progress-${width}.png`),
      fullPage: true,
    });
  }
});
