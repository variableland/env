import type { EnvConfig } from "../env/schema.ts";

export default {
  api: { BASE_URL: "http://localhost:3001/dev-api", TIMEOUT_MS: 2000 },
  feature: { ANALYTICS: false },
  build: { LABEL: "spa-dynamic-dev-7c21" },
} satisfies EnvConfig;
