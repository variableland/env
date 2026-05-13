import * as z from "zod";

/**
 * Single-purpose Zod primitives for common env-var leaves.
 *
 * Each export is one schema — compose them yourself, don't expect bundled
 * branches like `LOG = { LEVEL, ENABLED }`. Branch-level naming is opinionated
 * and locks consumers into specific keys; primitives don't.
 *
 * Only opinionated primitives live here. For things that are pure Zod re-exports
 * (`z.url()`, `z.email()`, `z.string()`, …) just use Zod directly — wrapping
 * them here would only add an indirection.
 *
 * Recommended import style: namespace, so leaves stay short.
 *
 * @example
 * import { schema } from "@vlandoss/env";
 * import * as e from "@vlandoss/env/zod";
 *
 * export const Env = schema({
 *   server: { PORT: e.port, HOST: e.host },
 *   log: { LEVEL: e.logLevel, ENABLED: e.bool },
 *   auth: { SECRET: e.secret },
 * });
 */

/** TCP port: coerced int in `[0, 65535]`. */
export const port = z.coerce.number().int().min(0).max(65535);

/** Hostname / interface to bind: non-empty string. */
export const host = z.string().min(1);

/**
 * Boolean accepting `"true" / "false" / "1" / "0" / "yes" / "no"` strings
 * (via `z.stringbool()`) as well as real booleans.
 */
export const bool = z.stringbool().or(z.boolean());

/** Pino / Bunyan log levels. */
export const logLevel = z.enum(["fatal", "error", "warn", "info", "debug", "trace"]);

/** Long-enough secret for signing / session use. Minimum 16 chars. */
export const secret = z.string().min(16);
