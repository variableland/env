import { ENV_GLOBAL_ID, ENV_SCRIPT_ID } from "./const.ts";
import type { RuntimeEnv } from "./types.ts";

declare const __ENV_NAME__: string | undefined;

// Module-scoped ambient declarations for the browser-only branch below.
// Declaring them here (instead of relying on `lib: ["dom"]`) lets consumers
// without DOM lib (e.g. Node servers that workspace-link this source) read
// `runtime.ts` cleanly. The declarations don't escape this module.
declare const window: { [key: string]: unknown } | undefined;
declare class HTMLScriptElement {
  readonly textContent: string | null;
}

// Cast `globalThis` so we can probe `process` without a declared global. On
// Workers (no `nodejs_compat`) the bare identifier `process` would throw a
// ReferenceError; property access on `globalThis` returns `undefined` instead.
const globals = globalThis as { process?: { env?: Record<string, unknown> } };

function buildTimeEnvName(): string | undefined {
  // The Vite plugin's `define` replaces this identifier with a literal at build time.
  // Outside that build path, `__ENV_NAME__` isn't declared globally — `typeof` is
  // safe (returns "undefined") and never throws.
  return typeof __ENV_NAME__ !== "undefined" ? __ENV_NAME__ : undefined;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

export function readEnv(): RuntimeEnv {
  const isServer = typeof window === "undefined";

  if (isServer) {
    // `process` is not defined on Cloudflare Workers (without the `nodejs_compat`
    // flag) and some other isolate-based runtimes. Fall back to `{}` so callers
    // can supply a `runtimeEnv` explicitly via `defineEnv({ runtimeEnv })`.
    if (globals.process?.env) {
      return globals.process.env;
    }
    return {};
  }

  const win = window as { [key: string]: unknown };
  const globalEnv = win[ENV_GLOBAL_ID];

  if (isPlainObject(globalEnv)) {
    return globalEnv;
  }

  const fromScript = win[ENV_SCRIPT_ID];

  if (isPlainObject(fromScript)) {
    return fromScript;
  }

  if (typeof HTMLScriptElement !== "undefined" && fromScript instanceof HTMLScriptElement) {
    const raw = fromScript.textContent;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!isPlainObject(parsed)) {
        throw new TypeError("Invalid `env` content, it must be a plain object");
      }
      win[ENV_GLOBAL_ID] = parsed;
      return parsed;
    }
  }

  return {};
}

export function envName(env: RuntimeEnv = readEnv()): string {
  return [env.ENV, buildTimeEnvName(), env.NODE_ENV, env.VITE_ENV, "development"].find(
    (value) => typeof value === "string",
  ) as string;
}
