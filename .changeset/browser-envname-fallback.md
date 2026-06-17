---
"@vlandoss/env": patch
---

Clarify that the `envConfig()` Vite plugin is required for **any** non-development browser build, not just custom modes.

In the browser, `envName()`'s `readEnv()` only reads `window.__env` — never `process.env` — so a pure SPA can't see `NODE_ENV` / `VITE_ENV`. Without the plugin's `__ENV_NAME__` inject, `envName()` falls back to `"development"` (silently shipping the dev config to every environment), regardless of the `--mode` or `VITE_ENV` used at build time. The docs and the `__ENV_NAME__` JSDoc previously stated the browser would fall back to `"production"`, which is only true on the server.
