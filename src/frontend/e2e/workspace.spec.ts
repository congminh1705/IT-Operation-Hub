import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const evidence = path.resolve(
  process.env.SHELL_EVIDENCE_DIR ?? "test-results/shell-captures",
);
fs.mkdirSync(evidence, { recursive: true });
const roles = ["requester", "technician", "manager", "admin"] as const;
const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const list: string[] = [];
  errors.set(page, list);
  page.on("pageerror", (error) => list.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") list.push(message.text());
  });
});
test.afterEach(async ({ page }) => expect(errors.get(page) ?? []).toEqual([]));

for (const role of roles) {
  test(`${role} navigation follows the role matrix with one AI Workspace`, async ({
    page,
  }) => {
    await page.goto(`/preview/workspace/${role}/dashboard`);
    const nav = page.getByRole("navigation", { name: "Điều hướng chính" });
    await expect(
      nav.getByRole("link", { name: "AI Workspace", exact: true }),
    ).toHaveCount(1);
    await expect(
      nav.getByRole("link", { name: "Tổng quan", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    if (role === "requester")
      for (const name of [
        "Công việc IT",
        "Nhân sự & lịch",
        "Báo cáo",
        "Phê duyệt",
        "Người dùng",
      ])
        await expect(nav.getByRole("link", { name, exact: true })).toHaveCount(
          0,
        );
    if (role === "technician") {
      await expect(
        nav.getByRole("link", { name: "Lịch của tôi", exact: true }),
      ).toHaveAttribute("href", /scope=mine/);
      await expect(
        nav.getByRole("link", { name: "Công việc nhóm", exact: true }),
      ).toBeVisible();
      for (const name of ["Báo cáo", "Nhật ký", "Người dùng"])
        await expect(nav.getByRole("link", { name, exact: true })).toHaveCount(
          0,
        );
    }
    if (role === "manager" || role === "admin")
      for (const name of [
        "Phê duyệt",
        "Chính sách & quy trình",
        "Báo cáo",
        "Nhật ký",
      ])
        await expect(
          nav.getByRole("link", { name, exact: true }),
        ).toBeVisible();
    await expect(
      nav.getByRole("link", { name: "Người dùng", exact: true }),
    ).toHaveCount(role === "admin" ? 1 : 0);
    await expect(
      page.getByRole("heading", {
        name: "Chức năng chưa triển khai",
        exact: true,
      }),
    ).toBeVisible();
    expect(
      await page
        .locator(".workspace-sidebar")
        .evaluate((node) => node.getBoundingClientRect().width),
    ).toBe(224);
    expect(
      await page
        .locator(".workspace-topbar")
        .evaluate((node) => node.getBoundingClientRect().height),
    ).toBe(72);
  });
  for (const width of [320, 390, 768, 1440]) {
    test(`${role} shell and drawer reflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/preview/workspace/${role}/dashboard`);
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: path.join(evidence, `actual-${role}-${width}.png`),
        fullPage: false,
      });
      if (width <= 390) {
        const trigger = page.getByRole("button", { name: "Mở điều hướng" });
        await trigger.click();
        const drawer = page.getByRole("dialog", {
          name: "Điều hướng",
          exact: true,
        });
        await expect(drawer).toBeVisible();
        await expect(
          drawer.getByRole("link", { name: "AI Workspace", exact: true }),
        ).toHaveCount(1);
        await expect(trigger).toHaveAttribute("aria-expanded", "true");
        expect(
          await drawer.evaluate(
            (node) => node.scrollWidth <= node.clientWidth + 1,
          ),
        ).toBe(true);
        await page.screenshot({
          path: path.join(evidence, `actual-${role}-drawer-${width}.png`),
          fullPage: false,
        });
        await page.keyboard.press("Escape");
        await expect(drawer).not.toBeVisible();
        await expect(trigger).toBeFocused();
      } else
        await expect(
          page.getByRole("button", { name: "Mở điều hướng" }),
        ).not.toBeVisible();
    });
  }
}

