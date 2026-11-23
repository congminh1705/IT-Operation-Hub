import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

export async function openTicket(page: Page, role: string, route: string) {
  await page.goto("/login?returnTo=" + encodeURIComponent(route));
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(page.locator('input[type="file"]')).toBeVisible();
}

const pdf = (name: string, size = 16) => ({
  name,
  mimeType: "application/pdf",
  buffer: Buffer.alloc(size),
});

test("picker keeps the exact boundary and rejects sixth, oversize and unsupported files", async ({
  page,
}) => {
  await openTicket(page, "requester", "/tickets/new");
  await page
    .getByLabel("Mô tả", { exact: true })
    .fill("Nội dung cần được giữ nguyên.");
  const picker = page.locator('input[type="file"]');
  await picker.setInputFiles([
    pdf("boundary.pdf", 10_000_000),
    pdf("large.pdf", 10_000_001),
    {
      name: "invalid.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from("<svg/>"),
    },
  ]);
  await expect(page.getByRole("list", { name: "Tệp đã chọn" })).toContainText(
    "boundary.pdf",
  );
  await expect(
    page.locator(".ticket-attachment-picker [role=alert]"),
  ).toContainText("large.pdf");
  await expect(
    page.locator(".ticket-attachment-picker [role=alert]"),
  ).toContainText("invalid.svg");
  await picker.setInputFiles([
    pdf("two.pdf"),
    pdf("three.pdf"),
    pdf("four.pdf"),
    pdf("five.pdf"),
    pdf("six.pdf"),
  ]);
  await expect(
    page.getByRole("list", { name: "Tệp đã chọn" }).getByRole("listitem"),
  ).toHaveCount(5);
  await expect(
    page.locator(".ticket-attachment-picker [role=alert]"),
  ).toContainText("six.pdf");
  await page.getByRole("button", { name: "Bỏ tệp boundary.pdf" }).click();
  await picker.setInputFiles(pdf("six.pdf"));
  await expect(page.getByRole("list", { name: "Tệp đã chọn" })).toContainText(
    "six.pdf",
  );
  await expect(page.getByLabel("Mô tả", { exact: true })).toHaveValue(
    "Nội dung cần được giữ nguyên.",
  );
});

test("public and internal selection stay separate when switching drafts", async ({
  page,
}) => {
  await openTicket(page, "technician", "/tickets/TKT-000127");
  await page.locator("#ticket-reply").fill("Nội dung công khai");
  await page.locator('input[type="file"]').setInputFiles(pdf("public.pdf"));
  await page
    .getByRole("button", { name: "Ghi chú nội bộ", exact: true })
    .click();
  await expect(page.getByRole("list", { name: "Tệp đã chọn" })).toHaveCount(0);
  await page.locator('input[type="file"]').setInputFiles(pdf("private.pdf"));
  await page
    .getByRole("button", { name: "Trao đổi công khai", exact: true })
    .click();
  await expect(page.getByRole("list", { name: "Tệp đã chọn" })).toContainText(
    "public.pdf",
  );
  await expect(
    page.getByRole("list", { name: "Tệp đã chọn" }),
  ).not.toContainText("private.pdf");
  await expect(page.locator("#ticket-reply")).toHaveValue("Nội dung công khai");
});

for (const [role, route, ref] of [
  ["requester", "/tickets/new", "create"],
  ["technician", "/tickets/TKT-000127", "ticket-it"],
]) {
  test(`compare attachment picker ${ref}`, async ({ page, context }) => {
    const url = process.env.TICKET_DETAIL_DESIGN_URL;
    test.skip(!url, "Design server required");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openTicket(page, role, route);
    await page.locator('input[type="file"]').setInputFiles(pdf("demo.pdf"));
    const design = await context.newPage();
    await design.goto(`${url}/02-tickets.html#${ref}`);
    await expect(design.locator("main")).toBeVisible();
    const folder = path.resolve("../../docs/implementation/evidence/FE-07.01");
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await design.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page
        .locator(".ticket-attachment-picker")
        .filter({ has: page.locator('input[type="file"]') })
        .scrollIntoViewIfNeeded();
      await page.screenshot({
        path: path.join(folder, `actual-${ref}-${width}.png`),
        fullPage: true,
      });
      await design.screenshot({
        path: path.join(folder, `reference-${ref}-${width}.png`),
        fullPage: true,
      });
    }
  });
}
