import { expect, test } from "@playwright/test";

test.describe("dev server (#config alias resolves to development.ts)", () => {
  test("renders development env values", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("mode")).toHaveText("development");
    await expect(page.getByTestId("api-base-url")).toHaveText("http://localhost:3001/dev-api");
    await expect(page.getByTestId("api-timeout")).toHaveText("2000");
    await expect(page.getByTestId("feature-analytics")).toHaveText("false");
    await expect(page.getByTestId("build-label")).toHaveText("dev-build-marker-9f3a");
  });
});
