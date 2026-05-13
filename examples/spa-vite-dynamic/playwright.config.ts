import { defineConfig } from "@playwright/test";

const DEV_PORT = 5174;
const PREVIEW_PORT = 4174;

export default defineConfig({
  testDir: "./test/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  projects: [
    {
      name: "dev",
      testMatch: /dev\.spec\.ts/,
      use: { baseURL: `http://127.0.0.1:${DEV_PORT}` },
    },
    {
      name: "prod",
      testMatch: /prod\.spec\.ts/,
      use: { baseURL: `http://127.0.0.1:${PREVIEW_PORT}` },
    },
  ],
  webServer: [
    {
      command: `vite --mode development --host 127.0.0.1 --port ${DEV_PORT} --strictPort`,
      url: `http://127.0.0.1:${DEV_PORT}`,
      reuseExistingServer: false,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: `sh -c "vite build --mode production && vite preview --host 127.0.0.1 --port ${PREVIEW_PORT} --strictPort"`,
      url: `http://127.0.0.1:${PREVIEW_PORT}`,
      reuseExistingServer: false,
      stdout: "pipe",
      stderr: "pipe",
      timeout: 120_000,
    },
  ],
});
