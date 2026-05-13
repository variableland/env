import type { EnvConfig } from "../env/schema.ts";

export default {
  api: { BASE_URL: "http://localhost:3001/dev-api", TIMEOUT_MS: 2000 },
  feature: { ANALYTICS: false },
  build: { LABEL: "dev-build-marker-9f3a" },
} satisfies EnvConfig;
