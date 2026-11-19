import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

const route = "/profile/security";
const evidence = path.resolve("../../docs/implementation/evidence/FE-03.04");
async function open(page: Page, scenario?: string) {
  if (scenario) {
    await page.goto("/preview/session");
    await page.getByRole("button", { name: "REQUESTER", exact: true }).click();
    await page.getByRole("button", { name: scenario, exact: true }).click();
    await page.getByRole("link", { name: "Open password form" }).click();
  } else {
    await page.goto("/login?returnTo=%2Fprofile%2Fsecurity");
    await page.locator("#login-email").fill("requester@demo.invalid");
    await page.locator("#login-password").fill("demo");
    await page.locator("#access-submit").click();
  }
  await expect(page).toHaveURL(new RegExp(route + "$"));
}
async function fill(page: Page, confirmation = "demo-next") {
  await page.locator("#old-password").fill("demo-current");
  await page.locator("#new-password").fill("demo-next");
  await page.locator("#confirm-password").fill(confirmation);
}
const submit = (page: Page) =>
  page.getByRole("button", { name: "Đổi mật khẩu DEMO", exact: true });
test("invalid, mismatch, independent visibility, cancel and route exit", async ({
  page,
}) => {
  await open(page);
  await expect(page.locator("#old-password")).toHaveAttribute(
    "autocomplete",
    "current-password",
  );
  await expect(page.locator("#new-password")).toHaveAttribute(
    "autocomplete",
    "new-password",
  );
  await submit(page).click();
  await expect(page.locator("#old-password")).toBeFocused();
  await fill(page, "mismatch");
  await page
    .getByRole("button", { name: "Hiện mật khẩu mới", exact: true })
    .click();
  await expect(page.locator("#new-password")).toHaveAttribute("type", "text");
  await expect(page.locator("#confirm-password")).toHaveAttribute(
    "type",
    "password",
  );
  await submit(page).click();
  await expect(page.locator("#confirm-password")).toBeFocused();
  await expect(page.locator("#password-error")).toContainText("chưa khớp");
  await page.getByRole("link", { name: "Hủy", exact: true }).click();
  await page.getByRole("link", { name: "Đổi mật khẩu", exact: true }).click();
  await expect(page.locator("#new-password")).toHaveValue("");
  await fill(page);
  await page
    .locator(".workspace-sidebar")
    .getByRole("link", { name: "Hồ sơ", exact: true })
    .click();
  await page.getByRole("link", { name: "Đổi mật khẩu", exact: true }).click();
  for (const id of ["old-password", "new-password", "confirm-password"])
    await expect(page.locator("#" + id)).toHaveValue("");
});
for (const scenario of ["Wrong current password", "Password network error"])
  test(scenario, async ({ page }) => {
    await open(page, scenario);
    await fill(page);
    await submit(page).click();
    await expect(page.locator("#password-error")).toContainText(
      scenario.startsWith("Wrong") ? "không đúng" : "Chưa xác nhận",
    );
    await expect(
      page.locator(
        scenario.startsWith("Wrong") ? "#old-password" : "#password-error",
      ),
    ).toBeFocused();
    await expect(page.locator(".workspace-sidebar")).toContainText(
      "DEMO REQUESTER",
    );
  });
test("duplicate submit is ignored and success clears form and revokes session", async ({
  page,
}) => {
  await open(page);
  await fill(page);
  const reads = await page
    .locator(".password-form")
    .evaluate((element: HTMLFormElement) => {
      let count = 0;
      element.addEventListener("formdata", () => count++);
      element.requestSubmit();
      element.requestSubmit();
      return count;
    });
  expect(reads).toBe(1);
  await expect(page).toHaveURL(/\/login\?/);
  await expect(page.locator("#access-summary")).toContainText(
    "Phiên DEMO đã kết thúc",
  );
  await expect(page.locator(".workspace-sidebar")).toHaveCount(0);
  await expect(page.locator("#login-password")).toHaveValue("");
  await page.locator("#login-email").fill("requester@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  for (const id of ["old-password", "new-password", "confirm-password"])
    await expect(page.locator("#" + id)).toHaveValue("");
});
test("password profile captures at matching desktop and mobile widths", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
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
  await page.goto(
    "http://127.0.0.1:8010/final/01-account.html?capture=1#security",
  );
  await page.locator("#old-password").waitFor();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.screenshot({
      path: path.join(evidence, `reference-${width}.png`),
      fullPage: true,
    });
  }
});
