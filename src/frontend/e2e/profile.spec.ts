import { expect, test } from "@playwright/test";
import path from "node:path";

const evidence = path.resolve("../../docs/implementation/evidence/FE-03.03");

test("own save updates shell, forged query is ignored, cancel and invalid feedback preserve saved data", async ({
  page,
}) => {
  await page.goto("/login?returnTo=%2Fprofile%3FuserId%3Dother%26role%3DADMIN");
  await page.locator("#login-email").fill("requester@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(page).toHaveURL(/\/profile$/);
  const name = page.locator("#profile-name");
  await expect(name).toHaveValue("DEMO REQUESTER");
  await expect(page.locator("#profile-email")).toHaveAttribute("readonly", "");
  await name.fill("   ");
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await expect(name).toBeFocused();
  await expect(name).toHaveValue("   ");
  await expect(
    page.getByRole("alert").filter({ hasText: "120 ký tự" }),
  ).toBeVisible();
  await name.fill("DEMO Hồ sơ đã lưu");
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await expect(page.getByText("Đã lưu hồ sơ.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Tài khoản: DEMO Hồ sơ đã lưu" }),
  ).toBeVisible();
  await name.fill("Tên chưa lưu");
  await page.getByRole("button", { name: "Hủy", exact: true }).click();
  await expect(name).toHaveValue("DEMO Hồ sơ đã lưu");
});

for (const scenario of ["Profile conflict", "Profile network error"])
  test(scenario, async ({ page }) => {
    await page.goto("/preview/session");
    await page.getByRole("button", { name: "REQUESTER", exact: true }).click();
    await page.getByRole("button", { name: scenario }).click();
    await page
      .getByRole("link", { name: "Open profile with forged query" })
      .click();
    const name = page.locator("#profile-name");
    await expect(name).toHaveValue("DEMO REQUESTER");
    await name.fill("DEMO Draft");
    await page.getByRole("button", { name: "Lưu thay đổi" }).click();
    await expect(page.locator(".profile-form [role=alert]")).toBeFocused();
    await expect(name).toHaveValue("DEMO Draft");
    await expect(
      page.getByRole("button", { name: "Tài khoản: DEMO REQUESTER" }),
    ).toBeVisible();
    if (scenario === "Profile conflict") {
      await page.getByRole("button", { name: "Tải lại hồ sơ" }).click();
      await expect(
        page.getByText(/Tên hiện tại: DEMO REQUESTER/),
      ).toBeVisible();
      await expect(name).toHaveValue("DEMO Draft");
      await expect(
        page.getByRole("button", { name: "Lưu thay đổi" }),
      ).toBeEnabled();
    }
  });

test("profile desktop/mobile reference and actual", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/login?returnTo=%2Fprofile");
  await page.locator("#login-email").fill("requester@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(page.locator("#profile-name")).toBeVisible();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.screenshot({
      path: path.join(evidence, `actual-${width}.png`),
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto(
    "http://127.0.0.1:8010/final/01-account.html?capture=1#profile",
  );
  await page.locator("#display-name").waitFor();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.screenshot({
      path: path.join(evidence, `reference-${width}.png`),
      fullPage: true,
    });
  }
});
