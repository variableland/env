---
"@vlandoss/env": patch
---

`readEnv()` no longer throws `ReferenceError` on runtimes where `process` is not defined (e.g. Cloudflare Workers without `nodejs_compat`). It now returns `{}` so callers can supply the environment explicitly via `defineEnv({ runtimeEnv })` — the idiomatic pattern in Worker `fetch(req, env, ctx)` handlers. Behavior on Node, Bun, Deno, browsers, and Edge runtimes that polyfill `process.env` is unchanged.
