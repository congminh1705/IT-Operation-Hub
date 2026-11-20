import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

async function login(page: Page, role: string, destination: string) {
  await page.goto("/login?returnTo=" + encodeURIComponent(destination));
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(page).toHaveURL(
    new RegExp(destination.split("?")[0] + "(?:\\?|$)"),
  );
}

test("requester sees public conversation and public history only", async ({
  page,
}) => {
  await login(page, "requester", "/tickets/TKT-000128");
  await expect(page.getByText("IT đang chờ phản hồi của bạn")).toBeVisible();
  await expect(
    page.getByText("Sự cố vẫn xảy ra sau khi thử lại."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ghi chú nội bộ" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Lịch sử" }).click();
  await expect(page.getByText("Đã tạo yêu cầu.")).toBeVisible();
  await expect(
    page.getByText("Đã ghi nhận kiểm tra cấu hình nội bộ."),
  ).toHaveCount(0);
});

test("technician sees team internal history and no out-of-team ticket", async ({
  page,
}) => {
  await login(page, "technician", "/tickets/TKT-000128");
  await page.getByRole("button", { name: "Ghi chú nội bộ" }).click();
  await expect(
    page.getByText("Ghi chú DEMO: đối chiếu cấu hình thiết bị trong nhóm."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Lịch sử" }).click();
  await expect(page.locator(".ticket-history-events li")).toHaveCount(2);
  await expect(page.locator(".ticket-history-events li").first()).toContainText(
    "Đã tạo yêu cầu.",
  );
});

for (const role of ["requester", "technician"]) {
  test(`${role} has no out-of-scope detail projection`, async ({ page }) => {
    await login(page, role, "/tickets/TKT-000150");
    await expect(page.getByText("Không tìm thấy nội dung")).toBeVisible();
    await expect(page.locator(".ticket-history")).toHaveCount(0);
  });
}
test("explicit detail failure retries into the same authorized ticket", async ({
  page,
}) => {
  await login(page, "requester", "/tickets/TKT-000128?demo=detail-error");
  await expect(page.locator(".ui-feedback[role=alert]")).toContainText(
    "Chưa tải được dữ liệu",
  );
  await expect(page.locator(".ticket-history")).toHaveCount(0);
  await page.getByRole("button", { name: "Thử lại" }).click();
  await expect(page.getByText("IT đang chờ phản hồi của bạn")).toBeVisible();
});

for (const [role, ticket, reference] of [
  ["technician", "TKT-000127", "ticket-it"],
  ["requester", "TKT-000128", "ticket-requester"],
  ["requester", "TKT-000127", "ticket-active"],
]) {
  test(`matched comparison for ${reference}`, async ({ page, context }) => {
    const designUrl = process.env.TICKET_DETAIL_DESIGN_URL;
    test.skip(
      !designUrl,
      "Design comparisons enabled only for evidence capture",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await login(page, role, `/tickets/${ticket}`);
    const design = await context.newPage();
    await design.emulateMedia({ reducedMotion: "reduce" });
    await design.goto(`${designUrl}/02-tickets.html#${reference}`);
    await expect(
      design.getByText("Không gian làm việc / Yêu cầu hỗ trợ"),
    ).toBeVisible();
    const folder = path.resolve("../../docs/implementation/evidence/FE-06.01");
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await design.setViewportSize({ width, height: 1000 });
      await expect(page.getByRole("button", { name: "Lịch sử" })).toBeVisible();
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
