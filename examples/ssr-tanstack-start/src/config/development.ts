import type { ServerEnvConfig } from "../env/schema.server.ts";

export default {
  public: {
    API_BASE_URL: "http://localhost:3001/dev-api",
    APP_NAME: "tss-dev-app",
  },
} satisfies ServerEnvConfig;
