# env

🌱 Contract-first environment configuration with typed schemas and per-runtime entrypoints.

> Monorepo home for [`@vlandoss/env`](./package) and its examples.

```bash
pnpm add @vlandoss/env
```

## Development

Tooling expected:

- [Node.js](https://nodejs.org) >= 24.0.0
- [pnpm](https://pnpm.io) >= 10.0.0
- [mise](https://mise.jdx.dev) >= 2025.3.3 <sup>(optional)</sup>

### Setup

```bash
git clone git@github.com:variableland/env.git
cd env
pnpm install
pnpm test
```

### Commands

This monorepo uses [Turborepo](https://turbo.build/repo/docs):

- `pnpm test` — run unit tests
- `pnpm test:e2e` — run end-to-end tests (Playwright)
- `pnpm test:types` — js & ts checks

It also uses [run-run](https://github.com/variableland/dx/blob/main/packages/run-run/README.md) 🦊:

- `pnpm rr` — run the `run-run` CLI

With [mise](https://mise.jdx.dev) installed, `rr` is available directly.

### Release

Releases are managed by [Changesets](https://github.com/changesets/changesets). The [Changesets bot](https://github.com/changesets/bot) is installed in the repository.

**Preview release**: PRs branched as `feat/*` or `fix/*` trigger a preview publish to npm under the `pr-<PR_NUMBER>` dist-tag:

```bash
pnpm install @vlandoss/env@pr-123
```
