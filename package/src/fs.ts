import { readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { envName } from "./lib/runtime.ts";
import type { Config, Schema } from "./lib/types.ts";
import { isSchema } from "./lib/validate.ts";

const EXTENSIONS = [".ts", ".mts", ".cts", ".js", ".mjs", ".cjs", ".json"];
const DIRS = ["config", "src/config"];

// ─── Pure helpers (no I/O) ───────────────────────────────────────────────────

/**
 * Auto-discovery candidates: `[src/]config/<env>.{ts,mts,cts,js,mjs,cjs,json}`
 * under `cwd`, in priority order (extension outer, dir inner).
 */
function candidatePaths(env: string, cwd: string): string[] {
  const out: string[] = [];
  for (const ext of EXTENSIONS) {
    for (const dir of DIRS) {
      out.push(path.join(cwd, dir, `${env}${ext}`));
    }
  }
  return out;
}

/** Resolve a `{env}` template to an absolute path. Throws if the placeholder is missing. */
function templatePath(pattern: string, env: string, cwd: string): string {
  if (!pattern.includes("{env}")) {
    throw new Error(
      `loadConfig pattern must contain the "{env}" placeholder. Got: "${pattern}". Drop the pattern argument to use auto-discovery, or include "{env}" to substitute the current env name.`,
    );
  }
  return path.resolve(cwd, pattern.replace(/\{env\}/g, env));
}

function notFound(resolved: string, env: string, pattern: string): Error {
  return new Error(`No config file found at "${resolved}" (env="${env}", pattern="${pattern}")`);
}

const isJson = (p: string): boolean => p.endsWith(".json");

/**
 * Normalize a loaded module to the config object. Discriminates by
 * `Symbol.toStringTag === "Module"` (set by `require(esm)` on Node, Bun, and
 * Deno) so we don't confuse a CJS object that happens to own a `default`
 * property name with a real ESM namespace:
 *
 * - ES module namespace: take `.default`, or throw if the config forgot
 *   `export default`.
 * - CommonJS `module.exports`: use the value as-is (sibling keys preserved).
 */
function unwrapDefault(absPath: string, mod: unknown): unknown {
  if (mod === null || typeof mod !== "object") return mod;
  const isNamespace = (mod as Record<PropertyKey, unknown>)[Symbol.toStringTag] === "Module";
  if (isNamespace) {
    if ("default" in (mod as object)) return (mod as { default: unknown }).default;
    throw new Error(`Config file "${absPath}" must have a default export`);
  }
  // CJS `module.exports`: the value IS the config.
  return mod;
}

function normalize<S extends Schema>(
  input: S | LoadConfigOptions<S>,
): {
  schema: S;
  pattern?: string;
  cwd?: string;
} {
  return isSchema(input) ? { schema: input as S } : input;
}

// ─── I/O ──────────────────────────────────────────────────────────────────────

function isFile(p: string): boolean {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}

function loadFile(absPath: string): unknown {
  if (isJson(absPath)) {
    return JSON.parse(readFileSync(absPath, "utf8"));
  }
  // `require` loads the module synchronously. On Node ≥22.12 `require()` accepts
  // ES modules and on ≥22.18 it strips TypeScript natively; Bun and Deno do both.
  // We always require an ABSOLUTE path, so the `createRequire` referrer is only a
  // formality — basing it on the config file (not `import.meta.url`) keeps this
  // clean when the calling config is bundled to CJS (no `empty-import-meta` warning).
  const require = createRequire(pathToFileURL(absPath));
  return unwrapDefault(absPath, require(absPath));
}

// ─── Public API ──────────────────────────────────────────────────────────────

export type LoadConfigOptions<S extends Schema> = {
  /** The schema typing this config. Anchors the return type to `Config<S>`. */
  schema: S;
  /**
   * Layout template with the `{env}` placeholder, e.g. `"src/config/{env}.ts"`.
   * `{env}` is replaced with the current `envName()` and the resulting path is loaded.
   * Drop this option to fall back on auto-discovery.
   */
  pattern?: string;
  /**
   * Base directory to resolve config paths against. Defaults to `process.cwd()`.
   * Pass an explicit `cwd` when the process working directory isn't the project
   * root (orchestrators, monorepo runners, SSR workers launched from elsewhere).
   */
  cwd?: string;
};

/**
 * Synchronously load a config object for use with `defineEnv({ config })`.
 * Returns `Config<S>` directly, so it works in app code and in config files
 * that a tool loads via `require()` or bundles to CJS.
 *
 * Two call shapes:
 *
 * - `loadConfig(schema)` — **auto-discovery**. Scans
 *   `[src/]config/<envName>.{ts,mts,cts,js,mjs,cjs,json}` under `process.cwd()`
 *   and returns the first match. Returns `{}` when nothing is found (silent fallback).
 *
 * - `loadConfig({ schema, pattern?, cwd? })` — **options form**.
 *   - `pattern` (with `{env}`) resolves a single explicit path; throws if missing.
 *   - `cwd` overrides `process.cwd()` (useful when the working directory isn't
 *     the project root). Applies to both auto-discovery and template resolution.
 *
 * `schema` is a typing anchor only — runtime validation happens in `defineEnv`
 * after merging with `runtimeEnv`. No glob, no direct-path, no `env` override:
 * if you need to load a non-current env, set `ENV=…` in the process env first.
 *
 * **Module resolution & caching:** files are loaded with `require()`. Loading a
 * `.ts`/`.mts`/`.cts` config needs `require(esm)` + native TypeScript stripping
 * — native on Bun and Deno, and on **Node ≥22.18**. `.mjs`/`.js`/`.cjs` only
 * need `require(esm)` (Node ≥22.12). `.json` works on any supported Node.
 * Module loads are cached by Node/Bun/Deno's module system: repeated calls in
 * the same process for the same path return the cached module — edits to a
 * `.ts`/`.mjs`/etc. config are NOT picked up until the process restarts.
 * `.json` files are re-read on every call.
 */
export function loadConfig<S extends Schema>(schema: S): Config<S>;
export function loadConfig<S extends Schema>(options: LoadConfigOptions<S>): Config<S>;
export function loadConfig<S extends Schema>(input: S | LoadConfigOptions<S>): Config<S> {
  const { pattern, cwd: cwdOpt } = normalize(input);
  const env = envName();
  const cwd = cwdOpt ?? process.cwd();

  if (pattern === undefined) {
    for (const candidate of candidatePaths(env, cwd)) {
      if (isFile(candidate)) {
        return loadFile(candidate) as Config<S>;
      }
    }
    return {} as Config<S>;
  }

  const resolved = templatePath(pattern, env, cwd);
  if (!isFile(resolved)) {
    throw notFound(resolved, env, pattern);
  }
  return loadFile(resolved) as Config<S>;
}
