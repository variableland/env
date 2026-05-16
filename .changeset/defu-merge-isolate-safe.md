---
"@vlandoss/env": patch
---

Replace `lodash.merge` with [`defu`](https://github.com/unjs/defu) for the internal merge that combines `defaults + config + envOverride`. The precedence (env > config > defaults) is unchanged.

This fixes a silent shallow-merge regression on V8 isolate runtimes (Cloudflare Workers, Vercel Edge, Next.js Edge): `lodash.merge` relies on `isPlainObject`, which returns `false` when the object originates from a different realm than the merger. The fallback path then assigns by reference instead of deep-merging, which caused leaf values present in `config` (e.g. `db.LOGGING: true`) to be dropped whenever `envOverride` touched the same parent branch.

defu is realm-agnostic and reliably deep-merges in all the runtimes supported by the core.
