import { expect, test, type Page, type BrowserContext } from "@playwright/test";
import path from "node:path";

async function open(page: Page, role = "requester", route = "/knowledge") {
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

const route = "/knowledge?id=KB-014&edit=1";
const editor = (page: Page) =>
  page.getByRole("region", { name: "Phiên bản & quyền bài viết" });

test("author can validate, cancel and save a draft without publishing", async ({
  page,
}) => {
  await open(page, "technician", route);
  const title = editor(page).getByLabel("Tiêu đề");
  const body = editor(page).getByLabel("Nội dung");
  const preview = editor(page).getByRole("button", {
    name: "Xem trước bản nháp",
  });
  await title.fill("x");
  await body.fill("Nội dung bản nháp mới cho DEMO.");
  await preview.click();
  await expect(editor(page).getByRole("alert")).toContainText("Nhập tiêu đề");
  await expect(body).toHaveValue("Nội dung bản nháp mới cho DEMO.");
  await title.fill("Bản nháp không được lưu");
  await preview.click();
  await editor(page).getByRole("button", { name: "Hủy" }).click();
  await page.getByRole("link", { name: "Phiên bản & quyền bài viết" }).click();
  await expect(title).toHaveValue("Kết nối VPN trên laptop Windows");
  await title.fill("Bản nháp đã lưu");
  await preview.click();
  await expect(
    editor(page).getByRole("button", { name: "Review công bố phiên bản" }),
  ).toHaveCount(0);
  await editor(page).getByRole("button", { name: "Lưu bản nháp" }).click();
  await expect(editor(page).getByRole("status")).toHaveText("Đã lưu bản nháp.");
  await editor(page).getByRole("button", { name: "Hủy" }).click();
  await expect(page.getByText("KB-014 · v2 · Đã công bố")).toBeVisible();
  await expect(page.getByText("Bản nháp đã lưu")).toHaveCount(0);
});

test("publisher confirms access and publication without author capability", async ({
  page,
}) => {
  await open(page, "it_manager", route);
  await expect(editor(page).getByLabel("Tiêu đề")).toHaveCount(0);
  await editor(page)
    .getByLabel("Phạm vi đọc hiện hành")
    .selectOption("support");
  await editor(page)
    .getByRole("button", { name: "Xem trước quyền đọc" })
    .click();
  await expect(editor(page).getByRole("status")).toContainText(
    "Nhóm IT Support",
  );
  await editor(page)
    .getByRole("button", { name: "Xác nhận đổi phạm vi" })
    .click();
  await expect(editor(page).getByRole("status")).toHaveText(
    "Đã cập nhật phạm vi đọc.",
  );
  await editor(page)
    .getByRole("button", { name: "Review công bố phiên bản" })
    .click();
  await editor(page).getByRole("button", { name: "Xác nhận công bố" }).click();
  await expect(editor(page).getByRole("status")).toHaveText(
    "Đã công bố phiên bản.",
  );
  await editor(page).getByRole("button", { name: "Hủy" }).click();
  await expect(page.getByText("KB-014 · v3 · Đã công bố")).toBeVisible();
  await page.getByRole("link", { name: /Nguồn v2/ }).click();
  await expect(page.getByText("KB-014 · v2 · Đã công bố")).toBeVisible();
});

test("ungranted Admin and Manager are denied without draft content", async ({
  page,
}) => {
  await open(page, "admin", route);
  await expect(
    page.getByRole("heading", {
      name: "Bạn chưa được cấp quyền biên tập hoặc công bố",
    }),
  ).toBeVisible();
  await open(page, "it_manager", "/knowledge?id=KB-021&edit=1");
  await expect(
    page.getByRole("heading", {
      name: "Bạn chưa được cấp quyền biên tập hoặc công bố",
    }),
  ).toBeVisible();
});

test("compare author form with knowledge edit", async ({ page, context }) => {
  await open(page, "technician", route);
  const title = editor(page).getByLabel("Tiêu đề");
  await title.focus();
  await expect(title).toBeFocused();
  await capture(page, context, "FE-13.02", "knowledge-edit");
});
