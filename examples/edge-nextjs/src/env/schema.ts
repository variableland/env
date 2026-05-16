import { type Config, schema } from "@vlandoss/env";
import * as e from "@vlandoss/env/zod";
import * as z from "zod";

// Edge runtime handles networking — no `server.PORT/HOST` needed here. Same
// shape otherwise as the worker example.
export const Env = schema({
  log: { LEVEL: e.logLevel },
  db: {
    URL: z.url(),
    LOGGING: e.bool.default(false),
  },
});

export type EnvConfig = Config<typeof Env>;
