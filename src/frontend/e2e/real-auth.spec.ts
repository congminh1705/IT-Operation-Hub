import { execFileSync } from "node:child_process";
import { expect, test, type Page } from "@playwright/test";

const password = process.env.ITOH_REAL_E2E_PASSWORD;
const cookieName = "itoh_dev_session";
const origin = process.env.PLAYWRIGHT_BASE_URL!;
const email = (role: string) => `${role.toLowerCase()}@integration.invalid`;

test.skip(
  !password || process.env.ITOH_AUTH_MODE !== "real",
  "Use the PostgreSQL real-auth harness.",
);

async function login(page: Page, role: string, returnTo?: string) {
  await page.goto(
    returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login",
  );
  await page.locator("#login-email").fill(email(role));
  await page.locator("#login-password").fill(password!);
  await page.locator("#access-submit").click();
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

for (const role of ["REQUESTER", "TECHNICIAN", "IT_MANAGER", "ADMIN"]) {
  test(`real ${role} cookie survives reload and renders scoped navigation`, async ({
    page,
    context,
  }) => {
    await login(page, role, "//outside.invalid/path");
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText(email(role), { exact: false })).toBeVisible();
    await expect(page.locator(".workspace-footer")).not.toContainText("DEMO");
    const sidebar = page.locator(".workspace-sidebar");
    const admin = sidebar.locator('a[href="/admin/users"]');
    const work = sidebar.locator('a[href^="/work?"]');
    await expect(admin).toHaveCount(role === "ADMIN" ? 1 : 0);
    await expect(work).toHaveCount(
      role === "REQUESTER" ? 0 : role === "TECHNICIAN" ? 2 : 1,
    );
    const session = (await context.cookies()).find(
      (cookie) => cookie.name === cookieName,
    );
    expect(session).toMatchObject({
      httpOnly: true,
      sameSite: "Lax",
      path: "/",
    });
    expect(await page.evaluate(() => document.cookie)).not.toContain(
      cookieName,
    );
    await page.reload();
    await expect(page.getByText(email(role), { exact: false })).toBeVisible();
    await page.goto("/logout");
    await expect(page).toHaveURL(/\/login$/);
    expect(
      (await context.cookies()).some((cookie) => cookie.name === cookieName),
    ).toBe(false);
    const replay = await page.request.get("/api/v1/auth/me", {
      headers: { Cookie: `${cookieName}=${session!.value}` },
    });
    expect(replay.status()).toBe(401);
  });
}

test("revocation and expiry clear the real browser shell", async ({
  page,
  browser,
}) => {
  await login(page, "TECHNICIAN");
  await expect(page).toHaveURL(/\/dashboard$/);
  execFileSync(process.env.ITOH_REAL_E2E_PYTHON!, [
    process.env.ITOH_REAL_E2E_SCRIPT!,
    "expire",
    email("TECHNICIAN"),
  ]);
  await page.bringToFront();
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page).toHaveURL(/\/login\?returnTo=/);
  await expect(page.locator(".workspace-shell")).toHaveCount(0);
  await login(page, "TECHNICIAN");
  await expect(page).toHaveURL(/\/dashboard$/);
  const context = await browser.newContext({ baseURL: origin });
  try {
    const manager = await context.newPage();
    await login(manager, "ADMIN");
    await expect(manager).toHaveURL(/\/dashboard$/);
    const id = await page.request
      .get("/api/v1/auth/me")
      .then((response) => response.json())
      .then((json) => json.id);
    const csrf = await manager.request
      .get("/api/v1/auth/csrf")
      .then((response) => response.json());
    const revoked = await manager.request.patch(
      `http://127.0.0.1:8101/api/v1/users/${id}`,
      {
        headers: {
          Origin: origin,
          "X-CSRF-Token": csrf.csrf_token,
          "Idempotency-Key": "real-auth-revoke",
        },
        data: {
          expectedVersion: 1,
          active: false,
          reason: "Revoke real integration test identity",
        },
      },
    );
    expect(revoked.status()).toBe(200);
    expect(revoked.headers()["content-type"]).toContain("application/json");
  } finally {
    await context.close();
  }
  await page.bringToFront();
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page).toHaveURL(/\/login\?returnTo=/);
  await expect(page.locator(".workspace-shell")).toHaveCount(0);
});

test("wrong Origin, missing cookie and demo credentials fail closed", async ({
  page,
  context,
}, testInfo) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?returnTo=/);
  await expect(page.locator(".login-demo")).toHaveCount(0);
  await expect(page.locator(".workspace-shell")).toHaveCount(0);
  await page.screenshot({
    path: testInfo.outputPath("login-real.png"),
    animations: "disabled",
  });
  expect((await page.request.get("/preview/session")).status()).toBe(404);
  const issued = await page.request.get("/api/v1/auth/csrf?purpose=login");
  expect(issued.status()).toBe(200);
  const token = (await issued.json()).csrf_token;
  const denied = await page.request.post("/api/v1/auth/login", {
    headers: { Origin: "https://wrong.invalid", "X-CSRF-Token": token },
    data: { email: email("REQUESTER"), password },
  });
  expect(denied.status()).toBe(403);
  await context.clearCookies();
  const missing = await page.request.post("/api/v1/auth/login", {
    headers: { Origin: origin, "X-CSRF-Token": token },
    data: { email: email("REQUESTER"), password },
  });
  expect(missing.status()).toBe(403);
  await page.locator("#login-email").fill("requester@demo.invalid");
  await page.locator("#login-password").fill("demo");
  await page.locator("#access-submit").click();
  await expect(page.locator("#access-summary")).toContainText(/Admin/);
  await expect(page.locator(".workspace-shell")).toHaveCount(0);
  await expect(page.locator("#login-password")).toHaveValue("");
});

