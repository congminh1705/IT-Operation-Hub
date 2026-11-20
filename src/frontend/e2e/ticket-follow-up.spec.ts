import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

async function open(page: Page, role: string, id: string) {
  await page.goto("/login?returnTo=" + encodeURIComponent("/tickets/" + id));
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(page.locator(".ticket-detail-badges")).toBeVisible();
}

async function choose(page: Page, action: string) {
  await page.getByRole("button", { name: action, exact: true }).click();
  return page.getByRole("dialog", { name: action });
}

test("wait and resolution require substantive public preview and commit a message", async ({
  page,
}) => {
  await open(page, "technician", "TKT-000127");
  let dialog = await choose(page, "Chờ phản hồi");
  await dialog.getByRole("button", { name: "Xem trước" }).click();
  await expect(dialog.locator("textarea")).toBeFocused();
  await dialog
    .locator("textarea")
    .fill("Vui lòng gửi thời điểm phát sinh lỗi.");
  await dialog.getByRole("button", { name: "Xem trước" }).click();
  await expect(
    dialog.getByRole("heading", { name: "Nội dung xem trước" }),
  ).toBeVisible();
  await expect(page.locator(".ticket-detail-badges")).toContainText(
    "Đang xử lý",
  );
  await dialog.getByRole("button", { name: "Xác nhận" }).click();
  await expect(page.locator(".ticket-detail-badges")).toContainText(
    "Chờ bổ sung",
  );
  await expect(page.locator(".ticket-history-events")).toContainText(
    "Vui lòng gửi thời điểm phát sinh lỗi.",
  );
  await expect(
    page.getByRole("button", { name: "Đề xuất giải quyết" }),
  ).toHaveCount(0);
  dialog = await choose(page, "Tiếp tục xử lý");
  await dialog.locator("textarea").fill("Đã nhận đầy đủ thông tin.");
  await dialog.getByRole("button", { name: "Xác nhận" }).click();
  dialog = await choose(page, "Đề xuất giải quyết");
  await dialog.getByRole("button", { name: "Xem trước" }).click();
  await expect(dialog.locator("textarea")).toBeFocused();
  await dialog.locator("textarea").fill("Đã khắc phục và kiểm tra thành công.");
  await dialog.getByRole("button", { name: "Xem trước" }).click();
  await dialog.getByRole("button", { name: "Xác nhận" }).click();
  await expect(page.locator(".ticket-detail-badges")).toContainText(
    "Đã giải quyết",
  );
  await expect(page.locator(".ticket-history-events")).toContainText(
    "Đã khắc phục và kiểm tra thành công.",
  );
  await expect(page.getByRole("button", { name: "Xác nhận đóng" })).toHaveCount(
    0,
  );
});

test("only requester confirms closure, and requester cannot reopen Closed", async ({
  page,
}) => {
  await open(page, "requester", "TKT-000129");
  await expect(
    page.getByText("Kết quả đã sẵn sàng để bạn kiểm tra"),
  ).toBeVisible();
  await (
    await choose(page, "Xác nhận đóng")
  )
    .getByRole("button", { name: "Xác nhận" })
    .click();
  await expect(page.locator(".ticket-detail-badges")).toContainText("Hoàn tất");
  await expect(
    page.getByRole("button", { name: "Mở lại yêu cầu" }),
  ).toHaveCount(0);
});

test("manager reopens Closed with reason; Cancelled is terminal", async ({
  page,
}) => {
  await open(page, "it_manager", "TKT-000133");
  let dialog = await choose(page, "Mở lại yêu cầu");
  await dialog.locator("textarea").fill("Sự cố tái diễn sau khi đóng.");
  await dialog.getByRole("button", { name: "Xem trước" }).click();
  await dialog.getByRole("button", { name: "Xác nhận" }).click();
  await expect(page.locator(".ticket-detail-badges")).toContainText(
    "Đang xử lý",
  );
  dialog = await choose(page, "Hủy yêu cầu");
  await dialog.locator("textarea").fill("Đã chuyển sang yêu cầu khác.");
  await dialog.getByRole("button", { name: "Xác nhận" }).click();
  await expect(page.locator(".ticket-detail-badges")).toContainText("Đã hủy");
  await expect(
    page.getByRole("button", { name: "Mở lại yêu cầu" }),
  ).toHaveCount(0);
});

test("IT requester cannot record their own first response", async ({
  page,
}) => {
  await open(page, "technician", "TKT-000130");
  await page
    .locator("#ticket-reply")
    .fill("Thông tin do tôi là người gửi cung cấp.");
  await page.getByRole("button", { name: "Xem trước phản hồi" }).click();
  await page.getByRole("button", { name: "Xác nhận gửi" }).click();
  await expect(page.getByText("Đã gửi nội dung.")).toBeVisible();
  await expect(page.getByText("Đã phản hồi lần đầu")).toHaveCount(0);
});

for (const [ref, role, id] of [
  ["ticket-result", "requester", "TKT-000129"],
  ["transition", "technician", "TKT-000127"],
]) {
  test(`compare follow-up ${ref}`, async ({ page, context }) => {
    const url = process.env.TICKET_DETAIL_DESIGN_URL;
    test.skip(!url, "Design server required for comparison");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, role, id);
    if (ref === "transition")
      await expect(await choose(page, "Chờ phản hồi")).toBeVisible();
    const design = await context.newPage();
    await design.emulateMedia({ reducedMotion: "reduce" });
    await design.goto(`${url}/02-tickets.html#${ref}`);
    await expect(
      design.getByText("Không gian làm việc / Yêu cầu hỗ trợ"),
    ).toBeVisible();
    const folder = path.resolve("../../docs/implementation/evidence/FE-06.04");
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await design.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: path.join(folder, `actual-${ref}-${width}.png`),
      });
      await design.screenshot({
        path: path.join(folder, `reference-${ref}-${width}.png`),
      });
    }
  });
}
