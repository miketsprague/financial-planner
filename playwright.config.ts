import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3000",
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: "npx serve out -l 3000",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
