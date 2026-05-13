import { type Config, schema } from "@vlandoss/env";
import * as e from "@vlandoss/env/zod";
import * as z from "zod";

export const Env = schema({
  api: {
    BASE_URL: z.url(),
    TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  },
  feature: { ANALYTICS: e.bool.default(false) },
  build: { LABEL: z.string().min(1) },
});

export type EnvConfig = Config<typeof Env>;
