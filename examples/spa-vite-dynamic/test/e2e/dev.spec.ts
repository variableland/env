import { expect, test } from "@playwright/test";

test("dynamic import resolves to development.ts under vite dev", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("mode")).toHaveText("development");
  await expect(page.getByTestId("api-base-url")).toHaveText("http://localhost:3001/dev-api");
  await expect(page.getByTestId("api-timeout")).toHaveText("2000");
  await expect(page.getByTestId("build-label")).toHaveText("spa-dynamic-dev-7c21");
});
