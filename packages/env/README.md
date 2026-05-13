# @vlandoss/env

Contract-first environment configuration. Define your env schema once with [Standard Schema](https://github.com/standard-schema/standard-schema) (Zod, Valibot, ArkType…), get a fully typed `env` object that merges per-environment config with `process.env`.

The core (`@vlandoss/env`) is **runtime-agnostic** — Node, Bun, Deno, browser, Workers, Edge. File-based config loading lives in a separate, opt-in Node entry (`@vlandoss/env/node`).

## Installation

```sh
pnpm add @vlandoss/env zod
```

## Quick start

A typical layout:

```
src/
  env/
    schema.ts      # the contract: shape + validation rules
    index.ts       # wiring: schema + config + process.env -> env
  config/
    development.ts
    production.ts
  app.ts
```

### 1. Define the schema

```ts
// src/env/schema.ts
import { schema, type Config } from "@vlandoss/env";
import * as z from "zod";

export const Env = schema({
  log: {
    LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]),
  },
  server: {
    PORT: z.coerce.number().int().positive(),
    HOST: z.string(),
  },
  db: {
    URL: z.string(),
    LOGGING: z.stringbool().or(z.boolean()).default(false),
  },
});

export type EnvConfig = Config<typeof Env>;
```

### 2. Write per-environment config files

`EnvConfig` is type-checked against the schema. Typos and wrong types fail at compile time.

```ts
// src/config/development.ts
import type { EnvConfig } from "../env/schema.ts";

export default {
  log: { LEVEL: "debug" },
  server: { PORT: 3000, HOST: "localhost" },
  db: { URL: "postgres://localhost/dev" },
} satisfies EnvConfig;
```

JSON also works (without compile-time typing):

```json
// src/config/production.json
{
  "log": { "LEVEL": "info" },
  "server": { "HOST": "0.0.0.0" }
}
```

### 3. Wire it up (Node)

```ts
// src/env/index.ts
import { defineEnv } from "@vlandoss/env";
import { loadConfig } from "@vlandoss/env/node";
import { Env } from "./schema.ts";

// loadConfig(Env) is the short form — auto-discovers `[src/]config/<envName>.{ts,…}`
// and returns `Promise<Config<typeof Env>>`. Pipes into `defineEnv` without a cast.
const config = await loadConfig(Env);

export const env = defineEnv({ schema: Env, config });
```

```ts
// src/app.ts
import { env } from "./env/index.ts";

console.log(env.server.PORT);  // number
console.log(env.db.URL);       // string
console.log(env.$name);        // "development" | "production" | ...
if (env.IS_PROD) { /* ... */ }
```

### 3'. Wire it up (SPA / browser / Workers / Edge — no file system)

See [Loading config in the browser](#loading-config-in-the-browser) below — two patterns are supported, both bundler-friendly.

## Architecture

| Entry | Runtime | What it does |
|---|---|---|
| `@vlandoss/env` | Any (Node, Bun, Deno, browser, Workers, Edge) | `schema`, `defineEnv` (sync/async), `envName`, `readEnv`, types |
| `@vlandoss/env/node` | Node only | `loadConfig` — reads `[src/]config/<envName>.{ts,mts,js,mjs,json}` via auto-discovery or a `{env}` template |
| `@vlandoss/env/vite` | Build-time | `envConfig` Vite plugin — aliases `#config` to the per-mode file **and** injects `__ENV_NAME__` so `envName()` returns the right mode in the browser |
| `@vlandoss/env/react` | SSR / SSG only | `<ClientEnv />` — serializes runtime env into a `<script>` tag (does not apply to pure SPAs) |
| `@vlandoss/env/zod` | Any | Opinionated single-purpose Zod primitives (`port`, `host`, `bool`, `logLevel`, `secret`) |

## `loadConfig` (Node)

`loadConfig` always takes a schema. Two call shapes, depending on whether you want the convention or to spell out the layout:

```ts
import { loadConfig } from "@vlandoss/env/node";
import { Env } from "./env/schema.ts";

// Short form — auto-discovery. Scans [src/]config/<envName>.{ts,mts,js,mjs,json}
// under process.cwd() (in that order) and returns the first match.
// Returns `{}` if nothing matches (silent fallback).
const config = await loadConfig(Env);

// Long form — template. The pattern MUST contain "{env}", which is replaced
// with the current envName(). Throws if the resolved file doesn't exist.
const config = await loadConfig({ schema: Env, pattern: "src/config/{env}.ts" });
```

Both return `Promise<Config<S>>` — pipes into `defineEnv` without a cast.

`schema` is a typing anchor only: no runtime validation happens in `loadConfig` (that's `defineEnv`'s job, after the merge with `runtimeEnv`).

**File handling:**
- `.ts` / `.mts` / `.js` / `.mjs` → dynamic `import()` + extract `.default` (the module **must** have a default export)
- `.json` → `readFile` + `JSON.parse`
- Paths resolve relative to `process.cwd()`

**Behavior:**
- Short form → silent `{}` fallback when nothing matches
- Template → throws when the resolved file doesn't exist, and when the pattern doesn't include `{env}`

**No glob, no direct-path, no `env` override.** If you need to load a non-current env, set `ENV=…` in the process env first (`envName()` picks it up automatically).

## How values are resolved

For every leaf in the schema, `defineEnv` looks in this order (later wins):

1. `defaults` — inline fallbacks in the `defineEnv` call
2. `config` — value from the loaded config object
3. **Environment variable** — read from `process.env` (Node) or `window.__env` (browser)

If the leaf has no value from any source and the schema is required, `defineEnv` throws naming the dot-path:

```
Invalid value at "server.PORT": Required
```

## Env var naming (auto by convention)

You don't need to map every leaf to an env var name. By default, each leaf is bound to an env var derived from its path:

| Schema path | Env var |
| --- | --- |
| `server.PORT` | `SERVER_PORT` |
| `db.URL` | `DB_URL` |
| `sessionCookie.PREFIX` | `SESSION_COOKIE_PREFIX` |
| `db.kit.LOGGING` | `DB_KIT_LOGGING` |
| `PORT` (top-level leaf) | `PORT` |

camelCase keys are converted to `SCREAMING_SNAKE_CASE` and joined with `_`.

## Overriding env var names with `vars`

When a leaf doesn't follow the convention, declare it in `vars`. Only the exceptions need to be specified.

### Per-leaf override

```ts
defineEnv({
  schema: Env,
  vars: {
    db: { URL: "DATABASE_URL" },  // DB_URL -> DATABASE_URL
  },
});
```

### Branch prefix shorthand

A string at a branch level becomes the prefix for **every** leaf under it. Use `null` to declare a flat branch (no prefix) — handy when composing schemas where the inner contract already uses fully-qualified names:

```ts
defineEnv({
  schema: Env,
  vars: {
    db: "DATABASE",   // db.URL -> DATABASE_URL, db.LOGGING -> DATABASE_LOGGING
    server: null,     // server.PORT -> PORT, server.HOST -> HOST (no branch prefix)
  },
});
```

> The empty string `""` is **not** accepted — `null` is the only way to declare a flat branch. This avoids the readability confusion of `""` (which looks like a missing value).

### Mixed mode (`$` for branch prefix + per-leaf overrides)

```ts
defineEnv({
  schema: Env,
  vars: {
    db: {
      $: "DATABASE",                // branch prefix
      LOGGING: "POSTGRES_LOGGING",  // override for this one leaf
    },
    public: {
      $: null,                      // flat branch + leaf override
      APP_NAME: "PUBLIC_APP_NAME",
    },
  },
});
```

### Type safety

The `vars` object is fully type-checked against the schema. Unknown branches, unknown leaves, non-uppercase literals, or non-string values all fail at compile time:

```ts
defineEnv({
  schema: Env,
  vars: {
    // @ts-expect-error 'cache' is not in the schema
    cache: { TTL: "CACHE_TTL" },
    server: {
      // @ts-expect-error must be uppercase
      PORT: "port",
    },
  },
});
```

## Defaults

`defaults` provides fallback values used when neither config nor env var provides one. The shape is checked against the schema's **output** type (post-coercion), so wrong types fail at compile time:

```ts
defineEnv({
  schema: Env,
  defaults: {
    server: { PORT: 3000 },
    // @ts-expect-error PORT must be a number (post-coerce InferOutput)
    // db: { URL: 42 },
  },
});
```

## Loading config in the browser

Two patterns, depending on how much bundle isolation you need. Both work in pure SPAs and in SSR/SSG client bundles.

### Pattern 1 — Dynamic import (recommended default)

Let `defineEnv` accept the module namespace from a dynamic `import()`. The bundler splits each `config/*.ts` into its own chunk; the browser only downloads the one matching `envName()`.

```ts
// src/env/index.ts
import { defineEnv, envName } from "@vlandoss/env";
import { Env } from "./schema";

export const env = await defineEnv({
  schema: Env,
  config: import(`../config/${envName()}.ts`),
});
```

Wire `envConfig()` from `@vlandoss/env/vite` into your Vite config — even if you don't import `#config`, the plugin's `__ENV_NAME__` inject is what makes `envName()` return the right value in the browser (Vite forces `NODE_ENV="production"` regardless of `--mode`, so without the inject `envName()` would always say `"development"`):

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { envConfig } from "@vlandoss/env/vite";

export default defineConfig({ plugins: [envConfig()] });
```

- `defineEnv` auto-unwraps the module namespace (no manual `.default`).
- All env configs exist as **separate chunks** in the deployment. The browser only downloads one.
- To make chunk filenames non-guessable (content-hash only, no readable prefix), configure Vite's output:

```ts
// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: "assets/[hash].js",
      },
    },
  },
});
```

You can also skip the `await` and let `defineEnv` resolve the promise itself:

```ts
export const env = defineEnv({
  schema: Env,
  config: import(`../config/${envName()}.ts`),
}); // returns Promise<Env<S>>
```

### Pattern 2 — Vite plugin (maximum isolation)

For the strictest case where you want each build artifact to **only contain its env's config** (others not present at all), use the bundled Vite plugin:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { envConfig } from "@vlandoss/env/vite";

export default defineConfig({
  plugins: [envConfig()],
});
```

