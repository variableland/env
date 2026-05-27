import { defineEnv, selectConfig } from "@vlandoss/env";
import development from "../../config/development.ts";
import production from "../../config/production.ts";
import { Env } from "./schema.ts";

// Synchronous config selection — no `loadConfig`, no top-level `await`. This is
// what lets `db.config.mts` be loaded by tooling that pulls the config in via
// `require()` or bundles it to CJS, where a top-level await would throw
// `ERR_REQUIRE_ASYNC_MODULE` / fail the bundle.
//
// The configs are static `import`s, so the runtime/bundler resolves and
// transpiles each one at parse time; `selectConfig` just picks the one matching
// the current `envName()`.
export const env = defineEnv({
  schema: Env,
  config: selectConfig({ development, production }),
  vars: {
    db: { URL: "DATABASE_URL" },
  },
});
