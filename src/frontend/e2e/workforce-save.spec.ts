import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
async function open(page: Page, target = "/workforce") {
  await page.goto("/login?returnTo=" + encodeURIComponent(target));
  await page.locator("#login-email").fill("it_manager@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
}
const editor = (page: Page) =>
  page.getByRole("region", { name: "Cập nhật nhân sự" });
async function saveAbsence(page: Page, start: string, end: string) {
  await page.getByLabel("Từ", { exact: true }).fill(start);
  await page.getByLabel("Đến", { exact: true }).fill(end);
  await page.getByRole("button", { name: "Xem trước thay đổi" }).click();
  await page.getByRole("button", { name: "Xác nhận lưu" }).click();
}
test("absence persists and evaluation pending keeps ticket SLA unchanged", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-11-19T10:00:00+07:00"));
  await open(page, "/tickets/TKT-000127");
  await expect(page.locator("[data-clock=resolution]")).toBeVisible();
  const before = await page.locator(".ticket-sla").innerText();
  const state = await page.locator(".ticket-detail-badges").innerText();
  await page.locator('a[href="/workforce"]').first().click();
  await saveAbsence(page, "10:00", "12:00");
  const confirmation = page.getByRole("region", { name: "Kết quả ghi nhận" });
  await expect(confirmation).toContainText("Đã ghi nhận thay đổi");
  await expect(confirmation).toContainText(
    "Chờ đánh giá công việc bị ảnh hưởng",
  );
  await expect(confirmation).toContainText("T07");
  await expect(
    page.getByRole("row", { name: /DEMO TECHNICIAN/ }),
  ).toContainText("Vắng 10:00–12:00");
  await confirmation.getByRole("link", { name: "TKT-000127" }).click();
  await expect(page.locator(".ticket-sla")).toHaveText(before, {
    useInnerText: true,
  });
  await expect(page.locator(".ticket-detail-badges")).toHaveText(state, {
    useInnerText: true,
  });
});
test("conflict leaves workforce unchanged and retains draft", async ({
  page,
}) => {
  await open(page, "/workforce?demo=workforce-conflict");
  await page.getByLabel("Ghi chú nội bộ").fill("Bản nháp chờ kiểm tra lại.");
  await saveAbsence(page, "09:00", "17:00");
  await expect(editor(page).getByRole("alert")).toContainText(
    "Dữ liệu đã thay đổi",
  );
  await expect(page.getByLabel("Ghi chú nội bộ")).toHaveValue(
    "Bản nháp chờ kiểm tra lại.",
  );
  await expect(
    page.getByRole("region", { name: "Kết quả ghi nhận" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("row", { name: /DEMO TECHNICIAN/ }),
  ).not.toContainText("Vắng 09:00–17:00");
});
test("no free capacity is visible without implying reassignment", async ({
  page,
}) => {
  await open(page);
  await saveAbsence(page, "09:00", "17:00");
  const saved = page.getByRole("region", { name: "Kết quả ghi nhận" });
  await expect(saved).toContainText("không còn năng lực trống");
  await expect(saved).toContainText("Chờ đánh giá");
  await expect(
    page.getByRole("row", { name: /DEMO TECHNICIAN/ }),
  ).toContainText("Còn trống: -180 phút");
});
test("confirmed schedule and skill edits update workforce projection", async ({
  page,
}) => {
  await open(page);
  await page.getByLabel("Loại thay đổi").selectOption("schedule");
  await page.getByLabel("Từ", { exact: true }).fill("09:00");
  await page.getByLabel("Đến", { exact: true }).fill("15:00");
  await page.getByLabel("Ngân sách (phút/ngày)", { exact: true }).fill("300");
  await page.getByRole("button", { name: "Xem trước thay đổi" }).click();
  await page.getByRole("button", { name: "Xác nhận lưu" }).click();
  const row = page.getByRole("row", { name: /DEMO TECHNICIAN/ });
  await expect(row).toContainText("Lịch: 09:00–15:00");
  await expect(row).toContainText("Ngân sách: 300 phút");
  await page.getByLabel("Loại thay đổi").selectOption("skill");
  await page.getByLabel("Kỹ năng", { exact: true }).fill("VPN");
  await page.getByRole("button", { name: "Xem trước thay đổi" }).click();
  await page.getByRole("button", { name: "Xác nhận lưu" }).click();
  await expect(row).toContainText("VPN · Đã xác minh bởi DEMO IT_MANAGER");
});
test("compare saved workforce state at desktop and mobile", async ({
  page,
  context,
}) => {
  const url = process.env.TICKET_DETAIL_DESIGN_URL;
  test.skip(!url, "Design server required");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  await saveAbsence(page, "10:00", "12:00");
  const design = await context.newPage();
  await design.goto(url + "/04-workforce.html#workforce");
  await expect(design.locator("main")).toBeVisible();
  const dir = path.resolve("../../docs/implementation/evidence/FE-09.03");
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
