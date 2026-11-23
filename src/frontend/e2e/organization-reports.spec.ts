import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import path from "node:path";
async function open(page: Page, role: string, target = "/dashboard") {
  await page.goto("/login?returnTo=" + encodeURIComponent(target));
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
}
async function capture(
  page: Page,
  context: BrowserContext,
  task: string,
  name: string,
  reference: string,
) {
  const base = process.env.TICKET_DETAIL_DESIGN_URL;
  test.skip(!base, "Reference server required");
  const design = await context.newPage();
  for (const target of [page, design])
    await target.emulateMedia({ reducedMotion: "reduce" });
  await design.goto(base + "/" + reference);
  if (reference.startsWith("dashboard"))
    await expect(
      design.frameLocator("iframe").locator("main h1").first(),
    ).toBeVisible();
  else await expect(design.locator("main")).toBeVisible();
  const dir = path.resolve("../../docs/implementation/evidence", task);
  for (const width of [1440, 390]) {
    for (const [kind, target] of [
      ["actual", page],
      ["reference", design],
    ] as const) {
      await target.setViewportSize({ width, height: 1000 });
      await target.evaluate(() => window.scrollTo(0, 0));
      await target.screenshot({
        path: path.join(dir, `${kind}-${name}-${width}.png`),
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

test("current backlog survives a date change and opens the exact set", async ({
  page,
}) => {
  await open(page, "it_manager", "/reports?from=2026-11-17&to=2026-11-19");
  const current = page
    .getByRole("region", { name: "Hàng đợi hiện tại" })
    .getByRole("link", { name: /MET01/ });
  const count = await current.locator("strong").innerText();
  await expect(
    page.getByRole("region", { name: "Tiếp nhận và xử lý theo ngày" }),
  ).toBeVisible();
  await page.getByLabel("Từ ngày").fill("2026-09-01");
  await page.getByLabel("Đến ngày").fill("2026-09-02");
  await page.getByRole("button", { name: "Áp dụng kỳ DEMO" }).click();
  await expect(
    page.getByText("Không có dữ liệu trong kỳ đã chọn."),
  ).toBeVisible();
  await expect(current.locator("strong")).toHaveText(count);
  await page.getByRole("link", { name: "SLA", exact: true }).click();
  await expect(
    page.getByRole("link", { name: /MET08.*n=0/ }).locator("strong"),
  ).toHaveText("—");
  await current.click();
  await expect(
    page.getByText(new RegExp("^" + count + " yêu cầu · Trang")),
  ).toBeVisible();
});
test("warranty drill-down matches and organization routes deny requester and technician", async ({
  page,
}) => {
  await open(page, "admin", "/reports");
  const warranty = page
    .getByRole("region", { name: "Bảo hành thiết bị" })
    .getByRole("link", { name: /Sắp hết hạn/ });
  const count = (await warranty.innerText()).split(" · ")[1];
  await warranty.click();
  await expect(
    page.getByText(count + " / " + count + " thiết bị"),
  ).toBeVisible();
  for (const role of ["requester", "technician"]) {
    await open(page, role, "/reports");
    await expect(
      page.getByText("Bạn không có quyền truy cập", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Hàng đợi hiện tại" }),
    ).toHaveCount(0);
  }
});
for (const [name, role, target, ref] of [
  ["manager", "it_manager", "/dashboard", "dashboard.html?role=manager"],
  ["admin", "admin", "/dashboard", "dashboard.html?role=admin"],
  [
    "reports",
    "it_manager",
    "/reports?from=2026-11-17&to=2026-11-23",
    "07-monitoring.html#reports",
  ],
]) {
  test(`compare organization report ${name}`, async ({ page, context }) => {
    await open(page, role, target);
    await expect(
      page.getByRole("region", { name: "Hàng đợi hiện tại" }),
    ).toBeVisible();
    await capture(page, context, "FE-16.02", name, ref);
  });
}
