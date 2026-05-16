import { env } from "../../../src/env/index.ts";

// `runtime: 'edge'` puts this handler on Vercel's edge isolate runtime —
// no Node APIs available, but `process.env` is polyfilled with the
// platform-injected vars, so `defineEnv()`'s default `readEnv()` works.
export const runtime = "edge";

export function GET() {
  return Response.json({ env });
}
