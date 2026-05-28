import { afterEach, beforeEach, describe, expect, expectTypeOf, it } from "vitest";
import * as z from "zod";
import { loadConfig } from "../fs.ts";
import { type Config, defineEnv, schema } from "../lib/index.ts";

const S = schema({
  server: { PORT: z.coerce.number().int(), HOST: z.string() },
});

const fixturesDir = new URL("./fixtures", import.meta.url).pathname;
const mjsDir = new URL("./fixtures-mjs", import.meta.url).pathname;
const tsDir = new URL("./fixtures-ts", import.meta.url).pathname;
const cjsDir = new URL("./fixtures-cjs", import.meta.url).pathname;
const originalCwd = process.cwd();

afterEach(() => {
  process.chdir(originalCwd);
  delete process.env.ENV;
});

describe("loadConfig(schema) — auto-discovery", () => {
  beforeEach(() => {
    process.env.ENV = "development";
  });

  it("discovers config/<envName>.json under cwd", () => {
    process.chdir(fixturesDir);
    const env = defineEnv({ schema: S, config: loadConfig(S), runtimeEnv: {} });
    expect(env.server.PORT).toBe(3000);
    expect(env.server.HOST).toBe("localhost");
  });

  it("loads a .ts config via require()", () => {
    process.chdir(tsDir);
    const env = defineEnv({ schema: S, config: loadConfig(S), runtimeEnv: {} });
    expect(env.server.PORT).toBe(4242);
    expect(env.server.HOST).toBe("ts.local");
  });

  it("loads a .cjs config (module.exports IS the config — sibling keys preserved)", () => {
    process.chdir(cjsDir);
    const env = defineEnv({ schema: S, config: loadConfig(S), runtimeEnv: {} });
    expect(env.server.PORT).toBe(8888);
    expect(env.server.HOST).toBe("cjs.local");
  });

  it("does NOT strip a CJS exports object that owns a `default` property name", () => {
    // staging.cjs: `module.exports = { default: "not-the-config", server: { PORT: 9999, ... } }`.
    // A CJS module is NOT an ES namespace (no Symbol.toStringTag === "Module"),
    // so `unwrapDefault` must return the whole exports — sibling `server` MUST survive.
    process.env.ENV = "staging";
    process.chdir(cjsDir);
    const env = defineEnv({ schema: S, config: loadConfig(S), runtimeEnv: {} });
    expect(env.server.PORT).toBe(9999);
    expect(env.server.HOST).toBe("cjs.staging");
  });

  it("falls back to src/config/<envName>.json when root has no match", () => {
    process.env.ENV = "staging";
    process.chdir(fixturesDir);
    const env = defineEnv({ schema: S, config: loadConfig(S), runtimeEnv: {} });
    expect(env.server.PORT).toBe(5000);
    expect(env.server.HOST).toBe("staging.example.com");
  });

  it("picks up .mjs when no .ts/.mts/.js precedes (extension priority)", () => {
    process.chdir(mjsDir);
    const env = defineEnv({ schema: S, config: loadConfig(S), runtimeEnv: {} });
    expect(env.server.PORT).toBe(7777);
  });

  it("returns an empty object when nothing matches (silent fallback)", () => {
    process.chdir(originalCwd); // no config/ folder at package root
    expect(loadConfig(S)).toEqual({});
  });
});

describe("loadConfig({ schema, pattern }) — template", () => {
  beforeEach(() => {
    process.env.ENV = "development";
  });

  it("substitutes {env} and loads the resolved file", () => {
    process.chdir(fixturesDir);
    const env = defineEnv({ schema: S, config: loadConfig({ schema: S, pattern: "config/{env}.json" }), runtimeEnv: {} });
    expect(env.server.PORT).toBe(3000);
  });

  it("works for .mjs", () => {
    process.chdir(mjsDir);
    const config = loadConfig({ schema: S, pattern: "config/{env}.mjs" });
    expect(config).toEqual({ server: { PORT: 7777, HOST: "mjs.local" } });
  });

  it("respects the current ENV when substituting {env}", () => {
    process.env.ENV = "production";
    process.chdir(fixturesDir);
    const env = defineEnv({ schema: S, config: loadConfig({ schema: S, pattern: "config/{env}.json" }), runtimeEnv: {} });
    expect(env.server.PORT).toBe(8080);
    expect(env.server.HOST).toBe("0.0.0.0");
  });

  it("throws when the resolved file does not exist", () => {
    process.env.ENV = "missing";
    process.chdir(fixturesDir);
    expect(() => loadConfig({ schema: S, pattern: "config/{env}.json" })).toThrow(/No config file found at/);
  });

  it("throws when the pattern is missing the {env} placeholder", () => {
    process.chdir(fixturesDir);
    expect(() => loadConfig({ schema: S, pattern: "config/development.json" })).toThrow(/must contain the "\{env\}" placeholder/);
  });

  it("throws when a .mjs module has no default export", () => {
    process.env.ENV = "broken";
    process.chdir(mjsDir);
    expect(() => loadConfig({ schema: S, pattern: "config/{env}.mjs" })).toThrow(/must have a default export/);
  });
});

describe("loadConfig — `cwd` option", () => {
  beforeEach(() => {
    process.env.ENV = "development";
  });

  it("auto-discovery resolves against `cwd` instead of process.cwd()", () => {
    // No chdir — process.cwd() is the package root (no config/ folder there).
    const env = defineEnv({ schema: S, config: loadConfig({ schema: S, cwd: fixturesDir }), runtimeEnv: {} });
    expect(env.server.PORT).toBe(3000);
    expect(env.server.HOST).toBe("localhost");
  });

  it("template `pattern` resolves against `cwd` instead of process.cwd()", () => {
    const config = loadConfig({ schema: S, pattern: "config/{env}.mjs", cwd: mjsDir });
    expect(config).toEqual({ server: { PORT: 7777, HOST: "mjs.local" } });
  });
});

describe("loadConfig — return type", () => {
  beforeEach(() => {
    process.env.ENV = "development";
    process.chdir(fixturesDir);
  });

  it("returns Config<S> directly (synchronous, not a promise)", () => {
    const config = loadConfig(S);
    expectTypeOf(config).toEqualTypeOf<Config<typeof S>>();
    const env = defineEnv({ schema: S, config, runtimeEnv: {} });
    expect(env.server.PORT).toBe(3000);
  });

  it("returns Config<S> from the options form", () => {
    const config = loadConfig({ schema: S, pattern: "config/{env}.json" });
    expectTypeOf(config).toEqualTypeOf<Config<typeof S>>();
  });
});

describe("loadConfig + defineEnv composition", () => {
  it("typical app pattern: loadConfig(schema) then pass to defineEnv (no await)", () => {
    process.env.ENV = "staging";
    process.chdir(fixturesDir);
    const config = loadConfig({ schema: S, pattern: "src/config/{env}.json" });
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
