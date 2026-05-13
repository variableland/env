import type { ServerEnvConfig } from "../env/schema.server.ts";

export default {
  public: {
    API_BASE_URL: "https://api.example.com",
    APP_NAME: "tss-prod-app",
  },
} satisfies ServerEnvConfig;
