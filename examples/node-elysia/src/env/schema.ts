import { type Config, schema } from "@vlandoss/env";
import * as e from "@vlandoss/env/zod";
import * as z from "zod";

export const Env = schema({
  log: { LEVEL: e.logLevel },
  server: { PORT: e.port, HOST: e.host },
  db: {
    URL: z.url(),
    LOGGING: e.bool.default(false),
  },
});

export type EnvConfig = Config<typeof Env>;
