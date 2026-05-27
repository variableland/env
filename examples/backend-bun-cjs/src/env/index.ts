import { defineEnv } from "@vlandoss/env";
import { loadConfig } from "@vlandoss/env/fs";
import { Env } from "./schema.ts";

export const env = defineEnv({
  schema: Env,
  config: loadConfig(Env),
  vars: {
    db: { URL: "DATABASE_URL" },
  },
});
