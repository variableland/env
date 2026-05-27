import type { EnvConfig } from "../src/env/schema.ts";

export default {
  server: { PORT: 3001, HOST: "127.0.0.1" },
  db: { URL: "postgres://localhost/dev", LOGGING: true },
} satisfies EnvConfig;
