import type { Definition, RuntimeEnv, Vars } from "./types.ts";
import { isStandardSchema } from "./validate.ts";

export function toScreamingSnake(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase();
}

function join(prefix: string, key: string): string {
  const k = toScreamingSnake(key);
  return prefix === "" ? k : `${prefix}_${k}`;
}

// biome-ignore lint/suspicious/noExplicitAny: vars is a recursive union
type VarsNode = string | null | Record<string, any> | undefined;

/**
 * Read the branch-prefix sentinel: a non-empty string is the prefix, `null`
 * (or empty string, kept for back-compat) means "flat — no branch prefix".
 * Returns `undefined` when no override was provided.
 */
function readPrefix(value: unknown): string | undefined {
  if (value === null) return "";
  if (typeof value === "string") return value;
  return undefined;
}

export function resolveEnvOverride(
  definition: Definition,
  vars: Vars<Definition> | undefined,
  runtimeEnv: RuntimeEnv,
  prefix = "",
  // biome-ignore lint/suspicious/noExplicitAny: built dynamically
): Record<string, any> {
  // biome-ignore lint/suspicious/noExplicitAny: built dynamically
  const result: Record<string, any> = {};

  for (const [key, def] of Object.entries(definition)) {
    const varsEntry: VarsNode = vars && typeof vars === "object" ? (vars as Record<string, VarsNode>)[key] : undefined;

    if (isStandardSchema(def)) {
      const envName = typeof varsEntry === "string" ? varsEntry : join(prefix, key);

      const value = runtimeEnv[envName];
      if (value !== undefined) {
        result[key] = value;
      }
      continue;
    }

    // Branch — resolve prefix from sentinel (null = flat) or `$` in mixed mode.
    let childPrefix: string;
    let childVars: Vars<Definition> | undefined;

    const shorthandPrefix = readPrefix(varsEntry);
    if (shorthandPrefix !== undefined) {
      childPrefix = shorthandPrefix;
      childVars = undefined;
    } else if (varsEntry && typeof varsEntry === "object") {
      const dollarPrefix = readPrefix((varsEntry as { $?: unknown }).$);
      childPrefix = dollarPrefix ?? join(prefix, key);
      childVars = varsEntry as Vars<Definition>;
    } else {
      childPrefix = join(prefix, key);
      childVars = undefined;
    }

    const childResult = resolveEnvOverride(def, childVars, runtimeEnv, childPrefix);
    if (Object.keys(childResult).length > 0) {
      result[key] = childResult;
    }
  }

  return result;
}
