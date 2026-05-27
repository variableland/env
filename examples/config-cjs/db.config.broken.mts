import { defineEnv } from "@vlandoss/env";
import { loadConfig } from "@vlandoss/env/fs";
import { Env } from "./src/env/schema.ts";

// ❌ The pattern that BREAKS in a config file. `loadConfig` is async, so this
// top-level `await` turns the module into an async ES module. Tooling that
// loads the config via `require()` throws `ERR_REQUIRE_ASYNC_MODULE`, and
// bundlers targeting CJS reject the top-level await at build time.
//
// Kept here only to demonstrate the failure — see `db.config.mts` for the
// `selectConfig` fix and `test/loader.test.ts` for the assertion.
const config = await loadConfig(Env);

const env = defineEnv({ schema: Env, config });

export default {
  dialect: "postgresql",
  dbCredentials: { url: env.db.URL },
} as const;
