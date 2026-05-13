import { expect, test } from "@playwright/test";

test("dynamic import resolves to production.ts under vite build + preview", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("mode")).toHaveText("production");
  await expect(page.getByTestId("api-base-url")).toHaveText("https://api.example.com");
  await expect(page.getByTestId("api-timeout")).toHaveText("8000");
  await expect(page.getByTestId("feature-analytics")).toHaveText("true");
  await expect(page.getByTestId("build-label")).toHaveText("spa-dynamic-prod-e44b");
});

test("only the production chunk is fetched at runtime", async ({ page }) => {
  const requested: string[] = [];
  page.on("request", (req) => requested.push(req.url()));

  await page.goto("/");
  await expect(page.getByTestId("build-label")).toHaveText("spa-dynamic-prod-e44b");

  const configRequests = requested.filter((u) => /\/assets\/.*(development|production)/.test(u));
  expect(configRequests.some((u) => u.includes("production"))).toBe(true);
  expect(configRequests.some((u) => u.includes("development"))).toBe(false);
});
