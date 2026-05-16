import { useMemo } from "react";
import { ENV_SCRIPT_ID } from "./lib/const.ts";
import type { RuntimeEnv } from "./lib/types.ts";

export type EnvScriptProps<E extends RuntimeEnv = RuntimeEnv> = {
  runtimeEnv: E;
};

export function EnvScript<E extends RuntimeEnv = RuntimeEnv>({ runtimeEnv }: EnvScriptProps<E>) {
  const asString = useMemo(() => JSON.stringify(runtimeEnv), [runtimeEnv]);
  return (
    <script id={ENV_SCRIPT_ID} type="application/json">
      {asString}
    </script>
  );
}
