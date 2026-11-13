import { defineConfig } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const command = process.env.PLAYWRIGHT_USE_BUILD === "1" ? "start" : "dev";
const port = new URL(baseURL).port || "3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL,
    browserName: "chromium",
    headless: true,
    viewport: { width: 1440, height: 1000 },
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
  },
  webServer: {
    command: `pnpm exec next ${command} --hostname 127.0.0.1 --port ${port}`,
    url: `${baseURL}/preview/feedback`,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
