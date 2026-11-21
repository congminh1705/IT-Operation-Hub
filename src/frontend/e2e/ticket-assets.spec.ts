import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

async function open(page: Page, role: string, target = "/tickets/new") {
  await page.goto("/login?returnTo=" + encodeURIComponent(target));
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
}
const picker = (page: Page) =>
  page.getByLabel("Thiết bị liên quan", { exact: true });
const title = "Kiểm tra thiết bị DEMO";
async function preview(page: Page) {
  await page.getByLabel("Loại yêu cầu").selectOption("incident");
  await page.getByLabel("Danh mục", { exact: true }).selectOption("Thiết bị");
  await page.getByLabel("Tiêu đề").fill(title);
  await page
    .getByLabel("Mô tả", { exact: true })
    .fill("Thiết bị thử nghiệm không phản hồi.");
  await page.getByLabel("Mức ảnh hưởng").selectOption("low");
  await page.getByLabel("Mức khẩn cấp").selectOption("low");
  await page.getByRole("button", { name: "Xem trước yêu cầu" }).click();
}
const confirm = (page: Page) =>
  page.getByRole("button", { name: "Xác nhận gửi" });

for (const [role, ownAsset, unavailable] of [
  ["requester", "LT-001", "LT-014"],
  ["technician", "LT-014", "LT-001"],
]) {
  test(`${role} starts on its own asset and can navigate ticket and asset both ways`, async ({
    page,
  }) => {
    await open(page, role, "/assets?scope=mine&id=" + ownAsset);
    await page.getByRole("link", { name: "Yêu cầu hỗ trợ thiết bị" }).click();
    await expect(picker(page)).toHaveValue(ownAsset);
    await expect(
      picker(page).locator(`option[value=${unavailable}]`),
    ).toHaveCount(0);
    await preview(page);
    await confirm(page).click();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await page.getByRole("link", { name: new RegExp(ownAsset) }).click();
    await expect(
      page
        .getByRole("region", { name: "Ticket liên quan" })
        .getByRole("link", { name: new RegExp(title) }),
    ).toBeVisible();
  });
}

for (const role of ["it_manager", "admin"]) {
  test(`${role} can pick eligible organization assets only`, async ({
    page,
  }) => {
    await open(page, role);
    await expect(picker(page)).toBeVisible();
    for (const id of ["LT-001", "LT-014", "LT-018"])
      await expect(picker(page).locator(`option[value=${id}]`)).toHaveCount(1);
    for (const id of ["LT-009", "PR-008"])
      await expect(picker(page).locator(`option[value=${id}]`)).toHaveCount(0);
  });
}

test("stale selection retains the draft and prevents submission until reselected", async ({
  page,
}) => {
  await open(page, "requester", "/tickets/new?demo=asset-stale&asset=LT-001");
  await expect(picker(page)).toHaveValue("LT-001");
  await preview(page);
  await confirm(page).click();
  await expect(page.locator(".ticket-create-form [role=alert]")).toContainText(
    "không còn được phép liên kết",
  );
  await expect(confirm(page)).toBeDisabled();
  await page.getByRole("button", { name: "Quay lại chỉnh sửa" }).click();
  await expect(page.getByLabel("Tiêu đề")).toHaveValue(title);
  await picker(page).selectOption("");
  await page.getByRole("button", { name: "Xem trước yêu cầu" }).click();
  await confirm(page).click();
  await expect(page).toHaveURL(/\/tickets\/TKT-000152$/);
});

for (const [ref, role, file] of [
  ["asset-action", "it_manager", "06-knowledge-assets.html"],
  ["create", "requester", "02-tickets.html"],
]) {
  test(`compare picker with ${ref}`, async ({ page, context }) => {
    const url = process.env.TICKET_DETAIL_DESIGN_URL;
    test.skip(!url, "Design server required");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, role, "/tickets/new?asset=LT-001");
    await expect(picker(page)).toHaveValue("LT-001");
    await picker(page).focus();
    await expect(picker(page)).toBeFocused();
    const design = await context.newPage();
    await design.emulateMedia({ reducedMotion: "reduce" });
    await design.goto(url + "/" + file + "#" + ref);
    const dir = path.resolve("../../docs/implementation/evidence/FE-12.04");
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
  });
}
