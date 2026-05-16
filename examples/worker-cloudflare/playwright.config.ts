import { defineConfig } from "@playwright/test";

const PORT = 8787;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./test/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: { baseURL: BASE_URL },
  // No `projects` — these tests don't drive a browser. The `request` fixture
  // is HTTP-only and ignores `browserName`.
  webServer: {
    // `wrangler dev` runs the worker locally on workerd, no Cloudflare login
    // required. Bindings come from `vars` in wrangler.jsonc.
    command: `wrangler dev --port ${PORT} --ip 127.0.0.1`,
    url: `${BASE_URL}/health`,
    reuseExistingServer: false,
    timeout: 30_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
