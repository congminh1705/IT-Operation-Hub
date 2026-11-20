import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
const evidence = path.resolve("../../docs/implementation/evidence/FE-04.05");
async function login(page: Page, role = "admin") {
  await page.goto("/login?returnTo=%2Fadmin%2Fsla");
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(page).toHaveURL(/\/admin\/sla$/);
}
test("invalid budgets preserve draft, cancel preserves version, confirm only updates new ticket", async ({
  page,
}) => {
  await login(page);
  const response = page.getByRole("spinbutton", {
    name: "Phản hồi đầu (phút)",
  });
  const resolution = page.getByRole("spinbutton", {
    name: "Giải quyết (phút)",
  });
  const reason = page.getByLabel("Lý do thay đổi");
  const preview = page.getByRole("button", { name: "Xem trước phiên bản mới" });
  const old = page.getByTestId("sla-old-ticket");
  const next = page.getByTestId("sla-new-ticket");
  const oldText = await old.innerText();
  await reason.fill("Kiểm tra DEMO");
  await response.fill("0");
  await preview.press("Enter");
  await expect(page.locator("#sla-error")).toContainText("lớn hơn 0");
  await expect(response).toBeFocused();
  await expect(reason).toHaveValue("Kiểm tra DEMO");
  await expect(response).toHaveValue("0");
  await response.fill("75");
  await resolution.fill("-1");
  await preview.click();
  await expect(resolution).toBeFocused();
  await resolution.fill("540");
  await preview.click();
  await expect(
    page.getByRole("heading", { name: "Xem trước v3 → v4" }),
  ).toBeFocused();
  await expect(
    page.getByRole("region", { name: "So sánh ngân sách" }),
  ).toContainText("60 → 75");
  await expect(next).toContainText("v3 · 60/480");
  await page.getByRole("button", { name: "Hủy xem trước" }).press("Enter");
  await expect(preview).toBeFocused();
  await expect(response).toHaveValue("75");
  await expect(reason).toHaveValue("Kiểm tra DEMO");
  await preview.click();
  await page.getByRole("button", { name: "Xác nhận lưu" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Đã lưu phiên bản v4 DEMO." }),
  ).toBeVisible();
  await expect(old).toHaveText(oldText);
  await expect(next).toContainText("v4 · 75/540");
  await expect(page.getByText("v3 · Chỉ đọc")).toBeVisible();
  await expect(page.getByText(/DEMO ADMIN.*Kiểm tra DEMO/)).toBeVisible();
  await preview.click();
  await expect(page.locator("#sla-error")).toContainText(
    "Nhập lý do thay đổi.",
  );
});
test("non-Admin cannot edit SLA", async ({ page }) => {
  await login(page, "it_manager");
  await expect(
    page.getByRole("heading", { name: "Bạn không có quyền truy cập" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Xem trước phiên bản mới" }),
  ).toHaveCount(0);
});
test("SLA form desktop and mobile captures", async ({ page }) => {
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
      `${process.env.ADMIN_DESIGN_URL}/final/08-admin-states.html?capture=1#sla`,
    );
    await page.locator("#sla-priority").waitFor();
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.screenshot({
        path: path.join(evidence, `reference-${width}.png`),
        fullPage: true,
      });
    }
  }
});
