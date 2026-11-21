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

const source = (page: Page) =>
  page.getByRole("region", { name: "Chỉ mục và trích dẫn" });
const url = "/knowledge?id=KB-014";
const articleTitle = "Kết nối VPN trên laptop Windows";

test("stale published source remains readable and retries locally", async ({
  page,
}) => {
  const external: string[] = [];
  page.on("request", (request) => {
    const target = new URL(request.url());
    if (/^https?:$/.test(target.protocol) && target.hostname !== "127.0.0.1")
      external.push(request.url());
  });
  await open(page, "it_manager", url + "&version=1");
  await expect(page.getByText("KB-014 · v1 · Đã công bố")).toBeVisible();
  await expect(source(page).getByText("Chỉ mục đã cũ")).toBeVisible();
  await expect(source(page).getByText(/Chưa đủ nguồn/)).toBeVisible();
  await source(page)
    .getByRole("button", { name: "Thử lại chỉ mục DEMO" })
    .click();
  await expect(source(page).getByText("Đang lập chỉ mục")).toBeVisible();
  await expect(
    source(page).getByRole("button", { name: "Trích dẫn DEMO" }),
  ).toHaveCount(0);
  await source(page)
    .getByRole("button", { name: "Nhận kết quả chỉ mục DEMO" })
    .click();
  await expect(source(page).getByText("Chỉ mục sẵn sàng")).toBeVisible();
  await source(page).getByRole("button", { name: "Trích dẫn DEMO" }).click();
  await expect(
    source(page).getByRole("link", { name: /KB-014 · v1/ }),
  ).toBeVisible();
  expect(external).toEqual([]);
});

for (const [action, message] of [
  ["Thu hồi nguồn DEMO", "Đã thu hồi quyền đọc nguồn"],
  ["Ngừng sử dụng bài viết", "Đã ngừng sử dụng"],
]) {
  test(`${action} removes the open article, history and citation`, async ({
    page,
  }) => {
    await open(page, "it_manager", url);
    await source(page).getByRole("button", { name: "Trích dẫn DEMO" }).click();
    await expect(
      source(page).getByRole("link", { name: /KB-014 · v2/ }),
    ).toBeVisible();
    await source(page).getByRole("button", { name: action }).click();
    await source(page)
      .getByRole("button", { name: "Xác nhận", exact: true })
      .click();
    await expect(page.getByText(message, { exact: true })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Không tìm thấy nguồn có thể đọc" }),
    ).toBeFocused();
    await expect(page.getByRole("heading", { name: articleTitle })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole("link", { name: /Nguồn v[12]|KB-014 · v2/ }),
    ).toHaveCount(0);
    if (process.env.TICKET_DETAIL_DESIGN_URL) {
      const fixture = action === "Thu hồi nguồn DEMO" ? "revoked" : "retired";
      await page.emulateMedia({ reducedMotion: "reduce" });
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({
          path: path.resolve(
            "../../docs/implementation/evidence/FE-13.03",
            `actual-${fixture}-${width}.png`,
          ),
          fullPage: true,
        });
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    await page.getByRole("link", { name: "Về kho kiến thức" }).click();
    await expect(page.getByRole("link", { name: articleTitle })).toHaveCount(0);
  });
}

test("new publication starts with a pending index", async ({ page }) => {
  await open(page, "it_manager", url + "&edit=1");
  await page.getByRole("button", { name: "Review công bố phiên bản" }).click();
  await page.getByRole("button", { name: "Xác nhận công bố" }).click();
  await page.getByRole("button", { name: "Hủy" }).click();
  await expect(page.getByText("KB-014 · v3 · Đã công bố")).toBeVisible();
  await expect(source(page).getByText("Chờ lập chỉ mục")).toBeVisible();
  await expect(
    source(page).getByRole("button", { name: "Trích dẫn DEMO" }),
  ).toHaveCount(0);
});

for (const ref of ["article", "ai-states"]) {
  test(`compare source state with ${ref}`, async ({ page, context }) => {
    await open(page, "requester", ref === "article" ? url : url + "&version=1");
    await expect(source(page)).toBeVisible();
    await capture(
      page,
      context,
      "FE-13.03",
      ref,
      ref === "article" ? undefined : "05-ai.html",
    );
  });
}
