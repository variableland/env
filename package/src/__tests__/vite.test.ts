import { afterEach, describe, expect, it } from "vitest";
import { envConfig } from "../vite.ts";

const fixturesDir = new URL("./fixtures", import.meta.url).pathname;
const mjsDir = new URL("./fixtures-mjs", import.meta.url).pathname;

function invoke(plugin: ReturnType<typeof envConfig>, mode: string) {
  // biome-ignore lint/suspicious/noExplicitAny: Vite's config hook signature
  const hook = (plugin as any).config;
  return hook({}, { mode, command: "build", isPreview: false, isSsrBuild: false });
}

function invokeLoad(plugin: ReturnType<typeof envConfig>, id: string) {
  // biome-ignore lint/suspicious/noExplicitAny: Vite's load hook signature
  const hook = (plugin as any).load;
  return hook(id);
}

function invokeResolveId(plugin: ReturnType<typeof envConfig>, id: string) {
  // biome-ignore lint/suspicious/noExplicitAny: Vite's resolveId hook signature
  const hook = (plugin as any).resolveId;
  return hook(id);
}

describe("envConfig() Vite plugin", () => {
  it("returns a plugin object with the expected name", () => {
    const plugin = envConfig({ cwd: fixturesDir });
    expect(plugin.name).toBe("variableland-env-config");
  });

  it("resolves the alias to a config/<mode>.json file at the root", () => {
    const plugin = envConfig({ cwd: fixturesDir });
    const result = invoke(plugin, "development");
    expect(result.resolve.alias["#config"]).toMatch(/fixtures\/config\/development\.json$/);
  });

  it("falls back to src/config/<mode>.json when root has no match", () => {
    const plugin = envConfig({ cwd: fixturesDir });
    const result = invoke(plugin, "staging");
    expect(result.resolve.alias["#config"]).toMatch(/fixtures\/src\/config\/staging\.json$/);
  });

  it("resolves .mjs files when only those exist", () => {
    const plugin = envConfig({ cwd: mjsDir });
    const result = invoke(plugin, "development");
    expect(result.resolve.alias["#config"]).toMatch(/fixtures-mjs\/config\/development\.mjs$/);
  });

  it("does NOT throw at config-resolution when no config matches the mode", () => {
    // Vitest's IDE extension and other config-introspecting tools load the
    // Vite config without ever importing `#config`. Throwing eagerly would
    // break them. The error is deferred to load-time (see next test).
    const plugin = envConfig({ cwd: fixturesDir });
    expect(() => invoke(plugin, "missing")).not.toThrow();
  });

  it("aliases to a virtual module when no config matches the mode", () => {
    const plugin = envConfig({ cwd: fixturesDir });
    const result = invoke(plugin, "missing");
    const target = result.resolve.alias["#config"];
    expect(target).toMatch(/^\0variableland-env-config:missing$/);
    // resolveId must claim the virtual id so Vite doesn't try to read it from disk
    expect(invokeResolveId(plugin, target)).toBe(target);
  });

  it("throws a descriptive error at load time when #config is imported with no matching config file", () => {
    const plugin = envConfig({ cwd: fixturesDir });
    const result = invoke(plugin, "missing");
    const virtualId = result.resolve.alias["#config"];
    expect(() => invokeLoad(plugin, virtualId)).toThrow(/no config file found for env "missing"/);
  });

  it("still injects __ENV_NAME__ when no config matches the mode", () => {
    // The dynamic-import pattern uses `envName()` (powered by __ENV_NAME__)
    // without ever importing `#config` — that path must keep working.
    const plugin = envConfig({ cwd: fixturesDir });
    const result = invoke(plugin, "qa");
    expect(result.define.__ENV_NAME__).toBe('"qa"');
  });

  it("respects a custom alias name", () => {
    const plugin = envConfig({ cwd: fixturesDir, alias: "@app/env-config" });
    const result = invoke(plugin, "development");
    expect(result.resolve.alias["@app/env-config"]).toBeDefined();
    expect(result.resolve.alias["#config"]).toBeUndefined();
  });

  it("uses process.cwd() by default", () => {
    // Just verify the plugin doesn't blow up at construction time with no opts.
    const plugin = envConfig();
    expect(plugin.name).toBe("variableland-env-config");
  });

  it("injects __ENV_NAME__ as a stringified mode in `define`", () => {
    const plugin = envConfig({ cwd: fixturesDir });
    const result = invoke(plugin, "production");
    expect(result.define.__ENV_NAME__).toBe('"production"');
  });

  it("propagates a custom mode like 'staging' through __ENV_NAME__", () => {
    const plugin = envConfig({ cwd: fixturesDir });
    const result = invoke(plugin, "staging");
    expect(result.define.__ENV_NAME__).toBe('"staging"');
  });

  describe("VITE_ENV resolution", () => {
    afterEach(() => {
      delete process.env.VITE_ENV;
      delete process.env.APP_ENV;
    });

    it("prefers VITE_ENV over Vite's mode for discovery and __ENV_NAME__", () => {
      process.env.VITE_ENV = "staging";
      const plugin = envConfig({ cwd: fixturesDir });
      // `--mode development` would resolve config/development.json, but VITE_ENV wins.
      const result = invoke(plugin, "development");
      expect(result.resolve.alias["#config"]).toMatch(/fixtures\/src\/config\/staging\.json$/);
      expect(result.define.__ENV_NAME__).toBe('"staging"');
    });

    it("falls back to mode when VITE_ENV is unset", () => {
      const plugin = envConfig({ cwd: fixturesDir });
      const result = invoke(plugin, "development");
      expect(result.resolve.alias["#config"]).toMatch(/fixtures\/config\/development\.json$/);
      expect(result.define.__ENV_NAME__).toBe('"development"');
    });

    it("treats an empty VITE_ENV as unset and falls back to mode", () => {
      process.env.VITE_ENV = "";
      const plugin = envConfig({ cwd: fixturesDir });
      const result = invoke(plugin, "production");
      expect(result.define.__ENV_NAME__).toBe('"production"');
    });

    it("honors a custom envVar name", () => {
      process.env.APP_ENV = "staging";
      const plugin = envConfig({ cwd: fixturesDir, envVar: "APP_ENV" });
      const result = invoke(plugin, "development");
      expect(result.resolve.alias["#config"]).toMatch(/fixtures\/src\/config\/staging\.json$/);
      expect(result.define.__ENV_NAME__).toBe('"staging"');
    });
  });
});
