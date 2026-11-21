import { expect, test, type Page, type BrowserContext } from "@playwright/test";
import path from "node:path";

async function open(page: Page, role = "requester", route = "/assistant") {
  await page.goto("/login?returnTo=" + encodeURIComponent(route));
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
}

const activity = (page: Page) =>
  page.getByRole("region", { name: "Hoạt động điều phối độc lập" });
const proposal = (page: Page) =>
  page.getByRole("region", { name: "Chi tiết đề xuất ngoại lệ" });
const choose = (page: Page, scenario: string) =>
  activity(page).getByLabel("Kịch bản hoạt động DEMO").selectOption(scenario);

test("no run, normal, approved and disabled never show the pending proposal", async ({
  page,
}) => {
  await open(page, "it_manager");
  await expect(activity(page)).toContainText("Chưa có lượt chạy");
  await expect(proposal(page)).toHaveCount(0);
  await choose(page, "normal");
  await expect(activity(page)).toContainText("Không cần phê duyệt");
  await expect(proposal(page)).toHaveCount(0);
  await choose(page, "approved");
  await expect(activity(page)).toContainText("chờ kết quả thực thi");
  await expect(proposal(page)).toHaveCount(0);
  await choose(page, "disabled");
  await expect(activity(page)).toContainText("Chính sách không cho phép");
  await expect(proposal(page)).toHaveCount(0);
  await choose(page, "proposed");
  await expect(proposal(page)).toContainText("Phân công đề xuất");
  await expect(
    proposal(page).getByRole("button", { name: "Duyệt phương án" }),
  ).toBeVisible();
});

test("closing a chat preserves the run and compact controls switch panes", async ({
  page,
}) => {
  await open(page, "it_manager");
  await choose(page, "normal");
  await page.getByRole("link", { name: "Hướng dẫn hỗ trợ DEMO" }).click();
  await page.getByRole("link", { name: "Đóng hội thoại" }).click();
  await expect(
    activity(page).getByLabel("Kịch bản hoạt động DEMO"),
  ).toHaveValue("normal");
  await expect(activity(page)).toContainText("Không cần phê duyệt");
  await page.setViewportSize({ width: 390, height: 1000 });
  await expect(activity(page)).toBeHidden();
  await page.getByRole("button", { name: "Hoạt động", exact: true }).click();
  await expect(activity(page)).toBeVisible();
  await expect(page.getByRole("region", { name: "Trò chuyện" })).toBeHidden();
  await page.getByRole("button", { name: "Hội thoại", exact: true }).click();
  await expect(page.getByRole("region", { name: "Trò chuyện" })).toBeVisible();
});

test("requester sees suggestions and chat outside internal activity", async ({
  page,
}) => {
  await open(page);
  await expect(
    page.getByRole("navigation", { name: "Gợi ý trong hội thoại" }),
  ).toBeVisible();
  await expect(activity(page)).toHaveCount(0);
  await expect(proposal(page)).toHaveCount(0);
});

test("a disabled underlying policy does not offer a new exception approval", async ({
  page,
}) => {
  await open(page, "it_manager", "/automation/policies");
  const policy = page.getByRole("region", { name: "Chính sách điều phối" });
  await policy.getByRole("button", { name: "Chỉnh chính sách" }).click();
  await policy.getByLabel("Trạng thái chính sách mới").selectOption("off");
  await policy.getByRole("button", { name: "Xem trước chính sách" }).click();
  await policy.getByRole("button", { name: "Xác nhận lưu chính sách" }).click();
  await page.getByRole("link", { name: "AI Workspace", exact: true }).click();
  await choose(page, "proposed");
  await expect(activity(page)).toContainText("Chính sách không cho phép");
  await expect(proposal(page)).toHaveCount(0);
});

for (const [ref, scenario] of [
  ["ai-normal", "normal"],
  ["ai-exception", "proposed"],
]) {
  test(`compare shared workspace ${ref}`, async ({
    page,
    context,
  }: {
    page: Page;
    context: BrowserContext;
  }) => {
    const designUrl = process.env.TICKET_DETAIL_DESIGN_URL;
    test.skip(!designUrl, "Design server required");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, "it_manager");
    await choose(page, scenario);
    const design = await context.newPage();
    await design.emulateMedia({ reducedMotion: "reduce" });
    await design.goto(designUrl + "/05-ai.html#" + ref);
    await expect(design.locator("main")).toBeVisible();
    const dir = path.resolve("../../docs/implementation/evidence/FE-15.04");
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await design.setViewportSize({ width, height: 1000 });
      if (width === 390 && scenario === "proposed")
        await page
          .getByRole("button", { name: "Hoạt động", exact: true })
          .click();
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: path.join(dir, `actual-${ref}-${width}.png`),
        fullPage: true,
      });
      await design.screenshot({
        path: path.join(dir, `reference-${ref}-${width}.png`),
        fullPage: true,
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  });
}
