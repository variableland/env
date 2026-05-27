declare module "#config" {
  import type { ServerEnvConfig } from "./schema.server.ts";

  const config: ServerEnvConfig;
  export default config;
}
