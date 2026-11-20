import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
const evidence = path.resolve("../../docs/implementation/evidence/FE-05.01");
async function login(page: Page, role: string, query = "scope=work") {
  await page.goto("/login?returnTo=" + encodeURIComponent("/tickets?" + query));
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(page.locator(".workspace-sidebar")).toBeAttached();
}
for (const [role, count] of [
  ["requester", 4],
  ["technician", 22],
  ["it_manager", 26],
  ["admin", 26],
] as const)
  test(`${role} receives ${count} scoped rows`, async ({ page }) => {
    await login(page, role, "scope=work&size=50&role=ADMIN");
    await expect(page.locator(".ticket-list-table tbody tr")).toHaveCount(
      count,
    );
    await expect(page).not.toHaveURL(/role=/);
    if (role === "requester")
      await expect(
        page.getByRole("navigation", { name: "Phạm vi yêu cầu" }),
      ).toHaveCount(0);
    if (role === "technician")
      await expect(page.getByText("Field DEMO", { exact: true })).toHaveCount(
        0,
      );
  });
test("URL sorting, tie-breaker, paging and back/filter restoration", async ({
  page,
}) => {
  await login(page, "admin", "scope=work&sort=priority");
  const rows = page.locator(".ticket-list-table tbody tr");
  await expect(rows.first()).toContainText("TKT-000126");
  await expect(rows.nth(1)).toContainText("TKT-000130");
  await page.getByRole("link", { name: "Trang sau" }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(rows).toHaveCount(6);
  await page.goBack();
  await expect(rows).toHaveCount(20);
  const filters = page.locator(".ticket-list-filters");
  await filters.getByLabel("Ưu tiên", { exact: true }).selectOption("P4");
  await filters.getByRole("button", { name: "Áp dụng" }).click();
  await expect(page).toHaveURL(/priority=P4/);
  await expect(rows).toHaveCount(6);
  await filters.getByRole("link", { name: "Đặt lại" }).click();
  await expect(rows).toHaveCount(20);
  await page.goBack();
  await expect(filters.getByLabel("Ưu tiên", { exact: true })).toHaveValue(
    "P4",
  );
  await expect(rows).toHaveCount(6);
});
test("empty query and mock error stay distinct; retry preserves query", async ({
  page,
}) => {
  await login(page, "requester", "scope=mine&q=not-found-demo");
  await expect(
    page.getByRole("heading", { name: "Không có kết quả phù hợp" }),
  ).toBeVisible();
  await login(page, "requester", "scope=mine&q=VPN&demo=unavailable");
  await expect(page.locator('[data-kind="error"]')).toBeVisible();
  await page.getByRole("button", { name: "Thử lại" }).click();
  await expect(page.locator(".ticket-list-table tbody tr")).toHaveCount(1);
  await expect(page).toHaveURL(/q=VPN/);
});
test("desktop/mobile references and actual list scope pair", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [role, screen] of [
    ["it_manager", "tickets"],
    ["requester", "my-tickets"],
  ]) {
    await login(page, role);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: path.join(evidence, `actual-${screen}-${width}.png`),
        fullPage: false,
      });
    }
    if (process.env.TICKET_DESIGN_URL) {
      await page.goto(
        `${process.env.TICKET_DESIGN_URL}/final/02-tickets.html?capture=1#${screen}`,
      );
      await page.locator("table").first().waitFor();
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.screenshot({
          path: path.join(evidence, `reference-${screen}-${width}.png`),
          fullPage: false,
        });
      }
    }
  }
});
