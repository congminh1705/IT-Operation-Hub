import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
const list = "/admin/users";
const create = list + "/new";
const evidence = path.resolve("../../docs/implementation/evidence/FE-04.01");
async function login(page: Page, role: string, target = list) {
  await page.goto("/login?returnTo=" + encodeURIComponent(target));
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(page).toHaveURL(new RegExp(target + "$"));
}
async function fill(
  page: Page,
  reference = "TKT-000123",
  email = "demo-b@example.invalid",
) {
  await page.getByLabel("Mã yêu cầu đã xác minh").fill(reference);
  await page.getByLabel("Họ và tên").fill("Nhân viên DEMO B");
  await page.getByLabel("Email công việc").fill(email);
  await page.getByLabel("Mật khẩu ban đầu").fill("demo-only-secret");
}
const preview = (page: Page) =>
  page.getByRole("button", { name: "Xem trước thông tin tài khoản" });
for (const role of ["requester", "technician", "it_manager"])
  test(`${role} cannot open admin create even by direct return`, async ({
    page,
  }) => {
    await login(page, role, create);
    await expect(
      page.getByRole("heading", { name: "Bạn không có quyền truy cập" }),
    ).toBeVisible();
    await expect(page.getByLabel("Mật khẩu ban đầu")).toHaveCount(0);
  });
test("search, status, rejected reference, duplicate, preview, cancel and explicit save", async ({
  page,
}) => {
  await login(page, "admin");
  await expect(page.getByRole("table")).toBeVisible();
  const filter = page.getByRole("searchbox", {
    name: "Tìm tên hoặc email công việc",
  });
  await filter.fill("nhan vien demo da khoa");
  await expect(page.getByRole("row")).toHaveCount(2);
  await page.getByLabel("Lọc trạng thái").selectOption("active");
  await expect(
    page.getByRole("status").filter({ hasText: "Không có người dùng phù hợp" }),
  ).toBeVisible();
  const open = () =>
    page.getByRole("link", { name: "Tạo người dùng", exact: true }).click();
  await open();
  await expect(page.getByLabel("Vai trò", { exact: true })).toHaveValue(
    "REQUESTER",
  );
  await expect(page.getByLabel("Mật khẩu ban đầu")).toHaveValue("");
  await fill(page, "TKT-000125", "ADMIN@demo.invalid");
  await preview(page).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "đã tồn tại" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email công việc")).toBeFocused();
  await fill(page, "TKT-000125");
  await preview(page).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "chưa được xác minh" }),
  ).toBeVisible();
  await expect(page.getByLabel("Mã yêu cầu đã xác minh")).toBeFocused();
  await fill(page);
  await preview(page).click();
  await expect(
    page.getByRole("heading", { name: "Xác nhận tạo tài khoản DEMO" }),
  ).toBeFocused();
  await expect(page.locator(".directory-preview")).not.toContainText(
    "demo-only-secret",
  );
  await page.getByRole("link", { name: "Hủy", exact: true }).click();
  await expect(
    page.getByText("demo-b@example.invalid", { exact: true }),
  ).toHaveCount(0);
  await open();
  await expect(page.getByLabel("Mật khẩu ban đầu")).toHaveValue("");
  await fill(page);
  await preview(page).click();
  await page.getByRole("button", { name: "Xác nhận tạo", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Đã tạo người dùng DEMO" }),
  ).toBeFocused();
  await expect(page.getByLabel("Mật khẩu ban đầu")).toHaveCount(0);
  await page.getByRole("link", { name: "Về danh sách" }).click();
  await expect(
    page.getByText("demo-b@example.invalid", { exact: true }),
  ).toBeVisible();
  await open();
  await fill(page);
  await preview(page).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "đã tồn tại" }),
  ).toBeVisible();
});
test("admin reference and actual at desktop and mobile widths", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await login(page, "admin");
  for (const [screen, selector] of [
    ["users", ".directory-table"],
    ["user-create", ".directory-grid"],
  ]) {
    await page.locator(selector).waitFor();
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: path.join(evidence, `actual-${screen}-${width}.png`),
        fullPage: true,
      });
    }
    if (screen === "users")
      await page
        .getByRole("link", { name: "Tạo người dùng", exact: true })
        .click();
  }
  const design = process.env.ADMIN_DESIGN_URL;
  if (design)
    for (const [screen, selector] of [
      ["users", "table"],
      ["user-create", "#user-name"],
    ]) {
      await page.goto(
        `${design}/final/08-admin-states.html?capture=1#${screen}`,
      );
      await page.locator(selector).first().waitFor();
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.screenshot({
          path: path.join(evidence, `reference-${screen}-${width}.png`),
          fullPage: true,
        });
      }
    }
});
