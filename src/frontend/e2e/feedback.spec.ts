import { test, expect, type Page } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const evidence = path.resolve(
  process.env.FEEDBACK_EVIDENCE_DIR ?? "test-results/feedback-captures",
);
fs.mkdirSync(evidence, { recursive: true });
const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
});
test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page) ?? []).toEqual([]);
});

test("modal contains keyboard focus, blocks background and restores trigger on Escape/cancel", async ({
  page,
}) => {
  await page.goto("/preview/feedback");
  const trigger = page.getByRole("button", { name: "Mở hộp thoại minh họa" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", {
    name: "Kiểm tra nội dung minh họa",
  });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAccessibleDescription(/Chưa gửi thay đổi/);
  const close = dialog.getByRole("button", { name: "Đóng hộp thoại" });
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("button", { name: "Gửi minh họa" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page
    .locator("#dialog-trigger")
    .evaluate((node: HTMLButtonElement) => node.focus());
  await expect(close).toBeFocused();
  expect(await dialog.evaluate((node) => node.matches(":modal"))).toBe(true);
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.screenshot({
    path: path.join(evidence, "actual-dialog-desktop.png"),
    fullPage: false,
  });
  await page.keyboard.press("Tab");
  await page
    .getByRole("textbox", { name: "Nội dung minh họa", exact: true })
    .fill("Bản nháp được giữ nguyên");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await trigger.click();
  await expect(
    page.getByRole("textbox", { name: "Nội dung minh họa", exact: true }),
  ).toHaveValue("Bản nháp được giữ nguyên");
  await dialog.getByRole("button", { name: "Để sau" }).click();
  await expect(trigger).toBeFocused();
});

test("field errors are named, linked, focusable and preserve their existing helper description", async ({
  page,
}) => {
  await page.goto("/preview/feedback");
  await page.getByRole("button", { name: "Mở hộp thoại minh họa" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Gửi minh họa" }).click();
  const field = page.getByRole("textbox", {
    name: "Nội dung minh họa",
    exact: true,
  });
  await expect(field).toBeFocused();
  await expect(field).toHaveAttribute("aria-invalid", "true");
  await expect(field).toHaveAttribute(
    "aria-describedby",
    "demo-draft-help demo-draft-error",
  );
  await expect(dialog.getByRole("alert")).toContainText(
    "Kiểm tra thông tin trước khi gửi",
  );
  await expect(field).toHaveAccessibleDescription(
    /Chỉ nhập dữ liệu giả[\s\S]*Nhập nội dung minh họa từ 5 ký tự/,
  );
  await dialog.locator(".ui-form-errors a").click();
  await expect(field).toBeFocused();
  await page.screenshot({
    path: path.join(evidence, "actual-errors-desktop.png"),
    fullPage: true,
  });
});

test("submission blocks repeats, keeps dimensions and preserves draft on error/conflict", async ({
  page,
}) => {
  await page.goto("/preview/feedback");
  await page.getByRole("button", { name: "Mở hộp thoại minh họa" }).click();
  const dialog = page.getByRole("dialog");
  const field = page.getByRole("textbox", {
    name: "Nội dung minh họa",
    exact: true,
  });
  const send = dialog.getByRole("button", { name: "Gửi minh họa" });
  const draft = "Nội dung minh họa cần được giữ nguyên sau khi lỗi";
  await field.fill(draft);
  const before = await send.boundingBox();
  await send.click();
  await expect(send).toBeDisabled();
  await expect(send).toHaveAttribute("aria-busy", "true");
  await expect(field).toHaveAttribute("readonly", "");
  const during = await send.boundingBox();
  expect(during?.width).toBe(before?.width);
  expect(during?.height).toBe(before?.height);
  await expect(dialog.getByRole("alert")).toContainText(
    "Chưa tải được dữ liệu",
  );
  await expect(field).toHaveValue(draft);
  await expect(send).toBeEnabled();
  await page.getByLabel("Kết quả mô phỏng").selectOption("conflict");
  await send.click();
  await expect(dialog.getByRole("alert")).toContainText("Dữ liệu đã thay đổi");
  await expect(field).toHaveValue(draft);
  await dialog.getByRole("button", { name: "Tải lại để kiểm tra" }).click();
  await expect(dialog.getByRole("alert")).toHaveCount(0);
  await expect(field).toHaveValue(draft);
});

test("read failures stay distinct from empty results, with working recovery feedback", async ({
  page,
}) => {
  await page.goto("/preview/feedback");
  for (const heading of [
    "Đang tải dữ liệu",
    "Chưa có dữ liệu",
    "Không có kết quả phù hợp",
    "Chưa tải được dữ liệu",
    "Bạn không có quyền truy cập",
    "Dữ liệu đã thay đổi",
  ]) {
    await expect(
      page.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
  }
  await expect(page.locator('[data-kind="loading"]')).toHaveAttribute(
    "aria-busy",
    "true",
  );
  await page
    .locator('[data-kind="error"]')
    .getByRole("button", { name: "Thử lại" })
    .click();
  await expect(page.locator(".ui-preview-notice")).toContainText(
    "Không có dữ liệu nghiệp vụ được thay đổi",
  );
  await page.screenshot({
    path: path.join(evidence, "actual-feedback-desktop.png"),
    fullPage: true,
  });
});

for (const width of [320, 390, 768, 1440]) {
  test(`long errors reflow and modal controls stay reachable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/preview/feedback");
    if (width === 390)
      await page.screenshot({
        path: path.join(evidence, "actual-feedback-390.png"),
        fullPage: true,
      });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Mở hộp thoại minh họa" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Gửi minh họa" })
      .click();
    await expect(
      page.getByRole("textbox", { name: "Nội dung minh họa", exact: true }),
    ).toBeFocused();
    expect(
      await page
        .getByRole("dialog")
        .evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
    ).toBe(true);
    await expect(
      page.getByRole("dialog").getByRole("button", { name: "Gửi minh họa" }),
    ).toHaveCSS("transition-duration", "0s");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Để sau" })
      .scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.join(evidence, `actual-dialog-${width}.png`),
      fullPage: false,
    });
    await page.keyboard.press("Escape");
    await expect(page.locator("#dialog-trigger")).toBeFocused();
  });
}

test("200% layout reflows and error text stays legible", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/preview/feedback");
  // Hydrate the client boundary before mutating document styles for zoom simulation.
  await page.getByRole("button", { name: "Mở hộp thoại minh họa" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    document.documentElement.style.zoom = "2";
  });
  await page.getByRole("button", { name: "Mở hộp thoại minh họa" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Gửi minh họa" })
    .click();
  const field = page.getByRole("textbox", {
    name: "Nội dung minh họa",
    exact: true,
  });
  await expect(field).toBeFocused();
  expect(
    await page
      .getByRole("dialog")
      .evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Để sau" })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: path.join(evidence, "actual-dialog-200-percent.png"),
    fullPage: false,
  });
});

test("approved reference states and login captured at the same desktop/mobile widths", async ({
  page,
}) => {
  test.skip(
    !process.env.DESIGN_REFERENCE_URL,
    "Set DESIGN_REFERENCE_URL to the local approved design server for reference captures.",
  );
  const reference = process.env.DESIGN_REFERENCE_URL;
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`${reference}/final/08-admin-states.html?capture=1#states`);
    await expect(
      page.getByRole("heading", { name: "Loading / rỗng / lỗi" }),
    ).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: path.join(evidence, `reference-states-${width}.png`),
      fullPage: true,
    });
    await page.goto(`${reference}/final/login.html`);
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: path.join(evidence, `reference-login-${width}.png`),
      fullPage: true,
    });
  }
});
