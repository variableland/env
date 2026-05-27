import type { EnvConfig } from "../src/env/schema.ts";

export default {
  server: { PORT: 3001, HOST: "0.0.0.0" },
  db: { LOGGING: false },
} satisfies EnvConfig;
