import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
const evidence = path.resolve("../../docs/implementation/evidence/FE-05.03");
const title = "Máy trạm DEMO cần hỗ trợ";
async function open(page: Page, fixture = "") {
  await page.goto(
    "/login?returnTo=" +
      encodeURIComponent("/tickets/new" + (fixture ? "?demo=" + fixture : "")),
  );
  await page.locator("#login-email").fill("requester@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(
    page.getByRole("heading", { name: "Tạo yêu cầu", level: 1 }),
  ).toBeVisible();
}
async function preview(page: Page) {
  await page.getByLabel("Loại yêu cầu").selectOption("incident");
  await page.getByLabel("Danh mục", { exact: true }).selectOption("Thiết bị");
  await page.getByLabel("Tiêu đề").fill(title);
  await page
    .getByLabel("Mô tả", { exact: true })
    .fill("Máy trạm thử nghiệm không phản hồi từ sáng.");
  await page.getByLabel("Mức ảnh hưởng").selectOption("low");
  await page.getByLabel("Mức khẩn cấp").selectOption("low");
  await page.getByRole("button", { name: "Xem trước yêu cầu" }).click();
  await expect(
    page.getByRole("heading", { name: "Xem trước yêu cầu" }),
  ).toBeFocused();
}
const submit = (page: Page) =>
  page.getByRole("button", { name: "Xác nhận gửi", exact: true });
test("confirmed delayed submit is deduplicated and navigates detail to own list", async ({
  page,
}) => {
  await open(page);
  await preview(page);
  await submit(page).evaluate((button: HTMLButtonElement) => {
    button.click();
    button.click();
  });
  await expect(submit(page)).toBeDisabled();
  await expect(page).toHaveURL(/\/tickets\/TKT-000152$/);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(
    page.getByText(/Phiên bản v3.*240 phút.*1440 phút/),
  ).toBeVisible();
  await page.getByRole("link", { name: "Về danh sách yêu cầu" }).click();
  const created = page.getByRole("row", { name: new RegExp(title) });
  await expect(created).toHaveCount(1);
  await created.getByRole("link", { name: "TKT-000152" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
});
for (const fixture of ["failure", "stale", "unknown"])
  test(`${fixture} preserves draft and creates no record`, async ({ page }) => {
    await open(page, fixture);
    await preview(page);
    await submit(page).click();
    await expect(
      page.locator(".ticket-create-form [role=alert]"),
    ).toBeFocused();
    if (fixture === "unknown") {
      await expect(submit(page)).toHaveCount(0);
      await page.getByRole("button", { name: "Kiểm tra kết quả" }).click();
      await expect(
        page.locator(".ticket-create-form [role=alert]"),
      ).toContainText("Chưa gửi");
    }
    if (fixture === "stale") await expect(submit(page)).toBeDisabled();
    await page.getByRole("button", { name: "Quay lại chỉnh sửa" }).click();
    await expect(page.getByLabel("Tiêu đề")).toHaveValue(title);
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Hủy", exact: true }).click();
    await expect(
      page.getByRole("row", { name: new RegExp(title) }),
    ).toHaveCount(0);
  });
test("matched create and detail evidence", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.screenshot({
      path: path.join(evidence, `actual-create-${width}.png`),
      fullPage: true,
    });
  }
  await preview(page);
  await submit(page).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: path.join(evidence, `actual-detail-${width}.png`),
      fullPage: true,
    });
  }
  if (process.env.TICKET_DESIGN_URL)
    for (const [screen, key, selector] of [
      ["create", "create", "#subject"],
      ["ticket-active", "detail", "main h1"],
    ]) {
      await page.goto(
        `${process.env.TICKET_DESIGN_URL}/final/02-tickets.html?capture=1#${screen}`,
      );
      await page.locator(selector).first().waitFor();
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.screenshot({
          path: path.join(evidence, `reference-${key}-${width}.png`),
          fullPage: true,
        });
      }
    }
});
