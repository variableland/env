# config-cjs

Loading `@vlandoss/env` from a **config file that can't use top-level `await`** —
the kind of config file that tooling pulls in via `require()` or bundles to CJS
(e.g. some ORM / database migration tooling).

## The problem

```ts title="db.config.broken.mts"
const config = await loadConfig(Env); // ⛔ top-level await
```

`loadConfig` is async (it uses dynamic `import()` under the hood, which is
irreducibly asynchronous). The top-level `await` makes the module an **async ES
module**. When a tool loads the config synchronously, that's rejected:

- `require()` → `ERR_REQUIRE_ASYNC_MODULE` (Node ≥22.12, where `require(esm)` is on)
- esbuild/CJS bundle → _"Top-level await is currently not supported with the cjs output format"_

## The fix: `selectConfig`

`selectConfig` is the synchronous, runtime-agnostic counterpart to `loadConfig`.
Pair it with **static `import`s** so the runtime/bundler resolves and transpiles
each config file at parse time — no dynamic import, no `await`:

```ts title="src/env/index.ts"
import { defineEnv, selectConfig } from "@vlandoss/env";
import development from "../../config/development.ts";
import production from "../../config/production.ts";
import { Env } from "./schema.ts";

export const env = defineEnv({
  schema: Env,
  config: selectConfig({ development, production }),
});
```

`db.config.mts` imports that `env` and exports a plain config object — no
top-level await anywhere — so `require()` loads it cleanly.

## Run it

```sh
mise run //examples/config-cjs:test:e2e
```

[`test/loader.test.ts`](./test/loader.test.ts) `require()`s both configs and
asserts: the `selectConfig` one loads, the `loadConfig` + top-level await one
throws `ERR_REQUIRE_ASYNC_MODULE`.

> Pinned to Node 22.22.3 — `require(esm)` is default from 22.12 and native TS
> stripping from 22.18, so this is the lowest LTS line where the reproduction
> (and the fix) behaves as described. Node 20 would throw `ERR_REQUIRE_ESM`
> instead, which is a different failure.
