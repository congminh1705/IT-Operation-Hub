import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

async function open(page: Page, persona: string, target: string) {
  await page.goto(
    "/login?returnTo=" + encodeURIComponent("/tickets/" + target),
  );
  await page.locator("#login-email").fill(persona + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(page.locator("#ticket-reply")).toBeVisible();
}

const preview = (page: Page, note = false) =>
  page
    .getByRole("button", {
      name: note ? "Xem trước ghi chú" : "Xem trước phản hồi",
    })
    .click();
const confirm = (page: Page) =>
  page.getByRole("button", { name: "Xác nhận gửi" }).click();
const audience = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true }).click();

test("separate drafts and first response from committed public IT reply only", async ({
  page,
}) => {
  await open(page, "technician", "TKT-000126");
  const editor = page.locator("#ticket-reply");
  await editor.fill("Phản hồi thử nghiệm");
  await audience(page, "Ghi chú nội bộ");
  await expect(editor).toHaveValue("");
  await editor.fill("Ghi chú thử nghiệm");
  await audience(page, "Trao đổi công khai");
  await expect(editor).toHaveValue("Phản hồi thử nghiệm");
  await audience(page, "Ghi chú nội bộ");
  await expect(editor).toHaveValue("Ghi chú thử nghiệm");
  await preview(page, true);
  await confirm(page);
  await expect(page.locator(".ticket-history-events")).toContainText(
    "Ghi chú thử nghiệm",
  );
  await expect(page.getByText("Đã phản hồi lần đầu")).toHaveCount(0);
  await audience(page, "Trao đổi công khai");
  await expect(editor).toHaveValue("Phản hồi thử nghiệm");
  await preview(page);
  await expect(page.getByText("Đã phản hồi lần đầu")).toHaveCount(0);
  await confirm(page);
  await expect(page.locator(".ticket-history-events")).toContainText(
    "Phản hồi thử nghiệm",
  );
  await expect(page.getByText("Đã phản hồi lần đầu")).toBeVisible();
  await expect(page.locator(".ticket-history-events")).not.toContainText(
    "Ghi chú thử nghiệm",
  );
});

test("requester Pending reply resumes after confirmation", async ({ page }) => {
  await open(page, "requester", "TKT-000128");
  const banner = page.getByText("IT đang chờ phản hồi của bạn");
  await page.locator("#ticket-reply").fill("Đã gửi thêm thông tin");
  await preview(page);
  await expect(banner).toBeVisible();
  await confirm(page);
  await expect(banner).toHaveCount(0);
  await expect(page.locator(".ticket-detail-badges")).toContainText(
    "Đang xử lý",
  );
  await audience(page, "Lịch sử");
  await expect(page.locator(".ticket-history-events")).toContainText(
    "Đã nhận phản hồi và tiếp tục xử lý.",
  );
});

test("rights revoked while confirming keeps own draft and hides detail", async ({
  page,
}) => {
  await open(page, "technician", "TKT-000128?demo=reply-revoked");
  await audience(page, "Ghi chú nội bộ");
  await page.locator("#ticket-reply").fill("Bản nháp cần giữ");
  await preview(page, true);
  await confirm(page);
  await expect(page.getByText("Quyền truy cập đã thay đổi")).toBeVisible();
  await expect(page.getByLabel("Bản nháp của bạn")).toHaveValue(
    "Bản nháp cần giữ",
  );
  await expect(page.locator(".ticket-history")).toHaveCount(0);
});

for (const [persona, reference] of [
  ["technician", "ticket-it"],
  ["requester", "ticket-requester"],
]) {
  test(`compare composer for ${persona}`, async ({ page, context }) => {
    const designUrl = process.env.TICKET_DETAIL_DESIGN_URL;
    test.skip(!designUrl, "Design server required for comparison");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, persona, "TKT-000128");
    const design = await context.newPage();
    await design.emulateMedia({ reducedMotion: "reduce" });
    await design.goto(`${designUrl}/02-tickets.html#${reference}`);
    await expect(design.locator("#reply")).toBeVisible();
    const folder = path.resolve("../../docs/implementation/evidence/FE-06.02");
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
