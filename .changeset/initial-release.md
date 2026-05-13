---
"@vlandoss/env": minor
---

Initial public release of `@vlandoss/env` under the `@vlandoss` scope.

Contract-first environment configuration with typed schemas and per-runtime entrypoints:

- `@vlandoss/env` — runtime-agnostic core (`schema`, `defineEnv`, `envName`, `readEnv`).
- `@vlandoss/env/node` — `loadConfig` with auto-discovery or `{env}` template.
- `@vlandoss/env/vite` — `envConfig` Vite plugin (`#config` alias + `__ENV_NAME__` build-time inject).
- `@vlandoss/env/react` — `<ClientEnv />` for SSR/SSG.
- `@vlandoss/env/zod` — opt-in opinionated Zod primitives (`port`, `host`, `bool`, `logLevel`, `secret`).
