# backend-node-cjs

Same Node + Hono server as [`backend-node`](../backend-node), but the server is
booted from a **CommonJS entry** ([`server.cjs`](./server.cjs) →
`require("./src/server.ts")`).

That `require()` works because `loadConfig` is **synchronous** — `src/env/index.ts`
has no top-level `await`. Write `await loadConfig(...)` instead and the `await`
makes the module async, so the same `require()` throws `ERR_REQUIRE_ASYNC_MODULE`.
This mirrors how tools that load a config via `require()` (or bundle it to CJS)
reject top-level await.

The Playwright e2e (`test/e2e`) boots the server through `server.cjs` and hits
`/env` — proving the config loaded synchronously through the require path.

```sh
mise run //examples/backend-node-cjs:test:e2e
```