test("a delayed directory response cannot reappear after logout and account switch", async ({
  page,
}) => {
  await login(page, "ADMIN");
  await expect(page).toHaveURL(/dashboard$/);
  await page.goto("/admin/users");
  await expect(
    page.getByRole("row").filter({ hasText: "admin@integration.invalid" }),
  ).toBeVisible();
  // Hold the parsed body after Chrome has received the real response. A
  // navigation abort can no longer turn this into a cancelled network test.
  await page.addInitScript(() => {
    const original = Response.prototype.json;
    Response.prototype.json = async function () {
      const body = await original.call(this);
      if (this.url.includes("/api/v1/users?page=")) {
        document.documentElement.dataset.directoryReceived = "true";
        await new Promise<void>((resolve) =>
          window.addEventListener("release-directory", () => resolve(), {
            once: true,
          }),
        );
        document.documentElement.dataset.directoryDelivered = "true";
      }
      return body;
    };
    const sample = () => {
      if (
        sessionStorage.getItem("watch-private") &&
        [...document.querySelectorAll("tr")].some(
          (row) =>
            row.getClientRects().length &&
            row.textContent?.includes("admin@integration.invalid"),
        )
      )
        sessionStorage.setItem("private-flash", "true");
    };
    new MutationObserver(sample).observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });
    const frame = () => {
      sample();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute(
    "data-directory-received",
    "true",
  );
  const other = await page.context().newPage();
  try {
    await other.goto("/logout");
    await expect(other).toHaveURL(/login/);
    await login(other, "REQUESTER");
    await expect(other).toHaveURL(/dashboard$/);
    await page.bringToFront();
    await page.evaluate(() => {
      sessionStorage.setItem("watch-private", "true");
      window.dispatchEvent(new Event("focus"));
    });
    await expect(page.locator(".workspace-sidebar")).toContainText(
      "Integration REQUESTER",
    );
    await page.evaluate(() =>
      window.dispatchEvent(new Event("release-directory")),
    );
    await expect(page.locator("html")).toHaveAttribute(
      "data-directory-delivered",
      "true",
    );
    await page.goto("/dashboard");
    await page.goBack();
    await expect(page.locator(".workspace-sidebar")).toContainText(
      "Integration REQUESTER",
    );
    expect(
      await page.evaluate(() => sessionStorage.getItem("private-flash")),
    ).toBeNull();
  } finally {
    await other.close();
  }
});

test("restored profile stays hidden while an earlier save is settling", async ({
  page,
}) => {
  await login(page, "ADMIN", "/profile");
  await expect(page.locator("#profile-name")).toBeVisible();
  let received!: () => void;
  const saving = new Promise<void>((resolve) => {
    received = resolve;
  });
  let deliver!: () => void;
  const held = new Promise<void>((resolve) => {
    deliver = resolve;
  });
  await page.route("**/api/v1/auth/profile", async (route) => {
    const response = await route.fetch();
    expect(response.status()).toBe(200);
    received();
    await held;
    await route.fulfill({ response });
  });
  await page.locator("#profile-name").fill("Restored profile test");
  await page.locator(".profile-form button[type=submit]").click();
  await saving;
  const other = await page.context().newPage();
  try {
    await page.evaluate(() => {
      window.dispatchEvent(
        new PageTransitionEvent("pagehide", { persisted: true }),
      );
      const sample = () => {
        if (document.querySelector("#profile-name")?.getClientRects().length)
          sessionStorage.setItem("restored-private-flash", "true");
      };
      new MutationObserver(sample).observe(document, {
        subtree: true,
        attributes: true,
        childList: true,
      });
      const frame = () => {
        sample();
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
      window.dispatchEvent(
        new PageTransitionEvent("pageshow", { persisted: true }),
      );
    });
    await other.goto("/logout");
    await expect(other).toHaveURL(/login/);
    await page.bringToFront();
    await expect(page.locator("#profile-name")).toBeHidden();
    deliver();
    await expect(page).toHaveURL(/login/);
    expect(
      await page.evaluate(() =>
        sessionStorage.getItem("restored-private-flash"),
      ),
    ).toBeNull();
  } finally {
    deliver();
    await other.close();
  }
});

test("logout from the account menu revokes the cookie after a pending save", async ({
  page,
}) => {
  await login(page, "ADMIN", "/profile");
  let received!: () => void;
  const saving = new Promise<void>((resolve) => {
    received = resolve;
  });
  let deliver!: () => void;
  const held = new Promise<void>((resolve) => {
    deliver = resolve;
  });
  await page.route("**/api/v1/auth/profile", async (route) => {
    const response = await route.fetch();
    expect(response.status()).toBe(200);
    received();
    await held;
    await route.fulfill({ response });
  });
  await page.locator("#profile-name").fill("Logout race test");
  await page.locator(".profile-form button[type=submit]").click();
  await saving;
  try {
    await page.locator(".shell-avatar-button").click();
    await page.locator('a[href="/logout"]:visible').first().click();
    await expect(page).toHaveURL(/\/logout$/);
    deliver();
    await expect(page).toHaveURL(/\/login$/);
    expect((await page.request.get("/api/v1/auth/me")).status()).toBe(401);
  } finally {
    deliver();
  }
});
