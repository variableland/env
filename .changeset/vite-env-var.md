---
"@vlandoss/env": minor
---

The `envConfig()` Vite plugin can now select the env from a `VITE_ENV` env var instead of requiring `--mode`.

The plugin reads `VITE_ENV` from `process.env` **and** your `.env*` files (via Vite's `loadEnv`, so inline/shell values win over file values) and uses it to pick the per-env `#config` file and the `__ENV_NAME__` build constant. When `VITE_ENV` is unset or empty it falls back to Vite's `mode`, so `vite build --mode staging` keeps working unchanged — this is purely additive.

```bash
# These are now equivalent:
VITE_ENV=staging vite build
vite build --mode staging
```

The var name is configurable with the new `envVar` option (default `"VITE_ENV"`):

```ts
envConfig({ envVar: "APP_ENV" });
```
