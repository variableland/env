import { useMemo } from "react";
import { CLIENT_ENV_SCRIPT_ID } from "./lib/const.ts";
import type { RuntimeEnv } from "./lib/types.ts";

export type ClientEnvProps<E extends RuntimeEnv = RuntimeEnv> = {
  runtimeEnv: E;
};

export function ClientEnv<E extends RuntimeEnv = RuntimeEnv>({ runtimeEnv }: ClientEnvProps<E>) {
  const asString = useMemo(() => JSON.stringify(runtimeEnv), [runtimeEnv]);
  return (
    <script id={CLIENT_ENV_SCRIPT_ID} type="application/json">
      {asString}
    </script>
  );
}
