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

const cards = (page: Page) =>
  page.getByRole("region", { name: "Tra cứu và bản nháp" });
async function lookup(page: Page, kind: string, id: string) {
  await cards(page).getByLabel("Loại hồ sơ").selectOption(kind);
  await cards(page).getByLabel("Mã hồ sơ").fill(id);
  await cards(page).getByRole("button", { name: "Tra cứu DEMO" }).click();
}

test("source and asset cards recheck current scope", async ({ page }) => {
  await open(page);
  await lookup(page, "source", "KB-014");
  await expect(
    cards(page).getByRole("link", { name: /KB-014 · v2/ }),
  ).toBeVisible();
  await lookup(page, "source", "KB-999");
  await expect(
    cards(page).getByText("Chưa đủ nguồn có thể truy cập."),
  ).toBeVisible();
  await lookup(page, "asset", "LT-014");
  await expect(
    cards(page).getByText("Chưa đủ nguồn có thể truy cập."),
  ).toBeVisible();
  await lookup(page, "asset", "LT-001");
  await expect(cards(page).getByRole("link", { name: /LT-001/ })).toBeVisible();
});

test("revoked source produces no citation on the existing session", async ({
  page,
}) => {
  await open(page, "it_manager", "/knowledge?id=KB-014");
  await page.getByRole("button", { name: "Thu hồi nguồn DEMO" }).click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await page.getByRole("link", { name: "AI Workspace", exact: true }).click();
  await lookup(page, "source", "KB-014");
  await expect(
    cards(page).getByText("Chưa đủ nguồn có thể truy cập."),
  ).toBeVisible();
  await expect(cards(page).getByRole("link", { name: /KB-014/ })).toHaveCount(
    0,
  );
});

test("editable handoff preserves existing native text and has no ticket effect", async ({
  page,
}) => {
  await open(page, "requester", "/tickets/TKT-000126");
  const reply = page.locator("#ticket-reply");
  await reply.fill("Nội dung gốc trong form");
  await page.getByRole("link", { name: "AI Workspace", exact: true }).click();
  await lookup(page, "ticket", "TKT-000126");
  await cards(page).getByRole("button", { name: "Tạo bản nháp DEMO" }).click();
  await cards(page)
    .getByLabel("Bản nháp DEMO")
    .fill("Nội dung thêm đã chỉnh sửa");
  await cards(page)
    .getByRole("button", { name: "Chuẩn bị chèn vào ticket" })
    .click();
  await cards(page).getByRole("link", { name: "Mở form ticket" }).click();
  await expect(reply).toHaveValue("Nội dung gốc trong form");
  await page.getByRole("button", { name: "Chèn bản nháp DEMO" }).click();
  await expect(reply).toHaveValue(
    "Nội dung gốc trong form\n\nNội dung thêm đã chỉnh sửa",
  );
  await expect(
    page.getByText("Nội dung thêm đã chỉnh sửa", { exact: true }),
  ).toHaveCount(0);
});

test("internal draft cannot hand off into a public reply", async ({ page }) => {
  await open(page, "technician");
  await page
    .getByRole("region", { name: "Trò chuyện" })
    .getByLabel("Ngữ cảnh")
    .selectOption("INTERNAL");
  await lookup(page, "ticket", "TKT-000126");
  await cards(page).getByRole("button", { name: "Tạo bản nháp DEMO" }).click();
  await cards(page).getByLabel("Đích bản nháp").selectOption("public");
  await cards(page)
    .getByRole("button", { name: "Chuẩn bị chèn vào ticket" })
    .click();
  await expect(cards(page).getByRole("alert")).toContainText(
    "Không thể chuyển bản nháp",
  );
  await expect(
    cards(page).getByRole("link", { name: "Mở form ticket" }),
  ).toHaveCount(0);
});

for (const [ref, role, kind, id] of [
  ["ai-requester", "requester", "source", "KB-014"],
  ["ai-tech", "technician", "ticket", "TKT-000126"],
]) {
  test(`compare card ${ref}`, async ({ page, context }) => {
    await open(page, role);
    await lookup(page, kind, id);
    await expect(
      cards(page).getByRole("link", { name: new RegExp(id) }),
    ).toBeVisible();
    await capture(page, context, "FE-14.02", ref, "05-ai.html");
  });
}
