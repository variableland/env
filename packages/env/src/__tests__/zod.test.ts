import { describe, expect, it } from "vitest";
import * as z from "zod";
import { defineEnv, schema } from "../lib/index.ts";
import * as e from "../zod.ts";

describe("@vlandoss/env/zod — primitives compose with schema()", () => {
  const Env = schema({
    server: { PORT: e.port, HOST: e.host },
    log: { LEVEL: e.logLevel, ENABLED: e.bool },
    api: { BASE_URL: z.url() },
    auth: { SECRET: e.secret },
  });

  it("port coerces and validates range", () => {
    const env = defineEnv({
      schema: Env,
      runtimeEnv: {
        SERVER_PORT: "3000",
        SERVER_HOST: "localhost",
        LOG_LEVEL: "info",
        LOG_ENABLED: "true",
        API_BASE_URL: "https://api.example.com",
        AUTH_SECRET: "this-is-a-very-long-secret-1234567890",
      },
    });
    expect(env.server.PORT).toBe(3000);
  });

  it("port rejects out-of-range", () => {
    expect(() =>
      defineEnv({
        schema: Env,
        runtimeEnv: {
          SERVER_PORT: "99999",
          SERVER_HOST: "x",
          LOG_LEVEL: "info",
          LOG_ENABLED: "true",
          API_BASE_URL: "https://x.example",
          AUTH_SECRET: "this-is-a-very-long-secret-1234567890",
        },
      }),
    ).toThrow(/server\.PORT/);
  });

  it("logLevel only accepts the canonical enum values", () => {
    expect(() =>
      defineEnv({
        schema: Env,
        runtimeEnv: {
          SERVER_PORT: "3000",
          SERVER_HOST: "x",
          LOG_LEVEL: "verbose",
          LOG_ENABLED: "false",
          API_BASE_URL: "https://x.example",
          AUTH_SECRET: "this-is-a-very-long-secret-1234567890",
        },
      }),
    ).toThrow(/log\.LEVEL/);
  });

  it("bool accepts stringbool plus real booleans", () => {
    const env = defineEnv({
      schema: Env,
      runtimeEnv: {
        SERVER_PORT: "3000",
        SERVER_HOST: "x",
        LOG_LEVEL: "info",
        LOG_ENABLED: "false",
        API_BASE_URL: "https://x.example",
        AUTH_SECRET: "this-is-a-very-long-secret-1234567890",
      },
    });
    expect(env.log.ENABLED).toBe(false);
  });

  it("secret enforces minimum length", () => {
    expect(() =>
      defineEnv({
        schema: Env,
        runtimeEnv: {
          SERVER_PORT: "3000",
          SERVER_HOST: "x",
          LOG_LEVEL: "info",
          LOG_ENABLED: "true",
          API_BASE_URL: "https://x.example",
          AUTH_SECRET: "short",
        },
      }),
    ).toThrow(/auth\.SECRET/);
  });
});
