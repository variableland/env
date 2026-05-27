import { afterEach, describe, expect, it } from "vitest";
import * as z from "zod";
import { defineEnv, schema, selectConfig } from "../lib/index.ts";

const S = schema({
  server: { PORT: z.coerce.number().int(), HOST: z.string() },
});

const development = { server: { PORT: 3000, HOST: "localhost" } };
const production = { server: { PORT: 8080, HOST: "0.0.0.0" } };

afterEach(() => {
  delete process.env.ENV;
});

describe("selectConfig", () => {
  it("returns the config for the current env (envName)", () => {
    process.env.ENV = "development";
    expect(selectConfig({ development, production })).toBe(development);
  });

  it("respects ENV when selecting", () => {
    process.env.ENV = "production";
    expect(selectConfig({ development, production })).toBe(production);
  });

  it("supports custom env names", () => {
    process.env.ENV = "staging";
    const staging = { server: { PORT: 5000, HOST: "staging.local" } };
    expect(selectConfig({ development, staging })).toBe(staging);
  });

  it("throws listing available keys when the current env has no entry", () => {
    process.env.ENV = "staging";
    expect(() => selectConfig({ development, production })).toThrow(
      'selectConfig: no config for env "staging". Available: development, production.',
    );
  });

  it("reports (none) when the map is empty", () => {
    process.env.ENV = "development";
    expect(() => selectConfig({})).toThrow('selectConfig: no config for env "development". Available: (none).');
  });

  it("pipes into defineEnv as the (sync) config source", () => {
    process.env.ENV = "production";
    const env = defineEnv({
      schema: S,
      config: selectConfig({ development, production }),
      runtimeEnv: {},
    });
    // selectConfig read process.env.ENV and picked the production config
    expect(env.server.PORT).toBe(8080);
    expect(env.server.HOST).toBe("0.0.0.0");
  });
});
