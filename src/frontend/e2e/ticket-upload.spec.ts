import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

const fixtureFile = (name: string) => ({
  name,
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-DEMO"),
});

async function login(page: Page, role: string, target: string) {
  await page.goto("/login?returnTo=" + encodeURIComponent(target));
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(page.locator('input[type="file"]')).toBeVisible();
}

async function prepare(page: Page, scenario: string) {
  await login(
    page,
    "requester",
    "/tickets/new" + (scenario ? "?demo=" + scenario : ""),
  );
  await page.getByLabel("Loại yêu cầu").selectOption("incident");
  await page.getByLabel("Danh mục", { exact: true }).selectOption("Thiết bị");
  await page.getByLabel("Tiêu đề").fill("Yêu cầu DEMO có tệp đính kèm");
  await page
    .getByLabel("Mô tả", { exact: true })
    .fill("Kiểm tra trạng thái tệp sau khi lưu.");
  await page.getByLabel("Mức ảnh hưởng").selectOption("low");
  await page.getByLabel("Mức khẩn cấp").selectOption("low");
  await page
    .locator('input[type="file"]')
    .setInputFiles([fixtureFile("first.pdf"), fixtureFile("second.pdf")]);
}

async function send(page: Page) {
  await page.getByRole("button", { name: "Xem trước yêu cầu" }).click();
  await page.getByRole("button", { name: "Xác nhận gửi" }).click();
  const upload = page.getByRole("region", { name: "Kết quả tải tệp" });
  await expect(upload).toContainText("Yêu cầu đã lưu");
  return upload;
}

test("partial retry keeps saved ticket and already uploaded selection", async ({
  page,
}) => {
  await prepare(page, "upload-partial");
  const upload = await send(page);
  await expect(upload).toContainText("first.pdf · Đã tải");
  await expect(upload).toContainText("second.pdf · Chưa tải");
  await upload
    .getByRole("button", { name: "Tải lại tệp chưa hoàn tất" })
    .click();
  await expect(upload).toContainText("second.pdf · Đã tải");
  await upload.getByRole("button", { name: "Về chi tiết yêu cầu" }).click();
  await expect(page).toHaveURL(/TKT-000152$/);
  await page.getByRole("link", { name: "Về danh sách yêu cầu" }).click();
  await expect(
    page.getByRole("row", { name: /Yêu cầu DEMO có tệp đính kèm/ }),
  ).toHaveCount(1);
});

test("unknown upload is reconciled before deliberate retry", async ({
  page,
}) => {
  await prepare(page, "upload-unknown");
  const upload = await send(page);
  await expect(upload).toContainText("Chưa xác nhận được kết quả tải tệp");
  await expect(
    upload.getByRole("button", { name: "Tải lại tệp chưa hoàn tất" }),
  ).toHaveCount(0);
  await upload.getByRole("button", { name: "Kiểm tra kết quả tải" }).click();
  await expect(upload).toContainText("Không tải được tệp");
  await upload
    .getByRole("button", { name: "Tải lại tệp chưa hoàn tất" })
    .click();
  await expect(upload).toContainText("Đã tải xong tệp DEMO");
});

test("cancel upload preserves saved ticket and valid files", async ({
  page,
}) => {
  await prepare(page, "");
  const upload = await send(page);
  await expect(upload.getByRole("progressbar")).toBeVisible();
  await upload.getByRole("button", { name: "Hủy tải tệp" }).click();
  await expect(upload).toContainText("Đã hủy tải tệp");
  await expect(upload).toContainText("first.pdf · Chưa tải");
  await upload
    .getByRole("button", { name: "Tải lại tệp chưa hoàn tất" })
    .click();
  await expect(upload).toContainText("Đã tải xong tệp DEMO");
});

test("rejected file blocks preview until corrected, keeping text and valid files", async ({
  page,
}) => {
  await prepare(page, "");
  await page.locator('input[type="file"]').setInputFiles({
    name: "invalid.exe",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("DEMO"),
  });
  await page.getByRole("button", { name: "Xem trước yêu cầu" }).click();
  await expect(
    page.getByRole("heading", { name: "Xem trước yêu cầu" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Bỏ các tệp không hợp lệ" }).click();
  await expect(page.getByLabel("Mô tả", { exact: true })).toHaveValue(
    "Kiểm tra trạng thái tệp sau khi lưu.",
  );
  await page.getByRole("button", { name: "Xem trước yêu cầu" }).click();
  await expect(
    page.getByRole("list", { name: "Tệp trong bản xem trước" }),
  ).toContainText("first.pdf");
});

test("internal note stays posted if file storage fails; retry only uploads", async ({
  page,
}) => {
  await login(page, "technician", "/tickets/TKT-000127?demo=upload-failure");
  await page
    .getByRole("button", { name: "Ghi chú nội bộ", exact: true })
    .click();
  await page
    .locator("#ticket-reply")
    .fill("Ghi chú DEMO chỉ xuất hiện một lần.");
  await page
    .locator('input[type="file"]')
    .setInputFiles(fixtureFile("note.pdf"));
  await page.getByRole("button", { name: "Xem trước ghi chú" }).click();
  await page.getByRole("button", { name: "Xác nhận gửi" }).click();
  const upload = page.getByRole("region", { name: "Kết quả tải tệp" });
  await expect(upload).toContainText("Nội dung trao đổi đã lưu");
  await expect(upload).toContainText("Không tải được tệp");
  await upload
    .getByRole("button", { name: "Tải lại tệp chưa hoàn tất" })
    .click();
  await expect(upload).toContainText("Đã tải xong tệp DEMO");
  await expect(
    page
      .locator(".ticket-history-events")
      .getByText("Ghi chú DEMO chỉ xuất hiện một lần."),
  ).toHaveCount(1);
});

test("compare upload recovery screens", async ({ page, context }) => {
  const url = process.env.TICKET_DETAIL_DESIGN_URL;
  test.skip(!url, "Design server required");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await prepare(page, "upload-partial");
  await expect(await send(page)).toContainText("Một số tệp chưa tải được");
  const design = await context.newPage();
  const folder = path.resolve("../../docs/implementation/evidence/FE-07.02");
  for (const [key, ref] of [
    ["create", "02-tickets.html#create"],
    ["states", "08-admin-states.html#states"],
  ]) {
    await design.goto(url + "/" + ref);
    await expect(design.locator("main")).toBeVisible();
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await design.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: path.join(folder, `actual-${key}-${width}.png`),
        fullPage: true,
      });
      await design.screenshot({
        path: path.join(folder, `reference-${key}-${width}.png`),
        fullPage: true,
      });
    }
  }
});
