import { randomBytes } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";

const password = process.env.ITOH_REAL_E2E_PASSWORD!;
const verification = process.env.ITOH_REAL_E2E_VERIFICATION!;
const origin = process.env.PLAYWRIGHT_BASE_URL!;
test.skip(!password || !verification || process.env.ITOH_AUTH_MODE !== "real");

async function login(page: Page, email: string, secret = password) {
  await page.goto("/login");
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(secret);
  await page.locator("#access-submit").click();
}

async function changePassword(page: Page, old: string, next: string) {
  await page.locator("#old-password").fill(old);
  await page.locator("#new-password").fill(next);
  await page.locator("#confirm-password").fill(next);
  await page.locator(".password-form button[type=submit]").click();
}

test.beforeAll(async ({ request }) => {
  await expect
    .poll(
      async () => {
        try {
          return (
            await request.get("/api/v1/auth/csrf?purpose=login")
          ).status();
        } catch {
          return 0;
        }
      },
      { timeout: 25_000 },
    )
    .toBe(200);
});

test("profile update and password rotation revoke the other browser session", async ({
  page,
  browser,
}, info) => {
  const email = "requester@integration.invalid";
  const other = await browser.newContext({ baseURL: origin });
  const second = await other.newPage();
  try {
    await login(second, email);
    await expect(second).toHaveURL(/dashboard$/);
    await login(page, email);
    await expect(page).toHaveURL(/dashboard$/);
    await page.goto("/profile");
    await page.locator("#profile-name").fill("Integration profile confirmed");
    await page.locator(".profile-form button[type=submit]").click();
    await expect(page.locator("#profile-name")).toHaveValue(
      "Integration profile confirmed",
    );
    await expect
      .poll(
        async () =>
          (await (await page.request.get("/api/v1/auth/me")).json())
            .display_name,
      )
      .toBe("Integration profile confirmed");
    await page.screenshot({
      path: info.outputPath("profile-real.png"),
      animations: "disabled",
    });
    await page.goto("/admin/users");
    await expect(
      page.getByText("Integration profile confirmed", { exact: true }).first(),
    ).toBeVisible();
    expect((await page.request.get("/api/v1/users")).status()).toBe(403);
    await page.goto("/profile/security");
    const next = randomBytes(24).toString("base64url");
    await changePassword(page, password, next);
    await expect(page).toHaveURL(/\/login/);
    expect((await second.request.get("/api/v1/auth/me")).status()).toBe(401);
    await second.bringToFront();
    await second.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(second).toHaveURL(/\/login/);
  } finally {
    await other.close();
  }
});

test("Admin provisions a D-29 user who must rotate the temporary password", async ({
  page,
  browser,
}, info) => {
  const email = "provisioned@integration.invalid";
  const temporary = randomBytes(24).toString("base64url");
  await login(page, "admin@integration.invalid");
  await expect(page).toHaveURL(/dashboard$/);
  await page.goto("/admin/users/new");
  await expect(page.locator("[name=display_name]")).toBeVisible();
  await page.screenshot({
    path: info.outputPath("admin-user-real.png"),
    animations: "disabled",
  });
  await page.locator("[name=display_name]").fill("Provisioned Integration");
  await page.locator("[name=email]").fill(email);
  await page
    .locator("[name=department_id]")
    .selectOption({ label: "Integration IT" });
  await page.locator("[name=verification_id]").fill(verification);
  await page.locator("[name=initial_password]").fill(temporary);
  await page.locator("main form button[type=submit]").click();
  await expect
    .poll(async () => {
      const response = await page.request.get("/api/v1/users");
      if (!response.ok()) return false;
      const result = await response.json();
      return result.items.some(
        (item: { email: string }) => item.email === email,
      );
    })
    .toBe(true);
  const restricted = await browser.newContext({ baseURL: origin });
  try {
    const account = await restricted.newPage();
    await login(account, email, temporary);
    await expect(account).toHaveURL(/\/profile\/security$/);
    await expect(account.locator(".workspace-shell")).toHaveCount(0);
    expect((await account.request.get("/api/v1/auth/me")).status()).toBe(401);
    const next = randomBytes(24).toString("base64url");
    await changePassword(account, temporary, next);
    await expect(account).toHaveURL(/\/login/);
    await login(account, email, next);
    await expect(account).toHaveURL(/dashboard$/);
  } finally {
    await restricted.close();
  }
});

