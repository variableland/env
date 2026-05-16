import { expect, test } from "@playwright/test";

test("/api/env resolves through process.env polyfill on the Edge runtime", async ({ request }) => {
  const res = await request.get("/api/env");

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

test("/api/health responds 200", async ({ request }) => {
  const res = await request.get("/api/health");

  expect(res.ok()).toBe(true);
  expect(await res.json()).toStrictEqual({ ok: true });
});
