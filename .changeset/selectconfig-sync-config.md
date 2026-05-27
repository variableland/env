---
"@vlandoss/env": minor
---

Add `selectConfig(configs)` — a synchronous, runtime-agnostic counterpart to `loadConfig` for config files that can't use top-level `await`.

Some tooling loads its config file via `require()` or by bundling it to CJS, where `await loadConfig(...)` is rejected (`ERR_REQUIRE_ASYNC_MODULE` / "top-level await is not supported with the cjs output format"). `selectConfig` pairs with static `import`s and picks the entry matching `envName()` — no dynamic `import()`, no `await`:

```ts
import { defineEnv, selectConfig } from "@vlandoss/env";
import development from "./config/development.ts";
import production from "./config/production.ts";

export const env = defineEnv({
  schema: Env,
  config: selectConfig({ development, production }),
});
```

It throws when the current env has no entry. See the new `config-cjs` example and the `loadConfig` guide for details.
