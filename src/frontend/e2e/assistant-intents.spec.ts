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
const choose = (page: Page) => actions(page).getByLabel("Thao tác");
const check = (page: Page) =>
  actions(page).getByRole("button", { name: "Kiểm tra thao tác" });

test("requester overreach and unsupported intent have a manual outcome", async ({
  page,
}) => {
  await open(page);
  await choose(page).selectOption("assignment");
  await expect(actions(page).getByRole("alert")).toContainText(
    "không được phép",
  );
  await choose(page).selectOption("unsupported");
  await expect(actions(page).getByRole("status")).toContainText(
    "Dùng biểu mẫu thủ công",
  );
});

test("proposal and ticket need an explicit scoped selection", async ({
  page,
}) => {
  await open(page, "it_manager");
  await choose(page).selectOption("approval");
  await expect(check(page)).toBeDisabled();
  await expect(actions(page).getByLabel("Hồ sơ đích")).toHaveValue("");
  await actions(page)
    .getByLabel("Hồ sơ đích")
    .selectOption("PROP-DEMO-PROPOSED");
  await check(page).click();
  await expect(actions(page).getByRole("status")).toContainText(
    "Chưa thực hiện",
  );
  await choose(page).selectOption("reply");
  await expect(check(page)).toBeDisabled();
  await actions(page).getByLabel("Mã ticket đích").fill("TKT-999999");
  await check(page).click();
  await expect(actions(page).getByRole("alert")).toContainText(
    "Không tìm thấy hồ sơ",
  );
});

for (const [ref, role] of [
  ["ai-requester", "requester"],
  ["ai-tech", "technician"],
]) {
  test(`compare intent selector ${ref}`, async ({ page, context }) => {
    await open(page, role);
    await choose(page).selectOption("reply");
    await expect(actions(page).getByLabel("Mã ticket đích")).toBeVisible();
    await capture(page, context, "FE-15.01", ref, "05-ai.html");
  });
}
