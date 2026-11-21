import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

async function open(page: Page, route = "/approvals") {
  await page.goto("/login?returnTo=" + encodeURIComponent(route));
  await page.locator("#login-email").fill("it_manager@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
}

const region = (page: Page) =>
  page.getByRole("region", { name: "Quyết định đề xuất" });
const reason = (page: Page) => region(page).getByLabel("Lý do quyết định");
const scenario = (page: Page) =>
  region(page).getByLabel("Tình huống quyết định DEMO");
const approve = (page: Page) =>
  region(page).getByRole("button", { name: "Duyệt phương án" });

for (const outcome of ["succeeded", "failed"]) {
  test(`approval remains pending until a separate ${outcome} response`, async ({
    page,
  }) => {
    await open(page);
    await approve(page).click();
    await expect(region(page).getByRole("alert")).toHaveText(
      "Nhập lý do quyết định.",
    );
    await reason(page).fill("Đối chiếu lịch và kỹ năng");
    await scenario(page).selectOption(outcome);
    await approve(page).click();
    await expect(
      region(page).locator("[data-execution=pending]"),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Phân công hiện tại" }).locator(".."),
    ).toContainText("Minh Nguyễn");
    await expect(
      region(page).locator(`[data-execution=${outcome}]`),
    ).toHaveCount(0);
    await region(page)
      .getByRole("button", { name: "Nhận kết quả thực thi DEMO" })
      .click();
    await expect(
      region(page).locator(`[data-execution=${outcome}]`),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Phân công hiện tại" }).locator(".."),
    ).toContainText("Minh Nguyễn");
  });
}

test("rejection records its reason and never queues execution", async ({
  page,
}) => {
  await open(page);
  await reason(page).fill("Giữ phân công hiện tại");
  await region(page).getByRole("button", { name: "Từ chối" }).click();
  await expect(region(page).getByRole("status")).toContainText("Đã từ chối");
  await expect(region(page).getByRole("status")).toContainText(
    "Giữ phân công hiện tại",
  );
  await expect(region(page).locator("[data-execution=none]")).toBeVisible();
});

for (const [fixture, error] of [
  ["stale", "Phiên bản đề xuất đã thay đổi"],
  ["revoked", "Chính sách điều phối đã bị thu hồi"],
  ["infeasible", "khung lịch không còn phù hợp"],
]) {
  test(`${fixture} holds decision input and blocks execution`, async ({
    page,
  }) => {
    await open(page);
    await reason(page).fill("Giữ nội dung đã nhập");
    await scenario(page).selectOption(fixture);
    await approve(page).click();
    await expect(region(page).getByRole("alert")).toContainText(error);
    await expect(reason(page)).toHaveValue("Giữ nội dung đã nhập");
    await expect(region(page).locator("[data-execution]")).toHaveCount(0);
    if (fixture === "stale") {
      await region(page)
        .getByRole("button", { name: "Tải lại ảnh chụp" })
        .click();
      await expect(reason(page)).toHaveValue("Giữ nội dung đã nhập");
      await expect(page.getByText(/RUN-DEMO-PROPOSED.*Bản 2/)).toBeVisible();
      await approve(page).click();
      await expect(
        region(page).locator("[data-execution=pending]"),
      ).toBeVisible();
    }
  });
}

test("a disabled live DEMO policy blocks the decision", async ({ page }) => {
  await open(page, "/automation/policies");
  const policy = page.getByRole("region", { name: "Chính sách điều phối" });
  await policy.getByRole("button", { name: "Chỉnh chính sách" }).click();
  await policy.getByLabel("Trạng thái chính sách mới").selectOption("off");
  await policy.getByRole("button", { name: "Xem trước chính sách" }).click();
  await policy.getByRole("button", { name: "Xác nhận lưu chính sách" }).click();
  await page.getByRole("link", { name: "Phê duyệt", exact: true }).click();
  await reason(page).fill("Kiểm tra quyền hiện hành");
  await approve(page).click();
  await expect(region(page).getByRole("alert")).toContainText(
    "Chính sách điều phối đã bị thu hồi",
  );
});

for (const ref of ["ai-approval", "ai-states"]) {
  test(`compare decision with ${ref}`, async ({ page, context }) => {
    const url = process.env.TICKET_DETAIL_DESIGN_URL;
    test.skip(!url, "Design server required");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page);
    await reason(page).fill("DEMO: Đối chiếu lịch và kỹ năng");
    await approve(page).focus();
    await expect(approve(page)).toBeFocused();
    if (ref === "ai-states") {
      await scenario(page).selectOption("stale");
      await approve(page).click();
      await expect(region(page).getByRole("alert")).toBeVisible();
    }
    const design = await context.newPage();
    await design.emulateMedia({ reducedMotion: "reduce" });
    await design.goto(url + "/05-ai.html#" + ref);
    await expect(design.locator("main")).toBeVisible();
    const dir = path.resolve("../../docs/implementation/evidence/FE-11.02");
    for (const width of [1440, 390]) {
      for (const [name, target] of [
        ["actual", page],
        ["reference", design],
      ] as const) {
        await target.setViewportSize({ width, height: 1000 });
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
  });
}
