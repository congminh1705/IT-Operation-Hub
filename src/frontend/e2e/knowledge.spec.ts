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

test("search and category filter only published accessible sources", async ({
  page,
}) => {
  await open(page);
  await expect(
    page.getByRole("status").filter({ hasText: "3 bài viết" }),
  ).toBeVisible();
  await page.getByLabel("Tìm trong danh sách").fill("ban giao cau hinh");
  await expect(
    page.getByText("Không tìm thấy bài viết phù hợp."),
  ).toBeVisible();
  await page.getByLabel("Tìm trong danh sách").clear();
  await page.getByLabel("Danh mục", { exact: true }).selectOption("Thiết bị");
  await expect(page.getByText("1 bài viết")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Kết nối máy in văn phòng" }),
  ).toBeVisible();
});

test("version and source navigation plus unavailable source", async ({
  page,
}) => {
  await open(page);
  const entry = page.getByRole("link", {
    name: "Kết nối VPN trên laptop Windows",
  });
  await entry.focus();
  await expect(entry).toBeFocused();
  await entry.press("Enter");
  await expect(page.getByText("KB-014 · v2 · Đã công bố")).toBeVisible();
  await page.getByRole("link", { name: /Nguồn v1/ }).click();
  await expect(page.getByText("KB-014 · v1 · Đã công bố")).toBeVisible();
  await open(page, "requester", "/knowledge?id=KB-014&version=99");
  await expect(
    page.getByRole("heading", { name: "Không tìm thấy nguồn có thể đọc" }),
  ).toBeVisible();
});

test("internal denial applies to Admin as well as Requester", async ({
  page,
}) => {
  for (const role of ["requester", "admin"]) {
    await open(page, role, "/knowledge?id=KB-040");
    await expect(
      page.getByRole("heading", { name: "Không tìm thấy nguồn có thể đọc" }),
    ).toBeVisible();
    await expect(page.getByText("Bàn giao cấu hình nội bộ DEMO")).toHaveCount(
      0,
    );
  }
  await open(page, "technician", "/knowledge?id=KB-040");
  await expect(
    page.getByRole("heading", { name: "Bàn giao cấu hình nội bộ DEMO" }),
  ).toBeVisible();
});
for (const ref of ["knowledge", "article"]) {
  test(`compare reader ${ref}`, async ({ page, context }) => {
    await open(
      page,
      "requester",
      ref === "article" ? "/knowledge?id=KB-014" : "/knowledge",
    );
    await expect(
      page.getByRole("heading", {
        name:
          ref === "article"
            ? "Kết nối VPN trên laptop Windows"
            : "Tìm hướng dẫn để tiếp tục công việc",
      }),
    ).toBeVisible();
    await capture(page, context, "FE-13.01", ref);
  });
}
