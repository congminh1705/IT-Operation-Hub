import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

async function open(page: Page, role = "it_manager") {
  await page.goto("/login?returnTo=%2Fapprovals");
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
}

test("reads the long and compact proposal and exposes missing evidence by keyboard", async ({
  page,
}) => {
  await open(page);
  const detail = page.getByRole("region", {
    name: "Kiểm tra kết nối VPN · TKT-000127",
  });
  await expect(detail).toContainText("RUN-DEMO-PROPOSED");
  await expect(detail).toContainText("Minh Nguyễn");
  await expect(detail).toContainText("Lan Trần");
  await expect(detail).toContainText("90 phút còn lại");
  await expect(detail).toContainText("Không đổi · hạn xử lý ticket");
  const evidence = page.getByLabel("Bằng chứng DEMO");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(
      detail.getByRole("heading", { name: "Phân công đề xuất" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("link", { name: "Xem hoạt động điều phối" }).focus();
  await page.keyboard.press("Tab");
  await expect(evidence).toBeFocused();
  await evidence.press("ArrowDown");
  await expect(detail.getByRole("alert")).toContainText("Thiếu bằng chứng");
  await expect(detail).toContainText("Chưa có bằng chứng kỹ năng");
});

test("requester cannot read the proposal", async ({ page }) => {
  await open(page, "requester");
  await expect(
    page.getByRole("heading", { name: "Không có quyền truy cập" }).first(),
  ).toBeVisible();
  await expect(page.getByText("PROP-DEMO-PROPOSED")).toHaveCount(0);
});

for (const ref of ["ai-exception", "ai-approval"]) {
  test(`compare proposal with ${ref}`, async ({ page, context }) => {
    const url = process.env.TICKET_DETAIL_DESIGN_URL;
    test.skip(!url, "Design server required");
    await open(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.getByText("Phân công đề xuất")).toBeVisible();
    const design = await context.newPage();
    await design.emulateMedia({ reducedMotion: "reduce" });
    await design.goto(url + "/05-ai.html#" + ref);
    await expect(design.locator("main")).toBeVisible();
    const dir = path.resolve("../../docs/implementation/evidence/FE-11.01");
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
    }
  });
}
