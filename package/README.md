# @vlandoss/env

🌱 Contract-first environment configuration with typed schemas. Define your env once with [Standard Schema](https://github.com/standard-schema/standard-schema) (Zod, Valibot, ArkType…), get a fully typed `env` object that merges per-environment config with your environment variables.

Runtime-agnostic core — Node, Bun, Deno, browser, Workers, Edge. Opt-in adapters for Node, Vite, React (SSR), and a curated set of Zod-based environment schema primitives.

## Installation

```sh
pnpm add @vlandoss/env
```

`@vlandoss/env` is agnostic to the schema validator. If you'll use Zod (the docs default, and the validator behind the optional `@vlandoss/env/zod` primitives), install it alongside:

```sh
pnpm add zod
```

## Documentation

📚 **[env.oss.variable.land](https://env.oss.variable.land)**

- [Getting started](https://env.oss.variable.land/getting-started/installation)
- [Concepts](https://env.oss.variable.land/concepts/overview) — mental model, resolution order, env-var naming
- [Guides](https://env.oss.variable.land/guides) — recipes for Node, SPA, SSR
- [API reference](https://env.oss.variable.land/api-reference)

## Examples

Runnable apps under [`examples/`](https://github.com/variableland/env/tree/main/examples):

- [`backend-node`](https://github.com/variableland/env/tree/main/examples/backend-node) — Node server with `loadConfig`
- [`backend-bun`](https://github.com/variableland/env/tree/main/examples/backend-bun) — Bun server with `loadConfig`
- [`backend-deno`](https://github.com/variableland/env/tree/main/examples/backend-deno) — Deno server with `loadConfig`
- [`worker-cloudflare`](https://github.com/variableland/env/tree/main/examples/worker-cloudflare) — Cloudflare Worker, `runtimeEnv: c.env` per-request
- [`edge-nextjs`](https://github.com/variableland/env/tree/main/examples/edge-nextjs) — Next.js App Router route handler with `runtime: 'edge'`
- [`spa-vite-dynamic`](https://github.com/variableland/env/tree/main/examples/spa-vite-dynamic) — SPA, dynamic import pattern
- [`spa-vite-plugin`](https://github.com/variableland/env/tree/main/examples/spa-vite-plugin) — SPA, `#config` alias
- [`ssr-react-router`](https://github.com/variableland/env/tree/main/examples/ssr-react-router) — SSR with React Router 7
- [`ssr-tanstack-start`](https://github.com/variableland/env/tree/main/examples/ssr-tanstack-start) — SSR with TanStack Start

## License

MIT
