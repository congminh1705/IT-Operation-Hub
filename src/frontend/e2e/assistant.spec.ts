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

const chat = (page: Page) => page.getByRole("region", { name: "Trò chuyện" });
const send = (page: Page) =>
  chat(page).getByRole("button", { name: "Gửi", exact: true });
test("send, cancel and error preserve the draft until a success", async ({
  page,
}) => {
  await open(page);
  const message = chat(page).getByLabel("Tin nhắn");
  await message.fill("Cần hỗ trợ DEMO");
  await send(page).click();
  await expect(chat(page).getByText("Đang tạo phản hồi DEMO…")).toBeVisible();
  await chat(page).getByRole("button", { name: "Hủy gửi" }).click();
  await expect(message).toHaveValue("Cần hỗ trợ DEMO");
  await chat(page)
    .getByLabel("Tình huống phản hồi DEMO")
    .selectOption("network");
  await send(page).click();
  await expect(chat(page).getByRole("alert")).toContainText("Chưa gửi được");
  await expect(message).toHaveValue("Cần hỗ trợ DEMO");
  await chat(page).getByLabel("Tình huống phản hồi DEMO").selectOption("none");
  await send(page).click();
  await expect(
    chat(page).getByRole("list", { name: "Tin nhắn" }),
  ).toContainText("Phản hồi DEMO công khai");
});

test("internal context, owner deletion and forged IDs", async ({ page }) => {
  await open(page, "technician");
  await chat(page).getByLabel("Ngữ cảnh").selectOption("INTERNAL");
  await chat(page).getByLabel("Tin nhắn").fill("Kiểm tra phân tách DEMO");
  await send(page).click();
  await expect(
    chat(page).getByRole("list", { name: "Tin nhắn" }),
  ).toContainText("Phản hồi DEMO nội bộ");
  await chat(page).getByRole("button", { name: "Xóa hội thoại" }).click();
  await page.getByRole("button", { name: "Xác nhận xóa" }).click();
  await expect(chat(page).getByText(/Chưa có tin nhắn/)).toBeVisible();
  await open(page, "requester", "/assistant?id=CHAT-999");
  await expect(chat(page).getByRole("alert")).toContainText(
    "Không tìm thấy hội thoại",
  );
});

for (const [ref, role] of [
  ["ai-requester", "requester"],
  ["ai-tech", "technician"],
  ["ai-normal", "it_manager"],
]) {
  test(`compare conversation ${ref}`, async ({ page, context }) => {
    await open(page, role);
    await page.getByRole("link", { name: "Hướng dẫn hỗ trợ DEMO" }).click();
    await expect(
      chat(page).getByRole("list", { name: "Tin nhắn" }),
    ).toBeVisible();
    await capture(page, context, "FE-14.01", ref, "05-ai.html");
  });
}
