import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

async function open(page: Page, role: string, id: string) {
  await page.goto("/login?returnTo=" + encodeURIComponent("/tickets/" + id));
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(page.locator(".ticket-detail-badges")).toBeVisible();
}

async function choose(page: Page, name: string) {
  await page.getByRole("button", { name, exact: true }).click();
  return page.getByRole("dialog", { name });
}

test("technician claims an unassigned team ticket but cannot override priority", async ({
  page,
}) => {
  await open(page, "technician", "TKT-000126");
  await expect(
    page.getByRole("button", { name: "Thay đổi ưu tiên" }),
  ).toHaveCount(0);
  const dialog = await choose(page, "Tự nhận xử lý");
  await dialog.getByRole("button", { name: "Xác nhận" }).click();
  await expect(page.getByRole("button", { name: "Tự nhận xử lý" })).toHaveCount(
    0,
  );
  await expect(page.locator(".ticket-detail-context")).toContainText(
    "DEMO TECHNICIAN",
  );
});

test("manager assignment requires active-work replacement and conflict keeps the draft", async ({
  page,
}) => {
  await open(page, "it_manager", "TKT-000127?demo=transition-stale");
  const dialog = await choose(page, "Phân công yêu cầu");
  await dialog.getByLabel("Nhóm tiếp nhận").selectOption("infrastructure");
  await dialog
    .getByLabel("Lý do")
    .fill("Chuyển đến nhóm có chuyên môn phù hợp.");
  await dialog.getByRole("button", { name: "Xem trước" }).click();
  await expect(dialog.getByLabel("Người thực hiện")).toBeFocused();
  await dialog
    .getByLabel("Người thực hiện")
    .selectOption({ label: "DEMO TECHNICIAN" });
  await dialog.getByRole("button", { name: "Xem trước" }).click();
  await dialog.getByRole("button", { name: "Xác nhận" }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "Phiên bản đã thay đổi",
  );
  await expect(dialog.getByLabel("Lý do")).toHaveValue(
    "Chuyển đến nhóm có chuyên môn phù hợp.",
  );
  await expect(dialog.getByLabel("Nhóm tiếp nhận")).toHaveValue(
    "infrastructure",
  );
});

test("manager transfers active work with an eligible replacement", async ({
  page,
}) => {
  await open(page, "it_manager", "TKT-000127");
  const dialog = await choose(page, "Phân công yêu cầu");
  await dialog.getByLabel("Nhóm tiếp nhận").selectOption("infrastructure");
  await dialog
    .getByLabel("Người thực hiện")
    .selectOption({ label: "DEMO TECHNICIAN" });
  await dialog.getByLabel("Lý do").fill("Chuyển sang nhóm hạ tầng hỗ trợ.");
  await dialog.getByRole("button", { name: "Xem trước" }).click();
  await dialog.getByRole("button", { name: "Xác nhận" }).click();
  await expect(page.getByText("Đã cập nhật yêu cầu.")).toBeVisible();
  await expect(page.locator(".ticket-detail-grid aside")).toContainText(
    "Infrastructure",
  );
  await expect(page.locator(".ticket-detail-badges")).toContainText(
    "Đang xử lý",
  );
});

test("priority adjustment keeps prior timeline, first response and snapshot version", async ({
  page,
}) => {
  await open(page, "it_manager", "TKT-000127");
  const dialog = await choose(page, "Thay đổi ưu tiên");
  await dialog.getByLabel("Ưu tiên mới").selectOption("P1");
  await dialog.getByLabel("Lý do").fill("Nâng mức do ảnh hưởng nhiều người.");
  await dialog.getByRole("button", { name: "Xem trước" }).click();
  await expect(page.locator(".ticket-detail-badges")).toContainText("P2");
  await dialog.getByRole("button", { name: "Xác nhận" }).click();
  await expect(page.locator(".ticket-detail-badges")).toContainText("P1");
  await expect(page.getByText(/Phiên bản v3/)).toBeVisible();
  await expect(page.getByText("Đã phản hồi lần đầu")).toBeVisible();
  await page.getByRole("button", { name: "Lịch sử" }).click();
  await expect(page.locator(".ticket-history-events")).toContainText(
    "Đã tạo yêu cầu.",
  );
  await expect(page.locator(".ticket-history-events")).toContainText(
    "Ưu tiên: P2 → P1",
  );
});

for (const [key, label] of [
  ["assign", "Phân công yêu cầu"],
  ["priority", "Thay đổi ưu tiên"],
]) {
  test(`compare routing ${key}`, async ({ page, context }) => {
    const url = process.env.TICKET_DETAIL_DESIGN_URL;
    test.skip(!url, "Design server required for comparison");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, "it_manager", "TKT-000127");
    await expect(await choose(page, label)).toBeVisible();
    const design = await context.newPage();
    await design.emulateMedia({ reducedMotion: "reduce" });
    await design.goto(`${url}/02-tickets.html#${key}`);
    await expect(
      design.getByRole("heading", { name: label, exact: true }),
    ).toBeVisible();
    const folder = path.resolve("../../docs/implementation/evidence/FE-06.05");
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await design.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: path.join(folder, `actual-${key}-${width}.png`),
      });
      await design.screenshot({
        path: path.join(folder, `reference-${key}-${width}.png`),
      });
    }
  });
}
