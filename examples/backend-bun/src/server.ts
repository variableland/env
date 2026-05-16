import { Hono } from "hono";
import { env } from "./env/index.ts";

// biome-ignore format: I prefer to keep the code as is for better readability
const app = new Hono()
  .get("/health", (c) => c.json({ ok: true }))
  .get("/env", (c) => c.json({ env }));

const server = Bun.serve({
  port: env.server.PORT,
  hostname: env.server.HOST,
  fetch: app.fetch,
});

console.log(`[${env.$name}] listening on http://${server.hostname}:${server.port}`);
