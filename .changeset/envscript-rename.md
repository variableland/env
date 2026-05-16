---
"@vlandoss/env": minor
---

**BREAKING** Rename `<ClientEnv />` (in `@vlandoss/env/react`) to `<EnvScript />`. The new name stops suggesting client-side use and reflects what the component actually does: emit a `<script>` tag with the server-resolved env so the browser can read it during SSR or SSG hydration. The entrypoint path (`@vlandoss/env/react`) is unchanged. The wire format is also unchanged: the DOM `id="env"` and `window.__env` global stay identical, so HTML served by an older build continues to hydrate correctly.

Renames included:

- Component: `ClientEnv` → `EnvScript`
- Props: `ClientEnvProps` → `EnvScriptProps`
- Constants: `CLIENT_ENV_SCRIPT_ID` → `ENV_SCRIPT_ID`, `CLIENT_ENV_GLOBAL_ID` → `ENV_GLOBAL_ID`

Migration: replace `<ClientEnv …>` with `<EnvScript …>`. If you imported the constants from the core entrypoint, update those imports too.
