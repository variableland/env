import { type Config, schema } from "@vlandoss/env";
import * as e from "@vlandoss/env/zod";
import * as z from "zod";
import { PublicEnv } from "./schema.public.ts";

export const ServerEnv = schema({
  server: { PORT: e.port, HOST: e.host },
  secrets: {
    DATABASE_URL: z.string().min(1),
    SESSION_SECRET: e.secret,
  },
  public: PublicEnv,
});

export type ServerEnvConfig = Config<typeof ServerEnv>;
