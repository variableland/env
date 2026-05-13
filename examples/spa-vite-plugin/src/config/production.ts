import type { EnvConfig } from "../env/schema.ts";

export default {
  api: { BASE_URL: "https://api.example.com", TIMEOUT_MS: 8000 },
  feature: { ANALYTICS: true },
  build: { LABEL: "prod-build-marker-b71c" },
} satisfies EnvConfig;
