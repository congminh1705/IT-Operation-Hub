import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

async function open(page: Page, id: string) {
  await page.goto("/login?returnTo=" + encodeURIComponent("/assets?id=" + id));
  await page.locator("#login-email").fill("it_manager@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await page.getByRole("button", { name: "Cấp phát / thu hồi" }).click();
}
const dialog = (page: Page) =>
  page.getByRole("dialog", { name: "Vòng đời tài sản" });
const preview = (page: Page) =>
  dialog(page).getByRole("button", { name: "Xem trước thay đổi" });
const confirm = (page: Page) =>
  dialog(page).getByRole("button", { name: "Xác nhận thay đổi" });
const detail = (page: Page) =>
  page.getByRole("region", { name: "Hồ sơ tài sản" });
async function fill(page: Page) {
  await dialog(page).getByLabel("Ngày thực hiện").fill("2026-11-21");
  await dialog(page)
    .getByLabel("Ghi chú / lý do")
    .fill("Nghiệm thu vòng đời DEMO");
}

test("one concurrent issue wins and the losing confirmation reports stale", async ({
  page,
}) => {
  await open(page, "LT-018");
  await fill(page);
  await dialog(page).getByLabel("Người nhận").selectOption({ index: 1 });
  await preview(page).click();
  await dialog(page).getByLabel("Mô phỏng một lượt cấp phát đồng thời").check();
  await confirm(page).click();
  await expect(dialog(page).getByRole("alert")).toContainText(
    "Tài sản đã thay đổi",
  );
  await dialog(page).getByRole("button", { name: "Đóng hộp thoại" }).click();
  await expect(detail(page)).toContainText("Đang sử dụng");
  const history = page.getByRole("region", { name: "Lịch sử thiết bị" });
  await expect(history.getByText(/Cấp phát thiết bị/)).toHaveCount(1);
  await expect(history).toContainText("Cấp phát đồng thời DEMO");
});

test("return before retire, cancel, and repeated return guard", async ({
  page,
}) => {
  await open(page, "LT-001");
  await fill(page);
  await dialog(page).getByLabel("Thao tác").selectOption("retire");
  await preview(page).click();
  await expect(dialog(page).getByRole("alert")).toContainText(
    "Thu hồi tài sản trước",
  );
  await dialog(page).getByLabel("Thao tác").selectOption("return");
  await preview(page).click();
  await dialog(page).getByRole("button", { name: "Hủy" }).click();
  await expect(detail(page)).toContainText("Đang sử dụng");
  await detail(page)
    .getByRole("button", { name: "Cấp phát / thu hồi" })
    .click();
  await fill(page);
  await preview(page).click();
  await confirm(page).click();
  await expect(detail(page)).toContainText("Trong kho");
  await detail(page)
    .getByRole("button", { name: "Cấp phát / thu hồi" })
    .click();
  await dialog(page).getByLabel("Thao tác").selectOption("return");
  await fill(page);
  await preview(page).click();
  await expect(dialog(page).getByRole("alert")).toContainText(
    "không có lượt cấp phát",
  );
  await dialog(page).getByLabel("Thao tác").selectOption("retire");
  await preview(page).click();
  await confirm(page).click();
  await expect(detail(page)).toContainText("Ngừng sử dụng");
});

test("returns to repair and requires stock before a new issue", async ({
  page,
}) => {
  await open(page, "LT-001");
  await fill(page);
  await dialog(page)
    .getByLabel("Trạng thái sau thu hồi")
    .selectOption("repair");
  await preview(page).click();
  await confirm(page).click();
  await expect(detail(page)).toContainText("Đang sửa chữa");
  await detail(page)
    .getByRole("button", { name: "Cấp phát / thu hồi" })
    .click();
  await fill(page);
  await dialog(page).getByLabel("Thao tác").selectOption("stock");
  await preview(page).click();
  await confirm(page).click();
  await expect(detail(page)).toContainText("Trong kho");
});

for (const [id, error] of [
  ["PR-008", "Chỉ cấp phát tài sản đang trong kho"],
  ["LT-009", "Tài sản đã ngừng sử dụng"],
]) {
  test(`rejects issue of ${id}`, async ({ page }) => {
    await open(page, id);
    await fill(page);
    await dialog(page).getByLabel("Người nhận").selectOption({ index: 1 });
    await preview(page).click();
    await expect(dialog(page).getByRole("alert")).toContainText(error);
  });
}

test("compare lifecycle detail and action reference", async ({
  page,
  context,
}) => {
  const url = process.env.TICKET_DETAIL_DESIGN_URL;
  test.skip(!url, "Design server required");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "LT-001");
  await dialog(page).getByLabel("Thao tác").focus();
  await expect(dialog(page).getByLabel("Thao tác")).toBeFocused();
  const design = await context.newPage();
  await design.emulateMedia({ reducedMotion: "reduce" });
  const dir = path.resolve("../../docs/implementation/evidence/FE-12.03");
  for (const ref of ["asset-action", "asset"]) {
    if (ref === "asset")
      await dialog(page)
        .getByRole("button", { name: "Đóng hộp thoại" })
        .click();
    await design.goto(url + "/06-knowledge-assets.html#" + ref);
    for (const width of [1440, 390]) {
      for (const [name, target] of [
        ["actual", page],
        ["reference", design],
      ] as const) {
        await target.setViewportSize({ width, height: 1000 });
        await target.evaluate(() => window.scrollTo(0, 0));
        await target.screenshot({
          path: path.join(dir, `${name}-${ref}-${width}.png`),
          fullPage: true,
        });
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
});
