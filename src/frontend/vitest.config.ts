import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // No artificial boilerplate tests. Future task-owned tests use this runner.
    passWithNoTests: true,
    exclude: ["**/node_modules/**", "**/.next/**", "e2e/**"],
  },
});
