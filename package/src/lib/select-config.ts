import { envName } from "./runtime.ts";

/**
 * Synchronously pick the config for the current environment from a map keyed by
 * env name. The sync, runtime-agnostic counterpart to `loadConfig` for config
 * files that can't use top-level `await` — files that tooling loads via
 * `require()` or bundles to CJS, where top-level await is rejected
 * (`ERR_REQUIRE_ASYNC_MODULE`).
 *
 * Pair it with static `import`s so the bundler/runtime resolves and transpiles
 * each config file at parse time — no dynamic `import()`, no `await`:
 *
 * ```ts
 * import development from "./config/development.ts";
 * import production from "./config/production.ts";
 *
 * const config = selectConfig({ development, production });
 * ```
 *
 * Selects by `envName()`. Throws when the current env has no entry — the map is
 * explicit, so a miss is almost always a typo or a forgotten environment. To
 * select a non-current env, set `ENV=…` in the process env first (same rule as
 * `loadConfig`).
 */
export function selectConfig<T>(configs: Record<string, T>): T {
  const env = envName();
  if (!Object.hasOwn(configs, env)) {
    const available = Object.keys(configs).join(", ") || "(none)";
    throw new Error(`selectConfig: no config for env "${env}". Available: ${available}.`);
  }
  return configs[env] as T;
}