test("catalog changes, team membership and role conflicts preserve drafts", async ({
  page,
}, info) => {
  await login(page, "admin@integration.invalid");
  await expect(page).toHaveURL(/dashboard$/);
  const csrf = await (await page.request.get("/api/v1/auth/csrf")).json();
  const headers = (key: string) => ({
    Origin: origin,
    "X-CSRF-Token": csrf.csrf_token,
    "Idempotency-Key": key,
  });
  for (const [path, label] of [
    ["departments", "Browser Department"],
    ["categories", "Browser Category"],
    ["teams", "Browser Team"],
  ]) {
    await page.goto(`/admin/${path}`);
    const create = page.locator("main form").first();
    await create.locator("[name=name]").fill(label);
    await create.locator("button[type=submit]").click();
    await expect(
      page.getByRole("row").filter({ hasText: label }),
    ).toBeVisible();
  }
  const accounts = await (
    await page.request.get("/api/v1/users?page_size=100")
  ).json();
  const technician = accounts.items.find(
    (item: { email: string }) =>
      item.email === "technician@integration.invalid",
  );
  const team = (
    await (await page.request.get("/api/v1/teams?page_size=100")).json()
  ).items.find((item: { name: string }) => item.name === "Browser Team");
  await page
    .getByRole("row")
    .filter({ hasText: "Browser Team" })
    .getByRole("button")
    .click();
  const membership = page
    .locator("form")
    .filter({ has: page.locator("[name=user_id]") });
  await membership.locator("[name=user_id]").selectOption(technician.id);
  await membership.locator("[name=reason]").fill("Keep this membership draft");
  const changedTeam = await page.request.patch(`/api/v1/teams/${team.id}`, {
    headers: headers("concurrent-team-edit"),
    data: {
      expectedVersion: team.version,
      name: "Browser Team Updated",
      reason: "Concurrent name update",
    },
  });
  expect(changedTeam.status()).toBe(200);
  await membership.locator("button[type=submit]").click();
  await expect(membership.getByRole("alert")).toContainText("STALE_VERSION");
  await expect(membership.locator("[name=reason]")).toHaveValue(
    "Keep this membership draft",
  );
  await page.screenshot({
    path: info.outputPath("membership-conflict.png"),
    animations: "disabled",
  });

  await membership.getByRole("button", { name: /T.*i phi.*n b.*n/ }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "Browser Team Updated" }),
  ).toBeVisible();
  await membership.locator("button[type=submit]").click();
  await expect(
    membership
      .getByRole("listitem")
      .filter({ hasText: "Integration TECHNICIAN" }),
  ).toBeVisible();
  await membership.locator("[name=active]").selectOption("no");
  await expect(membership.locator("[name=reason]")).toBeVisible();
  await membership.locator("button[type=submit]").click();
  await expect(
    membership
      .getByRole("listitem")
      .filter({ hasText: "Integration TECHNICIAN" }),
  ).toHaveCount(0);

  await page.goto("/admin/users");
  await page
    .getByRole("row")
    .filter({ hasText: "technician@integration.invalid" })
    .getByRole("button")
    .click();
  const access = page
    .locator("form")
    .filter({ has: page.locator("[name=role]") });
  await access.locator("[name=role]").selectOption("IT_MANAGER");
  await access.locator("[name=reason]").fill("Keep this role draft");
  const changedUser = await page.request.patch(
    `/api/v1/users/${technician.id}`,
    {
      headers: headers("concurrent-role-edit"),
      data: {
        expectedVersion: technician.version,
        role: "REQUESTER",
        reason: "Concurrent access update",
      },
    },
  );
  expect(changedUser.status()).toBe(200);
  await access.locator("button[type=submit]").click();
  await expect(access.getByRole("alert")).toContainText("STALE_VERSION");
  await expect(access.locator("[name=role]")).toHaveValue("IT_MANAGER");
  await expect(access.locator("[name=reason]")).toHaveValue(
    "Keep this role draft",
  );
  await page.goto("/admin/sla");
  const policy = page.locator("main form");
  const response = policy.locator("[name=P1-response]");
  const before = Number(await response.inputValue());
  await response.fill(String(before + 1));
  await policy.locator("[name=reason]").fill("Browser confirmed policy update");
  await policy.locator("button[type=submit]").click();
  await expect
    .poll(
      async () =>
        (await (await page.request.get("/api/v1/sla/policy")).json())
          .priority_budgets.P1.response_seconds,
    )
    .toBe(before + 1);
});