test("mobile drawer wraps focus, closes after navigation and restores the menu trigger", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/preview/workspace/admin/dashboard");
  const trigger = page.getByRole("button", { name: "Mở điều hướng" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const drawer = page.getByRole("dialog", { name: "Điều hướng", exact: true });
  const close = drawer.getByRole("button", { name: "Đóng hộp thoại" });
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    drawer.getByRole("link", { name: "Hồ sơ", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await drawer.getByRole("link", { name: "Người dùng", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/users$/);
  await expect(drawer).not.toBeVisible();
  await trigger.click();
  await expect(
    drawer.getByRole("link", { name: "Người dùng", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("account disclosure supports keyboard links, Escape and honest logout placeholder", async ({
  page,
}) => {
  await page.goto("/preview/workspace/manager/dashboard");
  const button = page.getByRole("button", { name: /^Tài khoản:/ });
  await button.focus();
  await page.keyboard.press("Space");
  const menu = page.getByRole("navigation", { name: "Tài khoản", exact: true });
  await expect(
    menu.getByRole("link", { name: "Hồ sơ", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).not.toBeVisible();
  await expect(button).toBeFocused();
  await button.click();
  await menu.getByRole("link", { name: "Đổi mật khẩu", exact: true }).click();
  await expect(page).toHaveURL(/\/profile\/security$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Đổi mật khẩu",
  );
  await button.click();
  await menu.getByRole("link", { name: "Đăng xuất", exact: true }).click();
  await expect(page).toHaveURL(/\/logout$/);
  await expect(page.getByText(/Chưa thực hiện đăng xuất/)).toBeVisible();
});

test("scoped ticket search navigates safely and personal/work active states are distinct", async ({
  page,
}) => {
  for (const role of roles) {
    await page.goto(`/preview/workspace/${role}/dashboard`);
    await page
      .getByRole("searchbox", { name: "Tìm yêu cầu trong phạm vi của bạn" })
      .fill("VPN & role=ADMIN");
    await page
      .getByRole("button", { name: "Tìm yêu cầu", exact: true })
      .click();
    await expect(page).toHaveURL(/\/tickets\?/);
    const url = new URL(page.url());
    expect(url.searchParams.get("q")).toBe("VPN & role=ADMIN");
    expect(url.searchParams.get("scope")).toBe(
      role === "requester" ? "mine" : "work",
    );
    expect(url.searchParams.has("role")).toBe(false);
    await expect(
      page.getByText("Chưa thực hiện tìm kiếm dữ liệu.", { exact: false }),
    ).toBeVisible();
    const nav = page.getByRole("navigation", { name: "Điều hướng chính" });
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
  }
});

test("all visible destinations resolve to honest placeholders with the correct active location", async ({
  page,
}) => {
  await page.goto("/preview/workspace/admin/dashboard");
  const nav = page.getByRole("navigation", { name: "Điều hướng chính" });
  const links = await nav.getByRole("link").evaluateAll((nodes) =>
    nodes.map((node) => ({
      href: node.getAttribute("href")!,
      label: node.textContent!.trim(),
    })),
  );
  for (const link of links) {
    await page.goto(link.href);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      link.label,
    );
    await expect(
      page.getByRole("heading", {
        name: "Chức năng chưa triển khai",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("navigation", { name: "Điều hướng chính" })
        .locator('[aria-current="page"]'),
    ).toHaveCount(1);
  }
});

test("URL role/scope edits never grant requester or technician internal navigation", async ({
  page,
}) => {
  await page.goto("/dashboard?role=ADMIN");
  await expect(
    page
      .getByRole("navigation", { name: "Điều hướng chính" })
      .getByRole("link", { name: "Người dùng", exact: true }),
  ).toHaveCount(0);
  await page.goto("/preview/workspace/requester/tickets?scope=work&role=ADMIN");
  await expect(page.locator('[data-effective-scope="mine"]')).toBeVisible();
  await page.goto("/preview/workspace/requester/admin/users");
  await expect(
    page.getByRole("heading", {
      name: "Bạn không có quyền truy cập",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/preview/workspace/technician/workforce?scope=organization");
  await expect(page.locator('[data-effective-scope="mine"]')).toBeVisible();
});

test("skip link, long employee names and 200% layout zoom remain usable", async ({
  page,
}) => {
  await page.goto("/preview/workspace/admin/dashboard?fixture=long-name");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Đến nội dung chính" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#workspace-main")).toBeFocused();
  expect(
    await page
      .locator(".workspace-sidebar .shell-account-summary")
      .evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
  ).toBe(true);
  await page.getByRole("button", { name: /^Tài khoản:/ }).click();
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    document.documentElement.style.zoom = "2";
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: path.join(evidence, "actual-long-name-200-percent.png"),
    fullPage: false,
  });
});

test("reference dashboards captured at matching mobile widths", async ({
  page,
}) => {
  test.skip(
    !process.env.DESIGN_REFERENCE_URL,
    "Optional reference captures require the approved design server.",
  );
  for (const role of roles) {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(
      `${process.env.DESIGN_REFERENCE_URL}/final/dashboard.html?role=${role}`,
    );
    await page
      .frameLocator("iframe")
      .locator("#sidebar")
      .waitFor({ state: "attached" });
    for (const frame of page.frames())
      await frame.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: path.join(evidence, `reference-${role}-390.png`),
      fullPage: true,
    });
  }
});
