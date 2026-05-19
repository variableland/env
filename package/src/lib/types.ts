import type { StandardSchemaV1 } from "@standard-schema/spec";

type Primitive = string | number | bigint | boolean | symbol | null | undefined;

type PartialDeep<T> = T extends Primitive
  ? T
  : T extends ReadonlyArray<infer U>
    ? T extends unknown[]
      ? PartialDeep<U>[]
      : ReadonlyArray<PartialDeep<U>>
    : T extends ReadonlyMap<infer K, infer V>
      ? ReadonlyMap<K, PartialDeep<V>>
      : T extends ReadonlySet<infer U>
        ? ReadonlySet<PartialDeep<U>>
        : T extends (...args: never[]) => unknown
          ? T
          : T extends object
            ? { [K in keyof T]?: PartialDeep<T[K]> }
            : T;

export type StandardSchema = StandardSchemaV1;

export namespace StandardSchema {
  export type InferInput<S extends StandardSchemaV1> = StandardSchemaV1.InferInput<S>;
  export type InferOutput<S extends StandardSchemaV1> = StandardSchemaV1.InferOutput<S>;
  export type InferResult<S extends StandardSchemaV1> = StandardSchemaV1.Result<InferOutput<S>>;
}

/**
 * The normalized shape of a `Schema` — every leaf is a Standard Schema, every
 * branch is another `Definition`. Produced by `schema()` after any nested
 * `Schema` is inlined.
 */
export type Definition = {
  [key: string]: StandardSchema | Definition;
};

/**
 * The object returned by `schema()`. Structural — every entry-point of this
 * package re-declares `Schema` (because tsdown bundles each entry's `.d.ts`
 * standalone). Adding a nominal `unique symbol` brand here would make those
 * declarations incompatible at the type level (each bundle owns its own brand
 * symbol). The runtime `isSchema` check covers the structural validation.
 */
export interface Schema<D extends Definition = Definition> {
  readonly shape: D;
}

/**
 * What `schema()` accepts: like `Definition` but a branch may also be another
 * `Schema` — the inner shape is inlined at `schema()` call time.
 */
export type DefinitionInput = {
  [key: string]: StandardSchema | Schema | DefinitionInput;
};

/**
 * Recursively replace any nested `Schema` in `D` with its inner `shape`.
 * Applied by `schema()` so the resulting `Schema<Normalize<D>>` exposes a pure
 * `Definition` regardless of how it was composed.
 */
export type Normalize<D> = D extends StandardSchema
  ? D
  : D extends Schema<infer SD>
    ? SD
    : D extends DefinitionInput
      ? { [K in keyof D]: Normalize<D[K]> }
      : never;

export type InferInput<D> = D extends StandardSchema
  ? StandardSchema.InferInput<D>
  : D extends Schema<infer SD>
    ? InferInput<SD>
    : D extends Definition
      ? { [K in keyof D]: InferInput<D[K]> }
      : never;

export type InferOutput<D> = D extends StandardSchema
  ? StandardSchema.InferOutput<D>
  : D extends Schema<infer SD>
    ? InferOutput<SD>
    : D extends Definition
      ? { [K in keyof D]: InferOutput<D[K]> }
      : never;

export type Config<S extends Schema> = PartialDeep<InferOutput<S["shape"]>>;

export type Defaults<S extends Schema> = PartialDeep<InferOutput<S["shape"]>>;

type AssertUppercase<T> = T extends string ? (T extends "" ? never : Uppercase<T> extends T ? T : never) : T;

/**
 * Branch-level prefix. A non-empty string sets the prefix for every descendant
 * leaf; `null` declares the branch as flat (leaves use their own keys as-is,
 * no branch prefix). The empty string `""` is **not** allowed — use `null`.
 */
export type BranchPrefix = null | string;

export type Vars<D extends Definition> = {
  [K in keyof D]?: D[K] extends StandardSchema
    ? string
    : D[K] extends Definition
      ? BranchPrefix | (Vars<D[K]> & { $?: BranchPrefix })
      : never;
};

export type AssertEnvVarNames<V> = V extends string
  ? AssertUppercase<V>
  : V extends null
    ? null
    : V extends object
      ? { [K in keyof V]: AssertEnvVarNames<V[K]> }
      : V;

export type RuntimeEnv = Record<string, unknown>;

export type Shorthands = {
  $name: string;
  IS_DEV: boolean;
  IS_TEST: boolean;
  IS_PROD: boolean;
};

export type Env<S extends Schema> = InferOutput<S["shape"]> & Shorthands;

export type ModuleNamespace<T> = { default: T; readonly [Symbol.toStringTag]?: "Module" };

export type ConfigInput<S extends Schema> = Config<S> | ModuleNamespace<Config<S>>;

export type DefineEnvSyncOptions<S extends Schema, V extends Vars<S["shape"]> = Vars<S["shape"]>> = {
  schema: S;
  config?: ConfigInput<S>;
  defaults?: Defaults<S>;
  vars?: V & AssertEnvVarNames<V>;
  runtimeEnv?: RuntimeEnv;
};

export type DefineEnvAsyncOptions<S extends Schema, V extends Vars<S["shape"]> = Vars<S["shape"]>> = Omit<
  DefineEnvSyncOptions<S, V>,
  "config"
> & {
  config: Promise<ConfigInput<S>>;
};

export type DefineEnvOptions<S extends Schema, V extends Vars<S["shape"]> = Vars<S["shape"]>> =
  | DefineEnvSyncOptions<S, V>
  | DefineEnvAsyncOptions<S, V>;
