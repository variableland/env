import { expect, test } from "@playwright/test";

test("resolves env from per-request bindings (c.env)", async ({ request }) => {
  const res = await request.get("/env");

  expect(res.ok()).toBe(true);
  expect(await res.json()).toStrictEqual({
    env: {
      $name: "development",
      IS_DEV: true,
      IS_PROD: false,
      IS_TEST: false,
      log: { LEVEL: "debug" },
      db: { URL: "postgres://localhost/dev", LOGGING: true },
    },
  });
});

test("/health responds without touching defineEnv", async ({ request }) => {
  const res = await request.get("/health");

  expect(res.ok()).toBe(true);
  expect(await res.json()).toStrictEqual({ ok: true });
});
