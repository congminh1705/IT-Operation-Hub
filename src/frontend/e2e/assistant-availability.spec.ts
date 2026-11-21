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

const settings = (page: Page) =>
  page.getByRole("region", { name: "Cấu hình trợ lý AI" });
const chat = (page: Page) => page.getByRole("region", { name: "Trò chuyện" });
async function save(page: Page, mode: string) {
  await settings(page).getByLabel("Trạng thái trợ lý").selectOption(mode);
  await settings(page)
    .getByRole("button", { name: "Xem trước cấu hình" })
    .click();
  await settings(page).getByRole("button", { name: "Xác nhận lưu" }).click();
}

test("Admin validates configuration and non-Admin is denied", async ({
  page,
}) => {
  await open(page, "admin", "/admin/assistant");
  await settings(page).getByLabel("Tên cấu hình").clear();
  await settings(page)
    .getByRole("button", { name: "Xem trước cấu hình" })
    .click();
  await expect(settings(page).getByRole("alert")).toContainText(
    "Nhập tên cấu hình",
  );
  await expect(settings(page).getByLabel("Tên cấu hình")).toHaveValue("");
  await open(page, "it_manager", "/admin/assistant");
  await expect(settings(page)).toHaveCount(0);
  await expect(
    page.getByText("Bạn không có quyền truy cập", { exact: true }),
  ).toBeVisible();
});

test("disable with open draft keeps text, manual form and automation independent", async ({
  page,
}) => {
  await open(page, "admin");
  const input = chat(page).getByLabel("Tin nhắn");
  await input.fill("Tin nhắn còn nguyên khi tạm ngừng");
  await page.getByRole("button", { name: "Cấu hình nhanh DEMO" }).click();
  await save(page, "disabled");
  await settings(page).getByRole("button", { name: "Về hội thoại" }).click();
  await expect(input).toHaveValue("Tin nhắn còn nguyên khi tạm ngừng");
  await expect(
    chat(page).getByRole("button", { name: "Gửi", exact: true }),
  ).toBeDisabled();
  await expect(chat(page).getByText(/Usage DEMO/)).toBeVisible();
  await page
    .getByRole("link", { name: "Chính sách & quy trình", exact: true })
    .click();
  await page.getByRole("link", { name: "Xem hoạt động điều phối" }).click();
  await page.getByLabel("Kịch bản hoạt động DEMO").selectOption("normal");
  await expect(page.getByText("Đã thực thi trong lịch sử DEMO")).toBeVisible();
  await page.getByRole("link", { name: "AI Workspace", exact: true }).click();
  await page.getByRole("link", { name: "Tạo yêu cầu hỗ trợ" }).click();
  await expect(
    page.getByRole("heading", { name: "Tạo yêu cầu", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "AI Workspace", exact: true }).click();
  await expect(input).toHaveValue("Tin nhắn còn nguyên khi tạm ngừng");
});

test("quota, network and unavailable fixture retain unsent inputs", async ({
  page,
}) => {
  await open(page);
  const input = chat(page).getByLabel("Tin nhắn");
  const calls: string[] = [];
  page.on("request", (request) => {
    const target = new URL(request.url());
    if (/^https?:$/.test(target.protocol) && target.hostname !== "127.0.0.1")
      calls.push(request.url());
  });
  await input.fill("Nội dung cần giữ");
  for (const [fixture, message] of [
    ["quota", "Đã hết hạn mức DEMO"],
    ["network", "Lỗi mạng DEMO"],
    ["unavailable", "Trợ lý không khả dụng"],
  ]) {
    await chat(page)
      .getByLabel("Tình huống phản hồi DEMO")
      .selectOption(fixture);
    await chat(page).getByRole("button", { name: "Gửi", exact: true }).click();
    await expect(chat(page).getByRole("alert")).toContainText(message);
    await expect(input).toHaveValue("Nội dung cần giữ");
  }
  expect(calls).toHaveLength(0);
});

test("compare assistant availability state", async ({ page, context }) => {
  await open(page);
  await chat(page).getByLabel("Tin nhắn").fill("Cần hỗ trợ DEMO");
  await chat(page)
    .getByLabel("Tình huống phản hồi DEMO")
    .selectOption("unavailable");
  await chat(page).getByRole("button", { name: "Gửi", exact: true }).click();
  await expect(chat(page).getByRole("alert")).toContainText(
    "Trợ lý không khả dụng",
  );
  await capture(page, context, "FE-14.03", "ai-states", "05-ai.html");
});

test("compare admin configuration", async ({ page, context }) => {
  await open(page, "admin", "/admin/assistant");
  await save(page, "unconfigured");
  await expect(settings(page).getByRole("status")).toContainText(
    "Đã lưu cấu hình",
  );
  await capture(
    page,
    context,
    "FE-14.03",
    "ai-settings",
    "08-admin-states.html",
  );
});
