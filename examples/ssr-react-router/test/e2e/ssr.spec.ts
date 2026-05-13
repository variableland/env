import { expect, test } from "@playwright/test";

test("SSR HTML contains ClientEnv script with the public env JSON", async ({ request }) => {
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
    APP_NAME: "rr7-prod-app",
  });
});

test("server secrets never leak into SSR HTML", async ({ request }) => {
  const res = await request.get("/");
  const html = await res.text();
  expect(html).not.toContain("postgres://localhost/prod");
  expect(html).not.toContain("this-is-a-very-long-session-secret");
  expect(html).not.toMatch(/DATABASE_URL/);
  expect(html).not.toMatch(/SESSION_SECRET/);
});

test("rendered values match between server and client after hydration", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("mode")).toHaveText("production");
  await expect(page.getByTestId("app-name")).toHaveText("rr7-prod-app");
  await expect(page.getByTestId("api-base-url")).toHaveText("https://api.example.com");

  const consoleErrors: string[] = [];
  page.on("pageerror", (err) => consoleErrors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.reload();
  await expect(page.getByTestId("app-name")).toHaveText("rr7-prod-app");

  const hydrationErrors = consoleErrors.filter((m) => /hydrat/i.test(m));
  expect(hydrationErrors, hydrationErrors.join("\n")).toHaveLength(0);
});

test("public env is reachable from window after hydration", async ({ page }) => {
  await page.goto("/");
  const fromWindow = await page.evaluate(() => {
    // biome-ignore lint/suspicious/noExplicitAny: window assertion
    return (window as any).__env ?? null;
  });
  expect(fromWindow).toEqual({
    ENV: "production",
    API_BASE_URL: "https://api.example.com",
    APP_NAME: "rr7-prod-app",
  });
});
