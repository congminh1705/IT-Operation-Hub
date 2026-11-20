import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

async function open(
  page: Page,
  role: string,
  id: string,
  clock = "2026-11-19T10:00:00+07:00",
) {
  await page.clock.setFixedTime(new Date(clock));
  await page.goto("/login?returnTo=" + encodeURIComponent("/tickets/" + id));
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(page.locator("[data-clock=resolution]")).toBeVisible();
}

test("fixed first response reaches at-risk then breached without pausing resolution", async ({
  page,
}) => {
  await open(page, "requester", "TKT-000126", "2026-11-19T09:13:00+07:00");
  await expect(page.locator("[data-clock=response]")).toHaveAttribute(
    "data-status",
    "risk",
  );
  await expect(page.locator("[data-clock=resolution]")).toHaveAttribute(
    "data-status",
    "running",
  );
  await page.clock.setFixedTime(new Date("2026-11-19T09:15:00+07:00"));
  await page.getByRole("button", { name: "Lịch sử" }).click();
  await expect(page.locator("[data-clock=response]")).toHaveAttribute(
    "data-status",
    "breached",
  );
});

test("requester Pending reply resumes clock with stable elapsed usage", async ({
  page,
}) => {
  await open(page, "requester", "TKT-000128");
  await expect(page.locator("[data-clock=response]")).toHaveAttribute(
    "data-status",
    "stopped",
  );
  await expect(page.locator("[data-clock=resolution]")).toHaveAttribute(
    "data-status",
    "paused",
  );
  await expect(page.locator("[data-clock=resolution]")).toContainText(
    "Đã dùng 35 phút",
  );
  await page
    .locator("#ticket-reply")
    .fill("Đã gửi thông tin để tiếp tục xử lý.");
  await page.getByRole("button", { name: "Xem trước phản hồi" }).click();
  await page.getByRole("button", { name: "Xác nhận gửi" }).click();
  await expect(page.locator("[data-clock=resolution]")).toHaveAttribute(
    "data-status",
    "running",
  );
  await expect(page.locator("[data-clock=resolution]")).toContainText(
    "Đã dùng 35 phút",
  );
});

test("reopen preserves used time and priority change keeps past first response breach", async ({
  page,
}) => {
  await open(page, "it_manager", "TKT-000133");
  const response = page.locator("[data-clock=response]");
  const resolution = page.locator("[data-clock=resolution]");
  await expect(resolution).toHaveAttribute("data-status", "stopped");
  await expect(resolution).toContainText("Đã dùng 1 giờ 0 phút");
  await page.getByRole("button", { name: "Mở lại yêu cầu" }).click();
  let dialog = page.getByRole("dialog", { name: "Mở lại yêu cầu" });
  await dialog.locator("textarea").fill("Sự cố quay lại sau khi đóng.");
  await dialog.getByRole("button", { name: "Xem trước" }).click();
  await dialog.getByRole("button", { name: "Xác nhận" }).click();
  await expect(resolution).toHaveAttribute("data-status", "running");
  await expect(resolution).toContainText("Đã dùng 1 giờ 0 phút");
  await page.getByRole("button", { name: "Thay đổi ưu tiên" }).click();
  dialog = page.getByRole("dialog", { name: "Thay đổi ưu tiên" });
  await dialog.getByLabel("Ưu tiên mới").selectOption("P2");
  await dialog.locator("textarea").fill("Điều chỉnh do ảnh hưởng tăng lên.");
  await dialog.getByRole("button", { name: "Xem trước" }).click();
  await dialog.getByRole("button", { name: "Xác nhận" }).click();
  await expect(response).toHaveAttribute("data-status", "stopped");
  await expect(response).toContainText("Đã dùng 35 phút / 30 phút");
  await expect(response).toContainText("Đã ghi nhận quá hạn");
  await expect(resolution).toContainText("Đã dùng 1 giờ 0 phút");
});

for (const [reference, role] of [
  ["ticket-it", "technician"],
  ["ticket-active", "requester"],
]) {
  test(`compare SLA display ${reference}`, async ({ page, context }) => {
    const url = process.env.TICKET_DETAIL_DESIGN_URL;
    test.skip(!url, "Design server required for comparison");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, role, "TKT-000127");
    const design = await context.newPage();
    await design.emulateMedia({ reducedMotion: "reduce" });
    await design.goto(`${url}/02-tickets.html#${reference}`);
    await expect(
      design.getByText("Không gian làm việc / Yêu cầu hỗ trợ"),
    ).toBeVisible();
    const folder = path.resolve("../../docs/implementation/evidence/FE-06.06");
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await design.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: path.join(folder, `actual-${reference}-${width}.png`),
        fullPage: true,
      });
      await design.screenshot({
        path: path.join(folder, `reference-${reference}-${width}.png`),
        fullPage: true,
      });
    }
  });
}
