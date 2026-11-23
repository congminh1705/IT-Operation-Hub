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

const route =
  "/reports?tab=workload&from=2026-11-18&to=2026-11-19&team=support";
const detail = (page: Page) =>
  page.getByRole("region", { name: "Công việc, công suất và sử dụng" });
const metrics = ["MET16", "MET17", "MET18", "MET19", "MET20", "MET21", "MET22"];

test("report and assistant share filter, timestamp and operational facts", async ({
  page,
}) => {
  await open(page, "it_manager", route);
  await expect(detail(page)).toBeVisible();
  const before = new URL(page.url());
  const snapshot = await page
    .locator(".reports-view")
    .getAttribute("data-report-at");
  const facts = await Promise.all(
    metrics.map((id) =>
      detail(page).locator(`[data-report-metric=${id}] dd`).innerText(),
    ),
  );
  expect(facts[0]).toBe("5");
  expect(facts[1]).toBe("360 phút");
  expect(facts[2]).toBe("5");
  expect(facts[3]).toBe("1");
  expect(facts[4]).toBe("1 thành công · 1 thất bại · 0 xung đột");
  expect(facts[5]).toBe("20 phút · n=1");
  expect(facts[6]).toBe("Chưa biết");
  await expect(detail(page)).toContainText(
    "Chưa phân bổ 1 công việc · 60 phút",
  );
  await expect(detail(page)).toContainText("Lượt DEMO trong kỳ 2");
  const riskLinks = detail(page).getByRole("link", { name: /^T\d{2}/ });
  await expect(riskLinks).toHaveCount(5);
  await page
    .getByRole("link", { name: "Giải thích số liệu trong AI Workspace" })
    .click();
  const card = page.getByRole("region", { name: "Giải thích báo cáo" });
  await expect(card.locator("[data-report-context]")).toContainText(
    "2026-11-18 → 2026-11-19",
  );
  const after = new URL(page.url());
  for (const key of ["from", "to", "team"])
    expect(after.searchParams.get(key)).toBe(before.searchParams.get(key));
  await expect(card).toHaveAttribute(
    "data-report-at",
    after.searchParams.get("at")!,
  );
  expect(after.searchParams.get("at")).toBe(snapshot);
  const observed = await Promise.all(
    metrics.map((id) =>
      card.locator(`[data-report-metric=${id}] dd`).innerText(),
    ),
  );
  expect(observed).toEqual(facts);
});

test("report error preserves selected period on retry and forged assistant context is denied", async ({
  page,
}) => {
  await open(page, "it_manager", route + "&demo=report-error");
  await expect(page.getByText("Chưa tải được báo cáo DEMO")).toBeVisible();
  await expect(detail(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Thử lại" }).click();
  await expect(detail(page)).toBeVisible();
  const params = new URL(page.url()).searchParams;
  expect(params.get("from")).toBe("2026-11-18");
  await open(page, "requester", "/assistant?report=1&" + params.toString());
  await expect(page.getByRole("region", { name: "Trò chuyện" })).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Giải thích báo cáo" }),
  ).toHaveCount(0);
});

for (const [name, reference] of [
  ["operations", "07-monitoring.html#reports"],
  ["explanation", "05-ai.html#ai-normal"],
]) {
  test(`compare report parity ${name}`, async ({ page, context }) => {
    await open(page, "it_manager", route);
    if (name === "explanation") {
      await page
        .getByRole("link", { name: "Giải thích số liệu trong AI Workspace" })
        .click();
      await expect(
        page.getByRole("region", { name: "Giải thích báo cáo" }),
      ).toBeVisible();
    } else await expect(detail(page)).toBeVisible();
    await capture(page, context, "FE-16.03", name, reference);
  });
}
