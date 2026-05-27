declare module "#config" {
  import type { EnvConfig } from "./schema.ts";

  const config: EnvConfig;
  export default config;
}
