import { expect, test, type Page, type BrowserContext } from "@playwright/test";
import path from "node:path";

async function open(page: Page, role = "requester", route = "/assistant") {
  await page.goto("/login?returnTo=" + encodeURIComponent(route));
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
}
async function capture(
  page: Page,
  context: BrowserContext,
  task: string,
  ref: string,
  file = "06-knowledge-assets.html",
) {
  const url = process.env.TICKET_DETAIL_DESIGN_URL;
  test.skip(!url, "Design server required");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const design = await context.newPage();
  await design.emulateMedia({ reducedMotion: "reduce" });
  await design.goto(url + "/" + file + "#" + ref);
  await expect(design.locator("main")).toBeVisible();
  const dir = path.resolve("../../docs/implementation/evidence", task);
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

const action = (page: Page) =>
  page.getByRole("region", { name: "Thao tác được hỗ trợ" });
async function select(page: Page, value: string, id?: string) {
  await action(page).getByLabel("Thao tác").selectOption(value);
  if (id) await action(page).getByLabel("Mã ticket đích").fill(id);
  await action(page).getByRole("button", { name: "Kiểm tra thao tác" }).click();
}
const form = (page: Page) =>
  action(page).getByRole("link", { name: "Mở biểu mẫu xác nhận" });

test("native create confirms the edited exact content only once", async ({
  page,
}) => {
  await open(page);
  await select(page, "create");
  await expect(action(page).getByRole("status")).toContainText(
    "Chưa thực hiện",
  );
  await form(page).click();
  await page.getByLabel("Loại yêu cầu").selectOption("incident");
  await page.getByLabel("Danh mục", { exact: true }).selectOption("Thiết bị");
  await page.getByLabel("Tiêu đề").fill("DEMO từ thẻ thao tác");
  await page
    .getByLabel("Mô tả", { exact: true })
    .fill("Nội dung nháp trước khi sửa.");
  await page.getByLabel("Mức ảnh hưởng").selectOption("low");
  await page.getByLabel("Mức khẩn cấp").selectOption("low");
  await page.getByRole("button", { name: "Xem trước yêu cầu" }).click();
  await expect(page.locator(".access-result")).toContainText(
    "Nội dung nháp trước khi sửa.",
  );
  await expect(page.locator(".access-result")).toContainText(
    "Chưa ghi nhận yêu cầu.",
  );
  await page.getByRole("button", { name: "Quay lại chỉnh sửa" }).click();
  await page
    .getByLabel("Mô tả", { exact: true })
    .fill("Nội dung cuối đã chỉnh sửa.");
  await page.getByRole("button", { name: "Xem trước yêu cầu" }).click();
  await expect(page.locator(".access-result")).toContainText(
    "Nội dung cuối đã chỉnh sửa.",
  );
  await page
    .getByRole("button", { name: "Xác nhận gửi" })
    .evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });
  await expect(page).toHaveURL(/TKT-000152$/);
  await expect(page.getByText("Nội dung cuối đã chỉnh sửa.")).toBeVisible();
  await page.getByRole("link", { name: "Về danh sách yêu cầu" }).click();
  await expect(
    page.getByRole("row", { name: /DEMO từ thẻ thao tác/ }),
  ).toHaveCount(1);
});

for (const [role, intent, preview] of [
  ["requester", "reply", "Xem trước phản hồi công khai"],
  ["technician", "note", "Xem trước ghi chú nội bộ"],
]) {
  test(`${intent} opens the correct native audience with revision preview`, async ({
    page,
  }) => {
    await open(page, role);
    await select(page, intent, "TKT-000126");
    await form(page).click();
    await page.locator("#ticket-reply").fill("Nội dung kiểm thử chưa gửi");
    await page
      .getByRole("button", { name: /Xem trước (ghi chú|phản hồi)/ })
      .click();
    const card = page.getByRole("region", { name: "Xem trước nội dung" });
    await expect(card.getByRole("heading", { name: preview })).toBeVisible();
    await expect(card).toContainText("Phiên bản");
    await expect(card).toContainText("Nội dung kiểm thử chưa gửi");
    await page.getByRole("button", { name: "Quay lại chỉnh sửa" }).click();
    await expect(page.locator("#ticket-reply")).toHaveValue(
      "Nội dung kiểm thử chưa gửi",
    );
    await expect(page.getByText("Đã gửi nội dung.")).toHaveCount(0);
  });
}

for (const [ref, role, intent, id] of [
  ["ai-requester", "requester", "create", undefined],
  ["ai-tech", "technician", "note", "TKT-000126"],
] as const) {
  test(`compare confirmed ticket card ${ref}`, async ({ page, context }) => {
    await open(page, role);
    await select(page, intent, id);
    await expect(form(page)).toBeVisible();
    await capture(page, context, "FE-15.02", ref, "05-ai.html");
  });
}
