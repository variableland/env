import { env } from "./src/env/index.ts";

// Stand-in for an ORM / database tooling config: a file that tooling loads via
// `require()` or bundles to CJS. Because `env` is built with `selectConfig`
// (synchronous), importing it here adds no top-level `await`, so this module
// loads cleanly in a CJS / no-TLA context.
//
// Shape the default export however your tool expects — this mirrors a typical
// database migration config.
export default {
  dialect: "postgresql",
  dbCredentials: { url: env.db.URL },
  verbose: env.db.LOGGING,
} as const;
