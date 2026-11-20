import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

async function open(page: Page, role: string, target: string) {
  await page.goto(
    "/login?returnTo=" + encodeURIComponent("/tickets/" + target),
  );
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(page.locator(".ticket-detail-badges")).toBeVisible();
}

async function choose(page: Page, action: string) {
  await page.getByRole("button", { name: action, exact: true }).click();
  return page.getByRole("dialog", { name: action });
}

test("New cannot start directly, and acceptance is not first response", async ({
  page,
}) => {
  await open(page, "technician", "TKT-000126");
  await expect(page.getByRole("button", { name: "Bắt đầu xử lý" })).toHaveCount(
    0,
  );
  await (
    await choose(page, "Tiếp nhận yêu cầu")
  )
    .getByRole("button", { name: "Xác nhận" })
    .click();
  await expect(page.locator(".ticket-detail-badges")).toContainText(
    "Đã tiếp nhận",
  );
  await expect(page.getByText("Đã phản hồi lần đầu")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Bắt đầu xử lý" })).toHaveCount(
    0,
  );
});

test("eligible assigned technician can start Open ticket", async ({ page }) => {
  await open(page, "technician", "TKT-000131");
  const dialog = await choose(page, "Bắt đầu xử lý");
  await expect(dialog).toContainText("DEMO TECHNICIAN");
  await dialog.getByRole("button", { name: "Xác nhận" }).click();
  await expect(page.locator(".ticket-detail-badges")).toContainText(
    "Đang xử lý",
  );
});

test("requester can cancel their New ticket and no longer reply", async ({
  page,
}) => {
  await open(page, "requester", "TKT-000126");
  await (
    await choose(page, "Hủy yêu cầu")
  )
    .getByRole("button", { name: "Xác nhận" })
    .click();
  await expect(page.locator(".ticket-detail-badges")).toContainText("Đã hủy");
  await expect(page.locator("#ticket-reply")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Hủy yêu cầu" })).toHaveCount(
    0,
  );
});

test("manager needs a reason and stale response preserves it", async ({
  page,
}) => {
  await open(page, "it_manager", "TKT-000128?demo=transition-stale");
  const dialog = await choose(page, "Hủy yêu cầu");
  await dialog.getByRole("button", { name: "Xác nhận" }).click();
  await expect(dialog.locator("textarea")).toBeFocused();
  await dialog.locator("textarea").fill("Hủy vì yêu cầu bị trùng.");
  await dialog.getByRole("button", { name: "Xác nhận" }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "Phiên bản đã thay đổi",
  );
  await expect(dialog.locator("textarea")).toHaveValue(
    "Hủy vì yêu cầu bị trùng.",
  );
  await expect(page.locator(".ticket-detail-badges")).toContainText(
    "Chờ bổ sung",
  );
});

for (const [reference, id, action] of [
  ["assign", "TKT-000126", "Tiếp nhận yêu cầu"],
  ["transition", "TKT-000131", "Bắt đầu xử lý"],
]) {
  test(`compare lifecycle dialog using ${reference}`, async ({
    page,
    context,
  }) => {
    const designUrl = process.env.TICKET_DETAIL_DESIGN_URL;
    test.skip(!designUrl, "Design server required for comparison");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, "technician", id);
    const dialog = await choose(page, action);
    await expect(dialog).toBeVisible();
    const design = await context.newPage();
    await design.emulateMedia({ reducedMotion: "reduce" });
    await design.goto(`${designUrl}/02-tickets.html#${reference}`);
    await expect(
      design.getByRole("heading", {
        name:
          reference === "assign"
            ? "Phân công yêu cầu"
            : "Cập nhật trạng thái ticket",
      }),
    ).toBeVisible();
    const folder = path.resolve("../../docs/implementation/evidence/FE-06.03");
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
      });
      await design.screenshot({
        path: path.join(folder, `reference-${reference}-${width}.png`),
      });
    }
  });
}
