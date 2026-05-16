import { defineEnv } from "@vlandoss/env";
import { loadConfig } from "@vlandoss/env/fs";
import { Env } from "./schema.ts";

const config = await loadConfig(Env);

export const env = defineEnv({
  schema: Env,
  config,
  vars: {
    db: { URL: "DATABASE_URL" },
  },
});
