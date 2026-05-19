# @vlandoss/env

## 0.2.1

### Patch Changes

- [#11](https://github.com/variableland/env/pull/11) [`91534e9`](https://github.com/variableland/env/commit/91534e97f2995602c8b48e36cddb67a76874c73a) Thanks [@rqbazan](https://github.com/rqbazan)! - Drop the `type-fest` dependency. `PartialDeep` is now defined locally in `src/lib/types.ts` with an equivalent shape, so the public surface of `Config<S>` and `Defaults<S>` is unchanged. One fewer transitive dep for consumers.

## 0.2.0

### Minor Changes

- [#6](https://github.com/variableland/env/pull/6) [`d150a70`](https://github.com/variableland/env/commit/d150a7006c10a240db0dd464ae4e6e8947924028) Thanks [@rqbazan](https://github.com/rqbazan)! - **BREAKING** Rename `<ClientEnv />` (in `@vlandoss/env/react`) to `<EnvScript />`. The new name stops suggesting client-side use and reflects what the component actually does: emit a `<script>` tag with the server-resolved env so the browser can read it during SSR or SSG hydration. The entrypoint path (`@vlandoss/env/react`) is unchanged. The wire format is also unchanged: the DOM `id="env"` and `window.__env` global stay identical, so HTML served by an older build continues to hydrate correctly.

  Renames included:

  - Component: `ClientEnv` → `EnvScript`
  - Props: `ClientEnvProps` → `EnvScriptProps`
  - Constants: `CLIENT_ENV_SCRIPT_ID` → `ENV_SCRIPT_ID`, `CLIENT_ENV_GLOBAL_ID` → `ENV_GLOBAL_ID`

  Migration: replace `<ClientEnv …>` with `<EnvScript …>`. If you imported the constants from the core entrypoint, update those imports too.

- [#6](https://github.com/variableland/env/pull/6) [`d150a70`](https://github.com/variableland/env/commit/d150a7006c10a240db0dd464ae4e6e8947924028) Thanks [@rqbazan](https://github.com/rqbazan)! - **BREAKING** Rename `@vlandoss/env/node` to `@vlandoss/env/fs`. The entrypoint has always been about file-system access on a Node-compatible runtime — the new name reflects that it works on Node, Bun, and Deno (not just Node), and that it does not work on Workers/Edge. The dynamic-import path resolution now uses `pathToFileURL` so Deno can load absolute paths correctly.

  Migration: replace `from "@vlandoss/env/node"` with `from "@vlandoss/env/fs"`.

### Patch Changes

- [#6](https://github.com/variableland/env/pull/6) [`d150a70`](https://github.com/variableland/env/commit/d150a7006c10a240db0dd464ae4e6e8947924028) Thanks [@rqbazan](https://github.com/rqbazan)! - Replace `lodash.merge` with [`defu`](https://github.com/unjs/defu) for the internal merge that combines `defaults + config + envOverride`. The precedence (env > config > defaults) is unchanged.

  This fixes a silent shallow-merge regression on V8 isolate runtimes (Cloudflare Workers, Vercel Edge, Next.js Edge): `lodash.merge` relies on `isPlainObject`, which returns `false` when the object originates from a different realm than the merger. The fallback path then assigns by reference instead of deep-merging, which caused leaf values present in `config` (e.g. `db.LOGGING: true`) to be dropped whenever `envOverride` touched the same parent branch.

  defu is realm-agnostic and reliably deep-merges in all the runtimes supported by the core.

- [#6](https://github.com/variableland/env/pull/6) [`d150a70`](https://github.com/variableland/env/commit/d150a7006c10a240db0dd464ae4e6e8947924028) Thanks [@rqbazan](https://github.com/rqbazan)! - Polish the package README to match the new docs site language — soften technical references to `process.env`, separate the optional `zod` install, and align the tagline with the rest of the documentation.

- [#6](https://github.com/variableland/env/pull/6) [`d150a70`](https://github.com/variableland/env/commit/d150a7006c10a240db0dd464ae4e6e8947924028) Thanks [@rqbazan](https://github.com/rqbazan)! - `readEnv()` no longer throws `ReferenceError` on runtimes where `process` is not defined (e.g. Cloudflare Workers without `nodejs_compat`). It now returns `{}` so callers can supply the environment explicitly via `defineEnv({ runtimeEnv })` — the idiomatic pattern in Worker `fetch(req, env, ctx)` handlers. Behavior on Node, Bun, Deno, browsers, and Edge runtimes that polyfill `process.env` is unchanged.

## 0.1.2

### Patch Changes

- [#4](https://github.com/variableland/env/pull/4) [`4e05752`](https://github.com/variableland/env/commit/4e057523eed79ff2b2228d8e38a3353f811d4fba) Thanks [@rqbazan](https://github.com/rqbazan)! - Slim down package README and move full documentation to the new Fumadocs site

## 0.1.1

### Patch Changes

- [#2](https://github.com/variableland/env/pull/2) [`f2d9b91`](https://github.com/variableland/env/commit/f2d9b9179327dab8d3e1d0e77a7766840244501e) Thanks [@rqbazan](https://github.com/rqbazan)! - - Fix `homepage` URL in `package.json` after flattening the monorepo (`packages/env` → `package`).
  - Add `keywords` to `package.json` for npm discoverability.

## 0.1.0

### Minor Changes

- [`42c6eb7`](https://github.com/variableland/env/commit/42c6eb7ea8f81b3a315bc52235fb52856c893eeb) Thanks [@rqbazan](https://github.com/rqbazan)! - Initial public release of `@vlandoss/env` under the `@vlandoss` scope.

  Contract-first environment configuration with typed schemas:

  - `@vlandoss/env` — runtime-agnostic core (`schema`, `defineEnv`, `envName`, `readEnv`).
  - `@vlandoss/env/node` — `loadConfig` with auto-discovery or `{env}` template.
  - `@vlandoss/env/vite` — `envConfig` Vite plugin (`#config` alias + `__ENV_NAME__` build-time inject).
  - `@vlandoss/env/react` — `<ClientEnv />` for SSR/SSG.
  - `@vlandoss/env/zod` — opt-in opinionated Zod primitives (`port`, `host`, `bool`, `logLevel`, `secret`).
