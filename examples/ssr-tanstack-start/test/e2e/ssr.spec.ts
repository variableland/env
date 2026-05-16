import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

test("SSR HTML contains EnvScript with the public env JSON", async ({ request }) => {
  const res = await request.get("/");
  expect(res.ok()).toBe(true);
  const html = await res.text();

  const match = html.match(/<script[^>]*id="env"[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/);
  expect(match, 'expected <script id="env"> in SSR output').not.toBeNull();
  const json = match?.[1];
  if (!json) throw new Error("regex captured an empty JSON body");
  const parsed = JSON.parse(json);
  expect(parsed).toEqual({
    ENV: "production",
    API_BASE_URL: "https://api.example.com",
    APP_NAME: "tss-prod-app",
  });
});

test("server secrets never leak into SSR HTML", async ({ request }) => {
  const res = await request.get("/");
  const html = await res.text();
  expect(html).not.toContain("postgres://localhost/prod");
  expect(html).not.toContain("this-is-a-very-long-session-secret");
});

test("rendered values match between server and client after hydration", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("mode")).toHaveText("production");
  await expect(page.getByTestId("app-name")).toHaveText("tss-prod-app");
  await expect(page.getByTestId("api-base-url")).toHaveText("https://api.example.com");

  const consoleErrors: string[] = [];
  page.on("pageerror", (err) => consoleErrors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.reload();
  await expect(page.getByTestId("app-name")).toHaveText("tss-prod-app");

  const hydrationErrors = consoleErrors.filter((m) => /hydrat/i.test(m));
  expect(hydrationErrors, hydrationErrors.join("\n")).toHaveLength(0);
});

test("EnvScript tag is accessible from the client DOM after hydration", async ({ page }) => {
  // TanStack Start lazy-executes route modules (env.public.ts isn't imported
  // on initial load), so `window.__env` — populated by the env package's
  // `readEnv()` cache — won't be set unless the app touches it. Instead we
  // verify the contract that matters: the `<script id="env">` tag the server
  // wrote via `<EnvScript />` survives hydration and carries the public env
  // payload. The env package's `readEnv()` reads from this script on demand.
  await page.goto("/");
  const fromScript = await page.evaluate(() => {
    const el = document.getElementById("env");
    return el ? JSON.parse(el.textContent ?? "{}") : null;
  });
  expect(fromScript).toEqual({
    ENV: "production",
    API_BASE_URL: "https://api.example.com",
    APP_NAME: "tss-prod-app",
  });
});

test("client bundle does not embed development config values", () => {
  // Scan dist/client recursively (Vite emits hashed asset filenames into
  // dist/client/assets/ for TanStack Start client artifacts).
  const root = path.join(ROOT, "dist", "client");
  let combined = "";
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop();
    if (!dir) break;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name.endsWith(".js")) combined += readFileSync(full, "utf8");
    }
  }
  expect(combined).not.toContain("tss-dev-app");
  expect(combined).not.toContain("/dev-api");
});
