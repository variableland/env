import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const SERVER_PATH = fileURLToPath(new URL("../../src/server.ts", import.meta.url));

function runServer(env: Record<string, string>) {
  // Strip any seeded NODE_ENV/DATABASE_URL from the runner shell so the
  // spawned child only sees what the test explicitly passes.
  const baseEnv = { ...process.env };
  delete baseEnv.NODE_ENV;
  delete baseEnv.DATABASE_URL;

  const result = spawnSync("bun", [SERVER_PATH], {
    env: { ...baseEnv, ...env },
    encoding: "utf8",
    timeout: 8_000,
  });

  return {
    code: result.status,
    combined: (result.stdout ?? "") + (result.stderr ?? ""),
  };
}

test.describe("env validation at boot", () => {
  test("crashes when DATABASE_URL is missing in production", () => {
    const { code, combined } = runServer({
      NODE_ENV: "production",
      DATABASE_URL: "",
    });
    expect(code).not.toBe(0);
    expect(combined).toMatch(/db\.URL|DATABASE_URL/i);
  });

  test("crashes when PORT is non-numeric (coerce fails positive int)", () => {
    const { code, combined } = runServer({
      NODE_ENV: "development",
      DATABASE_URL: "postgres://localhost/dev",
      SERVER_PORT: "not-a-number",
    });
    expect(code).not.toBe(0);
    expect(combined).toMatch(/server\.PORT|PORT/i);
  });

  test("crashes for unknown log level enum value", () => {
    const { code, combined } = runServer({
      NODE_ENV: "development",
      DATABASE_URL: "postgres://localhost/dev",
      LOG_LEVEL: "verbose",
    });
    expect(code).not.toBe(0);
    expect(combined).toMatch(/log\.LEVEL|LEVEL/i);
  });

  test("crashes when no config file matches the env name (auto-discovery returns {} then validate kicks in)", () => {
    const { code, combined } = runServer({
      NODE_ENV: "staging",
      DATABASE_URL: "postgres://localhost/dev",
    });
    expect(code).not.toBe(0);
    expect(combined).toMatch(/Invalid value at/);
  });
});
