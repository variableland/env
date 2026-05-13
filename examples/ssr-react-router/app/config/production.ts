import type { ServerEnvConfig } from "../env/schema.server.ts";

export default {
  server: { PORT: 3002, HOST: "0.0.0.0" },
  public: {
    API_BASE_URL: "https://api.example.com",
    APP_NAME: "rr7-prod-app",
  },
} satisfies ServerEnvConfig;
