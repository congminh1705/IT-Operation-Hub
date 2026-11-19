import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
const evidence = path.resolve("../../docs/implementation/evidence/FE-03.02");
const roles = ["REQUESTER", "TECHNICIAN", "IT_MANAGER", "ADMIN"] as const;
async function login(page: Page, role = "REQUESTER", target = "/dashboard") {
  await page.goto(`/login?returnTo=${encodeURIComponent(target)}`);
  await page.locator("#login-email").fill(`${role.toLowerCase()}@demo.invalid`);
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
}
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});
for (const role of roles)
  test(`login and scoped navigation: ${role}`, async ({ page }) => {
    await login(page, role, "/tickets?scope=work&role=ADMIN");
    await expect(page).toHaveURL(/\/tickets\?scope=work$/);
    await expect(
      page.locator(".workspace-sidebar .shell-account-summary"),
    ).toContainText(`DEMO ${role}`);
    await expect(
      page.locator(".workspace-sidebar a[href='/admin/users']"),
    ).toHaveCount(role === "ADMIN" ? 1 : 0);
    await expect(
      page.locator(".workspace-sidebar a[href='/reports']"),
    ).toHaveCount(["IT_MANAGER", "ADMIN"].includes(role) ? 1 : 0);
    await expect(page.locator("[data-effective-scope]")).toHaveAttribute(
      "data-effective-scope",
      role === "REQUESTER" ? "mine" : "work",
    );
    await page.getByRole("button", { name: /^Tài khoản:/ }).click();
    await page.getByRole("link", { name: "Đăng xuất", exact: true }).click();
    await expect(page).toHaveURL(/\/login\?/);
    await expect(page.locator(".workspace-sidebar")).toHaveCount(0);
    await page.goBack();
    await expect(page.locator(".workspace-sidebar")).toHaveCount(0);
  });
test("protected direct URL has no private server HTML or hydrated flash", async ({
  page,
  request,
}) => {
  const response = await request.get("/admin/users");
  expect(await response.text()).not.toContain("DEMO ADMIN");
  await page.addInitScript(() => {
    const seen: string[] = [];
    Object.assign(window, { privateFlashes: seen });
    new MutationObserver(() => {
      if (document.querySelector(".workspace-sidebar")) seen.push("private");
    }).observe(document, { subtree: true, childList: true });
  });
  await page.goto("/tickets?scope=mine&q=demo");
  await expect(page).toHaveURL(/\/login\?returnTo=/);
  expect(
    await page.evaluate(() => Reflect.get(window, "privateFlashes")),
  ).toEqual([]);
  await page.locator("#login-email").fill("requester@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(page).toHaveURL(/\/tickets\?scope=mine&q=demo$/);
  await page.reload();
  await expect(page).toHaveURL(/\/login\?/);
});
for (const target of [
  "https://evil.invalid",
  "//evil.invalid",
  "/%2f%2fevil.invalid",
  "javascript:alert(1)",
  "/logout",
  "/dashboard?role=ADMIN&userId=other",
])
  test(`unsafe return rejected: ${target}`, async ({ page }) => {
    await login(page, "REQUESTER", target);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.locator(".workspace-sidebar")).toContainText(
      "DEMO REQUESTER",
    );
  });
