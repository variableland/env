# `@vlandoss/env` examples

Real-world usage examples for [`@vlandoss/env`](../package). Each example is a standalone workspace package with end-to-end tests (Playwright) that exercise real `env` failure modes — missing required vars, wrong types, per-mode config isolation, SSR↔client hydration drift.

| Example | Entry of `env` exercised | Stack |
|---|---|---|
| [`node-elysia`](./node-elysia) | `@vlandoss/env` + `@vlandoss/env/node` (`loadConfig`) + `@vlandoss/env/zod` | Elysia on Node via `@elysiajs/node` |
| [`spa-vite-plugin`](./spa-vite-plugin) | `@vlandoss/env` + `@vlandoss/env/vite` (`envConfig()` + `#config`) | Vite + React |
| [`spa-vite-dynamic`](./spa-vite-dynamic) | `@vlandoss/env` (dynamic `import()`) + `@vlandoss/env/vite` (for `__ENV_NAME__` inject only) | Vite + React |
| [`ssr-react-router`](./ssr-react-router) | `@vlandoss/env` + `@vlandoss/env/node` + `@vlandoss/env/react` (`<ClientEnv />`) + schema reuse | React Router 7 (framework mode) |
| [`ssr-tanstack-start`](./ssr-tanstack-start) | `@vlandoss/env` + `@vlandoss/env/vite` + `@vlandoss/env/react` + schema reuse | TanStack Start (via `srvx` Node adapter) |

Every example uses `@playwright/test` as its e2e runner. `node-elysia` drives the runner without a browser (the `request` fixture is HTTP-only); the 4 web examples drive a real chromium browser.

## Running

```sh
pnpm install
pnpm exec playwright install chromium    # once, for browser-based suites

# All e2e suites (5 example workspaces, runs builds + spins up real servers):
pnpm test:e2e

# Or one at a time:
pnpm --filter @examples/node-elysia        test:e2e
pnpm --filter @examples/spa-vite-plugin    test:e2e
pnpm --filter @examples/spa-vite-dynamic   test:e2e
pnpm --filter @examples/ssr-react-router   test:e2e
pnpm --filter @examples/ssr-tanstack-start test:e2e
```

`@playwright/test` and `playwright` live in the **root** `package.json` so every example shares the same browser install.
