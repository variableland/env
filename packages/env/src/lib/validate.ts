import type { Definition, Schema, StandardSchema } from "./types.ts";

export function isStandardSchema(value: unknown): value is StandardSchema {
  return (
    typeof value === "object" &&
    value !== null &&
    "~standard" in value &&
    // biome-ignore lint/suspicious/noExplicitAny: structural check
    typeof (value as any)["~standard"].validate === "function"
  );
}

export function isSchema(value: unknown): value is Schema {
  if (typeof value !== "object" || value === null) return false;
  if (!("shape" in value)) return false;
  const shape = (value as { shape: unknown }).shape;
  return typeof shape === "object" && shape !== null && !Array.isArray(shape);
}

export function isDefinition(value: unknown): value is Definition {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((v) => isStandardSchema(v) || isDefinition(v))
  );
}

export function standardValidate<S extends StandardSchema>(schema: S, input: unknown): StandardSchema.InferOutput<S> {
  const result = schema["~standard"].validate(input) as StandardSchema.InferResult<S>;

  if (result.issues) {
    const issues = result.issues.map((issue) => issue.message).join(", ");
    throw new TypeError(issues);
  }

  return result.value;
}

export function validate<D extends Definition>(
  definition: D,
  // biome-ignore lint/suspicious/noExplicitAny: validated at runtime
  input: any,
  parentDotPath = "",
  // biome-ignore lint/suspicious/noExplicitAny: validated at runtime
): any {
  // biome-ignore lint/suspicious/noExplicitAny: validated at runtime
  const output: any = {};

  for (const [key, value] of Object.entries(definition)) {
    const data = input?.[key];
    const dotPath = parentDotPath !== "" ? `${parentDotPath}.${key}` : key;

    if (isStandardSchema(value)) {
      try {
        output[key] = standardValidate(value, data);
      } catch (cause) {
        throw new TypeError(
          // @ts-expect-error cause is unknown but actually a TypeError
          `Invalid value at "${dotPath}": ${cause.message}`,
        );
      }
    } else if (isDefinition(value)) {
      output[key] = validate(value, data, dotPath);
    } else {
      throw new TypeError(`Invalid schema definition at "${dotPath}"`);
    }
  }

  return output;
}
