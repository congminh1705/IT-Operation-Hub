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

const actions = (page: Page) =>
  page.getByRole("region", { name: "Thao tác được hỗ trợ" });
const form = (page: Page) =>
  actions(page).getByRole("link", { name: "Mở biểu mẫu xác nhận" });
async function review(page: Page, intent: string, target?: string) {
  await actions(page).getByLabel("Thao tác").selectOption(intent);
  if (target?.startsWith("TKT-"))
    await actions(page).getByLabel("Mã ticket đích").fill(target);
  else if (target)
    await actions(page).getByLabel("Hồ sơ đích").selectOption(target);
  await actions(page)
    .getByRole("button", { name: "Kiểm tra thao tác" })
    .click();
}

test("technician reaches own task, invalid Done is blocked and progress confirms", async ({
  page,
}) => {
  await open(page, "technician");
  await review(page, "progress", "T07");
  await form(page).click();
  const progress = page.getByRole("region", { name: "Tiến độ và kết quả" });
  await expect(progress).toContainText("T07");
  await progress.getByLabel("Thao tác tiến độ").selectOption("done");
  await progress.getByRole("button", { name: "Xem trước cập nhật" }).click();
  await expect(progress.getByRole("alert")).toBeVisible();
  await progress.getByLabel("Thao tác tiến độ").selectOption("update");
  await progress.getByLabel("Kết quả").fill("Đã xác minh kết nối DEMO.");
  await progress.getByRole("button", { name: "Xem trước cập nhật" }).click();
  await progress.getByRole("button", { name: "Xác nhận cập nhật" }).click();
  await expect(progress.getByRole("status")).toHaveText(
    "Đã cập nhật công việc.",
  );
});

test("non-requester acceptance and forged admin handoff are blocked", async ({
  page,
}) => {
  await open(page, "it_manager");
  await review(page, "accept", "TKT-000129");
  await expect(actions(page).getByRole("alert")).toContainText(
    "không cho phép",
  );
  await expect(form(page)).toHaveCount(0);
  await actions(page).getByLabel("Thao tác").selectOption("admin");
  await expect(actions(page).getByRole("alert")).toContainText(
    "không được phép",
  );
  await open(page, "requester", "/admin/users/new");
  await expect(
    page.getByText("Bạn không có quyền truy cập", { exact: true }),
  ).toBeVisible();
});

test("manager reaches native assignment, approval and asset guards", async ({
  page,
}) => {
  await open(page, "it_manager");
  await review(page, "assignment", "TKT-000126");
  await form(page).click();
  await expect(
    page.getByRole("button", { name: "Phân công yêu cầu", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "AI Workspace", exact: true }).click();
  await review(page, "approval", "PROP-DEMO-PROPOSED");
  await form(page).click();
  await expect(
    page.getByRole("button", { name: "Duyệt phương án" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "AI Workspace", exact: true }).click();
  await review(page, "asset", "LT-001");
  await form(page).click();
  await expect(
    page.getByRole("dialog", { name: "Vòng đời tài sản" }),
  ).toBeVisible();
});

test("admin route keeps sensitive fields out of workspace", async ({
  page,
}) => {
  await open(page, "admin");
  await review(page, "admin");
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  await form(page).click();
  await expect(
    page.getByRole("heading", { name: "Tạo người dùng", exact: true }).first(),
  ).toBeVisible();
  await expect(page.locator('input[type="password"]')).toHaveCount(1);
});

for (const [ref, role, intent, target] of [
  ["ai-tech", "technician", "progress", "T07"],
  ["ai-approval", "it_manager", "approval", "PROP-DEMO-PROPOSED"],
]) {
  test(`compare management card ${ref}`, async ({ page, context }) => {
    await open(page, role);
    await review(page, intent, target);
    await expect(form(page)).toBeVisible();
    if (ref === "ai-approval") {
      await form(page).click();
      await expect(
        page.getByRole("button", { name: "Duyệt phương án" }),
      ).toBeVisible();
    }
    await capture(page, context, "FE-15.03", ref, "05-ai.html");
  });
}
