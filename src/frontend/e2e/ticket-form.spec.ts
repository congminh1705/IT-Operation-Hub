import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
const evidence = path.resolve("../../docs/implementation/evidence/FE-05.02");
async function open(page: Page) {
  await page.goto("/login?returnTo=%2Ftickets%2Fnew");
  await page.locator("#login-email").fill("requester@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(
    page.getByRole("heading", { name: "Tạo yêu cầu", level: 1 }),
  ).toBeVisible();
}
async function fill(page: Page, type = "incident") {
  await page.getByLabel("Loại yêu cầu").selectOption(type);
  await page.getByLabel("Danh mục", { exact: true }).selectOption("Thiết bị");
  await page.getByLabel("Tiêu đề").fill("Máy trạm DEMO không bật");
  await page
    .getByLabel("Mô tả", { exact: true })
    .fill("Máy trạm thử nghiệm không phản hồi từ sáng.");
  await page.getByLabel("Mức ảnh hưởng").selectOption("low");
  await page.getByLabel("Mức khẩn cấp").selectOption("low");
}
test("required constraints, computed priority and permitted assets", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: "Xem trước yêu cầu" }).click();
  await expect(page.getByLabel("Loại yêu cầu")).toBeFocused();
  await fill(page);
  await expect(page.getByTestId("ticket-priority")).toHaveText("P4");
  await expect(
    page.getByLabel("Thiết bị liên quan").getByRole("option"),
  ).toHaveCount(2);
  await expect(page.getByLabel("Danh sách nhân sự")).toHaveCount(0);
  await page.getByRole("button", { name: "Xem trước yêu cầu" }).click();
  await expect(
    page.getByRole("heading", { name: "Xem trước yêu cầu" }),
  ).toBeFocused();
  await expect(page.getByText("Chưa ghi nhận yêu cầu.")).toBeVisible();
});
test("onboarding clarification fields required only for selected mode", async ({
  page,
}) => {
  await open(page);
  await fill(page, "service");
  await page.getByRole("checkbox", { name: /onboarding/ }).check();
  await page.getByRole("button", { name: "Xem trước yêu cầu" }).click();
  await expect(page.getByLabel("Danh sách nhân sự")).toBeFocused();
  await page.getByLabel("Danh sách nhân sự").fill("Nhân viên DEMO");
  await page.getByLabel("Cấu hình hoặc mẫu thiết bị").fill("Laptop DEMO");
  await page.getByLabel("Số lượng").fill("1");
  await page.getByLabel("Hạn bàn giao (GMT+7)").fill("2026-11-30T09:30");
  await page.getByRole("button", { name: "Xem trước yêu cầu" }).click();
  await expect(
    page.getByRole("heading", { name: "Xem trước yêu cầu" }),
  ).toBeFocused();
});
test("matched desktop/mobile form captures", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: path.join(evidence, `actual-${width}.png`),
      fullPage: true,
    });
  }
  if (process.env.TICKET_DESIGN_URL) {
    await page.goto(
      `${process.env.TICKET_DESIGN_URL}/final/02-tickets.html?capture=1#create`,
    );
    await page.locator("#subject").waitFor();
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.screenshot({
        path: path.join(evidence, `reference-${width}.png`),
        fullPage: true,
      });
    }
  }
});
