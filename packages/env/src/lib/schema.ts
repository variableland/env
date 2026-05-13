import type { Definition, DefinitionInput, Normalize, Schema } from "./types.ts";
import { isSchema, isStandardSchema } from "./validate.ts";

function normalize(input: DefinitionInput, dotPath = ""): Definition {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError(`Invalid schema input at "${dotPath || "<root>"}": expected an object`);
  }

  const out: Definition = {};
  for (const [key, value] of Object.entries(input)) {
    const here = dotPath ? `${dotPath}.${key}` : key;
    if (isStandardSchema(value)) {
      out[key] = value;
    } else if (isSchema(value)) {
      out[key] = value.shape;
    } else if (value !== null && typeof value === "object") {
      out[key] = normalize(value as DefinitionInput, here);
    } else {
      throw new TypeError(`Invalid schema input at "${here}": every leaf must be a Standard Schema`);
    }
  }
  return out;
}

export function schema<const D extends DefinitionInput>(input: D): Schema<Normalize<D>> {
  return { shape: normalize(input) } as unknown as Schema<Normalize<D>>;
}
