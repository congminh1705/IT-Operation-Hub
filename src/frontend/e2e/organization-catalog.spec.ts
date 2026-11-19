import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
const evidence = path.resolve("../../docs/implementation/evidence/FE-04.03");
async function login(page: Page, kind: string, role = "admin") {
  const route = "/admin/" + kind;
  await page.goto("/login?returnTo=" + encodeURIComponent(route));
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(page).toHaveURL(new RegExp(route + "$"));
}
for (const [kind, noun, existing, updated] of [
  ["departments", "phòng ban", "Kế toán", "Kế toán DEMO"],
  ["categories", "danh mục", "Tài khoản", "Tài khoản DEMO"],
]) {
  test(`${kind}: create, validation, edit, cancel and preserve references on deactivation`, async ({
    page,
  }) => {
    await login(page, kind);
    const choice = page.getByRole("combobox", {
      name: "Lựa chọn cho yêu cầu mới (DEMO)",
    });
    const history = page.getByTestId("catalog-history");
    await expect(history).toContainText(existing);
    await page
      .getByRole("button", { name: "Thêm " + noun, exact: true })
      .press("Enter");
    const label = page.getByLabel("Tên", { exact: true });
    const save = page.getByRole("button", { name: "Lưu", exact: true });
    await expect(label).toBeFocused();
    await save.click();
    await expect(
      page.getByRole("alert").filter({ hasText: "Nhập tên" }),
    ).toBeVisible();
    await label.fill(" " + existing.toLocaleUpperCase("vi") + " ");
    if (kind === "departments")
      await page.getByLabel("Mã", { exact: true }).fill("DEMO");
    await save.click();
    await expect(
      page.getByRole("alert").filter({ hasText: "Tên đã tồn tại" }),
    ).toBeVisible();
    await label.fill("Điều phối DEMO");
    await save.click();
    await expect(
      page.getByRole("row", { name: /Điều phối DEMO/ }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Sửa " + existing, exact: true })
      .click();
    await label.fill(updated);
    await save.click();
    await expect(history).toContainText(updated);
    await page
      .getByRole("button", { name: "Ngừng sử dụng " + updated, exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Ngừng sử dụng " + updated + "?" }),
    ).toBeFocused();
    await page.getByRole("button", { name: "Hủy", exact: true }).click();
    await expect(
      choice.getByRole("option", { name: updated, exact: true }),
    ).toHaveCount(1);
    await page
      .getByRole("button", { name: "Ngừng sử dụng " + updated, exact: true })
      .click();
    await page
      .getByRole("button", { name: "Xác nhận ngừng sử dụng", exact: true })
      .click();
    await expect(
      choice.getByRole("option", { name: updated, exact: true }),
    ).toHaveCount(0);
    await expect(history).toContainText(updated + " · Ngừng sử dụng");
    await expect(
      page.getByRole("row", { name: new RegExp(updated) }),
    ).toContainText("Ngừng sử dụng");
    if (kind === "departments") {
      await page
        .locator(".workspace-sidebar")
        .getByRole("link", { name: "Người dùng", exact: true })
        .click();
      await page
        .getByRole("link", { name: "Tạo người dùng", exact: true })
        .click();
      await expect(
        page
          .getByRole("combobox", { name: "Phòng ban" })
          .getByRole("option", { name: updated, exact: true }),
      ).toHaveCount(0);
    }
  });
  test(`${kind}: non-Admin receives forbidden`, async ({ page }) => {
    await login(page, kind, "requester");
    await expect(
      page.getByRole("heading", { name: "Bạn không có quyền truy cập" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Thêm " + noun, exact: true }),
    ).toHaveCount(0);
  });
}
test("catalog reference and app at desktop and mobile widths", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await login(page, "departments");
  for (const [kind, nav] of [
    ["departments", "Phòng ban"],
    ["categories", "Danh mục"],
  ]) {
    await page
      .getByRole("navigation", { name: "Cấu hình tổ chức" })
      .getByRole("link", { name: nav, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(kind + "$"));
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: path.join(evidence, `actual-${kind}-${width}.png`),
        fullPage: true,
      });
    }
  }
  if (process.env.ADMIN_DESIGN_URL)
    for (const kind of ["departments", "categories"]) {
      await page.goto(
        `${process.env.ADMIN_DESIGN_URL}/final/08-admin-states.html?capture=1#${kind}`,
      );
      await page.locator("table").first().waitFor();
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.screenshot({
          path: path.join(evidence, `reference-${kind}-${width}.png`),
          fullPage: true,
        });
      }
    }
});
