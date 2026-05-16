import type { EnvConfig } from "../env/schema.ts";

export default {
  log: { LEVEL: "debug" },
  db: { URL: "postgres://localhost/dev", LOGGING: true },
} satisfies EnvConfig;
