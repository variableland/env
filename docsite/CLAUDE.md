# docsite — agent notes

Workspace-specific guidance. The general project layout and run commands live in [README.md](./README.md).

## SEO audit (Unlighthouse)

`unlighthouse` and `start-server-and-test` are **not** in `package.json` — they would add ~80 MB and ~5.4k lock lines to every dev install just for the audit. Instead they are pulled on-demand via `pnpm dlx` with pinned versions inside the scripts:

- `check:seo` — interactive UI for local debugging
- `check:seo-ci` — headless build + audit + budget assertions (used by CI)

The pinned versions live in two places that **must be kept in sync**:

1. The `pnpm dlx` invocations in `package.json` scripts (`unlighthouse@X.Y.Z`, `start-server-and-test@X.Y.Z`).
2. The cache key in [`.github/workflows/docsite.yml`](../.github/workflows/docsite.yml) — `pnpm-dlx-...-unlighthouse-X.Y.Z-sst-X.Y.Z`.

When bumping either dlx version, update the workflow cache key too — otherwise CI keeps restoring the old `~/.cache/pnpm/dlx` and the new bin is re-downloaded every run, defeating the cache.

Budgets per category live in [`unlighthouse.config.ts`](./unlighthouse.config.ts). SEO is pinned at 100 — any regression in `meta-description`, `document-title`, `is-crawlable`, etc. fails the PR.
