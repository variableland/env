# backend-deno-cjs

Same Deno + Hono server as [`backend-deno`](../backend-deno), but the server is
booted from a **CommonJS entry** ([`server.cjs`](./server.cjs) →
`require("./src/server.ts")`).

That `require()` works because `loadConfig` is **synchronous** — `src/env/index.ts`
has no top-level `await`. Write `await loadConfig(...)` instead and the `await`
makes the module async, so Deno rejects the same `require()` ("Top-level await is
not allowed in synchronous evaluation"). This mirrors how tools that load a
config via `require()` (or bundle it to CJS) reject top-level await.

The Playwright e2e (`test/e2e`) boots the server through `server.cjs` and hits
`/env` — proving the config loaded synchronously through the require path.

```sh
mise run //examples/backend-deno-cjs:test:e2e
```

> Like `backend-deno`, `node_modules/` is hydrated with `bun install` (Deno
> can't extract local `file:` tarballs) and read via `nodeModulesDir: "manual"`.
