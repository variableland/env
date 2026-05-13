import { defineEnv } from "@vlandoss/env";
import config from "#config";
import { Env } from "./schema.ts";

export const env = defineEnv({ schema: Env, config });
