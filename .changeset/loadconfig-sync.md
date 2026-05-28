---
"@vlandoss/env": minor
---

**`loadConfig` (`@vlandoss/env/fs`) is now synchronous.** It loads the config with `require()` and returns `Config<S>` directly instead of a `Promise`, so it works in app code **and** in config files that tooling loads via `require()` or bundles to CJS (where a top-level `await` is rejected).

**Migration — drop the `await`:**

```diff
- const config = await loadConfig(Env);
+ const config = loadConfig(Env);
```

`await loadConfig(...)` still returns the right value at runtime (awaiting a non-promise yields the value), but the `await` keeps the module asynchronous — so a config file that keeps it still can't be `require()`d. Remove it.

Auto-discovery now also covers `.cjs` / `.cts` (was: `.ts` `.mts` `.js` `.mjs` `.json`). The options form gains an optional `cwd` so callers can override `process.cwd()` when the working directory isn't the project root.

Files are loaded with `require()`. Runtime requirements by extension:
- `.ts` / `.mts` / `.cts` — needs native TS stripping (native in Bun/Deno, **Node ≥22.18**).
- `.mjs` / `.js` / `.cjs` — needs `require(esm)` (native in Bun/Deno, **Node ≥22.12**).
- `.json` — works on any supported Node.

The package's `engines` is **Node ≥22.12** (the `require(esm)` baseline). The `.ts` strip requirement is documented per-extension; consumers using only `.json`/`.mjs`/`.cjs` configs aren't blocked by an over-broad floor.

CJS configs (`module.exports = {...}`): a CJS exports object that owns a `default` property name is **no longer** silently stripped — `loadConfig` discriminates ESM namespaces by `Symbol.toStringTag === "Module"` and returns CJS exports as-is, so sibling keys survive.