test("forbidden function and generic missing/out-of-scope routes", async ({
  page,
}) => {
  await login(page, "REQUESTER", "/admin/users");
  await expect(
    page.getByRole("heading", { name: "Bạn không có quyền truy cập" }),
  ).toBeVisible();
  for (const fixture of ["Missing fixture", "Out-of-scope fixture"]) {
    await page.goto("/preview/session");
    await page.getByRole("button", { name: "REQUESTER", exact: true }).click();
    await page.getByRole("link", { name: fixture, exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Không tìm thấy nội dung" }),
    ).toBeVisible();
    await expect(
      page.getByText("Nội dung không tồn tại hoặc bạn không có quyền xem."),
    ).toBeVisible();
  }
});
for (const action of ["Expire", "Revoke", "Logout", "Query 401"])
  test(`${action} clears private DOM/cache and late results cannot restore it`, async ({
    page,
  }) => {
    await page.goto("/preview/session");
    await page.getByRole("button", { name: "REQUESTER", exact: true }).click();
    await page
      .getByRole("button", { name: "Load private query", exact: true })
      .click();
    await expect(page.getByTestId("private")).toContainText(
      "PRIVATE DEMO RESULT",
    );
    await page
      .getByRole("button", { name: "Start late query", exact: true })
      .click();
    await expect(page.getByTestId("cache")).toHaveText("pending");
    await page.getByRole("button", { name: action, exact: true }).click();
    await expect(page.getByTestId("private")).toHaveCount(0);
    await expect(page.getByTestId("cache")).toHaveText("idle");
    await page
      .getByRole("button", { name: "Resolve late query", exact: true })
      .click();
    await expect(page.getByTestId("cache")).toHaveText("idle");
    await page.getByRole("link", { name: "Open workspace" }).click();
    await expect(page).toHaveURL(/\/login\?/);
  });
for (const next of ["REQUESTER", "ADMIN"])
  test(`late previous query cannot enter new ${next} session`, async ({
    page,
  }) => {
    await page.goto("/preview/session");
    await page.getByRole("button", { name: "REQUESTER", exact: true }).click();
    await page
      .getByRole("button", { name: "Start late query", exact: true })
      .click();
    await expect(page.getByTestId("cache")).toHaveText("pending");
    await page.getByRole("button", { name: next, exact: true }).click();
    await page
      .getByRole("button", { name: "Resolve late query", exact: true })
      .click();
    await expect(page.getByTestId("cache")).toHaveText("idle");
    await expect(page.getByTestId("private")).not.toContainText("STALE");
    await page
      .getByRole("button", { name: "Load private query", exact: true })
      .click();
    await expect(page.getByTestId("cache")).toHaveText("success");
  });
test("permission change clears previous scope and changes shell", async ({
  page,
}) => {
  await page.goto("/preview/session");
  await page.getByRole("button", { name: "TECHNICIAN", exact: true }).click();
  await page
    .getByRole("button", { name: "Load private query", exact: true })
    .click();
  await expect(page.getByTestId("cache")).toHaveText("success");
  await page
    .getByRole("button", { name: "Change permission", exact: true })
    .click();
  await expect(page.getByTestId("persona")).toHaveText("REQUESTER");
  await expect(page.getByTestId("cache")).toHaveText("idle");
  await page.getByRole("link", { name: "Open workspace" }).click();
  await expect(page.locator(".workspace-sidebar a[href^='/work']")).toHaveCount(
    0,
  );
});
test("approved password eye preserves selection, icon and transparent hover", async ({
  page,
}) => {
  await page.goto("/login");
  const password = page.locator("#login-password"),
    toggle = page.locator("#access-toggle");
  await password.fill("throwaway-demo");
  await password.evaluate((el: HTMLInputElement) => {
    el.focus();
    el.setSelectionRange(2, 7);
  });
  const icon = await toggle.locator("path").getAttribute("d");
  await toggle.hover();
  expect(
    await toggle.evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgba(0, 0, 0, 0)");
  await toggle.click();
  await expect(password).toHaveAttribute("type", "text");
  await expect(password).toBeFocused();
  expect(
    await password.evaluate((el: HTMLInputElement) => [
      el.selectionStart,
      el.selectionEnd,
    ]),
  ).toEqual([2, 7]);
  expect(await toggle.locator("path").getAttribute("d")).not.toBe(icon);
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(password).toHaveAttribute("type", "password");
  expect(await toggle.locator("path").getAttribute("d")).toBe(icon);
});
test("reference/actual desktop and mobile evidence", async ({ page }) => {
  fs.mkdirSync(evidence, { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("http://127.0.0.1:8010/final/login.html");
    await page.locator("#login-email").waitFor();
    await page.screenshot({
      path: path.join(evidence, `reference-login-${width}.png`),
      fullPage: true,
    });
    await page.goto("/login");
    await page.locator("#login-email").waitFor();
    await page.screenshot({
      path: path.join(evidence, `actual-login-${width}.png`),
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await login(page);
    await expect(page.locator(".workspace-topbar")).toBeVisible();
    await page.screenshot({
      path: path.join(evidence, `actual-workspace-${width}.png`),
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.goto(
      "http://127.0.0.1:8010/final/dashboard.html?role=requester",
    );
    await page
      .frameLocator("iframe")
      .locator("#sidebar")
      .waitFor({ state: "attached" });
    for (const frame of page.frames())
      await frame.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: path.join(evidence, `reference-workspace-${width}.png`),
      fullPage: true,
    });
  }
});

for (const action of ["Expire", "Revoke"])
  test(`${action} removes the real workspace and offers safe re-entry`, async ({
    page,
  }) => {
    await page.goto("/preview/session");
    await page.getByRole("button", { name: "ADMIN", exact: true }).click();
    await page
      .getByRole("button", { name: `${action} after navigation`, exact: true })
      .click();
    await page.getByRole("link", { name: "Open workspace" }).click();
    await expect(page.locator(".workspace-sidebar")).toBeVisible();
    await expect(page).toHaveURL(/\/login\?returnTo=%2Fdashboard$/);
    await expect(page.locator(".workspace-sidebar")).toHaveCount(0);
    await expect(page.getByText("DEMO ADMIN", { exact: true })).toHaveCount(0);
    await page.locator("#login-email").fill("requester@demo.invalid");
    await page.locator("#login-password").fill("demo");
    await page.locator("#access-submit").click();
    await expect(page.locator(".workspace-sidebar")).toContainText(
      "DEMO REQUESTER",
    );
  });
