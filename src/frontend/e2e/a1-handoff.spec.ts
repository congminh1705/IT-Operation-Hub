import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

const roles = ["ADMIN", "TECHNICIAN", "IT_MANAGER", "REQUESTER"] as const;
const evidence = path.resolve("../../docs/implementation/evidence/FE-03.05");

async function signIn(page: Page, email: string) {
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill("demo");
  await page.locator("#login-password").press("Enter");
  await expect(page.getByRole("button", { name: /^Tài khoản:/ })).toBeVisible();
}

async function accountAction(page: Page, name: string) {
  await page.getByRole("button", { name: /^Tài khoản:/ }).press("Enter");
  const menu = page.getByRole("navigation", { name: "Tài khoản", exact: true });
  await expect(
    menu.getByRole("link", { name: "Hồ sơ", exact: true }),
  ).toBeFocused();
  const steps = ["Hồ sơ", "Đổi mật khẩu", "Đăng xuất"];
  for (const label of steps.slice(1, steps.indexOf(name) + 1)) {
    await page.keyboard.press("Tab");
    await expect(
      menu.getByRole("link", { name: label, exact: true }),
    ).toBeFocused();
  }
  await page.keyboard.press("Enter");
}

async function fit(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}

for (const width of [1440, 390])
  test(`A1 four-role switching and keyboard journeys at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/login");
    for (const role of roles) {
      const email = `${role.toLowerCase()}@demo.invalid`;
      await signIn(page, email);
      await expect(
        page.getByRole("button", { name: `Tài khoản: DEMO ${role}` }),
      ).toBeVisible();
      await expect(
        page.locator(".workspace-sidebar a[href='/admin/users']"),
      ).toHaveCount(role === "ADMIN" ? 1 : 0);
      await accountAction(page, "Hồ sơ");
      await expect(page.locator("#profile-name")).toHaveValue(`DEMO ${role}`);
      await expect(page.locator("#profile-email")).toHaveValue(email);
      await fit(page);
      if (role === "REQUESTER")
        await page.screenshot({
          path: path.join(evidence, `actual-profile-${width}.png`),
          fullPage: true,
        });
      await page.locator("#profile-name").fill(`DEMO A1 ${role}`);
      await page
        .getByRole("button", { name: "Lưu thay đổi", exact: true })
        .press("Enter");
      await expect(
        page.getByRole("button", { name: `Tài khoản: DEMO A1 ${role}` }),
      ).toBeVisible();
      await accountAction(page, "Đổi mật khẩu");
      await expect(page.locator("#old-password")).toBeVisible();
      await fit(page);
      await page.locator("#old-password").fill("demo-old");
      await page.locator("#new-password").fill("demo-new");
      await page.locator("#confirm-password").fill("different");
      await page
        .getByRole("button", { name: "Đổi mật khẩu DEMO", exact: true })
        .press("Enter");
      await expect(page.locator("#confirm-password")).toBeFocused();
      await accountAction(page, "Đăng xuất");
      await expect(page).toHaveURL(/\/login\?/);
      await expect(page.locator("#login-password")).toHaveValue("");
      await expect(page.locator(".workspace-sidebar")).toHaveCount(0);
      await page.goBack();
      await expect(page).toHaveURL(/\/login\?/);
      await expect(page.locator("#old-password")).toHaveCount(0);
      await fit(page);
    }
    await page.screenshot({
      path: path.join(evidence, `actual-login-${width}.png`),
      fullPage: true,
    });
    await signIn(page, "admin@demo.invalid");
    await accountAction(page, "Hồ sơ");
    await expect(page.locator("#profile-name")).toHaveValue("DEMO ADMIN");
    const reference = process.env.A1_DESIGN_URL;
    if (reference) {
      for (const [screen, url, selector] of [
        ["login", "login.html", "#login-email"],
        ["profile", "01-account.html?capture=1#profile", "#display-name"],
      ]) {
        await page.goto(`${reference}/final/${url}`);
        await page.locator(selector).waitFor();
        await page.screenshot({
          path: path.join(evidence, `reference-${screen}-${width}.png`),
          fullPage: true,
        });
      }
    }
  });
