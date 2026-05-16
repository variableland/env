import { statSync } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { BUILD_TIME_ENV_NAME_ID } from "./lib/const.ts";

const EXTENSIONS = [".ts", ".mts", ".js", ".mjs", ".json"];
const DIRS = ["config", "src/config"];

/**
 * Rollup virtual-module id (the leading `\0` prevents other plugins from
 * trying to read it from disk) used as a placeholder when no config file
 * matches the current mode. The error is deferred until something actually
 * imports `#config` — see `load()` below.
 */
const VIRTUAL_MISSING_ID = "\0variableland-env-config:missing";

function findConfigFile(mode: string, cwd: string): string | undefined {
  for (const ext of EXTENSIONS) {
    for (const dir of DIRS) {
      const candidate = path.join(cwd, dir, `${mode}${ext}`);
      try {
        if (statSync(candidate).isFile()) return candidate;
      } catch {
        // not found, continue
      }
    }
  }
  return undefined;
}

export type EnvConfigOptions = {
  /** Alias the per-mode config file is exposed as. Default: `"#config"`. */
  alias?: string;
  /** Base directory for the discovery search. Default: `process.cwd()`. */
  cwd?: string;
};

/**
 * Vite plugin that:
 *
 * 1. Resolves an alias (`#config` by default) to the config file matching
 *    Vite's `mode`. Discovery is `[src/]config/<mode>.{ts,mts,js,mjs,json}` —
 *    same algorithm as `loadConfig` in `@vlandoss/env/fs`. Only the
 *    matched file enters the bundle.
 * 2. Injects `define: { __ENV_NAME__: JSON.stringify(mode) }`. The core's
 *    `envName()` reads this identifier so dynamic-import and alias patterns
 *    alike return the correct env in the browser — including custom modes
 *    like `staging` or `qa`, which Vite forces `NODE_ENV="production"` for.
 *
 * When no config file matches the current mode, the plugin still registers
 * everything correctly (the `__ENV_NAME__` inject keeps working for the
 * dynamic-import pattern that doesn't use `#config`). The alias resolves to
 * a virtual module that throws a descriptive error **only when imported** —
 * so tools that load the Vite config without touching `#config` (Vitest's
 * IDE-driven discovery, third-party plugins introspecting the config) don't
 * trip over a config-time error.
 *
 * @example
 * // vite.config.ts
 * import { defineConfig } from "vite";
 * import { envConfig } from "@vlandoss/env/vite";
 *
 * export default defineConfig({ plugins: [envConfig()] });
 *
 * // src/env/index.ts
 * import config from "#config";
 * import { defineEnv } from "@vlandoss/env";
 * import { Env } from "./schema";
 *
 * export const env = defineEnv({ schema: Env, config });
 */
export function envConfig(options: EnvConfigOptions = {}): Plugin {
  const alias = options.alias ?? "#config";
  const cwd = options.cwd ?? process.cwd();
  let resolvedMode = "";

  return {
    name: "variableland-env-config",
    config(_userConfig, { mode }) {
      resolvedMode = mode;
      const file = findConfigFile(mode, cwd);
      return {
        resolve: {
          alias: {
            [alias]: file ?? VIRTUAL_MISSING_ID,
          },
        },
        define: {
          [BUILD_TIME_ENV_NAME_ID]: JSON.stringify(mode),
        },
      };
    },
    resolveId(id) {
      if (id === VIRTUAL_MISSING_ID) return VIRTUAL_MISSING_ID;
      return undefined;
    },
    load(id) {
      if (id === VIRTUAL_MISSING_ID) {
        throw new Error(
          `@vlandoss/env/vite: no config file found for mode "${resolvedMode}" — searched [src/]config/${resolvedMode}.{ts,mts,js,mjs,json} under ${cwd}`,
        );
      }
      return undefined;
    },
  };
}
