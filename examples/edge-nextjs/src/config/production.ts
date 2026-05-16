import type { EnvConfig } from "../env/schema.ts";

export default {
  log: { LEVEL: "info" },
  db: { LOGGING: false },
} satisfies EnvConfig;
