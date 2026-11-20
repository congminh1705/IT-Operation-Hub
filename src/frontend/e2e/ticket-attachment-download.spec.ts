import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

async function open(page: Page, role: string, target: string) {
  await page.goto("/login?returnTo=" + encodeURIComponent(target));
  await page.locator("#login-email").fill(role + "@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(
    page.getByRole("button", { name: "Tải demo-yeu-cau.pdf" }),
  ).toBeVisible();
}

test("requester downloads synthetic PDF and receives missing outcome without private metadata", async ({
  page,
}) => {
  await open(page, "requester", "/tickets/TKT-000128");
  await expect(page.getByText("demo-ghi-chu-noi-bo.pdf")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Ghi chú nội bộ", exact: true }),
  ).toHaveCount(0);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Tải demo-yeu-cau.pdf" }).click();
  const result = await download;
  expect(result.suggestedFilename()).toBe("DEMO-demo-yeu-cau.pdf");
  const contents = await readFile(await result.path(), "utf8");
  expect(contents).toMatch(/^%PDF-1.4/);
  expect(contents).toContain("IT Operations Hub - DEMO");
  await page.getByRole("button", { name: "Tải demo-khong-con.pdf" }).click();
  await expect(page.getByText("Tệp không còn trong phiên DEMO.")).toBeVisible();
});

test("post-transfer access is rechecked when attempting internal download", async ({
  page,
}) => {
  await open(page, "technician", "/tickets/TKT-000127?demo=download-revoked");
  await page
    .getByRole("button", { name: "Ghi chú nội bộ", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Tải demo-ghi-chu-noi-bo.pdf" })
    .click();
  await expect(page.getByText("Quyền tải tệp đã thay đổi")).toBeVisible();
  await expect(page.getByText("demo-ghi-chu-noi-bo.pdf")).toHaveCount(0);
});

test("confirmed note attachment generates DEMO content without using original bytes", async ({
  page,
}) => {
  await open(page, "technician", "/tickets/TKT-000127");
  await page
    .getByRole("button", { name: "Ghi chú nội bộ", exact: true })
    .click();
  await page.locator("#ticket-reply").fill("Ghi chú DEMO có tệp mẫu.");
  await page.locator('input[type="file"]').setInputFiles({
    name: "kiem-tra.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("ORIGINAL-FILE-TEXT"),
  });
  await page.getByRole("button", { name: "Xem trước ghi chú" }).click();
  await page.getByRole("button", { name: "Xác nhận gửi" }).click();
  await expect(page.getByText("Đã tải xong tệp DEMO")).toBeVisible();
  await page.getByRole("button", { name: "Về chi tiết yêu cầu" }).click();
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: "Tải kiem-tra.pdf" }).click();
  const result = await event;
  const contents = await readFile(await result.path(), "utf8");
  expect(contents).toContain("IT Operations Hub - DEMO");
  expect(contents).not.toContain("ORIGINAL-FILE-TEXT");
});

for (const [role, ref, id] of [
  ["technician", "ticket-it", "TKT-000127"],
  ["requester", "ticket-requester", "TKT-000128"],
]) {
  test(`compare attachment download ${ref}`, async ({ page, context }) => {
    const url = process.env.TICKET_DETAIL_DESIGN_URL;
    test.skip(!url, "Design server required");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, role, "/tickets/" + id);
    if (role === "technician")
      await page
        .getByRole("button", { name: "Ghi chú nội bộ", exact: true })
        .click();
    const design = await context.newPage();
    await design.goto(`${url}/02-tickets.html#${ref}`);
    await expect(design.locator("main")).toBeVisible();
    const folder = path.resolve("../../docs/implementation/evidence/FE-07.03");
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await design.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
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