```ts
// src/env/index.ts
import config from "#config";
import { defineEnv } from "@vlandoss/env";
import { Env } from "./schema";

export const env = defineEnv({ schema: Env, config });
```

TypeScript doesn't know about Vite aliases, so declare the import shape in an ambient module file once:

```ts
// src/env/config.d.ts
declare module "#config" {
  import type { EnvConfig } from "./schema.ts";
  const config: EnvConfig;
  export default config;
}
```

- The plugin injects `resolve.alias["#config"]` pointing at the file that matches Vite's `mode`.
- It also injects `define: { __ENV_NAME__: JSON.stringify(mode) }` so `envName()` returns the chosen mode in the browser, including custom modes like `staging` or `qa` (which Vite forces `NODE_ENV="production"` for — `__ENV_NAME__` beats `NODE_ENV` in `envName()`'s precedence chain).
- Discovery algorithm is identical to `loadConfig` in `@vlandoss/env/node` — searches `[src/]config/<mode>.{ts,mts,js,mjs,json}` in order.
- Only the matched file enters the bundle. Other env configs are absent from the artifact entirely.
- Requires one build per env: `vite build --mode production`, `vite build --mode staging`, etc.

Options:

```ts
envConfig({
  alias: "#config",       // default
  cwd: process.cwd(),     // default — base directory for discovery
});
```

## SSR / SSG

For server-rendered apps, split your env into a server schema (full surface) and a public schema (subset that's safe to expose to the browser). Compose the public schema **into** the server schema with schema reuse — no duplication:

```ts
// src/env/schema.public.ts
import { schema } from "@vlandoss/env";
import * as z from "zod";

export const PublicEnv = schema({
  API_BASE_URL: z.url(),
  APP_NAME: z.string().min(1),
});
```

```ts
// src/env/schema.server.ts
import { schema } from "@vlandoss/env";
import * as e from "@vlandoss/env/zod";
import * as z from "zod";
import { PublicEnv } from "./schema.public.ts";

export const ServerEnv = schema({
  secrets: {
    DATABASE_URL: z.string().min(1),
    SESSION_SECRET: e.secret,
  },
  public: PublicEnv,  // composed in — `schema()` inlines the inner shape
});
```

```ts
// src/env/env.server.ts
import { defineEnv } from "@vlandoss/env";
import { loadConfig } from "@vlandoss/env/node";
import { ServerEnv } from "./schema.server.ts";

const config = await loadConfig(ServerEnv);

export const env = defineEnv({
  schema: ServerEnv,
  config,
  vars: {
    secrets: { DATABASE_URL: "DATABASE_URL", SESSION_SECRET: "SESSION_SECRET" },
    // PublicEnv leaves are `API_BASE_URL` / `APP_NAME` at the top of the
    // public schema. `null` declares the branch as flat — no `PUBLIC_` prefix
    // is added, so server and client read the same env-var names.
    public: null,
  },
});
```

```ts
// src/env/env.public.ts — isomorphic (server + client)
// On client, defineEnv's default runtimeEnv (readEnv()) parses the <script id="env">.
import { defineEnv } from "@vlandoss/env";
import { PublicEnv } from "./schema.public.ts";

export const env = defineEnv({ schema: PublicEnv });
```

The bridge is `<ClientEnv />` from `@vlandoss/env/react`:

```tsx
// server render — pick public-safe values, inject into HTML
import { env as serverEnv } from "./env/env.server";
import { ClientEnv } from "@vlandoss/env/react";

<ClientEnv runtimeEnv={{
  ENV: serverEnv.$name,
  API_BASE_URL: serverEnv.public.API_BASE_URL,
  APP_NAME: serverEnv.public.APP_NAME,
}} />
```

`<ClientEnv />` only applies to SSR/SSG. In a pure SPA there's no server pass to inject the script tag — use the [browser patterns above](#loading-config-in-the-browser) instead.

## API reference

### Core — `@vlandoss/env`

#### `schema(input)`

Creates a Schema from a nested dictionary of Standard Schema validators. Throws if any leaf is not a Standard Schema (or another `Schema`).

Branches may also hold another `Schema` produced by `schema()` — its inner shape is inlined recursively, so you can share contracts across files:

```ts
const Public = schema({ API_BASE_URL: z.url() });
const Server = schema({ secrets: { DB: z.string().min(1) }, public: Public });
//                                                                ^ inlined
```

The normalized shape is exposed at `MySchema.shape` (replaces the previous internal field `definition`).

#### `defineEnv(options)`

Resolves and validates the final env. Returns `Env<S>` synchronously when `config` is a plain object, a module namespace, or omitted. Returns `Promise<Env<S>>` when `config` is a `Promise`.

| Option | Type | Description |
| --- | --- | --- |
| `schema` | `Schema` | Required. The schema returned by `schema()`. |
| `config` | `Config<S>` \| `ModuleNamespace<Config<S>>` \| `Promise<...>` | Plain object, ESM module namespace (from `await import(...)`), or a `Promise` resolving to either. Optional — defaults to `{}`. |
| `defaults` | `Defaults<S>` | Fallback values. Type-checked. |
| `vars` | `Vars<S>` | Env-var name overrides. Optional — auto-naming applies when omitted. Type-checked. |
| `runtimeEnv` | `Record<string, unknown>` | Source of env vars. Defaults to `process.env` (server) or `window.__env` (browser). |

Returns `Env<S>` — the parsed config plus shorthands `$name`, `IS_DEV`, `IS_TEST`, `IS_PROD`.

When the value passed to `config` looks like an ESM module (`Symbol.toStringTag === "Module"` or `__esModule === true`), `.default` is unwrapped automatically. Plain objects with a `default` key are kept as-is.

#### `envName(env?)`

Returns the current environment name. Precedence (first defined wins):

1. `env.ENV` — explicit runtime override (always wins).
2. `__ENV_NAME__` — build-time literal injected by the `envConfig()` Vite plugin. Beats `NODE_ENV` because Vite forces `NODE_ENV="production"` regardless of `--mode`, so this is the only way `envName()` can return custom modes like `staging` / `qa` in the browser.
3. `env.NODE_ENV`
4. `env.VITE_ENV`
5. `"development"` (fallback)

Accepts an optional `runtimeEnv` argument; otherwise reads from `readEnv()`.

#### `readEnv()`

Returns the raw runtime env record:
- On the server: `process.env`
- In the browser: `window.__env` if set, otherwise parses the JSON inside `<script id="env" type="application/json">` (written by `<ClientEnv />`)

### Node — `@vlandoss/env/node`

#### `loadConfig(schema)` / `loadConfig({ schema, pattern })`

Reads a config object from disk. Always returns `Promise<Config<S>>` — pipes into `defineEnv` without a cast.

| Signature | Behavior |
| --- | --- |
| `loadConfig(schema)` | Auto-discovery. Scans `[src/]config/<envName>.{ts,mts,js,mjs,json}` under `process.cwd()` and loads the first match. Returns `{}` (silent fallback) when nothing matches. |
| `loadConfig({ schema, pattern })` | Template. `pattern` must contain `{env}`, which is replaced with the current `envName()`. Throws if the resolved file doesn't exist, or if the pattern is missing `{env}`. |

`schema` is a typing anchor only; runtime validation happens in `defineEnv`. To load a non-current env, set `ENV=…` in `process.env` before calling.

### Vite — `@vlandoss/env/vite`

#### `envConfig(options?)`

Returns a Vite plugin that:

- Injects `resolve.alias["#config"]` (configurable) pointing at `[src/]config/<mode>.{ts,mts,js,mjs,json}`. Same discovery algorithm as `loadConfig`.
- Injects `define: { __ENV_NAME__: JSON.stringify(mode) }` so `envName()` returns the right mode in the browser, including custom modes (`staging`, `qa`, …). This is the only way to surface non-default modes in browser code, because Vite forces `NODE_ENV="production"` regardless of `--mode`.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `alias` | `string` | `"#config"` | The import specifier the plugin registers as an alias. |
| `cwd` | `string` | `process.cwd()` | Base directory for discovery. |

Only the matched file enters the bundle. When no file matches the current mode the alias resolves to a virtual module that throws a descriptive error **only if `#config` is imported** — so tools that introspect the Vite config (Vitest's IDE-driven discovery, third-party plugins) don't trip over a config-time error, and the dynamic-import pattern (which doesn't import `#config`) keeps working.

### Zod primitives — `@vlandoss/env/zod`

Optional opinionated set of single-purpose Zod schemas for common leaves. Zero coupling between exports — pick the ones you need, ignore the rest.

```ts
import { schema } from "@vlandoss/env";
import * as e from "@vlandoss/env/zod";

export const Env = schema({
  server: { PORT: e.port, HOST: e.host },
  log: { LEVEL: e.logLevel, ENABLED: e.bool },
  auth: { SECRET: e.secret },
});
```

| Export | Validation |
| --- | --- |
| `port` | `z.coerce.number().int().min(0).max(65535)` |
| `host` | Non-empty string |
| `bool` | `z.stringbool().or(z.boolean())` — accepts `"true"`/`"1"`/`"yes"` strings or real booleans |
| `logLevel` | `fatal | error | warn | info | debug | trace` (Pino/Bunyan) |
| `secret` | String of length ≥ 16 |

Only opinionated primitives live here. For things that are pure Zod re-exports (`z.url()`, `z.email()`, `z.string()`, `z.string().min(1)`) just use Zod directly — wrapping them in this entry would only add an indirection.

Named imports work too: `import { port, host, … } from "@vlandoss/env/zod"`. The namespace style keeps individual leaves short.

Requires `zod@^4` as a peer dependency.

### Types

| Type | Description |
| --- | --- |
| `Schema<D>` | Branded schema object returned by `schema()`. Exposes the normalized shape as `MySchema.shape`. |
| `Definition` | The normalized shape held by `Schema` — every leaf is a Standard Schema, every branch is another `Definition`. |
| `DefinitionInput` | What `schema()` accepts — like `Definition` but a branch may also be another `Schema` (inlined at call time). |
| `Normalize<D>` | Recursively replaces nested `Schema` in `D` with their `shape`. Produces the type held by `Schema<Normalize<D>>`. |
| `Config<S>` | The accepted shape of the `config` option (plain object). |
| `ConfigInput<S>` | `Config<S>` or an ESM module namespace wrapping it. |
| `ModuleNamespace<T>` | `{ default: T; readonly [Symbol.toStringTag]?: "Module" }` — the shape produced by `await import()`. |
| `Defaults<S>` | The accepted shape of the `defaults` option. |
| `Vars<D>` | The accepted shape of the `vars` option. |
| `Env<S>` | The return type of `defineEnv()` — parsed config + shorthands. |
| `DefineEnvSyncOptions<S>` / `DefineEnvAsyncOptions<S>` | The two overload shapes (sync object/module, async Promise). |
| `DefineEnvOptions<S>` | Union of the two overload shapes. |
| `InferInput<D>` / `InferOutput<D>` | Recursively infer input/output types from a schema definition. |
