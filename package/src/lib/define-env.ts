import { defu } from "defu";
import { envName, readEnv } from "./runtime.ts";
import type { DefineEnvAsyncOptions, DefineEnvSyncOptions, Env, RuntimeEnv, Schema, Shorthands, Vars } from "./types.ts";
import { validate } from "./validate.ts";
import { resolveEnvOverride } from "./vars.ts";

function shorthands(name: string): Shorthands {
  return {
    $name: name,
    IS_DEV: name === "development",
    IS_TEST: name === "test",
    IS_PROD: name === "production",
  };
}

function isModuleNamespace(value: unknown): value is { default: unknown } {
  if (value === null || typeof value !== "object") return false;
  if (!("default" in value)) return false;
  // biome-ignore lint/suspicious/noExplicitAny: structural marker check
  const v = value as any;
  return v[Symbol.toStringTag] === "Module" || v.__esModule === true;
}

function unwrapModule(value: unknown): unknown {
  return isModuleNamespace(value) ? value.default : value;
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    "then" in value &&
    // biome-ignore lint/suspicious/noExplicitAny: structural check
    typeof (value as any).then === "function"
  );
}

function finalize<S extends Schema>(
  schema: S,
  vars: Vars<S["shape"]> | undefined,
  // biome-ignore lint/suspicious/noExplicitAny: validated downstream
  config: any,
  // biome-ignore lint/suspicious/noExplicitAny: validated downstream
  defaults: any,
  runtimeEnv: RuntimeEnv,
): Env<S> {
  const envOverride = resolveEnvOverride(schema.shape, vars, runtimeEnv);
  // `defu(target, ...defaults)` — first arg wins, later args fill in. This
  // preserves the precedence env > config > defaults that lodash.merge gave
  // us via `merge({}, defaults, config, envOverride)`. defu also deep-merges
  // reliably across V8 isolates (Workers, Edge), where lodash's
  // `isPlainObject` check collapses to a shallow merge.
  const merged = defu(envOverride, config, defaults);
  const parsed = validate(schema.shape, merged);
  return { ...shorthands(envName(runtimeEnv)), ...parsed } as Env<S>;
}

export function defineEnv<S extends Schema, V extends Vars<S["shape"]>>(options: DefineEnvSyncOptions<S, V>): Env<S>;
export function defineEnv<S extends Schema, V extends Vars<S["shape"]>>(options: DefineEnvAsyncOptions<S, V>): Promise<Env<S>>;
export function defineEnv<S extends Schema, V extends Vars<S["shape"]>>(
  options: DefineEnvSyncOptions<S, V> | DefineEnvAsyncOptions<S, V>,
): Env<S> | Promise<Env<S>> {
  const { schema, defaults = {}, vars, runtimeEnv = readEnv() } = options;
  const raw = options.config;

  if (isPromiseLike(raw)) {
    return Promise.resolve(raw).then((resolved) => finalize(schema, vars, unwrapModule(resolved) ?? {}, defaults, runtimeEnv));
  }

  return finalize(schema, vars, unwrapModule(raw) ?? {}, defaults, runtimeEnv);
}
