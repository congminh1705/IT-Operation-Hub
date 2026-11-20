import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
const evidence = path.resolve("../../docs/implementation/evidence/FE-04.04");
async function login(page: Page, role = "admin") {
  await page.goto("/login?returnTo=%2Fadmin%2Fteams");
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(page).toHaveURL(/\/admin\/teams$/);
}
const team = (page: Page) =>
  page.getByRole("combobox", { name: "Nhóm", exact: true });
const action = (page: Page) => page.getByRole("combobox", { name: "Thao tác" });
const review = (page: Page) =>
  page.getByRole("button", { name: "Xem tác động" }).press("Enter");
const save = (page: Page) => page.getByRole("button", { name: "Xác nhận lưu" });
test("intake stays unique and active; blocked transfer keeps assignments", async ({
  page,
}) => {
  await login(page);
  await expect(page.getByTestId("active-intake")).toHaveText("IT Support");
  await action(page).selectOption("clear-intake");
  await review(page);
  await expect(
    page.getByRole("alert").filter({ hasText: "đúng một nhóm" }),
  ).toBeVisible();
  await expect(save(page)).toBeDisabled();
  await team(page).selectOption("legacy");
  await action(page).selectOption("intake");
  await review(page);
  await expect(
    page.getByRole("alert").filter({ hasText: "nhóm đang hoạt động" }),
  ).toBeVisible();
  await team(page).selectOption("support");
  await action(page).selectOption("deactivate");
  await review(page);
  await expect(
    page.getByRole("alert").filter({ hasText: "Chuyển nhóm tiếp nhận" }),
  ).toBeVisible();
  await team(page).selectOption("infrastructure");
  await action(page).selectOption("intake");
  await review(page);
  await expect(
    page.getByRole("heading", { name: "Kiểm tra trước khi lưu" }),
  ).toBeFocused();
  await save(page).click();
  await expect(page.getByTestId("active-intake")).toHaveText("Infrastructure");
  await expect(
    page.getByRole("cell", { name: "Tiếp nhận mặc định", exact: true }),
  ).toHaveCount(1);
  await team(page).selectOption("support");
  await action(page).selectOption("deactivate");
  await review(page);
  await expect(
    page.getByRole("alert").filter({ hasText: "Cần bàn giao" }),
  ).toBeVisible();
  await expect(page.getByText(/TKT-000126/)).toBeVisible();
  await expect(save(page)).toBeDisabled();
  await page
    .locator(".workspace-sidebar")
    .getByRole("link", { name: "Danh mục", exact: true })
    .click();
  await expect(
    page.getByRole("cell", { name: "Infrastructure", exact: true }),
  ).toHaveCount(3);
});
test("membership only changes selected team and guards active work", async ({
  page,
}) => {
  await login(page);
  await action(page).selectOption("remove");
  await page
    .getByRole("combobox", { name: "Thành viên" })
    .selectOption({ label: "DEMO TECHNICIAN" });
  await review(page);
  await expect(save(page)).toBeDisabled();
  await expect(page.getByText(/TASK-DEMO-17/)).toBeVisible();
  await team(page).selectOption("infrastructure");
  await action(page).selectOption("remove");
  await page
    .getByRole("combobox", { name: "Thành viên" })
    .selectOption({ label: "DEMO TECHNICIAN" });
  await review(page);
  await save(page).click();
  await expect(
    page.getByRole("row", { name: /Infrastructure/ }),
  ).not.toContainText("DEMO TECHNICIAN");
  await expect(page.getByRole("row", { name: /IT Support/ })).toContainText(
    "DEMO TECHNICIAN",
  );
  await action(page).selectOption("add");
  await page
    .getByRole("combobox", { name: "Thành viên" })
    .selectOption({ label: "DEMO TECHNICIAN" });
  await review(page);
  await save(page).click();
  await expect(page.getByRole("row", { name: /Infrastructure/ })).toContainText(
    "DEMO TECHNICIAN",
  );
});
test("create, rename, and deactivate unused group without changing intake", async ({
  page,
}) => {
  await login(page);
  await page.getByRole("button", { name: "Thêm nhóm" }).click();
  await page.getByLabel("Tên nhóm").fill("Nhóm DEMO mới");
  await page.getByLabel("Phạm vi", { exact: true }).fill("Thiết bị");
  await review(page);
  await save(page).click();
  await team(page).selectOption({ label: "Nhóm DEMO mới" });
  await page.getByLabel("Tên nhóm").fill("Nhóm DEMO đã sửa");
  await review(page);
  await save(page).click();
  await expect(
    page.getByRole("row", { name: /Nhóm DEMO đã sửa/ }),
  ).toBeVisible();
  await action(page).selectOption("deactivate");
  await review(page);
  await save(page).click();
  await expect(
    page.getByRole("row", { name: /Nhóm DEMO đã sửa/ }),
  ).toContainText("Ngừng sử dụng");
  await expect(page.getByTestId("active-intake")).toHaveText("IT Support");
});
test("non-Admin cannot configure team membership", async ({ page }) => {
  await login(page, "technician");
  await expect(
    page.getByRole("heading", { name: "Bạn không có quyền truy cập" }),
  ).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Thao tác" })).toHaveCount(0);
});
test("teams reference and actual at desktop/mobile", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await login(page);
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
  if (process.env.ADMIN_DESIGN_URL) {
    await page.goto(
      `${process.env.ADMIN_DESIGN_URL}/final/08-admin-states.html?capture=1#teams`,
    );
    await page.locator("table").first().waitFor();
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.screenshot({
        path: path.join(evidence, `reference-${width}.png`),
        fullPage: true,
      });
    }
  }
});
