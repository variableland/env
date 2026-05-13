import type { EnvConfig } from "../env/schema.ts";

export default {
  api: { BASE_URL: "https://api.example.com", TIMEOUT_MS: 8000 },
  feature: { ANALYTICS: true },
  build: { LABEL: "spa-dynamic-prod-e44b" },
} satisfies EnvConfig;
