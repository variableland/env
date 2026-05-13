import { expect, test } from "@playwright/test";

test("loads development config via auto-discovery", async ({ request }) => {
  const res = await request.get("/env");
  expect(res.ok()).toBe(true);
  const body = (await res.json()) as {
    name: string;
    isDev: boolean;
    isProd: boolean;
    log: { LEVEL: string };
    server: { PORT: number; HOST: string };
    db: { URL: string };
  };
  expect(body.name).toBe("development");
  expect(body.isDev).toBe(true);
  expect(body.isProd).toBe(false);
  expect(body.log).toEqual({ LEVEL: "debug" });
  expect(body.server).toEqual({ PORT: 3001, HOST: "127.0.0.1" });
});

test("DATABASE_URL env var overrides config via vars mapping", async ({ request }) => {
  const res = await request.get("/env");
  const body = (await res.json()) as { db: { URL: string } };
  expect(body.db.URL).toBe("postgres://localhost/dev");
});

test("/health responds with current env name", async ({ request }) => {
  const res = await request.get("/health");
  expect(res.ok()).toBe(true);
  expect(await res.json()).toEqual({ ok: true, env: "development" });
});
