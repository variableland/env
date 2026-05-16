import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { envName } from "./lib/runtime.ts";
import type { Config, Schema } from "./lib/types.ts";
import { isSchema } from "./lib/validate.ts";

const EXTENSIONS = [".ts", ".mts", ".js", ".mjs", ".json"];
const DIRS = ["config", "src/config"];

async function isFile(p: string): Promise<boolean> {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
}

async function loadFile(absPath: string): Promise<unknown> {
  if (absPath.endsWith(".json")) {
    const raw = await readFile(absPath, "utf8");
    return JSON.parse(raw);
  }

  const mod = (await import(pathToFileURL(absPath).href)) as { default?: unknown };
  if (!("default" in mod)) {
    throw new Error(`Config file "${absPath}" must have a default export`);
  }
  return mod.default;
}

/**
 * Auto-discovery: looks for `[src/]config/<env>.{ts,mts,js,mjs,json}` in
 * `process.cwd()`, in that order. Returns `undefined` when nothing matches.
 */
async function autoDiscover(env: string, cwd: string): Promise<unknown | undefined> {
  for (const ext of EXTENSIONS) {
    for (const dir of DIRS) {
      const candidate = path.join(cwd, dir, `${env}${ext}`);
      if (await isFile(candidate)) {
        return loadFile(candidate);
      }
    }
  }
  return undefined;
}

async function resolveTemplate(pattern: string, env: string, cwd: string): Promise<unknown> {
  if (!pattern.includes("{env}")) {
    throw new Error(
      `loadConfig pattern must contain the "{env}" placeholder. Got: "${pattern}". Drop the pattern argument to use auto-discovery, or include "{env}" to substitute the current env name.`,
    );
  }
  const resolved = path.resolve(cwd, pattern.replace(/\{env\}/g, env));
  if (!(await isFile(resolved))) {
    throw new Error(`No config file found at "${resolved}" (env="${env}", pattern="${pattern}")`);
  }
  return loadFile(resolved);
}

export type LoadConfigOptions<S extends Schema> = {
  /** The schema typing this config. Anchors the return type to `Promise<Config<S>>`. */
  schema: S;
  /**
   * Layout template with the `{env}` placeholder, e.g. `"src/config/{env}.ts"`.
   * `{env}` is replaced with the current `envName()` and the resulting path is loaded.
   * Drop this option to fall back on auto-discovery.
   */
  pattern: string;
};

/**
 * Load a config object for use with `defineEnv({ config })`. Returns
 * `Promise<Config<S>>` so it pipes into `defineEnv` without a cast.
 *
 * Two call shapes:
 *
 * - `loadConfig(schema)` — **auto-discovery**. Scans
 *   `[src/]config/<envName>.{ts,mts,js,mjs,json}` under `process.cwd()` and
 *   returns the first match. Returns `{}` when nothing is found (silent fallback).
 *
 * - `loadConfig({ schema, pattern })` — **template**. The `pattern` must
 *   contain `{env}`, which is replaced with the current env name. Throws if
 *   the resolved file doesn't exist.
 *
 * `schema` is a typing anchor only — runtime validation happens in `defineEnv`
 * after merging with `runtimeEnv`. No glob, no direct-path, no `env` override:
 * if you need to load a non-current env, set `ENV=…` in the process env first.
 */
export function loadConfig<S extends Schema>(schema: S): Promise<Config<S>>;
export function loadConfig<S extends Schema>(options: LoadConfigOptions<S>): Promise<Config<S>>;
export async function loadConfig<S extends Schema>(input: S | LoadConfigOptions<S>): Promise<Config<S>> {
  const opts: LoadConfigOptions<S> | { schema: S; pattern?: undefined } = isSchema(input) ? { schema: input as S } : input;
  const env = envName();
  const cwd = process.cwd();

  if (opts.pattern === undefined) {
    const result = await autoDiscover(env, cwd);
    return (result ?? {}) as Config<S>;
  }
  return (await resolveTemplate(opts.pattern, env, cwd)) as Config<S>;
}
