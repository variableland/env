# @vlandoss/env

🌱 Contract-first environment configuration. Define your env schema once with [Standard Schema](https://github.com/standard-schema/standard-schema) (Zod, Valibot, ArkType…), get a fully typed `env` object that merges per-environment config with `process.env`.

Runtime-agnostic core — Node, Bun, Deno, browser, Workers, Edge. Opt-in adapters for Node, Vite, React (SSR), and Zod primitives.

## Installation

```sh
pnpm add @vlandoss/env zod
```

## Documentation

📚 **[env.oss.variable.land](https://env.oss.variable.land)**

- [Getting started](https://env.oss.variable.land/getting-started/installation)
- [Concepts](https://env.oss.variable.land/concepts/overview) — mental model, resolution order, env-var naming
- [Guides](https://env.oss.variable.land/guides) — recipes for Node, SPA, SSR
- [API reference](https://env.oss.variable.land/api-reference)

## Examples

Runnable apps under [`examples/`](https://github.com/variableland/env/tree/main/examples):

- [`node-elysia`](https://github.com/variableland/env/tree/main/examples/node-elysia) — Node server with `loadConfig`
- [`spa-vite-dynamic`](https://github.com/variableland/env/tree/main/examples/spa-vite-dynamic) — SPA, dynamic import pattern
- [`spa-vite-plugin`](https://github.com/variableland/env/tree/main/examples/spa-vite-plugin) — SPA, `#config` alias
- [`ssr-react-router`](https://github.com/variableland/env/tree/main/examples/ssr-react-router) — SSR with React Router 7
- [`ssr-tanstack-start`](https://github.com/variableland/env/tree/main/examples/ssr-tanstack-start) — SSR with TanStack Start

## License

MIT
