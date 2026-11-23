import { expect, test } from "@playwright/test";
import path from "node:path";
import { loginMonitoring } from "./monitoring-helpers";

const base = process.env.PHASE_A_DESIGN_URL;
const evidence = path.resolve("../../docs/implementation/evidence/FE-18.02");

test("login retains keyboard access while pausing or reducing effects", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/login");
  const motion = page.getByRole("button", { name: "Tạm dừng hiệu ứng" });
  await motion.press("Enter");
  await expect(page.locator(".access-page")).toHaveClass(/scene-still/);
  await expect(
    page.getByRole("button", { name: "Bật hiệu ứng" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(".access-page")).not.toHaveClass(/scene-still/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.getByRole("button", { name: "Đã giảm chuyển động" }),
  ).toBeDisabled();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.locator("#access-submit")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.evaluate(() => {
    document.documentElement.style.zoom = "2";
  });
  await page.locator("#login-email").focus();
  await page.keyboard.press("Tab");
  await expect(page.locator("#login-password")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#access-toggle")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#access-submit")).toBeFocused();
});

test("two real app tabs isolate mock sessions and mutations without service calls", async ({
  page,
  context,
}) => {
  const requests: string[] = [];
  context.on("request", (request) => {
    if (
      ["xhr", "fetch"].includes(request.resourceType()) &&
      !request.headers().rsc
    )
      requests.push(new URL(request.url()).pathname);
  });
  const second = await context.newPage();
  await loginMonitoring(page, "requester", "/profile");
  await loginMonitoring(second, "admin", "/profile");
  await expect(page.locator("#profile-name")).toHaveValue("DEMO REQUESTER");
  await expect(second.locator("#profile-name")).toHaveValue("DEMO ADMIN");
  await page.locator("#profile-name").fill("DEMO FE-18");
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Tài khoản: DEMO FE-18" }),
  ).toBeVisible();
  await expect(second.locator("#profile-name")).toHaveValue("DEMO ADMIN");
  await second.getByRole("link", { name: "Tất cả ticket" }).click();
  await expect(
    second.getByRole("heading", { name: "Hàng chờ hỗ trợ" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Yêu cầu của tôi" }).click();
  await expect(
    page.getByRole("heading", { name: "Yêu cầu của bạn" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => [localStorage.length, sessionStorage.length]),
  ).toEqual([0, 0]);
  expect(await context.cookies()).toEqual([]);
  expect(requests).toEqual([]);
});

test("record matching login and shared feedback evidence", async ({
  page,
  context,
}) => {
  test.skip(!base, "Approved HTML reference server required");
  const design = await context.newPage();
  for (const [name, route, reference] of [
    ["login", "/login", "/login.html"],
    ["states", "/preview/feedback", "/08-admin-states.html#states"],
  ]) {
    for (const width of [1440, 390]) {
      for (const [kind, target, url] of [
        ["actual", page, route],
        ["reference", design, base + reference],
      ] as const) {
        await target.setViewportSize({ width, height: 1000 });
        await target.emulateMedia({ reducedMotion: "reduce" });
        await target.goto(url);
        await expect(target.getByRole("heading", { level: 1 })).toBeVisible();
        await target.evaluate(() => document.fonts.ready);
        await target.screenshot({
          path: path.join(evidence, `${kind}-${name}-${width}.png`),
          fullPage: true,
        });
      }
    }
  }
});
