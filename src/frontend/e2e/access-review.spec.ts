import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
const evidence = path.resolve("../../docs/implementation/evidence/FE-04.02");
async function login(page: Page, role = "admin") {
  await page.goto("/login?returnTo=%2Fadmin%2Fusers");
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(page).toHaveURL(/\/admin\/users$/);
}
const open = (page: Page, name: string) =>
  page
    .getByRole("button", { name: "Xem tác động: " + name, exact: true })
    .press("Enter");
const kind = (page: Page) => page.getByRole("combobox", { name: "Thao tác" });
const impact = (page: Page) =>
  page
    .getByRole("button", { name: "Xem tác động", exact: true })
    .press("Enter");
test("last Admin and self-lock are blocked; closing returns focus", async ({
  page,
}) => {
  await login(page);
  await open(page, "DEMO ADMIN");
  await expect(
    page.getByRole("heading", { name: "Xem trước thay đổi quyền" }),
  ).toBeFocused();
  await kind(page).selectOption("lock");
  await impact(page);
  await expect(
    page.getByRole("heading", { name: "Tác động dự kiến" }),
  ).toBeFocused();
  await expect(
    page.getByText("Không thể tự khóa tài khoản đang đăng nhập."),
  ).toBeVisible();
  await expect(
    page.getByText("Phải giữ ít nhất một Admin đang hoạt động."),
  ).toBeVisible();
  await kind(page).selectOption("role");
  await page
    .getByRole("combobox", { name: "Vai trò mới" })
    .selectOption("REQUESTER");
  await impact(page);
  await expect(
    page.getByText("Phải giữ ít nhất một Admin đang hoạt động."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Đóng xem trước" }).press("Enter");
  await expect(
    page.getByRole("button", { name: "Xem tác động: DEMO ADMIN", exact: true }),
  ).toBeFocused();
  await expect(page.getByRole("row", { name: /DEMO ADMIN/ })).toContainText(
    "Đang hoạt động",
  );
});
test("handover and revocation show the correct fixture and never mutate rows", async ({
  page,
}) => {
  await login(page);
  await open(page, "DEMO IT_MANAGER");
  await kind(page).selectOption("department");
  await page
    .getByRole("combobox", { name: "Phòng ban mới" })
    .selectOption("Nhân sự");
  await impact(page);
  await expect(
    page.getByText(/Ứng viên bàn giao DEMO: DEMO TECHNICIAN/),
  ).toBeVisible();
  await expect(
    page.getByText(/Nếu áp dụng, phiên cũ sẽ bị thu hồi/),
  ).toBeVisible();
  await open(page, "DEMO TECHNICIAN");
  await kind(page).selectOption("lock");
  await page.getByRole("checkbox", { name: /thu hồi khẩn cấp/ }).check();
  await impact(page);
  await expect(
    page.getByText(/Quy trình bàn giao khi chưa có người thay thế/),
  ).toBeVisible();
  await expect(page.locator(".access-blocked")).toContainText(
    "chưa có người thay thế",
  );
  await expect(
    page.getByRole("row", { name: /DEMO TECHNICIAN/ }),
  ).toContainText("Đang hoạt động");
  await open(page, "Nhân viên DEMO đã khóa");
  await impact(page);
  await expect(
    page.getByText(/Mở khóa không khôi phục phiên cũ/),
  ).toBeVisible();
  await expect(
    page.getByRole("row", { name: /Nhân viên DEMO đã khóa/ }),
  ).toContainText("Đã khóa");
});
test("non-Admin cannot review access", async ({ page }) => {
  await login(page, "requester");
  await expect(
    page.getByRole("heading", { name: "Bạn không có quyền truy cập" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Xem tác động/ })).toHaveCount(
    0,
  );
});
test("matching desktop and mobile evidence for directory and review", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await login(page);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.screenshot({
      path: path.join(evidence, `actual-users-${width}.png`),
      fullPage: true,
    });
    await open(page, "DEMO TECHNICIAN");
    await kind(page).selectOption("lock");
    await page.getByRole("checkbox", { name: /thu hồi khẩn cấp/ }).check();
    await impact(page);
    await expect(
      page.getByRole("heading", { name: "Tác động dự kiến" }),
    ).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: path.join(evidence, `actual-review-${width}.png`),
      fullPage: true,
    });
    await page.getByRole("button", { name: "Đóng xem trước" }).press("Enter");
  }
  if (process.env.ADMIN_DESIGN_URL)
    for (const [key, screen, selector] of [
      ["users", "08-admin-states.html?capture=1#users", "table"],
      ["provision", "02-tickets.html?capture=1#provision", "main h1"],
    ]) {
      await page.goto(`${process.env.ADMIN_DESIGN_URL}/final/${screen}`);
      await page.locator(selector).first().waitFor();
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.screenshot({
          path: path.join(evidence, `reference-${key}-${width}.png`),
          fullPage: true,
        });
      }
    }
});
