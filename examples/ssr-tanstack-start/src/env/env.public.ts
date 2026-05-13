import { defineEnv } from "@vlandoss/env";
import { PublicEnv } from "./schema.public.ts";

export const env = defineEnv({ schema: PublicEnv });
