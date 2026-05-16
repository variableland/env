import { afterEach, beforeEach, describe, expect, expectTypeOf, it } from "vitest";
import * as z from "zod";
import { loadConfig } from "../fs.ts";
import { type Config, defineEnv, schema } from "../lib/index.ts";

const S = schema({
  server: { PORT: z.coerce.number().int(), HOST: z.string() },
});

const fixturesDir = new URL("./fixtures", import.meta.url).pathname;
const mjsDir = new URL("./fixtures-mjs", import.meta.url).pathname;
const originalCwd = process.cwd();

afterEach(() => {
  process.chdir(originalCwd);
  delete process.env.ENV;
});

describe("loadConfig(schema) — auto-discovery", () => {
  beforeEach(() => {
    process.env.ENV = "development";
  });

  it("discovers config/<envName>.json under cwd", async () => {
    process.chdir(fixturesDir);
    const config = await loadConfig(S);
    const env = defineEnv({ schema: S, config, runtimeEnv: {} });
    expect(env.server.PORT).toBe(3000);
    expect(env.server.HOST).toBe("localhost");
  });

  it("falls back to src/config/<envName>.json when root has no match", async () => {
    process.env.ENV = "staging";
    process.chdir(fixturesDir);
    const config = await loadConfig(S);
    const env = defineEnv({ schema: S, config, runtimeEnv: {} });
    expect(env.server.PORT).toBe(5000);
    expect(env.server.HOST).toBe("staging.example.com");
  });

  it("picks up .mjs when no .ts/.mts/.js precedes (extension priority)", async () => {
    process.chdir(mjsDir);
    const config = await loadConfig(S);
    const env = defineEnv({ schema: S, config, runtimeEnv: {} });
    expect(env.server.PORT).toBe(7777);
  });

  it("returns an empty object when nothing matches (silent fallback)", async () => {
    process.chdir(originalCwd); // no config/ folder at package root
    const config = await loadConfig(S);
    expect(config).toEqual({});
  });
});

describe("loadConfig({ schema, pattern }) — template", () => {
  beforeEach(() => {
    process.env.ENV = "development";
  });

  it("substitutes {env} and loads the resolved file", async () => {
    process.chdir(fixturesDir);
    const config = await loadConfig({ schema: S, pattern: "config/{env}.json" });
    const env = defineEnv({ schema: S, config, runtimeEnv: {} });
    expect(env.server.PORT).toBe(3000);
  });

  it("works for .mjs", async () => {
    process.chdir(mjsDir);
    const config = await loadConfig({ schema: S, pattern: "config/{env}.mjs" });
    const env = defineEnv({ schema: S, config, runtimeEnv: {} });
    expect(env.server.PORT).toBe(7777);
    expect(env.server.HOST).toBe("mjs.local");
  });

  it("respects the current ENV when substituting {env}", async () => {
    process.env.ENV = "production";
    process.chdir(fixturesDir);
    const config = await loadConfig({ schema: S, pattern: "config/{env}.json" });
    const env = defineEnv({ schema: S, config, runtimeEnv: {} });
    expect(env.server.PORT).toBe(8080);
    expect(env.server.HOST).toBe("0.0.0.0");
  });

  it("throws when the resolved file does not exist", async () => {
    process.env.ENV = "missing";
    process.chdir(fixturesDir);
    await expect(loadConfig({ schema: S, pattern: "config/{env}.json" })).rejects.toThrow(/No config file found at/);
  });

  it("throws when the pattern is missing the {env} placeholder", async () => {
    process.chdir(fixturesDir);
    await expect(loadConfig({ schema: S, pattern: "config/development.json" })).rejects.toThrow(
      /must contain the "\{env\}" placeholder/,
    );
  });

  it("throws when a .mjs module has no default export", async () => {
    process.env.ENV = "broken";
    process.chdir(mjsDir);
    await expect(loadConfig({ schema: S, pattern: "config/{env}.mjs" })).rejects.toThrow(/must have a default export/);
  });
});

describe("loadConfig — return type", () => {
  beforeEach(() => {
    process.env.ENV = "development";
    process.chdir(fixturesDir);
  });

  it("returns Promise<Config<S>> from the short form", async () => {
    const config = await loadConfig(S);
    expectTypeOf(config).toEqualTypeOf<Config<typeof S>>();
    const env = defineEnv({ schema: S, config, runtimeEnv: {} });
    expect(env.server.PORT).toBe(3000);
  });

  it("returns Promise<Config<S>> from the options form", async () => {
    const config = await loadConfig({ schema: S, pattern: "config/{env}.json" });
    expectTypeOf(config).toEqualTypeOf<Config<typeof S>>();
  });
});

describe("loadConfig + defineEnv composition", () => {
  it("typical Node app pattern: await loadConfig(schema) then pass to defineEnv", async () => {
    process.env.ENV = "staging";
    process.chdir(fixturesDir);
    const config = await loadConfig({ schema: S, pattern: "src/config/{env}.json" });
    const env = defineEnv({
      schema: S,
      config,
      defaults: { server: { PORT: 1234, HOST: "fallback" } },
      runtimeEnv: { SERVER_PORT: "9999" },
    });
    // env var beats config, config beats defaults
    expect(env.server.PORT).toBe(9999);
    expect(env.server.HOST).toBe("staging.example.com");
  });
});
